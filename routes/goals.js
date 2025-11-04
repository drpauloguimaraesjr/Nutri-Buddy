const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

/**
 * Get user's nutritional goals
 * GET /api/goals
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const goalsDoc = await db.collection('goals').doc(userId).get();

    if (!goalsDoc.exists) {
      // Return default goals
      return res.json({
        success: true,
        data: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fats: 65,
          water: 2500,
        },
      });
    }

    res.json({
      success: true,
      data: goalsDoc.data(),
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
      message: error.message,
    });
  }
});

/**
 * Create or update user's nutritional goals
 * POST /api/goals
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const goalsData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('goals').doc(userId).set(goalsData, { merge: true });

    res.json({
      success: true,
      message: 'Goals updated successfully',
    });
  } catch (error) {
    console.error('Error updating goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goals',
      message: error.message,
    });
  }
});

/**
 * Calculate TDEE and suggested goals
 * POST /api/goals/calculate
 */
router.post('/calculate', verifyToken, async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height * 100 - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height * 100 - 5 * age - 161;
    }

    const tdee = bmr * activityLevel;

    // Adjust based on goal
    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = tdee - 500; // 500 cal deficit
    } else if (goal === 'gain') {
      targetCalories = tdee + 300; // 300 cal surplus
    }

    // Calculate macros (40% carbs, 30% protein, 30% fat)
    const protein = (targetCalories * 0.3) / 4;
    const carbs = (targetCalories * 0.4) / 4;
    const fats = (targetCalories * 0.3) / 9;

    res.json({
      success: true,
      data: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
        water: 2500, // Default water goal
      },
    });
  } catch (error) {
    console.error('Error calculating goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate goals',
      message: error.message,
    });
  }
});

module.exports = router;

