// ============================================================================
// CÓDIGO PARA ADICIONAR NO BACKEND
// Arquivo: routes/messages.js
// ============================================================================

// 📍 ADICIONAR NO INÍCIO DO ARQUIVO (com os outros imports)
const axios = require('axios');

// 📍 ADICIONAR DENTRO DA FUNÇÃO QUE CRIA MENSAGENS
// Procure por: router.post('/conversations/:conversationId/messages', ...)
// Adicione DEPOIS de salvar a mensagem no Firestore

// ============================================================================
// 🔔 TRIGGER N8N WORKFLOW - ANÁLISE DE FOTOS
// ============================================================================

// Verificar se a mensagem tem imagens
if (messageData.attachments && messageData.attachments.length > 0) {
  const hasImage = messageData.attachments.some(att => 
    att.type === 'image' || 
    att.contentType?.startsWith('image/') ||
    att.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );
  
  if (hasImage) {
    console.log('📸 [N8N] Imagem detectada na mensagem, acionando workflow de análise...');
    
    try {
      // URL do webhook n8n (busca do .env ou usa default)
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_PHOTO_ANALYSIS || 
        'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo';
      
      // Preparar payload para o n8n
      const n8nPayload = {
        // Identificação
        conversationId: messageData.conversationId,
        messageId: messageRef.id,
        
        // Remetente
        senderId: messageData.senderId,
        senderRole: messageData.senderRole,
        
        // Contexto
        patientId: conversation.patientId,
        prescriberId: conversation.prescriberId,
        
        // Conteúdo
        content: messageData.content || 'Imagem enviada',
        type: messageData.type,
        timestamp: messageData.createdAt.toISOString(),
        
        // Anexos (fotos)
        attachments: messageData.attachments.map(att => ({
          url: att.url,
          type: att.type || 'image',
          contentType: att.contentType || 'image/jpeg',
          name: att.name || 'photo.jpg',
          size: att.size || 0
        }))
      };
      
      console.log('📤 [N8N] Enviando para webhook:', n8nWebhookUrl);
      console.log('📋 [N8N] Payload:', {
        conversationId: n8nPayload.conversationId,
        messageId: n8nPayload.messageId,
        attachmentCount: n8nPayload.attachments.length
      });
      
      // Chamar webhook n8n (assíncrono - fire and forget)
      // Não esperamos a resposta para não travar a API
      axios.post(n8nWebhookUrl, n8nPayload, {
        timeout: 3000, // 3 segundos de timeout
        validateStatus: () => true, // Aceita qualquer status HTTP
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NutriBuddy-Backend'
        }
      }).then(response => {
        console.log('✅ [N8N] Webhook acionado com sucesso');
        console.log('📊 [N8N] Status:', response.status);
      }).catch(err => {
        console.error('⚠️ [N8N] Erro ao acionar webhook:', err.message);
        console.error('🔍 [N8N] URL tentada:', n8nWebhookUrl);
        // Não falha a requisição principal, apenas loga o erro
      });
      
      console.log('🎯 [N8N] Trigger iniciado (processamento assíncrono)');
      
    } catch (error) {
      console.error('❌ [N8N] Erro ao preparar trigger:', error.message);
      // Não falha a requisição principal
    }
  } else {
    console.log('📝 [N8N] Mensagem sem imagem, ignorando análise');
  }
}

// ============================================================================
// ALTERNATIVA: TRIGGER APENAS PARA PACIENTES
// ============================================================================
// Use este código se quiser acionar APENAS quando PACIENTE envia foto

if (messageData.senderRole === 'patient' && 
    messageData.attachments && 
    messageData.attachments.length > 0) {
  
  const hasImage = messageData.attachments.some(att => 
    att.type === 'image' || att.contentType?.startsWith('image/')
  );
  
  if (hasImage) {
    // ... mesmo código acima ...
  }
}

// ============================================================================
// ALTERNATIVA: TRIGGER COM RETRY
// ============================================================================
// Use este código se quiser tentar novamente em caso de falha

const triggerN8nWorkflow = async (payload, retries = 2) => {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_PHOTO_ANALYSIS;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.post(n8nWebhookUrl, payload, {
        timeout: 3000,
        validateStatus: (status) => status < 500 // Retry apenas em erro 500+
      });
      
      if (response.status < 400) {
        console.log(`✅ [N8N] Webhook acionado (tentativa ${i + 1})`);
        return;
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error) {
      if (i === retries) {
        console.error(`❌ [N8N] Falha após ${retries + 1} tentativas:`, error.message);
      } else {
        console.warn(`⚠️ [N8N] Tentativa ${i + 1} falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 500ms
      }
    }
  }
};

// Uso:
if (hasImage) {
  triggerN8nWorkflow(n8nPayload).catch(() => {
    // Ignora erro - não deve afetar a criação da mensagem
  });
}

// ============================================================================
// ADICIONAR NO .env (Railway)
// ============================================================================

/*
# N8N Webhook URLs
N8N_WEBHOOK_PHOTO_ANALYSIS=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo
*/

// ============================================================================
// EXEMPLO DE LOCALIZAÇÃO NO CÓDIGO
// ============================================================================

/*
router.post('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { content, type, attachments } = req.body;
    
    // ... validações ...
    
    // Criar mensagem
    const messageData = {
      conversationId,
      senderId: req.user.uid,
      senderRole: req.user.role,
      content,
      type,
      attachments: attachments || [],
      createdAt: new Date(),
    };
    
    // Salvar no Firestore
    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);
    
    // ⚡ ADICIONAR AQUI O CÓDIGO DO TRIGGER N8N ⚡
    // (código acima)
    
    // Retornar resposta
    res.json({
      success: true,
      messageId: messageRef.id,
      ...
    });
    
  } catch (error) {
    ...
  }
});
*/

// ============================================================================
// EXEMPLO COMPLETO INTEGRADO
// ============================================================================

router.post('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', attachments = [] } = req.body;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    
    // Buscar conversa
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada'
      });
    }
    
    const conversation = conversationDoc.data();
    
    // Criar mensagem
    const messageData = {
      conversationId,
      senderId: userId,
      senderRole: userRole,
      content: content?.trim() || '',
      type,
      status: 'sent',
      isAiGenerated: false,
      createdAt: new Date(),
      readAt: null,
      attachments: attachments.map(att => ({
        url: att.url,
        type: att.type || 'file',
        contentType: att.contentType,
        name: att.name,
        size: att.size
      }))
    };
    
    // Salvar no Firestore
    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);
    
    console.log('✅ Mensagem criada:', messageRef.id);
    
    // ====================================================================
    // 🔔 TRIGGER N8N - ANÁLISE DE FOTOS
    // ====================================================================
    
    if (attachments.length > 0) {
      const hasImage = attachments.some(att => 
        att.type === 'image' || att.contentType?.startsWith('image/')
      );
      
      if (hasImage && userRole === 'patient') {
        console.log('📸 [N8N] Foto detectada, acionando análise...');
        
        const n8nUrl = process.env.N8N_WEBHOOK_PHOTO_ANALYSIS || 
          'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo';
        
        const payload = {
          conversationId,
          messageId: messageRef.id,
          senderId: userId,
          senderRole: userRole,
          patientId: conversation.patientId,
          prescriberId: conversation.prescriberId,
          content: messageData.content,
          type: messageData.type,
          timestamp: messageData.createdAt.toISOString(),
          attachments: messageData.attachments
        };
        
        // Fire and forget
        axios.post(n8nUrl, payload, { timeout: 3000 })
          .then(() => console.log('✅ [N8N] Webhook acionado'))
          .catch(err => console.error('⚠️ [N8N] Erro:', err.message));
      }
    }
    
    // ====================================================================
    
    // Atualizar conversa
    await conversationRef.update({
      lastMessage: messageData.content.substring(0, 100),
      lastMessageAt: new Date(),
      lastMessageBy: userRole,
      updatedAt: new Date()
    });
    
    // Retornar resposta
    res.json({
      success: true,
      messageId: messageRef.id,
      message: {
        id: messageRef.id,
        ...messageData,
        createdAt: messageData.createdAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao criar mensagem',
      message: error.message
    });
  }
});

// ============================================================================
// FIM DO CÓDIGO
// ============================================================================

