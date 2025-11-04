'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Plus, Upload, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface GlucoseReading {
  id: string;
  value: number;
  timestamp: string;
  date: string;
  source: string;
  classification: {
    level: string;
    label: string;
    color: string;
  };
  notes?: string;
}

export default function GlucosePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [days, setDays] = useState(7);
  const queryClient = useQueryClient();
  const userId = 'user123'; // Mock

  // Fetch readings
  const { data, isLoading } = useQuery({
    queryKey: ['glucose', userId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const params = new URLSearchParams({
        userId,
        startDate: startDate.toISOString().split('T')[0],
        limit: '200'
      });
      const res = await fetch(`http://localhost:3000/api/glucose?${params}`);
      if (!res.ok) throw new Error('Failed to fetch glucose');
      return res.json();
    }
  });

  // Fetch daily averages
  const { data: dailyData } = useQuery({
    queryKey: ['glucose-daily', userId, days],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/glucose/daily-average?userId=${userId}&days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch daily averages');
      return res.json();
    }
  });

  // Fetch latest reading
  const { data: latestData } = useQuery({
    queryKey: ['glucose-latest', userId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/glucose/latest?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch latest');
      return res.json();
    }
  });

  const readings = data?.readings || [];
  const stats = data?.stats || {};
  const latest = latestData?.reading;
  const dailyAverages = dailyData?.dailyAverages || [];

  // Process data for chart
  const chartData = readings
    .slice(0, 50)
    .reverse()
    .map((r: GlucoseReading) => ({
      time: new Date(r.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: r.value,
      date: r.date
    }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Glicemia</h1>
          <p className="text-gray-600 mt-1">
            Monitore seus níveis de glicose
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Libre
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Leitura
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`p-6 ${latest ? `bg-${latest.classification.color}-50` : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Última Leitura</span>
            <Activity className={`w-5 h-5 text-${latest?.classification.color || 'gray'}-600`} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {latest ? latest.value : '-'}
            <span className="text-lg text-gray-600 ml-1">mg/dL</span>
          </div>
          {latest && (
            <div className={`text-sm mt-2 font-medium text-${latest.classification.color}-600`}>
              {latest.classification.label}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Média</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.average || '-'}
            <span className="text-lg text-gray-600 ml-1">mg/dL</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Últimos {days} dias
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Intervalo</span>
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.min || '-'} - {stats.max || '-'}
            <span className="text-sm text-gray-600 ml-1">mg/dL</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Mínimo - Máximo
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Normal</span>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.normalPercentage || 0}%
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {stats.normalCount || 0} de {stats.total || 0} leituras
          </div>
        </Card>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg transition ${
              days === d
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d} dias
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Evolução da Glicemia</h2>
        
        {isLoading && (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          </div>
        )}

        {!isLoading && chartData.length === 0 && (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma leitura registrada</p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4">
                Adicionar Primeira Leitura
              </Button>
            </div>
          </div>
        )}

        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[60, 180]} />
              <Tooltip />
              <Legend />
              {/* Reference lines for normal range */}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="Mín" />
              <ReferenceLine y={99} stroke="#10b981" strokeDasharray="3 3" label="Ideal" />
              <ReferenceLine y={125} stroke="#f59e0b" strokeDasharray="3 3" label="Máx" />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Glicose (mg/dL)"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Daily Averages */}
      {dailyAverages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Médias Diárias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {dailyAverages.map((day: any) => (
              <div key={day.date} className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-2">
                  {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {day.average}
                </div>
                <div className="text-xs text-gray-500">
                  {day.min} - {day.max}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {day.count} leituras
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Readings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Leituras Recentes</h2>
        
        {readings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhuma leitura registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.slice(0, 10).map((reading: GlucoseReading) => (
              <div key={reading.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${reading.classification.color}-100 flex items-center justify-center`}>
                    <span className={`text-lg font-bold text-${reading.classification.color}-600`}>
                      {reading.value}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{reading.classification.label}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(reading.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {reading.notes && (
                      <div className="text-xs text-gray-500 mt-1">{reading.notes}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {reading.source === 'freestyle-libre' ? '📱 Libre' : '✏️ Manual'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      {showAddModal && (
        <AddReadingModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['glucose'] });
            queryClient.invalidateQueries({ queryKey: ['glucose-latest'] });
            queryClient.invalidateQueries({ queryKey: ['glucose-daily'] });
          }}
          userId={userId}
        />
      )}

      {showImportModal && (
        <ImportLibreModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            queryClient.invalidateQueries({ queryKey: ['glucose'] });
            queryClient.invalidateQueries({ queryKey: ['glucose-latest'] });
            queryClient.invalidateQueries({ queryKey: ['glucose-daily'] });
          }}
          userId={userId}
        />
      )}
    </div>
  );
}

// Add Reading Modal
function AddReadingModal({ onClose, onSuccess, userId }: any) {
  const [formData, setFormData] = useState({
    value: '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3000/api/glucose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          value: parseFloat(formData.value),
          source: 'manual'
        })
      });
      if (!res.ok) throw new Error('Failed to add reading');
      return res.json();
    },
    onSuccess
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Nova Leitura</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Valor (mg/dL) *</label>
            <Input
              type="number"
              step="1"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Ex: 95"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data/Hora *</label>
            <Input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Ex: Antes do café, após exercício..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!formData.value || addMutation.isPending}
            className="flex-1"
          >
            {addMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Import Freestyle Libre Modal
function ImportLibreModal({ onClose, onSuccess, userId }: any) {
  const [csvText, setCsvText] = useState('');

  const importMutation = useMutation({
    mutationFn: async () => {
      // Parse CSV (simple parser - adjust based on Libre format)
      const lines = csvText.split('\n').slice(1); // Skip header
      const readings = lines
        .map(line => {
          const [timestamp, value] = line.split(',');
          if (!timestamp || !value) return null;
          return {
            timestamp: timestamp.trim(),
            value: parseFloat(value.trim())
          };
        })
        .filter(Boolean);

      const res = await fetch('http://localhost:3000/api/glucose/import-libre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, readings })
      });
      if (!res.ok) throw new Error('Failed to import');
      return res.json();
    },
    onSuccess
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6">Importar Freestyle Libre</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-2">📱 Como exportar do Freestyle Libre:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o app LibreLink ou LibreView</li>
              <li>Vá em Relatórios → Exportar Dados</li>
              <li>Escolha o período desejado</li>
              <li>Copie os dados CSV e cole abaixo</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dados CSV</label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              rows={10}
              placeholder="timestamp,value
2024-11-03T10:00:00,95
2024-11-03T11:00:00,102"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: timestamp,value (uma leitura por linha)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={!csvText || importMutation.isPending}
            className="flex-1"
          >
            {importMutation.isPending ? 'Importando...' : 'Importar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

