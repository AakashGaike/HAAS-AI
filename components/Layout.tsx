import React from 'react';
import { LayoutDashboard, ShieldAlert, Server, Activity, Settings, LogOut, Menu, X, Hexagon, Fingerprint } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 relative overflow-hidden ${
      active 
        ? 'text-white' 
        : 'text-wolf-400 hover:text-white'
    }`}
  >
    {/* Active indicator bar */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-wolf-red shadow-[0_0_10px_#FF1E1E]"></div>
    )}
    
    {/* Background hover effect */}
    <div className={`absolute inset-0 bg-wolf-red/5 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

    <Icon size={20} className={`relative z-10 transition-colors ${active ? 'text-wolf-red' : 'text-wolf-400 group-hover:text-wolf-red'}`} />
    <span className="relative z-10 font-medium tracking-wide text-sm">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-wolf-950 text-wolf-300 overflow-hidden font-sans selection:bg-wolf-red selection:text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-wolf-900 border-r border-wolf-800 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-6 border-b border-wolf-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Hexagon className="text-wolf-red fill-wolf-red/10" size={32} strokeWidth={2} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-wolf-red rounded-full shadow-[0_0_10px_#FF1E1E]"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white font-mono">
              WOLF<span className="text-wolf-red">ARIUM</span>
            </h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-wolf-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          <div className="px-4 py-2 text-xs font-bold text-wolf-600 uppercase tracking-widest">Platform</div>
          <NavItem to="/" icon={LayoutDashboard} label="Command Center" active={location.pathname === '/'} />
          <NavItem to="/honeypots" icon={Server} label="Honeypot Fleet" active={location.pathname === '/honeypots'} />
          <NavItem to="/threats" icon={ShieldAlert} label="Threat Intel" active={location.pathname === '/threats'} />
          
          <div className="px-4 py-2 mt-6 text-xs font-bold text-wolf-600 uppercase tracking-widest">Configuration</div>
          <NavItem to="/deception" icon={Fingerprint} label="Deception Engine" active={location.pathname === '/deception'} />
          <NavItem to="/settings" icon={Settings} label="System & Billing" active={location.pathname === '/settings'} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-wolf-800 bg-wolf-900">
          <div className="flex items-center gap-3 px-4 py-3 text-wolf-400 hover:text-white cursor-pointer transition-colors group">
            <LogOut size={20} className="group-hover:text-wolf-red transition-colors"/>
            <span className="text-sm">Secure Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 relative h-full overflow-hidden bg-hex-pattern">
        {/* Header */}
        <header className="h-16 bg-wolf-950/80 backdrop-blur-md border-b border-wolf-800 flex items-center justify-between px-6 z-40">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-wolf-400">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 ml-4">
             <div className="w-2 h-2 rounded-full bg-wolf-red animate-pulse shadow-[0_0_8px_#FF1E1E]"></div>
             <span className="text-xs font-mono text-wolf-red tracking-wider">SYSTEM ONLINE</span>
          </div>
          
          <div className="ml-auto flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-white">Ops Admin</span>
                <span className="text-xs text-wolf-500 font-mono">TIER: ENTERPRISE</span>
             </div>
             <div className="w-10 h-10 rounded bg-wolf-800 border border-wolf-700 flex items-center justify-center text-wolf-red font-bold shadow-[0_0_10px_rgba(255,30,30,0.1)]">
                OA
             </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {children}
        </main>
      </div>
    </div>
  );
};