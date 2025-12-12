"use client"
import React, { useState } from 'react';
import { 
  Leaf, 
  CloudSun, 
  Bug, 
  Thermometer, 
  Droplets, 
  Sprout, 
  Sun, 
  Moon, 
  Menu, 
  Home,
  Activity,
  ChevronRight,
  Wind,
  MapPin,
  Camera,
  Send,
  Globe,
  Check
} from 'lucide-react';
interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const [language, setLanguage] = useState('English');

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 md:hidden">
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
          AgriSmart
        </h1>
      </div>
      <div className="hidden md:block" />
      
      <div className="flex items-center gap-2">
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
            <Globe size={20} />
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <button onClick={() => setLanguage('English')} className="w-full text-left flex justify-between items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              English
              {language === 'English' && <Check size={16} className="text-emerald-500" />}
            </button>
            <button onClick={() => setLanguage('Chichewa')} className="w-full text-left flex justify-between items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              Chichewa
              {language === 'Chichewa' && <Check size={16} className="text-emerald-500" />}
            </button>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  </header>
  );
};
export default Header;