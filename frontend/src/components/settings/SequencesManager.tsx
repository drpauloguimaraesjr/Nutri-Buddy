'use client';

import { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SequenceMessage {
  dayTrigger?: number;
  dayOfWeek?: number;
  hour?: number;
  text: string;
}

interface Sequence {
  active: boolean;
  messages: SequenceMessage[];
}

interface SequencesManagerProps {
  sequences: { [key: string]: Sequence };
  onChange: (sequences: SequencesManagerProps['sequences']) => void;
}

const SEQUENCE_TEMPLATES = {
  newPatient: {
    name: 'Paciente Novo',
    description: 'Mensagens de boas-vindas e acompanhamento inicial',
    icon: '👋',
  },
  lostPatient: {
    name: 'Paciente Sumiu',
    description: 'Resgatar pacientes que pararam de responder',
    icon: '🔄',
  },
  weekend: {
    name: 'Final de Semana',
    description: 'Lembretes para o fim de semana',
    icon: '🎉',
  },
};

export default function SequencesManager({ sequences, onChange }: SequencesManagerProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    onChange({
      ...sequences,
      [key]: { ...sequences[key], active: !sequences[key].active },
    });
  };

  const handleAddMessage = (key: string) => {
    onChange({
      ...sequences,
      [key]: {
        ...sequences[key],
        messages: [
          ...sequences[key].messages,
          { dayTrigger: 1, text: '' },
        ],
      },
    });
  };

  const handleUpdateMessage = (key: string, index: number, message: SequenceMessage) => {
    const updated = [...sequences[key].messages];
    updated[index] = message;

    onChange({
      ...sequences,
      [key]: {
        ...sequences[key],
        messages: updated,
      },
    });
  };

  const handleDeleteMessage = (key: string, index: number) => {
    onChange({
      ...sequences,
      [key]: {
        ...sequences[key],
        messages: sequences[key].messages.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sequências de Follow-up</h3>
            <p className="text-sm text-gray-600">
              Mensagens automáticas enviadas em momentos específicos
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {Object.entries(sequences).map(([key, sequence]) => {
          const template = SEQUENCE_TEMPLATES[key as keyof typeof SEQUENCE_TEMPLATES];
          const isExpanded = expandedKey === key;

          return (
            <div
              key={key}
              className={`rounded-lg border transition ${
                sequence.active
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template?.icon || '📅'}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {template?.name || key}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {template?.description || 'Sequência personalizada'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {sequence.messages.length} mensagem(ns) configurada(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(key)}
                    className={`transition ${
                      sequence.active
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {sequence.active ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedKey(isExpanded ? null : key)}
                  >
                    {isExpanded ? 'Recolher' : 'Editar'}
                  </Button>
                </div>
              </div>

              {/* Mensagens (expandido) */}
              {isExpanded && (
                <div className="space-y-3 border-t border-gray-100 p-4">
                  {sequence.messages.map((message, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={message.dayTrigger || 0}
                          onChange={(e) =>
                            handleUpdateMessage(key, index, {
                              ...message,
                              dayTrigger: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          min="0"
                        />
                        <span className="text-sm text-gray-600">dias depois</span>
                        <button
                          onClick={() => handleDeleteMessage(key, index)}
                          className="ml-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <textarea
                        value={message.text}
                        onChange={(e) =>
                          handleUpdateMessage(key, index, {
                            ...message,
                            text: e.target.value,
                          })
                        }
                        placeholder="Mensagem que será enviada..."
                        className="w-full rounded border border-gray-300 px-2 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        rows={2}
                      />
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMessage(key)}
                    className="w-full"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar Mensagem
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p>
            <strong>Como funciona:</strong> As sequências são ativadas automaticamente pelo N8N
            baseado no tempo. Por exemplo, "Paciente Novo" envia mensagens 1, 3, 7 dias após o
            cadastro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

