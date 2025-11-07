'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Building } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

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
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || 'Usuário'}
                </h3>
                <p className="text-gray-600">
                  {user?.role === 'prescriber' && 'Prescritor'}
                  {user?.role === 'patient' && 'Paciente'}
                  {user?.role === 'admin' && 'Administrador'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              {user?.role === 'prescriber' && (
                <>
                  {user.specialty && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Especialidade</p>
                        <p className="font-medium text-gray-900">{user.specialty}</p>
                      </div>
                    </div>
                  )}

                  {user.registrationNumber && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Registro Profissional</p>
                        <p className="font-medium text-gray-900">{user.registrationNumber}</p>
                      </div>
                    </div>
                  )}

                  {user.clinicName && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Clínica</p>
                        <p className="font-medium text-gray-900">{user.clinicName}</p>
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
            <h2 className="text-xl font-bold text-gray-900">Informações da Conta</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="font-medium text-gray-900">
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
                <p className="text-sm text-gray-600">ID do Usuário</p>
                <p className="font-mono text-sm text-gray-900">{user?.uid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

