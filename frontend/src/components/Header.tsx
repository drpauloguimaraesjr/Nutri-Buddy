'use client';

import Image from 'next/image';
import { Menu, LogOut, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>

          <div className="hidden lg:flex items-center gap-3 mr-4">
            <Image
              src="/logos/nutribuddy-icon.svg"
              alt="NutriBuddy"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Bem-vindo, {user?.displayName || 'Usuário'}!
            </h1>
            <p className="text-sm text-slate-400">
              {user?.role === 'prescriber' && 'Painel do Prescritor'}
              {user?.role === 'patient' && 'Painel do Paciente'}
              {user?.role === 'admin' && 'Painel Administrativo'}
            </p>
          </div>
        </div>

        {/* Right side */}
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => {
              const newTheme = currentTheme.id === 'nutribuddy-dark' ? 'nutribuddy-light' : 'nutribuddy-dark';
              setTheme(newTheme);
            }}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
            title="Alternar Tema (Claro/Escuro)"
          >
            {currentTheme.id === 'nutribuddy-light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-800/50 relative text-slate-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

