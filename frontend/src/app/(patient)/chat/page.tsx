'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function PatientChatPage() {
  const { firebaseUser } = useAuth();
  const [prescriberId, setPrescriberId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Buscar prescritor do paciente
  useEffect(() => {
    const fetchPrescriber = async () => {
      if (!firebaseUser) return;

      try {
        setIsLoading(true);
        const token = await firebaseUser.getIdToken();
        
        // Buscar dados do paciente para pegar o prescriberId
        const userResponse = await fetch(`${apiBaseUrl}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.prescriberId) {
            setPrescriberId(userData.prescriberId);
          }
        }

        // Buscar conversas existentes
        const conversationsResponse = await fetch(
          `${apiBaseUrl}/api/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          if (conversationsData.conversations.length > 0) {
            // Usar a primeira conversa (paciente geralmente tem apenas uma)
            setConversationId(conversationsData.conversations[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar prescritor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriber();
  }, [firebaseUser, apiBaseUrl]);

  const handleConversationCreated = (newConversationId: string) => {
    setConversationId(newConversationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Carregando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat com seu Nutricionista</h1>
          <p className="text-gray-600">
            Tire suas dúvidas e acompanhe seu progresso
          </p>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="h-[calc(100vh-14rem)]"
      >
        {conversationId ? (
          <ChatInterface conversationId={conversationId} />
        ) : prescriberId ? (
          <ChatInterface
            prescriberId={prescriberId}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md px-4">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">
                Nenhum nutricionista atribuído
              </h3>
              <p className="text-gray-600">
                Entre em contato com o suporte para ter um nutricionista atribuído à sua conta.
              </p>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

