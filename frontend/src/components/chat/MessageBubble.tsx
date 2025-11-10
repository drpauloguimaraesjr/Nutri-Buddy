'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, CheckCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  senderRole: 'patient' | 'prescriber' | 'system';
  isOwn: boolean;
  createdAt: Date;
  status?: 'sent' | 'delivered' | 'read';
  isAiGenerated?: boolean;
  senderName?: string;
}

export const MessageBubble = memo(function MessageBubble({
  content,
  senderRole,
  isOwn,
  createdAt,
  status = 'sent',
  isAiGenerated = false,
  senderName,
}: MessageBubbleProps) {
  const isSystem = senderRole === 'system';

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 30,
      },
    },
  };

  if (isSystem) {
    return (
      <motion.div
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center my-4"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
          {isAiGenerated && <Bot className="w-4 h-4 text-blue-500" />}
          <span>{content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex gap-3 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold',
          isOwn
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-green-500 to-teal-600'
        )}
      >
        {isOwn ? (
          <User className="w-4 h-4" />
        ) : senderName ? (
          senderName.charAt(0).toUpperCase()
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && senderName && (
          <span className="text-xs text-gray-500 px-1">{senderName}</span>
        )}

        <div
          className={cn(
            'relative px-4 py-2 rounded-2xl shadow-sm',
            isOwn
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          )}
        >
          {isAiGenerated && (
            <div className="flex items-center gap-1 mb-1 opacity-70">
              <Bot className="w-3 h-3" />
              <span className="text-[10px]">Resposta automática</span>
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>

          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-[10px]',
              isOwn ? 'text-white/70' : 'text-gray-500'
            )}
          >
            <span>{formatTime(createdAt)}</span>
            {isOwn && (
              <>
                {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-200" />}
                {status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                {status === 'sent' && <Check className="w-3 h-3" />}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

