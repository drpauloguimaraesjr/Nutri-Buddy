'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Plus, Clock, Users, Star, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  category: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
  instructions: string[];
  imageUrl?: string;
  tags: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  timesUsed: number;
  isFavorite: boolean;
}

const CATEGORIES = ['Todos', 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Sobremesa', 'Outros'];

export default function RecipesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const userId = 'user123'; // Mock
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch recipes
  const { data, isLoading } = useQuery({
    queryKey: ['recipes', userId, selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId,
        ...(selectedCategory !== 'Todos' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });
      const res = await fetch(`${API_URL}/api/recipes?${params}`);
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    }
  });

  const recipes = data?.recipes || [];

  // Delete recipe
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/recipes/${id}?userId=${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  // Toggle favorite
  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const res = await fetch(`${API_URL}/api/recipes/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isFavorite })
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas receitas e use-as proporcionalmente
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Category Filter */}
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar receitas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Recipes Grid */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
        </div>
      )}

      {!isLoading && recipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nenhuma receita encontrada</p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4">
            Adicionar Primeira Receita
          </Button>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: Recipe) => (
            <Card key={recipe.id} className="p-6 hover:shadow-lg transition cursor-pointer">
              <div onClick={() => setSelectedRecipe(recipe)}>
                {/* Image */}
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg mb-4 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-emerald-600" />
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg flex-1">{recipe.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      favoriteMutation.mutate({ id: recipe.id, isFavorite: !recipe.isFavorite });
                    }}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        recipe.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.totalTime}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} porções</span>
                  </div>
                </div>

                {/* Nutrition */}
                <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold">{recipe.nutrition.calories}</div>
                    <div className="text-gray-600">kcal</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-semibold text-blue-600">{recipe.nutrition.protein}g</div>
                    <div className="text-gray-600">Prot</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded text-center">
                    <div className="font-semibold text-orange-600">{recipe.nutrition.carbs}g</div>
                    <div className="text-gray-600">Carb</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <div className="font-semibold text-yellow-600">{recipe.nutrition.fat}g</div>
                    <div className="text-gray-600">Gord</div>
                  </div>
                </div>

                {/* Category & Times Used */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                  <span>Usado {recipe.timesUsed}x</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(recipe.id);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecipe(recipe);
                  }}
                  className="flex-1"
                >
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddRecipeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
          }}
          userId={userId}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          userId={userId}
        />
      )}
    </div>
  );
}

// Add Recipe Modal
function AddRecipeModal({ onClose, onSuccess, userId }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servings: '1',
    prepTime: '',
    cookTime: '',
    category: 'Almoço',
    tags: ''
  });

  const [ingredients, setIngredients] = useState([
    { name: '', amount: '', unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }
  ]);

  const [instructions, setInstructions] = useState(['']);

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          servings: parseInt(formData.servings),
          prepTime: parseInt(formData.prepTime) || 0,
          cookTime: parseInt(formData.cookTime) || 0,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          ingredients: ingredients.filter(i => i.name),
          instructions: instructions.filter(Boolean)
        })
      });
      if (!res.ok) throw new Error('Failed to add recipe');
      return res.json();
    },
    onSuccess
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 p-6">
        <h2 className="text-2xl font-bold mb-6">Nova Receita</h2>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Porções *</label>
              <Input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preparo (min)</label>
              <Input
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cozimento (min)</label>
              <Input
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Ingredientes *</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIngredients([...ingredients, { name: '', amount: '', unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 }])}
              >
                + Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2">
                  <Input
                    placeholder="Nome"
                    value={ing.name}
                    onChange={(e) => {
                      const newIng = [...ingredients];
                      newIng[idx].name = e.target.value;
                      setIngredients(newIng);
                    }}
                    className="col-span-2"
                  />
                  <Input
                    placeholder="Qtd"
                    value={ing.amount}
                    onChange={(e) => {
                      const newIng = [...ingredients];
                      newIng[idx].amount = e.target.value;
                      setIngredients(newIng);
                    }}
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      const newIng = [...ingredients];
                      newIng[idx].unit = e.target.value;
                      setIngredients(newIng);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option>g</option>
                    <option>ml</option>
                    <option>un</option>
                    <option>xíc</option>
                    <option>col</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Cal"
                    value={ing.calories || ''}
                    onChange={(e) => {
                      const newIng = [...ingredients];
                      newIng[idx].calories = parseInt(e.target.value) || 0;
                      setIngredients(newIng);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Modo de Preparo</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInstructions([...instructions, ''])}
              >
                + Passo
              </Button>
            </div>
            <div className="space-y-2">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-sm font-medium text-gray-600 mt-2">{idx + 1}.</span>
                  <Input
                    placeholder={`Passo ${idx + 1}`}
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...instructions];
                      newSteps[idx] = e.target.value;
                      setInstructions(newSteps);
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
            <Input
              placeholder="low-carb, fit, vegano"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!formData.name || ingredients.filter(i => i.name).length === 0 || addMutation.isPending}
            className="flex-1"
          >
            {addMutation.isPending ? 'Salvando...' : 'Salvar Receita'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Recipe Detail Modal
function RecipeDetailModal({ recipe, onClose, userId }: any) {
  const [servingsToUse, setServingsToUse] = useState('1');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/recipes/${recipe.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          servingsUsed: parseFloat(servingsToUse),
          mealType: 'Almoço'
        })
      });
      if (!res.ok) throw new Error('Failed to use recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      onClose();
    }
  });

  const ratio = parseFloat(servingsToUse) / recipe.servings;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{recipe.name}</h2>
            <p className="text-gray-600 mt-1">{recipe.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-medium">Tempo Total</div>
                <div className="text-gray-600">{recipe.totalTime} minutos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-medium">Porções</div>
                <div className="text-gray-600">{recipe.servings}</div>
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <h3 className="font-semibold mb-3">Informação Nutricional (total)</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{recipe.nutrition.calories}</div>
                <div className="text-sm text-gray-600">Calorias</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
                <div className="text-sm text-gray-600">Proteínas</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.carbs}g</div>
                <div className="text-sm text-gray-600">Carboidratos</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{recipe.nutrition.fat}g</div>
                <div className="text-sm text-gray-600">Gorduras</div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold mb-3">Ingredientes</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                  <span>{ing.amount} {ing.unit} {ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Modo de Preparo</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((step: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-semibold text-emerald-600">{idx + 1}.</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Use Recipe */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Usar esta Receita</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adicione proporcionalmente às suas refeições
            </p>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Quantas porções?</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={servingsToUse}
                  onChange={(e) => setServingsToUse(e.target.value)}
                />
              </div>
              
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? 'Adicionando...' : 'Adicionar Refeição'}
              </Button>
            </div>

            {parseFloat(servingsToUse) > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <div className="text-sm text-gray-600 mb-2">Valores nutricionais proporcionais:</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded">
                    <div className="font-semibold">{Math.round(recipe.nutrition.calories * ratio)} kcal</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-semibold">{Math.round(recipe.nutrition.protein * ratio)}g prot</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-semibold">{Math.round(recipe.nutrition.carbs * ratio)}g carb</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-semibold">{Math.round(recipe.nutrition.fat * ratio)}g gord</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

