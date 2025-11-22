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
        const normalizedPhone = normalizePhone(from);
        console.log('🔍 Raw From:', from);
        console.log('🔍 Normalized Phone:', normalizedPhone);
        console.log('🔍 Searching for phone variants:', [normalizedPhone, `+${normalizedPhone}`]);

        // Buscar na coleção 'users' por telefone (sem filtro de role primeiro para debug)
        console.log('🔍 Searching users by phone (any role)...');
        let userSnapshot = await adminDb
            .collection('users')
            .where('phone', '==', normalizedPhone)
            .limit(1)
            .get();

        if (userSnapshot.empty) {
            console.log('🔍 Not found with normalized phone. Trying with +...');
            userSnapshot = await adminDb
                .collection('users')
                .where('phone', '==', `+${normalizedPhone}`)
                .limit(1)
                .get();
        }

        if (userSnapshot.empty) {
            console.log('❌ User not found with any phone variant');
            twiml.message('Olá! Não encontrei seu cadastro no NutriBuddy. Por favor, entre em contato com seu nutricionista para verificar seu número.');
            return new NextResponse(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        console.log('✅ User found:', { id: userDoc.id, role: userData.role, name: userData.name });

        if (userData.role !== 'patient') {
            console.log('🚫 User is not a patient. Role:', userData.role);
            // Opcional: Permitir outros roles para teste ou retornar erro específico
            // Por enquanto, vamos bloquear mas logar
            twiml.message('Olá! Seu cadastro não está identificado como paciente. Entre em contato com o suporte.');
            return new NextResponse(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // Se chegou aqui, é paciente
        const patientSnapshot = userSnapshot; // Reutilizar para manter compatibilidade com código abaixo

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
        console.log('🔍 Step 2: Finding/Creating conversation...');
        const conversationSnapshot = await adminDb
            .collection('conversations')
            .where('patientId', '==', patientId)
            .where('prescriberId', '==', prescriberId)
            .limit(1)
            .get();

        let conversationId: string;

        if (conversationSnapshot.empty) {
            console.log('✨ Creating new conversation...');
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
        console.log('💾 Step 3: Saving message...');
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

        // 4. Disparar Webhook do n8n (WhatsApp workflow)
        console.log('🚀 Step 4: Triggering n8n...');
        const n8nWebhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL || 'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-producao';
        console.log('🔗 n8n URL:', n8nWebhookUrl);

        try {
            const webhookPayload = {
                conversationId,
                patientId,
                prescriberId,
                messageId: msgRef.id,
                content: body,
                type: messageType,
                mediaUrl: mediaUrl || null,
                source: 'whatsapp',
                patientPhone: from // Incluir telefone para resposta
            };

            console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));

            const n8nResponse = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookPayload),
            });

            console.log('📡 n8n Response Status:', n8nResponse.status);
            const n8nText = await n8nResponse.text();
            console.log('📡 n8n Response Body:', n8nText);

            if (!n8nResponse.ok) {
                console.error('❌ n8n returned error status');
            } else {
                console.log('✅ n8n WhatsApp webhook triggered successfully');
            }
        } catch (error) {
            console.error('❌ Error triggering n8n webhook:', error);
        }

        // 5. Responder com confirmação (a IA vai responder depois via Twilio API)
        console.log('✅ Step 5: Sending confirmation response to Twilio');
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
