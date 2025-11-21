'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Inbox, TrendingUp, Users } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'chat'>('kanban');

  const handleCardClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setView('chat');
  };

  const handleBackToKanban = () => {
    setView('kanban');
    setSelectedConversationId(null);
  };

  const stats = [
    {
      title: 'Total de Conversas',
      value: '24',
      change: '+12%',
      icon: MessageSquare,
      color: 'blue',
    },
    {
      title: 'Novas Hoje',
      value: '5',
      change: '+3',
      icon: Inbox,
      color: 'green',
    },
    {
      title: 'Taxa de Resposta',
      value: '94%',
      change: '+5%',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Pacientes Ativos',
      value: '18',
      change: '+2',
      icon: Users,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-fluid-3xl font-bold text-high-contrast">Mensagens</h1>
          <p className="text-high-contrast-muted">
            Gerencie todas as conversas com seus pacientes
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            onClick={() => setView('kanban')}
          >
            Quadro Kanban
          </Button>
          {selectedConversationId && (
            <Button
              variant={view === 'chat' ? 'default' : 'outline'}
              onClick={() => setView('chat')}
            >
              Conversa
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            yellow: 'bg-yellow-50 text-yellow-600',
          };

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'p-3 rounded-full',
                        colorClasses[stat.color as keyof typeof colorClasses]
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-fluid-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-fluid-sm text-high-contrast-muted">{stat.title}</p>
                    <p className="text-fluid-2xl font-bold text-high-contrast mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-[calc(100vh-20rem)]"
      >
        {view === 'kanban' ? (
          <KanbanBoard onCardClick={handleCardClick} />
        ) : (
          <div className="h-full">
            <div className="mb-4">
              <Button variant="outline" onClick={handleBackToKanban}>
                ← Voltar ao Quadro
              </Button>
            </div>
            {selectedConversationId && (
              <ChatInterface conversationId={selectedConversationId} />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

