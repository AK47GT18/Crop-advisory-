"use client"
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, navItems }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
    <div className="max-w-5xl mx-auto px-4 h-16 flex justify-around items-center">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button 
          key={id} 
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors duration-200 ${activeTab === id ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}
        >
          <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
          <span className={`text-xs font-medium ${activeTab === id ? 'font-bold' : ''}`}>{label}</span>
        </button>
      ))}
    </div>
  </nav>
);

export default BottomNav;