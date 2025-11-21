import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { patientId: string } }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const { patientId } = params;
        const body = await req.json();

        // Atualizar paciente
        await adminDb.collection('patients').doc(patientId).update(body);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
