const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const { uploadChatMedia, generateSignedUrl } = require('../services/storage');
const { triggerNewMessageWorkflow } = require('../services/n8n-client');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

const sanitizeAttachmentPayload = (attachments = []) => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter(Boolean)
    .map((attachment) => ({
      storagePath: attachment.storagePath,
      contentType: attachment.contentType,
      name: attachment.name,
      size: attachment.size,
      type: attachment.type,
    }));
};

const addSignedUrlsToAttachments = async (attachments = []) => {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return [];
  }

  return Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment || !attachment.storagePath) {
        return attachment;
      }

      try {
        const { url, expiresAt } = await generateSignedUrl(
          attachment.storagePath,
          60
        );

        return {
          ...attachment,
          url,
          urlExpiresAt: expiresAt,
        };
      } catch (error) {
        console.error(
          'Erro ao gerar URL assinada para anexo:',
          error.message
        );
        return attachment;
      }
    })
  );
};

const buildConversationUpdate = (conversation, userRole, previewContent) => {
  const updateData = {
    lastMessage: previewContent.substring(0, 100),
    lastMessageAt: new Date(),
    lastMessageBy: userRole,
    updatedAt: new Date(),
  };

  if (userRole === 'patient') {
    updateData.unreadCount = (conversation.unreadCount || 0) + 1;

    if (conversation.status === 'resolved') {
      updateData.status = 'active';
      updateData.kanbanColumn = 'in-progress';
    }
  } else if (userRole === 'prescriber') {
    updateData.patientUnreadCount = (conversation.patientUnreadCount || 0) + 1;
  }

  return updateData;
};


// Middleware para verificar webhook secret (apenas para rotas /webhook/*)
const verifyWebhookSecret = (req, res, next) => {
  // Se a rota começa com /webhook/, usa webhook secret
  if (req.path.startsWith('/webhook/')) {
    const secret = req.headers['x-webhook-secret'];
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authentication required'
      });
    }
    return next();
  }
  // Caso contrário, usa verificação de token normal
  return verifyToken(req, res, next);
};

// Aplicar middleware
router.use(verifyWebhookSecret);

// ==================== CONVERSAS ====================

/**
 * GET /api/messages/conversations
 * Listar todas as conversas do usuário
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { status, kanbanColumn } = req.query;

    let query = db.collection('conversations');

    // Filtrar por role
    if (userRole === 'patient') {
      query = query.where('patientId', '==', userId);
    } else if (userRole === 'prescriber') {
      query = query.where('prescriberId', '==', userId);
    } else if (userRole === 'admin') {
      // Admin vê todas
    }

    // Filtros adicionais
    if (status) {
      query = query.where('status', '==', status);
    }

    if (kanbanColumn && userRole !== 'patient') {
      query = query.where('kanbanColumn', '==', kanbanColumn);
    }

    // Ordenar por última mensagem
    query = query.orderBy('lastMessageAt', 'desc');

    const snapshot = await query.get();
    const conversations = [];

    snapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    res.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/messages/conversations/:id
 * Detalhes de uma conversa específica
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    // Verificar permissões
    if (userRole === 'patient' && conversation.patientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para acessar esta conversa',
      });
    }

    if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para acessar esta conversa',
      });
    }

    // Zerar contador de não lidas
    if (userRole === 'patient') {
      await conversationRef.update({
        patientUnreadCount: 0,
      });
    } else if (userRole === 'prescriber') {
      await conversationRef.update({
        unreadCount: 0,
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversationDoc.id,
        ...conversation,
        lastMessageAt: conversation.lastMessageAt?.toDate(),
        createdAt: conversation.createdAt?.toDate(),
        updatedAt: conversation.updatedAt?.toDate(),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/messages/conversations
 * Criar nova conversa (funciona para paciente E prescritor)
 */
router.post('/conversations', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { prescriberId, patientId, initialMessage } = req.body;

    // Determinar patientId e prescriberId baseado em quem está criando
    let finalPatientId, finalPrescriberId;

    if (userRole === 'prescriber') {
      // Prescritor criando conversa: userId é prescritor, body contém patientId
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: 'patientId é obrigatório quando prescritor cria conversa',
        });
      }
      finalPatientId = patientId;
      finalPrescriberId = userId;
      console.log('📝 Prescritor criando conversa:', { prescriberId: userId, patientId });
    } else {
      // Paciente criando conversa: userId é paciente, body contém prescriberId
      if (!prescriberId) {
        return res.status(400).json({
          success: false,
          error: 'prescriberId é obrigatório quando paciente cria conversa',
        });
      }
      finalPatientId = userId;
      finalPrescriberId = prescriberId;
      console.log('📝 Paciente criando conversa:', { patientId: userId, prescriberId });
    }

    // Verificar se já existe conversa entre esses dois usuários
    let existingQuery = db.collection('conversations')
      .where('patientId', '==', finalPatientId)
      .where('prescriberId', '==', finalPrescriberId);

    const existingSnapshot = await existingQuery.get();

    if (!existingSnapshot.empty) {
      const existingConversation = existingSnapshot.docs[0];
      console.log('✅ Conversa já existe:', existingConversation.id);
      return res.json({
        success: true,
        conversation: {
          id: existingConversation.id,
          ...existingConversation.data(),
          alreadyExists: true,
        },
      });
    }

    // Buscar dados do paciente e prescritor
    const patientDoc = await db.collection('users').doc(finalPatientId).get();
    const prescriberDoc = await db.collection('users').doc(finalPrescriberId).get();

    if (!patientDoc.exists || !prescriberDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const patientData = patientDoc.data();
    const prescriberData = prescriberDoc.data();

    // Criar conversa
    const conversationData = {
      patientId: finalPatientId,
      prescriberId: finalPrescriberId,
      status: 'new',
      kanbanColumn: 'new',
      lastMessage: initialMessage || 'Nova conversa iniciada',
      lastMessageAt: new Date(),
      lastMessageBy: userRole === 'prescriber' ? 'prescriber' : 'patient',
      unreadCount: userRole === 'prescriber' ? 0 : 1, // para o prescritor
      patientUnreadCount: userRole === 'prescriber' ? 1 : 0, // para o paciente
      priority: 'medium',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        patientName: patientData.name || patientData.displayName || patientData.email,
        patientEmail: patientData.email,
        patientAvatar: patientData.avatar || patientData.photoURL || null,
        prescriberName: prescriberData.name || prescriberData.displayName || prescriberData.email,
      },
    };

    const conversationRef = await db.collection('conversations').add(conversationData);

    // Se houver mensagem inicial, criar também
    if (initialMessage) {
      const messageSenderId = userRole === 'prescriber' ? finalPrescriberId : finalPatientId;
      const messageSenderRole = userRole === 'prescriber' ? 'prescriber' : 'patient';
      
      await db.collection('conversations').doc(conversationRef.id).collection('messages').add({
        conversationId: conversationRef.id,
        senderId: messageSenderId,
        senderRole: messageSenderRole,
        content: initialMessage,
        type: 'text',
        status: 'sent',
        isAiGenerated: false,
        createdAt: new Date(),
      });
      
      console.log('✅ Mensagem inicial criada:', { senderId: messageSenderId, senderRole: messageSenderRole });
    }

    console.log('✅ Conversa criada com sucesso:', {
      id: conversationRef.id,
      patientId: finalPatientId,
      prescriberId: finalPrescriberId,
    });

    res.json({
      success: true,
      conversation: {
        id: conversationRef.id,
        ...conversationData,
      },
    });
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/messages/conversations/:id
 * Atualizar conversa (status, kanban, priority, etc)
 */
router.patch('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { status, kanbanColumn, priority, tags } = req.body;

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    // Apenas prescritor pode atualizar status/kanban
    if (userRole === 'patient') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem atualizar o status da conversa',
      });
    }

    if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para atualizar esta conversa',
      });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (kanbanColumn) updateData.kanbanColumn = kanbanColumn;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;

    await conversationRef.update(updateData);

    res.json({
      success: true,
      conversation: {
        id: conversationId,
        ...conversation,
        ...updateData,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/messages/conversations/:id
 * Arquivar conversa
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    // Verificar permissões
    if (userRole === 'patient' && conversation.patientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    // Ao invés de deletar, arquivar
    await conversationRef.update({
      status: 'archived',
      kanbanColumn: 'archived',
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Conversa arquivada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao arquivar conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== MENSAGENS ====================

/**
 * GET /api/messages/conversations/:id/messages
 * Listar mensagens de uma conversa
 */
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { limit = 50, offset = 0 } = req.query;

    // Verificar se usuário tem acesso à conversa
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    if (userRole === 'patient' && conversation.patientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    // Buscar mensagens
    const messagesRef = db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const snapshot = await messagesRef.get();
    const messages = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const attachments = await addSignedUrlsToAttachments(
          data.attachments || []
        );

        return {
          id: doc.id,
          ...data,
          attachments,
          createdAt: data.createdAt?.toDate(),
          readAt: data.readAt?.toDate(),
        };
      })
    );

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/messages/conversations/:id/messages
 * Enviar nova mensagem
 */
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { content, type = 'text', attachments = [] } = req.body;

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const trimmedContent = (content || '').trim();

    if (!trimmedContent && !hasAttachments) {
      return res.status(400).json({
        success: false,
        error: 'Conteúdo da mensagem é obrigatório',
      });
    }

    // Verificar se usuário tem acesso à conversa
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    if (userRole === 'patient' && conversation.patientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    const messageType = hasAttachments ? type : 'text';
    const fallbackPreview =
      messageType === 'image'
        ? 'Imagem enviada'
        : messageType === 'audio'
        ? 'Áudio enviado'
        : 'Arquivo enviado';
    const messageContent = trimmedContent || fallbackPreview;
    const normalizedAttachments = sanitizeAttachmentPayload(attachments);

    // Criar mensagem
    const messageData = {
      conversationId,
      senderId: userId,
      senderRole: userRole,
      content: messageContent,
      type: messageType,
      status: 'sent',
      isAiGenerated: false,
      createdAt: new Date(),
    };

    if (normalizedAttachments.length > 0) {
      messageData.attachments = normalizedAttachments;
    }

    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);

    const updateData = buildConversationUpdate(
      conversation,
      userRole,
      messageContent
    );
    await conversationRef.update(updateData);

    const responseAttachments = await addSignedUrlsToAttachments(
      messageData.attachments || []
    );

    triggerNewMessageWorkflow({
      conversationId,
      messageId: messageRef.id,
      senderId: userId,
      senderRole: userRole,
      content: messageContent,
      type: messageType,
      attachments: responseAttachments,
      patientId: conversation.patientId,
      prescriberId: conversation.prescriberId,
    }).catch((err) => {
      console.error('Falha ao notificar N8N (texto):', err.message);
    });

    res.json({
      success: true,
      message: {
        id: messageRef.id,
        ...messageData,
        attachments: responseAttachments,
      },
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/messages/conversations/:id/attachments
 * Upload de mídia (imagem/áudio) e criação automática da mensagem
 */
router.post(
  '/conversations/:conversationId/attachments',
  upload.single('file'),
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.uid;
      const userRole = req.user.role || 'patient';
      const file = req.file;
      const mediaTypeInput = req.body.mediaType;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo é obrigatório',
        });
      }

      const detectedType = mediaTypeInput
        ? mediaTypeInput
        : file.mimetype.startsWith('image/')
        ? 'image'
        : file.mimetype.startsWith('audio/')
        ? 'audio'
        : 'file';

      if (!['image', 'audio'].includes(detectedType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de arquivo não suportado. Envie imagem ou áudio.',
        });
      }

      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();

      if (!conversationDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Conversa não encontrada',
        });
      }

      const conversation = conversationDoc.data();

      if (userRole === 'patient' && conversation.patientId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
        });
      }

      if (userRole === 'prescriber' && conversation.prescriberId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
        });
      }

      const uploadResult = await uploadChatMedia({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        conversationId,
        patientId: conversation.patientId,
        prescriberId: conversation.prescriberId,
        uploadedBy: userId,
        mediaType: detectedType,
      });

      const attachmentRecords = sanitizeAttachmentPayload([uploadResult]);
      const contentPreview =
        detectedType === 'image' ? 'Imagem enviada' : 'Áudio enviado';

      const messageData = {
        conversationId,
        senderId: userId,
        senderRole: userRole,
        content: contentPreview,
        type: detectedType,
        status: 'sent',
        isAiGenerated: false,
        createdAt: new Date(),
        attachments: attachmentRecords,
      };

      const messageRef = await db.collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add(messageData);

      const updateData = buildConversationUpdate(
        conversation,
        userRole,
        contentPreview
      );
      await conversationRef.update(updateData);

      const responseAttachments = await addSignedUrlsToAttachments(
        messageData.attachments
      );

      triggerNewMessageWorkflow({
        conversationId,
        messageId: messageRef.id,
        senderId: userId,
        senderRole: userRole,
        content: contentPreview,
        type: detectedType,
        attachments: responseAttachments,
        patientId: conversation.patientId,
        prescriberId: conversation.prescriberId,
      }).catch((err) => {
        console.error('Falha ao notificar N8N (mídia):', err.message);
      });

      res.json({
        success: true,
        message: {
          id: messageRef.id,
          ...messageData,
          attachments: responseAttachments,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/messages/:messageId/read
 * Marcar mensagem como lida
 */
router.patch('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId é obrigatório',
      });
    }

    const messageRef = db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(messageId);

    await messageRef.update({
      status: 'read',
      readAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Mensagem marcada como lida',
    });
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/messages/unread-count
 * Contador de mensagens não lidas
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';

    let query = db.collection('conversations');

    if (userRole === 'patient') {
      query = query.where('patientId', '==', userId);
    } else if (userRole === 'prescriber') {
      query = query.where('prescriberId', '==', userId);
    }

    const snapshot = await query.get();
    let totalUnread = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (userRole === 'patient') {
        totalUnread += data.patientUnreadCount || 0;
      } else {
        totalUnread += data.unreadCount || 0;
      }
    });

    res.json({
      success: true,
      unreadCount: totalUnread,
    });
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== TEMPLATES ====================

/**
 * GET /api/messages/templates
 * Listar templates de mensagem do prescritor
 */
router.get('/templates', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';

    if (userRole === 'patient') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem acessar templates',
      });
    }

    const templatesRef = db.collection('message-templates')
      .where('prescriberId', '==', userId)
      .orderBy('usageCount', 'desc');

    const snapshot = await templatesRef.get();
    const templates = [];

    snapshot.forEach(doc => {
      templates.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    res.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/messages/templates
 * Criar novo template
 */
router.post('/templates', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { title, content, category, tags = [] } = req.body;

    if (userRole === 'patient') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem criar templates',
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Título e conteúdo são obrigatórios',
      });
    }

    const templateData = {
      prescriberId: userId,
      title,
      content,
      category: category || 'geral',
      tags,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const templateRef = await db.collection('message-templates').add(templateData);

    res.json({
      success: true,
      template: {
        id: templateRef.id,
        ...templateData,
      },
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/messages/templates/:id
 * Atualizar template
 */
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { title, content, category, tags } = req.body;

    const templateRef = db.collection('message-templates').doc(id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    const template = templateDoc.data();

    if (template.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;

    await templateRef.update(updateData);

    res.json({
      success: true,
      template: {
        id,
        ...template,
        ...updateData,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/messages/templates/:id
 * Deletar template
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const templateRef = db.collection('message-templates').doc(id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    const template = templateDoc.data();

    if (template.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
      });
    }

    await templateRef.delete();

    res.json({
      success: true,
      message: 'Template deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== WEBHOOKS N8N ====================

/**
 * POST /api/messages/webhook/new-message
 * Webhook chamado quando nova mensagem é criada
 * (Será chamado pelo N8N para processar)
 */
router.post('/webhook/new-message', async (req, res) => {
  try {
    const { conversationId, messageId, content, senderId, senderRole } = req.body;

    // Aqui você pode adicionar lógica para processar a mensagem
    // Por exemplo: análise de sentimento, categorização automática, etc.

    res.json({
      success: true,
      message: 'Webhook recebido',
      data: {
        conversationId,
        messageId,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/messages/webhook/ai-response
 * Webhook para N8N enviar resposta gerada por IA
 */
router.post('/webhook/ai-response', async (req, res) => {
  try {
    const { conversationId, content, aiContext } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        error: 'conversationId e content são obrigatórios',
      });
    }

    // Criar mensagem do sistema com resposta da IA
    const messageData = {
      conversationId,
      senderId: 'system',
      senderRole: 'system',
      content,
      type: 'text',
      status: 'sent',
      isAiGenerated: true,
      aiContext: aiContext || {},
      createdAt: new Date(),
    };

    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);

    // Atualizar conversa
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
      lastMessageBy: 'system',
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: {
        id: messageRef.id,
        ...messageData,
      },
    });
  } catch (error) {
    console.error('Erro ao processar resposta IA:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/messages/webhook/conversation-context/:id
 * Obter contexto completo da conversa para IA processar
 */
router.get('/webhook/conversation-context/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar conversa
    const conversationDoc = await db.collection('conversations').doc(id).get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    const conversation = conversationDoc.data();

    // Buscar últimas 20 mensagens
    const messagesSnapshot = await db.collection('conversations')
      .doc(id)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      });
    });

    // Buscar dados do paciente
    const patientDoc = await db.collection('users').doc(conversation.patientId).get();
    const patientData = patientDoc.exists ? patientDoc.data() : {};

    res.json({
      success: true,
      context: {
        conversation: {
          id,
          ...conversation,
          lastMessageAt: conversation.lastMessageAt?.toDate(),
          createdAt: conversation.createdAt?.toDate(),
        },
        messages: messages.reverse(), // ordem cronológica
        patient: {
          id: conversation.patientId,
          name: patientData.name,
          email: patientData.email,
          age: patientData.age,
          gender: patientData.gender,
          goals: patientData.goals,
          restrictions: patientData.dietaryRestrictions,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar contexto:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/messages/webhook/test-context
 * Endpoint de teste com dados fake para testar o workflow 3
 */
router.get('/webhook/test-context', async (req, res) => {
  try {
    // Retornar contexto fake para testes
    res.json({
      success: true,
      context: {
        conversation: {
          id: 'test-conv-001',
          patientId: 'patient-123',
          status: 'active',
          lastMessage: 'Olá, como faço para perder peso?',
          lastMessageAt: new Date(),
          createdAt: new Date(),
        },
        messages: [
          {
            id: 'msg-1',
            senderRole: 'patient',
            content: 'Olá! Gostaria de uma orientação sobre alimentação saudável.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
          },
          {
            id: 'msg-2',
            senderRole: 'nutritionist',
            content: 'Olá! Claro, ficarei feliz em ajudar. Quais são seus objetivos principais?',
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          },
          {
            id: 'msg-3',
            senderRole: 'patient',
            content: 'Quero perder peso de forma saudável e ganhar mais disposição no dia a dia.',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
        ],
        patient: {
          id: 'patient-123',
          name: 'Maria Silva',
          email: 'maria@example.com',
          age: 32,
          gender: 'F',
          goals: 'Perder peso e ganhar energia',
          restrictions: 'Intolerância à lactose',
        },
      },
    });
  } catch (error) {
    console.error('Erro no endpoint de teste:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

