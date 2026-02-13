import React, { useState } from 'react';
import { CreditCard, Users, Shield, Database, Check, Zap, AlertTriangle, Briefcase, GraduationCap, Star } from 'lucide-react';
import { SubscriptionTier, Tenant, AddOn } from '../types';
import { SUBSCRIPTION_PLANS, MOCK_TENANT, AVAILABLE_ADDONS } from '../constants';

// --- COMPONENTS ---

const UsageBar = ({ label, current, max, unit = '', color = 'bg-wolf-red' }: { label: string, current: number, max: number, unit?: string, color?: string }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isCritical = percentage > 90;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-wolf-400 mb-2">
        <span>{label}</span>
        <span className={isCritical ? 'text-red-500' : 'text-wolf-300'}>
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-wolf-950 rounded-full h-2 overflow-hidden border border-wolf-800">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const PlanCard = ({ planKey, tenantTier, onSelect }: { planKey: string, tenantTier: SubscriptionTier, onSelect: (key: string) => void }) => {
    const plan = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
    const isActive = planKey === tenantTier;
    
    return (
        <div className={`p-6 rounded-lg border flex flex-col h-full relative transition-all duration-300 ${isActive ? 'bg-wolf-900 border-wolf-red shadow-neon scale-[1.02]' : 'bg-wolf-800 border-wolf-700 opacity-80 hover:opacity-100 hover:border-wolf-500'}`}>
            {isActive && (
                <div className="absolute top-0 right-0 bg-wolf-red text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg shadow-lg">
                    Current Plan
                </div>
            )}
            
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    {plan.name === 'Predator' ? <Shield size={18} className="text-wolf-red"/> : null}
                    {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-wolf-500 text-xs font-mono">/mo</span>
                </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-wolf-300">
                        <Check size={14} className="text-wolf-red min-w-[14px] mt-0.5" />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={() => !isActive && onSelect(planKey)}
                className={`w-full py-3 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
                    isActive 
                    ? 'bg-wolf-800 text-wolf-500 cursor-default border border-wolf-700' 
                    : 'bg-wolf-red text-white hover:bg-wolf-red/80 shadow-lg hover:shadow-neon'
                }`}
            >
                {isActive ? 'Active Plan' : `Switch to ${plan.name}`}
            </button>
        </div>
    );
};

const AddOnCard = ({ addon, active, onToggle }: { addon: AddOn, active: boolean, onToggle: () => void }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${active ? 'bg-wolf-900 border-wolf-red/50' : 'bg-wolf-950 border-wolf-800'}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded border ${active ? 'bg-wolf-red/10 border-wolf-red text-wolf-red' : 'bg-wolf-900 border-wolf-700 text-wolf-500'}`}>
                <Zap size={20} />
            </div>
            <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">{addon.name}</h4>
                <p className="text-xs text-wolf-400 mt-1">{addon.description}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-white font-bold text-sm">${addon.price}</div>
                <div className="text-[10px] text-wolf-500 uppercase">{addon.metric}</div>
            </div>
            <button 
                onClick={onToggle}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                    active ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20' : 'bg-wolf-800 border-wolf-600 text-wolf-300 hover:text-white'
                }`}
            >
                {active ? 'Remove' : 'Add'}
            </button>
        </div>
    </div>
);

// --- MAIN PAGE ---

export const Settings: React.FC = () => {
  const [tenant, setTenant] = useState<Tenant>(MOCK_TENANT);
  const [loading, setLoading] = useState(false);

  const handlePlanChange = (planId: string) => {
      if(!confirm(`Are you sure you want to switch to the ${planId} plan? Prorated charges will apply.`)) return;
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
          setTenant(prev => ({
              ...prev,
              tier: planId as SubscriptionTier,
              limits: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS].limits as any
          }));
          setLoading(false);
          alert("Subscription updated successfully.");
      }, 1000);
  };

  const toggleAddon = (addonId: string) => {
      setLoading(true);
      setTimeout(() => {
          setTenant(prev => {
              const hasAddon = prev.addOns.includes(addonId);
              return {
                  ...prev,
                  addOns: hasAddon ? prev.addOns.filter(id => id !== addonId) : [...prev.addOns, addonId]
              };
          });
          setLoading(false);
      }, 600);
  };

  // Calculate Days Remaining in Trial
  const daysLeft = tenant.trialEndsAt ? Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             Billing & Subscription
             {tenant.isBeta && (
                 <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                     <Star size={10} /> Private Beta
                 </span>
             )}
             {tenant.isStudent && (
                 <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                     <GraduationCap size={10} /> Student
                 </span>
             )}
          </h2>
          <p className="text-wolf-400 mt-1 font-mono text-sm">Manage resource quotas, invoices, and service tiers.</p>
        </div>
        
        {tenant.status === 'TRIAL' && (
            <div className="bg-wolf-red/10 border border-wolf-red text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-neon">
                <AlertTriangle className="text-wolf-red animate-pulse" size={20} />
                <div>
                    <div className="font-bold uppercase text-xs tracking-wider text-wolf-red">Free Trial Active</div>
                    <div className="text-sm">You have <span className="font-bold">{daysLeft} days</span> remaining of full access.</div>
                </div>
                <button className="ml-4 bg-wolf-red hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-wider transition-colors">
                    Upgrade Now
                </button>
            </div>
        )}
      </div>

      {/* Usage & Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-wolf-800 border border-wolf-700 rounded-lg p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-wolf-900 border border-wolf-700 rounded text-wolf-red">
                    <Database size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Resource Quota</h3>
                    <p className="text-xs text-wolf-500 font-mono">Reset: 1st of Month</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <UsageBar 
                    label="Active Nodes" 
                    current={tenant.usage.honeypotsUsed} 
                    max={tenant.limits.maxHoneypots} 
                />
                <UsageBar 
                    label="Log Ingestion" 
                    current={tenant.usage.logsIngestedMonth} 
                    max={tenant.limits.maxLogsPerMonth} 
                    unit="Events"
                    color="bg-blue-500"
                />
                <UsageBar 
                    label="Storage Retention" 
                    current={tenant.usage.storageUsedGB} 
                    max={10} 
                    unit="GB"
                    color="bg-purple-500"
                />
            </div>

            <div className="mt-6 pt-6 border-t border-wolf-700">
                <div className="flex justify-between items-center">
                    <span className="text-wolf-400 text-xs font-bold uppercase">Payment Method</span>
                    <span className="text-wolf-300 text-xs font-mono">Visa ending in 4242</span>
                </div>
                <button className="w-full mt-4 py-2 border border-wolf-600 text-wolf-400 hover:text-white hover:border-wolf-400 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                    <CreditCard size={14} /> Manage in Stripe
                </button>
            </div>
        </div>

        {/* Plan Selection */}
        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                {Object.keys(SUBSCRIPTION_PLANS).map(key => (
                    <PlanCard 
                        key={key} 
                        planKey={key} 
                        tenantTier={tenant.tier} 
                        onSelect={handlePlanChange}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* Add-on Marketplace */}
      <div className="bg-wolf-800 border border-wolf-700 rounded-lg p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-wolf-red to-transparent"></div>
        <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="text-wolf-red" size={24}/>
                Expansion Packs & Add-ons
            </h3>
            <p className="text-wolf-400 text-sm mt-1">Enhance your subscription with modular capabilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_ADDONS.map(addon => (
                <AddOnCard 
                    key={addon.id}
                    addon={addon}
                    active={tenant.addOns.includes(addon.id)}
                    onToggle={() => toggleAddon(addon.id)}
                />
            ))}
        </div>
      </div>

      {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-white font-mono text-xl animate-pulse">Processing Transaction...</div>
          </div>
      )}
    </div>
  );
};