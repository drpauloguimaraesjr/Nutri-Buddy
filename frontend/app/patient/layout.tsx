'use client';

import { usePatientProtection } from '@/hooks/useRoleProtection';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = usePatientProtection();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-16 w-16 rounded-full glass-card flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600" />
          </div>
          <p className="text-gray-700 font-medium">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <motion.main
          className="flex-1 p-4 lg:p-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

