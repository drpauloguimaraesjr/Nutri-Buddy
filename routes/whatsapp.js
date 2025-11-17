const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const whatsappService = require('../services/whatsapp-service');
const twilioService = require('../services/twilio-service');
const { getPhoneVariations } = require('../utils/phone-utils');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * GET /api/whatsapp/qrcode-test
 * Busca QR Code SEM AUTENTICAÇÃO (apenas para testes)
 */
router.get('/qrcode-test', async (req, res) => {
  try {
    console.log('📱 Solicitação de QR Code Z-API (TESTE - sem auth)');

    const result = await whatsappService.getQRCodeBase64();

    if (result.success) {
      res.json({
        success: true,
        base64: result.base64,
        expiresIn: result.expiresIn,
        status: 'connecting'
      });
    } else {
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
 * GET /api/whatsapp/status-test
 * Verifica status SEM AUTENTICAÇÃO (apenas para testes)
 */
router.get('/status-test', async (req, res) => {
  try {
    console.log('📊 Verificando status Z-API (TESTE - sem auth)');

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

    console.log(`📨 [Z-API] Mensagem de ${senderName} (${phoneNumber}): ${messageContent}`);

    // Gerar variações do número para buscar (com e sem +55)
    const phoneVariations = getPhoneVariations(phoneNumber);
    console.log(`🔍 [Z-API] Buscando paciente com variações:`, phoneVariations);

    // Buscar paciente por telefone (testar múltiplas variações)
    let patientsSnapshot = null;
    for (const variation of phoneVariations) {
      const snapshot = await db.collection('users')
        .where('phone', '==', variation)
        .where('role', '==', 'patient')
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        patientsSnapshot = snapshot;
        console.log(`✅ [Z-API] Paciente encontrado com número: ${variation}`);
        break;
      }
    }

    if (!patientsSnapshot || patientsSnapshot.empty) {
      console.log('⚠️ [Z-API] Paciente não encontrado com nenhuma variação:', phoneVariations);
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

// ================================================================
// TWILIO WHATSAPP ENDPOINTS
// ================================================================

/**
 * POST /api/whatsapp/twilio/send
 * Envia mensagem via Twilio WhatsApp
 * Body: { to, message, imageUrl (opcional), caption (opcional) }
 */
router.post('/twilio/send', verifyToken, async (req, res) => {
  try {
    const { to, message, imageUrl, caption } = req.body;

    // Validação
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: to (número de telefone)'
      });
    }
    
    if (!message && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Informe message (texto) ou imageUrl (imagem)'
      });
    }

    console.log(`📤 [Twilio] Enviando mensagem para ${to}`);

    let result;
    
    // Enviar imagem ou texto
    if (imageUrl) {
      result = await twilioService.sendImageMessage(to, imageUrl, message || caption);
    } else {
      result = await twilioService.sendTextMessage(to, message);
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Mensagem enviada com sucesso via Twilio',
        to: result.to,
        provider: 'twilio'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        code: result.code,
        provider: 'twilio'
      });
    }
  } catch (error) {
    console.error('❌ [Twilio] Erro no endpoint /twilio/send:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      provider: 'twilio'
    });
  }
});

/**
 * POST /api/whatsapp/twilio/send-template
 * Envia template aprovado pela Meta via Twilio
 * Body: { to, contentSid, variables (opcional) }
 */
router.post('/twilio/send-template', verifyToken, async (req, res) => {
  try {
    const { to, contentSid, variables } = req.body;

    if (!to || !contentSid) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, contentSid'
      });
    }

    console.log(`📤 [Twilio] Enviando template para ${to}`);

    const result = await twilioService.sendTemplateMessage(to, contentSid, variables || {});

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Template enviado com sucesso',
        provider: 'twilio'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        code: result.code,
        provider: 'twilio'
      });
    }
  } catch (error) {
    console.error('❌ [Twilio] Erro no endpoint /twilio/send-template:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      provider: 'twilio'
    });
  }
});

/**
 * GET /api/whatsapp/twilio/status
 * Verifica status da conta Twilio
 */
router.get('/twilio/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem verificar status'
      });
    }

    console.log('📊 [Twilio] Verificando status da conta');

    const result = await twilioService.getAccountStatus();

    res.json({
      ...result,
      provider: 'twilio',
      service: 'NutriBuddy WhatsApp Twilio'
    });
  } catch (error) {
    console.error('❌ [Twilio] Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      configured: false,
      status: 'error',
      error: error.message,
      provider: 'twilio'
    });
  }
});

/**
 * GET /api/whatsapp/twilio/history
 * Busca histórico de mensagens Twilio
 * Query params: phoneNumber (opcional), limit (default: 20)
 */
router.get('/twilio/history', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem ver histórico'
      });
    }

    const { phoneNumber, limit = 20 } = req.query;

    console.log('📜 [Twilio] Buscando histórico de mensagens');

    const result = await twilioService.getMessageHistory(phoneNumber, parseInt(limit));

    res.json({
      ...result,
      provider: 'twilio'
    });
  } catch (error) {
    console.error('❌ [Twilio] Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      provider: 'twilio',
      messages: []
    });
  }
});

/**
 * POST /twilio-whatsapp (montado em /webhooks via server.js)
 * Webhook para receber mensagens do Twilio WhatsApp
 * NOTA: Este endpoint NÃO usa verifyToken pois é chamado pelo Twilio
 * IMPORTANTE: Twilio envia dados como application/x-www-form-urlencoded
 */
router.post('/twilio-whatsapp', async (req, res) => {
  try {
    console.log('📩 [Twilio] Webhook recebido:', JSON.stringify(req.body, null, 2));

    const {
      MessageSid,        // ID único da mensagem
      From,              // Número que enviou (whatsapp:+5511999999999)
      To,                // Seu número Twilio
      Body,              // Texto da mensagem
      NumMedia,          // Número de mídias
      MediaUrl0,         // URL da primeira mídia
      MediaContentType0, // Tipo da mídia
      ProfileName,       // Nome do perfil WhatsApp
      SmsStatus          // Status da mensagem
    } = req.body;

    // Extrair número do paciente (remover prefixo whatsapp:)
    const phoneNumber = From.replace('whatsapp:', '').replace('+', '');
    const hasMedia = parseInt(NumMedia || '0') > 0;
    const messageContent = Body || '';
    const mediaUrl = hasMedia ? MediaUrl0 : null;
    const mediaType = hasMedia ? MediaContentType0 : null;

    console.log(`📨 [Twilio] Mensagem de ${ProfileName} (${phoneNumber}): ${messageContent}`);

    // Gerar variações do número para buscar (com e sem +55)
    const phoneVariations = getPhoneVariations(phoneNumber);
    console.log(`🔍 [Twilio] Buscando paciente com variações:`, phoneVariations);

    // Buscar paciente por telefone (testar múltiplas variações)
    let patientsSnapshot = null;
    for (const variation of phoneVariations) {
      const snapshot = await db.collection('users')
        .where('phone', '==', variation)
        .where('role', '==', 'patient')
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        patientsSnapshot = snapshot;
        console.log(`✅ [Twilio] Paciente encontrado com número: ${variation}`);
        break;
      }
    }

    if (!patientsSnapshot || patientsSnapshot.empty) {
      console.log('⚠️  [Twilio] Paciente não encontrado com nenhuma variação:', phoneVariations);
      
      // Responder ao paciente via Twilio
      await twilioService.sendTextMessage(
        phoneNumber, // Enviar apenas o número sem prefixo
        'Olá! Não encontrei seu cadastro. Entre em contato com seu nutricionista.'
      );
      
      // Twilio espera resposta TwiML (XML) ou 200 vazio
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    const patientDoc = patientsSnapshot.docs[0];
    const patient = { id: patientDoc.id, ...patientDoc.data() };

    // Criar ID da conversa
    const conversationId = `${patient.prescriberId}_${patient.id}`;

    // Salvar mensagem no Firestore
    await db.collection('whatsappMessages').add({
      conversationId,
      patientId: patient.id,
      patientName: patient.name || ProfileName,
      prescriberId: patient.prescriberId,
      content: messageContent,
      hasImage: hasMedia,
      imageUrl: mediaUrl,
      mediaType: mediaType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      senderType: 'patient',
      isFromPatient: true,
      analyzed: false,
      sent: true,
      twilioMessageId: MessageSid,
      provider: 'twilio'
    });

    // Atualizar/criar conversa
    await db.collection('whatsappConversations')
      .doc(conversationId)
      .set({
        patientId: patient.id,
        prescriberId: patient.prescriberId,
        lastMessage: messageContent || '📷 Imagem',
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        hasUnreadMessages: true,
        unreadCount: admin.firestore.FieldValue.increment(1),
        provider: 'twilio'
      }, { merge: true });

    console.log('✅ [Twilio] Mensagem salva no Firestore');

    // Twilio espera resposta TwiML (XML)
    // Opção A: Sem resposta automática (apenas processar)
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
    // Opção B: Com resposta automática (descomente se quiser)
    // res.status(200).send(`
    //   <?xml version="1.0" encoding="UTF-8"?>
    //   <Response>
    //     <Message>Olá ${ProfileName}! Recebi sua mensagem. Em breve vou responder!</Message>
    //   </Response>
    // `);

  } catch (error) {
    console.error('❌ [Twilio] Erro no webhook:', error);
    // Mesmo com erro, responder 200 para Twilio não reenviar
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

/**
 * POST /twilio-status (montado em /webhooks via server.js)
 * Webhook para receber status de mensagens do Twilio
 * Status: queued, sending, sent, delivered, read, failed, undelivered
 */
router.post('/twilio-status', async (req, res) => {
  try {
    console.log('📊 [Twilio] Status update:', JSON.stringify(req.body, null, 2));

    const {
      MessageSid,
      MessageStatus,  // queued, sending, sent, delivered, read, failed, undelivered
      To,
      ErrorCode,
      ErrorMessage
    } = req.body;

    // Salvar evento no Firestore
    await db.collection('whatsappEvents').add({
      event: 'message_status',
      messageSid: MessageSid,
      status: MessageStatus,
      to: To,
      errorCode: ErrorCode || null,
      errorMessage: ErrorMessage || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'twilio'
    });

    // Atualizar status da mensagem no Firestore (se existir)
    const messagesSnapshot = await db.collection('whatsappMessages')
      .where('twilioMessageId', '==', MessageSid)
      .limit(1)
      .get();

    if (!messagesSnapshot.empty) {
      const messageDoc = messagesSnapshot.docs[0];
      await messageDoc.ref.update({
        status: MessageStatus,
        errorCode: ErrorCode || null,
        errorMessage: ErrorMessage || null,
        statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ [Twilio] Status atualizado: ${MessageSid} → ${MessageStatus}`);
    }

    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('❌ [Twilio] Erro no webhook status:', error);
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

module.exports = router;

