const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db, admin, storage } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Get all meals for a user
 * GET /api/meals
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { date, mealType, limit = 50 } = req.query;
    const userId = req.user.uid;

    let query = db.collection('meals').where('userId', '==', userId);

    if (date) {
      query = query.where('date', '==', date);
    }
    if (mealType) {
      query = query.where('type', '==', mealType);
    }

    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const meals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: meals.length,
      data: meals,
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meals',
      message: error.message,
    });
  }
});

/**
 * Create a new meal
 * POST /api/meals
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const mealData = {
      ...req.body,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('meals').add(mealData);

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      id: docRef.id,
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meal',
      message: error.message,
    });
  }
});

/**
 * Upload meal image/video
 * POST /api/meals/upload
 */
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const userId = req.user.uid;
    const file = req.file;
    const timestamp = Date.now();
    const filename = `meals/${userId}/${timestamp}-${file.originalname}`;

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(filename);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message,
    });
  }
});

/**
 * Analyze meal image or text with AI
 * POST /api/meals/analyze
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { imageUrl, text } = req.body;

    // TODO: Integrate with Google AI Studio or OpenAI
    // For now, return mock data
    const mockAnalysis = {
      foods: [
        {
          name: 'Arroz integral',
          amount: 150,
          unit: 'g',
          calories: 195,
          protein: 4,
          carbs: 41,
          fats: 2,
        },
        {
          name: 'Frango grelhado',
          amount: 120,
          unit: 'g',
          calories: 198,
          protein: 36,
          carbs: 0,
          fats: 6,
        },
      ],
      totalCalories: 393,
      totalProtein: 40,
      totalCarbs: 41,
      totalFats: 8,
    };

    res.json({
      success: true,
      data: mockAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal',
      message: error.message,
    });
  }
});

/**
 * Update a meal
 * PUT /api/meals/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verify ownership
    const mealDoc = await db.collection('meals').doc(id).get();
    if (!mealDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found',
      });
    }

    if (mealDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await db.collection('meals').doc(id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Meal updated successfully',
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meal',
      message: error.message,
    });
  }
});

/**
 * Delete a meal
 * DELETE /api/meals/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verify ownership
    const mealDoc = await db.collection('meals').doc(id).get();
    if (!mealDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found',
      });
    }

    if (mealDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await db.collection('meals').doc(id).delete();

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meal',
      message: error.message,
    });
  }
});

module.exports = router;

