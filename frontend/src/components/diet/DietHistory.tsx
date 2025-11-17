'use client';

import { useState } from 'react';
import { Calendar, Eye, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { DietPlan } from '@/types/diet';

interface DietHistoryProps {
  history: DietPlan[];
  currentDietId?: string;
  onSelectDiet: (diet: DietPlan) => void;
  onReactivate?: (dietId: string) => Promise<void>;
  loading?: boolean;
}

export default function DietHistory({
  history,
  currentDietId,
  onSelectDiet,
  onReactivate,
  loading = false,
}: DietHistoryProps) {
  const [reactivating, setReactivating] = useState<string | null>(null);

  const handleReactivate = async (dietId: string) => {
    if (!onReactivate) return;
    
    try {
      setReactivating(dietId);
      await onReactivate(dietId);
    } catch (error) {
      console.error('Error reactivating diet:', error);
    } finally {
      setReactivating(null);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: Date | string) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">Nenhuma dieta anterior</p>
        <p className="text-sm text-gray-500 mt-1">
          O histórico de dietas aparecerá aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Histórico de Dietas ({history.length})
        </h3>
        <p className="text-sm text-gray-500">
          {history.filter(d => d.isActive).length} ativa
        </p>
      </div>

      <div className="space-y-2">
        {history.map((diet) => (
          <div
            key={diet.id}
            className={`
              bg-white rounded-lg border p-4 transition-all
              ${
                diet.isActive
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Informações da dieta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {diet.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      <XCircle className="w-3 h-3" />
                      Inativa
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDate(diet.createdAt)} às {formatTime(diet.createdAt)}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                  {diet.name}
                </h4>
                <p className="text-sm text-gray-600 truncate mb-2">
                  {diet.description}
                </p>

                {/* Resumo de macros */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-gray-700 font-medium">
                    {diet.dailyCalories} kcal
                  </span>
                  <span className="text-blue-600">P: {diet.dailyProtein}g</span>
                  <span className="text-orange-600">C: {diet.dailyCarbs}g</span>
                  <span className="text-green-600">G: {diet.dailyFats}g</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onSelectDiet(diet)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>

                {!diet.isActive && onReactivate && (
                  <button
                    onClick={() => handleReactivate(diet.id!)}
                    disabled={reactivating === diet.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {reactivating === diet.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Reativar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Data de desativação */}
            {!diet.isActive && diet.deactivatedAt && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Desativada em {formatDate(diet.deactivatedAt)} às{' '}
                  {formatTime(diet.deactivatedAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

