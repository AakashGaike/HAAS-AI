import React, { useState, useEffect } from 'react';
import { MOCK_HONEYPOTS } from '../constants'; // Keep as fallback if DB empty
import { Power, Trash2, RefreshCw, Terminal, Plus, X } from 'lucide-react';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Honeypot, HoneypotStatus, HoneypotType } from '../types';

export const Honeypots: React.FC = () => {
  const [honeypots, setHoneypots] = useState<Honeypot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployConfig, setDeployConfig] = useState({ name: '', type: HoneypotType.SSH, region: 'us-east-1' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real-time subscription to honeypots
  useEffect(() => {
    if (isDemoMode()) {
        setHoneypots(MOCK_HONEYPOTS);
        setLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(collection(db, "honeypots"), 
      (snapshot) => {
        const pots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Honeypot));
        setHoneypots(pots.length > 0 ? pots : MOCK_HONEYPOTS);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch honeypots:", error);
        setHoneypots(MOCK_HONEYPOTS); // Fallback
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Deploy Action
  const handleDeploy = async () => {
    try {
      setActionLoading('deploy');
      
      if (isDemoMode()) {
        // Simulating backend call in demo mode
        const newPot: Honeypot = {
            id: `hp-${Date.now()}`,
            name: deployConfig.name || `New-${deployConfig.type}-Node`,
            type: deployConfig.type,
            region: deployConfig.region,
            status: HoneypotStatus.DEPLOYING,
            uptime: '0s',
            attacks24h: 0
        };
        setHoneypots(prev => [...prev, newPot]);
        setTimeout(() => {
            setHoneypots(prev => prev.map(p => p.id === newPot.id ? { ...p, status: HoneypotStatus.ACTIVE } : p));
        }, 3000);
      } else {
        // Actual backend call via API or direct Firestore write for prototype
        // In real app, call: await fetch('/api/deploy', ...)
        // For direct firestore prototype:
        await addDoc(collection(db, "honeypots"), {
            name: deployConfig.name || `New-${deployConfig.type}-Node`,
            type: deployConfig.type,
            region: deployConfig.region,
            status: HoneypotStatus.DEPLOYING,
            uptime: '0s',
            attacks24h: 0,
            createdAt: serverTimestamp()
        });
      }
      
      setDeployModalOpen(false);
      setDeployConfig({ name: '', type: HoneypotType.SSH, region: 'us-east-1' });
    } catch (err) {
      console.error("Deploy failed:", err);
      alert("Deployment failed. Check console.");
    } finally {
      setActionLoading(null);
    }
  };

  // Stop/Restart Action
  const handleStatusChange = async (id: string, newStatus: HoneypotStatus) => {
    try {
        setActionLoading(id);
        if (isDemoMode()) {
            setHoneypots(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            await new Promise(r => setTimeout(r, 800));
        } else {
            const potRef = doc(db, "honeypots", id);
            await updateDoc(potRef, { status: newStatus });
        }
    } catch (err) {
        console.error("Action failed:", err);
    } finally {
        setActionLoading(null);
    }
  };

  // Delete Action
  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure you want to decommission this honeypot?")) return;
      
      try {
          setActionLoading(id);
          if (isDemoMode()) {
              setHoneypots(prev => prev.filter(p => p.id !== id));
          } else {
              await deleteDoc(doc(db, "honeypots", id));
          }
      } catch (err) {
          console.error("Delete failed:", err);
      } finally {
          setActionLoading(null);
      }
  };

  if (loading) return <div className="text-cyber-400 p-8">Loading Fleet Data...</div>;

  return (
    <div className="space-y-6 relative">
       {/* Header & Actions */}
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Honeypot Management</h2>
          <p className="text-slate-400 mt-1">Deploy and monitor deception nodes</p>
        </div>
        <button 
            onClick={() => setDeployModalOpen(true)}
            className="bg-cyber-500 hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
        >
            <Terminal size={18} />
            Deploy New Node
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
        {honeypots.map((pot) => (
          <div key={pot.id} className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-cyber-600 transition-all">
            
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-3 h-24 rounded-full transition-colors duration-500 ${
                pot.status === 'ACTIVE' ? 'bg-cyber-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                pot.status === 'COMPROMISED' ? 'bg-cyber-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                pot.status === 'DEPLOYING' ? 'bg-yellow-500 animate-pulse' : 'bg-cyber-700'
              }`}></div>
              
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{pot.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    pot.status === 'ACTIVE' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' :
                    pot.status === 'COMPROMISED' ? 'bg-red-900/30 border-red-800 text-red-400 animate-pulse' :
                    pot.status === 'DEPLOYING' ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    {pot.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm text-cyber-600">
                  <span className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-cyber-600"></span>
                     {pot.type}
                  </span>
                  <span className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-cyber-600"></span>
                     {pot.region}
                  </span>
                  <span className="flex items-center gap-2 text-cyber-300 font-mono">
                     UPTIME: {pot.uptime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-right hidden md:block">
                  <div className="text-2xl font-bold text-white">{pot.attacks24h}</div>
                  <div className="text-xs text-cyber-600 uppercase tracking-wider">Attacks (24h)</div>
               </div>

               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStatusChange(pot.id, HoneypotStatus.ACTIVE)}
                    disabled={actionLoading === pot.id}
                    title="Restart" 
                    className="p-2 text-cyber-600 hover:text-white hover:bg-cyber-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                     <RefreshCw size={18} className={actionLoading === pot.id ? "animate-spin" : ""} />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(pot.id, HoneypotStatus.OFFLINE)}
                    disabled={actionLoading === pot.id}
                    title="Stop" 
                    className="p-2 text-cyber-600 hover:text-cyber-200 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                     <Power size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pot.id)}
                    disabled={actionLoading === pot.id}
                    title="Delete" 
                    className="p-2 text-cyber-600 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>
          </div>
        ))}
        {honeypots.length === 0 && (
            <div className="text-center py-20 bg-cyber-800/50 rounded-xl border border-dashed border-cyber-700">
                <p className="text-cyber-600">No active honeypots. Deploy one to start capturing threats.</p>
            </div>
        )}
      </div>

      {/* Deploy Modal */}
      {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-cyber-800 w-full max-w-md border border-cyber-600 rounded-xl shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Deploy Honeypot</h3>
                      <button onClick={() => setDeployModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Hostname</label>
                          <input 
                            type="text" 
                            className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white focus:border-cyber-400 outline-none"
                            placeholder="e.g. auth-service-prod"
                            value={deployConfig.name}
                            onChange={(e) => setDeployConfig({...deployConfig, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                          <select 
                            className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white focus:border-cyber-400 outline-none"
                            value={deployConfig.type}
                            onChange={(e) => setDeployConfig({...deployConfig, type: e.target.value as HoneypotType})}
                          >
                              {Object.values(HoneypotType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Region</label>
                          <select 
                            className="w-full bg-cyber-900 border border-cyber-700 rounded-lg p-2.5 text-white focus:border-cyber-400 outline-none"
                            value={deployConfig.region}
                            onChange={(e) => setDeployConfig({...deployConfig, region: e.target.value})}
                          >
                              <option value="us-east-1">US East (N. Virginia)</option>
                              <option value="eu-west-2">EU West (London)</option>
                              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                          </select>
                      </div>

                      <button 
                        onClick={handleDeploy}
                        disabled={actionLoading === 'deploy'}
                        className="w-full mt-4 bg-cyber-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                      >
                          {actionLoading === 'deploy' ? (
                             <>Deploying <RefreshCw className="animate-spin" size={18} /></>
                          ) : (
                             <>Initialize Deployment <Terminal size={18} /></>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};