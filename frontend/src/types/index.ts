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

