import React from 'react';
import { CreditCard, Users, Shield, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Manage tenant configuration and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Section */}
        <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-cyber-500/10 rounded-lg text-cyber-500">
                <CreditCard size={24} />
             </div>
             <h3 className="text-xl font-bold text-white">Subscription</h3>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center p-4 bg-cyber-900/50 rounded-lg border border-cyber-700">
                <div>
                   <p className="text-sm text-slate-400">Current Plan</p>
                   <p className="text-lg font-bold text-white">Enterprise Growth</p>
                </div>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold rounded border border-emerald-900/50">ACTIVE</span>
             </div>
             
             <div className="w-full bg-cyber-900 rounded-full h-2">
                <div className="bg-cyber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
             </div>
             <div className="flex justify-between text-xs text-slate-500">
                <span>Usage: 65,000 / 100,000 logs</span>
                <span>Renews in 14 days</span>
             </div>

             <button className="w-full py-2 bg-cyber-700 hover:bg-cyber-600 text-white rounded-lg transition-colors font-medium text-sm">
                Manage Billing on Stripe
             </button>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-cyber-400/10 rounded-lg text-cyber-400">
                <Users size={24} />
             </div>
             <h3 className="text-xl font-bold text-white">Team Access</h3>
          </div>
          <div className="space-y-3">
             {['admin@haas.io', 'security@haas.io', 'audit@haas.io'].map(email => (
                <div key={email} className="flex justify-between items-center p-3 hover:bg-cyber-700/50 rounded transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                         {email[0].toUpperCase()}
                      </div>
                      <span className="text-slate-300 text-sm">{email}</span>
                   </div>
                   <span className="text-xs text-slate-500">Owner</span>
                </div>
             ))}
             <button className="mt-4 text-sm text-cyber-400 hover:text-cyber-300 font-medium">
                + Invite Member
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};