export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  foreground: string;
  meta: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  preview: string; // Color for preview card
}

export type ThemeId = 'tailadmin-classic' | 'tailadmin-ocean' | 'tailadmin-purple' | 'tailadmin-nature' | 'custom';

