// =============================================================
// NUTRIBUDDY - WHATSAPP ROUTES (Z-API)
// =============================================================
// Arquivo: whatsapp-routes.js
// Copie este arquivo para a pasta do seu backend
// =============================================================

const express = require('express');
const router = express.Router();
const whatsappService = require('./whatsapp-service');

// Importe seu Firebase Admin (ajuste o caminho conforme necessário)
// const admin = require('./firebase-admin');
// const db = admin.firestore();

// =============================================================
// MIDDLEWARE: Verificar autenticação (opcional)
// =============================================================
// Descomente se quiser proteger os endpoints
/*
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
*/

// =============================================================
// GET /api/whatsapp/qrcode - Retornar QR Code como IMAGEM
// =============================================================
router.get('/qrcode', async (req, res) => {
  try {
    console.log('📱 Requisição de QR Code (imagem)');
    
    const result = await whatsappService.getQRCodeImage();

    if (result.success) {
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.send(result.image);
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint /qrcode:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// GET /api/whatsapp/qrcode-base64 - Retornar QR Code como BASE64
// =============================================================
router.get('/qrcode-base64', async (req, res) => {
  try {
    console.log('📱 Requisição de QR Code (base64)');
    
    const result = await whatsappService.getQRCodeBase64();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no endpoint /qrcode-base64:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// GET /api/whatsapp/status - Status da conexão WhatsApp
// =============================================================
router.get('/status', async (req, res) => {
  try {
    console.log('📊 Requisição de status da conexão');
    
    const result = await whatsappService.getConnectionStatus();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no endpoint /status:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

// =============================================================
// GET /api/whatsapp/health - Health check completo
// =============================================================
router.get('/health', async (req, res) => {
  try {
    const result = await whatsappService.healthCheck();
    
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/send - Enviar mensagem de texto
// =============================================================
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    console.log(`📤 Enviando mensagem para ${to}`);

    // Validação
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, message'
      });
    }

    // Enviar via Z-API
    const result = await whatsappService.sendTextMessage(to, message);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: 'Mensagem enviada com sucesso'
      });
    } else {
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint /send:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/send-image - Enviar imagem
// =============================================================
router.post('/send-image', async (req, res) => {
  try {
    const { to, imageUrl, caption } = req.body;

    console.log(`📤 Enviando imagem para ${to}`);

    // Validação
    if (!to || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, imageUrl'
      });
    }

    // Enviar via Z-API
    const result = await whatsappService.sendImageMessage(to, imageUrl, caption);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: 'Imagem enviada com sucesso'
      });
    } else {
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint /send-image:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/disconnect - Desconectar WhatsApp
// =============================================================
router.post('/disconnect', async (req, res) => {
  try {
    console.log('🔌 Desconectando WhatsApp');
    
    // TODO: Adicionar verificação de permissão
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ error: 'Não autorizado' });
    // }

    const result = await whatsappService.disconnectWhatsApp();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no endpoint /disconnect:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/restart - Reiniciar instância
// =============================================================
router.post('/restart', async (req, res) => {
  try {
    console.log('🔄 Reiniciando instância WhatsApp');
    
    const result = await whatsappService.restartInstance();

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no endpoint /restart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/whatsapp/check-phone - Verificar se número existe
// =============================================================
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: phone'
      });
    }

    const result = await whatsappService.checkPhoneExists(phone);

    res.json(result);
  } catch (error) {
    console.error('❌ Erro no endpoint /check-phone:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================
// POST /api/webhooks/zapi-whatsapp - Webhook de mensagens recebidas
// =============================================================
router.post('/webhooks/zapi-whatsapp', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API (mensagem recebida):', JSON.stringify(req.body, null, 2));

    const {
      phone,           // Número que enviou (ex: 5511999999999@c.us)
      fromMe,          // true se você enviou, false se recebeu
      text,            // Objeto com texto da mensagem
      image,           // Objeto com imagem (se houver)
      messageId,       // ID único da mensagem
      instanceId,      // ID da sua instância
      chatId,          // ID do chat
      type,            // Tipo do webhook
      senderName,      // Nome do contato
      senderPhoto      // Foto do contato
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

    // =======================================================
    // TODO: INTEGRAR COM SEU FIRESTORE
    // =======================================================
    // 1. Buscar paciente por telefone
    // const patient = await findPatientByPhone(phoneNumber);
    
    // 2. Salvar mensagem no Firestore
    // await saveMessageToFirestore({ ... });
    
    // 3. Atualizar conversa
    // await updateConversation(conversationId, { ... });

    // Por enquanto, apenas logar
    console.log('✅ Mensagem processada (lógica de salvamento pendente)');

    // Z-API espera resposta 200 OK
    return res.status(200).json({ 
      received: true,
      phoneNumber,
      messageContent
    });

  } catch (error) {
    console.error('❌ Erro no webhook zapi-whatsapp:', error);
    // Mesmo com erro, responder 200 para Z-API não reenviar
    return res.status(200).json({ received: true, error: error.message });
  }
});

// =============================================================
// POST /api/webhooks/zapi-status - Webhook de status da conexão
// =============================================================
router.post('/webhooks/zapi-status', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API (status):', JSON.stringify(req.body, null, 2));

    const { event, state, status, phone, qrcode } = req.body;

    // Eventos possíveis:
    // - connection.update: quando conecta/desconecta
    // - qrcode.updated: quando QR Code é atualizado

    // =======================================================
    // TODO: INTEGRAR COM SEU FIRESTORE
    // =======================================================
    // Salvar evento no Firestore para histórico
    // await db.collection('whatsappEvents').add({
    //   event,
    //   state,
    //   status,
    //   phone,
    //   hasQrCode: !!qrcode,
    //   timestamp: admin.firestore.FieldValue.serverTimestamp()
    // });

    // Atualizar status geral
    // await db.collection('systemConfig').doc('whatsapp').set({
    //   connected: state === 'CONNECTED' || status === 'open',
    //   phone: phone || null,
    //   lastEvent: event,
    //   lastUpdate: admin.firestore.FieldValue.serverTimestamp()
    // }, { merge: true });

    if (state === 'CONNECTED' || status === 'open') {
      console.log('✅ WhatsApp CONECTADO:', phone);
    } else if (state === 'DISCONNECTED' || status === 'close') {
      console.log('⚠️ WhatsApp DESCONECTADO');
    }

    // TODO: Enviar notificação para frontend via WebSocket/Firebase
    // notifyAdmin({ type: 'whatsapp_status', connected: state === 'CONNECTED' });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook zapi-status:', error);
    res.status(200).json({ received: true, error: error.message });
  }
});

// =============================================================
// EXPORTS
// =============================================================
module.exports = router;

// =============================================================
// FIM DO ARQUIVO
// =============================================================
// 
// INTEGRAÇÃO NO SERVER.JS:
// 
// const whatsappRoutes = require('./whatsapp-routes');
// app.use('/api/whatsapp', whatsappRoutes);
// app.use('/api/webhooks', whatsappRoutes);
// 
// =============================================================

