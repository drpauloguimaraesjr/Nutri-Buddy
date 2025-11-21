import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = params;
        const doc = await adminDb.collection('conversations').doc(conversationId).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const data = doc.data();

        // Buscar metadados atualizados se necessário
        // O ChatInterface espera { conversation: { ... } }

        return NextResponse.json({
            conversation: {
                id: doc.id,
                ...data,
                lastMessageAt: data?.lastMessageAt?.toDate?.()?.toISOString() || null
            }
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = params;
        const body = await req.json();

        await adminDb.collection('conversations').doc(conversationId).update(body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
