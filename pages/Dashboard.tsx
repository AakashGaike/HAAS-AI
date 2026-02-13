import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, ShieldAlert, Server, Globe, ExternalLink, Zap } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MOCK_HONEYPOTS, HEATMAP_DATA } from '../constants';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const activityData = [
  { time: '00:00', attacks: 20 },
  { time: '04:00', attacks: 45 },
  { time: '08:00', attacks: 120 },
  { time: '12:00', attacks: 85 },
  { time: '16:00', attacks: 150 },
  { time: '20:00', attacks: 190 },
  { time: '23:59', attacks: 140 },
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
      activeHoneypots: 0,
      threatsBlocked: 12450,
      avgScore: 78
  });

  useEffect(() => {
    if (isDemoMode()) {
        setStats({
            activeHoneypots: MOCK_HONEYPOTS.filter(h => h.status === 'ACTIVE').length,
            threatsBlocked: 12450,
            avgScore: 78
        });
        return;
    }

    const unsubscribe = onSnapshot(collection(db, "honeypots"), (snap) => {
        const active = snap.docs.filter(d => d.data().status === 'ACTIVE').length;
        setStats(prev => ({ ...prev, activeHoneypots: active }));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
          <p className="text-wolf-400 mt-1 font-mono text-sm">System Status: <span className="text-wolf-red">ELEVATED THREAT LEVEL</span></p>
        </div>
        <div className="flex gap-3">
           <Link to="/trap" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded bg-wolf-800 border border-wolf-700 text-wolf-300 text-xs font-bold hover:bg-wolf-700 hover:text-white hover:border-wolf-500 transition-all uppercase tracking-wider">
              <ExternalLink size={14} />
              Deploy Trap
           </Link>
           <div className="flex items-center gap-2 px-4 py-2 rounded bg-wolf-red/10 border border-wolf-red/30 text-wolf-red text-xs font-bold uppercase tracking-wider shadow-neon">
              <span className="w-2 h-2 rounded-full bg-wolf-red animate-pulse"></span>
              Live Feed Online
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Nodes" 
          value={stats.activeHoneypots} 
          icon={Server} 
          change="+2"
          trend="up"
          highlight={true}
        />
        <StatCard 
          title="Threats Intercepted" 
          value={stats.threatsBlocked.toLocaleString()} 
          icon={ShieldAlert} 
          change="12%"
          trend="up"
        />
        <StatCard 
          title="Risk Score" 
          value={stats.avgScore} 
          icon={Activity} 
          change="5%"
          trend="down"
        />
        <StatCard 
          title="Primary Origin" 
          value="CN/RU" 
          icon={Globe} 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Volume Chart */}
        <div className="lg:col-span-2 bg-wolf-800 border border-wolf-700 rounded-lg p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wolf-red to-transparent"></div>
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-wolf-red" />
                Attack Telemetry
             </h3>
             <span className="text-xs font-mono text-wolf-500">LAST 24 HOURS</span>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF1E1E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF1E1E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4B5563" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#4B5563" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#FF1E1E', color: '#E5E7EB', borderRadius: '4px' }}
                  itemStyle={{ color: '#FF1E1E', fontWeight: 'bold' }}
                  cursor={{stroke: '#FF1E1E', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="attacks" stroke="#FF1E1E" strokeWidth={3} fillOpacity={1} fill="url(#colorAttacks)" activeDot={{r: 6, fill: '#fff', stroke: '#FF1E1E'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MITRE Heatmap Summary */}
        <div className="bg-wolf-800 border border-wolf-700 rounded-lg p-6 shadow-lg relative">
           <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-wolf-red to-transparent"></div>
          <h3 className="text-lg font-bold text-white mb-6">MITRE ATT&CK TTPs</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={HEATMAP_DATA.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                <XAxis type="number" stroke="#4B5563" hide />
                <YAxis dataKey="tactic" type="category" width={110} stroke="#9CA3AF" style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', color: '#fff' }} />
                <Bar dataKey="count" fill="#FF1E1E" radius={[0, 4, 4, 0]} barSize={16}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};