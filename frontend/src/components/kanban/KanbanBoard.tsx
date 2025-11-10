'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useAuth } from '@/context/AuthContext';

interface Conversation {
  id: string;
  patientId: string;
  prescriberId: string;
  status: string;
  kanbanColumn: 'new' | 'in-progress' | 'waiting-response' | 'resolved';
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  metadata: {
    patientName: string;
    patientAvatar?: string;
  };
}

interface KanbanBoardProps {
  onCardClick: (conversationId: string) => void;
}

export function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  const { firebaseUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Buscar conversas
  useEffect(() => {
    const fetchConversations = async () => {
      if (!firebaseUser) return;

      try {
        setIsLoading(true);
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar conversas');
        }

        const data = await response.json();
        const formattedConversations = data.conversations.map((conv: any) => ({
          ...conv,
          lastMessageAt: new Date(conv.lastMessageAt),
        }));

        setConversations(formattedConversations);
      } catch (err) {
        console.error('Erro ao buscar conversas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Polling a cada 5 segundos
    const interval = setInterval(fetchConversations, 5000);

    return () => clearInterval(interval);
  }, [firebaseUser, apiBaseUrl]);

  // Agrupar conversas por coluna
  const columnData = useMemo(() => {
    const grouped = {
      new: conversations.filter((c) => c.kanbanColumn === 'new'),
      'in-progress': conversations.filter((c) => c.kanbanColumn === 'in-progress'),
      'waiting-response': conversations.filter((c) => c.kanbanColumn === 'waiting-response'),
      resolved: conversations.filter((c) => c.kanbanColumn === 'resolved'),
    };

    return grouped;
  }, [conversations]);

  const handleCardClick = async (conversationId: string, currentColumn: string) => {
    onCardClick(conversationId);

    // Se a conversa está em "new", move automaticamente para "in-progress"
    if (currentColumn === 'new' && firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        await fetch(`${apiBaseUrl}/api/messages/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            kanbanColumn: 'in-progress',
            status: 'active',
          }),
        });

        // Atualizar localmente
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, kanbanColumn: 'in-progress' as const, status: 'active' }
              : conv
          )
        );
      } catch (err) {
        console.error('Erro ao atualizar conversa:', err);
      }
    }
  };

  const handleMoveCard = async (
    conversationId: string,
    newColumn: 'new' | 'in-progress' | 'waiting-response' | 'resolved'
  ) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`${apiBaseUrl}/api/messages/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kanbanColumn: newColumn,
          status: newColumn === 'resolved' ? 'resolved' : 'active',
        }),
      });

      // Atualizar localmente
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                kanbanColumn: newColumn,
                status: newColumn === 'resolved' ? 'resolved' : 'active',
              }
            : conv
        )
      );
    } catch (err) {
      console.error('Erro ao mover card:', err);
    }
  };

  const columns = [
    {
      id: 'new',
      title: 'Novas',
      icon: <Inbox className="w-5 h-5" />,
      color: 'blue',
      count: columnData.new.length,
    },
    {
      id: 'in-progress',
      title: 'Em Atendimento',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'purple',
      count: columnData['in-progress'].length,
    },
    {
      id: 'waiting-response',
      title: 'Aguardando Resposta',
      icon: <Clock className="w-5 h-5" />,
      color: 'yellow',
      count: columnData['waiting-response'].length,
    },
    {
      id: 'resolved',
      title: 'Resolvidas',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'green',
      count: columnData.resolved.length,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-600">Erro: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            count={column.count}
            color={column.color}
            icon={column.icon}
          >
            <AnimatePresence>
              {columnData[column.id as keyof typeof columnData].length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-gray-400 text-sm"
                >
                  Nenhuma conversa
                </motion.div>
              ) : (
                columnData[column.id as keyof typeof columnData].map((conversation) => (
                  <KanbanCard
                    key={conversation.id}
                    id={conversation.id}
                    patientName={conversation.metadata.patientName}
                    patientAvatar={conversation.metadata.patientAvatar}
                    lastMessage={conversation.lastMessage}
                    lastMessageAt={conversation.lastMessageAt}
                    unreadCount={conversation.unreadCount}
                    priority={conversation.priority}
                    tags={conversation.tags}
                    onClick={() => handleCardClick(conversation.id, column.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
}

