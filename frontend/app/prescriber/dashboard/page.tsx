'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriberAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function PrescriberDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch patients from API
  const { data: patientsData } = useQuery({
    queryKey: ['prescriberPatients'],
    queryFn: () => prescriberAPI.getPatients(),
  });

  // Fetch requests from API
  const { data: requestsData } = useQuery({
    queryKey: ['prescriberRequests'],
    queryFn: () => prescriberAPI.getRequests(),
  });

  const patients = patientsData?.data?.data || [];
  const requests = requestsData?.data?.data || [];

  // Calculate stats from real data
  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p: any) => p.status === 'active').length,
    pendingApprovals: requests.length,
    plansCreatedThisMonth: 12, // TODO: Implementar contagem real
  };

  // Approve/reject mutations
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => prescriberAPI.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriberRequests'] });
      queryClient.invalidateQueries({ queryKey: ['prescriberPatients'] });
      toast.success('Solicitação aprovada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao aprovar solicitação');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => prescriberAPI.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriberRequests'] });
      toast.success('Solicitação rejeitada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao rejeitar solicitação');
    },
  });

  // Get recent patients (first 4)
  const recentPatients = patients.slice(0, 4).map((p: any) => ({
    id: p.id,
    name: p.displayName || p.name || 'Paciente',
    email: p.email,
    lastActivity: 'Hoje', // TODO: Implementar cálculo real
    compliance: p.compliance || 85,
    status: p.status || 'active',
  }));

  // Mock pending requests if no real data
  const mockPendingRequests = [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      lastActivity: '2 horas atrás',
      compliance: 85,
      status: 'active',
    },
    {
      id: '2',
      name: 'João Santos',
      email: 'joao@email.com',
      lastActivity: '1 dia atrás',
      compliance: 92,
      status: 'active',
    },
    {
      id: '3',
      name: 'Ana Paula',
      email: 'ana@email.com',
      lastActivity: '3 horas atrás',
      compliance: 78,
      status: 'active',
    },
    {
      id: '4',
      name: 'Carlos Mendes',
      email: 'carlos@email.com',
      lastActivity: 'Hoje',
      compliance: 95,
      status: 'active',
    },
  ]);

  const [pendingRequests] = useState([
    {
      id: '1',
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      requestDate: '2 dias atrás',
    },
    {
      id: '2',
      name: 'Juliana Costa',
      email: 'juliana@email.com',
      requestDate: '1 dia atrás',
    },
    {
      id: '3',
      name: 'Roberto Alves',
      email: 'roberto@email.com',
      requestDate: 'Hoje',
    },
  ];

  // Use real requests if available, otherwise use mock
  const pendingRequests = requests.length > 0 
    ? requests.map((r: any) => ({
        id: r.id,
        name: r.patientName || 'Paciente',
        email: r.patientEmail || r.email || '',
        requestDate: r.createdAt ? new Date(r.createdAt.toDate()).toLocaleDateString('pt-BR') : 'Hoje',
      }))
    : mockPendingRequests;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Bem-vindo, Dr(a). {user?.displayName || 'Prescritor'}! 👨‍⚕️
            </h1>
            <p className="text-gray-600">
              Acompanhe seus pacientes e gerencie prescrições com facilidade
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/prescriber/patients')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Adicionar Paciente
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total de Pacientes"
          value={stats.totalPatients}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          trend="up"
          trendValue="+3 este mês"
        />
        <StatsCard
          title="Pacientes Ativos"
          value={stats.activePatients}
          icon={<Activity className="h-6 w-6 text-emerald-600" />}
          trend="up"
          trendValue={`${Math.round((stats.activePatients / stats.totalPatients) * 100)}%`}
        />
        <StatsCard
          title="Aprovações Pendentes"
          value={stats.pendingApprovals}
          icon={<Clock className="h-6 w-6 text-orange-600" />}
        />
        <StatsCard
          title="Planos Criados"
          value={stats.plansCreatedThisMonth}
          icon={<FileText className="h-6 w-6 text-purple-600" />}
          trend="up"
          trendValue="Este mês"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push('/prescriber/patients')}
            className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-sm font-medium">Novo Paciente</span>
          </Button>
          <Button 
            onClick={() => router.push('/prescriber/patients')}
            className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm font-medium">Nova Prescrição</span>
          </Button>
          <Button 
            onClick={() => router.push('/prescriber/patients')}
            className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-medium">Agendar Consulta</span>
          </Button>
          <Button 
            onClick={() => router.push('/reports')}
            className="h-auto py-6 flex-col space-y-2 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm font-medium">Relatórios</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Solicitações Pendentes
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {pendingRequests.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center justify-between p-4 glass-subtle rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                        <UserCog className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.name}</p>
                        <p className="text-sm text-gray-600">{request.email}</p>
                        <p className="text-xs text-gray-500">{request.requestDate}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => approveMutation.mutate(request.id)}
                        size="sm" 
                        variant="ghost" 
                        className="text-emerald-600"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => rejectMutation.mutate(request.id)}
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                <Button variant="ghost" className="w-full" size="sm">
                  Ver todas
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Patients */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Pacientes Recentes
                </span>
                <Link href="/prescriber/patients">
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center justify-between p-4 glass-subtle rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-xs text-gray-500">{patient.lastActivity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${patient.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">
                          {patient.compliance}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Aderência</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Chart Placeholder */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
              Atividade dos Pacientes (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gráfico de atividade será implementado</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

