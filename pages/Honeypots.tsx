import React, { useState, useEffect } from 'react';
import { MOCK_HONEYPOTS, MOCK_DECEPTION_PROFILES } from '../constants'; 
import { Power, Trash2, RefreshCw, Terminal, Plus, X, Server, Shield, Globe, Fingerprint } from 'lucide-react';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Honeypot, HoneypotStatus, HoneypotType } from '../types';

export const Honeypots: React.FC = () => {
  const [honeypots, setHoneypots] = useState<Honeypot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  
  // Deployment Config State with Ports & Profile
  const [deployConfig, setDeployConfig] = useState({ 
      name: '', 
      type: HoneypotType.SSH, 
      region: 'us-east-1',
      port: 2222,
      profileId: MOCK_DECEPTION_PROFILES[0].id
  });
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
      let defaultPort = 2222;
      switch(deployConfig.type) {
          case HoneypotType.HTTP: defaultPort = 8080; break;
          case HoneypotType.DATABASE: defaultPort = 5432; break;
          case HoneypotType.RDP: defaultPort = 3389; break;
          case HoneypotType.REDIS: defaultPort = 6379; break;
          case HoneypotType.ELASTIC: defaultPort = 9200; break;
      }
      setDeployConfig(prev => ({ ...prev, port: defaultPort }));
  }, [deployConfig.type]);

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
        setHoneypots(MOCK_HONEYPOTS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeploy = async () => {
    try {
      setActionLoading('deploy');
      
      const newPotData = {
          name: deployConfig.name || `Wolf-${deployConfig.type}-${Math.floor(Math.random()*1000)}`,
          type: deployConfig.type,
          region: deployConfig.region,
          port: deployConfig.port,
          profileId: deployConfig.profileId,
          status: HoneypotStatus.DEPLOYING,
          uptime: '0s',
          attacks24h: 0,
          createdAt: serverTimestamp()
      };

      if (isDemoMode()) {
        const newPot: Honeypot = {
            id: `hp-${Date.now()}`,
            ...newPotData,
            status: HoneypotStatus.DEPLOYING,
            uptime: '0s',
            attacks24h: 0
        } as Honeypot;

        setHoneypots(prev => [...prev, newPot]);
        setTimeout(() => {
            setHoneypots(prev => prev.map(p => p.id === newPot.id ? { ...p, status: HoneypotStatus.ACTIVE } : p));
        }, 2000);
      } else {
        await addDoc(collection(db, "honeypots"), newPotData);
      }
      
      setDeployModalOpen(false);
      setDeployConfig({ name: '', type: HoneypotType.SSH, region: 'us-east-1', port: 2222, profileId: MOCK_DECEPTION_PROFILES[0].id });
    } catch (err) {
      console.error("Deploy failed:", err);
      alert("Deployment failed. Check console.");
    } finally {
      setActionLoading(null);
    }
  };

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

  if (loading) return <div className="text-wolf-400 p-8 font-mono animate-pulse">INITIALIZING FLEET DATA...</div>;

  return (
    <div className="space-y-6 relative">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Honeypot Fleet</h2>
          <p className="text-wolf-400 mt-1 text-sm font-mono">Managed Deception Nodes: <span className="text-white">{honeypots.length}</span></p>
        </div>
        <button 
            onClick={() => setDeployModalOpen(true)}
            className="bg-red-gradient hover:shadow-neon transition-all duration-300 text-white font-bold py-3 px-6 rounded flex items-center gap-2 border border-wolf-red uppercase tracking-wider text-sm clip-hex"
        >
            <Plus size={16} />
            Deploy Node
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {honeypots.map((pot) => (
          <div key={pot.id} className="bg-wolf-800 border border-wolf-700 rounded p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-wolf-red/40 transition-all group relative overflow-hidden">
            
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                pot.status === 'ACTIVE' ? 'bg-wolf-red shadow-[0_0_10px_#FF1E1E]' : 
                pot.status === 'COMPROMISED' ? 'bg-purple-500 animate-pulse' : 
                'bg-wolf-600'
            }`}></div>

            <div className="flex items-center gap-6 flex-1">
              <div className="p-4 bg-wolf-900 rounded border border-wolf-700 text-wolf-red">
                 <Server size={24} />
              </div>
              
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white tracking-wide">{pot.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                    pot.status === 'ACTIVE' ? 'bg-wolf-red/10 border-wolf-red text-wolf-red' :
                    pot.status === 'COMPROMISED' ? 'bg-purple-900/30 border-purple-500 text-purple-400 animate-pulse' :
                    pot.status === 'DEPLOYING' ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400' :
                    'bg-wolf-700 border-wolf-600 text-wolf-400'
                  }`}>
                    {pot.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-wolf-400 font-mono">
                  <span className="flex items-center gap-2">
                     <Shield size={12} />
                     {pot.type}
                  </span>
                  <span className="flex items-center gap-2">
                     <Terminal size={12} />
                     PORT: {pot.port}
                  </span>
                  <span className="flex items-center gap-2 text-wolf-300">
                     <Fingerprint size={12} />
                     {pot.profileId ? 'ADAPTIVE' : 'STATIC'}
                  </span>
                  <span className="text-wolf-300">
                     UPTIME: {pot.uptime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-right hidden md:block">
                  <div className="text-xl font-bold text-white font-mono">{pot.attacks24h}</div>
                  <div className="text-[10px] text-wolf-500 uppercase tracking-wider">Events (24h)</div>
               </div>

               <div className="flex items-center gap-2">
                  <button onClick={() => handleStatusChange(pot.id, HoneypotStatus.ACTIVE)} disabled={actionLoading === pot.id} className="p-2 text-wolf-500 hover:text-white hover:bg-wolf-700 rounded transition-colors"><RefreshCw size={18} className={actionLoading === pot.id ? "animate-spin" : ""} /></button>
                  <button onClick={() => handleStatusChange(pot.id, HoneypotStatus.OFFLINE)} disabled={actionLoading === pot.id} className="p-2 text-wolf-500 hover:text-wolf-red hover:bg-wolf-red/10 rounded transition-colors"><Power size={18} /></button>
                  <button onClick={() => handleDelete(pot.id)} disabled={actionLoading === pot.id} className="p-2 text-wolf-500 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={18} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-wolf-900 w-full max-w-lg border border-wolf-red/30 rounded-lg shadow-neon p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wolf-red to-transparent"></div>
                  
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-widest">Deploy Node</h3>
                      <button onClick={() => setDeployModalOpen(false)} className="text-wolf-500 hover:text-white"><X size={24}/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-wolf-400 mb-2 uppercase tracking-wider">Node Hostname</label>
                          <input 
                            type="text" 
                            className="w-full bg-wolf-950 border border-wolf-700 rounded p-3 text-white focus:border-wolf-red outline-none font-mono text-sm"
                            value={deployConfig.name}
                            onChange={(e) => setDeployConfig({...deployConfig, name: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-wolf-400 mb-2 uppercase tracking-wider">Service Type</label>
                            <select 
                                className="w-full bg-wolf-950 border border-wolf-700 rounded p-3 text-white focus:border-wolf-red outline-none font-mono text-sm"
                                value={deployConfig.type}
                                onChange={(e) => setDeployConfig({...deployConfig, type: e.target.value as HoneypotType})}
                            >
                                {Object.values(HoneypotType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-wolf-400 mb-2 uppercase tracking-wider">Exposure Port</label>
                            <input 
                                type="number"
                                className="w-full bg-wolf-950 border border-wolf-700 rounded p-3 text-white focus:border-wolf-red outline-none font-mono text-sm"
                                value={deployConfig.port}
                                onChange={(e) => setDeployConfig({...deployConfig, port: parseInt(e.target.value)})}
                            />
                        </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-wolf-400 mb-2 uppercase tracking-wider">Adaptive Profile</label>
                          <select 
                            className="w-full bg-wolf-950 border border-wolf-700 rounded p-3 text-white focus:border-wolf-red outline-none font-mono text-sm"
                            value={deployConfig.profileId}
                            onChange={(e) => setDeployConfig({...deployConfig, profileId: e.target.value})}
                          >
                              {MOCK_DECEPTION_PROFILES.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({p.osFamily})</option>
                              ))}
                          </select>
                      </div>

                      <div className="pt-4">
                        <button 
                            onClick={handleDeploy}
                            disabled={actionLoading === 'deploy'}
                            className="w-full bg-red-gradient hover:shadow-neon-hover text-white font-bold py-4 rounded transition-all flex justify-center items-center gap-3 uppercase tracking-widest text-sm clip-hex"
                        >
                            {actionLoading === 'deploy' ? (
                                <>Initializing <RefreshCw className="animate-spin" size={18} /></>
                            ) : (
                                <>Execute Deployment <Terminal size={18} /></>
                            )}
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};