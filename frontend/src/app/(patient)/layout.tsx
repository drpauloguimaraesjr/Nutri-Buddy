'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePatientRoute } from '@/hooks/usePatientRoute';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { loading } = usePatientRoute();
  const { user } = useAuth();
  const pathname = usePathname();
  const navLinks = [
    { href: '/meu-plano', label: 'Plano' },
    { href: '/chat', label: 'Conversa' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          </div>
          <p className="text-gray-600 font-medium">Carregando seu portal...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/meu-plano" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500" />
              <div>
                <p className="text-lg font-semibold text-gray-900">NutriBuddy Pacientes</p>
                <p className="text-xs text-gray-500">Acompanhe seu plano personalizado</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-full px-3 py-1.5 font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-emerald-50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {(user?.role === 'prescriber' || user?.role === 'admin') && (
            <Link
              href="/dashboard"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 self-start md:self-auto"
            >
              Área do prescritor
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col px-6 py-8">
        {children}
      </main>
    </div>
  );
}


