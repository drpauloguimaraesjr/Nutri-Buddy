'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Send,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Users,
  Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddPatientModal } from '@/components/AddPatientModal';
import { DeletePatientModal } from '@/components/DeletePatientModal';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/usePatients';
import type { PatientSummary } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';

export default function PatientsPage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { showToast } = useToast();
  const { patients, isLoading, error, refresh, removePatient, stats } = usePatients();

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openMenuId && !target.closest('[data-menu]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleDeletePatient = async () => {
    if (!selectedPatient || !firebaseUser) return;

    try {
      setIsDeleting(true);

      const token = await firebaseUser.getIdToken();
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${apiBaseUrl}/api/prescriber/patients/${selectedPatient.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir paciente');
      }

      removePatient(selectedPatient.id);

      // Fechar modal
      setShowDeleteModal(false);
      setSelectedPatient(null);

      console.log('✅ Paciente excluído com sucesso');
      showToast({
        title: 'Paciente removido',
        description: 'O paciente foi removido da sua carteira.',
        variant: 'success',
      });
    } catch (error) {
      console.error('❌ Erro ao excluir paciente:', error);
      showToast({
        title: 'Erro ao excluir paciente',
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendCredentials = async (patient: PatientSummary, method: 'email' | 'whatsapp') => {
    if (!firebaseUser) return;

    try {
      setOpenMenuId(null);

      const token = await firebaseUser.getIdToken();
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${apiBaseUrl}/api/prescriber/patients/${patient.id}/send-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar credenciais');
      }

      if (method === 'whatsapp' && data.whatsappMessage) {
        // Copiar mensagem para clipboard
        await navigator.clipboard.writeText(data.whatsappMessage);
        showToast({
          title: 'Mensagem copiada',
          description: `Envie via WhatsApp para ${data.phone || patient.phone || 'o paciente'}.`,
          variant: 'success',
        });
      } else {
        showToast({
          title: 'Credenciais enviadas',
          description: data.message ?? 'O paciente receberá o email em instantes.',
          variant: 'success',
        });
      }

      console.log('✅ Credenciais enviadas:', data);
    } catch (error) {
      console.error('❌ Erro ao enviar credenciais:', error);
      showToast({
        title: 'Erro ao enviar credenciais',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'error',
      });
    }
  };

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        patient.name.toLowerCase().includes(normalizedSearch) ||
        patient.email.toLowerCase().includes(normalizedSearch) ||
        (patient.phone ?? '').toLowerCase().includes(normalizedSearch);

      const matchesFilter = selectedFilter === 'all' || patient.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, selectedFilter]);

  const recentPatients = useMemo(() => {
    return [...patients]
      .filter((patient) => patient.createdAt)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [patients]);

  const trend =
    stats.newPrevious7Days === 0
      ? stats.newLast7Days > 0
        ? 100
        : 0
      : Math.round(((stats.newLast7Days - stats.newPrevious7Days) / stats.newPrevious7Days) * 100);

  const handleExportCsv = () => {
    if (filteredPatients.length === 0) return;

    const csvHeader = [
      'Nome',
      'Email',
      'Telefone',
      'Idade',
      'Gênero',
      'Status',
      'Data de Cadastro',
      'Última Consulta',
    ];

    const csvRows = filteredPatients.map((patient) => [
      `"${patient.name}"`,
      `"${patient.email}"`,
      `"${patient.phone ?? ''}"`,
      patient.age ?? '',
      patient.gender ?? '',
      patient.status ?? 'active',
      patient.createdAt ? patient.createdAt.toLocaleDateString('pt-BR') : '',
      patient.lastConsultation ? patient.lastConsultation.toLocaleDateString('pt-BR') : '',
    ]);

    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nutribuddy-pacientes-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Exportação em andamento',
      description: 'O arquivo CSV com a lista de pacientes foi gerado.',
      variant: 'success',
    });
  };

  const summaryCards = [
    {
      id: 'total',
      title: 'Total de Pacientes',
      value: stats.total,
      icon: Users,
      description: `${stats.newLast7Days} novos nos últimos 7 dias`,
      change: trend,
    },
    {
      id: 'active',
      title: 'Pacientes Ativos',
      value: stats.active,
      icon: Activity,
      description: `${stats.activePercentage}% engajados`,
      change: stats.activePercentage - 50,
    },
    {
      id: 'inactive',
      title: 'Pacientes Inativos',
      value: stats.inactive,
      icon: User,
      description: 'Trabalhe em reengajamento',
      change: stats.inactive > 0 ? -stats.inactive : 0,
    },
    {
      id: 'new',
      title: 'Novos Pacientes (7d)',
      value: stats.newLast7Days,
      icon: Plus,
      description:
        stats.newPrevious7Days === 0
          ? 'Primeiros cadastros recentes'
          : `${Math.abs(trend)}% vs semana anterior`,
      change: trend,
    },
  ];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-fluid-3xl font-bold text-high-contrast">Pacientes</h1>
            <p className="text-fluid-base text-high-contrast-muted">
              Controle centralizado de pacientes, atividades e engajamento
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-full bg-blue-50 p-3 text-blue-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-fluid-xs font-medium',
                        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      )}
                    >
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-fluid-sm font-medium text-high-contrast-muted">{card.title}</p>
                    <p className="text-fluid-3xl font-bold text-high-contrast">{card.value}</p>
                    <p className="text-fluid-xs text-high-contrast-muted">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nome, email ou telefone"
                  className="w-full border-none bg-transparent text-fluid-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className={cn(
                      'capitalize',
                      selectedFilter === filter && filter === 'inactive' && 'bg-amber-500 hover:bg-amber-600'
                    )}
                  >
                    {filter === 'all' && `Todos (${patients.length})`}
                    {filter === 'active' && `Ativos (${stats.active})`}
                    {filter === 'inactive' && `Inativos (${stats.inactive})`}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="flex flex-col gap-3 p-5 text-fluid-sm text-red-700 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">Não foi possível carregar os pacientes.</p>
                <p className="text-red-600/80">{error}</p>
              </div>
              <Button variant="outline" onClick={() => void refresh()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Patients List */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-high-contrast-muted">Carregando pacientes...</p>
        </motion.div>
      ) : filteredPatients.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-fluid-lg font-semibold text-high-contrast mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-high-contrast-muted mb-4">
                {searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Comece adicionando seu primeiro paciente'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Paciente</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => router.push(`/patients/${patient.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/patients/${patient.id}`);
                  }
                }}
              >
                <Card className="transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-fluid-lg font-semibold text-white">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-fluid-lg font-semibold text-high-contrast">{patient.name}</h3>
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-fluid-xs font-medium',
                                patient.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-high-contrast-muted'
                              )}
                            >
                              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-3 text-fluid-sm text-high-contrast-muted sm:grid-cols-2 xl:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{patient.email}</span>
                            </div>
                            {patient.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {patient.lastConsultation
                                  ? `Última consulta: ${patient.lastConsultation.toLocaleDateString('pt-BR')}`
                                  : 'Sem consultas registradas'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative shrink-0" data-menu>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(openMenuId === patient.id ? null : patient.id);
                          }}
                          className="rounded-lg p-2 text-high-contrast-muted transition-colors hover:bg-gray-100"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === patient.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                              ref={(element) => {
                                menuRefs.current[patient.id] = element;
                              }}
                            >
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  router.push(`/patients/${patient.id}`);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-fluid-sm text-high-contrast-muted transition hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Ver/Editar paciente</span>
                              </button>
                              <div className="h-px bg-gray-100" />
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleSendCredentials(patient, 'email');
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-fluid-sm text-blue-600 transition hover:bg-blue-50"
                              >
                                <Send className="h-4 w-4" />
                                <span>Enviar credenciais por email</span>
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleSendCredentials(patient, 'whatsapp');
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-fluid-sm text-green-600 transition hover:bg-green-50"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>Enviar credenciais por WhatsApp</span>
                              </button>
                              <div className="h-px bg-gray-100" />
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  setSelectedPatient(patient);
                                  setShowDeleteModal(true);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-fluid-sm text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir paciente</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="h-fit">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-fluid-base font-semibold text-high-contrast">Cadastros recentes</h3>
                <span className="text-fluid-xs font-medium text-blue-600">
                  {recentPatients.length} monitorados
                </span>
              </div>
              <div className="space-y-4">
                {recentPatients.length === 0 ? (
                  <p className="text-fluid-sm text-high-contrast-muted">
                    Quando novos pacientes forem cadastrados, eles aparecerão aqui automaticamente.
                  </p>
                ) : (
                  recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-fluid-sm font-semibold text-blue-600">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-fluid-sm font-medium text-high-contrast">{patient.name}</p>
                        <p className="text-fluid-xs text-high-contrast-muted">
                          {patient.createdAt
                            ? `Cadastro em ${patient.createdAt.toLocaleDateString('pt-BR')}`
                            : 'Data não registrada'}
                        </p>
                        <span
                          className={cn(
                            'mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                            (patient.status ?? 'active') === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-high-contrast-muted'
                          )}
                        >
                          {patient.status === 'inactive' ? 'Acompanhar reativação' : 'Ativo'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void refresh();
        }}
      />

      {/* Delete Patient Modal */}
      <DeletePatientModal
        isOpen={showDeleteModal}
        patientName={selectedPatient?.name || ''}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleDeletePatient}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}







