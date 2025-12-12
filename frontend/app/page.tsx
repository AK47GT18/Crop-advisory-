"use client"

import React, { useState, useEffect } from 'react';
import { 
  Home,
  Sprout,
  Bug,
  CloudSun,
  Activity,
} from 'lucide-react';

import { NavItem } from '@/types';
import Header from './components/layout/Header';
import BottomNav from './components/layout/Bottom';
import SideNav from './components/layout/SideNav';
import Dashboard from './views/Dashboard';
import Advisory from './views/Advisory';
import PestDoctor from './views/PestDoctor';
import Weather from './views/Weather';
import Market from './views/Market';
import LoadingScreen from './components/ui/LoadingScreen';
import useDarkMode from '../hooks/userDarkMode';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, toggle] = useDarkMode();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'advisory', icon: Sprout, label: 'Advisory' },
    { id: 'pest', icon: Bug, label: 'Doctor' },
    { id: 'weather', icon: CloudSun, label: 'Weather' },
    
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen font-sans bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex">
        <SideNav activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header isDarkMode={isDarkMode} toggleTheme={toggle} />
      
          <main className="flex-1 max-w-5xl mx-auto w-full p-4 pb-24 md:p-8">
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'advisory' && <Advisory />}
            {activeTab === 'pest' && <PestDoctor />}
            {activeTab === 'weather' && <Weather />}
            </main>
        </div>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default App;