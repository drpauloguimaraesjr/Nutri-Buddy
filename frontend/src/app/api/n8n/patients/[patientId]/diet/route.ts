import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const N8N_SECRET = 'nutribuddy-secret-2024';

function validateSecret(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret');
    return secret === N8N_SECRET;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { patientId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { patientId } = params;

        // Buscar dieta ativa
        const snapshot = await adminDb
            .collection('dietPlans')
            .where('patientId', '==', patientId)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ data: null, message: 'No active diet found' });
        }

        const dietPlan = snapshot.docs[0].data();

        // Normalizar estrutura se necessário (mas o n8n parece lidar com o JSON bruto)
        // O n8n espera `meals` e `macros`.

        // Adaptar se estiver no formato antigo
        const adaptedDiet = {
            ...dietPlan,
            meals: dietPlan.meals || dietPlan.refeicoes || [],
            macros: dietPlan.macros || dietPlan.macronutrientes || {}
        };

        return NextResponse.json({ data: adaptedDiet });
    } catch (error) {
        console.error('Error fetching diet:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
