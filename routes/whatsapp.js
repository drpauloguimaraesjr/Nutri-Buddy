const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const whatsappService = require('../services/whatsapp-service');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * GET /api/whatsapp/qrcode
 * Busca QR Code para conectar WhatsApp via Z-API
 */
router.get('/qrcode', verifyToken, async (req, res) => {
  try {
    // Verifica se usuário é prescritor
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem conectar WhatsApp'
      });
    }

    console.log('📱 Solicitação de QR Code Z-API');

    // Busca QR Code via Z-API
    const result = await whatsappService.getQRCodeBase64();

    if (result.success) {
      res.json({
        success: true,
        base64: result.base64,
        expiresIn: result.expiresIn,
        status: 'connecting'
      });
    } else {
      // Se não conseguir QR Code, pode estar já conectado
      const statusResult = await whatsappService.getConnectionStatus();
      
      if (statusResult.connected) {
        return res.json({
          success: true,
          status: 'connected',
          phone: statusResult.phone
        });
      }

      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar QR Code:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar QR Code',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/status
 * Verifica status da conexão WhatsApp via Z-API
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem verificar status'
      });
    }

    console.log('📊 Verificando status Z-API');

    const result = await whatsappService.getConnectionStatus();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      connected: false,
      status: 'disconnected',
      error: 'Erro ao verificar status',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/disconnect
 * Desconecta WhatsApp via Z-API
 */
router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem desconectar'
      });
    }

    console.log('🔌 Desconectando WhatsApp Z-API');

    const result = await whatsappService.disconnectWhatsApp();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desconectar WhatsApp',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/send
 * Envia mensagem via WhatsApp Z-API
 */
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Telefone e mensagem são obrigatórios'
      });
    }

    console.log(`📤 Enviando mensagem para ${phone}`);

    const result = await whatsappService.sendTextMessage(phone, message);

    if (result.success) {
      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        messageId: result.messageId,
        to: result.to
      });
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/restart
 * Reinicia instância Z-API
 */
router.post('/restart', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem reiniciar'
      });
    }

    console.log('🔄 Reiniciando instância Z-API');

    const result = await whatsappService.restartInstance();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao reiniciar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao reiniciar instância',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/health
 * Health check Z-API
 */
router.get('/health', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const result = await whatsappService.healthCheck();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no health check',
      details: error.message
    });
  }
});

/**
 * POST /webhooks/zapi-whatsapp
 * Webhook para receber mensagens do Z-API
 * NOTA: Este endpoint NÃO usa verifyToken pois é chamado pelo Z-API
 */
router.post('/webhooks/zapi-whatsapp', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API recebido:', JSON.stringify(req.body, null, 2));

    const {
      phone,           // Número que enviou
      fromMe,          // true se você enviou, false se recebeu
      text,            // Objeto com texto
      image,           // Objeto com imagem
      messageId,       // ID da mensagem
      chatId,          // ID do chat
      type,            // Tipo do webhook
      senderName,      // Nome do contato
    } = req.body;

    // Ignorar mensagens enviadas por você
    if (fromMe) {
      console.log('⏩ Mensagem enviada por mim, ignorando');
      return res.status(200).json({ received: true });
    }

    // Ignorar webhooks de status
    if (type === 'MessageStatus') {
      console.log('⏩ Status de mensagem, ignorando');
      return res.status(200).json({ received: true });
    }

    // Extrair dados
    const phoneNumber = phone.replace('@c.us', '').replace('@s.whatsapp.net', '');
    const messageContent = text?.message || image?.caption || 'Mensagem sem texto';
    const hasImage = !!image;
    const imageUrl = hasImage ? image.imageUrl : null;

    console.log(`📨 Mensagem de ${senderName} (${phoneNumber}): ${messageContent}`);

    // Buscar paciente por telefone
    const patientsSnapshot = await db.collection('users')
      .where('phone', '==', phoneNumber)
      .where('role', '==', 'patient')
      .limit(1)
      .get();

    if (patientsSnapshot.empty) {
      console.log('⚠️ Paciente não encontrado:', phoneNumber);
      return res.status(200).json({ received: true, patientNotFound: true });
    }

    const patientDoc = patientsSnapshot.docs[0];
    const patient = { id: patientDoc.id, ...patientDoc.data() };

    // Criar ID da conversa
    const conversationId = `${patient.prescriberId}_${patient.id}`;

    // Salvar mensagem no Firestore
    await db.collection('whatsappMessages').add({
      conversationId,
      patientId: patient.id,
      patientName: patient.name || senderName,
      prescriberId: patient.prescriberId,
      content: messageContent,
      hasImage,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      senderType: 'patient',
      isFromPatient: true,
      analyzed: false,
      sent: true,
      zapiMessageId: messageId
    });

    // Atualizar/criar conversa
    await db.collection('whatsappConversations')
      .doc(conversationId)
      .set({
        patientId: patient.id,
        prescriberId: patient.prescriberId,
        lastMessage: messageContent,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        hasUnreadMessages: true,
        unreadCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true });

    console.log('✅ Mensagem salva no Firestore');

    res.status(200).json({ 
      received: true,
      patientId: patient.id 
    });

  } catch (error) {
    console.error('❌ Erro no webhook zapi-whatsapp:', error);
    // Mesmo com erro, responder 200 para Z-API não reenviar
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * POST /webhooks/zapi-status
 * Webhook para receber status de conexão do Z-API
 * NOTA: Este endpoint NÃO usa verifyToken pois é chamado pelo Z-API
 */
router.post('/webhooks/zapi-status', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API Status:', JSON.stringify(req.body, null, 2));

    const { event, state, status, phone } = req.body;

    // Salvar evento no Firestore para histórico
    await db.collection('whatsappEvents').add({
      event,
      state,
      status,
      phone,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'z-api'
    });

    // Atualizar status geral
    await db.collection('systemConfig').doc('whatsapp').set({
      connected: state === 'CONNECTED' || status === 'open',
      phone: phone || null,
      lastEvent: event,
      lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      provider: 'z-api'
    }, { merge: true });

    if (state === 'CONNECTED' || status === 'open') {
      console.log('✅ WhatsApp CONECTADO:', phone);
    } else if (state === 'DISCONNECTED' || status === 'close') {
      console.log('⚠️ WhatsApp DESCONECTADO');
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook zapi-status:', error);
    res.status(200).json({ received: true, error: error.message });
  }
});

module.exports = router;

