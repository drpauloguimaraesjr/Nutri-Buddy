'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, UserPlus, AlertTriangle, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/usePatients';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { patients, stats, isLoading } = usePatients();

  const analytics = useMemo(() => {
    const now = new Date();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const consultationsLast30Days = patients.filter((patient) => {
      const lastConsultation = patient.lastConsultation?.getTime();
      if (!lastConsultation) return false;
      return now.getTime() - lastConsultation <= THIRTY_DAYS;
    }).length;

    const inactivePatients = patients
      .filter((patient) => patient.status === 'inactive')
      .sort((a, b) => {
        const aTime = a.lastConsultation?.getTime() ?? 0;
        const bTime = b.lastConsultation?.getTime() ?? 0;
        return aTime - bTime;
      })
      .slice(0, 5);

    const patientsNeedingFollowUp = patients
      .filter((patient) => {
        if (patient.status !== 'active') return false;
        const lastConsultation = patient.lastConsultation?.getTime();
        if (!lastConsultation) return true;
        return now.getTime() - lastConsultation > THIRTY_DAYS;
      })
      .sort((a, b) => {
        const aTime = a.lastConsultation?.getTime() ?? 0;
        const bTime = b.lastConsultation?.getTime() ?? 0;
        return aTime - bTime;
      })
      .slice(0, 5);

    const averageAge =
      patients.reduce((acc, patient) => acc + (patient.age ?? 0), 0) / (patients.length || 1);

    const bmiValues = patients
      .map((patient) => {
        if (!patient.weight || !patient.height) return null;
        const heightInMeters = patient.height / 100;
        if (!heightInMeters) return null;
        return patient.weight / (heightInMeters * heightInMeters);
      })
      .filter((bmi): bmi is number => bmi !== null);

    const averageBmi =
      bmiValues.reduce((acc, bmi) => acc + bmi, 0) / (bmiValues.length || 1);

    const recentPatients = [...patients]
      .filter((patient) => patient.createdAt)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 6);

    return {
      consultationsLast30Days,
      inactivePatients,
      patientsNeedingFollowUp,
      averageAge: Number.isFinite(averageAge) ? Math.round(averageAge) : 0,
      averageBmi: Number.isFinite(averageBmi) ? averageBmi.toFixed(1) : '—',
      recentPatients,
    };
  }, [patients]);

  const trend =
    stats.newPrevious7Days === 0
      ? stats.newLast7Days > 0
        ? 100
        : 0
      : Math.round(((stats.newLast7Days - stats.newPrevious7Days) / stats.newPrevious7Days) * 100);

  const summaryCards = [
    {
      id: 'active',
      title: 'Pacientes Ativos',
      value: stats.active,
      description: `${stats.activePercentage}% engajados`,
      icon: Activity,
      accent: 'bg-green-500/10 text-green-600',
      change: trend,
    },
    {
      id: 'new',
      title: 'Novos (7 dias)',
      value: stats.newLast7Days,
      description:
        stats.newPrevious7Days === 0
          ? 'Primeiros cadastros recentes'
          : `${Math.abs(trend)}% vs semana anterior`,
      icon: UserPlus,
      accent: 'bg-blue-500/10 text-blue-600',
      change: trend,
    },
    {
      id: 'consultations',
      title: 'Consultas (30 dias)',
      value: analytics.consultationsLast30Days,
      description: 'Sessões registradas recentemente',
      icon: Stethoscope,
      accent: 'bg-purple-500/10 text-purple-600',
      change: analytics.consultationsLast30Days >= stats.active ? 12 : -5,
    },
    {
      id: 'inactive',
      title: 'Inativos',
      value: stats.inactive,
      description: 'Priorize reengajamento',
      icon: AlertTriangle,
      accent: 'bg-amber-500/10 text-amber-600',
      change: stats.inactive > 0 ? -stats.inactive : 0,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-8"
    >
      <motion.div variants={fadeIn} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo de volta, {user?.displayName || 'profissional'}! Acompanhe seus pacientes em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/patients')}>
            Gerenciar pacientes
          </Button>
          <Button onClick={() => router.push('/plans/create')}>Criar novo plano</Button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div variants={fadeIn} className="text-center py-12">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando dados do painel...</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeIn} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const isPositive = card.change >= 0;

              return (
                <Card key={card.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', card.accent)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                          isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        )}
                      >
                        <ArrowUpRight
                          className={cn('h-3 w-3 transition-transform', !isPositive && 'rotate-180')}
                        />
                        {Math.abs(card.change)}%
                      </span>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          <motion.div variants={fadeIn} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Visão geral dos pacientes</h2>
                    <p className="text-sm text-gray-500">
                      Distribuição e engajamento com base nos últimos 30 dias
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                      <span>Ativos vs Inativos</span>
                      <span>
                        {stats.active}/{stats.total}
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${stats.activePercentage}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      {stats.activePercentage}% dos pacientes estão ativos atualmente.
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                      <span>Consultas registradas</span>
                      <span>{analytics.consultationsLast30Days}</span>
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-gray-900">
                      {analytics.consultationsLast30Days}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Pacientes acompanhados nos últimos 30 dias. Mantenha o ritmo adicionando novas sessões.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-medium text-blue-700">
                    Indicadores antropométricos gerais
                  </p>
                  <div className="mt-3 grid gap-4 text-sm text-blue-600 md:grid-cols-2">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-blue-500">Idade média</span>
                      <span className="text-lg font-semibold">{analytics.averageAge || '—'} anos</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-blue-500">IMC médio</span>
                      <span className="text-lg font-semibold">{analytics.averageBmi}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Novos cadastros</h2>
                <p className="text-sm text-gray-500">
                  Últimos pacientes adicionados à sua carteira
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.recentPatients.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Ainda não há novos cadastros recentes. Assim que adicionar novos pacientes, eles aparecerão aqui.
                  </p>
                ) : (
                  analytics.recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">
                          {patient.createdAt
                            ? `Cadastrado em ${patient.createdAt.toLocaleDateString('pt-BR')}`
                            : 'Data de cadastro não registrada'}
                        </p>
                        <span
                          className={cn(
                            'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                            (patient.status ?? 'active') === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {(patient.status ?? 'active') === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Prioridade de reengajamento</h2>
                <p className="text-sm text-gray-500">
                  Pacientes inativos ou sem consultas recentes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.inactivePatients.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum paciente inativo no momento. Excelente trabalho!
                  </p>
                ) : (
                  analytics.inactivePatients.map((patient) => (
                    <div key={patient.id} className="flex items-start justify-between gap-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-800">{patient.name}</p>
                        <p className="text-xs text-amber-600">
                          Última consulta:{' '}
                          {patient.lastConsultation
                            ? patient.lastConsultation.toLocaleDateString('pt-BR')
                            : 'nunca registrado'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/patients/${patient.id}`)}
                      >
                        Reativar
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Acompanhamentos sugeridos</h2>
                <p className="text-sm text-gray-500">
                  Pacientes ativos que podem precisar de um novo contato
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.patientsNeedingFollowUp.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Todos os pacientes ativos estão atualizados! Continue acompanhando esse indicador.
                  </p>
                ) : (
                  analytics.patientsNeedingFollowUp.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-800">{patient.name}</p>
                        <p className="text-xs text-blue-600">
                          {patient.lastConsultation
                            ? `Última consulta há ${Math.floor(
                                (Date.now() - (patient.lastConsultation?.getTime() ?? 0)) /
                                  (1000 * 60 * 60 * 24)
                              )} dias`
                            : 'Sem consultas realizadas'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/patients/${patient.id}`)}
                      >
                        Abrir ficha
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

