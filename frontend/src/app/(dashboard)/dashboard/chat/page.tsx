'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, RefreshCcw, Search, Users2, AlertCircle, Plus, X } from 'lucide-react';
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

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const columnLabels: Record<Conversation['kanbanColumn'], string> = {
  new: 'Nova',
  'in-progress': 'Em atendimento',
  'waiting-response': 'Aguardando',
  resolved: 'Resolvida',
};

export default function PrescriberChatPage() {
  const { firebaseUser } = useAuth();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams?.get('conversationId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

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

  const fetchPatients = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setIsLoadingPatients(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar pacientes');
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [apiBaseUrl, firebaseUser]);

  const handleStartConversation = async (patientId: string) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      // Primeiro, vincular o paciente ao prescritor se ainda não estiver
      await fetch(`${apiBaseUrl}/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriberId: firebaseUser.uid,
        }),
      });

      // Criar ou buscar conversa
      const response = await fetch(`${apiBaseUrl}/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriberId: firebaseUser.uid,
          initialMessage: 'Olá! Como posso ajudar?',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar conversa');
      }

      const data = await response.json();
      setSelectedConversationId(data.conversation.id);
      setShowPatientModal(false);
      fetchConversations();
    } catch (err) {
      console.error('Erro ao iniciar conversa:', err);
      alert('Erro ao iniciar conversa. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Selecionar conversa da URL
  useEffect(() => {
    if (conversationIdFromUrl && !selectedConversationId) {
      console.log('🔗 Selecionando conversa da URL:', conversationIdFromUrl);
      setSelectedConversationId(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, selectedConversationId]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((conversation) =>
      conversation.metadata?.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm) return patients;
    return patients.filter((patient) =>
      patient.name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(patientSearchTerm.toLowerCase())
    );
  }, [patients, patientSearchTerm]);

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
        return 'bg-gray-100 text-high-contrast-muted';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <motion.div
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-fluid-sm uppercase tracking-wide text-high-contrast-muted">Conversas</p>
            <h1 className="text-fluid-3xl font-bold text-high-contrast">Central de atendimento</h1>
            <p className="text-high-contrast-muted mt-1">Envie e receba mensagens diretamente pelo dashboard.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                setShowPatientModal(true);
                fetchPatients();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova conversa
            </Button>
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
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-fluid-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                    <p className="text-fluid-sm text-high-contrast-muted">Carregando conversas...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-1 items-center justify-center text-center">
                  <div className="space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-fluid-sm text-red-600">{error}</p>
                    <Button size="sm" onClick={fetchConversations}>Tentar novamente</Button>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-high-contrast-muted text-fluid-sm px-8">
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
                            <p className="font-semibold text-high-contrast">
                              {conversation.metadata?.patientName || 'Paciente sem nome'}
                            </p>
                            <p className="text-fluid-sm text-high-contrast-muted line-clamp-2">
                              {conversation.lastMessage || 'Sem mensagens registradas.'}
                            </p>
                          </div>
                          <div className="text-fluid-xs text-gray-400 whitespace-nowrap">
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
                    <h3 className="text-fluid-lg font-semibold text-high-contrast">Selecione uma conversa</h3>
                    <p className="text-fluid-sm text-high-contrast-muted">
                      Escolha um paciente na lista para ver o histórico e responder por aqui.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-fluid-sm text-high-contrast-muted">
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

      {/* Modal de Seleção de Pacientes */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Iniciar nova conversa</h2>
                  <p className="text-sm text-gray-600 mt-1">Selecione um paciente para começar</p>
                </div>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    placeholder="Buscar por nome ou email"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingPatients ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                      <p className="text-sm text-gray-600">Carregando pacientes...</p>
                    </div>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum paciente encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleStartConversation(patient.id)}
                        className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                            {patient.phone && (
                              <p className="text-xs text-gray-500 mt-1">{patient.phone}</p>
                            )}
                          </div>
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
