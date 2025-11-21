import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Buscar dados do paciente
        const patientDoc = await adminDb.collection('patients').doc(userId).get();

        if (!patientDoc.exists) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        const patientData = patientDoc.data();

        return NextResponse.json({
            id: patientDoc.id,
            ...patientData,
            prescriberId: patientData?.prescriberId || null
        });

    } catch (error) {
        console.error('Error fetching patient profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
