'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEMES } from '@/themes/themes.config';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(currentTheme.id);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
    setTheme(themeId);
  };

  const themesList = Object.values(THEMES);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Tema de Cores</h3>
        <p className="text-sm text-slate-400">
          Escolha o tema de cores que melhor se adapta ao seu estilo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themesList.map((theme) => {
          const isSelected = selectedThemeId === theme.id;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect(theme.id)}
              className="w-full"
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary-500 bg-primary-500/10'
                    : 'hover:border-white/30'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg shadow-lg"
                        style={{ backgroundColor: theme.preview }}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{theme.name}</h4>
                        <p className="text-xs text-slate-400">{theme.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    />
                  </div>
                </div>
              </Card>
            </motion.button>
          );
        })}

        {/* Custom Theme Card */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
          <Card
            className={`cursor-pointer transition-all border-dashed ${
              selectedThemeId === 'custom'
                ? 'ring-2 ring-primary-500 bg-primary-500/10'
                : 'hover:border-white/30'
            }`}
          >
            <div className="p-4 flex flex-col items-center justify-center h-full min-h-[140px]">
              <Palette className="w-8 h-8 text-slate-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Personalizar</h4>
              <p className="text-xs text-slate-400 text-center mb-3">
                Crie seu próprio tema
              </p>
              <Button variant="outline" size="sm">
                Customizar
              </Button>
            </div>
          </Card>
        </motion.button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        <p className="text-sm text-primary-300">
          Tema <strong>{currentTheme.name}</strong> aplicado com sucesso
        </p>
      </div>
    </div>
  );
}
