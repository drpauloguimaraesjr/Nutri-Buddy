/**
 * Rotas de Receitas
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/**
 * POST /api/recipes
 * Cria nova receita
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      servings,
      prepTime,
      cookTime,
      category,
      ingredients,
      instructions,
      imageUrl,
      tags
    } = req.body;

    if (!userId || !name || !ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userId, name e ingredients são obrigatórios'
      });
    }

    // Calcular valores nutricionais totais
    const nutrition = calculateNutrition(ingredients);

    const recipeData = {
      userId,
      name,
      description: description || '',
      servings: parseInt(servings) || 1,
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      totalTime: (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0),
      category: category || 'Outros',
      ingredients,
      instructions: instructions || [],
      imageUrl: imageUrl || null,
      tags: tags || [],
      nutrition,
      timesUsed: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('recipes').add(recipeData);

    res.json({
      success: true,
      recipe: {
        id: docRef.id,
        ...recipeData
      }
    });

  } catch (error) {
    console.error('Erro ao criar receita:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/recipes
 * Lista receitas do usuário
 */
router.get('/', async (req, res) => {
  try {
    const { userId, category, search, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    let query = db.collection('recipes').where('userId', '==', userId);

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();

    let recipes = [];
    snapshot.forEach(doc => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filtro de busca (se fornecido)
    if (search) {
      const searchLower = search.toLowerCase();
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        (r.description && r.description.toLowerCase().includes(searchLower)) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    res.json({
      success: true,
      recipes,
      total: recipes.length
    });

  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/recipes/:id
 * Obtém receita específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const doc = await db.collection('recipes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Receita não encontrada'
      });
    }

    const recipe = doc.data();

    if (recipe.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    res.json({
      success: true,
      recipe: {
        id: doc.id,
        ...recipe
      }
    });

  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/recipes/:id
 * Atualiza receita
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ingredients, ...updates } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('recipes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Receita não encontrada'
      });
    }

    const recipe = doc.data();

    if (recipe.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    // Recalcular nutrição se ingredientes mudarem
    let nutrition = recipe.nutrition;
    if (ingredients && ingredients.length > 0) {
      nutrition = calculateNutrition(ingredients);
      updates.ingredients = ingredients;
    }

    const updatedData = {
      ...updates,
      nutrition,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedData);

    res.json({
      success: true,
      recipe: {
        id: doc.id,
        ...recipe,
        ...updatedData
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/recipes/:id
 * Remove receita
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('recipes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Receita não encontrada'
      });
    }

    const recipe = doc.data();

    if (recipe.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Receita removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover receita:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/recipes/:id/use
 * Marca receita como usada e cria refeição proporcional
 */
router.post('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, servingsUsed, mealType } = req.body;

    if (!userId || !servingsUsed) {
      return res.status(400).json({
        success: false,
        error: 'userId e servingsUsed são obrigatórios'
      });
    }

    const docRef = db.collection('recipes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Receita não encontrada'
      });
    }

    const recipe = doc.data();

    if (recipe.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    // Incrementar contador de uso
    await docRef.update({
      timesUsed: (recipe.timesUsed || 0) + 1,
      lastUsed: new Date().toISOString()
    });

    // Calcular valores proporcionais
    const ratio = parseFloat(servingsUsed) / recipe.servings;
    const proportionalNutrition = {
      calories: Math.round(recipe.nutrition.calories * ratio),
      protein: Math.round(recipe.nutrition.protein * ratio),
      carbs: Math.round(recipe.nutrition.carbs * ratio),
      fat: Math.round(recipe.nutrition.fat * ratio)
    };

    // Criar refeição baseada na receita
    const mealData = {
      userId,
      name: recipe.name,
      description: `${servingsUsed} porção(ões) de ${recipe.name}`,
      type: mealType || 'Almoço',
      date: new Date().toISOString().split('T')[0],
      totalCalories: proportionalNutrition.calories,
      protein: proportionalNutrition.protein,
      carbs: proportionalNutrition.carbs,
      fat: proportionalNutrition.fat,
      recipeId: id,
      servingsUsed: parseFloat(servingsUsed),
      createdAt: new Date().toISOString()
    };

    const mealRef = await db.collection('meals').add(mealData);

    res.json({
      success: true,
      meal: {
        id: mealRef.id,
        ...mealData
      },
      nutrition: proportionalNutrition
    });

  } catch (error) {
    console.error('Erro ao usar receita:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/recipes/:id/favorite
 * Marca/desmarca receita como favorita
 */
router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isFavorite } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const docRef = db.collection('recipes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Receita não encontrada'
      });
    }

    const recipe = doc.data();

    if (recipe.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    await docRef.update({
      isFavorite: Boolean(isFavorite)
    });

    res.json({
      success: true,
      isFavorite: Boolean(isFavorite)
    });

  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Funções auxiliares
 */

function calculateNutrition(ingredients) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  ingredients.forEach(ingredient => {
    totalCalories += ingredient.calories || 0;
    totalProtein += ingredient.protein || 0;
    totalCarbs += ingredient.carbs || 0;
    totalFat += ingredient.fat || 0;
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat)
  };
}

module.exports = router;

