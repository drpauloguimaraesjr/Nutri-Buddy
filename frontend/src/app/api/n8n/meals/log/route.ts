import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const N8N_SECRET = 'nutribuddy-secret-2024';

function validateSecret(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret');
    return secret === N8N_SECRET;
}

export async function POST(req: NextRequest) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { patientId, foods, totalMacros, conversationId } = body;

        // 1. Salvar log bruto
        const logData = {
            patientId,
            conversationId,
            foods,
            totalMacros,
            date: new Date().toISOString().split('T')[0],
            timestamp: FieldValue.serverTimestamp(),
            source: 'n8n_ai'
        };

        await adminDb.collection('mealLogs').add(logData);

        // 2. Disparar cálculo de aderência (assíncrono ou síncrono)
        // Como estamos no mesmo servidor, podemos chamar a lógica diretamente ou via fetch
        // Vamos fazer via fetch para a API interna para garantir consistência

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const today = new Date().toISOString().split('T')[0];

        // Buscar todos os logs do dia para recalcular
        const logsSnapshot = await adminDb
            .collection('mealLogs')
            .where('patientId', '==', patientId)
            .where('date', '==', today)
            .get();

        const allMeals = logsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                name: 'Refeição Registrada', // Poderia ser melhorado se o n8n mandasse o nome da refeição
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                foods: data.foods.map((f: any) => ({
                    name: f.name,
                    amount: f.weight,
                    unit: 'g',
                    calories: f.macros.calories,
                    protein: f.macros.protein,
                    carbs: f.macros.carbs,
                    fats: f.macros.fats
                })),
                timestamp: data.timestamp
            };
        });

        // Chamar API de cálculo
        try {
            await fetch(`${apiUrl}/api/adherence/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    date: today,
                    consumedMeals: allMeals
                })
            });
        } catch (err) {
            console.error('Error triggering adherence calculation:', err);
            // Não falhar o request principal se o cálculo falhar
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging meal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
