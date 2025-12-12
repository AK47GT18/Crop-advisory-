import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({ 
  children,
  variant = "primary",
  className = "",
  onClick,
  icon: Icon
}: ButtonProps) => {
  const baseStyle = "flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30",
    secondary: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600",
    outline: "border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={20} className="mr-2" />}
      {children}
    </button>
  );
};
export default Button;