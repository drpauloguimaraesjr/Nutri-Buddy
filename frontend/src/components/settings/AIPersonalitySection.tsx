'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Bot, Sparkles, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import PhrasesManager from './PhrasesManager';
import TopicsManager from './TopicsManager';
import TriggersManager from './TriggersManager';
import SequencesManager from './SequencesManager';

interface AIPersonality {
  tone: 'friendly' | 'formal' | 'motivational' | 'custom';
  customTone?: string;
  useEmojis: boolean;
  callByFirstName: boolean;
  askOpenQuestions: boolean;
  useAnalogies: boolean;
  citeStudies: boolean;
  phrases: {
    motivation: string[];
    celebration: string[];
    correction: string[];
    rescue: string[];
  };
  topics: {
    [key: string]: {
      enabled: boolean;
      name: string;
      approach: string;
      frequency: string;
    };
  };
  triggers: {
    [key: string]: {
      response: string;
      alertPrescriber: boolean;
      urgency?: 'low' | 'medium' | 'high';
    };
  };
  sequences: {
    [key: string]: {
      active: boolean;
      messages: Array<{
        dayTrigger?: number;
        dayOfWeek?: number;
        hour?: number;
        text: string;
      }>;
    };
  };
}

const DEFAULT_PERSONALITY: AIPersonality = {
  tone: 'friendly',
  useEmojis: true,
  callByFirstName: true,
  askOpenQuestions: true,
  useAnalogies: true,
  citeStudies: false,
  phrases: {
    motivation: [
      'Cada escolha conta!',
      'Você é mais forte que a tentação',
      'Pequenos passos, grandes conquistas',
    ],
    celebration: [
      'Olha só! Você está arrasando! 🎉',
      'Mais um dia no caminho certo!',
      'Continue assim, os resultados vêm!',
    ],
    correction: [
      'Tudo bem deslizar às vezes, o importante é voltar',
      'Entendo que foi difícil. Vamos ajustar?',
    ],
    rescue: [
      'Sentimos sua falta! Como você está?',
      'Tá tudo bem? Estou aqui se precisar',
    ],
  },
  topics: {
    hydration: {
      enabled: true,
      name: 'Hidratação',
      approach: 'Sempre lembrar de beber 2-3L de água',
      frequency: '2x_day',
    },
    consistency: {
      enabled: true,
      name: 'Consistência vs Perfeição',
      approach: 'Regra 80/20 - foco na constância, não perfeição',
      frequency: 'when_patient_fails',
    },
  },
  triggers: {
    'fiz besteira': {
      response: 'Tudo bem! Um dia não define sua jornada. Vamos voltar amanhã? 💪',
      alertPrescriber: false,
    },
    'quero desistir': {
      response: 'Percebo que está difícil. Podemos conversar?',
      alertPrescriber: true,
      urgency: 'high',
    },
  },
  sequences: {
    newPatient: {
      active: true,
      messages: [
        { dayTrigger: 1, text: 'Bem-vindo! Vamos começar juntos? 😊' },
        { dayTrigger: 3, text: 'Como foram os primeiros dias?' },
        { dayTrigger: 7, text: 'Primeira semana! Alguma dúvida?' },
      ],
    },
  },
};

export default function AIPersonalitySection() {
  const { user } = useAuth();
  const [personality, setPersonality] = useState<AIPersonality>(DEFAULT_PERSONALITY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    loadPersonality();
  }, [user]);

  const loadPersonality = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const docRef = doc(db, 'prescribers', user.uid, 'aiPersonality', 'config');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPersonality({ ...DEFAULT_PERSONALITY, ...docSnap.data() } as AIPersonality);
      }
    } catch (error) {
      console.error('Erro ao carregar personalidade:', error);
      setFeedback({
        type: 'error',
        message: 'Erro ao carregar configurações. Usando padrões.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);
      setFeedback(null);

      const docRef = doc(db, 'prescribers', user.uid, 'aiPersonality', 'config');
      await setDoc(
        docRef,
        {
          ...personality,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setFeedback({
        type: 'success',
        message: 'Personalidade da IA salva! As próximas conversas usarão estas configurações.',
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFeedback({
        type: 'error',
        message: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 p-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personalidade da IA</h2>
              <p className="text-sm text-gray-600">
                Configure como a IA se comunica com seus pacientes
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Tom de Voz */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Tom de Voz
            </label>
            <select
              value={personality.tone}
              onChange={(e) =>
                setPersonality({ ...personality, tone: e.target.value as AIPersonality['tone'] })
              }
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="friendly">Amigável e Próximo</option>
              <option value="formal">Formal e Profissional</option>
              <option value="motivational">Motivacional e Energético</option>
              <option value="custom">Personalizado</option>
            </select>

            {personality.tone === 'custom' && (
              <textarea
                value={personality.customTone || ''}
                onChange={(e) => setPersonality({ ...personality, customTone: e.target.value })}
                placeholder="Descreva como você quer que a IA se comunique..."
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                rows={3}
              />
            )}
          </div>

          {/* Características */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Características do Atendimento
            </label>
            <div className="space-y-2">
              {[
                { key: 'useEmojis', label: 'Usar emojis nas conversas' },
                { key: 'callByFirstName', label: 'Chamar pelo primeiro nome' },
                { key: 'askOpenQuestions', label: 'Fazer perguntas abertas' },
                { key: 'useAnalogies', label: 'Usar analogias do dia a dia' },
                { key: 'citeStudies', label: 'Citar estudos científicos' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={personality[key as keyof AIPersonality] as boolean}
                    onChange={(e) =>
                      setPersonality({ ...personality, [key]: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frases de Efeito */}
      <PhrasesManager
        phrases={personality.phrases}
        onChange={(phrases) => setPersonality({ ...personality, phrases })}
      />

      {/* Tópicos */}
      <TopicsManager
        topics={personality.topics}
        onChange={(topics) => setPersonality({ ...personality, topics })}
      />

      {/* Gatilhos */}
      <TriggersManager
        triggers={personality.triggers}
        onChange={(triggers) => setPersonality({ ...personality, triggers })}
      />

      {/* Sequências */}
      <SequencesManager
        sequences={personality.sequences}
        onChange={(sequences) => setPersonality({ ...personality, sequences })}
      />

      {/* Feedback e Salvar */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}

