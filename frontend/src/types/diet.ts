// Tipos para estrutura de dados de dieta

export interface DietMeta {
  caloriasDiarias: number;
  periodo: string;
  objetivo: string;
  nutricionista?: string;
  dataCriacao?: string;
}

export interface MacroDetail {
  gramas: number;
  gramsPerKg?: number;
  percentual?: number;
}

export interface Macronutrientes {
  carboidratos: MacroDetail;
  proteinas: MacroDetail;
  gorduras: MacroDetail;
  fibras?: MacroDetail;
}

export interface Alimento {
  nome: string;
  quantidade: number;
  unidade: string;
  observacao?: string;
}

export interface MealMacros {
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  fibras?: number;
}

export interface Refeicao {
  ordem: number;
  nome: string;
  horario: string;
  percentualDiario?: number;
  alimentos: Alimento[];
  macros?: MealMacros;
}

export interface Micronutriente {
  nome: string;
  quantidade: number;
  unidade: string;
  dri?: number;
  percentualDRI?: number;
}

export interface Substituicao {
  alimentoOriginal: string;
  substitutos: string[];
  observacao?: string;
}

export interface DietSummary {
  totalCalorias: number;
  totalRefeicoes: number;
  totalAlimentos: number;
  objetivo: string;
}

export interface DietData {
  meta: DietMeta;
  macronutrientes: Macronutrientes;
  refeicoes: Refeicao[];
  micronutrientes?: Micronutriente[];
  observacoes?: string[];
  substituicoes?: Substituicao[];
}

export interface DietPlan {
  id?: string;
  patientId: string;
  name: string;
  description: string;
  meals: Refeicao[];
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  dailyCalories: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  deactivatedAt?: Date | string;
  formattedText?: string; // Texto formatado da dieta
  metadata: {
    meta: DietMeta;
    macronutrientes: Macronutrientes;
    micronutrientes: Micronutriente[];
    observacoes: string[];
    substituicoes: Substituicao[];
    transcriptionStatus: string;
    transcribedAt: string;
    model: string;
    resumo: DietSummary;
    totalMeals?: number;
    totalFoods?: number;
  };
}

export interface UploadResult {
  success: boolean;
  message?: string;
  patientId?: string;
  status?: string;
  model?: string;
  resumo?: DietSummary;
  totalCalorias?: number;
  totalRefeicoes?: number;
  totalAlimentos?: number;
}

