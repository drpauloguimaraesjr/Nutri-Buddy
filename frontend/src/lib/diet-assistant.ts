import { GoogleGenerativeAI } from '@google/generative-ai';
import { DietPlan } from '@/types/diet';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface ExtractedMeal {
    mealName: string; // Nome da refeição identificada (ex: "Café da Manhã")
    foods: Array<{
        name: string;
        amount: number;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }>;
    confidence: number; // 0-1
    feedback: string; // Mensagem para o usuário (ex: "Registrado! Faltou a fruta.")
}

export async function analyzeDietLog(
    userMessage: string,
    dietPlan: DietPlan,
    imageUrl?: string
): Promise<ExtractedMeal | null> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseMimeType: "application/json" }
        });

        // Preparar contexto da dieta
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dietContext = dietPlan.meals?.map((m: any) => {
            const mealName = m.name || m.nome || 'Refeição';
            const mealTime = m.time || m.horario || '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const foods = (m.foods || m.alimentos || []).map((f: any) =>
                `${f.amount || f.quantidade || ''}${f.unit || f.unidade || ''} ${f.name || f.nome || ''}`
            ).join(', ');

            return `${mealName} (${mealTime}): ${foods}`;
        }).join('\n');

        const prompt = `
      Você é um assistente nutricional inteligente do NutriBuddy.
      
      CONTEXTO DA DIETA DO PACIENTE:
      ${dietContext}
      
      MENSAGEM DO PACIENTE:
      "${userMessage}"
      
      TAREFA:
      1. Identifique qual refeição o paciente está registrando (baseado no horário atual ou conteúdo).
      2. Extraia os alimentos consumidos, quantidades e estime calorias/macros.
      3. Compare com o planejado para essa refeição.
      4. Gere um feedback curto e motivador.
      
      Retorne APENAS um JSON com este formato:
      {
        "mealName": "Nome da Refeição (use exatamente o nome que está no plano se der match)",
        "foods": [
          { "name": "Nome do alimento", "amount": 100, "unit": "g", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
        ],
        "confidence": 0.9,
        "feedback": "Texto de resposta para o WhatsApp"
      }
      
      Se não for um registro de comida (ex: dúvida, oi), retorne null.
    `;

        // Se tiver imagem, adicionar ao prompt (futuro)
        // const imagePart = ...

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return JSON.parse(text) as ExtractedMeal;

    } catch (error) {
        console.error('Error analyzing diet log:', error);
        return null;
    }
}
