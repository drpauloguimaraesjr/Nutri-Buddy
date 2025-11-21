import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;

        const snapshot = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Converter Timestamp para string ISO se necessário, mas JSON.stringify lida com isso geralmente
        })).reverse(); // Retornar em ordem cronológica para o contexto da IA

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    if (!validateSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId } = params;
        const body = await req.json();

        const { senderId, senderRole, content, type = 'text', isAiGenerated = false } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const messageData = {
            conversationId,
            senderId,
            senderRole,
            content,
            type,
            isAiGenerated,
            timestamp: FieldValue.serverTimestamp(),
            read: false
        };

        // 1. Adicionar mensagem na subcoleção
        const msgRef = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .add(messageData);

        // 2. Atualizar conversa (lastMessage)
        await adminDb.collection('conversations').doc(conversationId).update({
            lastMessage: {
                ...messageData,
                id: msgRef.id,
                timestamp: new Date() // Usar Date JS para o campo map, FieldValue para o timestamp real se fosse o caso
            },
            lastMessageAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            // Incrementar unreadCount se for mensagem do paciente (mas aqui é IA/Prescritor respondendo)
            unreadCount: senderRole === 'patient' ? FieldValue.increment(1) : 0
        });

        return NextResponse.json({ success: true, messageId: msgRef.id });
    } catch (error) {
        console.error('Error saving message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
