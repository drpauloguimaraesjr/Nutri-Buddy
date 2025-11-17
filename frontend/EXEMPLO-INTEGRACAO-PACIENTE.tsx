// ============================================================================
// EXEMPLO: Como integrar DietTab na página do paciente
// ============================================================================
// Arquivo: frontend/src/app/(dashboard)/patients/[patientId]/page.tsx
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { DietTab } from '@/components/diet';
import { useAuth } from '@/hooks/useAuth'; // Seu hook de autenticação
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  // ... outros campos
}

export default function PatientPage({ 
  params 
}: { 
  params: { patientId: string } 
}) {
  const { user } = useAuth(); // Obter usuário autenticado
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'physical' | 'diet' | 'history'>('info');

  // Carregar dados do paciente
  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', params.patientId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPatient({
            id: docSnap.id,
            ...docSnap.data()
          } as Patient);
        }
      } catch (error) {
        console.error('Error loading patient:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.patientId) {
      loadPatient();
    }
  }, [params.patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!patient || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Paciente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {patient.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {patient.email || patient.phone || 'Paciente'}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Informações Gerais
          </button>

          <button
            onClick={() => setActiveTab('physical')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'physical'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Físico (InBody)
          </button>

          <button
            onClick={() => setActiveTab('diet')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'diet'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Dieta & Treino
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`
              px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Tab 1: Informações Gerais */}
        {activeTab === 'info' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Informações Gerais</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nome</label>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{patient.email || '-'}</p>
                </div>
                {/* ... adicionar mais campos ... */}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Físico (InBody) */}
        {activeTab === 'physical' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Físico</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {/* ... seu componente InBody aqui ... */}
              <p className="text-gray-600">Componente InBody</p>
            </div>
          </section>
        )}

        {/* Tab 3: DIETA & TREINO (NOVO!) */}
        {activeTab === 'diet' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Dieta & Treino</h2>
            
            {/* 🎯 ESTE É O COMPONENTE PRINCIPAL! */}
            <DietTab
              patientId={params.patientId}
              prescriberId={user.uid}
              patientName={patient.name}
            />
          </section>
        )}

        {/* Tab 4: Histórico */}
        {activeTab === 'history' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Histórico</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {/* ... seu histórico aqui ... */}
              <p className="text-gray-600">Histórico de consultas</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ALTERNATIVA: Integração simples sem tabs
// ============================================================================

/*
'use client';

import { DietTab } from '@/components/diet';
import { useAuth } from '@/hooks/useAuth';

export default function PatientDietPage({ params }) {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dieta do Paciente</h1>
      
      <DietTab
        patientId={params.patientId}
        prescriberId={user.uid}
        patientName="Nome do Paciente"
      />
    </div>
  );
}
*/

// ============================================================================
// ALTERNATIVA: Usar componentes separadamente
// ============================================================================

/*
'use client';

import { useState } from 'react';
import { useDiet } from '@/hooks/useDiet';
import { DietUpload, DietDisplay, DietHistory } from '@/components/diet';
import { useAuth } from '@/hooks/useAuth';

export default function PatientDietPage({ params }) {
  const { user } = useAuth();
  const [view, setView] = useState<'current' | 'history'>('current');

  const {
    currentDiet,
    dietHistory,
    loading,
    refresh,
  } = useDiet({ patientId: params.patientId, autoLoad: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dieta do Paciente</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <button
          onClick={() => setView('current')}
          className={view === 'current' ? 'border-b-2 border-blue-600' : ''}
        >
          Dieta Atual
        </button>
        <button
          onClick={() => setView('history')}
          className={view === 'history' ? 'border-b-2 border-blue-600' : ''}
        >
          Histórico
        </button>
      </div>

      {/* Conteúdo */}
      {view === 'current' && (
        <>
          {currentDiet ? (
            <DietDisplay dietPlan={currentDiet} />
          ) : (
            <DietUpload
              patientId={params.patientId}
              prescriberId={user.uid}
              onSuccess={refresh}
            />
          )}
        </>
      )}

      {view === 'history' && (
        <DietHistory
          history={dietHistory}
          currentDietId={currentDiet?.id}
          onSelectDiet={(diet) => console.log('Selected:', diet)}
        />
      )}
    </div>
  );
}
*/

