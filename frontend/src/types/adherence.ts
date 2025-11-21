export interface MacroNutrients {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface MealScore {
    name: string;
    time: string;
    planned: MacroNutrients;
    consumed: MacroNutrients;
    score: number;
    completed: boolean;
    foodsConsumed: string[]; // Lista de alimentos identificados
}

export interface DailyScores {
    caloric: number; // 0-100
    macros: number; // 0-100
    meals: number; // 0-100
    total: number; // 0-100
}

export interface DailyAdherence {
    id?: string;
    patientId: string;
    date: string; // YYYY-MM-DD

    // Totais
    planned: MacroNutrients & { mealsCount: number };
    consumed: MacroNutrients & { mealsCount: number };

    // Scores
    scores: DailyScores;

    // Detalhes
    mealDetails: MealScore[];

    // Metadados
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface AdherenceRequest {
    patientId: string;
    date: string;
    consumedMeals: Array<{
        name: string; // Nome da refeição (ex: "Café da Manhã")
        foods: Array<{
            name: string;
            amount: number;
            unit: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        }>;
        timestamp: string;
    }>;
}
