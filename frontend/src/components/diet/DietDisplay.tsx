'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User, Target, Flame } from 'lucide-react';
import type { DietPlan, Refeicao } from '@/types/diet';

interface DietDisplayProps {
  dietPlan: DietPlan;
  onRetranscribe?: () => void;
}

export default function DietDisplay({ dietPlan, onRetranscribe }: DietDisplayProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set([0])); // Primeira refeição expandida por padrão

  const toggleMeal = (index: number) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedMeals(new Set(dietPlan.meals.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedMeals(new Set());
  };


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (dateValue: any) => {
    let date: Date;

    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      date = dateValue.toDate();
    }
    // Handle string
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    }
    // Handle Date object
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Fallback to current date
    else {
      date = new Date();
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com resumo executivo */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{dietPlan.name}</h2>
            <p className="text-gray-600 mt-1">{dietPlan.description}</p>
          </div>
          {onRetranscribe && (
            <button
              onClick={onRetranscribe}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔄 Retranscrever
            </button>
          )}
        </div>

        {/* Metadados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(dietPlan.createdAt)}</span>
          </div>
          {dietPlan.metadata?.meta?.nutricionista && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{dietPlan.metadata.meta.nutricionista}</span>
            </div>
          )}
          {dietPlan.metadata?.meta?.objetivo && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span className="capitalize">{dietPlan.metadata.meta.objetivo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Flame className="w-4 h-4" />
            <span>{dietPlan.meals?.length || 0} refeições</span>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">
              {dietPlan.dailyCalories}
            </div>
            <div className="text-sm text-gray-500 mt-1">kcal/dia</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {dietPlan.dailyProtein}g
            </div>
            <div className="text-sm text-gray-600 mt-1">Proteínas</div>
            {dietPlan.metadata?.macronutrientes?.proteinas?.percentual && (
              <div className="text-xs text-blue-500 mt-0.5">
                {dietPlan.metadata.macronutrientes.proteinas.percentual.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">
              {dietPlan.dailyCarbs}g
            </div>
            <div className="text-sm text-gray-600 mt-1">Carboidratos</div>
            {dietPlan.metadata?.macronutrientes?.carboidratos?.percentual && (
              <div className="text-xs text-orange-500 mt-0.5">
                {dietPlan.metadata.macronutrientes.carboidratos.percentual.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {dietPlan.dailyFats}g
            </div>
            <div className="text-sm text-gray-600 mt-1">Gorduras</div>
            {dietPlan.metadata?.macronutrientes?.gorduras?.percentual && (
              <div className="text-xs text-green-500 mt-0.5">
                {dietPlan.metadata.macronutrientes.gorduras.percentual.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles de expansão */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Refeições ({dietPlan.meals?.length || 0})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Expandir todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            Recolher todas
          </button>
        </div>
      </div>

      {/* Lista de refeições */}
      <div className="space-y-3">
        {dietPlan.meals?.map((meal, index) => (
          <MealCard
            key={index}
            meal={meal}
            isExpanded={expandedMeals.has(index)}
            onToggle={() => toggleMeal(index)}
          />
        ))}
      </div>

      {/* Substituições permitidas */}
      {dietPlan.metadata?.substituicoes && dietPlan.metadata.substituicoes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            🔄 Substituições Permitidas
          </h3>
          <div className="space-y-3">
            {dietPlan.metadata.substituicoes.map((sub, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="font-medium text-gray-900 mb-2">
                  {sub.alimentoOriginal}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sub.substitutos.map((substituto, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                    >
                      {substituto}
                    </span>
                  ))}
                </div>
                {sub.observacao && (
                  <p className="text-sm text-gray-600 mt-2 italic">{sub.observacao}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações do nutricionista */}
      {dietPlan.metadata?.observacoes && dietPlan.metadata.observacoes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📝 Observações do Nutricionista
          </h3>
          <ul className="space-y-2">
            {dietPlan.metadata.observacoes.map((obs, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Componente individual de refeição
function MealCard({
  meal,
  isExpanded,
  onToggle,
}: {
  meal: Refeicao;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const getMealIcon = (mealName: string) => {
    const name = mealName.toLowerCase();
    if (name.includes('café') || name.includes('manhã')) return '☕';
    if (name.includes('almoço')) return '🍽️';
    if (name.includes('lanche') || name.includes('snack')) return '🍎';
    if (name.includes('jantar')) return '🌙';
    if (name.includes('ceia')) return '🥛';
    if (name.includes('treino') || name.includes('pré') || name.includes('pós')) return '💪';
    return '🍴';
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header da refeição */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{getMealIcon(meal.nome)}</span>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-900">{meal.nome}</h4>
              <span className="text-sm text-gray-500">{meal.horario}</span>
            </div>
            {meal.macros && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">
                  {meal.macros.calorias} kcal
                </span>
                <span className="text-xs text-gray-400">
                  P: {meal.macros.proteinas}g | C: {meal.macros.carboidratos}g | G:{' '}
                  {meal.macros.gorduras}g
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {meal.alimentos?.length || 0} alimentos
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <ul className="space-y-2">
            {meal.alimentos?.map((alimento, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-4 py-2 px-3 bg-white rounded border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{alimento.nome}</div>
                  {alimento.observacao && (
                    <div className="text-sm text-gray-500 mt-0.5 italic">
                      {alimento.observacao}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {alimento.quantidade}
                  {alimento.unidade}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

