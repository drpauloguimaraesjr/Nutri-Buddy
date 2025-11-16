// ================================================================
// NUTRIBUDDY - TWILIO WHATSAPP SERVICE
// ================================================================
// Service para integração com Twilio WhatsApp API
// ================================================================

const twilio = require('twilio');

// ============================================================
// CONFIGURAÇÃO TWILIO
// ============================================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+15558337724

// Validar configuração
const isTwilioConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER);

if (!isTwilioConfigured) {
  console.warn('⚠️  Twilio WhatsApp: Não configurado (variáveis ausentes)');
  console.warn('   Configure: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
} else {
  console.log('📱 Twilio WhatsApp: Configurado ✅');
  console.log(`   From: ${TWILIO_WHATSAPP_NUMBER}`);
}

// Criar client Twilio (apenas se configurado)
const twilioClient = isTwilioConfigured 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Formatar número para formato Twilio
 * @param {string} phone - Número (ex: 5511999999999 ou +5511999999999)
 * @returns {string} Número formatado (ex: whatsapp:+5511999999999)
 */
function formatPhoneForTwilio(phone) {
  let formatted = phone.trim().replace(/\s/g, '');
  
  // Adicionar + se não tiver
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  // Adicionar prefixo whatsapp: se não tiver
  if (!formatted.startsWith('whatsapp:')) {
    formatted = 'whatsapp:' + formatted;
  }
  
  return formatted;
}

// ============================================================
// FUNÇÃO: ENVIAR MENSAGEM WHATSAPP (TEXTO)
// ============================================================

/**
 * Envia mensagem WhatsApp via Twilio
 * @param {string} to - Número destino (formato: +5511999999999)
 * @param {string} message - Texto da mensagem
 * @returns {Promise<Object>} Resposta
 */
async function sendTextMessage(to, message) {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return {
        success: false,
        error: 'Twilio não configurado',
        details: 'Configure as variáveis TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER'
      };
    }

    const formattedTo = formatPhoneForTwilio(to);
    
    console.log(`📤 [Twilio] Enviando mensagem para ${formattedTo}`);
    
    const messageResponse = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      body: message
    });

    console.log('✅ [Twilio] Mensagem enviada:', {
      sid: messageResponse.sid,
      status: messageResponse.status
    });
    
    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      to: formattedTo,
      price: messageResponse.price,
      priceUnit: messageResponse.priceUnit
    };
  } catch (error) {
    console.error('❌ [Twilio] Erro ao enviar mensagem:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
      to
    };
  }
}

// ============================================================
// FUNÇÃO: ENVIAR MENSAGEM COM IMAGEM
// ============================================================

/**
 * Envia imagem WhatsApp via Twilio
 * @param {string} to - Número destino
 * @param {string} imageUrl - URL pública da imagem
 * @param {string} caption - Legenda da imagem (opcional)
 * @returns {Promise<Object>} Resposta
 */
async function sendImageMessage(to, imageUrl, caption = '') {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return {
        success: false,
        error: 'Twilio não configurado'
      };
    }

    const formattedTo = formatPhoneForTwilio(to);
    
    console.log(`📤 [Twilio] Enviando imagem para ${formattedTo}`);
    
    const messageData = {
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      mediaUrl: [imageUrl]
    };
    
    // Adicionar caption se fornecido
    if (caption) {
      messageData.body = caption;
    }
    
    const messageResponse = await twilioClient.messages.create(messageData);

    console.log('✅ [Twilio] Imagem enviada:', {
      sid: messageResponse.sid,
      status: messageResponse.status
    });
    
    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      to: formattedTo,
      mediaUrl: imageUrl
    };
  } catch (error) {
    console.error('❌ [Twilio] Erro ao enviar imagem:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      to
    };
  }
}

// ============================================================
// FUNÇÃO: ENVIAR MENSAGEM COM TEMPLATE
// ============================================================

/**
 * Envia mensagem usando template aprovado pela Meta
 * @param {string} to - Número destino
 * @param {string} contentSid - SID do template (ex: HXa1b2c3...)
 * @param {Object} contentVariables - Variáveis do template
 * @returns {Promise<Object>} Resposta
 */
async function sendTemplateMessage(to, contentSid, contentVariables = {}) {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return {
        success: false,
        error: 'Twilio não configurado'
      };
    }

    const formattedTo = formatPhoneForTwilio(to);
    
    console.log(`📤 [Twilio] Enviando template para ${formattedTo}`);
    
    const messageResponse = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables)
    });

    console.log('✅ [Twilio] Template enviado:', {
      sid: messageResponse.sid,
      status: messageResponse.status
    });
    
    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      to: formattedTo,
      contentSid
    };
  } catch (error) {
    console.error('❌ [Twilio] Erro ao enviar template:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      to
    };
  }
}

// ============================================================
// FUNÇÃO: BUSCAR HISTÓRICO DE MENSAGENS
// ============================================================

/**
 * Busca histórico de mensagens enviadas via Twilio
 * @param {string} phoneNumber - Número do paciente (opcional)
 * @param {number} limit - Limite de mensagens (default: 20)
 * @returns {Promise<Object>} Lista de mensagens
 */
async function getMessageHistory(phoneNumber = null, limit = 20) {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return {
        success: false,
        error: 'Twilio não configurado',
        messages: []
      };
    }

    const filters = { limit };
    
    if (phoneNumber) {
      filters.to = formatPhoneForTwilio(phoneNumber);
    }
    
    const messages = await twilioClient.messages.list(filters);
    
    return {
      success: true,
      count: messages.length,
      messages: messages.map(msg => ({
        sid: msg.sid,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        status: msg.status,
        direction: msg.direction,
        price: msg.price,
        priceUnit: msg.priceUnit,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent,
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage
      }))
    };
  } catch (error) {
    console.error('❌ [Twilio] Erro ao buscar histórico:', error.message);
    return {
      success: false,
      error: error.message,
      messages: []
    };
  }
}

// ============================================================
// FUNÇÃO: VERIFICAR STATUS DA CONTA TWILIO
// ============================================================

/**
 * Verifica status da conta Twilio
 * @returns {Promise<Object>} Status da conta
 */
async function getAccountStatus() {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return {
        success: false,
        configured: false,
        status: 'not-configured',
        message: 'Configure as variáveis de ambiente Twilio'
      };
    }

    // Buscar informações da conta Twilio
    const account = await twilioClient.api.accounts(TWILIO_ACCOUNT_SID).fetch();
    
    return {
      success: true,
      configured: true,
      status: account.status, // active, suspended, closed
      accountInfo: {
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type
      },
      whatsappNumber: TWILIO_WHATSAPP_NUMBER,
      isSandbox: TWILIO_WHATSAPP_NUMBER?.includes('+1415') || false
    };
  } catch (error) {
    console.error('❌ [Twilio] Erro ao buscar status da conta:', error.message);
    
    return {
      success: false,
      configured: true,
      status: 'error',
      error: error.message,
      whatsappNumber: TWILIO_WHATSAPP_NUMBER
    };
  }
}

// ============================================================
// FUNÇÃO: VALIDAR FORMATO DE NÚMERO
// ============================================================

/**
 * Valida formato de número de telefone
 * @param {string} phone - Número de telefone
 * @returns {Object} Resultado da validação
 */
function validatePhoneNumber(phone) {
  try {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    // Validação básica de formato internacional
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    const isValid = phoneRegex.test(formattedPhone);
    
    return {
      success: true,
      valid: isValid,
      phone: formattedPhone,
      formatted: formatPhoneForTwilio(formattedPhone),
      note: 'Twilio não oferece API de verificação. Apenas validação de formato.'
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error.message
    };
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendTextMessage,
  sendImageMessage,
  sendTemplateMessage,
  getMessageHistory,
  getAccountStatus,
  validatePhoneNumber,
  formatPhoneForTwilio,
  isTwilioConfigured,
  twilioClient
};

