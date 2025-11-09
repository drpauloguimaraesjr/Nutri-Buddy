/**
 * Rotas de Medidas Corporais
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * POST /api/measurements
 * Adiciona nova medida corporal
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      weight,
      height,
      waist,
      chest,
      hips,
      arm,
      thigh,
      calf,
      neck,
      bodyFat,
      muscleMass,
      notes
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    if (!weight) {
      return res.status(400).json({
        success: false,
        error: 'Peso é obrigatório'
      });
    }

    // Calcular IMC se tiver altura
    let bmi = null;
    if (height && weight) {
      const heightInMeters = height / 100;
      bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    const measurementData = {
      userId,
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight),
      height: height ? parseFloat(height) : null,
      bmi,
      // Circunferências (cm)
      waist: waist ? parseFloat(waist) : null,
      chest: chest ? parseFloat(chest) : null,
      hips: hips ? parseFloat(hips) : null,
      arm: arm ? parseFloat(arm) : null,
      thigh: thigh ? parseFloat(thigh) : null,
      calf: calf ? parseFloat(calf) : null,
      neck: neck ? parseFloat(neck) : null,
      // Composição corporal
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      muscleMass: muscleMass ? parseFloat(muscleMass) : null,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('measurements').add(measurementData);

    res.json({
      success: true,
      measurement: {
        id: docRef.id,
        ...measurementData
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar medida:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/measurements
 * Lista medidas do usuário
 */
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const snapshot = await db.collection('measurements')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const measurements = [];
    snapshot.forEach(doc => {
      measurements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calcular estatísticas
    const stats = calculateStats(measurements);

    res.json({
      success: true,
      measurements,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar medidas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/measurements/latest
 * Obtém última medida do usuário
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

    const snapshot = await db.collection('measurements')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        measurement: null
      });
    }

    const doc = snapshot.docs[0];
    res.json({
      success: true,
      measurement: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar última medida:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/measurements/:id
 * Obtém medida específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const doc = await db.collection('measurements').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Medida não encontrada'
      });
    }

    const measurement = doc.data();

    if (measurement.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    res.json({
      success: true,
      measurement: {
        id: doc.id,
        ...measurement
      }
    });

  } catch (error) {
    console.error('Erro ao buscar medida:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/measurements/:id
 * Atualiza medida
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updates } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('measurements').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Medida não encontrada'
      });
    }

    const measurement = doc.data();

    if (measurement.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    // Recalcular IMC se peso ou altura mudarem
    let bmi = measurement.bmi;
    const newWeight = updates.weight || measurement.weight;
    const newHeight = updates.height || measurement.height;

    if (newWeight && newHeight) {
      const heightInMeters = newHeight / 100;
      bmi = parseFloat((newWeight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    const updatedData = {
      ...updates,
      bmi,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedData);

    res.json({
      success: true,
      measurement: {
        id: doc.id,
        ...measurement,
        ...updatedData
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar medida:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/measurements/:id
 * Remove medida
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

    const docRef = db.collection('measurements').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Medida não encontrada'
      });
    }

    const measurement = doc.data();

    if (measurement.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Medida removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover medida:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Funções auxiliares
 */

function calculateStats(measurements) {
  if (measurements.length === 0) {
    return {
      totalMeasurements: 0,
      weightChange: 0,
      bmiChange: 0,
      lastWeight: null,
      lastBMI: null
    };
  }

  const latest = measurements[0];
  const oldest = measurements[measurements.length - 1];

  const weightChange = latest.weight && oldest.weight
    ? parseFloat((latest.weight - oldest.weight).toFixed(2))
    : 0;

  const bmiChange = latest.bmi && oldest.bmi
    ? parseFloat((latest.bmi - oldest.bmi).toFixed(2))
    : 0;

  return {
    totalMeasurements: measurements.length,
    weightChange,
    bmiChange,
    lastWeight: latest.weight,
    lastBMI: latest.bmi,
    trend: weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable'
  };
}

module.exports = router;

