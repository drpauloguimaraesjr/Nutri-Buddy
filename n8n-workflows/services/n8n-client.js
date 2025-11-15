const axios = require('axios');

const NEW_MESSAGE_WEBHOOK_URL =
  process.env.N8N_NEW_MESSAGE_WEBHOOK_URL ||
  process.env.N8N_MESSAGE_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_NEW_MESSAGE_URL ||
  process.env.N8N_WEBHOOK_URL ||
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

module.exports = {
  triggerNewMessageWorkflow,
};


