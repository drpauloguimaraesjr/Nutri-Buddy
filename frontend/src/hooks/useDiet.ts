'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DietPlan } from '@/types/diet';

interface UseDietOptions {
  patientId: string;
  autoLoad?: boolean;
}

interface UseDietReturn {
  currentDiet: DietPlan | null;
  dietHistory: DietPlan[];
  loading: boolean;
  error: Error | null;
  fetchCurrentDiet: () => Promise<void>;
  fetchDietHistory: () => Promise<void>;
  reactivateDiet: (dietId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDiet({ patientId, autoLoad = true }: UseDietOptions): UseDietReturn {
  const [currentDiet, setCurrentDiet] = useState<DietPlan | null>(null);
  const [dietHistory, setDietHistory] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Buscar dieta ativa atual
  const fetchCurrentDiet = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);

      const dietPlansRef = collection(db, 'dietPlans');
      const q = query(
        dietPlansRef,
        where('patientId', '==', patientId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const dietData = snapshot.docs[0].data() as DietPlan;
        setCurrentDiet({
          ...dietData,
          id: snapshot.docs[0].id,
        });
        console.log('✅ Current diet loaded:', snapshot.docs[0].id);
      } else {
        setCurrentDiet(null);
        console.log('⚠️ No active diet found for patient:', patientId);
      }
    } catch (err: any) {
      console.error('❌ Error fetching current diet:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Buscar histórico de dietas
  const fetchDietHistory = useCallback(async () => {
    if (!patientId) return;

    try {
      setError(null);

      const dietPlansRef = collection(db, 'dietPlans');
      const q = query(
        dietPlansRef,
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const diets: DietPlan[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as DietPlan),
        id: doc.id,
      }));

      setDietHistory(diets);
      console.log(`✅ Diet history loaded: ${diets.length} diets`);
    } catch (err: any) {
      console.error('❌ Error fetching diet history:', err);
      setError(err);
    }
  }, [patientId]);

  // Reativar dieta antiga
  const reactivateDiet = useCallback(async (dietId: string) => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);

      const batch = writeBatch(db);

      // 1. Desativar todas as dietas ativas do paciente
      const activeDietsQuery = query(
        collection(db, 'dietPlans'),
        where('patientId', '==', patientId),
        where('isActive', '==', true)
      );

      const activeDietsSnapshot = await getDocs(activeDietsQuery);

      activeDietsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          deactivatedAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // 2. Ativar a dieta selecionada
      const dietRef = doc(db, 'dietPlans', dietId);
      batch.update(dietRef, {
        isActive: true,
        updatedAt: new Date(),
      });

      await batch.commit();

      console.log('✅ Diet reactivated:', dietId);

      // Atualizar dados
      await Promise.all([fetchCurrentDiet(), fetchDietHistory()]);
    } catch (err: any) {
      console.error('❌ Error reactivating diet:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patientId, fetchCurrentDiet, fetchDietHistory]);

  // Atualizar todos os dados
  const refresh = useCallback(async () => {
    await Promise.all([fetchCurrentDiet(), fetchDietHistory()]);
  }, [fetchCurrentDiet, fetchDietHistory]);

  // Auto-carregar dados ao montar
  useEffect(() => {
    if (autoLoad && patientId) {
      fetchCurrentDiet();
      fetchDietHistory();
    }
  }, [autoLoad, patientId, fetchCurrentDiet, fetchDietHistory]);

  return {
    currentDiet,
    dietHistory,
    loading,
    error,
    fetchCurrentDiet,
    fetchDietHistory,
    reactivateDiet,
    refresh,
  };
}

