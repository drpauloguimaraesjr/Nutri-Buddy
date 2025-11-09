'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FileText, Download, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePatientRoute } from '@/hooks/usePatientRoute';
import { db } from '@/lib/firebase';

interface PatientPlanData {
  name?: string;
  dietPlanText?: string;
  planPdfUrl?: string | null;
  planPdfName?: string | null;
  planUpdatedAt?: Date | null;
  planTranscriptionStatus?: 'idle' | 'processing' | 'completed';
}

export default function PatientPlanPage() {
  const { user } = usePatientRoute();
  const [planData, setPlanData] = useState<PatientPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Não encontramos seus dados de plano. Entre em contato com sua nutricionista.');
          setPlanData(null);
          return;
        }

        const data = docSnap.data();
        setPlanData({
          name: data.name,
          dietPlanText: data.dietPlanText ?? '',
          planPdfUrl: data.planPdfUrl ?? null,
          planPdfName: data.planPdfName ?? null,
          planUpdatedAt: data.planUpdatedAt?.toDate?.() ?? null,
          planTranscriptionStatus: data.planTranscriptionStatus ?? 'idle',
        });
      } catch (planError) {
        console.error('Erro ao carregar plano do paciente:', planError);
        setError('Não foi possível carregar seu plano. Tente novamente mais tarde.');
        setPlanData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          <p className="text-sm text-gray-600">Carregando seu plano alimentar...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Ops! Algo deu errado</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!planData) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Ainda não há um plano disponível</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua nutricionista está preparando tudo para você. Volte mais tarde ou entre em contato diretamente.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">Seu plano alimentar personalizado</h2>
              {planData.planUpdatedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    Atualizado em{' '}
                    {planData.planUpdatedAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Este plano foi preparado pela sua nutricionista. Leia com atenção e acompanhe as instruções.
              </p>
            </div>

            {planData.planTranscriptionStatus !== 'completed' && planData.dietPlanText && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                Estamos finalizando a análise completa do seu plano. As informações abaixo podem ser atualizadas em breve.
              </div>
            )}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
                <FileText className="h-5 w-5 text-emerald-500" />
                Plano transcrito
              </h3>
              {planData.dietPlanText ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-white/90 p-4 text-sm text-gray-700 shadow-inner">
                  {planData.dietPlanText}
                </pre>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  Ainda não há uma versão transcrita disponível. Assim que estiver pronta, ela aparecerá aqui.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                <FileText className="h-5 w-5 text-blue-500" />
                PDF oficial do plano
              </h3>
              {planData.planPdfUrl ? (
                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {planData.planPdfName ?? 'Plano alimentar.pdf'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Arquivo enviado pela sua nutricionista. Faça o download para consultar offline.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      window.open(planData.planPdfUrl ?? '', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Visualizar PDF
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  A versão em PDF do plano ainda não foi disponibilizada. Assim que for enviada, você encontrará o link
                  aqui.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {planData?.name ?? user?.displayName ?? 'paciente'}!
          </h1>
          <p className="mt-1 text-gray-600">
            Aqui você encontra o seu plano alimentar e os materiais compartilhados pela sua nutricionista.
          </p>
        </div>

        {renderContent()}
      </div>
    </motion.div>
  );
}


