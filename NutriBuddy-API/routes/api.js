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

module.exports = router;

