'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Activity,
  FileText,
  TrendingUp,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock data - será substituído por dados reais da API
  const [patients] = useState([
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(11) 98765-4321',
      age: 32,
      joinDate: '2024-01-15',
      lastActivity: 'Hoje, 14:30',
      compliance: 85,
      status: 'active',
      currentWeight: 68,
      goalWeight: 63,
      activePlan: 'Plano de Emagrecimento',
    },
    {
      id: '2',
      name: 'João Santos',
      email: 'joao@email.com',
      phone: '(11) 91234-5678',
      age: 28,
      joinDate: '2024-02-10',
      lastActivity: 'Ontem, 19:15',
      compliance: 92,
      status: 'active',
      currentWeight: 82,
      goalWeight: 78,
      activePlan: 'Plano de Ganho de Massa',
    },
    {
      id: '3',
      name: 'Ana Paula',
      email: 'ana@email.com',
      phone: '(11) 99876-5432',
      age: 45,
      joinDate: '2024-01-20',
      lastActivity: 'Hoje, 09:45',
      compliance: 78,
      status: 'active',
      currentWeight: 75,
      goalWeight: 68,
      activePlan: 'Plano Low Carb',
    },
    {
      id: '4',
      name: 'Carlos Mendes',
      email: 'carlos@email.com',
      phone: '(11) 97654-3210',
      age: 36,
      joinDate: '2023-12-05',
      lastActivity: 'Hoje, 16:20',
      compliance: 95,
      status: 'active',
      currentWeight: 90,
      goalWeight: 85,
      activePlan: 'Plano Hipertrofia',
    },
    {
      id: '5',
      name: 'Juliana Costa',
      email: 'juliana@email.com',
      phone: '(11) 96543-2109',
      age: 29,
      joinDate: '2024-03-01',
      lastActivity: 'Há 3 dias',
      compliance: 65,
      status: 'inactive',
      currentWeight: 60,
      goalWeight: 58,
      activePlan: 'Plano Manutenção',
    },
  ]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      selectedFilter === 'all' ||
      patient.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe seus pacientes
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Adicionar Paciente
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aderência Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    patients.reduce((acc, p) => acc + p.compliance, 0) / patients.length
                  )}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planos Ativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {patients.filter(p => p.activePlan).length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar paciente por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'success' : 'outline'}
              onClick={() => setSelectedFilter('active')}
            >
              Ativos
            </Button>
            <Button
              variant={selectedFilter === 'inactive' ? 'outline' : 'outline'}
              onClick={() => setSelectedFilter('inactive')}
            >
              Inativos
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Patients List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredPatients.map((patient) => (
          <motion.div
            key={patient.id}
            whileHover={{ y: -2 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between">
              {/* Patient Info */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {patient.name.charAt(0)}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {patient.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        {patient.age} anos
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Progresso</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Peso Atual</span>
                          <span className="font-semibold">{patient.currentWeight} kg</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Meta</span>
                          <span className="font-semibold text-emerald-600">
                            {patient.goalWeight} kg
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Aderência</span>
                          <span className="font-semibold">{patient.compliance}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${patient.compliance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Atividade</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Última atividade:</span>
                        <p className="font-semibold text-gray-900">{patient.lastActivity}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Plano atual:</span>
                        <p className="font-semibold text-purple-600">{patient.activePlan}</p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {patient.status === 'active' ? '● Ativo' : '○ Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Ver Detalhes
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  Prescrever
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum paciente encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Adicione seu primeiro paciente para começar'}
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Adicionar Paciente
          </Button>
        </motion.div>
      )}

      {/* Add Patient Modal - Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="glass-card p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Adicionar Novo Paciente
                </h2>
                <p className="text-gray-600 mb-6">
                  Envie um convite por email para seu paciente
                </p>
                <form className="space-y-4">
                  <Input
                    type="email"
                    label="Email do paciente"
                    placeholder="paciente@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      Enviar Convite
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

