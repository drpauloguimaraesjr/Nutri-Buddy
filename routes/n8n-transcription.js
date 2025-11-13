const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Middleware para validar webhook secret
const validateWebhookSecret = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  
  if (secret !== process.env.WEBHOOK_SECRET && secret !== 'nutribuddy-secret-2024') {
    console.error('❌ Webhook secret inválido');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  next();
};

router.use(validateWebhookSecret);

/**
 * POST /api/n8n/update-diet
 * Recebe dados da dieta transcrita pelo n8n
 */
router.post('/update-diet', async (req, res) => {
  try {
    const { patientId, meals, macros, notes, fullText, transcriptionStatus } = req.body;
    
    console.log('📄 [N8N] Atualizando dieta transcrita:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    const userRef = db.collection('users').doc(patientId);
    
    await userRef.update({
      dietPlanText: fullText || notes || '',
      dietMeals: meals || [],
      dietMacros: macros || {},
      planTranscriptionStatus: transcriptionStatus || 'completed',
      planUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ [N8N] Dieta salva com sucesso');
    
    res.json({
      success: true,
      message: 'Dieta transcrita e salva com sucesso',
      patientId
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar dieta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/update-inbody
 * Recebe dados da InBody transcrita pelo n8n
 */
router.post('/update-inbody', async (req, res) => {
  try {
    const { 
      patientId, 
      weight, 
      height, 
      bodyFat, 
      leanMass, 
      fatMass, 
      bodyWater,
      bmi,
      visceralFat,
      basalMetabolicRate,
      measurements,
      muscleDistribution,
      date,
      notes,
      transcriptionStatus 
    } = req.body;
    
    console.log('📊 [N8N] Atualizando InBody transcrita:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    const userRef = db.collection('users').doc(patientId);
    
    // Atualizar dados do paciente
    const updateData = {
      inbodyTranscriptionStatus: transcriptionStatus || 'completed',
      bodyUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Adicionar apenas campos que existem
    if (weight) updateData.weight = weight;
    if (height) updateData.height = height;
    if (bodyFat) updateData.bodyFat = bodyFat;
    if (leanMass) updateData.leanMass = leanMass;
    if (fatMass) updateData.fatMass = fatMass;
    if (bodyWater) updateData.bodyWater = bodyWater;
    if (bmi) updateData.bmi = bmi;
    if (visceralFat) updateData.visceralFat = visceralFat;
    if (basalMetabolicRate) updateData.basalMetabolicRate = basalMetabolicRate;
    if (measurements) updateData.measurements = measurements;
    if (muscleDistribution) updateData.muscleDistribution = muscleDistribution;
    if (notes) updateData.inbodyNotes = notes;
    
    await userRef.update(updateData);
    
    // Adicionar no histórico de medições
    if (weight || bodyFat) {
      const historyRef = userRef.collection('bodyHistory');
      await historyRef.add({
        weight: weight || null,
        bodyFat: bodyFat || null,
        measurements: measurements || null,
        source: 'inbody_770',
        date: date || new Date().toISOString().split('T')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ [N8N] InBody salva com sucesso');
    
    res.json({
      success: true,
      message: 'InBody transcrita e salva com sucesso',
      patientId,
      data: updateData
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar InBody:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

