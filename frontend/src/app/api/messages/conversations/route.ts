import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Buscar conversas do usuário (como paciente ou prescritor)
        const asPatient = await adminDb
            .collection('conversations')
            .where('patientId', '==', userId)
            .get();

        const asPrescriber = await adminDb
            .collection('conversations')
            .where('prescriberId', '==', userId)
            .get();

        const conversations = [
            ...asPatient.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ...asPrescriber.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        ];

        return NextResponse.json({ conversations });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await req.json();
        const { prescriberId, initialMessage } = body;

        // Verificar se já existe conversa entre esses dois
        // userId (paciente) e prescriberId

        const snapshot = await adminDb
            .collection('conversations')
            .where('patientId', '==', userId)
            .where('prescriberId', '==', prescriberId)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return NextResponse.json({
                conversation: { id: doc.id, ...doc.data() }
            });
        }

        // Criar nova conversa
        // Buscar nomes
        const patientDoc = await adminDb.collection('patients').doc(userId).get();
        const prescriberDoc = await adminDb.collection('users').doc(prescriberId).get(); // Assumindo users collection para prescritores

        const conversationData = {
            patientId: userId,
            prescriberId,
            metadata: {
                patientName: patientDoc.data()?.name || 'Paciente',
                prescriberName: prescriberDoc.data()?.name || 'Nutricionista',
                patientPhone: patientDoc.data()?.phone || null
            },
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            lastMessage: initialMessage ? {
                content: initialMessage,
                senderId: userId,
                timestamp: new Date()
            } : null,
            lastMessageAt: FieldValue.serverTimestamp(),
            unreadCount: 0
        };

        const ref = await adminDb.collection('conversations').add(conversationData);

        // Se tiver mensagem inicial, adicionar na subcoleção
        if (initialMessage) {
            await ref.collection('messages').add({
                conversationId: ref.id,
                senderId: userId,
                senderRole: 'patient',
                content: initialMessage,
                type: 'text',
                timestamp: FieldValue.serverTimestamp(),
                read: false
            });
        }

        return NextResponse.json({
            conversation: { id: ref.id, ...conversationData }
        });

    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
