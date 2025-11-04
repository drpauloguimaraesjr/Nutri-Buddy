'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }
>(({ className, hover = true, children, ...props }, ref) => {
  // Filtrar props que conflitam com Framer Motion
  const {
    onDrag, onDragStart, onDragEnd,
    onAnimationStart, onAnimationEnd, onAnimationIteration,
    ...htmlProps
  } = props as React.HTMLAttributes<HTMLDivElement>;
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        'glass-card p-6 relative overflow-hidden',
        hover && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      {...htmlProps}
    >
      {children}
    </motion.div>
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-none tracking-tight text-gray-900',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Glass Card with gradient border
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }
>(({ className, hover = true, children, ...props }, ref) => {
  // Filtrar props que conflitam com Framer Motion
  const {
    onDrag, onDragStart, onDragEnd,
    onAnimationStart, onAnimationEnd, onAnimationIteration,
    ...htmlProps
  } = props as React.HTMLAttributes<HTMLDivElement>;
  
  return (
    <motion.div
      ref={ref}
      className={cn('gradient-border p-6 relative overflow-hidden', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      {...htmlProps}
    >
      {children}
    </motion.div>
  );
});
GlassCard.displayName = 'GlassCard';

// Stats Card for dashboard metrics
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
  }
>(({ className, title, value, icon, trend, trendValue, ...props }, ref) => (
  <Card ref={ref} className={cn('', className)} {...props}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trendValue && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-sm font-medium',
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          </div>
        )}
      </div>
      {icon && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          {icon}
        </div>
      )}
    </div>
  </Card>
));
StatsCard.displayName = 'StatsCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  GlassCard,
  StatsCard,
};
