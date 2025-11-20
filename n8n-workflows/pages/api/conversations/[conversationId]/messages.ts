import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../../src/lib/auth';

// Configurações N8N
const N8N_PRODUCTION_WEBHOOK_URL = process.env.N8N_PRODUCTION_WEBHOOK_URL;
const N8N_TEST_WEBHOOK_URL = process.env.N8N_TEST_WEBHOOK_URL;
const testEmails = new Set((process.env.N8N_TEST_EMAILS || "").split(",").map(e => e.trim()));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticação
    const decoded = await verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId } = req.query;
    const { content, type = 'text', attachments } = req.body;

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!content && !attachments) {
      return res.status(400).json({ error: 'Content or attachments required' });
    }

    // Mock: Buscar dados da conversa e paciente
    // Em produção, isso viria do Firestore
    const conversation = {
      patientId: conversationId.toString().replace('internal_', ''),
      prescriberId: decoded.uid,
      patientEmail: 'paciente@example.com' // Mock - em produção viria do banco
    };

    const patient = {
      email: conversation.patientEmail,
      id: conversation.patientId
    };

    // LÓGICA DE ROTEAMENTO
    const isTestUser = testEmails.has(patient.email) || testEmails.has(decoded.email);
    const webhookUrl = isTestUser ? N8N_TEST_WEBHOOK_URL : N8N_PRODUCTION_WEBHOOK_URL;

    console.log(`🤖 [N8N] Roteando para: ${isTestUser ? "TESTE" : "PRODUÇÃO"} (Usuário: ${patient.email})`);

    // Notificar N8N
    if (webhookUrl) {
      try {
        const n8nResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || 'nutribuddy-secret-2024'
          },
          body: JSON.stringify({
            conversationId,
            messageId: `msg_${Date.now()}`,
            content,
            senderId: decoded.uid,
            senderRole: decoded.role || 'prescriber',
            isTest: isTestUser,
            channel: 'internal_chat',
            patientId: conversation.patientId,
            prescriberId: conversation.prescriberId,
            type,
            attachments,
            timestamp: new Date().toISOString()
          }),
        });

        if (!n8nResponse.ok) {
          console.error(`❌ [N8N] Webhook error: ${n8nResponse.status}`);
        } else {
          console.log(`✅ [N8N] Mensagem roteada com sucesso para ${isTestUser ? "TESTE" : "PRODUÇÃO"}`);
        }
      } catch (err) {
        console.error(`❌ [N8N] Erro ao notificar webhook ${isTestUser ? "de teste" : "de produção"}:`, err);
      }
    }

    // Responder com sucesso
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      routedTo: isTestUser ? 'test' : 'production'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
