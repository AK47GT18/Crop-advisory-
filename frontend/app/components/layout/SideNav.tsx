"use client"
import React from 'react';
import { NavItem } from '@/types';

interface SideNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
}

const SideNav: React.FC<SideNavProps> = ({ activeTab, setActiveTab, navItems }) => (
  <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 p-4">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">AgriSmart</h1>
    </div>
    <nav className="flex flex-col gap-2">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === id
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  </aside>
);

export default SideNav;