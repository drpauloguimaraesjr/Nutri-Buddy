'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, CheckCheck, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type AttachmentType = 'image' | 'audio' | 'file';

interface MessageAttachment {
  url?: string;
  storagePath?: string;
  contentType?: string;
  name?: string;
  size?: number;
  type?: AttachmentType;
}

interface MessageBubbleProps {
  content: string;
  senderRole: 'patient' | 'prescriber' | 'system';
  isOwn: boolean;
  createdAt: Date;
  status?: 'sent' | 'delivered' | 'read';
  isAiGenerated?: boolean;
  senderName?: string;
  type?: 'text' | AttachmentType | 'system' | 'ai-response';
  attachments?: MessageAttachment[];
  channel?: 'whatsapp' | 'internal';
  isScheduled?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  content,
  senderRole,
  isOwn,
  createdAt,
  status = 'sent',
  isAiGenerated = false,
  senderName,
  type = 'text',
  attachments = [],
  channel = 'internal',
  isScheduled = false,
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

  const renderAttachment = (attachment: MessageAttachment, index: number) => {
    const attachmentType = attachment.type || (type as AttachmentType);
    const fallbackName = attachment.name || `Arquivo ${index + 1}`;

    if (attachmentType === 'image' && attachment.url) {
      return (
        <img
          src={attachment.url}
          alt={fallbackName}
          className={cn(
            'max-h-64 w-full rounded-xl object-cover border',
            isOwn ? 'border-white/40' : 'border-gray-200'
          )}
        />
      );
    }

    if (attachmentType === 'audio' && attachment.url) {
      return (
        <audio controls className="w-full">
          <source src={attachment.url} type={attachment.contentType || 'audio/webm'} />
          Seu navegador não suporta reprodução de áudio.
        </audio>
      );
    }

    return (
      <a
        href={attachment.url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm',
          'transition-colors',
          attachment.url
            ? 'border-blue-100 bg-blue-50 text-blue-900 hover:bg-blue-100'
            : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <Download className="h-4 w-4" />
        <div className="flex flex-col leading-tight">
          <span className="font-medium">{fallbackName}</span>
          {attachment.size && (
            <span className="text-xs text-gray-500">
              {(attachment.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          )}
        </div>
      </a>
    );
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
          {/* Badges no topo */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isAiGenerated && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                isOwn ? "bg-white/20" : "bg-blue-50 text-blue-600"
              )}>
                <Bot className="w-3 h-3" />
                <span>IA</span>
              </div>
            )}

            {channel === 'whatsapp' && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                isOwn
                  ? "bg-white/20"
                  : "bg-green-50 text-green-600 border border-green-200"
              )}>
                <span>📱</span>
                <span>WhatsApp</span>
              </div>
            )}

            {isScheduled && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                isOwn ? "bg-white/20" : "bg-purple-50 text-purple-600"
              )}>
                <span>⏰</span>
                <span>Agendada</span>
              </div>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap break-words">
            {typeof content === 'string' ? content : JSON.stringify(content)}
          </p>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-3">
              {attachments.map((attachment, index) => (
                <div key={`att-${index}`} className="w-full">
                  {renderAttachment(attachment, index)}
                </div>
              ))}
            </div>
          )}

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

