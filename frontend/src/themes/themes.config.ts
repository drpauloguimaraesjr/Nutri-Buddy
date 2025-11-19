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
};

export const DEFAULT_THEME_ID = 'tailadmin-ocean';

