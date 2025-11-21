'use client';

import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Building } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import ThemeSelector from '@/components/settings/ThemeSelector';

export default function SettingsPage() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-fluid-3xl font-bold text-white">Configurações</h1>
        <p className="text-slate-300">Gerencie suas informações e preferências</p>
      </motion.div>

      {/* Theme Selector */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <h2 className="text-fluid-xl font-bold text-white">Aparência</h2>
            <p className="text-fluid-sm text-slate-400">Personalize o visual do sistema</p>
          </CardHeader>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <h2 className="text-fluid-xl font-bold text-white">Perfil</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-fluid-xl font-semibold text-white">
                  {user?.displayName || 'Usuário'}
                </h3>
                <p className="text-slate-300">
                  {user?.role === 'prescriber' && 'Prescritor'}
                  {user?.role === 'patient' && 'Paciente'}
                  {user?.role === 'admin' && 'Administrador'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-fluid-sm text-slate-400">Email</p>
                  <p className="font-medium text-white">{user?.email}</p>
                </div>
              </div>

              {user?.role === 'prescriber' && (
                <>
                  {user.specialty && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-fluid-sm text-slate-400">Especialidade</p>
                        <p className="font-medium text-white">{user.specialty}</p>
                      </div>
                    </div>
                  )}

                  {user.registrationNumber && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-fluid-sm text-slate-400">Registro Profissional</p>
                        <p className="font-medium text-white">{user.registrationNumber}</p>
                      </div>
                    </div>
                  )}

                  {user.clinicName && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <Building className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-fluid-sm text-slate-400">Clínica</p>
                        <p className="font-medium text-white">{user.clinicName}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <h2 className="text-fluid-xl font-bold text-white">Informações da Conta</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-fluid-sm text-slate-400">Membro desde</p>
                <p className="font-medium text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Data não disponível'}
                </p>
              </div>
              <div>
                <p className="text-fluid-sm text-slate-400">ID do Usuário</p>
                <p className="font-mono text-fluid-sm text-white">{user?.uid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

