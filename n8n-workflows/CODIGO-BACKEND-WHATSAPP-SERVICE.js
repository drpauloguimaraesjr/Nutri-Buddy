// =============================================================
// NUTRIBUDDY - WHATSAPP SERVICE (Z-API)
// =============================================================
// Arquivo: whatsapp-service.js
// Copie este arquivo para a pasta do seu backend
// =============================================================

const axios = require('axios');

// Credenciais Z-API (vem das variáveis de ambiente)
const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_BASE_URL = process.env.ZAPI_BASE_URL || 'https://api.z-api.io';

// URL base completa
const ZAPI_URL = `${ZAPI_BASE_URL}/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;

// =============================================================
// 1. OBTER QR CODE (IMAGEM PNG)
// =============================================================
async function getQRCodeImage() {
  try {
    const response = await axios.get(`${ZAPI_URL}/qr-code/image`, {
      headers: { 
        'Client-Token': ZAPI_TOKEN 
      },
      responseType: 'arraybuffer',
      timeout: 10000
    });

    return {
      success: true,
      image: Buffer.from(response.data, 'binary'),
      contentType: 'image/png'
    };
  } catch (error) {
    console.error('❌ Erro ao obter QR Code (imagem):', error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500
    };
  }
}

// =============================================================
// 2. OBTER QR CODE (BASE64)
// =============================================================
async function getQRCodeBase64() {
  try {
    const response = await axios.get(`${ZAPI_URL}/qr-code/image`, {
      headers: { 
        'Client-Token': ZAPI_TOKEN 
      },
      responseType: 'arraybuffer',
      timeout: 10000
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    return {
      success: true,
      qrCode: `data:image/png;base64,${base64}`,
      expiresIn: 60 // segundos
    };
  } catch (error) {
    console.error('❌ Erro ao obter QR Code (base64):', error.message);
    
    // Se erro 401, precisa reiniciar instância
    const needsReconnect = error.response?.status === 401 || 
                           error.response?.status === 404;
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
      needsReconnect
    };
  }
}

// =============================================================
// 3. VERIFICAR STATUS DA CONEXÃO
// =============================================================
async function getConnectionStatus() {
  try {
    const response = await axios.get(`${ZAPI_URL}/status`, {
      headers: { 
        'Client-Token': ZAPI_TOKEN 
      },
      timeout: 10000
    });

    const data = response.data;

    // Z-API retorna diferentes formatos dependendo da versão
    const connected = data.connected || data.state === 'CONNECTED' || data.status === 'open';
    const phone = data.phone || data.phoneNumber || null;
    const state = data.state || data.status || 'unknown';

    return {
      success: true,
      connected,
      phone,
      state,
      instanceId: ZAPI_INSTANCE_ID,
      raw: data // retornar dados brutos para debug
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    
    return {
      success: false,
      connected: false,
      phone: null,
      error: error.message,
      statusCode: error.response?.status || 500
    };
  }
}

// =============================================================
// 4. ENVIAR MENSAGEM DE TEXTO
// =============================================================
async function sendTextMessage(to, message) {
  try {
    // Formatar número: remover + e espaços
    const formattedTo = to.replace(/\+/g, '').replace(/\s/g, '');
    
    const response = await axios.post(`${ZAPI_URL}/send-text`, {
      phone: formattedTo,
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_TOKEN
      },
      timeout: 15000
    });

    console.log('✅ Mensagem enviada via Z-API:', response.data);
    
    return {
      success: true,
      messageId: response.data.messageId || response.data.id,
      status: response.data.status,
      to: formattedTo
    };
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
      to
    };
  }
}

// =============================================================
// 5. ENVIAR IMAGEM
// =============================================================
async function sendImageMessage(to, imageUrl, caption = '') {
  try {
    const formattedTo = to.replace(/\+/g, '').replace(/\s/g, '');
    
    const response = await axios.post(`${ZAPI_URL}/send-image`, {
      phone: formattedTo,
      image: imageUrl,
      caption: caption
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_TOKEN
      },
      timeout: 20000
    });

    console.log('✅ Imagem enviada via Z-API:', response.data);
    
    return {
      success: true,
      messageId: response.data.messageId || response.data.id,
      status: response.data.status,
      to: formattedTo
    };
  } catch (error) {
    console.error('❌ Erro ao enviar imagem:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
      to
    };
  }
}

// =============================================================
// 6. DESCONECTAR WHATSAPP
// =============================================================
async function disconnectWhatsApp() {
  try {
    const response = await axios.delete(`${ZAPI_URL}/logout`, {
      headers: { 
        'Client-Token': ZAPI_TOKEN 
      },
      timeout: 10000
    });

    console.log('✅ WhatsApp desconectado');
    
    return {
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    };
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error.message);
    
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 500
    };
  }
}

// =============================================================
// 7. REINICIAR INSTÂNCIA
// =============================================================
async function restartInstance() {
  try {
    const response = await axios.post(`${ZAPI_URL}/restart`, {}, {
      headers: { 
        'Client-Token': ZAPI_TOKEN 
      },
      timeout: 15000
    });

    console.log('✅ Instância reiniciada');
    
    return {
      success: true,
      message: 'Instância reiniciada. QR Code disponível em ~10 segundos.',
      data: response.data
    };
  } catch (error) {
    console.error('❌ Erro ao reiniciar instância:', error.message);
    
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 500
    };
  }
}

// =============================================================
// 8. VERIFICAR SE NÚMERO EXISTE NO WHATSAPP
// =============================================================
async function checkPhoneExists(phone) {
  try {
    const formattedPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
    
    const response = await axios.post(`${ZAPI_URL}/phone-exists`, {
      phone: formattedPhone
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_TOKEN
      },
      timeout: 10000
    });

    const exists = response.data.exists || response.data.result;
    
    return {
      success: true,
      exists,
      phone: formattedPhone
    };
  } catch (error) {
    console.error('❌ Erro ao verificar número:', error.message);
    
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 500
    };
  }
}

// =============================================================
// 9. HEALTH CHECK (verificar se credenciais estão OK)
// =============================================================
async function healthCheck() {
  try {
    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
      return {
        success: false,
        error: 'Credenciais Z-API não configuradas',
        configured: false
      };
    }

    const statusResult = await getConnectionStatus();
    
    return {
      success: true,
      configured: true,
      connected: statusResult.connected,
      instanceId: ZAPI_INSTANCE_ID,
      baseUrl: ZAPI_BASE_URL
    };
  } catch (error) {
    return {
      success: false,
      configured: true,
      error: error.message
    };
  }
}

// =============================================================
// EXPORTS
// =============================================================
module.exports = {
  // QR Code
  getQRCodeImage,
  getQRCodeBase64,
  
  // Status
  getConnectionStatus,
  healthCheck,
  
  // Mensagens
  sendTextMessage,
  sendImageMessage,
  
  // Gerenciamento
  disconnectWhatsApp,
  restartInstance,
  checkPhoneExists,
  
  // Constantes (para testes)
  ZAPI_URL
};

// =============================================================
// FIM DO ARQUIVO
// =============================================================

