import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, colorClass }) => {
  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 hover:border-cyber-600 transition-all duration-300 shadow-lg shadow-black/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-cyber-600 text-sm font-medium tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
          <Icon className={colorClass} size={24} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`${trend === 'up' ? 'text-cyber-200' : 'text-cyber-500'} font-semibold`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-500 ml-2">vs last 24h</span>
        </div>
      )}
    </div>
  );
};