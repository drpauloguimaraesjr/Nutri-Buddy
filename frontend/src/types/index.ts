export type UserRole = 'patient' | 'prescriber' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  // Prescriber fields
  specialty?: string;
  registrationNumber?: string;
  clinicName?: string;
  // Patient fields
  prescriberId?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'other';
  goals?: string[];
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other';
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  status?: 'active' | 'inactive';
  prescriberId?: string;
  goals?: string[];
  createdAt?: Date | null;
  lastConsultation?: Date | null;
}

export interface PlanMeal {
  id: string;
  title: string;
  time?: string;
  description: string;
}

export interface PlanMacros {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

export interface NutritionPlan {
  id: string;
  name: string;
  patientId: string;
  patientName: string;
  prescriberId: string;
  objective?: string;
  duration?: string;
  startDate?: Date | null;
  notes?: string;
  meals: PlanMeal[];
  macros: PlanMacros;
  planPdfUrl?: string | null;
  planPdfName?: string | null;
  planPdfStoragePath?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

