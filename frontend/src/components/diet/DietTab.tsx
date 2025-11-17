'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { FileText, History, Loader2 } from 'lucide-react';
import { useDiet } from '@/hooks/useDiet';
import DietUpload from './DietUpload';
import DietDisplay from './DietDisplay';
import DietHistory from './DietHistory';
import type { UploadResult, DietPlan } from '@/types/diet';

interface DietTabProps {
  patientId: string;
  prescriberId: string;
  patientName?: string;
}

type ViewMode = 'upload' | 'current' | 'history';

export default function DietTab({ patientId, prescriberId, patientName }: DietTabProps) {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [selectedHistoryDiet, setSelectedHistoryDiet] = useState<DietPlan | null>(null);

  const {
    currentDiet,
    dietHistory,
    loading,
    error,
    reactivateDiet,
    refresh,
  } = useDiet({ patientId, autoLoad: true });

  const handleUploadSuccess = async (result: UploadResult) => {
    console.log('✅ Upload success:', result);
    
    // Aguardar um pouco para garantir que o Firestore foi atualizado
    setTimeout(async () => {
      await refresh();
      setViewMode('current');
    }, 2000);
  };

  const handleUploadError = (error: Error) => {
    console.error('❌ Upload error:', error);
  };

  const handleRetranscribe = () => {
    showToast({
      title: '🔄 Retranscrever dieta?',
      description: 'Faça upload de um novo PDF para substituir a dieta atual.',
      variant: 'default',
      duration: 5000,
    });
    setViewMode('upload');
  };

  const handleViewHistoryDiet = (diet: DietPlan) => {
    setSelectedHistoryDiet(diet);
  };

  const handleBackFromHistory = () => {
    setSelectedHistoryDiet(null);
  };

  const handleReactivate = async (dietId: string) => {
    try {
      await reactivateDiet(dietId);
      showToast({
        title: 'Dieta reativada!',
        description: 'A dieta selecionada está ativa novamente.',
        variant: 'success',
      });
      setViewMode('current');
      setSelectedHistoryDiet(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast({
        title: 'Erro ao reativar dieta',
        description: errorMessage,
        variant: 'error',
      });
    }
  };

  // Se estiver visualizando dieta do histórico
  if (selectedHistoryDiet) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackFromHistory}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Voltar
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Visualizando Dieta Anterior
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Esta dieta está inativa
              </p>
            </div>
          </div>
          
          {!selectedHistoryDiet.isActive && (
            <button
              onClick={() => handleReactivate(selectedHistoryDiet.id!)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reativar esta dieta
            </button>
          )}
        </div>

        {/* Dieta */}
        <DietDisplay
          dietPlan={selectedHistoryDiet}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setViewMode('current')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'current'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dieta Atual
              {currentDiet && (
                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Ativa
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
              {dietHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {dietHistory.length}
                </span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {/* Conteúdo */}
      {loading && !currentDiet && !dietHistory.length ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === 'current' && (
            <div className="space-y-6">
              {currentDiet ? (
                <DietDisplay
                  dietPlan={currentDiet}
                  onRetranscribe={handleRetranscribe}
                />
              ) : (
                <div className="space-y-6">
                  {/* Mensagem de sem dieta */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto text-amber-600 mb-3" />
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      Nenhuma dieta ativa
                    </h3>
                    <p className="text-amber-700 mb-4">
                      Faça upload do PDF da dieta para começar
                    </p>
                  </div>

                  {/* Upload */}
                  <DietUpload
                    patientId={patientId}
                    prescriberId={prescriberId}
                    patientName={patientName}
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                  />
                </div>
              )}

              {/* Botão de novo upload */}
              {currentDiet && (
                <div className="border-t border-gray-200 pt-6">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        <span>+ Fazer upload de nova dieta</span>
                      </div>
                    </summary>
                    <div className="mt-4">
                      <DietUpload
                        patientId={patientId}
                        prescriberId={prescriberId}
                        patientName={patientName}
                        onSuccess={handleUploadSuccess}
                        onError={handleUploadError}
                      />
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {viewMode === 'history' && (
            <DietHistory
              history={dietHistory}
              currentDietId={currentDiet?.id}
              onSelectDiet={handleViewHistoryDiet}
              onReactivate={handleReactivate}
              loading={loading}
            />
          )}
        </>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-medium">Erro ao carregar dados</p>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
        </div>
      )}
    </div>
  );
}

