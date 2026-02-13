import React, { useState } from 'react';
import { Fingerprint, Terminal, Network, FileText, Check, Plus, Server, Code } from 'lucide-react';
import { MOCK_DECEPTION_PROFILES } from '../constants';

export const Deception: React.FC = () => {
  const [profiles, setProfiles] = useState(MOCK_DECEPTION_PROFILES);
  const [activeTab, setActiveTab] = useState<'profiles' | 'editor'>('profiles');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Deception Engine</h2>
          <p className="text-wolf-400 mt-1 font-mono text-sm">Configure adaptive behavioral profiles and internal simulation.</p>
        </div>
        <button 
            className="bg-wolf-800 hover:bg-wolf-700 text-white border border-wolf-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
            <Plus size={14} />
            Create Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Profile Cards */}
         {profiles.map(profile => (
             <div key={profile.id} className="bg-wolf-800 border border-wolf-700 rounded-lg p-6 hover:border-wolf-red/40 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Fingerprint size={64} className="text-wolf-red" />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-wolf-900 rounded border border-wolf-700 text-wolf-red">
                        {profile.osFamily === 'Linux' ? <Terminal size={20}/> : <Code size={20} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                        <span className="text-xs text-wolf-500 font-mono">{profile.osFamily} • {profile.osVersion}</span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                        <div className="mt-1 min-w-[16px]"><FileText size={14} className="text-wolf-400" /></div>
                        <div>
                            <div className="text-[10px] text-wolf-500 uppercase tracking-wide font-bold">Banner Template</div>
                            <div className="text-xs text-wolf-300 font-mono truncate w-48 bg-wolf-950 px-2 py-1 rounded border border-wolf-800">
                                {profile.bannerTemplate}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-1 min-w-[16px]"><Server size={14} className="text-wolf-400" /></div>
                        <div>
                            <div className="text-[10px] text-wolf-500 uppercase tracking-wide font-bold">Fake Kernel</div>
                            <div className="text-xs text-wolf-300 font-mono">{profile.kernelVersion}</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {profile.honeytokens && (
                        <span className="px-2 py-1 bg-wolf-red/10 border border-wolf-red/30 text-wolf-red text-[10px] uppercase font-bold rounded flex items-center gap-1">
                            <Check size={10} /> Honeytokens
                        </span>
                    )}
                    {profile.internalNetwork && (
                        <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-bold rounded flex items-center gap-1">
                            <Network size={10} /> Internal Sim
                        </span>
                    )}
                </div>
             </div>
         ))}
      </div>

      {/* Internal Network Simulator Config */}
      <div className="bg-wolf-800 border border-wolf-700 rounded-lg p-8 relative overflow-hidden mt-8">
         <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-wolf-red to-transparent"></div>
         
         <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Network className="text-wolf-red" size={24}/>
                    Internal Network Simulation
                </h3>
                <p className="text-wolf-400 text-sm mt-1">Configure fake internal hosts visible to attackers during lateral movement attempts.</p>
             </div>
             <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-wolf-500">SIMULATION ENGINE</span>
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             </div>
         </div>

         <div className="bg-wolf-950 border border-wolf-800 rounded-lg p-4 font-mono text-xs text-wolf-300">
            <div className="grid grid-cols-4 gap-4 mb-2 text-wolf-500 uppercase font-bold border-b border-wolf-800 pb-2">
                <div>Internal IP</div>
                <div>Hostname</div>
                <div>Role</div>
                <div>Open Ports (Simulated)</div>
            </div>
            <div className="grid grid-cols-4 gap-4 py-2 border-b border-wolf-800/50 hover:bg-wolf-900/50 transition-colors">
                <div className="text-wolf-red">10.0.0.5</div>
                <div>db-prod-replica</div>
                <div>Database</div>
                <div>5432, 22</div>
            </div>
            <div className="grid grid-cols-4 gap-4 py-2 border-b border-wolf-800/50 hover:bg-wolf-900/50 transition-colors">
                <div className="text-wolf-red">10.0.0.8</div>
                <div>k8s-worker-01</div>
                <div>Compute</div>
                <div>10250, 22</div>
            </div>
            <div className="grid grid-cols-4 gap-4 py-2 hover:bg-wolf-900/50 transition-colors">
                <div className="text-wolf-red">10.0.0.10</div>
                <div>admin-dashboard</div>
                <div>Web App</div>
                <div>80, 443, 8080</div>
            </div>
         </div>
         
         <div className="mt-4 flex justify-end">
             <button className="text-xs font-bold text-wolf-400 hover:text-white flex items-center gap-1">
                 Configure Topology <Terminal size={12}/>
             </button>
         </div>
      </div>
    </div>
  );
};