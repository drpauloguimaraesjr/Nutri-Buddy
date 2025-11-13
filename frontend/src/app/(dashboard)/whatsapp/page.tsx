'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WhatsAppConversation } from '@/types';
import WhatsAppKanbanBoard from '@/components/whatsapp/WhatsAppKanbanBoard';
import WhatsAppConversationModal from '@/components/whatsapp/WhatsAppConversationModal';
import { WhatsAppQRCode } from '@/components/whatsapp/WhatsAppQRCode';
import { WhatsAppStatusCard } from '@/components/whatsapp/WhatsAppStatusCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RefreshCw, Loader2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMockMealData, calculatePatientScore } from '@/lib/scoreCalculator';

export default function WhatsAppDashboardPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  // Função para carregar dados mock (desenvolvimento) - MOVIDA PARA ANTES DO useEffect
  const loadMockData = useCallback(() => {
    const mockConversations: WhatsAppConversation[] = [
      {
        id: '1',
        patientId: 'patient1',
        patientName: 'Maria Silva',
        patientPhone: '+5511999998888',
        prescriberId: user?.uid || '',
        status: 'active',
        score: calculatePatientScore({
          patientId: 'patient1',
          meals: generateMockMealData('patient1', 7),
          currentStreak: 7,
          existingBadges: ['streak_7', 'champion'],
        }),
        lastMessage: {
          id: 'msg1',
          conversationId: '1',
          patientId: 'patient1',
          senderId: 'patient1',
          senderName: 'Maria Silva',
          senderType: 'patient',
          content: 'Acabei de fazer o almoço! Frango grelhado com salada 🥗',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
          isFromPatient: true,
          hasImage: true,
          sentiment: 'positive',
        },
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 1,
        totalMessages: 45,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(),
      },
      {
        id: '2',
        patientId: 'patient2',
        patientName: 'João Santos',
        patientPhone: '+5511888887777',
        prescriberId: user?.uid || '',
        status: 'active',
        score: calculatePatientScore({
          patientId: 'patient2',
          meals: generateMockMealData('patient2', 5).map(m => ({
            ...m,
            isCorrect: Math.random() > 0.3, // 70% correto
          })),
          currentStreak: 5,
          existingBadges: ['star_50'],
        }),
        lastMessage: {
          id: 'msg2',
          conversationId: '2',
          patientId: 'patient2',
          senderId: 'system',
          senderName: 'Sistema',
          senderType: 'system',
          content: 'Ótimo trabalho! Você está mantendo uma boa aderência ao plano. Continue assim! 💪',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
          isFromPatient: false,
        },
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 0,
        totalMessages: 62,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        updatedAt: new Date(),
      },
      {
        id: '3',
        patientId: 'patient3',
        patientName: 'Ana Costa',
        patientPhone: '+5511777776666',
        prescriberId: user?.uid || '',
        status: 'needs_attention',
        score: calculatePatientScore({
          patientId: 'patient3',
          meals: generateMockMealData('patient3', 4).map(m => ({
            ...m,
            isCorrect: Math.random() > 0.5, // 50% correto
          })),
          currentStreak: 2,
          existingBadges: [],
        }),
        lastMessage: {
          id: 'msg3',
          conversationId: '3',
          patientId: 'patient3',
          senderId: 'patient3',
          senderName: 'Ana Costa',
          senderType: 'patient',
          content: 'Estou com dificuldade em seguir o plano no fim de semana...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h atrás
          isFromPatient: true,
          sentiment: 'negative',
        },
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        unreadCount: 2,
        totalMessages: 28,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        updatedAt: new Date(),
      },
      {
        id: '4',
        patientId: 'patient4',
        patientName: 'Carlos Pereira',
        patientPhone: '+5511666665555',
        prescriberId: user?.uid || '',
        status: 'urgent',
        score: calculatePatientScore({
          patientId: 'patient4',
          meals: generateMockMealData('patient4', 2).map(m => ({
            ...m,
            isCorrect: Math.random() > 0.7, // 30% correto
          })),
          currentStreak: 0,
          existingBadges: [],
        }),
        lastMessage: {
          id: 'msg4',
          conversationId: '4',
          patientId: 'patient4',
          senderId: 'patient4',
          senderName: 'Carlos Pereira',
          senderType: 'patient',
          content: 'Não consegui fazer as refeições corretamente essa semana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
          isFromPatient: true,
          sentiment: 'negative',
        },
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 3,
        totalMessages: 15,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        updatedAt: new Date(),
      },
      {
        id: '5',
        patientId: 'patient5',
        patientName: 'Beatriz Oliveira',
        patientPhone: '+5511555554444',
        prescriberId: user?.uid || '',
        status: 'active',
        score: calculatePatientScore({
          patientId: 'patient5',
          meals: generateMockMealData('patient5', 10),
          currentStreak: 10,
          existingBadges: ['streak_7', 'focused_90', 'star_50'],
        }),
        lastMessage: {
          id: 'msg5',
          conversationId: '5',
          patientId: 'patient5',
          senderId: 'patient5',
          senderName: 'Beatriz Oliveira',
          senderType: 'patient',
          content: 'Hoje foi dia de treino pesado! Já preparei minha refeição pós-treino 💪🏋️',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
          isFromPatient: true,
          hasImage: true,
          sentiment: 'positive',
        },
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
        unreadCount: 1,
        totalMessages: 87,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
        updatedAt: new Date(),
      },
    ];

    setConversations(mockConversations);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [user?.uid]); // Fechamento do useCallback com dependências

  useEffect(() => {
    if (!user?.uid) return;

    // Query para buscar conversas do prescritor atual
    const conversationsRef = collection(db, 'whatsappConversations');
    const q = query(
      conversationsRef,
      where('prescriberId', '==', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversationsData: WhatsAppConversation[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          conversationsData.push({
            id: doc.id,
            patientId: data.patientId,
            patientName: data.patientName,
            patientPhone: data.patientPhone,
            prescriberId: data.prescriberId,
            status: data.status,
            score: {
              ...data.score,
              lastMealDate: data.score?.lastMealDate?.toDate() || null,
              updatedAt: data.score?.updatedAt?.toDate() || new Date(),
            },
            lastMessage: data.lastMessage ? {
              ...data.lastMessage,
              timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
            } : undefined,
            lastMessageAt: data.lastMessageAt?.toDate() || null,
            unreadCount: data.unreadCount || 0,
            totalMessages: data.totalMessages || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        setConversations(conversationsData);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      (error) => {
        console.error('Erro ao buscar conversas:', error);
        setIsLoading(false);
        setIsRefreshing(false);
        
        // TEMPORÁRIO: Dados mock para desenvolvimento/demonstração
        loadMockData();
      }
    );

    return () => unsubscribe();
  }, [user?.uid, loadMockData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // A query do Firestore vai recarregar automaticamente
    // Mas para dados mock, recarregamos manualmente
    if (conversations.length > 0 && conversations[0].id === '1') {
      loadMockData();
    }
  };

  const handleConversationClick = (conversation: WhatsAppConversation) => {
    setSelectedConversation(conversation);
  };

  const closeModal = () => {
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Carregando conversas do WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard WhatsApp</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe as conversas e o progresso dos seus pacientes em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowQRCodeModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurar WhatsApp
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* WhatsApp Status Card */}
      <div className="max-w-md">
        <WhatsAppStatusCard 
          onOpenQRCode={() => setShowQRCodeModal(true)}
          refreshInterval={30000}
        />
      </div>

      {/* Kanban Board */}
      <WhatsAppKanbanBoard
        conversations={conversations}
        onConversationClick={handleConversationClick}
      />

      {/* Modal de Conversa */}
      {selectedConversation && (
        <WhatsAppConversationModal
          conversation={selectedConversation}
          onClose={closeModal}
        />
      )}

      {/* Modal de Configuração WhatsApp */}
      {showQRCodeModal && (
        <Modal
          isOpen={showQRCodeModal}
          onClose={() => setShowQRCodeModal(false)}
          title="Configurar WhatsApp"
        >
          <WhatsAppQRCode
            onConnected={() => {
              setShowQRCodeModal(false);
              handleRefresh();
            }}
          />
        </Modal>
      )}
    </motion.div>
  );
}

