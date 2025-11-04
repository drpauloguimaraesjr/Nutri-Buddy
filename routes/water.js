const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

/**
 * Get today's water intake
 * GET /api/water/today
 */
router.get('/today', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const today = new Date().toISOString().split('T')[0];

    const snapshot = await db
      .collection('water_intake')
      .where('userId', '==', userId)
      .where('date', '==', today)
      .get();

    let totalAmount = 0;
    const entries = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      totalAmount += data.amount;
      entries.push({
        id: doc.id,
        ...data,
      });
    });

    res.json({
      success: true,
      data: {
        date: today,
        totalAmount,
        goal: 2500, // TODO: Get from user profile
        entries,
      },
    });
  } catch (error) {
    console.error('Error fetching water intake:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch water intake',
      message: error.message,
    });
  }
});

/**
 * Add water intake
 * POST /api/water
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { amount } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    const docRef = await db.collection('water_intake').add({
      userId,
      amount,
      date: today,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Water intake recorded',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error recording water intake:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record water intake',
      message: error.message,
    });
  }
});

/**
 * Get water intake history
 * GET /api/water/history
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { startDate, endDate, limit = 30 } = req.query;

    let query = db
      .collection('water_intake')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(parseInt(limit));

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const snapshot = await query.get();

    // Group by date
    const history = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date;

      if (!history[date]) {
        history[date] = {
          date,
          totalAmount: 0,
          entries: [],
        };
      }

      history[date].totalAmount += data.amount;
      history[date].entries.push({
        id: doc.id,
        ...data,
      });
    });

    res.json({
      success: true,
      data: Object.values(history),
    });
  } catch (error) {
    console.error('Error fetching water history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch water history',
      message: error.message,
    });
  }
});

module.exports = router;

