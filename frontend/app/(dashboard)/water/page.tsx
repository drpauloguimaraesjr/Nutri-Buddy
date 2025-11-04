'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { waterAPI } from '@/lib/api';
import { Droplets, Plus, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';

export default function WaterPage() {
  const queryClient = useQueryClient();
  const { addWater: addWaterToStore } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customAmount, setCustomAmount] = useState('');

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateString === format(new Date(), 'yyyy-MM-dd');

  // Fetch today's water intake
  const { data: waterData, isLoading } = useQuery({
    queryKey: ['water', dateString],
    queryFn: () => waterAPI.getToday(),
    enabled: isToday,
  });

  const totalAmount = waterData?.data?.data?.totalAmount || 0;
  const goal = waterData?.data?.data?.goal || 2500;
  const entries = waterData?.data?.data?.entries || [];

  // Add water mutation
  const addWaterMutation = useMutation({
    mutationFn: (amount: number) => waterAPI.add(amount),
    onSuccess: (_, amount) => {
      queryClient.invalidateQueries({ queryKey: ['water'] });
      addWaterToStore(amount);
      toast.success(`${amount}ml adicionados!`);
    },
    onError: () => {
      toast.error('Erro ao adicionar água');
    },
  });

  const handleAddWater = (amount: number) => {
    if (!isToday) {
      toast.error('Só é possível adicionar água para hoje');
      return;
    }
    addWaterMutation.mutate(amount);
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }
    handleAddWater(amount);
    setCustomAmount('');
  };

  const percentage = Math.min((totalAmount / goal) * 100, 100);
  const glassHeight = Math.min(percentage, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Água</h1>
          <p className="text-gray-600 mt-1">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Main Progress Card */}
      <Card>
        <CardContent className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Glass Animation */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-3xl border-4 border-blue-300 overflow-hidden">
                {/* Water fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000 ease-out"
                  style={{ height: `${glassHeight}%` }}
                >
                  {/* Waves effect */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-blue-300 opacity-50 animate-pulse" />
                </div>

                {/* Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white drop-shadow-lg">
                      {Math.round(percentage)}%
                    </p>
                    <p className="text-white drop-shadow-lg mt-2">
                      {totalAmount}ml / {goal}ml
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-gray-900">{totalAmount}ml</p>
                <p className="text-gray-600">consumidos hoje</p>
                <p className="text-sm text-gray-500 mt-1">
                  Faltam {Math.max(0, goal - totalAmount)}ml para sua meta
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Adicionar Água Rapidamente
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAddWater(100)}
                    variant="outline"
                    className="h-20 flex-col"
                    disabled={!isToday || addWaterMutation.isPending}
                  >
                    <Droplets className="w-6 h-6 mb-1 text-blue-500" />
                    <span className="font-semibold">100ml</span>
                    <span className="text-xs text-gray-500">Copo pequeno</span>
                  </Button>

                  <Button
                    onClick={() => handleAddWater(250)}
                    variant="outline"
                    className="h-20 flex-col"
                    disabled={!isToday || addWaterMutation.isPending}
                  >
                    <Droplets className="w-6 h-6 mb-1 text-blue-500" />
                    <span className="font-semibold">250ml</span>
                    <span className="text-xs text-gray-500">Copo médio</span>
                  </Button>

                  <Button
                    onClick={() => handleAddWater(500)}
                    variant="outline"
                    className="h-20 flex-col"
                    disabled={!isToday || addWaterMutation.isPending}
                  >
                    <Droplets className="w-6 h-6 mb-1 text-blue-500" />
                    <span className="font-semibold">500ml</span>
                    <span className="text-xs text-gray-500">Garrafa</span>
                  </Button>

                  <Button
                    onClick={() => handleAddWater(1000)}
                    variant="outline"
                    className="h-20 flex-col"
                    disabled={!isToday || addWaterMutation.isPending}
                  >
                    <Droplets className="w-6 h-6 mb-1 text-blue-500" />
                    <span className="font-semibold">1000ml</span>
                    <span className="text-xs text-gray-500">Garrafa grande</span>
                  </Button>
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Quantidade Personalizada
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Ex: 350"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isToday}
                  />
                  <Button
                    onClick={handleCustomAmount}
                    disabled={!isToday || !customAmount || addWaterMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-4">
                <ProgressBar
                  value={totalAmount}
                  max={goal}
                  label="Progresso Diário"
                  color="blue"
                  showPercentage={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's History */}
      {isToday && entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Histórico de Hoje ({entries.length} registros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{entry.amount}ml</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {entry.timestamp
                      ? format(new Date(entry.timestamp), 'HH:mm')
                      : 'Agora'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Dicas de Hidratação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              Beba água ao acordar para hidratar o corpo após o sono
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              Mantenha uma garrafa de água sempre por perto
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              Beba água antes, durante e depois dos exercícios
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              Se sentir sede, seu corpo já está levemente desidratado
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              A cor da urina é um bom indicador: deve ser amarelo claro
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

