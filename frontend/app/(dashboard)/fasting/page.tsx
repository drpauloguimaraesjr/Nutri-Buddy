'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Play, StopCircle, Timer, TrendingUp, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { fastingAPI } from '@/lib/api';
import { toast } from 'sonner';

interface FastingSession {
  id: string;
  userId: string;
  type: string;
  goal: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
  duration: number;
  completed: boolean;
  currentDuration?: number;
  progress?: number;
  remainingTime?: number;
}

export default function FastingPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('16:8');
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // Revalidar jejum ativo a cada minuto
      if (currentTime.getSeconds() === 0) {
        queryClient.invalidateQueries({ queryKey: ['active-fast'] });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTime, queryClient]);

  // Fetch active fasting
  const { data: activeFastResponse, isLoading } = useQuery({
    queryKey: ['active-fast', user?.uid],
    queryFn: () => fastingAPI.getActive(),
    enabled: !!user,
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  const activeFast = activeFastResponse?.data?.fasting || activeFastResponse?.data?.data || null;

  // Fetch history
  const { data: historyResponse } = useQuery({
    queryKey: ['fasting-history', user?.uid],
    queryFn: () => fastingAPI.getHistory({ limit: 10 }),
    enabled: !!user,
  });

  const historyData = historyResponse?.data;

  // Start fasting
  const startMutation = useMutation({
    mutationFn: (type: string) => fastingAPI.start(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-fast'] });
      toast.success('Jejum iniciado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar jejum');
    },
  });

  // End fasting
  const endMutation = useMutation({
    mutationFn: () => fastingAPI.stop(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-fast'] });
      queryClient.invalidateQueries({ queryKey: ['fasting-history'] });
      toast.success('Jejum finalizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao finalizar jejum');
    },
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular tempo decorrido em tempo real
  const getElapsedTime = () => {
    if (!activeFast) return { hours: 0, minutes: 0, seconds: 0 };
    
    const start = new Date(activeFast.startTime);
    const diff = currentTime.getTime() - start.getTime();
    
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return { hours, minutes, seconds };
  };

  const elapsed = getElapsedTime();
  const progress = activeFast ? Math.min((elapsed.hours * 60 + elapsed.minutes) / activeFast.goal * 100, 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jejum Intermitente</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe seus períodos de jejum e alcance seus objetivos
        </p>
      </div>

      {/* Main Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card */}
        <Card className="lg:col-span-2 p-8">
          {!activeFast ? (
            /* Start New Fast */
            <div className="text-center space-y-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                <Timer className="w-24 h-24 text-emerald-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Iniciar Novo Jejum
                </h2>
                <p className="text-gray-600">
                  Escolha o tipo de jejum que deseja realizar
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  { type: '12:12', label: '12:12', desc: '12h jejum' },
                  { type: '14:10', label: '14:10', desc: '14h jejum' },
                  { type: '16:8', label: '16:8', desc: '16h jejum' },
                  { type: '18:6', label: '18:6', desc: '18h jejum' },
                  { type: '20:4', label: '20:4', desc: '20h jejum' },
                  { type: '24h', label: '24h', desc: '24h jejum' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === option.type
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="font-semibold text-lg">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => startMutation.mutate(selectedType)}
                disabled={startMutation.isPending}
                size="lg"
                className="px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                {startMutation.isPending ? 'Iniciando...' : 'Iniciar Jejum'}
              </Button>
            </div>
          ) : (
            /* Active Timer */
            <div className="text-center space-y-6">
              <div className="relative">
                {/* Circular Progress */}
                <svg className="w-64 h-64 mx-auto transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className="text-emerald-600 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-5xl font-bold text-gray-900">
                      {String(elapsed.hours).padStart(2, '0')}:
                      {String(elapsed.minutes).padStart(2, '0')}:
                      {String(elapsed.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {Math.round(progress)}% completo
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Jejum {activeFast.type} em Andamento
                </h3>
                <p className="text-gray-600 mt-1">
                  Meta: {formatTime(activeFast.goal)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Iniciado: {formatTimestamp(activeFast.startTime)}
                </p>
              </div>

              <Button
                onClick={() => endMutation.mutate()}
                disabled={endMutation.isPending}
                variant="outline"
                className="px-8"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                {endMutation.isPending ? 'Finalizando...' : 'Finalizar Jejum'}
              </Button>
            </div>
          )}
        </Card>

        {/* Stats Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Estatísticas
          </h3>

          {historyData?.stats && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">
                  {historyData.stats.totalFasts}
                </div>
                <div className="text-sm text-gray-600">Jejuns Realizados</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {historyData.stats.successRate}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(historyData.stats.longestFast)}
                </div>
                <div className="text-sm text-gray-600">Jejum Mais Longo</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {historyData.stats.last7DaysCount}
                </div>
                <div className="text-sm text-gray-600">Últimos 7 Dias</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* History */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Histórico de Jejuns
        </h3>

        {historyData?.history && historyData.history.length > 0 ? (
          <div className="space-y-3">
            {historyData.history.map((fast: FastingSession) => (
              <div
                key={fast.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {fast.completed ? (
                    <Award className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium">
                      Jejum {fast.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTimestamp(fast.startTime)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-emerald-600">
                    {formatTime(fast.duration)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fast.completed ? '✓ Completo' : 'Interrompido'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Timer className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhum jejum registrado ainda</p>
            <p className="text-sm mt-1">Comece seu primeiro jejum acima!</p>
          </div>
        )}
      </Card>
    </div>
  );
}

