'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCcw, Search, Users2, AlertCircle } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  patientId: string;
  prescriberId: string;
  status: string;
  kanbanColumn: 'new' | 'in-progress' | 'waiting-response' | 'resolved';
  lastMessage: string;
  lastMessageAt: string | Date;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  metadata: {
    patientName?: string;
    patientAvatar?: string | null;
    prescriberName?: string;
  };
}

const columnLabels: Record<Conversation['kanbanColumn'], string> = {
  new: 'Nova',
  'in-progress': 'Em atendimento',
  'waiting-response': 'Aguardando',
  resolved: 'Resolvida',
};

export default function PrescriberChatPage() {
  const { firebaseUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const fetchConversations = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setIsRefreshing(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Não foi possível carregar as conversas');
      }

      const data = await response.json();
      const formatted = (data.conversations as Conversation[]).map((conversation) => ({
        ...conversation,
        lastMessageAt: conversation.lastMessageAt || new Date().toISOString(),
      }));

      setConversations(formatted);
      if (!selectedConversationId && formatted.length > 0) {
        setSelectedConversationId(formatted[0].id);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiBaseUrl, firebaseUser, selectedConversationId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((conversation) =>
      conversation.metadata?.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const selectedConversation =
    filteredConversations.find((conv) => conv.id === selectedConversationId) ??
    conversations.find((conv) => conv.id === selectedConversationId) ??
    null;

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const statusColor = (column: Conversation['kanbanColumn']) => {
    switch (column) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700';
      case 'waiting-response':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Conversas</p>
          <h1 className="text-3xl font-bold text-gray-900">Central de atendimento</h1>
          <p className="text-gray-600 mt-1">Envie e receba mensagens diretamente pelo dashboard.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConversations} disabled={isRefreshing}>
            <RefreshCcw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <Card className="h-[calc(100vh-15rem)]">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar paciente"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">Carregando conversas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-1 items-center justify-center text-center">
                <div className="space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-sm text-red-600">{error}</p>
                  <Button size="sm" onClick={fetchConversations}>Tentar novamente</Button>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center text-gray-500 text-sm px-8">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {filteredConversations.map((conversation) => {
                  const isActive = conversation.id === selectedConversationId;
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-2xl border transition-all',
                        isActive
                          ? 'border-blue-200 bg-blue-50 shadow-sm'
                          : 'border-gray-100 hover:border-blue-100 hover:bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {conversation.metadata?.patientName || 'Paciente sem nome'}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {conversation.lastMessage || 'Sem mensagens registradas.'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <span className={cn('px-2 py-1 rounded-full font-medium', statusColor(conversation.kanbanColumn))}>
                          {columnLabels[conversation.kanbanColumn]}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                            {conversation.unreadCount} nova(s)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-15rem)]">
          <CardContent className="p-0 h-full">
            {selectedConversation ? (
              <ChatInterface conversationId={selectedConversation.id} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Selecione uma conversa</h3>
                  <p className="text-sm text-gray-500">
                    Escolha um paciente na lista para ver o histórico e responder por aqui.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users2 className="w-4 h-4" />
                  {conversations.length > 0
                    ? `${conversations.length} pacientes em acompanhamento`
                    : 'Nenhuma conversa ativa'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
