"use client"
import React, { useState, useEffect, ReactNode, ElementType } from 'react';
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
  Send
} from 'lucide-react';
interface BadgeProps {
  children: ReactNode;
  color?: 'green' | 'blue' | 'red' | 'yellow';
}

const Badge: React.FC<BadgeProps> = ({ children, color = "green" }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    blue: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
};
export default Badge;
