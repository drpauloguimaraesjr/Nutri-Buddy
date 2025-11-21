import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const N8N_SECRET = 'nutribuddy-secret-2024';

function validateSecret(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret');
    return secret === N8N_SECRET;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;
        const doc = await adminDb.collection('conversations').doc(conversationId).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const data = doc.data();

        // Buscar nome do paciente se não tiver no doc da conversa
        let patientName = data?.patientName;
        if (!patientName && data?.patientId) {
            const patientDoc = await adminDb.collection('patients').doc(data.patientId).get();
            if (patientDoc.exists) {
                patientName = patientDoc.data()?.name;
            }
        }

        return NextResponse.json({
            id: doc.id,
            ...data,
            patientName: patientName || 'Paciente'
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
