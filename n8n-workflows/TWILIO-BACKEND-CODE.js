// ================================================================
// NUTRIBUDDY - INTEGRAÇÃO TWILIO WHATSAPP
// ================================================================
// Adicione este código ao seu backend Node.js no Railway
// ================================================================

// ============================================================
// 1. INSTALAR DEPENDÊNCIA
// ============================================================
// npm install twilio

const twilio = require('twilio');

// ============================================================
// 2. CONFIGURAR TWILIO CLIENT
// ============================================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886 (sandbox) ou whatsapp:+5511999999999 (produção)

// Validar configuração
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('❌ ERRO: Variáveis Twilio não configuradas!');
  console.error('Configure: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
} else {
  console.log('📱 Twilio WhatsApp: Configured ✅');
  console.log(`   From: ${TWILIO_WHATSAPP_NUMBER}`);
}

// Criar client Twilio
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ============================================================
// 3. FUNÇÃO: ENVIAR MENSAGEM WHATSAPP (TEXTO)
// ============================================================

/**
 * Envia mensagem WhatsApp via Twilio
 * @param {string} to - Número destino (formato: +5511999999999)
 * @param {string} message - Texto da mensagem
 * @returns {Promise<Object>} Resposta Twilio
 */
async function sendWhatsAppMessage(to, message) {
  try {
    // Twilio espera número com + e código país
    // Formato: +5511999999999
    let formattedTo = to.trim();
    
    // Adicionar + se não tiver
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }
    
    // Adicionar prefixo whatsapp: se não tiver
    if (!formattedTo.startsWith('whatsapp:')) {
      formattedTo = 'whatsapp:' + formattedTo;
    }
    
    // Enviar mensagem via Twilio
    const messageResponse = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      body: message
    });

    console.log('✅ Mensagem enviada via Twilio:', {
      sid: messageResponse.sid,
      to: formattedTo,
      status: messageResponse.status,
      dateCreated: messageResponse.dateCreated
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
    console.error('❌ Erro ao enviar mensagem Twilio:', error);
    
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
// 4. FUNÇÃO: ENVIAR MENSAGEM COM IMAGEM
// ============================================================

/**
 * Envia imagem WhatsApp via Twilio
 * @param {string} to - Número destino (formato: +5511999999999)
 * @param {string} imageUrl - URL pública da imagem
 * @param {string} caption - Legenda da imagem (opcional)
 * @returns {Promise<Object>} Resposta Twilio
 */
async function sendWhatsAppImage(to, imageUrl, caption = '') {
  try {
    let formattedTo = to.trim();
    
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }
    
    if (!formattedTo.startsWith('whatsapp:')) {
      formattedTo = 'whatsapp:' + formattedTo;
    }
    
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

    console.log('✅ Imagem enviada via Twilio:', {
      sid: messageResponse.sid,
      to: formattedTo,
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
    console.error('❌ Erro ao enviar imagem Twilio:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      to
    };
  }
}

// ============================================================
// 5. FUNÇÃO: ENVIAR MENSAGEM COM TEMPLATE
// ============================================================

/**
 * Envia mensagem usando template aprovado pela Meta
 * @param {string} to - Número destino
 * @param {string} contentSid - SID do template (ex: HXa1b2c3...)
 * @param {Object} contentVariables - Variáveis do template
 * @returns {Promise<Object>} Resposta Twilio
 */
async function sendWhatsAppTemplate(to, contentSid, contentVariables = {}) {
  try {
    let formattedTo = to.trim();
    
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }
    
    if (!formattedTo.startsWith('whatsapp:')) {
      formattedTo = 'whatsapp:' + formattedTo;
    }
    
    const messageResponse = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables)
    });

    console.log('✅ Template enviado via Twilio:', {
      sid: messageResponse.sid,
      to: formattedTo,
      status: messageResponse.status,
      contentSid
    });
    
    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      to: formattedTo,
      contentSid
    };
  } catch (error) {
    console.error('❌ Erro ao enviar template Twilio:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      to
    };
  }
}

// ============================================================
// 6. ENDPOINT: ENVIAR MENSAGEM
// ============================================================
// Express exemplo - adicione ao seu server.js

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, imageUrl, caption } = req.body;

    // Validação
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: to'
      });
    }
    
    if (!message && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Informe message (texto) ou imageUrl'
      });
    }

    let result;
    
    // Enviar imagem ou texto
    if (imageUrl) {
      result = await sendWhatsAppImage(to, imageUrl, message || caption);
    } else {
      result = await sendWhatsAppMessage(to, message);
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Mensagem enviada com sucesso',
        to: result.to
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        code: result.code
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
// 7. WEBHOOK: RECEBER MENSAGENS DO TWILIO
// ============================================================
// Twilio chama este endpoint quando paciente envia mensagem

// IMPORTANTE: Twilio envia dados como application/x-www-form-urlencoded
// Certifique-se de ter o middleware correto:
// app.use(express.urlencoded({ extended: true }));

app.post('/api/webhooks/twilio-whatsapp', async (req, res) => {
  try {
    console.log('📩 Webhook Twilio recebido:', JSON.stringify(req.body, null, 2));

    // Estrutura do webhook Twilio
    const {
      MessageSid,      // ID único da mensagem
      From,            // Número que enviou (whatsapp:+5511999999999)
      To,              // Seu número Twilio (whatsapp:+14155238886)
      Body,            // Texto da mensagem
      NumMedia,        // Número de mídias (0 ou mais)
      MediaUrl0,       // URL da primeira mídia (se houver)
      MediaContentType0, // Tipo da mídia (image/jpeg, etc)
      ProfileName,     // Nome do perfil WhatsApp
      SmsStatus        // Status da mensagem
    } = req.body;

    // Extrair número do paciente (remover prefixo whatsapp:)
    const phoneNumber = From.replace('whatsapp:', '').replace('+', '');
    const hasMedia = parseInt(NumMedia || '0') > 0;
    const messageContent = Body || '';
    const mediaUrl = hasMedia ? MediaUrl0 : null;
    const mediaType = hasMedia ? MediaContentType0 : null;

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
        From, // Twilio aceita com prefixo whatsapp:
        'Olá! Não encontrei seu cadastro. Entre em contato com seu nutricionista.'
      );
      
      // Twilio espera resposta TwiML (XML) ou vazio
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    // 2. Salvar mensagem no Firestore
    const conversationId = `${patient.prescriberId}_${patient.id}`;
    
    await saveMessageToFirestore({
      conversationId,
      patientId: patient.id,
      patientName: patient.name || ProfileName,
      content: messageContent,
      hasImage: hasMedia,
      imageUrl: mediaUrl,
      mediaType: mediaType,
      timestamp: new Date(),
      senderType: 'patient',
      isFromPatient: true,
      analyzed: false,
      sent: true,
      messageId: MessageSid
    });

    // 3. Atualizar conversa
    await updateConversation(conversationId, {
      lastMessage: messageContent || '📷 Imagem',
      lastMessageAt: new Date(),
      hasUnreadMessages: true
    });

    console.log('✅ Mensagem processada com sucesso');

    // Twilio espera resposta TwiML (XML)
    // Você pode responder automaticamente aqui se quiser:
    
    // Opção A: Sem resposta automática (apenas processar)
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
    // Opção B: Com resposta automática
    // res.status(200).send(`
    //   <?xml version="1.0" encoding="UTF-8"?>
    //   <Response>
    //     <Message>Olá ${ProfileName}! Recebi sua mensagem. Em breve vou responder!</Message>
    //   </Response>
    // `);

  } catch (error) {
    console.error('❌ Erro no webhook Twilio:', error);
    // Mesmo com erro, responder 200 para Twilio não reenviar
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

// ============================================================
// 8. WEBHOOK: STATUS DE MENSAGEM (OPCIONAL)
// ============================================================
// Recebe updates de status: sent, delivered, read, failed

app.post('/api/webhooks/twilio-status', async (req, res) => {
  try {
    console.log('📊 Status update Twilio:', JSON.stringify(req.body, null, 2));

    const {
      MessageSid,
      MessageStatus,  // queued, sending, sent, delivered, read, failed, undelivered
      To,
      ErrorCode,
      ErrorMessage
    } = req.body;

    // Atualizar status no Firestore (opcional)
    if (MessageSid) {
      await updateMessageStatus(MessageSid, {
        status: MessageStatus,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage,
        updatedAt: new Date()
      });
      
      console.log(`✅ Status atualizado: ${MessageSid} → ${MessageStatus}`);
    }

    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('❌ Erro no webhook status:', error);
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

// ============================================================
// 9. FUNÇÃO AUXILIAR: BUSCAR MENSAGENS PENDENTES
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
// 10. FUNÇÃO AUXILIAR: ENVIAR MENSAGEM PENDENTE
// ============================================================
// Chamada pelo N8N workflow

app.post('/api/whatsapp/send-pending', async (req, res) => {
  try {
    const { messageId, patientId, content, imageUrl, caption } = req.body;

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
      result = await sendWhatsAppImage(patient.phone, imageUrl, caption || content);
    } else {
      result = await sendWhatsAppMessage(patient.phone, content);
    }

    if (result.success) {
      // Marcar como enviada no Firestore
      await markMessageAsSent(messageId, {
        sent: true,
        sentAt: new Date(),
        twilioMessageId: result.messageId,
        twilioStatus: result.status
      });

      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        status: result.status
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        code: result.code
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
// 11. VERIFICAR NÚMERO WHATSAPP
// ============================================================

/**
 * Verifica se número existe no WhatsApp
 * NOTA: Twilio não tem API pública para isso
 * Alternativa: tentar enviar e verificar erro
 */
async function checkPhoneExists(phone) {
  try {
    // Twilio não oferece endpoint oficial para verificar
    // Você pode tentar enviar mensagem de teste e ver se falha
    
    // Por enquanto, apenas validar formato
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
      note: 'Twilio não oferece API de verificação. Apenas validação de formato.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// 12. BUSCAR HISTÓRICO DE MENSAGENS
// ============================================================

/**
 * Busca histórico de mensagens enviadas via Twilio
 * @param {string} phoneNumber - Número do paciente (opcional)
 * @param {number} limit - Limite de mensagens (default: 20)
 * @returns {Promise<Object>} Lista de mensagens
 */
async function getMessageHistory(phoneNumber = null, limit = 20) {
  try {
    const filters = { limit };
    
    if (phoneNumber) {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      if (!formattedPhone.startsWith('whatsapp:')) {
        formattedPhone = 'whatsapp:' + formattedPhone;
      }
      filters.to = formattedPhone;
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
    console.error('Erro ao buscar histórico:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// 13. HEALTH CHECK / STATUS
// ============================================================

app.get('/api/whatsapp/status', async (req, res) => {
  try {
    // Verificar se credenciais estão configuradas
    const isConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER);
    
    let accountInfo = null;
    let twilioStatus = 'unknown';
    
    if (isConfigured) {
      try {
        // Buscar informações da conta Twilio
        const account = await twilioClient.api.accounts(TWILIO_ACCOUNT_SID).fetch();
        accountInfo = {
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type
        };
        twilioStatus = account.status; // active, suspended, closed
      } catch (error) {
        console.error('Erro ao buscar info conta Twilio:', error.message);
        twilioStatus = 'error';
      }
    }
    
    res.status(200).json({
      service: 'NutriBuddy WhatsApp Twilio',
      status: isConfigured ? 'configured' : 'not-configured',
      twilioConfigured: isConfigured,
      twilioStatus,
      accountInfo,
      whatsappNumber: TWILIO_WHATSAPP_NUMBER,
      isSandbox: TWILIO_WHATSAPP_NUMBER?.includes('+1415') || false
    });
  } catch (error) {
    res.status(500).json({
      service: 'NutriBuddy WhatsApp Twilio',
      status: 'error',
      error: error.message
    });
  }
});

// ============================================================
// 14. ENDPOINT: ENVIAR COM TEMPLATE
// ============================================================

app.post('/api/whatsapp/send-template', async (req, res) => {
  try {
    const { to, contentSid, variables } = req.body;

    if (!to || !contentSid) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, contentSid'
      });
    }

    const result = await sendWhatsAppTemplate(to, contentSid, variables || {});

    if (result.success) {
      return res.status(200).json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: 'Template enviado com sucesso'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Erro no endpoint /api/whatsapp/send-template:', error);
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
  // Ajuste o campo 'phone' conforme seu schema
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

async function updateMessageStatus(messageSid, statusData) {
  // Atualizar status da mensagem no Firestore
  const snapshot = await db.collection('whatsappMessages')
    .where('messageId', '==', messageSid)
    .limit(1)
    .get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update(statusData);
  }
}

// ============================================================
// EXPORTS (se estiver usando módulos)
// ============================================================

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppTemplate,
  checkPhoneExists,
  getMessageHistory,
  findPatientByPhone,
  saveMessageToFirestore,
  updateConversation,
  twilioClient
};

// ============================================================
// FIM DO CÓDIGO
// ============================================================
// 
// PRÓXIMOS PASSOS:
// 1. npm install twilio
// 2. Copiar este código para seu backend
// 3. Adicionar variáveis no Railway:
//    - TWILIO_ACCOUNT_SID
//    - TWILIO_AUTH_TOKEN
//    - TWILIO_WHATSAPP_NUMBER
// 4. Fazer deploy
// 5. Configurar webhook no Twilio Console
// 6. Testar endpoints
// 
// WEBHOOKS NO TWILIO:
// 
// 1. Mensagens recebidas:
//    URL: https://seu-backend.railway.app/api/webhooks/twilio-whatsapp
//    Method: POST
// 
// 2. Status de mensagens (opcional):
//    URL: https://seu-backend.railway.app/api/webhooks/twilio-status
//    Method: POST
// 
// ============================================================

