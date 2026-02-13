import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, ShieldAlert, Server, Globe, ExternalLink } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MOCK_HONEYPOTS, HEATMAP_DATA } from '../constants';
import { db, isDemoMode } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Security Overview</h2>
          <p className="text-slate-400 mt-1">Real-time threat telemetry and honeypot status</p>
        </div>
        <div className="flex gap-2">
           <Link to="/trap" target="_blank" className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-200/10 text-cyber-200 border border-cyber-200/20 text-xs font-mono hover:bg-cyber-200/20 transition-colors">
              <ExternalLink size={12} />
              OPEN HONEYPOT TRAP
           </Link>
           <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-200/10 text-cyber-200 border border-cyber-200/20 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyber-200"></span>
              LIVE ATTACK STREAM
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Honeypots" 
          value={stats.activeHoneypots} 
          icon={Server} 
          colorClass="text-cyber-500" 
          change="Live"
          trend="up"
        />
        <StatCard 
          title="Threats Blocked" 
          value={stats.threatsBlocked.toLocaleString()} 
          icon={ShieldAlert} 
          colorClass="text-cyber-200" 
          change="12%"
          trend="up"
        />
        <StatCard 
          title="Avg Threat Score" 
          value={`${stats.avgScore}/100`} 
          icon={Activity} 
          colorClass="text-cyber-300" 
          change="5%"
          trend="down"
        />
        <StatCard 
          title="Top Source" 
          value="Russia" 
          icon={Globe} 
          colorClass="text-cyber-400" 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Volume Chart */}
        <div className="lg:col-span-2 bg-cyber-800 border border-cyber-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Attack Volume (24h)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#e2e8f0' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAttacks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MITRE Heatmap Summary */}
        <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Top MITRE Tactics</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={HEATMAP_DATA.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" />
                <YAxis dataKey="tactic" type="category" width={100} stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip cursor={{fill: '#27272a'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};