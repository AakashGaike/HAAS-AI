import React, { useState, useEffect } from 'react';
import { MOCK_THREATS } from '../constants';
import { ThreatLog } from '../types';
import { analyzeThreat } from '../services/geminiService';
import { Bot, X, ShieldCheck, AlertTriangle, Fingerprint, Eye, Terminal, Play, Clock, Network } from 'lucide-react';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const Threats: React.FC = () => {
  const [threats, setThreats] = useState<ThreatLog[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLog | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [viewMode, setViewMode] = useState<'analysis' | 'replay'>('analysis');

  useEffect(() => {
    if (isDemoMode()) {
        setThreats(MOCK_THREATS);
        return;
    }

    const q = query(collection(db, "threat_logs"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            } as ThreatLog;
        });
        setThreats(logs.length > 0 ? logs : MOCK_THREATS);
    });

    return () => unsubscribe();
  }, []);

  const handleAnalyze = async (threat: ThreatLog) => {
    setSelectedThreat(threat);
    setViewMode('analysis');
    setLoadingAi(true);
    setAiAnalysis(null);
    const result = await analyzeThreat(threat);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const handleReplay = (threat: ThreatLog) => {
      setSelectedThreat(threat);
      setViewMode('replay');
  };

  const closeAnalysis = () => {
    setSelectedThreat(null);
    setAiAnalysis(null);
  };

  return (
    <div className="relative h-full flex flex-col">
       <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Threat Intelligence</h2>
            <p className="text-wolf-400 mt-1 font-mono text-sm">Real-time Ingestion Pipeline</p>
          </div>
          <div className="px-3 py-1 bg-wolf-800 border border-wolf-700 rounded text-xs font-mono text-wolf-400">
             AI ENGINE: <span className="text-wolf-red">ONLINE</span>
          </div>
       </div>

       {/* Log Table */}
       <div className="bg-wolf-800 border border-wolf-700 rounded-lg overflow-hidden shadow-lg flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-wolf-900 text-wolf-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-4 border-b border-wolf-700">Time</th>
                  <th className="p-4 border-b border-wolf-700">Severity</th>
                  <th className="p-4 border-b border-wolf-700">Origin</th>
                  <th className="p-4 border-b border-wolf-700">Vector</th>
                  <th className="p-4 border-b border-wolf-700">Payload Signature</th>
                  <th className="p-4 border-b border-wolf-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wolf-700 text-sm font-mono">
                {threats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-wolf-700/50 transition-colors group">
                    <td className="p-4 text-wolf-400 text-xs">{new Date(threat.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${
                        threat.severity === 'CRITICAL' ? 'bg-wolf-red text-white border-wolf-red shadow-[0_0_10px_#FF1E1E]' :
                        threat.severity === 'HIGH' ? 'bg-orange-600/20 text-orange-500 border-orange-500/50' :
                        'bg-blue-600/20 text-blue-400 border-blue-500/50'
                      }`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="p-4 text-white">
                      <div className="flex flex-col">
                        <span className="font-bold">{threat.sourceIp}</span>
                        <span className="text-[10px] text-wolf-500">{threat.country}</span>
                      </div>
                    </td>
                    <td className="p-4 text-wolf-300 text-xs">{threat.technique}</td>
                    <td className="p-4">
                      <div className="bg-wolf-950 px-3 py-2 rounded border border-wolf-800 text-wolf-400 group-hover:text-white group-hover:border-wolf-600 transition-colors max-w-[200px] truncate text-xs">
                        <span className="text-wolf-600 mr-2">$</span>
                        {threat.payload}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {threat.sessionLog && (
                            <button 
                                onClick={() => handleReplay(threat)}
                                className="flex items-center gap-2 text-[10px] font-bold bg-wolf-800 text-wolf-400 hover:text-white px-3 py-1.5 rounded transition-all border border-wolf-700 hover:border-wolf-500 uppercase tracking-wider"
                                title="Replay Session"
                            >
                                <Play size={12} />
                            </button>
                        )}
                        <button 
                            onClick={() => handleAnalyze(threat)}
                            className="flex items-center gap-2 text-[10px] font-bold bg-wolf-red/10 text-wolf-red hover:bg-wolf-red hover:text-white px-3 py-1.5 rounded transition-all border border-wolf-red/30 hover:border-wolf-red hover:shadow-neon uppercase tracking-wider"
                        >
                            <Bot size={12} />
                            Analyze
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>

       {/* Overlay Modal */}
       {selectedThreat && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-wolf-900 w-full max-w-4xl border border-wolf-red/50 rounded-lg shadow-neon flex flex-col max-h-[90vh] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wolf-red to-transparent animate-pulse"></div>

              {/* Modal Header */}
              <div className="p-6 border-b border-wolf-700 flex justify-between items-start bg-wolf-950">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-wolf-red/10 rounded border border-wolf-red/30">
                      {viewMode === 'analysis' ? <Bot className="text-wolf-red" size={24} /> : <Terminal className="text-wolf-red" size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest">
                          {viewMode === 'analysis' ? 'Wolfarium AI Engine' : 'Session Replay'}
                      </h3>
                      <p className="text-wolf-500 text-xs mt-1">
                          Source: {selectedThreat.sourceIp} ({selectedThreat.country}) • ID: {selectedThreat.id}
                      </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex bg-wolf-950 border border-wolf-700 rounded overflow-hidden">
                        <button 
                            onClick={() => setViewMode('analysis')}
                            className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${viewMode === 'analysis' ? 'bg-wolf-800 text-white' : 'text-wolf-500 hover:text-wolf-300'}`}
                        >
                            AI Analysis
                        </button>
                        <button 
                            onClick={() => setViewMode('replay')}
                            disabled={!selectedThreat.sessionLog}
                            className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-l border-wolf-700 ${viewMode === 'replay' ? 'bg-wolf-800 text-white' : 'text-wolf-500 hover:text-wolf-300 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                        >
                            Terminal
                        </button>
                    </div>
                    <button onClick={closeAnalysis} className="text-wolf-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                 </div>
              </div>

              {/* Modal Content */}
              <div className="p-0 overflow-y-auto bg-hex-pattern flex-1">
                {viewMode === 'analysis' ? (
                    <div className="p-8 space-y-8">
                        {loadingAi ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-wolf-800 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-wolf-red border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-wolf-red font-mono text-sm animate-pulse tracking-widest">DECRYPTING ATTACK SIGNATURE...</p>
                        </div>
                        ) : aiAnalysis ? (
                        <>
                            <div className="bg-black border border-wolf-700 rounded p-4 font-mono text-xs text-wolf-300 overflow-x-auto shadow-inner">
                            <div className="text-wolf-500 mb-2">// CAPTURED PAYLOAD</div>
                            <span className="text-wolf-red select-none mr-2">root@honeypot:~#</span>
                            <span className="text-white">{selectedThreat.payload}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-wolf-500 uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint size={14} /> Attack Vector
                                </h4>
                                <p className="text-white text-lg font-bold">{aiAnalysis.vector}</p>
                                <div className="p-4 bg-wolf-800 rounded border-l-2 border-wolf-red text-sm text-wolf-300 leading-relaxed">
                                    {aiAnalysis.summary}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-wolf-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle size={14} /> Risk Assessment
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-wolf-950 border border-wolf-700 rounded text-center">
                                        <div className="text-xs text-wolf-500 uppercase">Confidence</div>
                                        <div className="text-2xl font-bold text-white mt-1">{Math.round(aiAnalysis.confidence * 100)}%</div>
                                    </div>
                                    <div className="p-4 bg-wolf-950 border border-wolf-700 rounded text-center">
                                        <div className="text-xs text-wolf-500 uppercase">Severity</div>
                                        <div className="text-2xl font-bold text-wolf-red mt-1">HIGH</div>
                                    </div>
                                </div>
                            </div>
                            </div>

                            <div className="bg-wolf-900/50 border border-wolf-700 p-6 rounded relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-wolf-red"></div>
                            <h4 className="text-xs font-bold text-wolf-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <ShieldCheck size={14} /> Recommended Mitigation
                            </h4>
                            <p className="text-sm text-white">{aiAnalysis.remediation}</p>
                            </div>
                        </>
                        ) : (
                        <div className="text-center text-wolf-500 p-8">Analysis Failed. Please try again.</div>
                        )}
                    </div>
                ) : (
                    /* Terminal Replay View */
                    <div className="flex flex-col h-full font-mono text-sm">
                        <div className="bg-wolf-950 p-4 border-b border-wolf-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-wolf-500 text-xs">
                                SESSION_ID: {selectedThreat.id.split('-')[1].toUpperCase()} • DWELL TIME: 4m 32s
                            </div>
                        </div>
                        <div className="flex-1 bg-black p-6 overflow-y-auto space-y-4 text-wolf-300">
                             {selectedThreat.sessionLog?.map((entry, idx) => (
                                 <div key={idx} className="space-y-1">
                                     <div className="flex gap-2 text-wolf-500 text-xs select-none">
                                        <Clock size={12} className="mt-0.5" />
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                        {entry.tags.includes('Lateral Movement') && (
                                            <span className="text-red-500 flex items-center gap-1 font-bold ml-2">
                                                <Network size={10} /> Lateral Movement Detected
                                            </span>
                                        )}
                                     </div>
                                     <div className="flex gap-2">
                                         <span className="text-wolf-red select-none">root@server:~#</span>
                                         <span className="text-white">{entry.command}</span>
                                     </div>
                                     <div className="pl-4 text-wolf-400 whitespace-pre-wrap border-l border-wolf-800 ml-1">
                                         {entry.response}
                                     </div>
                                 </div>
                             ))}
                             <div className="animate-pulse text-wolf-red">_</div>
                        </div>
                    </div>
                )}
              </div>
            </div>
         </div>
       )}
    </div>
  );
};