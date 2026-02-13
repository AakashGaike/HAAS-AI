import React from 'react';
import { LayoutDashboard, ShieldAlert, Server, Activity, Settings, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-cyber-700 text-cyber-300 border-l-4 border-cyber-300' 
        : 'text-cyber-600 hover:bg-cyber-800 hover:text-cyber-400'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium tracking-wide">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-cyber-900 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-cyber-900 border-r border-cyber-700 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-6 border-b border-cyber-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyber-200 rounded-sm animate-pulse"></div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">HAAS<span className="text-cyber-200">.io</span></h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/honeypots" icon={Server} label="Honeypots" active={location.pathname === '/honeypots'} />
          <NavItem to="/threats" icon={ShieldAlert} label="Threat Intel" active={location.pathname === '/threats'} />
          <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-cyber-700">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 relative h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-cyber-800/50 backdrop-blur-md border-b border-cyber-700 flex items-center justify-between px-6 z-40">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400">
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-white">Admin User</span>
                <span className="text-xs text-cyber-500">Tenant: Corp-Alpha-01</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-cyber-700 border border-cyber-600 flex items-center justify-center text-cyber-300 font-bold">
                AU
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