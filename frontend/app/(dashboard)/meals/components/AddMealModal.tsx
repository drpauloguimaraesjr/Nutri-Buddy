'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Camera, Upload, Sparkles, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  editingMeal?: any;
}

export default function AddMealModal({
  isOpen,
  onClose,
  date,
  editingMeal,
}: AddMealModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingMeal?.imageUrl || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: editingMeal?.name || '',
    type: editingMeal?.type || 'lunch',
    time: editingMeal?.time || new Date().toTimeString().slice(0, 5),
    calories: editingMeal?.calories || 0,
    protein: editingMeal?.protein || 0,
    carbs: editingMeal?.carbs || 0,
    fats: editingMeal?.fats || 0,
    foods: editingMeal?.foods || [],
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: (data: any) =>
      editingMeal ? mealsAPI.update(editingMeal.id, data) : mealsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast.success(
        editingMeal ? 'Refeição atualizada!' : 'Refeição adicionada!'
      );
      onClose();
    },
    onError: () => {
      toast.error('Erro ao salvar refeição');
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem.');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedFile) {
      toast.error('Por favor, selecione uma imagem primeiro');
      return;
    }

    if (!storage) {
      toast.error('Firebase Storage não está disponível');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `meals/${Date.now()}-${uploadedFile.name}`
      );
      await uploadBytes(storageRef, uploadedFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Analyze with AI
      const response = await mealsAPI.analyze({ imageUrl });
      const analysis = response.data.data;

      // Update form with AI results
      setFormData({
        ...formData,
        name: formData.name || 'Refeição analisada por IA',
        calories: analysis.totalCalories,
        protein: analysis.totalProtein,
        carbs: analysis.totalCarbs,
        fats: analysis.totalFats,
        foods: analysis.foods,
      });

      toast.success('Análise concluída! Revise os valores.');
    } catch (error: any) {
      toast.error('Erro ao analisar imagem');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = editingMeal?.imageUrl;

    // Upload image if new file selected
    if (uploadedFile) {
      if (!storage) {
        toast.error('Firebase Storage não está disponível');
        return;
      }
      
      try {
        const storageRef = ref(
          storage,
          `meals/${Date.now()}-${uploadedFile.name}`
        );
        await uploadBytes(storageRef, uploadedFile);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        toast.error('Erro ao fazer upload da imagem');
        return;
      }
    }

    const mealData = {
      ...formData,
      date,
      imageUrl,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats),
    };

    createMealMutation.mutate(mealData);
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foods: [
        ...formData.foods,
        { name: '', amount: 0, unit: 'g', calories: 0, protein: 0, carbs: 0, fats: 0 },
      ],
    });
  };

  const removeFoodItem = (index: number) => {
    setFormData({
      ...formData,
      foods: formData.foods.filter((_: any, i: number) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingMeal ? 'Editar Refeição' : 'Adicionar Refeição'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto da Refeição (opcional)
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setUploadedFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Adicione uma foto para análise automática
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Foto
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {uploadedFile && !isAnalyzing && (
                <Button
                  type="button"
                  onClick={handleAnalyzeImage}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar com IA
                </Button>
              )}

              {isAnalyzing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Analisando imagem...</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Refeição"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Almoço"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Refeição
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="breakfast">Café da Manhã</option>
                <option value="lunch">Almoço</option>
                <option value="dinner">Jantar</option>
                <option value="snack">Lanche</option>
              </select>
            </div>

            <Input
              label="Horário"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          {/* Nutritional Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Informações Nutricionais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Calorias (kcal)"
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Proteína (g)"
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) =>
                  setFormData({ ...formData, protein: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Carboidratos (g)"
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData({ ...formData, carbs: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Gorduras (g)"
                type="number"
                step="0.1"
                value={formData.fats}
                onChange={(e) =>
                  setFormData({ ...formData, fats: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* Foods List */}
          {formData.foods.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Alimentos</h3>
                <Button type="button" size="sm" onClick={addFoodItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {formData.foods.map((food: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={food.name}
                      onChange={(e) => {
                        const newFoods = [...formData.foods];
                        newFoods[index].name = e.target.value;
                        setFormData({ ...formData, foods: newFoods });
                      }}
                      placeholder="Nome"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={food.amount}
                      onChange={(e) => {
                        const newFoods = [...formData.foods];
                        newFoods[index].amount = Number(e.target.value);
                        setFormData({ ...formData, foods: newFoods });
                      }}
                      placeholder="Qtd"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={food.unit}
                      onChange={(e) => {
                        const newFoods = [...formData.foods];
                        newFoods[index].unit = e.target.value;
                        setFormData({ ...formData, foods: newFoods });
                      }}
                      placeholder="Un"
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoodItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMealMutation.isPending}>
              {editingMeal ? 'Salvar Alterações' : 'Adicionar Refeição'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

