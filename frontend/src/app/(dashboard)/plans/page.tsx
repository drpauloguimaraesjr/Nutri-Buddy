'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, FileText, Plus, Users } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

interface NutritionPlan {
  id: string;
  name: string;
  patientId: string;
  patientName: string;
  prescriberId: string;
  objective?: string;
  duration?: string;
  startDate?: Date | null;
  notes?: string;
  meals?: Array<{
    id: string;
    title: string;
    time?: string;
    description: string;
    energy?: number | null;
  }>;
  macros?: {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fats?: number | null;
  };
  planPdfUrl?: string | null;
  planPdfName?: string | null;
  planPdfStoragePath?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const plansRef = collection(db, 'plans');
        const q = query(plansRef, where('prescriberId', '==', user.uid));
        const snapshot = await getDocs(q);

        const plansData: NutritionPlan[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name ?? 'Plano sem título',
            patientId: data.patientId ?? '',
            patientName: data.patientName ?? 'Paciente',
            prescriberId: data.prescriberId ?? '',
            objective: data.objective ?? '',
            duration: data.duration ?? '',
            startDate: data.startDate?.toDate?.() ?? null,
            notes: data.notes ?? '',
            meals: data.meals ?? [],
            macros: data.macros ?? {},
            planPdfUrl: data.planPdfUrl ?? null,
            planPdfName: data.planPdfName ?? null,
            planPdfStoragePath: data.planPdfStoragePath ?? null,
            createdAt: data.createdAt?.toDate?.() ?? null,
            updatedAt: data.updatedAt?.toDate?.() ?? null,
          };
        });

        setPlans(plansData);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  const handleCreatePlan = () => {
    router.push('/plans/create');
  };

  const hasPlans = plans.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos Nutricionais</h1>
          <p className="text-gray-600">
            Crie, edite e acompanhe os planos alimentares dos seus pacientes.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreatePlan}>
          <Plus className="w-4 h-4" />
          <span>Novo Plano</span>
        </Button>
      </motion.div>

      {/* Empty State or Plans List */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          <p className="text-gray-600">Carregando planos...</p>
        </motion.div>
      ) : !hasPlans ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum plano criado ainda
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comece criando planos nutricionais personalizados para seus pacientes.
                Você pode definir refeições, objetivos e acompanhamento.
              </p>
              <Button className="gap-2" onClick={handleCreatePlan}>
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Plano</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/plans/${plan.id}`)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500">{plan.objective || 'Sem objetivo definido'}</p>
                  </div>
                  <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{plan.patientName}</span>
                  </div>
                  {plan.duration && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{plan.duration}</span>
                    </div>
                  )}
                  {plan.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {plan.startDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-700">
                    <p className="text-xs uppercase tracking-wide">Calorias</p>
                    <p className="text-lg font-semibold">{plan.macros?.calories ?? '-'} kcal</p>
                  </div>
                  <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-green-700">
                    <p className="text-xs uppercase tracking-wide">Proteínas</p>
                    <p className="text-lg font-semibold">{plan.macros?.protein ?? '-'} g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

