const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, verifyWebhook } = require('../middleware/auth');

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

module.exports = router;

