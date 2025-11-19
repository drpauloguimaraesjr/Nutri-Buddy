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
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0';
  
  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 focus:ring-primary-500 shadow-lg shadow-primary-500/30 hover:shadow-glow',
    outline: 'border-2 border-white/20 text-foreground hover:bg-white/5 hover:border-primary-500/50 focus:ring-primary-500',
    ghost: 'text-foreground hover:bg-white/5 hover:text-white focus:ring-primary-500',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 focus:ring-red-500 shadow-lg shadow-red-500/30',
    success: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-400 hover:to-secondary-500 focus:ring-secondary-500 shadow-lg shadow-secondary-500/30',
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

