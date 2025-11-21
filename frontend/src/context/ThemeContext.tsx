'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, ThemeColors } from '@/types/theme';
import { THEMES, DEFAULT_THEME_ID } from '@/themes/themes.config';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  customColors: ThemeColors | null;
  setCustomColors: (colors: ThemeColors) => void;
  applyCustomTheme: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'nutribuddy-theme';
const CUSTOM_COLORS_KEY = 'nutribuddy-custom-colors';
const DARK_MODE_KEY = 'nutribuddy-dark-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[DEFAULT_THEME_ID]);
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem(STORAGE_KEY);
      const savedCustomColors = localStorage.getItem(CUSTOM_COLORS_KEY);
      const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);

      if (savedCustomColors) {
        try {
          setCustomColors(JSON.parse(savedCustomColors));
        } catch (e) {
          console.error('Error loading custom colors:', e);
        }
      }

      if (savedThemeId && THEMES[savedThemeId]) {
        setCurrentTheme(THEMES[savedThemeId]);
      }

      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      }
    }
  }, []);

  // Apply theme colors to CSS variables and dark mode
  useEffect(() => {
    const colors = currentTheme.colors;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Apply dark/light mode
      if (isDarkMode) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }

      root.style.setProperty('--background', colors.background);
      root.style.setProperty('--background-secondary', colors.backgroundSecondary);
      root.style.setProperty('--foreground', colors.foreground);
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--meta', colors.meta);
      root.style.setProperty('--accent', colors.accent);
    }
  }, [currentTheme, isDarkMode]);

  const setTheme = (themeId: string) => {
    if (THEMES[themeId]) {
      setCurrentTheme(THEMES[themeId]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, themeId);
      }
    }
  };

  const applyCustomTheme = () => {
    if (customColors) {
      const customTheme: Theme = {
        id: 'custom',
        name: 'Custom Theme',
        description: 'Seu tema personalizado',
        preview: customColors.primary,
        colors: customColors,
      };
      setCurrentTheme(customTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'custom');
        localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
      }
    }
  };

  const updateCustomColors = (colors: ThemeColors) => {
    setCustomColors(colors);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DARK_MODE_KEY, String(newMode));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        customColors,
        setCustomColors: updateCustomColors,
        applyCustomTheme,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
