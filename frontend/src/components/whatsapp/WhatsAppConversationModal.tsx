'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WhatsAppConversation, WhatsAppMessage } from '@/types';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsAppConversationModalProps {
  conversation: WhatsAppConversation;
  onClose: () => void;
}

const WhatsAppConversationModal = ({ conversation, onClose }: WhatsAppConversationModalProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMockMessages = useCallback(() => {
    const mockMessages: WhatsAppMessage[] = [
      {
        id: 'm1',
        conversationId: conversation.id,
        patientId: conversation.patientId,
        senderId: conversation.patientId,
        senderName: conversation.patientName,
        senderType: 'patient',
        content: 'Oi! Comecei a seguir o plano alimentar hoje 😊',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        isFromPatient: true,
        sentiment: 'positive',
      },
      {
        id: 'm2',
        conversationId: conversation.id,
        patientId: conversation.patientId,
        senderId: 'system',
        senderName: 'Sistema',
        senderType: 'system',
        content: 'Ótimo! Continue assim. Lembre-se de registrar todas as suas refeições.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5),
        isFromPatient: false,
      },
      {
        id: 'm3',
        conversationId: conversation.id,
        patientId: conversation.patientId,
        senderId: conversation.patientId,
        senderName: conversation.patientName,
        senderType: 'patient',
        content: 'Café da manhã pronto! 🥚🥑',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isFromPatient: true,
        hasImage: true,
        sentiment: 'positive',
      },
      {
        id: 'm4',
        conversationId: conversation.id,
        patientId: conversation.patientId,
        senderId: conversation.patientId,
        senderName: conversation.patientName,
        senderType: 'patient',
        content: conversation.lastMessage?.content || 'Última mensagem',
        timestamp: conversation.lastMessageAt || new Date(),
        isFromPatient: true,
        sentiment: conversation.lastMessage?.sentiment,
      },
    ];

    setMessages(mockMessages);
    setIsLoading(false);
  }, [conversation.id, conversation.patientId, conversation.patientName, conversation.patientPhone, conversation.lastMessage, conversation.lastMessageAt]); // Fechamento do useCallback

  useEffect(() => {
    // Query para buscar mensagens da conversa
    const messagesRef = collection(db, 'whatsappMessages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData: WhatsAppMessage[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            conversationId: data.conversationId,
            patientId: data.patientId,
            senderId: data.senderId,
            senderName: data.senderName,
            senderType: data.senderType,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            isFromPatient: data.isFromPatient,
            hasImage: data.hasImage,
            imageUrl: data.imageUrl,
            sentiment: data.sentiment,
            analyzed: data.analyzed,
          });
        });

        setMessages(messagesData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar mensagens:', error);
        setIsLoading(false);
        
        // TEMPORÁRIO: Mensagens mock para demonstração
        loadMockMessages();
      }
    );

    return () => unsubscribe();
  }, [conversation.id, loadMockMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !user) return;

    try {
      setIsSending(true);

      // Adicionar mensagem ao Firestore
      await addDoc(collection(db, 'whatsappMessages'), {
        conversationId: conversation.id,
        patientId: conversation.patientId,
        senderId: user.uid,
        senderName: user.displayName || 'Prescritor',
        senderType: 'prescriber',
        content: newMessage,
        timestamp: serverTimestamp(),
        isFromPatient: false,
        analyzed: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" title={`Conversa com ${conversation.patientName}`}>
      <div className="flex h-[80vh] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-lg">
              {conversation.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{conversation.patientName}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{conversation.patientPhone}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className={`font-bold ${getScoreColor(conversation.score.totalScore)}`}>
                    Score: {conversation.score.totalScore}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Score Details */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Aderência</p>
              <p className="font-bold text-gray-900">{conversation.score.adherencePercentage}%</p>
            </div>
            <div>
              <p className="text-gray-600">Refeições</p>
              <p className="font-bold text-gray-900">
                {conversation.score.correctMeals}/{conversation.score.mealsLogged}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Sequência</p>
              <p className="font-bold text-gray-900">{conversation.score.consecutiveDays} dias</p>
            </div>
            <div>
              <p className="text-gray-600">Badges</p>
              <p className="font-bold text-gray-900">{conversation.score.badges.length}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Nenhuma mensagem ainda
            </div>
          ) : (
            messages.map((message) => {
              const isFromPatient = message.isFromPatient;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromPatient ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isFromPatient
                        ? 'bg-gray-100 text-gray-900'
                        : message.senderType === 'system'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold opacity-75">
                        {message.senderName}
                      </p>
                      {message.sentiment && (
                        <span className="text-xs">
                          {message.sentiment === 'positive' ? '😊' : message.sentiment === 'negative' ? '😔' : '😐'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.hasImage && (
                      <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                        <ImageIcon className="h-3 w-3" />
                        <span>Imagem anexada</span>
                      </div>
                    )}
                    <p className="mt-1 text-xs opacity-60">
                      {formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="resize-none"
                disabled={isSending}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              isLoading={isSending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            💡 Esta mensagem será enviada via WhatsApp através do sistema N8N
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppConversationModal;

