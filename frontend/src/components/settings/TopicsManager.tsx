'use client';

import { useState } from 'react';
import { Target, Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Topic {
  enabled: boolean;
  name: string;
  approach: string;
  frequency: string;
}

interface TopicsManagerProps {
  topics: { [key: string]: Topic };
  onChange: (topics: TopicsManagerProps['topics']) => void;
}

const FREQUENCY_OPTIONS = [
  { value: '2x_day', label: '2x ao dia' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'when_patient_fails', label: 'Quando paciente erra' },
  { value: 'friday', label: 'Toda sexta-feira' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'always', label: 'Em toda resposta' },
];

export default function TopicsManager({ topics, onChange }: TopicsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<Topic>({
    enabled: true,
    name: '',
    approach: '',
    frequency: 'always',
  });

  const handleAdd = () => {
    if (!newTopic.name.trim() || !newTopic.approach.trim()) return;

    const key = newTopic.name.toLowerCase().replace(/\s+/g, '_');
    onChange({
      ...topics,
      [key]: { ...newTopic },
    });

    setNewTopic({ enabled: true, name: '', approach: '', frequency: 'always' });
    setIsAdding(false);
  };

  const handleEdit = (key: string, updatedTopic: Topic) => {
    onChange({
      ...topics,
      [key]: updatedTopic,
    });
    setEditingKey(null);
  };

  const handleDelete = (key: string) => {
    const { [key]: _, ...rest } = topics;
    onChange(rest);
  };

  const handleToggle = (key: string) => {
    onChange({
      ...topics,
      [key]: { ...topics[key], enabled: !topics[key].enabled },
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tópicos Principais</h3>
              <p className="text-sm text-gray-600">
                Assuntos que você sempre aborda nas conversas
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Tópico
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* Formulário de novo tópico */}
        {isAdding && (
          <div className="space-y-3 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-4">
            <input
              type="text"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              placeholder="Nome do tópico (ex: Hidratação)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <textarea
              value={newTopic.approach}
              onChange={(e) => setNewTopic({ ...newTopic, approach: e.target.value })}
              placeholder="Como você aborda este tema? (ex: Sempre lembrar de beber 2-3L de água)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              rows={2}
            />
            <select
              value={newTopic.frequency}
              onChange={(e) => setNewTopic({ ...newTopic, frequency: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                <Check className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTopic({ enabled: true, name: '', approach: '', frequency: 'always' });
                }}
                size="sm"
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de tópicos */}
        <div className="space-y-3">
          {Object.entries(topics).length === 0 && !isAdding && (
            <p className="text-center text-sm text-gray-400 py-8">
              Nenhum tópico configurado ainda. Clique em "Adicionar Tópico" para começar.
            </p>
          )}

          {Object.entries(topics).map(([key, topic]) => (
            <div
              key={key}
              className={`rounded-lg border p-4 transition ${
                topic.enabled
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              {editingKey === key ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={topic.name}
                    onChange={(e) =>
                      onChange({
                        ...topics,
                        [key]: { ...topic, name: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <textarea
                    value={topic.approach}
                    onChange={(e) =>
                      onChange({
                        ...topics,
                        [key]: { ...topic, approach: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    rows={2}
                  />
                  <select
                    value={topic.frequency}
                    onChange={(e) =>
                      onChange({
                        ...topics,
                        [key]: { ...topic, frequency: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingKey(null)} size="sm">
                      <Check className="mr-1 h-4 w-4" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingKey(null)} size="sm">
                      <X className="mr-1 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{topic.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{topic.approach}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Frequência:{' '}
                        {FREQUENCY_OPTIONS.find((f) => f.value === topic.frequency)?.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(key)}
                        className={`transition ${
                          topic.enabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        {topic.enabled ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingKey(key)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

