'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Settings,
  X,
  FileText,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/chat', icon: MessageCircle, label: 'Conversas', roles: ['prescriber', 'admin'] },
    { href: '/patients', icon: Users, label: 'Pacientes', roles: ['prescriber', 'admin'] },
    { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', roles: ['prescriber', 'admin'] },
    { href: '/plans', icon: FileText, label: 'Planos', roles: ['prescriber'] },
    { href: '/settings', icon: Settings, label: 'Configurações' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed top-0 left-0 h-screen w-64 bg-background/95 backdrop-blur-xl border-r border-border z-50 lg:translate-x-0 lg:z-10"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image 
                  src="/logos/nutribuddy-icon.svg" 
                  alt="NutriBuddy Logo" 
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-high-contrast">NutriBuddy</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-background-secondary"
            >
              <X className="w-5 h-5 text-high-contrast-muted" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'text-high-contrast-muted hover:bg-background-secondary hover:text-high-contrast'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center text-high-contrast font-semibold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-high-contrast truncate">
                  {user?.displayName || 'Usuário'}
                </p>
                <p className="text-xs text-high-contrast-muted truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

