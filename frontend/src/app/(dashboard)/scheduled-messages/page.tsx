'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Clock, Trash2, Plus, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduledMessage {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  templateId: string | null;
  message: string;
  scheduledFor: Date;
  channel: 'whatsapp' | 'internal' | 'both';
  repeat: 'once' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt: Date | null;
  error: string | null;
  createdAt: Date;
}

interface Template {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  description: string;
}

export default function ScheduledMessagesPage() {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Buscar mensagens agendadas
  useEffect(() => {
    if (!firebaseUser) return;

    const fetchMessages = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const statusFilter = filter !== 'all' ? `?status=${filter}` : '';
        const response = await fetch(
          `${apiBaseUrl}/api/scheduled-messages${statusFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(
            data.scheduledMessages.map((msg: Partial<ScheduledMessage> & { scheduledFor: string; sentAt?: string; createdAt: string }) => ({
              ...msg,
              scheduledFor: new Date(msg.scheduledFor),
              sentAt: msg.sentAt ? new Date(msg.sentAt) : null,
              createdAt: new Date(msg.createdAt),
            })) as ScheduledMessage[]
          );
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [firebaseUser, filter, apiBaseUrl]);

  // Buscar templates
  useEffect(() => {
    if (!firebaseUser) return;

    const fetchTemplates = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/scheduled-messages/templates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Erro ao buscar templates:', error);
      }
    };

    fetchTemplates();
  }, [firebaseUser, apiBaseUrl]);

  const deleteMessage = async (id: string) => {
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/scheduled-messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Erro ao cancelar mensagem:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sent: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels = {
      pending: 'Pendente',
      sent: 'Enviada',
      failed: 'Falhou',
      cancelled: 'Cancelada',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getChannelIcon = (channel: string) => {
    if (channel === 'whatsapp') return '📱 WhatsApp';
    if (channel === 'internal') return '💬 Chat';
    return '📱💬 Ambos';
  };

  const getRepeatLabel = (repeat: string) => {
    const labels = {
      once: 'Uma vez',
      daily: 'Todo dia',
      weekly: 'Toda semana',
      monthly: 'Todo mês',
    };
    return labels[repeat as keyof typeof labels] || repeat;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens Agendadas</h1>
          <p className="text-gray-600 mt-1">
            Agende lembretes e mensagens automáticas para seus pacientes
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agendar Mensagem
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'pending', 'sent', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'pending' | 'sent' | 'failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'sent' ? 'Enviadas' : 'Falhadas'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {messages.filter((m) => m.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Enviadas</p>
          <p className="text-2xl font-bold text-green-600">
            {messages.filter((m) => m.status === 'sent').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Falhadas</p>
          <p className="text-2xl font-bold text-red-600">
            {messages.filter((m) => m.status === 'failed').length}
          </p>
        </Card>
      </div>

      {/* Lista de mensagens */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma mensagem agendada
            </h3>
            <p className="text-gray-600 mb-4">
              Clique em &quot;Agendar Mensagem&quot; para criar sua primeira mensagem automática
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Mensagem
            </Button>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{message.patientName}</h3>
                    {getStatusBadge(message.status)}
                    <span className="text-sm text-gray-500">{getChannelIcon(message.channel)}</span>
                  </div>

                  {/* Mensagem */}
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{message.message}</p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(message.scheduledFor)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getRepeatLabel(message.repeat)}</span>
                    </div>
                    {message.sentAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Send className="h-4 w-4" />
                        <span>Enviada em {formatDateTime(message.sentAt)}</span>
                      </div>
                    )}
                    {message.error && (
                      <div className="text-red-600 text-xs">Erro: {message.error}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {message.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMessage(message.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Criar Mensagem */}
      {showCreateModal && (
        <CreateMessageModal
          onClose={() => setShowCreateModal(false)}
          templates={templates}
        />
      )}
    </motion.div>
  );
}

// Component auxiliar para o modal (simplificado - você pode expandir)
function CreateMessageModal({
  onClose,
  templates,
}: {
  onClose: () => void;
  templates: Template[];
}) {
  // Templates será usado quando implementarmos o formulário completo
  console.log('Templates disponíveis:', templates.length);
  
  return (
    <Modal isOpen onClose={onClose} title="Agendar Nova Mensagem">
      <div className="p-6 space-y-4">
        <p className="text-gray-600">
          🚧 Formulário em desenvolvimento
        </p>
        <p className="text-sm text-gray-500">
          Por enquanto, use os endpoints REST para criar mensagens agendadas.
          Consulte a documentação em <code className="bg-gray-100 px-1 rounded">INTEGRACAO-WHATSAPP-CHAT-COMPLETA.md</code>
        </p>
        {templates.length > 0 && (
          <p className="text-xs text-purple-600">
            {templates.length} template(s) disponível(is)
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

