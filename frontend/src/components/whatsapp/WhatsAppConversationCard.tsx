'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { WhatsAppConversation } from '@/types';

interface WhatsAppConversationCardProps {
  conversation: WhatsAppConversation;
  onClick: () => void;
}

const WhatsAppConversationCard = ({ conversation, onClick }: WhatsAppConversationCardProps) => {
  const { patientName, score, lastMessage, lastMessageAt, unreadCount } = conversation;

  // Badge icons mapping
  const badgeIcons: Record<string, { icon: JSX.Element; label: string }> = {
    champion: { icon: <span className="text-lg">🏆</span>, label: 'Campeão' },
    streak_7: { icon: <span className="text-lg">🔥</span>, label: '7 dias' },
    streak_30: { icon: <span className="text-lg">💪</span>, label: '30 dias' },
    star_50: { icon: <span className="text-lg">⭐</span>, label: '50 refeições' },
    focused_90: { icon: <span className="text-lg">🎯</span>, label: '90% aderência' },
    top_3: { icon: <span className="text-lg">👑</span>, label: 'Top 3' },
  };

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatLastMessageTime = () => {
    if (!lastMessageAt) return 'Sem mensagens';
    
    try {
      return formatDistanceToNow(lastMessageAt, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  const adherenceText = score.adherencePercentage >= 80 
    ? '✅ Excelente' 
    : score.adherencePercentage >= 60 
    ? '👍 Boa' 
    : score.adherencePercentage >= 40 
    ? '⚠️ Regular' 
    : '🚨 Baixa';

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-purple-300"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header com nome e score */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg truncate">
              {patientName}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatLastMessageTime()}
            </p>
          </div>
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${getScoreColor(score.totalScore)} font-bold text-lg ml-2`}>
            {score.totalScore}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-600">Refeições</p>
            <p className="font-bold text-gray-900">
              {score.correctMeals}/{score.mealsLogged}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-600">Aderência</p>
            <p className="font-bold text-gray-900">{adherenceText}</p>
          </div>
        </div>

        {/* Última mensagem */}
        {lastMessage && (
          <div className="rounded-lg bg-gray-100 px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {lastMessage.senderType === 'patient' ? 'Paciente' : 'Sistema'}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {lastMessage.content}
            </p>
          </div>
        )}

        {/* Badges */}
        {score.badges && score.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200">
            {score.badges.slice(0, 4).map((badge) => {
              const badgeInfo = badgeIcons[badge];
              return badgeInfo ? (
                <div
                  key={badge}
                  className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200"
                  title={badgeInfo.label}
                >
                  {badgeInfo.icon}
                </div>
              ) : null;
            })}
            {score.badges.length > 4 && (
              <div className="flex items-center justify-center rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                +{score.badges.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Sequência de dias */}
        {score.consecutiveDays > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 border border-orange-200">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">
              {score.consecutiveDays} {score.consecutiveDays === 1 ? 'dia' : 'dias'} de sequência
            </span>
          </div>
        )}

        {/* Badge de mensagens não lidas */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-center rounded-full bg-red-500 px-3 py-1">
            <span className="text-xs font-bold text-white">
              {unreadCount} {unreadCount === 1 ? 'nova mensagem' : 'novas mensagens'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConversationCard;

