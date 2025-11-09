'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PieChart, Users, Rocket, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/usePatients';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ageBrackets = [
  { id: '18-24', label: '18 - 24' },
  { id: '25-34', label: '25 - 34' },
  { id: '35-44', label: '35 - 44' },
  { id: '45-54', label: '45 - 54' },
  { id: '55+', label: '55+' },
] as const;

export default function AnalyticsPage() {
  const router = useRouter();
  const { patients, stats, isLoading } = usePatients();

  const insights = useMemo(() => {
    const gender = patients.reduce(
      (acc, patient) => {
        const key = patient.gender ?? 'other';
        acc[key as keyof typeof acc] += 1;
        return acc;
      },
      { male: 0, female: 0, other: 0 }
    );

    const ageDistribution = ageBrackets.map((bracket) => {
      const [start, end] = bracket.id === '55+' ? [55, Infinity] : bracket.id.split('-').map(Number);
      const total = patients.filter((patient) => {
        if (!patient.age) return false;
        if (bracket.id === '55+') {
          return patient.age >= start;
        }
        return patient.age >= start && patient.age <= (end ?? start);
      }).length;
      return { ...bracket, total };
    });

    const goalStats = patients.reduce(
      (acc, patient) => {
        const goals = Array.isArray(patient.goals) ? patient.goals : [];
        goals.forEach((goal) => {
          const normalized = goal.trim().toLowerCase();
          if (!acc[normalized]) {
            acc[normalized] = 0;
          }
          acc[normalized] += 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    const topGoals = Object.entries(goalStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    const lastConsultations = [...patients]
      .filter((patient) => patient.lastConsultation)
      .sort((a, b) => {
        const aTime = a.lastConsultation?.getTime() ?? 0;
        const bTime = b.lastConsultation?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 6);

    return {
      gender,
      ageDistribution,
      topGoals,
      lastConsultations,
    };
  }, [patients]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-8"
    >
      <motion.div variants={fade} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics de Pacientes</h1>
          <p className="text-gray-600">
            Visualize padrões de cadastro, engajamento e perfil dos pacientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Voltar ao dashboard
          </Button>
          <Button onClick={() => router.push('/patients')}>
            Gerenciar pacientes
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div variants={fade} className="text-center py-12">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fade} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                id: 'total',
                title: 'Total de pacientes',
                value: stats.total,
                description: `${stats.newLast7Days} novos nos últimos 7 dias`,
                icon: Users,
                accent: 'bg-blue-500/10 text-blue-600',
              },
              {
                id: 'active',
                title: 'Ativos',
                value: stats.active,
                description: `${stats.activePercentage}% engajados`,
                icon: Rocket,
                accent: 'bg-green-500/10 text-green-600',
              },
              {
                id: 'inactive',
                title: 'Inativos',
                value: stats.inactive,
                description: 'Agende reativação em massa',
                icon: Sparkles,
                accent: 'bg-amber-500/10 text-amber-600',
              },
              {
                id: 'trend',
                title: 'Novos (últimos 14 dias)',
                value: stats.newLast7Days + stats.newPrevious7Days,
                description: `${stats.newLast7Days}/${stats.newPrevious7Days} semana atual/anterior`,
                icon: PieChart,
                accent: 'bg-purple-500/10 text-purple-600',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', card.accent)}>
                        <Icon className="h-5 w-5" />
                      </div>
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

          <motion.div variants={fade} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Distribuição por faixa etária</h2>
                <p className="text-sm text-gray-500">Entenda o perfil dos pacientes por idade</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {insights.ageDistribution.map((group) => {
                  const percentage =
                    stats.total > 0 ? Math.round((group.total / stats.total) * 100) : 0;
                  return (
                    <div key={group.id}>
                      <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                        <span>{group.label}</span>
                        <span>{group.total} pacientes</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{percentage}% da base</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Distribuição por gênero</h2>
                <p className="text-sm text-gray-500">Dados autodeclarados durante o cadastro</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { label: 'Feminino', value: insights.gender.female, accent: 'bg-pink-500' },
                  { label: 'Masculino', value: insights.gender.male, accent: 'bg-blue-500' },
                  { label: 'Outro/Não informado', value: insights.gender.other, accent: 'bg-purple-500' },
                ] as const).map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      <span className={cn('h-2 w-8 rounded-full', item.accent)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fade} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Metas mais comuns</h2>
                <p className="text-sm text-gray-500">
                  Insight baseado nas metas cadastradas pelos pacientes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.topGoals.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhuma meta cadastrada até o momento. Configure metas nos perfis dos pacientes para visualizar tendências.
                  </p>
                ) : (
                  insights.topGoals.map(([goal, total]) => (
                    <div key={goal} className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-800 capitalize">{goal}</p>
                        <p className="text-xs text-blue-600">{total} pacientes com essa meta</p>
                      </div>
                      <span className="text-sm font-medium text-blue-700">
                        {Math.round((total / stats.total) * 100)}%
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Últimas consultas registradas</h2>
                <p className="text-sm text-gray-500">
                  acompanhe quem teve contato mais recente com você.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.lastConsultations.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Ainda não há consultas registradas. Conforme atualizar os prontuários, as informações aparecerão aqui.
                  </p>
                ) : (
                  insights.lastConsultations.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">
                          {patient.lastConsultation?.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
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


