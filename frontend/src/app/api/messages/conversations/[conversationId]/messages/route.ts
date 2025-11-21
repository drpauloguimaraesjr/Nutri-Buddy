import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// URL do Webhook do n8n (Produção)
const N8N_WEBHOOK_URL = 'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-interno-teste';

export async function POST(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    try {
        // Validar autenticação
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { conversationId } = params;
        const body = await req.json();
        const { content, type = 'text' } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Buscar conversa para saber quem é quem
        const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversationData = conversationDoc.data();
        const senderRole = userId === conversationData?.patientId ? 'patient' : 'prescriber';

        const messageData = {
            conversationId,
            senderId: userId,
            senderRole,
            content,
            type,
            isAiGenerated: false,
            timestamp: FieldValue.serverTimestamp(),
            read: false
        };

        // 1. Salvar no Firestore
        const msgRef = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .add(messageData);

        // 2. Atualizar conversa
        await adminDb.collection('conversations').doc(conversationId).update({
            lastMessage: {
                ...messageData,
                id: msgRef.id,
                timestamp: new Date()
            },
            lastMessageAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            unreadCount: FieldValue.increment(1)
        });

        // 3. Enviar para n8n (Apenas se for PACIENTE)
        // O n8n vai processar e responder se necessário
        if (senderRole === 'patient') {
            try {
                // Não esperar a resposta do n8n para não travar a UI
                fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId,
                        messageId: msgRef.id,
                        senderId: userId,
                        senderRole,
                        content,
                        type,
                        patientId: conversationData?.patientId,
                        prescriberId: conversationData?.prescriberId,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error('Error sending to n8n:', err));
            } catch (err) {
                console.error('Error triggering n8n webhook:', err);
            }
        }

        return NextResponse.json({
            success: true,
            message: { id: msgRef.id, ...messageData, createdAt: new Date().toISOString() }
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { conversationId: string } }
) {
    try {
        // Validar autenticação
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = params;
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 50;

        const snapshot = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .orderBy('timestamp', 'asc') // Frontend espera ordem cronológica? ChatInterface faz map direto, então talvez precise inverter ou ordenar lá.
            // O ChatInterface usa .map direto, então a ordem importa.
            // Geralmente buscamos desc e invertemos, ou buscamos asc.
            // Vamos buscar asc (mais antigas primeiro -> mais novas)
            .limitToLast(limit)
            .get();

        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
