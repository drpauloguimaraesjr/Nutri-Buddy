import { PatientScore } from '@/types';

interface MealEntry {
  timestamp: Date;
  isCorrect: boolean; // Se seguiu o plano alimentar
  hasImage: boolean;
  quality?: number; // 0-100 qualidade da refeição
}

interface ScoreCalculationInput {
  patientId: string;
  meals: MealEntry[];
  currentStreak?: number;
  existingBadges?: string[];
}

/**
 * Calcula o score de um paciente baseado em:
 * - Refeições registradas (30%)
 * - Refeições corretas/dentro do plano (40%)
 * - Consistência/sequência de dias (20%)
 * - Qualidade das refeições (10%)
 */
export function calculatePatientScore(input: ScoreCalculationInput): PatientScore {
  const { patientId, meals, existingBadges = [] } = input;

  // Contador de refeições
  const mealsLogged = meals.length;
  const correctMeals = meals.filter(m => m.isCorrect).length;

  // Cálculo de aderência (% de refeições corretas)
  const adherencePercentage = mealsLogged > 0 
    ? Math.round((correctMeals / mealsLogged) * 100)
    : 0;

  // Cálculo de sequência de dias consecutivos
  const consecutiveDays = calculateConsecutiveDays(meals);

  // Última refeição
  const sortedMeals = [...meals].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const lastMealDate = sortedMeals.length > 0 ? sortedMeals[0].timestamp : null;

  // Componentes do score (total 100 pontos)
  const mealFrequencyScore = calculateMealFrequencyScore(mealsLogged); // 30 pontos
  const adherenceScore = (adherencePercentage / 100) * 40; // 40 pontos
  const consistencyScore = calculateConsistencyScore(consecutiveDays); // 20 pontos
  const qualityScore = calculateQualityScore(meals); // 10 pontos

  const totalScore = Math.min(
    100,
    Math.round(mealFrequencyScore + adherenceScore + consistencyScore + qualityScore)
  );

  // Calcular badges conquistadas
  const badges = calculateBadges({
    mealsLogged,
    correctMeals,
    adherencePercentage,
    consecutiveDays,
    totalScore,
    existingBadges,
  });

  return {
    patientId,
    totalScore,
    adherencePercentage,
    mealsLogged,
    correctMeals,
    lastMealDate,
    consecutiveDays,
    badges,
    updatedAt: new Date(),
  };
}

/**
 * Calcula pontuação baseada na frequência de refeições registradas
 * Meta: ~21 refeições por semana (3/dia) = 100%
 */
function calculateMealFrequencyScore(mealsLogged: number): number {
  const idealWeeklyMeals = 21; // 3 refeições por dia x 7 dias
  const score = Math.min(mealsLogged, idealWeeklyMeals * 2); // Máximo 2 semanas
  return (score / (idealWeeklyMeals * 2)) * 30; // 30 pontos máximo
}

/**
 * Calcula pontuação baseada em consistência/sequência
 */
function calculateConsistencyScore(consecutiveDays: number): number {
  // 7 dias = score máximo (20 pontos)
  return Math.min((consecutiveDays / 7) * 20, 20);
}

/**
 * Calcula pontuação baseada na qualidade das refeições
 */
function calculateQualityScore(meals: MealEntry[]): number {
  if (meals.length === 0) return 0;

  const totalQuality = meals.reduce((sum, meal) => {
    const baseQuality = meal.quality ?? (meal.isCorrect ? 80 : 40);
    const imageBonus = meal.hasImage ? 10 : 0;
    return sum + Math.min(baseQuality + imageBonus, 100);
  }, 0);

  const averageQuality = totalQuality / meals.length;
  return (averageQuality / 100) * 10; // 10 pontos máximo
}

/**
 * Calcula dias consecutivos seguindo o plano
 */
function calculateConsecutiveDays(meals: MealEntry[]): number {
  if (meals.length === 0) return 0;

  // Agrupar refeições por dia
  const mealsByDay = new Map<string, MealEntry[]>();
  
  meals.forEach(meal => {
    const dayKey = meal.timestamp.toISOString().split('T')[0];
    if (!mealsByDay.has(dayKey)) {
      mealsByDay.set(dayKey, []);
    }
    mealsByDay.get(dayKey)!.push(meal);
  });

  // Contar dias consecutivos desde hoje
  let consecutiveDays = 0;
  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date(today);

  for (let i = 0; i < 30; i++) { // Verificar até 30 dias atrás
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayMeals = mealsByDay.get(dateKey) || [];
    
    // Considera um dia válido se teve pelo menos 1 refeição correta
    const hasCorrectMeal = dayMeals.some(m => m.isCorrect);
    
    if (hasCorrectMeal) {
      consecutiveDays++;
    } else {
      // Quebrou a sequência
      break;
    }
    
    // Volta 1 dia
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return consecutiveDays;
}

interface BadgeCalculationInput {
  mealsLogged: number;
  correctMeals: number;
  adherencePercentage: number;
  consecutiveDays: number;
  totalScore: number;
  existingBadges: string[];
}

/**
 * Calcula badges conquistadas pelo paciente
 */
function calculateBadges(input: BadgeCalculationInput): string[] {
  const { 
    mealsLogged, 
    adherencePercentage, 
    consecutiveDays, 
    totalScore,
    existingBadges 
  } = input;

  const newBadges: string[] = [...existingBadges];

  // Badge: Campeão (100% de aderência por 1 semana)
  if (adherencePercentage === 100 && consecutiveDays >= 7 && !newBadges.includes('champion')) {
    newBadges.push('champion');
  }

  // Badge: Sequência 7 dias
  if (consecutiveDays >= 7 && !newBadges.includes('streak_7')) {
    newBadges.push('streak_7');
  }

  // Badge: Sequência 30 dias
  if (consecutiveDays >= 30 && !newBadges.includes('streak_30')) {
    newBadges.push('streak_30');
  }

  // Badge: 50 refeições registradas
  if (mealsLogged >= 50 && !newBadges.includes('star_50')) {
    newBadges.push('star_50');
  }

  // Badge: 90%+ de aderência
  if (adherencePercentage >= 90 && mealsLogged >= 20 && !newBadges.includes('focused_90')) {
    newBadges.push('focused_90');
  }

  // Badge: Score total acima de 85
  if (totalScore >= 85 && !newBadges.includes('high_performer')) {
    newBadges.push('high_performer');
  }

  return newBadges;
}

/**
 * Determina quais badges são "novas" (conquistadas recentemente)
 */
export function getNewBadges(currentBadges: string[], previousBadges: string[]): string[] {
  return currentBadges.filter(badge => !previousBadges.includes(badge));
}

/**
 * Simula dados de refeições para teste/desenvolvimento
 */
export function generateMockMealData(patientId: string, days: number = 7): MealEntry[] {
  const meals: MealEntry[] = [];
  const now = new Date();

  for (let day = 0; day < days; day++) {
    // 3 refeições por dia
    for (let meal = 0; meal < 3; meal++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(8 + (meal * 4), 0, 0, 0); // 8h, 12h, 16h

      meals.push({
        timestamp,
        isCorrect: Math.random() > 0.2, // 80% de chance de estar correto
        hasImage: Math.random() > 0.4, // 60% de chance de ter imagem
        quality: Math.floor(Math.random() * 30) + 70, // 70-100
      });
    }
  }

  return meals;
}

