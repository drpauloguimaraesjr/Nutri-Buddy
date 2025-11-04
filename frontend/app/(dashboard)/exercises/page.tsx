'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Dumbbell, Clock, Flame, Trash2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Exercise {
  id: string;
  userId: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  name: string;
  duration: number; // minutos
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  date: string;
  createdAt: string;
}

export default function ExercisesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch exercises
  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/exercises', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();
      return data.exercises || [];
    }
  });

  // Delete exercise
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:3000/api/exercises/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete exercise');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });

  // Calculate totals
  const today = new Date().toISOString().split('T')[0];
  const todayExercises = exercises?.filter((ex: Exercise) => 
    ex.date === today
  ) || [];
  
  const totalDuration = todayExercises.reduce((sum: number, ex: Exercise) => 
    sum + ex.duration, 0
  );
  const totalCalories = todayExercises.reduce((sum: number, ex: Exercise) => 
    sum + ex.caloriesBurned, 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercícios</h1>
          <p className="text-gray-600 mt-1">
            Registre suas atividades físicas e acompanhe seu gasto calórico
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Exercício
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Duração Hoje</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {totalDuration}
                <span className="text-lg text-gray-600 ml-1">min</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calorias Queimadas</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {totalCalories}
                <span className="text-lg text-gray-600 ml-1">kcal</span>
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exercícios Hoje</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {todayExercises.length}
                <span className="text-lg text-gray-600 ml-1">
                  {todayExercises.length === 1 ? 'atividade' : 'atividades'}
                </span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-20"
          onClick={() => setShowAddModal(true)}
        >
          <div className="flex flex-col items-center">
            <Dumbbell className="w-6 h-6 mb-2" />
            <span>Musculação</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20"
          onClick={() => setShowAddModal(true)}
        >
          <div className="flex flex-col items-center">
            <Play className="w-6 h-6 mb-2" />
            <span>Corrida</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20"
          onClick={() => setShowAddModal(true)}
        >
          <div className="flex flex-col items-center">
            <Clock className="w-6 h-6 mb-2" />
            <span>Caminhada</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20"
          onClick={() => setShowAddModal(true)}
        >
          <div className="flex flex-col items-center">
            <Plus className="w-6 h-6 mb-2" />
            <span>Outro</span>
          </div>
        </Button>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico de Exercícios</h2>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          </div>
        )}

        {!isLoading && exercises && exercises.length === 0 && (
          <Card className="p-12 text-center">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum exercício registrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece a registrar suas atividades físicas
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Exercício
            </Button>
          </Card>
        )}

        {!isLoading && exercises && exercises.length > 0 && (
          <div className="grid gap-4">
            {exercises.map((exercise: Exercise) => (
              <Card key={exercise.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Dumbbell className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(exercise.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {exercise.duration} minutos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-700">
                          {exercise.caloriesBurned} kcal
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          exercise.intensity === 'high' ? 'bg-red-100 text-red-800' :
                          exercise.intensity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {exercise.intensity === 'high' && 'Alta Intensidade'}
                          {exercise.intensity === 'moderate' && 'Intensidade Moderada'}
                          {exercise.intensity === 'low' && 'Baixa Intensidade'}
                        </span>
                      </div>
                    </div>

                    {exercise.notes && (
                      <p className="text-sm text-gray-600 mt-3">
                        {exercise.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(exercise.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <AddExerciseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
          }}
        />
      )}
    </div>
  );
}

// Add Exercise Modal Component
function AddExerciseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'>('cardio');
  const [duration, setDuration] = useState('30');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [notes, setNotes] = useState('');

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3000/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          type,
          duration: parseInt(duration),
          caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : Math.round(parseInt(duration) * 5),
          intensity,
          notes,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (!res.ok) throw new Error('Failed to add exercise');
      return res.json();
    },
    onSuccess
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 p-6">
        <h2 className="text-2xl font-bold mb-6">Adicionar Exercício</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do Exercício</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corrida no parque"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="cardio">Cardio</option>
              <option value="strength">Musculação</option>
              <option value="flexibility">Flexibilidade</option>
              <option value="sports">Esportes</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Calorias Queimadas (opcional)</label>
            <Input
              type="number"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              placeholder="Deixe vazio para calcular automaticamente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Intensidade</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="low">Baixa</option>
              <option value="moderate">Moderada</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Adicione detalhes sobre o treino..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!name || !duration || addMutation.isPending}
            className="flex-1"
          >
            {addMutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

