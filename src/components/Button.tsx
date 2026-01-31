import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
}

export const Button = ({ children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  const baseStyles = variant === 'link'
    ? 'font-medium transition-colors duration-200'
    : 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-cyber-purple to-cyber-magenta text-white shadow-lg shadow-purple-500/20 hover:opacity-90 hover:shadow-purple-500/40',
    secondary: 'bg-white/5 text-cyber-cyan border border-white/10 hover:bg-white/10 hover:border-cyber-cyan/50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    link: 'bg-transparent text-cyber-cyan hover:underline p-0 h-auto',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
