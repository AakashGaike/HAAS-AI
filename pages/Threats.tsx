import React, { useState, useEffect } from 'react';
import { MOCK_THREATS } from '../constants';
import { ThreatLog } from '../types';
import { analyzeThreat } from '../services/geminiService';
import { Bot, X, ShieldCheck, AlertTriangle, Fingerprint } from 'lucide-react';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const Threats: React.FC = () => {
  const [threats, setThreats] = useState<ThreatLog[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLog | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Subscribe to threats
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
                // Handle firestore timestamp if present
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            } as ThreatLog;
        });
        setThreats(logs.length > 0 ? logs : MOCK_THREATS);
    });

    return () => unsubscribe();
  }, []);

  const handleAnalyze = async (threat: ThreatLog) => {
    setSelectedThreat(threat);
    setLoadingAi(true);
    setAiAnalysis(null);
    
    // Call Gemini Service
    const result = await analyzeThreat(threat);
    
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const closeAnalysis = () => {
    setSelectedThreat(null);
    setAiAnalysis(null);
  };

  return (
    <div className="relative h-full flex flex-col">
       <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">Threat Intelligence</h2>
          <p className="text-slate-400 mt-1">Live log stream and AI-assisted analysis</p>
       </div>

       {/* Log Table */}
       <div className="bg-cyber-800 border border-cyber-700 rounded-xl overflow-hidden shadow-lg flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cyber-900/50 text-cyber-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium border-b border-cyber-700">Timestamp</th>
                  <th className="p-4 font-medium border-b border-cyber-700">Severity</th>
                  <th className="p-4 font-medium border-b border-cyber-700">Source</th>
                  <th className="p-4 font-medium border-b border-cyber-700">Technique</th>
                  <th className="p-4 font-medium border-b border-cyber-700">Payload Preview</th>
                  <th className="p-4 font-medium border-b border-cyber-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-700 text-sm">
                {threats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-cyber-700/50 transition-colors group">
                    <td className="p-4 text-slate-300 font-mono text-xs">{new Date(threat.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        threat.severity === 'CRITICAL' ? 'bg-red-900/30 border-red-800 text-red-500' :
                        threat.severity === 'HIGH' ? 'bg-orange-900/30 border-orange-800 text-orange-500' :
                        'bg-blue-900/30 border-blue-800 text-blue-500'
                      }`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="p-4 text-white">
                      <div className="flex flex-col">
                        <span>{threat.sourceIp}</span>
                        <span className="text-xs text-cyber-600">{threat.country}</span>
                      </div>
                    </td>
                    <td className="p-4 text-cyber-300">{threat.technique}</td>
                    <td className="p-4">
                      <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono text-cyber-400 group-hover:text-white transition-colors block max-w-[200px] truncate">
                        {threat.payload}
                      </code>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleAnalyze(threat)}
                        className="flex items-center gap-1.5 text-xs font-medium bg-cyber-300/10 text-cyber-300 hover:bg-cyber-300/20 px-3 py-1.5 rounded transition-colors border border-cyber-300/20"
                      >
                        <Bot size={14} />
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {threats.length === 0 && (
                <div className="p-8 text-center text-slate-500">Waiting for threat logs...</div>
            )}
          </div>
       </div>

       {/* AI Analysis Modal/Overlay */}
       {selectedThreat && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-cyber-800 w-full max-w-2xl border border-cyber-600 rounded-xl shadow-2xl shadow-cyber-900 flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-cyber-700 flex justify-between items-start bg-cyber-900/50 rounded-t-xl">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-300/20 rounded-lg">
                      <Bot className="text-cyber-300" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Threat Analysis</h3>
                      <p className="text-slate-400 text-sm">Powered by Gemini 3 Flash</p>
                    </div>
                 </div>
                 <button onClick={closeAnalysis} className="text-slate-400 hover:text-white">
                   <X size={24} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-12 h-12 border-4 border-cyber-300 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyber-300 animate-pulse">Analyzing payload signature...</p>
                  </div>
                ) : aiAnalysis ? (
                  <>
                    <div className="bg-cyber-900/50 p-4 rounded-lg border border-cyber-700 font-mono text-xs text-slate-300 break-all">
                       <span className="text-cyber-600 select-none">$ </span>{selectedThreat.payload}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-cyber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Fingerprint size={16}/> Attack Vector
                        </h4>
                        <p className="text-white text-lg font-medium">{aiAnalysis.vector}</p>
                      </div>

                      <div className="bg-cyber-700/30 p-4 rounded-lg border-l-4 border-cyber-300">
                        <p className="text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                          <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                             <AlertTriangle size={16}/> Impact
                          </h4>
                          <p className="text-sm text-slate-400">Potential data exfiltration or unauthorized system access if payload executes successfully.</p>
                        </div>
                        <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-lg">
                           <h4 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                             <ShieldCheck size={16}/> Remediation
                           </h4>
                           <p className="text-sm text-slate-400">{aiAnalysis.remediation}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                         <span className="text-xs text-cyber-600 font-mono">CONFIDENCE SCORE: {Math.round(aiAnalysis.confidence * 100)}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-red-400">Analysis Failed. Please try again.</div>
                )}
              </div>

            </div>
         </div>
       )}
    </div>
  );
};