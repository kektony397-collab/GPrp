
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, FileText, Menu, X, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import clsx from 'clsx';
import { AppTheme } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const themes: Record<AppTheme, { bg: string, sidebar: string, text: string, primary: string, accent: string }> = {
  blue: { bg: 'bg-slate-50', sidebar: 'bg-blue-600', text: 'text-slate-900', primary: 'text-blue-600', accent: 'bg-blue-100' },
  green: { bg: 'bg-stone-50', sidebar: 'bg-emerald-700', text: 'text-stone-900', primary: 'text-emerald-700', accent: 'bg-emerald-100' },
  purple: { bg: 'bg-fuchsia-50', sidebar: 'bg-purple-700', text: 'text-slate-900', primary: 'text-purple-700', accent: 'bg-purple-100' },
  dark: { bg: 'bg-gray-900', sidebar: 'bg-gray-800', text: 'text-gray-100', primary: 'text-blue-400', accent: 'bg-gray-700' },
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const profile = useLiveQuery(() => db.settings.get(1));
  
  // Safe Fallback for Theme
  const currentTheme = themes[profile?.theme || 'blue'] || themes.blue;
  const isDark = profile?.theme === 'dark';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'New Bill', path: '/billing', icon: ShoppingCart },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Parties', path: '/parties', icon: Users },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    document.body.className = currentTheme.bg + (isDark ? ' text-white' : ' text-slate-900');
  }, [currentTheme, isDark]);

  return (
    <div className={clsx("min-h-screen flex flex-col transition-all duration-500", currentTheme.bg)}>
      <header className={clsx(currentTheme.sidebar, "text-white shadow-2xl sticky top-0 z-50 transition-colors duration-300")}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-3">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-none">{profile?.companyName || 'GOPI DISTRIBUTORS'}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Wholesale Engine</span>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300',
                    isActive(item.path)
                      ? 'bg-white text-blue-600 shadow-2xl scale-105'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10 p-3 rounded-2xl transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-2xl border-t border-white/10 p-4 space-y-2 animate-in slide-in-from-top-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest',
                    isActive(item.path)
                      ? 'bg-white text-blue-600 shadow-xl'
                      : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in zoom-in-95 duration-700">
        {children}
      </main>

      <footer className={clsx("py-12 mt-auto transition-colors duration-300", isDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-slate-100')}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             System Operational & Secure
          </div>
          <p className={clsx("text-sm font-black tracking-tight", isDark ? 'text-blue-400' : 'text-blue-600')}>
            CREATED BY YASH K PATHAK
          </p>
          <p className={clsx("text-xs font-bold mt-2 opacity-50", isDark ? 'text-gray-400' : 'text-slate-500')}>
            &copy; {new Date().getFullYear()} {profile?.companyName || 'Gopi Distributors'} • PRO EDITION
          </p>
        </div>
      </footer>
    </div>
  );
};
