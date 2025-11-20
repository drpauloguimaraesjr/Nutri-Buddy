import { Theme } from '@/types/theme';

export const THEMES: Record<string, Theme> = {
  'tailadmin-classic': {
    id: 'tailadmin-classic',
    name: 'TailAdmin Classic',
    description: 'Tema profissional com azul corporativo',
    preview: '#3C50E0',
    colors: {
      primary: '#3C50E0',
      secondary: '#10B981',
      background: '#1C2434',
      backgroundSecondary: '#24303F',
      foreground: '#DEE4EE',
      meta: '#64748B',
      accent: '#3C50E0',
    },
  },
  'tailadmin-ocean': {
    id: 'tailadmin-ocean',
    name: 'TailAdmin Ocean',
    description: 'Tema vibrante com tons de oceano',
    preview: '#0EA5E9',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      background: '#0F172A',
      backgroundSecondary: '#1E293B',
      foreground: '#F1F5F9',
      meta: '#64748B',
      accent: '#06B6D4',
    },
  },
  'tailadmin-purple': {
    id: 'tailadmin-purple',
    name: 'TailAdmin Purple',
    description: 'Tema elegante com roxo vibrante',
    preview: '#8B5CF6',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#1E1B4B',
      backgroundSecondary: '#312E81',
      foreground: '#E0E7FF',
      meta: '#94A3B8',
      accent: '#A78BFA',
    },
  },
  'tailadmin-nature': {
    id: 'tailadmin-nature',
    name: 'TailAdmin Nature',
    description: 'Tema natural com verde profissional',
    preview: '#10B981',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#064E3B',
      backgroundSecondary: '#065F46',
      foreground: '#D1FAE5',
      meta: '#6EE7B7',
      accent: '#34D399',
    },
  },
  'nutribuddy-dark': {
    id: 'nutribuddy-dark',
    name: 'NutriBuddy Dark (Premium)',
    description: 'Modo escuro premium com aurora boreal',
    preview: '#0EA5E9',
    colors: {
      primary: '#38bdf8', // Sky 400
      secondary: '#34d399', // Emerald 400
      background: '#0f172a', // Slate 900
      backgroundSecondary: '#1e293b', // Slate 800
      foreground: '#f8fafc', // Slate 50
      meta: '#94a3b8', // Slate 400
      accent: '#0ea5e9', // Sky 500
    },
  },
  'nutribuddy-light': {
    id: 'nutribuddy-light',
    name: 'NutriBuddy Light (Premium)',
    description: 'Modo claro premium clean e focado',
    preview: '#0284c7',
    colors: {
      primary: '#0284c7', // Sky 600
      secondary: '#059669', // Emerald 600
      background: '#f0f9ff', // Sky 50
      backgroundSecondary: '#ffffff', // White
      foreground: '#0f172a', // Slate 900
      meta: '#64748b', // Slate 500
      accent: '#0284c7', // Sky 600
    },
  },
};

export const DEFAULT_THEME_ID = 'nutribuddy-dark';

