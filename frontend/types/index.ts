import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'yellow';
}

export interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}