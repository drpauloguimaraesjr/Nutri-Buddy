'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mealsAPI } from '@/lib/api';
import { Plus, Camera, Utensils, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import AddMealModal from './components/AddMealModal';
import MealCard from './components/MealCard';

export default function MealsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Fetch meals for selected date
  const { data: mealsData, isLoading } = useQuery({
    queryKey: ['meals', dateString],
    queryFn: () => mealsAPI.getAll({ date: dateString }),
  });

  const meals = mealsData?.data?.data || [];

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: (id: string) => mealsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast.success('Refeição excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir refeição');
    },
  });

  // Calculate totals
  const totals = meals.reduce(
    (acc: any, meal: any) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleDeleteMeal = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta refeição?')) {
      deleteMealMutation.mutate(id);
    }
  };

  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refeições</h1>
          <p className="text-gray-600 mt-1">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Refeição
        </Button>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.setDate(selectedDate.getDate() - 1))
                )
              }
            >
              ← Anterior
            </Button>
            <input
              type="date"
              value={dateString}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.setDate(selectedDate.getDate() + 1))
                )
              }
            >
              Próximo →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Calorias</p>
              <p className="text-2xl font-bold text-gray-900">
                {totals.calories.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Proteína</p>
              <p className="text-2xl font-bold text-blue-600">
                {totals.protein.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Carboidratos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {totals.carbs.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Gorduras</p>
              <p className="text-2xl font-bold text-red-600">
                {totals.fats.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            Refeições do Dia ({meals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
              <p className="text-gray-600 mt-2">Carregando...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Nenhuma refeição registrada hoje
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Refeição
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal: any) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEditMeal}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Meal Modal */}
      {isAddModalOpen && (
        <AddMealModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          date={dateString}
          editingMeal={editingMeal}
        />
      )}
    </div>
  );
}

