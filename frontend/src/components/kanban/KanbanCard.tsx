'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  patientName: string;
  patientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  onClick: () => void;
}

export const KanbanCard = memo(function KanbanCard({
  patientName,
  patientAvatar,
  lastMessage,
  lastMessageAt,
  unreadCount,
  priority,
  tags = [],
  onClick,
}: KanbanCardProps) {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  const priorityIcons = {
    low: null,
    medium: Clock,
    high: AlertCircle,
  };

  const PriorityIcon = priorityIcons[priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border border-gray-200',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-blue-300',
        'group'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Avatar e Nome */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full',
              'bg-gradient-to-br from-blue-500 to-purple-600',
              'flex items-center justify-center text-white font-semibold'
            )}
          >
            {patientAvatar ? (
              <Image 
                src={patientAvatar} 
                alt={patientName} 
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-sm">{patientName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {patientName}
            </h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(lastMessageAt)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1">
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
              {unreadCount}
            </span>
          )}
          
          {PriorityIcon && (
            <div className={cn('p-1 rounded-full', priorityColors[priority])}>
              <PriorityIcon className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Last Message */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {lastMessage}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MessageCircle className="w-3 h-3" />
          <span>Responder</span>
        </div>
        
        <div className={cn(
          'px-2 py-0.5 rounded text-[10px] font-medium',
          priorityColors[priority]
        )}>
          {priority === 'high' && 'Urgente'}
          {priority === 'medium' && 'Normal'}
          {priority === 'low' && 'Baixa'}
        </div>
      </div>
    </motion.div>
  );
});

