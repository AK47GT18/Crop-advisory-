"use client"
import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-emerald-500 p-3 rounded-lg text-white">
        <Leaf size={24} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
        AgriSmart
      </h1>
    </div>
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse"></div>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
      Sowing seeds of intelligence...
    </p>
  </div>
);

export default LoadingScreen;