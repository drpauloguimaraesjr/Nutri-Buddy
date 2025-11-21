import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

// Função para normalizar telefone (remove tudo que não é número)
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

export async function POST(req: NextRequest) {
    try {
        // Parse do form data do Twilio
        const formData = await req.formData();
        const from = formData.get('From') as string;
        const body = formData.get('Body') as string;
        const mediaUrl = formData.get('MediaUrl0') as string | null;
        const mediaContentType = formData.get('MediaContentType0') as string | null;

        console.log('📩 Twilio Webhook received:', { from, body, mediaUrl, mediaContentType });

        const twiml = new MessagingResponse();

        if (!from || !body) {
            return new NextResponse('Missing From or Body', { status: 400 });
        }

        // 1. Identificar Paciente
        const phone = normalizePhone(from);
        console.log('🔍 Searching patient with phone:', phone);

        // Buscar na coleção 'users' com role 'patient'
        let patientSnapshot = await adminDb
            .collection('users')
            .where('role', '==', 'patient')
            .where('phone', '==', phone)
            .limit(1)
            .get();

        // Tentar com +
        if (patientSnapshot.empty) {
            patientSnapshot = await adminDb
                .collection('users')
                .where('role', '==', 'patient')
                .where('phone', '==', `+${phone}`)
                .limit(1)
                .get();
        }

        if (patientSnapshot.empty) {
            console.log('❌ Patient not found');
            twiml.message('Olá! Não encontrei seu cadastro no NutriBuddy. Por favor, entre em contato com seu nutricionista para verificar seu número.');
            return new NextResponse(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const patientDoc = patientSnapshot.docs[0];
        const patientId = patientDoc.id;
        const patientData = patientDoc.data();
        const prescriberId = patientData.prescriberId;

        console.log('✅ Patient found:', patientData.name);

        if (!prescriberId) {
            twiml.message(`Olá ${patientData.name}! Você ainda não tem um nutricionista atribuído. Entre em contato com o suporte.`);
            return new NextResponse(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // 2. Buscar ou Criar Conversa
        let conversationSnapshot = await adminDb
            .collection('conversations')
            .where('patientId', '==', patientId)
            .where('prescriberId', '==', prescriberId)
            .limit(1)
            .get();

        let conversationId: string;

        if (conversationSnapshot.empty) {
            // Criar nova conversa
            const prescriberDoc = await adminDb.collection('users').doc(prescriberId).get();
            const conversationRef = await adminDb.collection('conversations').add({
                patientId,
                prescriberId,
                metadata: {
                    patientName: patientData.name || 'Paciente',
                    prescriberName: prescriberDoc.data()?.name || 'Nutricionista',
                    patientPhone: patientData.phone || null
                },
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                lastMessage: null,
                lastMessageAt: FieldValue.serverTimestamp(),
                unreadCount: 0,
                whatsappEnabled: true
            });
            conversationId = conversationRef.id;
            console.log('✅ New conversation created:', conversationId);
        } else {
            conversationId = conversationSnapshot.docs[0].id;
            console.log('✅ Existing conversation found:', conversationId);
        }

        // 3. Salvar Mensagem do Paciente
        const messageType = mediaUrl ? (mediaContentType?.startsWith('image/') ? 'image' : 'audio') : 'text';

        const messageData = {
            conversationId,
            senderId: patientId,
            senderRole: 'patient',
            content: body,
            type: messageType,
            mediaUrl: mediaUrl || null,
            timestamp: FieldValue.serverTimestamp(),
            read: false,
            source: 'whatsapp'
        };

        const msgRef = await adminDb
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .add(messageData);

        // Atualizar conversa
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

        console.log('✅ Message saved:', msgRef.id);

        // 4. Disparar Webhook do n8n
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-interno-teste';

        try {
            const webhookPayload = {
                conversationId,
                patientId,
                prescriberId,
                messageId: msgRef.id,
                content: body,
                type: messageType,
                mediaUrl: mediaUrl || null,
                source: 'whatsapp'
            };

            console.log('🚀 Triggering n8n webhook:', webhookPayload);

            await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookPayload),
            });

            console.log('✅ n8n webhook triggered successfully');
        } catch (error) {
            console.error('❌ Error triggering n8n webhook:', error);
        }

        // 5. Responder com confirmação (a IA vai responder depois via Twilio API)
        twiml.message('✅ Mensagem recebida! Estou processando...');

        return new NextResponse(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' },
        });

    } catch (error) {
        console.error('Webhook error:', error);
        const twiml = new MessagingResponse();
        twiml.message('Desculpe, tive um erro ao processar sua mensagem. Tente novamente.');
        return new NextResponse(twiml.toString(), {
            headers: { 'Content-Type': 'text/xml' },
        });
    }
}
