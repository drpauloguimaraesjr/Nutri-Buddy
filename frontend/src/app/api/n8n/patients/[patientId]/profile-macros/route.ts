import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const N8N_SECRET = 'nutribuddy-secret-2024';

function validateSecret(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret');
    return secret === N8N_SECRET;
}

// Função simples para calcular TMB e Macros (Harris-Benedict)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateMacros(patient: any) {
    const weight = patient.weight || 70;
    const height = patient.height || 170;
    const age = patient.age || 30;
    const gender = patient.gender || 'male';
    const activityFactor = 1.375; // Moderado por padrão

    let tmb;
    if (gender === 'male') {
        tmb = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
    } else {
        tmb = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
    }

    const tdee = Math.round(tmb * activityFactor);

    // Distribuição padrão: 30% P, 40% C, 30% G
    return {
        calories: tdee,
        protein: Math.round((tdee * 0.30) / 4),
        carbs: Math.round((tdee * 0.40) / 4),
        fats: Math.round((tdee * 0.30) / 9)
    };
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
        const doc = await adminDb.collection('patients').doc(patientId).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        const patient = doc.data();
        const macros = calculateMacros(patient);

        return NextResponse.json({
            data: {
                name: 'Macros Estimados (Perfil)',
                description: 'Calculado via Harris-Benedict (Atividade Moderada)',
                macros,
                patientInfo: {
                    weight: patient?.weight,
                    height: patient?.height,
                    age: patient?.age,
                    gender: patient?.gender
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile macros:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
