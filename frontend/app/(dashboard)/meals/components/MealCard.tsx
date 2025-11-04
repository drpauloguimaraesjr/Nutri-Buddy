import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MealCardProps {
  meal: any;
  onEdit: (meal: any) => void;
  onDelete: (id: string) => void;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

const mealTypeColors: Record<string, string> = {
  breakfast: 'bg-yellow-100 text-yellow-700',
  lunch: 'bg-blue-100 text-blue-700',
  dinner: 'bg-purple-100 text-purple-700',
  snack: 'bg-green-100 text-green-700',
};

export default function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Meal Type Badge */}
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  mealTypeColors[meal.type] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {mealTypeLabels[meal.type] || meal.type}
              </span>
              {meal.time && (
                <span className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {meal.time}
                </span>
              )}
            </div>

            {/* Meal Name */}
            <h3 className="font-semibold text-gray-900 mb-2">{meal.name}</h3>

            {/* Foods List */}
            {meal.foods && meal.foods.length > 0 && (
              <div className="space-y-1 mb-3">
                {meal.foods.map((food: any, index: number) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {food.name} - {food.amount}
                    {food.unit}
                  </div>
                ))}
              </div>
            )}

            {/* Image */}
            {meal.imageUrl && (
              <div className="mb-3">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Nutritional Info */}
            <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg p-3">
              <div className="text-center">
                <p className="text-xs text-gray-600">Calorias</p>
                <p className="font-semibold text-gray-900">
                  {meal.calories || 0}
                </p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Proteína</p>
                <p className="font-semibold text-blue-600">
                  {(meal.protein || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Carbs</p>
                <p className="font-semibold text-yellow-600">
                  {(meal.carbs || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Gordura</p>
                <p className="font-semibold text-red-600">
                  {(meal.fats || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(meal)}
              className="p-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(meal.id)}
              className="p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

