import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-dark-2 border-white/10 shadow-xl hover:shadow-glow',
    glass: 'bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl shadow-primary-500/5 hover:bg-white/10',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20 shadow-glow',
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 hover:border-white/20 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

