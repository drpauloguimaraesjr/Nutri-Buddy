// User Types and Roles
export type UserRole = 'patient' | 'prescriber';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Prescriber specific fields
  specialty?: string;
  registrationNumber?: string; // CRN or similar
  clinicName?: string;
  
  // Patient specific fields
  prescriberId?: string; // ID of the prescriber managing this patient
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'other';
  goals?: string[];
}

// Meal Types
export interface Meal {
  id: string;
  userId: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description?: string;
  foods?: Food[];
  prescribedBy?: string; // ID of prescriber if meal was prescribed
  isPrescribed?: boolean;
  notes?: string;
}

export interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Exercise Types
export interface Exercise {
  id: string;
  userId: string;
  name: string;
  type: string;
  duration: number; // in minutes
  caloriesBurned: number;
  date: Date;
  notes?: string;
}

// Water Intake
export interface WaterIntake {
  id: string;
  userId: string;
  amount: number; // in ml
  date: Date;
  time: string;
}

// Fasting
export interface FastingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  targetDuration: number; // in hours
  isActive: boolean;
  notes?: string;
}

// Goals
export interface Goal {
  id: string;
  userId: string;
  type: 'weight' | 'calories' | 'exercise' | 'water' | 'custom';
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  isCompleted: boolean;
  createdAt: Date;
}

// Measurements
export interface Measurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

// Glucose
export interface GlucoseReading {
  id: string;
  userId: string;
  date: Date;
  time: string;
  value: number; // mg/dL
  mealRelation?: 'fasting' | 'before_meal' | 'after_meal';
  notes?: string;
}

// Prescriber-Patient Relationship
export interface PatientConnection {
  id: string;
  prescriberId: string;
  patientId: string;
  patientEmail: string;
  patientName: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
  notes?: string;
}

// Diet Plan (prescribed by prescriber)
export interface DietPlan {
  id: string;
  prescriberId: string;
  patientId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  meals: PrescribedMeal[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescribedMeal {
  id: string;
  planId: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods: PrescribedFood[];
  instructions?: string;
}

export interface PrescribedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}

// Recipes
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  imageUrl?: string;
  tags?: string[];
  createdBy?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

// Chat Messages
export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  context?: 'nutrition' | 'exercise' | 'general';
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Dashboard Stats
export interface DashboardStats {
  calories: {
    consumed: number;
    goal: number;
  };
  protein: {
    consumed: number;
    goal: number;
  };
  carbs: {
    consumed: number;
    goal: number;
  };
  fats: {
    consumed: number;
    goal: number;
  };
  water: {
    consumed: number;
    goal: number;
  };
  exercise: {
    burned: number;
    goal: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
