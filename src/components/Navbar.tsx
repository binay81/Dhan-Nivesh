import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  LayoutDashboard,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { userData, isDemoMode, isLocalMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulator', label: 'Simulator', icon: TrendingUp },
    { id: 'learning', label: 'Learn', icon: BookOpen },
    { id: 'ai', label: 'AI Guide', icon: Sparkles },
    { id: 'plans', label: 'Plans', icon: CreditCard },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 brand-gradient text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <span className="font-black text-sm tracking-tight uppercase italic">Dhan Nivesh</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Slide-out Nav */}
      <div className={cn(
        "lg:hidden fixed top-14 left-0 bottom-0 w-64 brand-gradient text-white z-50 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all",
                activeTab === tab.id 
                  ? "bg-white/15 border-l-4 border-brand-accent text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn(
                "w-5 h-5",
                activeTab === tab.id ? "text-brand-accent" : "text-white/40"
              )} />
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {isDemoMode ? 'Demo Mode' : isLocalMode ? 'Local Mode' : 'Live Status'}
              </p>
            </div>
            <p className="font-bold text-xs">Risk: <span className="capitalize text-brand-accent">{userData?.riskProfile || 'moderate'}</span></p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-68 brand-gradient text-white flex-col justify-between py-8 fixed h-full left-0 top-0 z-50">
        <div className="px-6">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase italic leading-none">
              Dhan<br /><span className="text-brand-accent">Nivesh</span>
            </h1>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl flex items-center space-x-3 transition-all group relative",
                  activeTab === tab.id 
                    ? "bg-white/10 border-l-4 border-brand-accent shadow-inner text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className={cn(
                  "w-5 h-5",
                  activeTab === tab.id ? "text-brand-accent" : "text-white/40 group-hover:text-white/80"
                )} />
                <span className="text-sm font-bold tracking-wide">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6">
          <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {isDemoMode ? 'Demo Mode' : isLocalMode ? 'Local Mode' : 'Live Status'}
              </p>
            </div>
            <p className="font-bold text-sm mb-1">Risk Profile: <span className="capitalize text-brand-accent">{userData?.riskProfile || 'moderate'}</span></p>
            <p className="text-[10px] text-white/50 italic leading-tight">"Safe, Steady, Smart investing for your future."</p>
          </div>
        </div>
      </aside>
    </>
  );
}
