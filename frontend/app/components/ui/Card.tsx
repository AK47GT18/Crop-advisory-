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
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);
export default Card;