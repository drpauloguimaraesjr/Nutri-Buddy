'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, Ruler, TrendingDown, TrendingUp, Minus, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Measurement {
  id: string;
  userId: string;
  date: string;
  weight: number;
  height?: number;
  bmi?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arm?: number;
  thigh?: number;
  calf?: number;
  neck?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  createdAt: string;
}

export default function MeasurementsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const userId = 'user123'; // Mock

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch measurements
  const { data, isLoading } = useQuery({
    queryKey: ['measurements', userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/measurements?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch measurements');
      return res.json();
    }
  });

  const measurements = data?.measurements || [];
  const stats = data?.stats || {};

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-yellow-600' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-orange-600' };
    return { label: 'Obesidade', color: 'text-red-600' };
  };

  const latest = measurements[0];
  const bmiCategory = latest?.bmi ? getBMICategory(latest.bmi) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medidas Corporais</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe sua evolução física
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Medida
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Peso Atual</span>
            <Scale className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {latest?.weight || '-'}
            <span className="text-lg text-gray-600 ml-1">kg</span>
          </div>
          {stats.weightChange !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              stats.trend === 'down' ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {stats.trend === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : stats.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{Math.abs(stats.weightChange)} kg</span>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">IMC</span>
            <Ruler className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {latest?.bmi || '-'}
          </div>
          {bmiCategory && (
            <div className={`text-sm mt-2 font-medium ${bmiCategory.color}`}>
              {bmiCategory.label}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Medições</span>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalMeasurements || 0}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Registros totais
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Gordura</span>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {latest?.bodyFat || '-'}
            <span className="text-lg text-gray-600 ml-1">%</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Corporal
          </div>
        </Card>
      </div>

      {/* Weight Chart */}
      {measurements.length > 1 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Evolução do Peso</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {measurements.slice(0, 10).reverse().map((m: Measurement) => {
              const maxWeight = Math.max(...measurements.map((item: Measurement) => item.weight));
              const height = (m.weight / maxWeight) * 100;
              
              return (
                <div key={m.id} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-gray-900">
                    {m.weight}kg
                  </div>
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-600">
                    {new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Latest Measurements */}
      {latest && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Últimas Medidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cintura', value: latest.waist, unit: 'cm' },
              { label: 'Peito', value: latest.chest, unit: 'cm' },
              { label: 'Quadril', value: latest.hips, unit: 'cm' },
              { label: 'Braço', value: latest.arm, unit: 'cm' },
              { label: 'Coxa', value: latest.thigh, unit: 'cm' },
              { label: 'Panturrilha', value: latest.calf, unit: 'cm' },
              { label: 'Pescoço', value: latest.neck, unit: 'cm' },
              { label: 'Massa Muscular', value: latest.muscleMass, unit: 'kg' }
            ].map((item) => (
              item.value && (
                <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {item.value}
                    <span className="text-sm text-gray-600 ml-1">{item.unit}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Histórico</h3>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          </div>
        )}

        {!isLoading && measurements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Scale className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma medida registrada</p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              Adicionar Primeira Medida
            </Button>
          </div>
        )}

        {measurements.length > 0 && (
          <div className="space-y-3">
            {measurements.map((m: Measurement) => (
              <div key={m.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {new Date(m.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Peso: {m.weight}kg {m.bmi && `• IMC: ${m.bmi}`}
                    {m.bodyFat && ` • Gordura: ${m.bodyFat}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <AddMeasurementModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['measurements'] });
          }}
          userId={userId}
        />
      )}
    </div>
  );
}

// Add Measurement Modal
function AddMeasurementModal({ onClose, onSuccess, userId }: any) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    waist: '',
    chest: '',
    hips: '',
    arm: '',
    thigh: '',
    calf: '',
    neck: '',
    bodyFat: '',
    muscleMass: '',
    notes: ''
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...Object.fromEntries(
            Object.entries(formData).filter(([_, v]) => v !== '')
          )
        })
      });
      if (!res.ok) throw new Error('Failed to add measurement');
      return res.json();
    },
    onSuccess
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Nova Medida</h2>

        <div className="space-y-6">
          {/* Básico */}
          <div>
            <h3 className="font-semibold mb-3">Básico</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Peso (kg) *</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Altura (cm)</label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Circunferências */}
          <div>
            <h3 className="font-semibold mb-3">Circunferências (cm)</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'waist', label: 'Cintura' },
                { key: 'chest', label: 'Peito' },
                { key: 'hips', label: 'Quadril' },
                { key: 'arm', label: 'Braço' },
                { key: 'thigh', label: 'Coxa' },
                { key: 'calf', label: 'Panturrilha' },
                { key: 'neck', label: 'Pescoço' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Composição */}
          <div>
            <h3 className="font-semibold mb-3">Composição Corporal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gordura Corporal (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Massa Muscular (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Adicione observações..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!formData.weight || addMutation.isPending}
            className="flex-1"
          >
            {addMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

