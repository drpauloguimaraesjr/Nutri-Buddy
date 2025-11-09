"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import type { PatientSummary, UserRole } from '@/types';

type AllowedRoles = Extract<UserRole, 'admin' | 'prescriber'>;

interface UsePatientsOptions {
  includeInactive?: boolean;
}

export interface UsePatientsResult {
  patients: PatientSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removePatient: (patientId: string) => void;
  allowedToManage: boolean;
  stats: {
    total: number;
    active: number;
    inactive: number;
    newLast7Days: number;
    newPrevious7Days: number;
    activePercentage: number;
  };
}

const PATIENT_COLLECTION = 'users';

const isRoleAllowed = (role: UserRole | null | undefined): role is AllowedRoles =>
  role === 'admin' || role === 'prescriber';

const normalizePatient = (doc: QueryDocumentSnapshot<DocumentData, DocumentData>): PatientSummary => {
  const data = doc.data() as Record<string, unknown>;

  const getDate = (value: unknown) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof (value as { toDate: () => Date }).toDate === 'function'
    ) {
      try {
        return (value as { toDate: () => Date }).toDate();
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    id: doc.id,
    name: (data.name as string) || 'Paciente sem nome',
    email: (data.email as string) || '',
    phone: (data.phone as string | null | undefined) ?? undefined,
    gender: (data.gender as PatientSummary['gender']) ?? undefined,
    age: (data.age as number | null | undefined) ?? undefined,
    weight: (data.weight as number | null | undefined) ?? undefined,
    height: (data.height as number | null | undefined) ?? undefined,
    status: (data.status as PatientSummary['status']) ?? 'active',
    prescriberId: (data.prescriberId as string | undefined) ?? undefined,
    goals: Array.isArray(data.goals)
      ? (data.goals as unknown[]).map((goal) => String(goal))
      : undefined,
    createdAt: getDate(data.createdAt),
    lastConsultation: getDate(data.lastConsultation),
  };
};

export function usePatients(options: UsePatientsOptions = {}): UsePatientsResult {
  const { includeInactive = true } = options;
  const { user } = useAuth();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const allowedToManage = useMemo(() => isRoleAllowed(user?.role), [user?.role]);

  const loadPatients = useCallback(async () => {
    if (!user || !allowedToManage) {
      setPatients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const patientsRef = collection(db, PATIENT_COLLECTION);
      const constraints = [where('role', '==', 'patient')];

      if (user.role === 'prescriber') {
        constraints.push(where('prescriberId', '==', user.uid));
      }

      const patientsQuery = query(patientsRef, ...constraints);
      const snapshot = await getDocs(patientsQuery);

      const normalizedPatients = snapshot.docs
        .map((doc) => normalizePatient(doc))
        .filter((patient) => includeInactive || patient.status !== 'inactive')
        .sort((a, b) => {
          const aTime = a.createdAt?.getTime() ?? 0;
          const bTime = b.createdAt?.getTime() ?? 0;
          return bTime - aTime;
        });

      setPatients(normalizedPatients);
    } catch (err) {
      console.error('[usePatients] Error loading patients', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os pacientes. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [allowedToManage, includeInactive, user]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const refresh = useCallback(async () => {
    await loadPatients();
  }, [loadPatients]);

  const removePatient = useCallback((patientId: string) => {
    setPatients((previous) => previous.filter((patient) => patient.id !== patientId));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    const { total, active, inactive, newLast7Days, newPrevious7Days } = patients.reduce(
      (acc, patient) => {
        const createdAt = patient.createdAt?.getTime();
        if (patient.status === 'active') acc.active += 1;
        if (patient.status === 'inactive') acc.inactive += 1;

        if (createdAt) {
          const diff = now.getTime() - createdAt;
          if (diff <= SEVEN_DAYS) {
            acc.newLast7Days += 1;
          } else if (diff <= SEVEN_DAYS * 2) {
            acc.newPrevious7Days += 1;
          }
        }

        acc.total += 1;
        return acc;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        newLast7Days: 0,
        newPrevious7Days: 0,
      }
    );

    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      active,
      inactive,
      newLast7Days,
      newPrevious7Days,
      activePercentage,
    };
  }, [patients]);

  return {
    patients,
    isLoading,
    error,
    refresh,
    removePatient,
    allowedToManage,
    stats,
  };
}


