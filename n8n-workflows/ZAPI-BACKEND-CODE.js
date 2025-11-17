// ================================================================
// NUTRIBUDDY - INTEGRAÇÃO Z-API WHATSAPP
// ================================================================
// Adicione este código ao seu backend Node.js no Railway
// ================================================================

// ============================================================
// 1. INSTALAR DEPENDÊNCIA (OPCIONAL - pode usar fetch)
// ============================================================
// Z-API usa HTTP REST simples, não precisa SDK específico
// Mas pode instalar axios para facilitar:
// npm install axios

const axios = require('axios'); // OU use fetch nativo

// ============================================================
// 2. CONFIGURAR Z-API CLIENT
// ============================================================

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_BASE_URL = process.env.ZAPI_BASE_URL || 'https://api.z-api.io';

// URL base da API
const ZAPI_URL = `${ZAPI_BASE_URL}/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;

// ============================================================
// 3. FUNÇÃO: ENVIAR MENSAGEM WHATSAPP
// ============================================================

/**
 * Envia mensagem WhatsApp via Z-API
 * @param {string} to - Número destino (formato: 5511999999999)
 * @param {string} message - Texto da mensagem
 * @returns {Promise<Object>} Resposta Z-API
 */
async function sendWhatsAppMessage(to, message) {
  try {
    // Z-API espera número sem +, apenas dígitos
    // Exemplo: 5511999999999
    const formattedTo = to.replace(/\+/g, '').replace(/\s/g, '');
    
    const response = await axios.post(`${ZAPI_URL}/send-text`, {
      phone: formattedTo,
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_TOKEN
      }
    });

    console.log('✅ Mensagem enviada via Z-API:', response.data);
    
    return {
      success: true,
      messageId: response.data.messageId || response.data.id,
      status: response.data.status,
      to: formattedTo
    };
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem Z-API:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status
    };
  }
}

// ============================================================
// 4. ENDPOINT: ENVIAR MENSAGEM
// ============================================================
// Adicione esta rota no seu Express/Fastify

// Express exemplo:
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    // Validação
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, message'
      });
    }

    // Enviar via Z-API
    const result = await sendWhatsAppMessage(to, message);

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: 'Mensagem enviada com sucesso'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro no endpoint /api/whatsapp/send:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 5. WEBHOOK: RECEBER MENSAGENS DO Z-API
// ============================================================
// Z-API chama este endpoint quando paciente envia mensagem

app.post('/api/webhooks/zapi-whatsapp', async (req, res) => {
  try {
    console.log('📩 Webhook Z-API recebido:', JSON.stringify(req.body, null, 2));

    // Estrutura do webhook Z-API
    const {
      phone,           // Número que enviou (ex: 5511999999999)
      fromMe,          // true se você enviou, false se recebeu
      text,            // Texto da mensagem (se for texto)
      image,           // Objeto com imagem (se houver)
      messageId,       // ID único da mensagem
      instanceId,      // ID da sua instância
      chatId,          // ID do chat
      type,            // 'ReceivedCallback' ou 'MessageStatus'
      senderName,      // Nome do contato
      senderPhoto      // Foto do contato
    } = req.body;

    // Ignorar mensagens enviadas por você
    if (fromMe) {
      console.log('⏩ Mensagem enviada por mim, ignorando');
      return res.status(200).json({ received: true });
    }

    // Ignorar webhooks de status (delivered, read, etc)
    if (type === 'MessageStatus') {
      console.log('⏩ Status de mensagem, ignorando');
      return res.status(200).json({ received: true });
    }

    // Extrair dados da mensagem
    const phoneNumber = phone.replace('@c.us', '').replace('@s.whatsapp.net', '');
    const messageContent = text?.message || image?.caption || 'Mensagem sem texto';
    const hasImage = !!image;
    const imageUrl = hasImage ? image.imageUrl : null;

    // ========================================================
    // LÓGICA DO NUTRIBUDDY:
    // 1. Buscar paciente por telefone no Firestore
    // 2. Salvar mensagem no Firestore
    // 3. Criar/atualizar conversa
    // ========================================================

    // 1. Buscar paciente (você já tem essa função)
    const patient = await findPatientByPhone(phoneNumber);
    
    if (!patient) {
      console.log('⚠️ Paciente não encontrado:', phoneNumber);
      
      // Responder ao paciente
      await sendWhatsAppMessage(
        phoneNumber,
        'Olá! Não encontrei seu cadastro. Entre em contato com seu nutricionista.'
      );
      
      return res.status(200).json({ received: true });
    }

    // 2. Salvar mensagem no Firestore
    const conversationId = `${patient.prescriberId}_${patient.id}`;
    
    await saveMessageToFirestore({
      conversationId,
      patientId: patient.id,
      patientName: patient.name || senderName,
      content: messageContent,
      hasImage,
      imageUrl,
      timestamp: new Date(),
      senderType: 'patient',
      isFromPatient: true,
      analyzed: false,
      sent: true,
      messageId: messageId
    });

    // 3. Atualizar conversa
    await updateConversation(conversationId, {
      lastMessage: messageContent,
      lastMessageAt: new Date(),
      hasUnreadMessages: true
    });

    console.log('✅ Mensagem processada com sucesso');

    // Z-API espera resposta 200 OK
    return res.status(200).json({ 
      received: true,
      patientId: patient.id 
    });

  } catch (error) {
    console.error('❌ Erro no webhook Z-API:', error);
    // Mesmo com erro, responder 200 para Z-API não reenviar
    return res.status(200).json({ received: true, error: error.message });
  }
});

// ============================================================
// 6. FUNÇÃO: ENVIAR IMAGEM WHATSAPP
// ============================================================

/**
 * Envia imagem WhatsApp via Z-API
 * @param {string} to - Número destino
 * @param {string} imageUrl - URL pública da imagem
 * @param {string} caption - Legenda da imagem (opcional)
 */
async function sendWhatsAppImage(to, imageUrl, caption = '') {
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
      }
    });

    console.log('✅ Imagem enviada via Z-API:', response.data);
    
    return {
      success: true,
      messageId: response.data.messageId || response.data.id
    };
  } catch (error) {
    console.error('❌ Erro ao enviar imagem Z-API:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// ============================================================
// 7. FUNÇÃO AUXILIAR: BUSCAR MENSAGENS PENDENTES
// ============================================================
// Para o workflow N8N de envio automático

app.get('/api/whatsapp/pending-messages', async (req, res) => {
  try {
    // Verificar autenticação
    const secret = req.headers['x-webhook-secret'];
    if (secret !== 'nutribuddy-secret-2024') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Buscar mensagens com sent: false no Firestore
    const pendingMessages = await getPendingMessagesFromFirestore();

    return res.status(200).json({
      success: true,
      count: pendingMessages.length,
      messages: pendingMessages
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens pendentes:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 8. FUNÇÃO AUXILIAR: ENVIAR MENSAGEM PENDENTE
// ============================================================
// Chamada pelo N8N workflow

app.post('/api/whatsapp/send-pending', async (req, res) => {
  try {
    const { messageId, patientId, content, imageUrl } = req.body;

    // Buscar telefone do paciente
    const patient = await getPatientById(patientId);
    
    if (!patient || !patient.phone) {
      return res.status(404).json({
        success: false,
        error: 'Paciente ou telefone não encontrado'
      });
    }

    // Enviar mensagem (texto ou imagem)
    let result;
    if (imageUrl) {
      result = await sendWhatsAppImage(patient.phone, imageUrl, content);
    } else {
      result = await sendWhatsAppMessage(patient.phone, content);
    }

    if (result.success) {
      // Marcar como enviada no Firestore
      await markMessageAsSent(messageId, {
        sent: true,
        sentAt: new Date(),
        zapiMessageId: result.messageId
      });

      return res.status(200).json({
        success: true,
        zapiMessageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem pendente:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 9. VERIFICAR STATUS DA INSTÂNCIA Z-API
// ============================================================

async function checkZApiStatus() {
  try {
    const response = await axios.get(`${ZAPI_URL}/status`, {
      headers: {
        'Client-Token': ZAPI_TOKEN
      }
    });

    return {
      connected: response.data.connected || false,
      status: response.data.status,
      phone: response.data.phone
    };
  } catch (error) {
    console.error('Erro ao verificar status Z-API:', error.message);
    return {
      connected: false,
      error: error.message
    };
  }
}

// ============================================================
// 10. HEALTH CHECK
// ============================================================

app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const zapiStatus = await checkZApiStatus();
    
    res.status(200).json({
      service: 'NutriBuddy WhatsApp Z-API',
      status: 'active',
      zapiConfigured: !!(ZAPI_INSTANCE_ID && ZAPI_TOKEN),
      zapiConnected: zapiStatus.connected,
      instanceId: ZAPI_INSTANCE_ID,
      phone: zapiStatus.phone
    });
  } catch (error) {
    res.status(500).json({
      service: 'NutriBuddy WhatsApp Z-API',
      status: 'error',
      error: error.message
    });
  }
});

// ============================================================
// 11. ENDPOINT: ENVIAR MENSAGEM COM BOTÕES (EXTRA)
// ============================================================

app.post('/api/whatsapp/send-buttons', async (req, res) => {
  try {
    const { to, message, buttons } = req.body;
    // buttons = [{ id: '1', text: 'Sim' }, { id: '2', text: 'Não' }]

    const formattedTo = to.replace(/\+/g, '').replace(/\s/g, '');
    
    const response = await axios.post(`${ZAPI_URL}/send-button-list`, {
      phone: formattedTo,
      message: message,
      buttonList: {
        buttons: buttons.map(btn => ({
          id: btn.id,
          label: btn.text
        }))
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_TOKEN
      }
    });

    return res.status(200).json({
      success: true,
      messageId: response.data.messageId
    });
  } catch (error) {
    console.error('Erro ao enviar botões:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// EXEMPLO DE FUNÇÕES FIRESTORE (você já deve ter algo assim)
// ============================================================

async function findPatientByPhone(phone) {
  // Sua lógica existente de buscar paciente no Firestore
  const snapshot = await db.collection('users')
    .where('phone', '==', phone)
    .where('role', '==', 'patient')
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function saveMessageToFirestore(messageData) {
  // Sua lógica de salvar mensagem
  await db.collection('whatsappMessages').add(messageData);
}

async function updateConversation(conversationId, data) {
  // Sua lógica de atualizar conversa
  await db.collection('whatsappConversations')
    .doc(conversationId)
    .set(data, { merge: true });
}

async function getPendingMessagesFromFirestore() {
  // Buscar mensagens não enviadas
  const snapshot = await db.collection('whatsappMessages')
    .where('sent', '==', false)
    .orderBy('timestamp', 'asc')
    .limit(50)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function getPatientById(patientId) {
  const doc = await db.collection('users').doc(patientId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function markMessageAsSent(messageId, data) {
  await db.collection('whatsappMessages')
    .doc(messageId)
    .update(data);
}

// ============================================================
// EXPORTS (se estiver usando módulos)
// ============================================================

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  checkZApiStatus,
  findPatientByPhone,
  saveMessageToFirestore,
  updateConversation
};

// ============================================================
// FIM DO CÓDIGO
// ============================================================
// 
// PRÓXIMOS PASSOS:
// 1. Copiar este código para seu backend
// 2. Instalar: npm install axios (opcional)
// 3. Adicionar variáveis no Railway (ver ZAPI-DEPLOY-RAILWAY.md)
// 4. Fazer deploy
// 5. Testar endpoints
// 6. Configurar webhook no Z-API Dashboard
// 
// ============================================================



