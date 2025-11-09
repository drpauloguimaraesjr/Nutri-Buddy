/**
 * Rotas de Glicemia (Freestyle Libre)
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * POST /api/glucose
 * Adiciona leitura de glicemia
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      value,
      timestamp,
      source,
      notes,
      mealRelated
    } = req.body;

    if (!userId || !value) {
      return res.status(400).json({
        success: false,
        error: 'userId e value são obrigatórios'
      });
    }

    const glucoseData = {
      userId,
      value: parseFloat(value), // mg/dL
      timestamp: timestamp || new Date().toISOString(),
      date: (timestamp || new Date().toISOString()).split('T')[0],
      source: source || 'manual', // manual, freestyle-libre, etc
      classification: classifyGlucose(parseFloat(value)),
      notes: notes || '',
      mealRelated: mealRelated || null, // ID da refeição relacionada
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('glucose').add(glucoseData);

    res.json({
      success: true,
      reading: {
        id: docRef.id,
        ...glucoseData
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar leitura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/glucose/import-libre
 * Importa dados do Freestyle Libre (CSV)
 */
router.post('/import-libre', async (req, res) => {
  try {
    const { userId, readings } = req.body;

    if (!userId || !readings || !Array.isArray(readings)) {
      return res.status(400).json({
        success: false,
        error: 'userId e readings array são obrigatórios'
      });
    }

    const batch = db.batch();
    const imported = [];

    for (const reading of readings) {
      if (!reading.timestamp || !reading.value) continue;

      const glucoseData = {
        userId,
        value: parseFloat(reading.value),
        timestamp: reading.timestamp,
        date: reading.timestamp.split('T')[0],
        source: 'freestyle-libre',
        classification: classifyGlucose(parseFloat(reading.value)),
        notes: reading.notes || '',
        createdAt: new Date().toISOString()
      };

      const docRef = db.collection('glucose').doc();
      batch.set(docRef, glucoseData);
      imported.push({ id: docRef.id, ...glucoseData });
    }

    await batch.commit();

    res.json({
      success: true,
      imported: imported.length,
      readings: imported
    });

  } catch (error) {
    console.error('Erro ao importar dados:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/glucose
 * Lista leituras de glicemia
 */
router.get('/', async (req, res) => {
  try {
    const { userId, startDate, endDate, limit = 100 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    let query = db.collection('glucose').where('userId', '==', userId);

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();

    const readings = [];
    snapshot.forEach(doc => {
      readings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calcular estatísticas
    const stats = calculateStats(readings);

    res.json({
      success: true,
      readings,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar leituras:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/glucose/latest
 * Obtém última leitura
 */
router.get('/latest', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const snapshot = await db.collection('glucose')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        reading: null
      });
    }

    const doc = snapshot.docs[0];
    res.json({
      success: true,
      reading: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar última leitura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/glucose/daily-average
 * Obtém média diária
 */
router.get('/daily-average', async (req, res) => {
  try {
    const { userId, days = 7 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    const snapshot = await db.collection('glucose')
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .orderBy('date', 'asc')
      .get();

    const dailyAverages = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!dailyAverages[data.date]) {
        dailyAverages[data.date] = { sum: 0, count: 0, values: [] };
      }
      dailyAverages[data.date].sum += data.value;
      dailyAverages[data.date].count += 1;
      dailyAverages[data.date].values.push(data.value);
    });

    const result = Object.entries(dailyAverages).map(([date, data]) => ({
      date,
      average: Math.round(data.sum / data.count),
      min: Math.min(...data.values),
      max: Math.max(...data.values),
      count: data.count
    }));

    res.json({
      success: true,
      dailyAverages: result
    });

  } catch (error) {
    console.error('Erro ao calcular médias:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/glucose/:id
 * Remove leitura
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

    const docRef = db.collection('glucose').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Leitura não encontrada'
      });
    }

    const reading = doc.data();

    if (reading.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Leitura removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover leitura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Funções auxiliares
 */

function classifyGlucose(value) {
  // Classificação baseada em jejum (mg/dL)
  if (value < 70) return { level: 'low', label: 'Hipoglicemia', color: 'red' };
  if (value >= 70 && value <= 99) return { level: 'normal', label: 'Normal', color: 'green' };
  if (value >= 100 && value <= 125) return { level: 'prediabetes', label: 'Pré-diabetes', color: 'yellow' };
  return { level: 'high', label: 'Diabetes', color: 'red' };
}

function calculateStats(readings) {
  if (readings.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      total: 0,
      normalCount: 0,
      highCount: 0,
      lowCount: 0
    };
  }

  const values = readings.map(r => r.value);
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  let normalCount = 0;
  let highCount = 0;
  let lowCount = 0;

  readings.forEach(r => {
    if (r.classification.level === 'normal') normalCount++;
    else if (r.classification.level === 'high' || r.classification.level === 'prediabetes') highCount++;
    else if (r.classification.level === 'low') lowCount++;
  });

  return {
    average: Math.round(sum / readings.length),
    min: Math.min(...values),
    max: Math.max(...values),
    total: readings.length,
    normalCount,
    highCount,
    lowCount,
    normalPercentage: Math.round((normalCount / readings.length) * 100)
  };
}

module.exports = router;

