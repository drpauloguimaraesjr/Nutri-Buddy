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

// WhatsApp Conversation Types
export type ConversationStatus = 'active' | 'waiting' | 'needs_attention' | 'urgent';

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  patientId: string;
  senderId: string; // uid do usuário que enviou
  senderName: string;
  senderType: 'patient' | 'system' | 'prescriber';
  content: string;
  timestamp: Date;
  isFromPatient: boolean;
  hasImage?: boolean;
  imageUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  analyzed?: boolean;
}

export interface PatientScore {
  patientId: string;
  totalScore: number; // 0-100
  adherencePercentage: number; // % de obediência à dieta
  mealsLogged: number; // Total de refeições registradas
  correctMeals: number; // Refeições dentro do plano
  lastMealDate?: Date | null;
  consecutiveDays: number; // Dias consecutivos seguindo o plano
  badges: string[]; // ['streak_7', 'perfect_week', 'champion']
  updatedAt: Date;
}

export interface WhatsAppConversation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  prescriberId: string;
  status: ConversationStatus;
  score: PatientScore;
  lastMessage?: WhatsAppMessage;
  lastMessageAt?: Date | null;
  unreadCount: number;
  totalMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Goals & Progress Types
export interface WeightEntry {
  date: Date;
  weight: number;
  note?: string;
}

export interface PatientGoals {
  objective: 'lose_weight' | 'gain_muscle' | 'maintain' | 'performance' | 'health' | 'gain_weight' | 'recomp';
  initialWeight?: number;
  currentWeight?: number;
  targetWeight?: number;
  deadline?: Date | null;
  weeklyGoals?: string[];
  weightHistory?: WeightEntry[];
}

// AI Profile Types
export type AIProfileType = 
  | 'welcoming' // 🤗 Acolhedor e Suave
  | 'motivational' // 🔥 Motivacional e Energético
  | 'direct' // 💪 Firme e Direto
  | 'humorous' // 😄 Descontraído com Humor
  | 'mindful' // 🧘 Zen e Mindful
  | 'educational' // 📚 Educativo e Técnico
  | 'coach' // 🎯 Coach Esportivo
  | 'partner'; // 🤝 Parceiro de Jornada

export type MessageFrequency = 'high' | 'medium' | 'low'; // 3-4x/dia, 2x/dia, 1x/dia
export type EmojiLevel = 'high' | 'medium' | 'low'; // Muitos, moderado, poucos
export type FeedbackStyle = 'positive' | 'balanced' | 'analytical'; // Sempre positivo, balanceado, analítico
export type ResponseTiming = 'immediate' | 'scheduled' | 'respectful'; // Imediato, programado, não envia à noite

export interface AIProfileConfig {
  profileType: AIProfileType;
  messageFrequency: MessageFrequency;
  emojiLevel: EmojiLevel;
  feedbackStyle: FeedbackStyle;
  responseTiming: ResponseTiming;
  customInstructions?: string; // Instruções adicionais do nutricionista
}

export interface PatientAIProfile {
  patientId: string;
  config: AIProfileConfig;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // UID do nutricionista
}

