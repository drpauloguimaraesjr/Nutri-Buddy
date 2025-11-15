'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, MessageCircle, ArrowDown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface MessageAttachment {
  url?: string;
  storagePath?: string;
  contentType?: string;
  name?: string;
  size?: number;
  type?: 'image' | 'audio' | 'file';
  urlExpiresAt?: Date;
}

type RawMessage = Omit<Message, 'createdAt' | 'attachments'> & {
  createdAt: string | Date;
  attachments?: (MessageAttachment & {
    urlExpiresAt?: string | Date;
  })[];
};

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'patient' | 'prescriber' | 'system';
  content: string;
  type: 'text' | 'image' | 'audio' | 'file' | 'system' | 'ai-response';
  status: 'sent' | 'delivered' | 'read';
  isAiGenerated: boolean;
  createdAt: Date;
  attachments?: MessageAttachment[];
}

interface Conversation {
  id: string;
  patientId: string;
  prescriberId: string;
  lastMessage: string;
  lastMessageAt: Date;
  metadata: {
    patientName: string;
    prescriberName: string;
  };
}

interface ChatInterfaceProps {
  conversationId?: string;
  prescriberId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatInterface({
  conversationId: initialConversationId,
  prescriberId,
  onConversationCreated,
}: ChatInterfaceProps) {
  const { firebaseUser } = useAuth();
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const normalizeMessage = (rawMessage: RawMessage): Message => ({
    ...rawMessage,
    createdAt: rawMessage?.createdAt
      ? new Date(rawMessage.createdAt)
      : new Date(),
    attachments: Array.isArray(rawMessage?.attachments)
      ? rawMessage.attachments.map((attachment) => ({
          ...attachment,
          urlExpiresAt: attachment?.urlExpiresAt
            ? new Date(attachment.urlExpiresAt)
            : undefined,
        }))
      : [],
  });

  // Scroll para o final
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Detectar se precisa mostrar botão de scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
  };

  // Buscar ou criar conversa
  useEffect(() => {
    const initConversation = async () => {
      if (!firebaseUser || (!conversationId && !prescriberId)) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await firebaseUser.getIdToken();

        if (conversationId) {
          // Buscar conversa existente
          const response = await fetch(
            `${apiBaseUrl}/api/messages/conversations/${conversationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Erro ao carregar conversa');
          }

          const data = await response.json();
          setConversation(data.conversation);
        } else if (prescriberId) {
          // Criar nova conversa
          const response = await fetch(`${apiBaseUrl}/api/messages/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              prescriberId,
              initialMessage: 'Olá! Gostaria de tirar algumas dúvidas.',
            }),
          });

          if (!response.ok) {
            throw new Error('Erro ao criar conversa');
          }

          const data = await response.json();
          setConversation(data.conversation);
          setConversationId(data.conversation.id);
          onConversationCreated?.(data.conversation.id);
        }
      } catch (err) {
        console.error('Erro ao inicializar conversa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [conversationId, prescriberId, firebaseUser, apiBaseUrl, onConversationCreated]);

  // Buscar mensagens
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId || !firebaseUser) return;

      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(
          `${apiBaseUrl}/api/messages/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao carregar mensagens');
        }

        const data = await response.json();
        const formattedMessages = (data.messages as RawMessage[]).map((msg) =>
          normalizeMessage(msg)
        );

        setMessages(formattedMessages);
        
        // Scroll para o final após carregar
        setTimeout(() => scrollToBottom(false), 100);
      } catch (err) {
        console.error('Erro ao buscar mensagens:', err);
      }
    };

    fetchMessages();

    // Polling para novas mensagens (a cada 3 segundos)
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [conversationId, firebaseUser, apiBaseUrl]);

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(
        `${apiBaseUrl}/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            type: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      const newMessage = normalizeMessage(data.message as RawMessage);

      setMessages((prev) => [...prev, newMessage]);
      
      // Scroll para o final
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      throw err;
    }
  };

  const handleSendMedia = async (file: File, mediaType: 'image' | 'audio') => {
    if (!conversationId || !firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await fetch(
        `${apiBaseUrl}/api/messages/conversations/${conversationId}/attachments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao enviar mídia');
      }

      const data = await response.json();
      const newMessage = normalizeMessage(data.message as RawMessage);

      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">Carregando conversa...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar chat</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!conversationId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhuma conversa selecionada
          </h3>
          <p className="text-gray-600">
            Selecione uma conversa ou inicie uma nova para começar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold">
            {conversation?.metadata.prescriberName?.charAt(0).toUpperCase() || 'N'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation?.metadata.prescriberName || 'Nutricionista'}
            </h3>
            <p className="text-sm text-gray-500">
              {messages.length > 0 ? 'Online' : 'Disponível'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Envie sua primeira mensagem para começar a conversa
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                senderRole={message.senderRole}
                isOwn={message.senderId === firebaseUser?.uid}
                createdAt={message.createdAt}
                status={message.status}
                isAiGenerated={message.isAiGenerated}
                senderName={
                  message.senderId === firebaseUser?.uid
                    ? 'Você'
                    : conversation?.metadata.prescriberName
                }
                type={message.type}
                attachments={message.attachments}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 right-8"
          >
            <button
              onClick={() => scrollToBottom(true)}
              className={cn(
                'p-3 rounded-full shadow-lg',
                'bg-white border border-gray-200',
                'hover:bg-gray-50 transition-colors'
              )}
            >
              <ArrowDown className="w-5 h-5 text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} onSendMedia={handleSendMedia} />
    </Card>
  );
}

