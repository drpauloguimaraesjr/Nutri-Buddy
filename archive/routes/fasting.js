/**
 * Rotas de Jejum Intermitente
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * POST /api/fasting/start
 * Inicia um novo período de jejum
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, type = '16:8', goal } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    // Verificar se já existe jejum ativo
    const activeSnapshot = await db.collection('fasting')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!activeSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um jejum ativo. Finalize-o antes de iniciar outro.'
      });
    }

    const fastingData = {
      userId,
      type, // 16:8, 18:6, 20:4, 24h, etc
      goal: goal || calculateGoalTime(type),
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      duration: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('fasting').add(fastingData);

    res.json({
      success: true,
      fasting: {
        id: docRef.id,
        ...fastingData
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar jejum:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/fasting/end/:id
 * Finaliza um período de jejum
 */
router.post('/end/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('fasting').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Jejum não encontrado'
      });
    }

    const fastingData = doc.data();

    if (fastingData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    if (fastingData.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Este jejum já foi finalizado'
      });
    }

    const endTime = new Date();
    const startTime = new Date(fastingData.startTime);
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutos
    const completed = duration >= fastingData.goal;

    await docRef.update({
      endTime: endTime.toISOString(),
      status: 'completed',
      duration,
      completed,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      fasting: {
        id: doc.id,
        ...fastingData,
        endTime: endTime.toISOString(),
        status: 'completed',
        duration,
        completed
      }
    });

  } catch (error) {
    console.error('Erro ao finalizar jejum:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/fasting/stop
 * Finaliza o jejum ativo do usuário (sem precisar do ID)
 */
router.post('/stop', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    // Buscar jejum ativo
    const snapshot = await db.collection('fasting')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Nenhum jejum ativo encontrado'
      });
    }

    const doc = snapshot.docs[0];
    const fastingData = doc.data();

    const endTime = new Date();
    const startTime = new Date(fastingData.startTime);
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutos
    const completed = duration >= fastingData.goal;

    await doc.ref.update({
      endTime: endTime.toISOString(),
      status: 'completed',
      duration,
      completed,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      fasting: {
        id: doc.id,
        ...fastingData,
        endTime: endTime.toISOString(),
        status: 'completed',
        duration,
        completed
      }
    });

  } catch (error) {
    console.error('Erro ao parar jejum:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/fasting/active
 * Obtém jejum ativo do usuário
 */
router.get('/active', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const snapshot = await db.collection('fasting')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        fasting: null
      });
    }

    const doc = snapshot.docs[0];
    const fastingData = doc.data();

    // Calcular duração atual
    const startTime = new Date(fastingData.startTime);
    const now = new Date();
    const currentDuration = Math.floor((now - startTime) / 1000 / 60); // minutos
    const progress = (currentDuration / fastingData.goal) * 100;

    res.json({
      success: true,
      fasting: {
        id: doc.id,
        ...fastingData,
        currentDuration,
        progress: Math.min(progress, 100),
        remainingTime: Math.max(fastingData.goal - currentDuration, 0)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jejum ativo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/fasting/history
 * Obtém histórico de jejuns do usuário
 */
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const snapshot = await db.collection('fasting')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calcular estatísticas
    const stats = calculateStats(history);

    res.json({
      success: true,
      history,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/fasting/:id
 * Remove um registro de jejum
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('fasting').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Jejum não encontrado'
      });
    }

    const fastingData = doc.data();

    if (fastingData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Jejum removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover jejum:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Funções auxiliares
 */

function calculateGoalTime(type) {
  const goals = {
    '16:8': 16 * 60,   // 960 minutos
    '18:6': 18 * 60,   // 1080 minutos
    '20:4': 20 * 60,   // 1200 minutos
    '24h': 24 * 60,    // 1440 minutos
    '12:12': 12 * 60,  // 720 minutos
    '14:10': 14 * 60   // 840 minutos
  };
  
  return goals[type] || 16 * 60;
}

function calculateStats(history) {
  const completed = history.filter(f => f.completed && f.status === 'completed');
  const total = history.filter(f => f.status === 'completed').length;
  
  const avgDuration = completed.length > 0
    ? Math.floor(completed.reduce((sum, f) => sum + f.duration, 0) / completed.length)
    : 0;

  const longestFast = history.reduce((max, f) => {
    return f.duration > max ? f.duration : max;
  }, 0);

  const last7Days = history.filter(f => {
    const date = new Date(f.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo && f.status === 'completed';
  });

  return {
    totalFasts: total,
    completedFasts: completed.length,
    successRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    avgDuration,
    longestFast,
    last7DaysCount: last7Days.length
  };
}

module.exports = router;

