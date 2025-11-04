'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, TrendingUp, Edit, Save, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Goals {
  id: string;
  userId: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  weight: number;
  weightGoal: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective: 'lose' | 'maintain' | 'gain';
  updatedAt: string;
}

interface DailyProgress {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export default function GoalsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<Partial<Goals>>({});
  const queryClient = useQueryClient();

  // Fetch goals
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/goals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch goals');
      const data = await res.json();
      return data.goals;
    }
  });

  // Fetch today's progress
  const { data: progress } = useQuery({
    queryKey: ['daily-progress'],
    queryFn: async () => {
      // Mock data - você pode criar um endpoint real
      return {
        calories: 1450,
        protein: 85,
        carbs: 180,
        fat: 45,
        water: 1800
      } as DailyProgress;
    }
  });

  // Update goals
  const updateMutation = useMutation({
    mutationFn: async (newGoals: Partial<Goals>) => {
      const res = await fetch(`${API_URL}/api/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newGoals)
      });
      if (!res.ok) throw new Error('Failed to update goals');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsEditing(false);
      setEditedGoals({});
    }
  });

  const handleSave = () => {
    updateMutation.mutate(editedGoals);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedGoals(goals || {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const currentGoals = isEditing ? editedGoals : goals;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Nutricionais</h1>
          <p className="text-gray-600 mt-1">
            Defina e acompanhe suas metas diárias de nutrição
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Metas
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      {/* Daily Progress Overview */}
      {!isEditing && progress && currentGoals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Calorias</span>
                <span className="text-sm font-bold">
                  {progress.calories}/{currentGoals.dailyCalories}
                </span>
              </div>
              <ProgressBar
                value={(progress.calories / (currentGoals.dailyCalories || 1)) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {Math.round((progress.calories / (currentGoals.dailyCalories || 1)) * 100)}% da meta
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Proteínas</span>
                <span className="text-sm font-bold">
                  {progress.protein}g/{currentGoals.protein}g
                </span>
              </div>
              <ProgressBar
                value={(progress.protein / (currentGoals.protein || 1)) * 100}
                className="h-2"
                color="blue"
              />
              <p className="text-xs text-gray-500">
                {Math.round((progress.protein / (currentGoals.protein || 1)) * 100)}% da meta
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Carboidratos</span>
                <span className="text-sm font-bold">
                  {progress.carbs}g/{currentGoals.carbs}g
                </span>
              </div>
              <ProgressBar
                value={(progress.carbs / (currentGoals.carbs || 1)) * 100}
                className="h-2"
                color="yellow"
              />
              <p className="text-xs text-gray-500">
                {Math.round((progress.carbs / (currentGoals.carbs || 1)) * 100)}% da meta
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Gorduras</span>
                <span className="text-sm font-bold">
                  {progress.fat}g/{currentGoals.fat}g
                </span>
              </div>
              <ProgressBar
                value={(progress.fat / (currentGoals.fat || 1)) * 100}
                className="h-2"
                color="red"
              />
              <p className="text-xs text-gray-500">
                {Math.round((progress.fat / (currentGoals.fat || 1)) * 100)}% da meta
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Água</span>
                <span className="text-sm font-bold">
                  {progress.water}ml/{currentGoals.water}ml
                </span>
              </div>
              <ProgressBar
                value={(progress.water / (currentGoals.water || 1)) * 100}
                className="h-2"
                color="blue"
              />
              <p className="text-xs text-gray-500">
                {Math.round((progress.water / (currentGoals.water || 1)) * 100)}% da meta
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Goals Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macronutrients Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Metas Diárias</h2>
              <p className="text-sm text-gray-600">Calorias e macronutrientes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calorias Diárias (kcal)</label>
              <Input
                type="number"
                value={currentGoals?.dailyCalories || ''}
                onChange={(e) => setEditedGoals({ ...editedGoals, dailyCalories: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Proteína (g)</label>
                <Input
                  type="number"
                  value={currentGoals?.protein || ''}
                  onChange={(e) => setEditedGoals({ ...editedGoals, protein: parseInt(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Carboidratos (g)</label>
                <Input
                  type="number"
                  value={currentGoals?.carbs || ''}
                  onChange={(e) => setEditedGoals({ ...editedGoals, carbs: parseInt(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gordura (g)</label>
                <Input
                  type="number"
                  value={currentGoals?.fat || ''}
                  onChange={(e) => setEditedGoals({ ...editedGoals, fat: parseInt(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Água Diária (ml)</label>
              <Input
                type="number"
                value={currentGoals?.water || ''}
                onChange={(e) => setEditedGoals({ ...editedGoals, water: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Weight and Activity Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Metas de Peso</h2>
              <p className="text-sm text-gray-600">Peso e nível de atividade</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Peso Atual (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentGoals?.weight || ''}
                  onChange={(e) => setEditedGoals({ ...editedGoals, weight: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta de Peso (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentGoals?.weightGoal || ''}
                  onChange={(e) => setEditedGoals({ ...editedGoals, weightGoal: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objetivo</label>
              <select
                value={currentGoals?.objective || 'maintain'}
                onChange={(e) => setEditedGoals({ ...editedGoals, objective: e.target.value as any })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              >
                <option value="lose">Perder Peso</option>
                <option value="maintain">Manter Peso</option>
                <option value="gain">Ganhar Peso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nível de Atividade</label>
              <select
                value={currentGoals?.activityLevel || 'moderate'}
                onChange={(e) => setEditedGoals({ ...editedGoals, activityLevel: e.target.value as any })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              >
                <option value="sedentary">Sedentário</option>
                <option value="light">Levemente Ativo</option>
                <option value="moderate">Moderadamente Ativo</option>
                <option value="active">Muito Ativo</option>
                <option value="very_active">Extremamente Ativo</option>
              </select>
            </div>

            {currentGoals?.weight && currentGoals?.weightGoal && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Progresso</span>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.abs(currentGoals.weight - currentGoals.weightGoal).toFixed(1)} kg restantes
                  </span>
                </div>
                <ProgressBar
                  value={
                    currentGoals.objective === 'lose'
                      ? ((currentGoals.weight - currentGoals.weightGoal) / currentGoals.weight) * 100
                      : ((currentGoals.weightGoal - currentGoals.weight) / currentGoals.weightGoal) * 100
                  }
                  className="h-3"
                  color="blue"
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {!isEditing && currentGoals && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Recomendações</h2>
              <p className="text-sm text-gray-600">Baseadas no seu perfil e objetivos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-2">💪 Proteínas</h3>
              <p className="text-sm text-emerald-700">
                Distribuir ao longo do dia para melhor absorção
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🏃 Atividade</h3>
              <p className="text-sm text-blue-700">
                Mantenha {currentGoals.activityLevel === 'active' ? '5-6' : '3-4'} dias de exercício por semana
              </p>
            </div>

            <div className="p-4 bg-cyan-50 rounded-lg">
              <h3 className="font-semibold text-cyan-900 mb-2">💧 Hidratação</h3>
              <p className="text-sm text-cyan-700">
                Beba água regularmente ao longo do dia
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

