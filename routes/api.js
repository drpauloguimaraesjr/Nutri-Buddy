const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, verifyWebhook, requireAdmin } = require('../middleware/auth');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NutriBuddy API'
  });
});

/**
 * Get nutrition data
 * GET /api/nutrition
 * Optional: query params: userId, date, limit
 */
router.get('/nutrition', verifyToken, async (req, res) => {
  try {
    const { userId, date, limit = 50 } = req.query;
    
    let query = db.collection('nutrition_data');

    if (userId) {
      query = query.where('userId', '==', userId);
    }
    if (date) {
      query = query.where('date', '==', date);
    }

    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({
      error: 'Failed to fetch nutrition data',
      message: error.message
    });
  }
});

/**
 * Create nutrition record
 * POST /api/nutrition
 */
router.post('/nutrition', verifyToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('nutrition_data').add(data);
    
    res.status(201).json({
      success: true,
      message: 'Nutrition record created',
      id: docRef.id
    });
  } catch (error) {
    console.error('Error creating nutrition record:', error);
    res.status(500).json({
      error: 'Failed to create nutrition record',
      message: error.message
    });
  }
});

/**
 * Webhook endpoint for N8N
 * POST /api/webhook
 */
router.post('/webhook', verifyWebhook, async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    
    // Process webhook data
    const { event, data } = req.body;

    // Save to Firestore if needed
    if (event && data) {
      await db.collection('webhook_events').add({
        event,
        data,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      received: req.body
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

/**
 * Get user data
 * GET /api/user
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      error: 'Failed to fetch user data',
      message: error.message
    });
  }
});

/**
 * Update user data
 * PUT /api/user
 */
router.put('/user', verifyToken, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    
    await userRef.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

/**
 * Get meals
 * GET /api/meals
 */
router.get('/meals', verifyToken, async (req, res) => {
  try {
    const { userId, date, mealType } = req.query;
    
    let query = db.collection('meals').where('userId', '==', userId || req.user.uid);

    if (date) {
      query = query.where('date', '==', date);
    }
    if (mealType) {
      query = query.where('mealType', '==', mealType);
    }

    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      error: 'Failed to fetch meals',
      message: error.message
    });
  }
});

/**
 * Create meal
 * POST /api/meals
 */
router.post('/meals', verifyToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('meals').add(data);
    
    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      error: 'Failed to create meal',
      message: error.message
    });
  }
});

/**
 * Get Firebase ID token for N8N
 * GET /api/get-token
 * Returns an ID token that can be used in Authorization header
 */
router.get('/get-token', async (req, res) => {
  console.log('🔑 [GET-TOKEN] Request received');

  try {
    console.log('🔑 [GET-TOKEN] Loading Firebase config...');
    const { auth } = require('../config/firebase');
    
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    console.log('🔑 [GET-TOKEN] Firebase Auth loaded successfully');
    
    // Email do usuário de teste para N8N
    const testEmail = 'n8n-test@nutribuddy.com';
    let user;
    
    console.log(`🔑 [GET-TOKEN] Checking for user: ${testEmail}`);
    
    try {
      console.log('🔑 [GET-TOKEN] Attempting getUserByEmail...');
      user = await auth.getUserByEmail(testEmail);
      console.log('✅ [GET-TOKEN] User found:', user.uid);
    } catch (error) {
      console.log('ℹ️ [GET-TOKEN] User not found, creating new user...');
      console.log('🔑 [GET-TOKEN] Error:', error.message);
      
      // Criar usuário se não existir
      try {
        user = await auth.createUser({
          email: testEmail,
          password: 'TempPassword123!',
          displayName: 'N8N Test User',
          emailVerified: true
        });
        console.log('✅ [GET-TOKEN] User created:', user.uid);
      } catch (createError) {
        console.error('❌ [GET-TOKEN] Error creating user:', createError.message);
        throw createError;
      }
    }
    
    console.log('🔑 [GET-TOKEN] Generating custom token for:', user.uid);
    
    // Gerar custom token
    const customToken = await auth.createCustomToken(user.uid);
    
    console.log('✅ [GET-TOKEN] Token generated successfully');
    
    // Retornar resposta
    res.json({
      success: true,
      message: 'Custom token generated. Use this token in N8N.',
      customToken: customToken,
      userId: user.uid,
      email: user.email,
      instructions: {
        step1: 'Copy the customToken above',
        step2: 'In N8N, set FIREBASE_TOKEN to this customToken',
        step3: 'Use as: Authorization: Bearer YOUR_CUSTOM_TOKEN',
        note: 'This token does not expire and is safe for server-to-server'
      }
    });
    
    console.log('✅ [GET-TOKEN] Response sent successfully');
    
  } catch (error) {
    console.error('❌ [GET-TOKEN] Error:', error.message);
    console.error('❌ [GET-TOKEN] Stack:', error.stack);
    
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message,
      details: error.code || 'Unknown error'
    });
  }
});

/**
 * Prescriber endpoints
 */

/**
 * Get prescriber's patients
 * GET /api/prescriber/patients
 */
router.get('/prescriber/patients', verifyToken, async (req, res) => {
  try {
    // Verify user is a prescriber
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists() || userDoc.data().role !== 'prescriber') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Apenas prescritores podem acessar este endpoint'
      });
    }

    // Get patients where prescriberId matches
    const patientsSnapshot = await db.collection('users')
      .where('prescriberId', '==', req.user.uid)
      .get();

    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching prescriber patients:', error);
    res.status(500).json({
      error: 'Failed to fetch patients',
      message: error.message
    });
  }
});

/**
 * Add patient to prescriber
 * POST /api/prescriber/patients
 */
router.post('/prescriber/patients', verifyToken, async (req, res) => {
  try {
    // Verify user is a prescriber
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists() || userDoc.data().role !== 'prescriber') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Apenas prescritores podem acessar este endpoint'
      });
    }

    const { patientEmail, patientId } = req.body;

    if (!patientEmail && !patientId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'patientEmail ou patientId é obrigatório'
      });
    }

    let patientRef;
    if (patientId) {
      patientRef = db.collection('users').doc(patientId);
    } else {
      // Find patient by email
      const patientsSnapshot = await db.collection('users')
        .where('email', '==', patientEmail)
        .limit(1)
        .get();

      if (patientsSnapshot.empty) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Paciente não encontrado'
        });
      }

      patientRef = db.collection('users').doc(patientsSnapshot.docs[0].id);
    }

    const patientDoc = await patientRef.get();
    if (!patientDoc.exists()) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Paciente não encontrado'
      });
    }

    const patientData = patientDoc.data();
    if (patientData.role !== 'patient') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Usuário não é um paciente'
      });
    }

    // Update patient with prescriberId
    await patientRef.update({
      prescriberId: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Paciente adicionado com sucesso',
      patientId: patientRef.id
    });
  } catch (error) {
    console.error('Error adding patient to prescriber:', error);
    res.status(500).json({
      error: 'Failed to add patient',
      message: error.message
    });
  }
});

/**
 * Get patient requests (pending approvals)
 * GET /api/prescriber/requests
 */
router.get('/prescriber/requests', verifyToken, async (req, res) => {
  try {
    // Verify user is a prescriber
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists() || userDoc.data().role !== 'prescriber') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Apenas prescritores podem acessar este endpoint'
      });
    }

    // Get patient requests where prescriberId matches and status is pending
    const requestsSnapshot = await db.collection('patient_requests')
      .where('prescriberId', '==', req.user.uid)
      .where('status', '==', 'pending')
      .get();

    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching patient requests:', error);
    res.status(500).json({
      error: 'Failed to fetch requests',
      message: error.message
    });
  }
});

/**
 * Approve or reject patient request
 * POST /api/prescriber/requests/:requestId/approve
 * POST /api/prescriber/requests/:requestId/reject
 */
router.post('/prescriber/requests/:requestId/:action', verifyToken, async (req, res) => {
  try {
    const { requestId, action } = req.params;

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Action deve ser "approve" ou "reject"'
      });
    }

    // Verify user is a prescriber
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists() || userDoc.data().role !== 'prescriber') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Apenas prescritores podem acessar este endpoint'
      });
    }

    const requestRef = db.collection('patient_requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists()) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Solicitação não encontrada'
      });
    }

    const requestData = requestDoc.data();
    if (requestData.prescriberId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Você não tem permissão para esta solicitação'
      });
    }

    if (action === 'approve') {
      // Update request status
      await requestRef.update({
        status: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update patient with prescriberId
      if (requestData.patientId) {
        await db.collection('users').doc(requestData.patientId).update({
          prescriberId: req.user.uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      res.json({
        success: true,
        message: 'Solicitação aprovada com sucesso'
      });
    } else {
      // Reject request
      await requestRef.update({
        status: 'rejected',
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
        success: true,
        message: 'Solicitação rejeitada'
      });
    }
  } catch (error) {
    console.error('Error processing patient request:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
});

/**
 * Get patient details (for prescriber)
 * GET /api/prescriber/patients/:patientId
 */
router.get('/prescriber/patients/:patientId', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify user is a prescriber
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists() || userDoc.data().role !== 'prescriber') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Apenas prescritores podem acessar este endpoint'
      });
    }

    // Get patient
    const patientDoc = await db.collection('users').doc(patientId).get();
    if (!patientDoc.exists()) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Paciente não encontrado'
      });
    }

    const patientData = patientDoc.data();

    // Verify prescriber has access to this patient
    if (patientData.prescriberId !== req.user.uid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Você não tem acesso a este paciente'
      });
    }

    // Get patient's nutrition data
    const nutritionSnapshot = await db.collection('nutrition_data')
      .where('userId', '==', patientId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    const nutritionData = nutritionSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get patient's meals
    const mealsSnapshot = await db.collection('meals')
      .where('userId', '==', patientId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    const meals = mealsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: {
        patient: {
          id: patientDoc.id,
          ...patientData
        },
        nutrition: nutritionData,
        meals: meals
      }
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({
      error: 'Failed to fetch patient details',
      message: error.message
    });
  }
});

/**
 * Admin endpoints
 */

/**
 * Get system status and health
 * GET /api/admin/status
 */
router.get('/admin/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Get system statistics
    const usersSnapshot = await db.collection('users').get();
    const patientsCount = usersSnapshot.docs.filter(doc => doc.data().role === 'patient').length;
    const prescribersCount = usersSnapshot.docs.filter(doc => doc.data().role === 'prescriber').length;
    const adminsCount = usersSnapshot.docs.filter(doc => doc.data().role === 'admin').length;

    // Get recent activity counts
    const nutritionSnapshot = await db.collection('nutrition_data')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    const mealsSnapshot = await db.collection('meals')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // Check N8N status if configured
    let n8nStatus = null;
    if (process.env.N8N_URL) {
      try {
        const n8nResponse = await fetch(`${process.env.N8N_URL}/healthz`, {
          method: 'GET',
          headers: {
            'X-N8N-API-KEY': process.env.N8N_API_KEY || ''
          }
        });
        n8nStatus = {
          online: n8nResponse.ok,
          url: process.env.N8N_URL
        };
      } catch (error) {
        n8nStatus = {
          online: false,
          error: error.message
        };
      }
    }

    // Check WhatsApp status
    let whatsappStatus = null;
    try {
      const { getWhatsAppService } = require('../services/whatsapp');
      const whatsappService = getWhatsAppService();
      const status = whatsappService.getStatus();
      whatsappStatus = {
        connected: status.connected,
        status: status.status,
        hasQr: status.hasQr,
        qrCode: status.hasQr ? whatsappService.getQrCode() : null
      };
    } catch (error) {
      whatsappStatus = {
        connected: false,
        error: error.message
      };
    }

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        users: {
          total: usersSnapshot.size,
          patients: patientsCount,
          prescribers: prescribersCount,
          admins: adminsCount
        },
        activity: {
          lastNutritionRecord: nutritionSnapshot.empty ? null : nutritionSnapshot.docs[0].data().createdAt?.toDate?.() || null,
          lastMealRecord: mealsSnapshot.empty ? null : mealsSnapshot.docs[0].data().createdAt?.toDate?.() || null
        },
        integrations: {
          n8n: n8nStatus,
          whatsapp: whatsappStatus
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 3000,
          firebaseConfigured: !!process.env.FIREBASE_PROJECT_ID
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin status:', error);
    res.status(500).json({
      error: 'Failed to fetch system status',
      message: error.message
    });
  }
});

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
router.get('/admin/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role, limit = 100 } = req.query;
    
    let query = db.collection('users');
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null
    }));

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

/**
 * Create new prescriber
 * POST /api/admin/prescribers
 */
router.post('/admin/prescribers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, displayName, specialty, registrationNumber, clinicName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email e senha são obrigatórios'
      });
    }

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      
      // User exists, update their role
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'prescriber' });
      
      // Update Firestore
      await db.collection('users').doc(userRecord.uid).set({
        role: 'prescriber',
        specialty,
        registrationNumber,
        clinicName,
        displayName: displayName || userRecord.displayName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.json({
        success: true,
        message: 'Prescritor atualizado com sucesso',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          role: 'prescriber'
        }
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: displayName || email.split('@')[0],
          emailVerified: false
        });

        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'prescriber' });

        // Create Firestore document
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: displayName || userRecord.displayName,
          role: 'prescriber',
          specialty,
          registrationNumber,
          clinicName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
          success: true,
          message: 'Prescritor criado com sucesso',
          data: {
            uid: userRecord.uid,
            email: userRecord.email,
            role: 'prescriber'
          }
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating prescriber:', error);
    res.status(500).json({
      error: 'Failed to create prescriber',
      message: error.message
    });
  }
});

/**
 * Update user role
 * PUT /api/admin/users/:userId/role
 */
router.put('/admin/users/:userId/role', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['patient', 'prescriber', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Role inválido. Deve ser: patient, prescriber ou admin'
      });
    }

    // Update Firebase Auth custom claims
    await admin.auth().setCustomUserClaims(userId, { role });

    // Update Firestore
    await db.collection('users').doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Role atualizado com sucesso',
      data: {
        userId,
        role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

/**
 * Get system statistics
 * GET /api/admin/stats
 */
router.get('/admin/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get user counts by role
    const usersSnapshot = await db.collection('users').get();
    const usersByRole = {
      patient: 0,
      prescriber: 0,
      admin: 0
    };
    
    usersSnapshot.docs.forEach(doc => {
      const role = doc.data().role || 'patient';
      if (usersByRole.hasOwnProperty(role)) {
        usersByRole[role]++;
      }
    });

    // Get recent nutrition records
    const nutritionSnapshot = await db.collection('nutrition_data')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(daysAgo))
      .get();

    // Get recent meals
    const mealsSnapshot = await db.collection('meals')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(daysAgo))
      .get();

    // Get recent webhooks
    const webhooksSnapshot = await db.collection('webhook_events')
      .where('receivedAt', '>=', admin.firestore.Timestamp.fromDate(daysAgo))
      .get();

    res.json({
      success: true,
      data: {
        period: {
          days: parseInt(days),
          startDate: daysAgo.toISOString(),
          endDate: new Date().toISOString()
        },
        users: usersByRole,
        activity: {
          nutritionRecords: nutritionSnapshot.size,
          meals: mealsSnapshot.size,
          webhooks: webhooksSnapshot.size
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

module.exports = router;

