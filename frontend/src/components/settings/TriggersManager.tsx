'use client';

import { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, X, Check, AlertTriangle, Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Trigger {
  response: string;
  alertPrescriber: boolean;
  urgency?: 'low' | 'medium' | 'high';
}

interface TriggersManagerProps {
  triggers: { [key: string]: Trigger };
  onChange: (triggers: TriggersManagerProps['triggers']) => void;
}

export default function TriggersManager({ triggers, onChange }: TriggersManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState({
    keyword: '',
    response: '',
    alertPrescriber: false,
    urgency: 'low' as Trigger['urgency'],
  });

  const handleAdd = () => {
    if (!newTrigger.keyword.trim() || !newTrigger.response.trim()) return;

    onChange({
      ...triggers,
      [newTrigger.keyword.toLowerCase()]: {
        response: newTrigger.response,
        alertPrescriber: newTrigger.alertPrescriber,
        urgency: newTrigger.urgency,
      },
    });

    setNewTrigger({ keyword: '', response: '', alertPrescriber: false, urgency: 'low' });
    setIsAdding(false);
  };

  const handleDelete = (key: string) => {
    const { [key]: _, ...rest } = triggers;
    onChange(rest);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUrgencyBg = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 border-red-200';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gatilhos Inteligentes</h3>
              <p className="text-sm text-gray-600">
                Respostas automáticas quando paciente menciona palavras-chave
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Gatilho
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* Formulário de novo gatilho */}
        {isAdding && (
          <div className="space-y-3 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-4">
            <input
              type="text"
              value={newTrigger.keyword}
              onChange={(e) => setNewTrigger({ ...newTrigger, keyword: e.target.value })}
              placeholder='Palavra/frase gatilho (ex: "fiz besteira", "quero desistir")'
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <textarea
              value={newTrigger.response}
              onChange={(e) => setNewTrigger({ ...newTrigger, response: e.target.value })}
              placeholder="Resposta que a IA deve dar..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              rows={2}
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newTrigger.alertPrescriber}
                  onChange={(e) =>
                    setNewTrigger({ ...newTrigger, alertPrescriber: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Alertar prescritor</span>
              </label>

              {newTrigger.alertPrescriber && (
                <select
                  value={newTrigger.urgency}
                  onChange={(e) =>
                    setNewTrigger({ ...newTrigger, urgency: e.target.value as Trigger['urgency'] })
                  }
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="low">Urgência Baixa</option>
                  <option value="medium">Urgência Média</option>
                  <option value="high">Urgência Alta</option>
                </select>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                <Check className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTrigger({ keyword: '', response: '', alertPrescriber: false, urgency: 'low' });
                }}
                size="sm"
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de gatilhos */}
        <div className="space-y-3">
          {Object.entries(triggers).length === 0 && !isAdding && (
            <p className="text-center text-sm text-gray-400 py-8">
              Nenhum gatilho configurado ainda. Clique em "Adicionar Gatilho" para começar.
            </p>
          )}

          {Object.entries(triggers).map(([keyword, trigger]) => (
            <div
              key={keyword}
              className={`rounded-lg border p-4 ${getUrgencyBg(trigger.urgency)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${getUrgencyColor(trigger.urgency)}`} />
                    <h4 className="font-semibold text-gray-900">"{keyword}"</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">→ {trigger.response}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    {trigger.alertPrescriber ? (
                      <>
                        <span className="flex items-center gap-1 text-red-600">
                          <Bell className="h-3 w-3" />
                          Alerta ativado
                        </span>
                        {trigger.urgency && (
                          <span className={`font-medium ${getUrgencyColor(trigger.urgency)}`}>
                            {trigger.urgency === 'high' && '🔴 Urgência Alta'}
                            {trigger.urgency === 'medium' && '🟡 Urgência Média'}
                            {trigger.urgency === 'low' && '🟢 Urgência Baixa'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500">
                        <BellOff className="h-3 w-3" />
                        Sem alerta
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(keyword)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            <strong>Dica:</strong> Gatilhos são ativados quando o paciente menciona a palavra/frase
            exata na mensagem (não diferencia maiúsculas/minúsculas).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

