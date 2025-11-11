'use client';

import { useState } from 'react';
import { MessageCircle, TrendingUp, Award, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { WhatsAppConversation } from '@/types';
import WhatsAppConversationCard from './WhatsAppConversationCard';

interface WhatsAppKanbanBoardProps {
  conversations: WhatsAppConversation[];
  onConversationClick: (conversation: WhatsAppConversation) => void;
}

const WhatsAppKanbanBoard = ({ conversations, onConversationClick }: WhatsAppKanbanBoardProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  // Categorizar conversas por aderência (score)
  const highAdherence = conversations.filter(c => c.score.totalScore >= 80);
  const goodAdherence = conversations.filter(c => c.score.totalScore >= 60 && c.score.totalScore < 80);
  const needsAttention = conversations.filter(c => c.score.totalScore >= 40 && c.score.totalScore < 60);
  const urgent = conversations.filter(c => c.score.totalScore < 40);

  const columns = [
    {
      id: 'high',
      title: 'Alta Aderência',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      conversations: highAdherence,
      emoji: '🔥',
    },
    {
      id: 'good',
      title: 'Aderência Boa',
      icon: CheckCircle2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      conversations: goodAdherence,
      emoji: '✅',
    },
    {
      id: 'attention',
      title: 'Precisa Atenção',
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      conversations: needsAttention,
      emoji: '⚠️',
    },
    {
      id: 'urgent',
      title: 'Urgente',
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      conversations: urgent,
      emoji: '🚨',
    },
  ];

  const totalConversations = conversations.length;
  const averageScore = totalConversations > 0
    ? Math.round(conversations.reduce((sum, c) => sum + c.score.totalScore, 0) / totalConversations)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
              <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Score Médio</p>
              <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Alta Aderência</p>
              <p className="text-2xl font-bold text-gray-900">{highAdherence.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Precisam Atenção</p>
              <p className="text-2xl font-bold text-gray-900">{urgent.length + needsAttention.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board Horizontal */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: 'fit-content' }}>
          {columns.map((column) => {
            const Icon = column.icon;
            
            return (
              <div
                key={column.id}
                className="flex-shrink-0"
                style={{ width: '340px' }}
              >
                <Card className={`h-full border-2 ${column.borderColor}`}>
                  <CardContent className="p-0">
                    {/* Column Header */}
                    <div className={`${column.bgColor} px-4 py-3 border-b-2 ${column.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{column.emoji}</span>
                          <h3 className={`font-bold ${column.textColor}`}>
                            {column.title}
                          </h3>
                        </div>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${column.color} text-white text-sm font-bold`}>
                          {column.conversations.length}
                        </div>
                      </div>
                    </div>

                    {/* Column Content - Scrollable */}
                    <div className="space-y-3 p-3 overflow-y-auto" style={{ maxHeight: '600px' }}>
                      {column.conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Icon className={`h-12 w-12 ${column.textColor} opacity-40 mb-2`} />
                          <p className="text-sm text-gray-500">
                            Nenhuma conversa nesta categoria
                          </p>
                        </div>
                      ) : (
                        column.conversations
                          .sort((a, b) => {
                            // Ordenar por score decrescente
                            return b.score.totalScore - a.score.totalScore;
                          })
                          .map((conversation) => (
                            <WhatsAppConversationCard
                              key={conversation.id}
                              conversation={conversation}
                              onClick={() => onConversationClick(conversation)}
                            />
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda de Badges */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Sistema de Badges e Conquistas</h4>
          </div>
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="text-gray-600"><strong>Campeão:</strong> 100% de aderência por 1 semana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-gray-600"><strong>Sequência:</strong> 7+ dias consecutivos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-gray-600"><strong>Estrela:</strong> 50+ refeições registradas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💪</span>
              <span className="text-gray-600"><strong>Dedicado:</strong> 30 dias seguindo o plano</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-gray-600"><strong>Focado:</strong> 90%+ de aderência</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span className="text-gray-600"><strong>Rei/Rainha:</strong> Top 3 do mês</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppKanbanBoard;

