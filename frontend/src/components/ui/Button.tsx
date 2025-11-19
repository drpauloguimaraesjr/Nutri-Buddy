import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]';
  
  const variants = {
    default: 'bg-sky-500 text-white hover:bg-sky-400 focus:ring-sky-500 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/40',
    outline: 'border-2 border-slate-600 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500 focus:ring-sky-500',
    ghost: 'text-slate-300 hover:bg-slate-700/50 hover:text-white focus:ring-sky-500',
    destructive: 'bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 shadow-lg shadow-red-500/30',
    success: 'bg-emerald-500 text-white hover:bg-emerald-400 focus:ring-emerald-500 shadow-lg shadow-emerald-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

