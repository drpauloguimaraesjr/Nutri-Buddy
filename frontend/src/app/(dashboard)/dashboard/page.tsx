'use client';

import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total de Pacientes',
      value: '0',
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Atividades Hoje',
      value: '0',
      icon: Activity,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Progresso Médio',
      value: '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
    {
      title: 'Consultas Agendadas',
      value: '0',
      icon: Calendar,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bem-vindo de volta, {user?.displayName || 'Usuário'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                      <Icon className={`w-6 h-6 text-${stat.color.replace('bg-', '')}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Início Rápido</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistema Pronto!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              O frontend está configurado e funcionando. 
              Você pode começar a adicionar funcionalidades conforme necessário.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

