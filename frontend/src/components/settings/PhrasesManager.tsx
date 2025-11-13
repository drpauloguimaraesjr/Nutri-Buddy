'use client';

import { useState } from 'react';
import { MessageCircle, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PhrasesManagerProps {
  phrases: {
    motivation: string[];
    celebration: string[];
    correction: string[];
    rescue: string[];
  };
  onChange: (phrases: PhrasesManagerProps['phrases']) => void;
}

type PhraseCategory = keyof PhrasesManagerProps['phrases'];

const CATEGORY_CONFIG = {
  motivation: {
    title: 'Motivação',
    icon: '🎯',
    description: 'Frases para motivar o paciente',
    color: 'blue',
  },
  celebration: {
    title: 'Celebração de Vitórias',
    icon: '🎉',
    description: 'Quando o paciente faz algo bem',
    color: 'green',
  },
  correction: {
    title: 'Correção Gentil',
    icon: '💙',
    description: 'Quando o paciente desvia do plano',
    color: 'yellow',
  },
  rescue: {
    title: 'Resgate de Paciente Ausente',
    icon: '🔄',
    description: 'Quando o paciente para de responder',
    color: 'purple',
  },
};

export default function PhrasesManager({ phrases, onChange }: PhrasesManagerProps) {
  const [editingCategory, setEditingCategory] = useState<PhraseCategory | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newPhraseText, setNewPhraseText] = useState('');

  const handleAdd = (category: PhraseCategory) => {
    if (!newPhraseText.trim()) return;

    onChange({
      ...phrases,
      [category]: [...phrases[category], newPhraseText.trim()],
    });
    setNewPhraseText('');
    setEditingCategory(null);
  };

  const handleEdit = (category: PhraseCategory, index: number) => {
    if (!editingText.trim()) return;

    const updated = [...phrases[category]];
    updated[index] = editingText.trim();

    onChange({
      ...phrases,
      [category]: updated,
    });
    setEditingIndex(null);
    setEditingText('');
  };

  const handleDelete = (category: PhraseCategory, index: number) => {
    onChange({
      ...phrases,
      [category]: phrases[category].filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Frases de Efeito</h3>
            <p className="text-sm text-gray-600">
              Configure frases que a IA usará nas conversas
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {(Object.keys(CATEGORY_CONFIG) as PhraseCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryPhrases = phrases[category];

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{config.title}</h4>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(editingCategory === category ? null : category)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {/* Lista de frases */}
              <div className="space-y-2">
                {categoryPhrases.map((phrase, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEdit(category, index)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingText('');
                          }}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="flex-1 text-sm text-gray-700">{phrase}</p>
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingText(phrase);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {categoryPhrases.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-2">
                    Nenhuma frase adicionada ainda
                  </p>
                )}
              </div>

              {/* Adicionar nova frase */}
              {editingCategory === category && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhraseText}
                    onChange={(e) => setNewPhraseText(e.target.value)}
                    placeholder="Digite a nova frase..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd(category)}
                    autoFocus
                  />
                  <Button onClick={() => handleAdd(category)} size="sm">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewPhraseText('');
                    }}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

