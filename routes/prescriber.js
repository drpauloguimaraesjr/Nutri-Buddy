const express = require('express');
const router = express.Router();
const { verifyToken, requirePrescriber } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Todas as rotas aqui requerem autenticação + role prescriber
router.use(verifyToken);
router.use(requirePrescriber);

/**
 * GET /api/prescriber/patients
 * Listar todos os pacientes do prescritor (conexões ativas)
 */
router.get('/patients', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    console.log('📋 [PRESCRIBER] Fetching patients for:', prescriberId);
    
    const connectionsSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'active')
      .get();
    
    const patients = [];
    for (const doc of connectionsSnapshot.docs) {
      const connection = doc.data();
      const patientDoc = await db.collection('users').doc(connection.patientId).get();
      
      if (patientDoc.exists) {
        patients.push({
          id: patientDoc.id,
          ...patientDoc.data(),
          connectionId: doc.id,
          connectionDate: connection.createdAt
        });
      }
    }
    
    console.log('✅ [PRESCRIBER] Found', patients.length, 'patients');
    
    res.json({
      success: true,
      data: patients,
      total: patients.length
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/patients/pending
 * Listar convites pendentes
 */
router.get('/patients/pending', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    const connectionsSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'pending')
      .get();
    
    const pending = connectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: pending,
      total: pending.length
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching pending invites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/invite
 * Enviar convite para paciente por email
 */
router.post('/patients/invite', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const prescriberId = req.user.uid;
    
    console.log('📧 [PRESCRIBER] Sending invite to:', patientEmail);
    
    if (!patientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Patient email is required'
      });
    }
    
    // Buscar paciente por email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', patientEmail.toLowerCase())
      .where('role', '==', 'patient')
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found. Make sure the user is registered as a patient.'
      });
    }
    
    const patientDoc = usersSnapshot.docs[0];
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();
    
    // Verificar se conexão já existe
    const existingConnection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .limit(1)
      .get();
    
    if (!existingConnection.empty) {
      const status = existingConnection.docs[0].data().status;
      return res.status(400).json({
        success: false,
        error: `Connection already exists with status: ${status}`
      });
    }
    
    // Criar conexão pendente
    const connectionRef = await db.collection('connections').add({
      prescriberId,
      patientId,
      patientEmail: patientData.email,
      patientName: patientData.displayName || 'Unknown',
      status: 'pending',
      createdAt: new Date()
    });
    
    console.log('✅ [PRESCRIBER] Invite sent successfully:', connectionRef.id);
    
    res.json({
      success: true,
      data: {
        connectionId: connectionRef.id,
        message: 'Invite sent successfully'
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error sending invite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/patient/:patientId
 * Ver detalhes de um paciente específico
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    // Verificar conexão ativa
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    // Buscar dados do paciente
    const patientDoc = await db.collection('users').doc(patientId).get();
    
    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: patientDoc.id,
        ...patientDoc.data()
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching patient details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/dietPlans
 * Criar plano alimentar para paciente
 */
router.post('/dietPlans', async (req, res) => {
  try {
    const { patientId, name, description, meals, dailyCalories, dailyProtein, dailyCarbs, dailyFats } = req.body;
    const prescriberId = req.user.uid;
    
    console.log('📋 [PRESCRIBER] Creating diet plan for patient:', patientId);
    
    if (!patientId || !name || !meals) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientId, name, meals'
      });
    }
    
    // Verificar conexão ativa
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    // Desativar planos anteriores
    const previousPlans = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();
    
    const batch = db.batch();
    previousPlans.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    await batch.commit();
    
    // Criar novo plano
    const planRef = await db.collection('dietPlans').add({
      prescriberId,
      patientId,
      name,
      description: description || '',
      meals: meals || [],
      dailyCalories: dailyCalories || 2000,
      dailyProtein: dailyProtein || 150,
      dailyCarbs: dailyCarbs || 250,
      dailyFats: dailyFats || 65,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ [PRESCRIBER] Diet plan created:', planRef.id);
    
    res.json({
      success: true,
      data: {
        planId: planRef.id,
        message: 'Diet plan created successfully'
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error creating diet plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/dietPlans/:patientId
 * Listar planos alimentares de um paciente
 */
router.get('/dietPlans/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    // Verificar conexão
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    const plansSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const plans = plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching diet plans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/stats
 * Obter estatísticas do prescritor
 */
router.get('/stats', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    // Contar pacientes ativos
    const activeConnections = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'active')
      .get();
    
    // Contar convites pendentes
    const pendingConnections = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'pending')
      .get();
    
    // Contar planos ativos
    const activePlans = await db.collection('dietPlans')
      .where('prescriberId', '==', prescriberId)
      .where('isActive', '==', true)
      .get();
    
    res.json({
      success: true,
      data: {
        totalPatients: activeConnections.size,
        activePatients: activeConnections.size,
        pendingApprovals: pendingConnections.size,
        activePlans: activePlans.size
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

