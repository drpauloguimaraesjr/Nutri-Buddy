'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  placeholder = 'Digite sua mensagem...',
  disabled = false,
  maxLength = 1000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSend(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        {/* Attach button (future feature) */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          disabled={disabled}
          title="Anexar arquivo (em breve)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            maxLength={maxLength}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-20 rounded-xl border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'resize-none overflow-y-auto',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
            style={{ maxHeight: '150px' }}
          />
          
          {/* Character count */}
          {isNearLimit && (
            <span
              className={cn(
                'absolute bottom-2 right-14 text-xs',
                isOverLimit ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>

        {/* Emoji button (future feature) */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          disabled={disabled}
          title="Emoji (em breve)"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled || isOverLimit}
          className={cn(
            'flex-shrink-0 px-4 py-3 rounded-xl',
            'bg-gradient-to-r from-blue-500 to-purple-600',
            'hover:from-blue-600 hover:to-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Hint */}
      <p className="mt-2 text-xs text-gray-400 text-center">
        Pressione Enter para enviar, Shift + Enter para quebra de linha
      </p>
    </div>
  );
}

