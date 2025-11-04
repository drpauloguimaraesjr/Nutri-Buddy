'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Droplets,
  Target,
  Clock,
  ChefHat,
  Activity,
  MessageSquare,
  BarChart3,
  Gift,
  X,
  Sparkles,
  Ruler,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Menu items organizados por seções - estilo OpenAI Platform
const menuSections = [
  {
    title: 'Create',
    items: [
      {
        title: 'Chat IA',
        icon: MessageSquare,
        href: '/chat',
      },
      {
        title: 'Refeições',
        icon: Utensils,
        href: '/meals',
      },
      {
        title: 'Receitas',
        icon: ChefHat,
        href: '/recipes',
      },
    ],
  },
  {
    title: 'Manage',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        title: 'Exercícios',
        icon: Dumbbell,
        href: '/exercises',
      },
      {
        title: 'Hidratação',
        icon: Droplets,
        href: '/water',
      },
      {
        title: 'Jejum',
        icon: Clock,
        href: '/fasting',
      },
      {
        title: 'Glicemia',
        icon: Activity,
        href: '/glucose',
      },
      {
        title: 'Medidas',
        icon: Ruler,
        href: '/measurements',
      },
    ],
  },
  {
    title: 'Optimize',
    items: [
      {
        title: 'Metas',
        icon: Target,
        href: '/goals',
      },
      {
        title: 'Relatórios',
        icon: BarChart3,
        href: '/reports',
      },
      {
        title: 'Benefícios',
        icon: Gift,
        href: '/benefits',
      },
    ],
  },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'tween', duration: 0.2 }}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64',
          'sidebar-dark overflow-y-auto',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  NutriBuddy
                </h1>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden btn-icon"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {/* Section Title */}
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: (sectionIndex * 0.1) + (itemIndex * 0.03),
                          duration: 0.2,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 group relative',
                            isActive
                              ? 'bg-secondary text-foreground'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}

                          {/* Icon */}
                          <Icon
                            className={cn(
                              'h-5 w-5 flex-shrink-0 transition-colors',
                              isActive ? 'text-primary' : 'text-current'
                            )}
                          />

                          {/* Label */}
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer - User/Settings placeholder */}
          <div className="p-4 border-t border-border">
            <div className="surface-dark p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Premium</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Desbloqueie recursos exclusivos
              </p>
              <button className="btn-primary w-full text-sm py-1.5">
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
