const express = require('express');
const router = express.Router();
const { getWhatsAppService } = require('../services/whatsapp');
const { db, admin } = require('../config/firebase');

// Instância do serviço WhatsApp
const whatsapp = getWhatsAppService();

/**
 * Inicializar conexão WhatsApp
 * GET /api/whatsapp/connect
 */
router.get('/connect', async (req, res) => {
  try {
    console.log('🔌 Endpoint /connect chamado');
    
    const result = await whatsapp.connect();
    
    res.json({
      success: true,
      message: 'WhatsApp iniciando conexão',
      qr: result.qr,
      instructions: {
        step1: 'Escaneie o QR Code abaixo ou no terminal',
        step2: 'Use /whatsapp/qr para obter o QR Code',
        step3: 'Aguarde a confirmação de conexão'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar conexão',
      message: error.message
    });
  }
});

/**
 * Obter QR Code para conexão
 * GET /api/whatsapp/qr
 */
router.get('/qr', (req, res) => {
  try {
    const qr = whatsapp.getQrCode();
    
    if (!qr) {
      return res.json({
        success: false,
        message: 'QR Code ainda não foi gerado. Aguarde um momento ou chame /connect'
      });
    }

    res.json({
      success: true,
      qr: qr,
      instructions: {
        step1: 'Abra o WhatsApp no seu celular',
        step2: 'Vá em Configurações > Aparelhos Conectados',
        step3: 'Toque em "Conectar um aparelho"',
        step4: 'Escaneie este QR Code'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter QR Code:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter QR Code',
      message: error.message
    });
  }
});

/**
 * Status da conexão
 * GET /api/whatsapp/status
 */
router.get('/status', (req, res) => {
  try {
    const status = whatsapp.getStatus();
    
    res.json({
      success: true,
      ...status,
      message: status.connected 
        ? 'WhatsApp está conectado e pronto!' 
        : 'WhatsApp não está conectado'
    });
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter status',
      message: error.message
    });
  }
});

/**
 * Enviar mensagem de texto
 * POST /api/whatsapp/send
 * Body: { to: "5511999999999@s.whatsapp.net", message: "Olá!" }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, message'
      });
    }

    const result = await whatsapp.sendTextMessage(to, message);

    // Salvar no Firebase
    await db.collection('whatsapp_messages').add({
      type: 'sent',
      to,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem',
      message: error.message
    });
  }
});

/**
 * Enviar imagem
 * POST /api/whatsapp/send-image
 * Body: { to: "5511999999999@s.whatsapp.net", imageUrl: "https://...", caption: "..." }
 */
router.post('/send-image', async (req, res) => {
  try {
    const { to, imageUrl, caption } = req.body;

    if (!to || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, imageUrl'
      });
    }

    const result = await whatsapp.sendImageMessage(to, imageUrl, caption || '');

    // Salvar no Firebase
    await db.collection('whatsapp_messages').add({
      type: 'sent',
      to,
      imageUrl,
      caption,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao enviar imagem:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar imagem',
      message: error.message
    });
  }
});

/**
 * Desconectar WhatsApp
 * POST /api/whatsapp/disconnect
 */
router.post('/disconnect', async (req, res) => {
  try {
    await whatsapp.disconnect();
    
    res.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desconectar',
      message: error.message
    });
  }
});

/**
 * Limpar autenticação
 * POST /api/whatsapp/clean-auth
 */
router.post('/clean-auth', async (req, res) => {
  try {
    await whatsapp.disconnect();
    whatsapp.cleanAuth();
    
    res.json({
      success: true,
      message: 'Autenticação limpa. Use /connect para gerar novo QR Code'
    });
  } catch (error) {
    console.error('❌ Erro ao limpar auth:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar autenticação',
      message: error.message
    });
  }
});

/**
 * Listar mensagens salvas
 * GET /api/whatsapp/messages
 */
router.get('/messages', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const snapshot = await db.collection('whatsapp_messages')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('❌ Erro ao listar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar mensagens',
      message: error.message
    });
  }
});

/**
 * Configurar webhook para mensagens recebidas
 * GET /api/whatsapp/webhook-url
 */
router.get('/webhook-url', (req, res) => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  
  res.json({
    success: true,
    webhookUrl: `${baseUrl}/api/whatsapp/webhook`,
    instructions: {
      step1: 'Este webhook receberá notificações de novas mensagens',
      step2: 'Configure no seu sistema ou N8N',
      step3: 'As mensagens serão salvas automaticamente no Firestore'
    }
  });
});

module.exports = router;
