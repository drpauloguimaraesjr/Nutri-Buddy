const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

/**
 * Get all exercises for a user
 * GET /api/exercises
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { date, limit = 50 } = req.query;
    const userId = req.user.uid;

    let query = db.collection('exercises').where('userId', '==', userId);

    if (date) {
      query = query.where('date', '==', date);
    }

    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const exercises = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercises',
      message: error.message,
    });
  }
});

/**
 * Create a new exercise
 * POST /api/exercises
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const exerciseData = {
      ...req.body,
      userId,
      source: req.body.source || 'manual',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('exercises').add(exerciseData);

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create exercise',
      message: error.message,
    });
  }
});

/**
 * Update an exercise
 * PUT /api/exercises/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verify ownership
    const exerciseDoc = await db.collection('exercises').doc(id).get();
    if (!exerciseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found',
      });
    }

    if (exerciseDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await db.collection('exercises').doc(id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Exercise updated successfully',
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update exercise',
      message: error.message,
    });
  }
});

/**
 * Delete an exercise
 * DELETE /api/exercises/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verify ownership
    const exerciseDoc = await db.collection('exercises').doc(id).get();
    if (!exerciseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found',
      });
    }

    if (exerciseDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await db.collection('exercises').doc(id).delete();

    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete exercise',
      message: error.message,
    });
  }
});

module.exports = router;

