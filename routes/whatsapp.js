const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Evolution API Configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://nutribuddy-evolution-api.onrender.com';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'NutriBuddy2024_MinhaChaveSecreta!';
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'nutribuddy';

/**
 * GET /api/whatsapp/qrcode
 * Busca QR Code para conectar WhatsApp
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

    // Busca QR Code do Evolution API
    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      base64: data.base64 || null,
      code: data.code || null,
      status: data.status || 'connecting'
    });
  } catch (error) {
    console.error('Erro ao buscar QR Code:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar QR Code',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/status
 * Verifica status da conexão WhatsApp
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem verificar status'
      });
    }

    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      status: data.state || 'disconnected',
      instance: data.instance || {}
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/disconnect
 * Desconecta WhatsApp
 */
router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem desconectar'
      });
    }

    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    res.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desconectar WhatsApp',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/send
 * Envia mensagem via WhatsApp
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

    // Formata número para padrão internacional
    const formattedPhone = phone.replace(/\D/g, '');

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: `${formattedPhone}@s.whatsapp.net`,
          text: message
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem',
      details: error.message
    });
  }
});

/**
 * POST /api/whatsapp/webhook/configure
 * Configura webhook do Evolution para n8n
 */
router.post('/webhook/configure', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem configurar webhook'
      });
    }

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 
      'https://n8n-production-7690.up.railway.app/webhook/evolution-whatsapp';

    const response = await fetch(
      `${EVOLUTION_API_URL}/webhook/set/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: N8N_WEBHOOK_URL,
          webhook_by_events: false,
          webhook_base64: false,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE'
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      message: 'Webhook configurado com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao configurar webhook',
      details: error.message
    });
  }
});

/**
 * GET /api/whatsapp/instance/info
 * Busca informações da instância
 */
router.get('/instance/info', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'prescriber') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const response = await fetch(
      `${EVOLUTION_API_URL}/instance/fetchInstances`,
      {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      instances: data
    });
  } catch (error) {
    console.error('Erro ao buscar instâncias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações',
      details: error.message
    });
  }
});

module.exports = router;

