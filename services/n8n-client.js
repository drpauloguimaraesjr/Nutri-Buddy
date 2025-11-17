const axios = require('axios');

const NEW_MESSAGE_WEBHOOK_URL =
  process.env.N8N_NEW_MESSAGE_WEBHOOK_URL ||
  process.env.N8N_MESSAGE_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_NEW_MESSAGE_URL ||
  process.env.N8N_WEBHOOK_URL ||
  null;

const PHOTO_ANALYSIS_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_PHOTO_ANALYSIS ||
  null;

const WEBHOOK_SECRET =
  process.env.N8N_WEBHOOK_SECRET ||
  process.env.WEBHOOK_SECRET ||
  'nutribuddy-secret-2024';

async function triggerNewMessageWorkflow(payload) {
  if (!NEW_MESSAGE_WEBHOOK_URL) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        'ℹ️  N8N_NEW_MESSAGE_WEBHOOK_URL não configurado - pulando automação.'
      );
    }
    return { skipped: true };
  }

  try {
    await axios.post(NEW_MESSAGE_WEBHOOK_URL, payload, {
      headers: {
        'x-webhook-secret': WEBHOOK_SECRET,
        'content-type': 'application/json',
      },
      timeout: 7000,
    });

    return { success: true };
  } catch (error) {
    console.error(
      '❌ Falha ao acionar fluxo N8N (nova mensagem):',
      error.response?.data || error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Aciona workflow n8n para análise de fotos de refeições com IA
 * @param {Object} payload - Dados da mensagem com foto
 * @returns {Promise<Object>} Resultado do trigger
 */
async function triggerPhotoAnalysisWorkflow(payload) {
  if (!PHOTO_ANALYSIS_WEBHOOK_URL) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        'ℹ️  N8N_WEBHOOK_PHOTO_ANALYSIS não configurado - análise de foto desabilitada.'
      );
    }
    return { skipped: true };
  }

  try {
    console.log('📸 [N8N] Acionando workflow de análise de foto...');
    console.log('📋 [N8N] Payload:', {
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      attachmentCount: payload.attachments?.length || 0,
    });

    // Fire and forget - não esperamos resposta (processamento assíncrono)
    axios.post(PHOTO_ANALYSIS_WEBHOOK_URL, payload, {
      headers: {
        'content-type': 'application/json',
        'user-agent': 'NutriBuddy-Backend/1.0',
      },
      timeout: 3000,
      validateStatus: () => true, // Aceita qualquer status HTTP
    })
      .then((response) => {
        console.log('✅ [N8N] Workflow de análise de foto acionado');
        console.log('📊 [N8N] Status:', response.status);
      })
      .catch((err) => {
        console.error('⚠️ [N8N] Erro ao acionar análise de foto:', err.message);
      });

    return { success: true, async: true };
  } catch (error) {
    console.error(
      '❌ [N8N] Erro ao preparar análise de foto:',
      error.message
    );
    return { success: false, error: error.message };
  }
}

module.exports = {
  triggerNewMessageWorkflow,
  triggerPhotoAnalysisWorkflow,
};


