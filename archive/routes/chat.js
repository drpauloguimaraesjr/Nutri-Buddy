/**
 * Rotas de Chat com IA - Assistente Nutricional
 */

const express = require('express');
const router = express.Router();
const chatAI = require('../services/chatAI');

/**
 * POST /api/chat/message
 * Envia mensagem e recebe resposta da IA
 */
router.post('/message', async (req, res) => {
  try {
    const { userId, message, conversationId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId e message são obrigatórios'
      });
    }

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem não pode estar vazia'
      });
    }

    console.log(`💬 Chat: ${userId} → "${message.substring(0, 50)}..."`);

    const result = await chatAI.sendMessage(userId, message.trim(), conversationId);

    if (!result.success) {
      return res.status(200).json({
        success: false,
        error: result.error,
        message: result.fallback || 'Desculpe, não consegui processar sua mensagem.'
      });
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro no chat:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Desculpe, ocorreu um erro. Tente novamente.'
    });
  }
});

/**
 * POST /api/chat/new
 * Cria nova conversa
 */
router.post('/new', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    console.log(`🆕 Nova conversa: ${userId}`);

    const result = await chatAI.createNewConversation(userId);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/history/:conversationId
 * Obtém histórico de uma conversa
 */
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const history = await chatAI.getConversationHistory(userId, conversationId);

    res.json({
      success: true,
      conversationId,
      history
    });

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/conversations
 * Lista conversas do usuário
 */
router.get('/conversations', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const conversations = await chatAI.getUserConversations(userId, parseInt(limit));

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('❌ Erro ao listar conversas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/suggestions
 * Obtém sugestões de perguntas baseadas no contexto do usuário
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const context = await chatAI.getUserContext(userId);
    const suggestions = chatAI.getSuggestedQuestions(context);

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('❌ Erro ao obter sugestões:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/chat/conversation/:conversationId
 * Limpa cache de uma conversa
 */
router.delete('/conversation/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    chatAI.clearConversationCache(conversationId);

    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/status
 * Verifica se o chat está habilitado
 */
router.get('/status', (req, res) => {
  res.json({
    enabled: chatAI.enabled,
    model: chatAI.enabled ? 'gpt-4o-mini' : null,
    message: chatAI.enabled 
      ? '✅ Chat com IA (OpenAI) está funcionando!' 
      : '⚠️ Configure OPENAI_API_KEY para habilitar o chat'
  });
});

module.exports = router;

