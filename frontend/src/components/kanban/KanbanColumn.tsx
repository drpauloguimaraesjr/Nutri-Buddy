'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  icon: ReactNode;
  children: ReactNode;
}

export function KanbanColumn({ title, count, color, icon, children }: KanbanColumnProps) {
  const colorVariants: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
  };

  const iconColorVariants: Record<string, string> = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
  };

  return (
    <motion.div
      layout
      className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200"
    >
      {/* Header */}
      <div className={cn('p-4 rounded-t-xl border-b', colorVariants[color] || colorVariants.blue)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('flex-shrink-0', iconColorVariants[color] || iconColorVariants.blue)}>
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-sm font-semibold',
              'bg-white shadow-sm'
            )}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {children}
      </div>
    </motion.div>
  );
}

