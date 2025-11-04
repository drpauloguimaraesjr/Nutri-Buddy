const express = require('express');
const router = express.Router();
const { verifyToken, requirePatient } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Todas as rotas requerem autenticação + role patient
router.use(verifyToken);
router.use(requirePatient);

/**
 * GET /api/patient/prescriber
 * Ver informações do prescritor vinculado
 */
router.get('/prescriber', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
    console.log('🔍 [PATIENT] Fetching prescriber for:', patientId);
    
    const connectionSnapshot = await db.collection('connections')
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.json({
        success: true,
        data: null,
        message: 'No active prescriber'
      });
    }
    
    const connection = connectionSnapshot.docs[0].data();
    const prescriberDoc = await db.collection('users').doc(connection.prescriberId).get();
    
    if (!prescriberDoc.exists) {
      return res.json({
        success: true,
        data: null,
        message: 'Prescriber not found'
      });
    }
    
    const prescriberData = prescriberDoc.data();
    
    console.log('✅ [PATIENT] Prescriber found:', prescriberData.displayName);
    
    res.json({
      success: true,
      data: {
        id: prescriberDoc.id,
        displayName: prescriberData.displayName,
        email: prescriberData.email,
        specialty: prescriberData.specialty,
        clinicName: prescriberData.clinicName,
        registrationNumber: prescriberData.registrationNumber,
        connectionDate: connection.createdAt
      }
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error fetching prescriber:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patient/dietPlan
 * Ver plano alimentar ativo
 */
router.get('/dietPlan', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
    console.log('📋 [PATIENT] Fetching diet plan for:', patientId);
    
    const planSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (planSnapshot.empty) {
      return res.json({
        success: true,
        data: null,
        message: 'No active diet plan'
      });
    }
    
    const plan = planSnapshot.docs[0].data();
    
    console.log('✅ [PATIENT] Diet plan found:', plan.name);
    
    res.json({
      success: true,
      data: {
        id: planSnapshot.docs[0].id,
        ...plan
      }
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error fetching diet plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patient/dietPlans/history
 * Ver histórico de planos alimentares
 */
router.get('/dietPlans/history', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
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
    console.error('❌ [PATIENT] Error fetching diet plans history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patient/connections
 * Listar todas as conexões (ativas e pendentes)
 */
router.get('/connections', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
    const connectionsSnapshot = await db.collection('connections')
      .where('patientId', '==', patientId)
      .get();
    
    const connections = connectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error fetching connections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patient/connections/:connectionId/accept
 * Aceitar convite de prescritor
 */
router.post('/connections/:connectionId/accept', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const patientId = req.user.uid;
    
    console.log('✅ [PATIENT] Accepting connection:', connectionId);
    
    const connectionRef = db.collection('connections').doc(connectionId);
    const connectionDoc = await connectionRef.get();
    
    if (!connectionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }
    
    const connection = connectionDoc.data();
    
    // Verificar se é o paciente correto
    if (connection.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized - this connection is not for you'
      });
    }
    
    // Verificar se já não está ativo
    if (connection.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Connection is already active'
      });
    }
    
    // Atualizar status
    await connectionRef.update({
      status: 'active',
      acceptedAt: new Date()
    });
    
    console.log('✅ [PATIENT] Connection accepted successfully');
    
    res.json({
      success: true,
      message: 'Connection accepted successfully'
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error accepting connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/patient/connections/:connectionId/reject
 * Rejeitar convite de prescritor
 */
router.post('/connections/:connectionId/reject', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const patientId = req.user.uid;
    
    console.log('❌ [PATIENT] Rejecting connection:', connectionId);
    
    const connectionRef = db.collection('connections').doc(connectionId);
    const connectionDoc = await connectionRef.get();
    
    if (!connectionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }
    
    const connection = connectionDoc.data();
    
    if (connection.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    await connectionRef.update({
      status: 'inactive',
      rejectedAt: new Date()
    });
    
    console.log('✅ [PATIENT] Connection rejected');
    
    res.json({
      success: true,
      message: 'Connection rejected'
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error rejecting connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/patient/meals/today
 * Ver refeições do dia (incluindo prescritas)
 */
router.get('/meals/today', async (req, res) => {
  try {
    const patientId = req.user.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Buscar refeições registradas
    const mealsSnapshot = await db.collection('meals')
      .where('userId', '==', patientId)
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .get();
    
    const meals = mealsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Buscar plano ativo
    const planSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    let prescribedMeals = [];
    if (!planSnapshot.empty) {
      prescribedMeals = planSnapshot.docs[0].data().meals || [];
    }
    
    res.json({
      success: true,
      data: {
        registeredMeals: meals,
        prescribedMeals: prescribedMeals
      }
    });
  } catch (error) {
    console.error('❌ [PATIENT] Error fetching today meals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

