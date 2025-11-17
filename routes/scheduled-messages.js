const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const twilioService = require('../services/twilio-service');
const admin = require('firebase-admin');

// ==================== TEMPLATES ====================

const MESSAGE_TEMPLATES = {
  // 1. Lembrete de Refeição
  MEAL_REMINDER: {
    id: 'meal_reminder',
    name: 'Lembrete de Refeição',
    category: 'reminders',
    template: 'Olá {{patientName}}! 🍽️\n\nÉ hora do seu {{mealName}}!\n\nBoa refeição! 😊',
    variables: ['patientName', 'mealName'],
    description: 'Lembrar paciente sobre horário da refeição'
  },
  
  // 2. Lembrete de Consulta
  APPOINTMENT_REMINDER: {
    id: 'appointment_reminder',
    name: 'Lembrete de Consulta',
    category: 'appointments',
    template: 'Olá {{patientName}}! 📅\n\nLembrando que você tem consulta marcada para {{appointmentDate}} às {{appointmentTime}}.\n\nNos vemos lá! 💚',
    variables: ['patientName', 'appointmentDate', 'appointmentTime'],
    description: 'Lembrar paciente sobre consulta agendada'
  },
  
  // 3. Boas-vindas
  WELCOME: {
    id: 'welcome',
    name: 'Boas-vindas',
    category: 'onboarding',
    template: 'Olá {{patientName}}! 👋\n\nSeja bem-vindo(a) ao NutriBuddy! 🎉\n\nEstou aqui para te ajudar a alcançar seus objetivos. Vamos juntos nessa jornada!\n\n💚 {{prescriberName}}',
    variables: ['patientName', 'prescriberName'],
    description: 'Mensagem de boas-vindas para novos pacientes'
  },
  
  // 4. Parabéns por Conquista
  ACHIEVEMENT: {
    id: 'achievement',
    name: 'Parabéns por Conquista',
    category: 'engagement',
    template: 'Parabéns, {{patientName}}! 🎉🏆\n\nVocê conquistou: {{achievementName}}!\n\nContinue assim! Você está indo muito bem! 💪',
    variables: ['patientName', 'achievementName'],
    description: 'Parabenizar paciente por conquista/meta atingida'
  },
  
  // 5. Check-in Semanal
  WEEKLY_CHECKIN: {
    id: 'weekly_checkin',
    name: 'Check-in Semanal',
    category: 'follow-up',
    template: 'Olá {{patientName}}! 📊\n\nComo foi sua semana? Conseguiu seguir o plano alimentar?\n\nMe conte como estão as coisas! 💬',
    variables: ['patientName'],
    description: 'Check-in semanal com o paciente'
  },
  
  // 6. Lembrete de Hidratação
  HYDRATION_REMINDER: {
    id: 'hydration_reminder',
    name: 'Lembrete de Hidratação',
    category: 'reminders',
    template: '💧 Hora de beber água, {{patientName}}!\n\nJá tomou seus {{waterGoal}}ml hoje?\n\nHidratação é fundamental! 💙',
    variables: ['patientName', 'waterGoal'],
    description: 'Lembrar paciente de beber água'
  },
  
  // 7. Lembrete de Exercício
  EXERCISE_REMINDER: {
    id: 'exercise_reminder',
    name: 'Lembrete de Exercício',
    category: 'reminders',
    template: '🏃‍♀️ Olá {{patientName}}!\n\nQue tal uma atividade física hoje?\n\nLembre-se: movimento é vida! 💪',
    variables: ['patientName'],
    description: 'Lembrar paciente sobre exercícios'
  },
  
  // 8. Feedback Positivo
  POSITIVE_FEEDBACK: {
    id: 'positive_feedback',
    name: 'Feedback Positivo',
    category: 'engagement',
    template: 'Olá {{patientName}}! 😊\n\nNotei que você está indo muito bem! Continue assim!\n\nEstou muito orgulhoso(a) do seu progresso! 🌟\n\n{{prescriberName}}',
    variables: ['patientName', 'prescriberName'],
    description: 'Feedback positivo sobre progresso do paciente'
  }
};

/**
 * GET /api/scheduled-messages/templates
 * Listar todos os templates disponíveis
 */
router.get('/templates', verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    
    let templates = Object.values(MESSAGE_TEMPLATES);
    
    // Filtrar por categoria se fornecida
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    res.json({
      success: true,
      templates,
      categories: ['reminders', 'appointments', 'onboarding', 'engagement', 'follow-up']
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scheduled-messages/templates/:id
 * Detalhes de um template específico
 */
router.get('/templates/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const template = MESSAGE_TEMPLATES[id.toUpperCase()];
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado'
      });
    }
    
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== MENSAGENS AGENDADAS ====================

/**
 * POST /api/scheduled-messages
 * Agendar uma nova mensagem
 * 
 * Body:
 * {
 *   "patientId": "abc123",
 *   "templateId": "meal_reminder" (opcional, pode usar message direto),
 *   "message": "Texto da mensagem" (se não usar template),
 *   "variables": { "patientName": "João", "mealName": "café da manhã" },
 *   "scheduledFor": "2024-11-20T08:00:00Z",
 *   "channel": "whatsapp" | "internal" | "both",
 *   "repeat": "daily" | "weekly" | "monthly" | "once" (default: "once")
 * }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    
    // Apenas prescritores podem agendar mensagens
    if (userRole !== 'prescriber' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas prescritores podem agendar mensagens'
      });
    }
    
    const {
      patientId,
      templateId,
      message,
      variables = {},
      scheduledFor,
      channel = 'whatsapp',
      repeat = 'once'
    } = req.body;
    
    // Validação
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    if (!templateId && !message) {
      return res.status(400).json({
        success: false,
        error: 'Forneça templateId ou message'
      });
    }
    
    if (!scheduledFor) {
      return res.status(400).json({
        success: false,
        error: 'scheduledFor é obrigatório (formato ISO 8601)'
      });
    }
    
    // Buscar paciente
    const patientDoc = await db.collection('users').doc(patientId).get();
    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }
    
    const patientData = patientDoc.data();
    
    // Processar template se fornecido
    let finalMessage = message;
    if (templateId) {
      const template = MESSAGE_TEMPLATES[templateId.toUpperCase()];
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template não encontrado'
        });
      }
      
      // Substituir variáveis no template
      finalMessage = template.template;
      for (const [key, value] of Object.entries(variables)) {
        finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    
    // Criar mensagem agendada
    const scheduledMessageData = {
      prescriberId: userId,
      patientId,
      patientPhone: patientData.phone || null,
      patientName: patientData.name || patientData.displayName,
      templateId: templateId || null,
      message: finalMessage,
      variables,
      scheduledFor: new Date(scheduledFor),
      channel, // 'whatsapp', 'internal', 'both'
      repeat, // 'once', 'daily', 'weekly', 'monthly'
      status: 'pending', // 'pending', 'sent', 'failed', 'cancelled'
      sentAt: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const messageRef = await db.collection('scheduledMessages').add(scheduledMessageData);
    
    console.log('✅ Mensagem agendada criada:', {
      id: messageRef.id,
      patientId,
      scheduledFor: scheduledFor,
      channel
    });
    
    res.json({
      success: true,
      scheduledMessage: {
        id: messageRef.id,
        ...scheduledMessageData
      }
    });
  } catch (error) {
    console.error('Erro ao agendar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scheduled-messages
 * Listar mensagens agendadas do prescritor
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role || 'patient';
    const { status, patientId, limit = 50 } = req.query;
    
    if (userRole !== 'prescriber' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão'
      });
    }
    
    let query = db.collection('scheduledMessages')
      .where('prescriberId', '==', userId)
      .orderBy('scheduledFor', 'asc')
      .limit(parseInt(limit));
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (patientId) {
      query = query.where('patientId', '==', patientId);
    }
    
    const snapshot = await query.get();
    const scheduledMessages = [];
    
    snapshot.forEach(doc => {
      scheduledMessages.push({
        id: doc.id,
        ...doc.data(),
        scheduledFor: doc.data().scheduledFor?.toDate(),
        sentAt: doc.data().sentAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });
    
    res.json({
      success: true,
      scheduledMessages,
      count: scheduledMessages.length
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens agendadas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/scheduled-messages/:id
 * Cancelar mensagem agendada
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const messageRef = db.collection('scheduledMessages').doc(id);
    const messageDoc = await messageRef.get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }
    
    const messageData = messageDoc.data();
    
    // Verificar permissão
    if (messageData.prescriberId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão'
      });
    }
    
    // Marcar como cancelada
    await messageRef.update({
      status: 'cancelled',
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Mensagem agendada cancelada'
    });
  } catch (error) {
    console.error('Erro ao cancelar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

