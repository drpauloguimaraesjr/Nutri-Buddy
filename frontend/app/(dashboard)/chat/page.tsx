'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Loader2, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatEmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mock userId - substituir com auth real
  const userId = 'user123';

  // Scroll to bottom quando novas mensagens chegam
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch sugestões
  const { data: suggestions } = useQuery({
    queryKey: ['chat-suggestions', userId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/chat/suggestions?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      return data.suggestions || [];
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('http://localhost:3000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message,
          conversationId
        })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onMutate: (message) => {
      // Adicionar mensagem do usuário imediatamente
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
    },
    onSuccess: (data) => {
      // Adicionar resposta da IA
      if (data.success) {
        const botMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Atualizar conversationId se for nova conversa
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      // Adicionar mensagem de erro
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessageMutation.mutate(suggestion);
  };

  // Sugestões default
  const defaultSuggestions = [
    'Como posso melhorar minha alimentação?',
    'Qual é o melhor horário para treinar?',
    'Me ajude a criar um plano de refeições',
    'Como calcular minhas calorias diárias?',
  ];

  const displaySuggestions = suggestions && suggestions.length > 0 
    ? suggestions 
    : defaultSuggestions;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 ? (
            // Empty State - OpenAI Style
            <ChatEmptyState
              title="Como posso ajudá-lo hoje?"
              suggestions={displaySuggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            // Messages
            <div className="py-8 space-y-6">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        msg.role === 'user' 
                          ? "bg-secondary" 
                          : "bg-primary"
                      )}>
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4 text-foreground" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {msg.role === 'user' ? 'Você' : 'NutriBot'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {sendMessageMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">NutriBot</span>
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Envie uma mensagem..."
              disabled={sendMessageMutation.isPending}
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-12 bg-secondary border border-border rounded-lg",
                "text-foreground text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "resize-none transition-all duration-150",
                "min-h-[44px] max-h-[200px]"
              )}
              style={{
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "p-2 rounded-md transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                inputMessage.trim() && !sendMessageMutation.isPending
                  ? "bg-primary text-white hover:opacity-90"
                  : "text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              O NutriBot pode cometer erros. Considere verificar informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
