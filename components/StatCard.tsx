import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, highlight }) => {
  return (
    <div className={`relative overflow-hidden bg-wolf-800 border border-wolf-700 rounded-lg p-6 hover:border-wolf-red/50 transition-all duration-300 group ${highlight ? 'shadow-neon border-wolf-red/30' : 'shadow-lg'}`}>
      {highlight && <div className="absolute inset-0 bg-wolf-red/5 pointer-events-none"></div>}
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-wolf-400 text-xs font-bold tracking-widest uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-mono font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded bg-wolf-900 border border-wolf-700 group-hover:border-wolf-red/50 transition-colors ${highlight ? 'text-wolf-red shadow-neon' : 'text-wolf-400 group-hover:text-wolf-red'}`}>
          <Icon size={24} />
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center text-xs font-mono relative z-10">
          <span className={`${trend === 'up' ? 'text-wolf-red' : 'text-wolf-400'} font-bold flex items-center gap-1`}>
            {trend === 'up' ? '▲' : '▼'} {change}
          </span>
          <span className="text-wolf-600 ml-2">VS 24H AGO</span>
        </div>
      )}
      
      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-wolf-red/10 to-transparent clip-hex"></div>
    </div>
  );
};