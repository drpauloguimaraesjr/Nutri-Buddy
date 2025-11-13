'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { 
  AIProfileType, 
  MessageFrequency, 
  EmojiLevel, 
  FeedbackStyle, 
  ResponseTiming,
  AIProfileConfig as AIProfileConfigType 
} from '@/types';

interface AIProfileMetadata {
  emoji: string;
  name: string;
  description: string;
  characteristics: string[];
  example: string;
}

interface AIProfileConfigProps {
  patientId: string;
  patientName: string;
  onSave?: (config: AIProfileConfigType) => void;
}

const PROFILE_TYPES: Array<{
  value: AIProfileType;
  metadata: AIProfileMetadata;
}> = [
  {
    value: 'welcoming',
    metadata: {
      emoji: '🤗',
      name: 'Acolhedor e Suave',
      description: 'Tom calmo, paciente e empático. Ideal para pacientes ansiosos ou sensíveis.',
      characteristics: [
        'Linguagem suave e reconfortante',
        'Valida emoções antes de orientar',
        'Evita pressão e palavras imperativas',
        'Foco no progresso, não na perfeição'
      ],
      example: 'Tudo bem se hoje não foi como planejado. Amanhã é uma nova chance 💙'
    }
  },
  {
    value: 'motivational',
    metadata: {
      emoji: '🔥',
      name: 'Motivacional e Energético',
      description: 'Entusiasmado e inspirador. Ideal para pacientes desmotivados que precisam de energia.',
      characteristics: [
        'Linguagem positiva e energizante',
        'Celebra cada pequena conquista',
        'Usa analogias de superação',
        'Frases curtas e impactantes'
      ],
      example: 'ISSO! Mais uma refeição saudável! Você está arrasando! 🔥'
    }
  },
  {
    value: 'direct',
    metadata: {
      emoji: '💪',
      name: 'Firme e Direto',
      description: 'Objetivo e sem rodeios. Ideal para pacientes que precisam de limites claros.',
      characteristics: [
        'Comunicação clara e objetiva',
        'Apresenta fatos e consequências',
        'Estabelece expectativas claras',
        'Não aceita desculpas, oferece soluções'
      ],
      example: '3 refeições fora do plano essa semana. Vamos ajustar? 📊'
    }
  },
  {
    value: 'humorous',
    metadata: {
      emoji: '😄',
      name: 'Descontraído com Humor',
      description: 'Leve e bem-humorado. Ideal para pacientes que respondem bem à leveza.',
      characteristics: [
        'Usa humor saudável (nunca ofensivo)',
        'Metáforas e comparações engraçadas',
        'Torna o processo mais leve',
        'Equilíbrio entre diversão e seriedade'
      ],
      example: 'Pizza às 23h? Aquele momento "fome da madrugada atacou"? 😄 Amanhã compensamos!'
    }
  },
  {
    value: 'mindful',
    metadata: {
      emoji: '🧘',
      name: 'Zen e Mindful',
      description: 'Reflexivo e consciente. Ideal para pacientes que valorizam conexão mente-corpo.',
      characteristics: [
        'Incentiva autopercepção corporal',
        'Questiona em vez de instruir',
        'Linguagem de mindfulness',
        'Conecta alimentação com emoções'
      ],
      example: 'Como você se sentiu após essa refeição? Mais energizado ou pesado? 🌱'
    }
  },
  {
    value: 'educational',
    metadata: {
      emoji: '📚',
      name: 'Educativo e Técnico',
      description: 'Informativo e didático. Ideal para pacientes curiosos que gostam de entender o porquê.',
      characteristics: [
        'Explica o raciocínio das recomendações',
        'Usa dados e fatos científicos',
        'Ensina enquanto orienta',
        'Empodera através do conhecimento'
      ],
      example: 'Proteína no café da manhã mantém saciedade. Estudos mostram redução de 60% na compulsão 📚'
    }
  },
  {
    value: 'coach',
    metadata: {
      emoji: '🎯',
      name: 'Coach Esportivo',
      description: 'Desafiador e focado em performance. Ideal para pacientes competitivos.',
      characteristics: [
        'Linguagem de treino e performance',
        'Estabelece metas e desafios',
        'Usa métricas mensuráveis',
        'Celebra recordes pessoais'
      ],
      example: 'META DA SEMANA: 5 dias com café proteico. Você topa? 🎯'
    }
  },
  {
    value: 'partner',
    metadata: {
      emoji: '🤝',
      name: 'Parceiro de Jornada',
      description: 'Colaborativo e de parceria. Ideal para pacientes que valorizam trabalho em equipe.',
      characteristics: [
        'Usa "nós" em vez de "você"',
        'Compartilha a responsabilidade',
        'Cria senso de time',
        'Celebra conquistas em conjunto'
      ],
      example: 'Vamos ajustar o jantar juntos? O que você acha de... 🤝'
    }
  }
];

export default function AIProfileConfig({ patientId, patientName, onSave }: AIProfileConfigProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [selectedProfile, setSelectedProfile] = useState<AIProfileType>('welcoming');
  const [messageFrequency, setMessageFrequency] = useState<MessageFrequency>('medium');
  const [emojiLevel, setEmojiLevel] = useState<EmojiLevel>('medium');
  const [feedbackStyle, setFeedbackStyle] = useState<FeedbackStyle>('balanced');
  const [responseTiming, setResponseTiming] = useState<ResponseTiming>('respectful');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    loadProfile();
  }, [patientId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prescriber/patients/${patientId}/ai-profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.config) {
          const config = data.data.config;
          setSelectedProfile(config.profileType || 'welcoming');
          setMessageFrequency(config.messageFrequency || 'medium');
          setEmojiLevel(config.emojiLevel || 'medium');
          setFeedbackStyle(config.feedbackStyle || 'balanced');
          setResponseTiming(config.responseTiming || 'respectful');
          setCustomInstructions(config.customInstructions || '');
        }
      }
    } catch (error) {
      console.error('Error loading AI profile:', error);
      setFeedback({
        type: 'error',
        message: 'Erro ao carregar perfil. Usando configuração padrão.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      const config: AIProfileConfigType = {
        profileType: selectedProfile,
        messageFrequency,
        emojiLevel,
        feedbackStyle,
        responseTiming,
        customInstructions
      };

      const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prescriber/patients/${patientId}/ai-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedback({
          type: 'success',
          message: '✅ Perfil de IA salvo com sucesso!'
        });
        onSave?.(config);
      } else {
        throw new Error(data.error || 'Erro ao salvar perfil');
      }
    } catch (error) {
      console.error('Error saving AI profile:', error);
      setFeedback({
        type: 'error',
        message: 'Erro ao salvar perfil. Tente novamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const currentProfileMetadata = PROFILE_TYPES.find(p => p.value === selectedProfile)?.metadata;

  return (
    <div className="space-y-6">
      {/* Header Explicativo */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">
                Personalidade da IA para {patientName}
              </h3>
              <p className="mt-1 text-sm text-purple-700">
                Configure como a IA deve conversar especificamente com este paciente. 
                Cada perfil tem um tom, frequência e estilo únicos de comunicação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card className={`border-l-4 ${
          feedback.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-sm font-medium ${
                feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perfil de Comunicação */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Perfil de Comunicação</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
            {PROFILE_TYPES.map(({ value, metadata }) => (
              <label
                key={value}
                className={`flex flex-col gap-3 rounded-lg border-2 p-4 cursor-pointer transition ${
                  selectedProfile === value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="profileType"
                    value={value}
                    checked={selectedProfile === value}
                    onChange={() => setSelectedProfile(value)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{metadata.emoji}</span>
                      <span className="font-semibold text-gray-900">{metadata.name}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{metadata.description}</p>
                  </div>
                </div>
                
                {selectedProfile === value && (
                  <div className="ml-7 space-y-2 text-sm">
                    <div className="rounded-lg bg-purple-100 p-3">
                      <p className="font-medium text-purple-900 mb-1">Características:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-purple-800">
                        {metadata.characteristics.map((char, idx) => (
                          <li key={idx}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="font-medium text-blue-900 mb-1">Exemplo de resposta:</p>
                      <p className="text-blue-800 italic">"{metadata.example}"</p>
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Configuração */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Parâmetros de Configuração</h3>

          {/* Frequência de Mensagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequência de Mensagens
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: 'high' as MessageFrequency, label: 'Alta', desc: '3-4x/dia', icon: '🔴' },
                { value: 'medium' as MessageFrequency, label: 'Média', desc: '2x/dia', icon: '🟡' },
                { value: 'low' as MessageFrequency, label: 'Baixa', desc: '1x/dia', icon: '🟢' }
              ].map(freq => (
                <label
                  key={freq.value}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                    messageFrequency === freq.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq.value}
                    checked={messageFrequency === freq.value}
                    onChange={() => setMessageFrequency(freq.value)}
                    className="h-4 w-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span>{freq.icon}</span>
                      <span className="font-semibold text-sm">{freq.label}</span>
                    </div>
                    <span className="text-xs text-gray-600">{freq.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Nível de Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Emoji
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: 'high' as EmojiLevel, label: 'Alto', desc: 'Muitos emojis', icon: '😄🔥💪' },
                { value: 'medium' as EmojiLevel, label: 'Médio', desc: 'Moderado', icon: '😊✨' },
                { value: 'low' as EmojiLevel, label: 'Baixo', desc: 'Poucos/sem', icon: '🙂' }
              ].map(emoji => (
                <label
                  key={emoji.value}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                    emojiLevel === emoji.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="emoji"
                    value={emoji.value}
                    checked={emojiLevel === emoji.value}
                    onChange={() => setEmojiLevel(emoji.value)}
                    className="h-4 w-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span>{emoji.icon}</span>
                      <span className="font-semibold text-sm">{emoji.label}</span>
                    </div>
                    <span className="text-xs text-gray-600">{emoji.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Estilo de Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de Feedback
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: 'positive' as FeedbackStyle, label: 'Sempre Positivo', desc: 'Foca no que deu certo', icon: '⭐' },
                { value: 'balanced' as FeedbackStyle, label: 'Balanceado', desc: 'Positivos + melhorias', icon: '⚖️' },
                { value: 'analytical' as FeedbackStyle, label: 'Analítico', desc: 'Fatos e dados', icon: '📊' }
              ].map(style => (
                <label
                  key={style.value}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                    feedbackStyle === style.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedback"
                    value={style.value}
                    checked={feedbackStyle === style.value}
                    onChange={() => setFeedbackStyle(style.value)}
                    className="h-4 w-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span>{style.icon}</span>
                      <span className="font-semibold text-sm">{style.label}</span>
                    </div>
                    <span className="text-xs text-gray-600">{style.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Timing de Resposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timing de Resposta
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: 'immediate' as ResponseTiming, label: 'Imediato', desc: 'Responde na hora', icon: '⚡' },
                { value: 'scheduled' as ResponseTiming, label: 'Programado', desc: 'Horários específicos', icon: '⏰' },
                { value: 'respectful' as ResponseTiming, label: 'Respeitoso', desc: 'Evita noite/madrugada', icon: '🌙' }
              ].map(timing => (
                <label
                  key={timing.value}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                    responseTiming === timing.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="timing"
                    value={timing.value}
                    checked={responseTiming === timing.value}
                    onChange={() => setResponseTiming(timing.value)}
                    className="h-4 w-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span>{timing.icon}</span>
                      <span className="font-semibold text-sm">{timing.label}</span>
                    </div>
                    <span className="text-xs text-gray-600">{timing.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções Customizadas */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruções Adicionais (Opcional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ex: Este paciente tem restrição a glúten e lactose. Evitar sugerir pizza ou laticínios."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              rows={4}
            />
            <p className="mt-2 text-xs text-gray-500">
              Adicione instruções específicas que a IA deve seguir com este paciente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configuração
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

