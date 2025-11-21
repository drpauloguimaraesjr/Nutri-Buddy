'use client';

import { DailyAdherence } from '@/types/adherence';
import { Flame, Utensils, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface AdherenceScoreCardProps {
    data: DailyAdherence | null;
    loading?: boolean;
}

export default function AdherenceScoreCard({ data, loading = false }: AdherenceScoreCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse h-64">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-100 rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <Target className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">Sem dados hoje</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    O score de aderência aparecerá assim que as refeições forem registradas.
                </p>
            </div>
        );
    }

    const { scores, consumed, planned } = data;

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getProgressBarColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Aderência Diária</h3>
                        <p className="text-sm text-gray-500">Baseado no plano alimentar</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${getScoreColor(scores.total)} flex items-center gap-1.5`}>
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">{scores.total}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Calorias */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Calorias</span>
                        </div>
                        <div className="flex items-end gap-1 mb-1">
                            <span className="text-xl font-bold text-gray-900">{consumed.calories}</span>
                            <span className="text-xs text-gray-500 mb-1">/ {planned.calories} kcal</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${getProgressBarColor(scores.caloric)}`}
                                style={{ width: `${Math.min(100, (consumed.calories / planned.calories) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">{scores.caloric}% score</p>
                    </div>

                    {/* Macros */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Macros</span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-gray-600">Proteína</span>
                                    <span className="text-gray-900 font-medium">{consumed.protein}/{planned.protein}g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, (consumed.protein / planned.protein) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-gray-600">Carbo</span>
                                    <span className="text-gray-900 font-medium">{consumed.carbs}/{planned.carbs}g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${Math.min(100, (consumed.carbs / planned.carbs) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-gray-600">Gordura</span>
                                    <span className="text-gray-900 font-medium">{consumed.fats}/{planned.fats}g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${Math.min(100, (consumed.fats / planned.fats) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">{scores.macros}% score</p>
                    </div>

                    {/* Refeições */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Utensils className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Refeições</span>
                        </div>
                        <div className="flex items-end gap-1 mb-1">
                            <span className="text-xl font-bold text-gray-900">{data.mealDetails.filter(m => m.completed).length}</span>
                            <span className="text-xs text-gray-500 mb-1">/ {planned.mealsCount} realizadas</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${getProgressBarColor(scores.meals)}`}
                                style={{ width: `${scores.meals}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">{scores.meals}% score</p>

                        {/* Refeições perdidas */}
                        {data.mealDetails.some(m => !m.completed) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Faltou: {data.mealDetails.filter(m => !m.completed).map(m => m.name).slice(0, 2).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
