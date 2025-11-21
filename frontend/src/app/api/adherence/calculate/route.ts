import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DailyAdherence, MealScore, MacroNutrients } from '@/types/adherence';
import { DietPlan } from '@/types/diet';

// Pesos para o score final
const WEIGHTS = {
    CALORIES: 0.30,
    MACROS: 0.50,
    MEALS: 0.20
};

// Pesos para o score de macros
const MACRO_WEIGHTS = {
    PROTEIN: 0.40,
    CARBS: 0.35,
    FATS: 0.25
};

// Limites de tolerância (desvio máximo para score > 0)
const TOLERANCE = {
    CALORIES: 0.20, // 20%
    MACROS: 0.25    // 25%
};

function calculateMetricScore(planned: number, consumed: number, tolerance: number): number {
    if (planned === 0) return consumed === 0 ? 100 : 0;

    const deviation = Math.abs(consumed - planned) / planned;

    // Se desvio for maior que a tolerância, score é 0
    if (deviation > tolerance) return 0;

    // Score linear de 100% (0 desvio) até 0% (tolerância máxima)
    const score = (1 - (deviation / tolerance)) * 100;
    return Math.max(0, Math.round(score));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patientId, date, consumedMeals } = body;

        if (!patientId || !date) {
            return NextResponse.json(
                { success: false, message: 'PatientId and date are required' },
                { status: 400 }
            );
        }

        // 1. Buscar dieta ativa do paciente
        const dietSnapshot = await adminDb
            .collection('dietPlans')
            .where('patientId', '==', patientId)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (dietSnapshot.empty) {
            return NextResponse.json(
                { success: false, message: 'No active diet plan found' },
                { status: 404 }
            );
        }

        const dietPlan = dietSnapshot.docs[0].data() as DietPlan;

        // 2. Preparar totais planejados
        const plannedTotal: MacroNutrients = {
            calories: dietPlan.dailyCalories || 0,
            protein: dietPlan.dailyProtein || 0,
            carbs: dietPlan.dailyCarbs || 0,
            fats: dietPlan.dailyFats || 0
        };

        // 3. Calcular totais consumidos
        const consumedTotal: MacroNutrients = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };

        // Mapear refeições consumidas para facilitar busca
        // Normaliza nomes para comparação (lowercase, sem acentos seria ideal mas vamos simplificar)
        const consumedMap = new Map();
        consumedMeals.forEach((meal: any) => {
            // Somar aos totais
            meal.foods.forEach((food: any) => {
                consumedTotal.calories += food.calories || 0;
                consumedTotal.protein += food.protein || 0;
                consumedTotal.carbs += food.carbs || 0;
                consumedTotal.fats += food.fats || 0;
            });

            consumedMap.set(meal.name.toLowerCase(), meal);
        });

        // 4. Calcular Scores Individuais

        // Score Calórico
        const caloricScore = calculateMetricScore(
            plannedTotal.calories,
            consumedTotal.calories,
            TOLERANCE.CALORIES
        );

        // Score de Macros
        const proteinScore = calculateMetricScore(plannedTotal.protein, consumedTotal.protein, TOLERANCE.MACROS);
        const carbsScore = calculateMetricScore(plannedTotal.carbs, consumedTotal.carbs, TOLERANCE.MACROS);
        const fatsScore = calculateMetricScore(plannedTotal.fats, consumedTotal.fats, TOLERANCE.MACROS);

        const macrosScore = Math.round(
            (proteinScore * MACRO_WEIGHTS.PROTEIN) +
            (carbsScore * MACRO_WEIGHTS.CARBS) +
            (fatsScore * MACRO_WEIGHTS.FATS)
        );

        // Score de Refeições e Detalhes
        const mealDetails: MealScore[] = [];
        let completedMeals = 0;

        // Iterar sobre refeições PLANEJADAS para ver se foram cumpridas
        // Usando a estrutura nova (meals) ou antiga (refeicoes)
        const plannedMeals = dietPlan.meals || []; // Assumindo que já migramos ou usamos o adaptador

        plannedMeals.forEach((plannedMeal: any) => {
            const mealName = (plannedMeal.name || plannedMeal.nome || '').toLowerCase();
            const consumedMeal = consumedMap.get(mealName);

            // Macros planejados para esta refeição
            const mealPlannedMacros = plannedMeal.macros || {
                calories: 0, protein: 0, carbs: 0, fats: 0
            };

            // Macros consumidos nesta refeição
            let mealConsumedMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            let foodsList: string[] = [];

            if (consumedMeal) {
                consumedMeal.foods.forEach((f: any) => {
                    mealConsumedMacros.calories += f.calories || 0;
                    mealConsumedMacros.protein += f.protein || 0;
                    mealConsumedMacros.carbs += f.carbs || 0;
                    mealConsumedMacros.fats += f.fats || 0;
                    foodsList.push(f.name);
                });
            }

            // Critério de completude: ter consumido algo próximo do planejado (ex: > 50% das calorias)
            // Ou simplesmente ter registrado a refeição se não tivermos macros precisos
            const isCompleted = !!consumedMeal && mealConsumedMacros.calories > (mealPlannedMacros.calories * 0.5);

            if (isCompleted) completedMeals++;

            // Score individual da refeição (simplificado: base calórica)
            const mealScore = calculateMetricScore(
                mealPlannedMacros.calories || 1, // Evitar div por 0
                mealConsumedMacros.calories,
                0.3 // Tolerância maior por refeição (30%)
            );

            mealDetails.push({
                name: plannedMeal.name || plannedMeal.nome || 'Refeição',
                time: plannedMeal.time || plannedMeal.horario || '',
                planned: {
                    calories: mealPlannedMacros.calories || mealPlannedMacros.calorias || 0,
                    protein: mealPlannedMacros.protein || mealPlannedMacros.proteinas || 0,
                    carbs: mealPlannedMacros.carbs || mealPlannedMacros.carboidratos || 0,
                    fats: mealPlannedMacros.fats || mealPlannedMacros.gorduras || 0
                },
                consumed: mealConsumedMacros,
                score: mealScore,
                completed: isCompleted,
                foodsConsumed: foodsList
            });
        });

        const mealsScore = Math.round((completedMeals / Math.max(1, plannedMeals.length)) * 100);

        // 5. Score Final
        const totalScore = Math.round(
            (caloricScore * WEIGHTS.CALORIES) +
            (macrosScore * WEIGHTS.MACROS) +
            (mealsScore * WEIGHTS.MEALS)
        );

        // 6. Montar objeto final
        const adherenceData: DailyAdherence = {
            patientId,
            date,
            planned: {
                ...plannedTotal,
                mealsCount: plannedMeals.length
            },
            consumed: {
                ...consumedTotal,
                mealsCount: consumedMeals.length
            },
            scores: {
                caloric: caloricScore,
                macros: macrosScore,
                meals: mealsScore,
                total: totalScore
            },
            mealDetails,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 7. Salvar no Firestore
        // Usar ID composto para garantir unicidade por dia: patientId_YYYY-MM-DD
        const docId = `${patientId}_${date}`;
        await adminDb.collection('dailyAdherence').doc(docId).set(adherenceData);

        return NextResponse.json({
            success: true,
            data: adherenceData
        });

    } catch (error) {
        console.error('Error calculating adherence:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to calculate adherence', error: String(error) },
            { status: 500 }
        );
    }
}
