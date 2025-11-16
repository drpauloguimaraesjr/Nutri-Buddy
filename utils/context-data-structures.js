/**
 * ESTRUTURAS DE DADOS PARA CONTEXTO CONVERSACIONAL
 * Sistema evolutivo e extensível
 */

// ============================================================================
// TIPOS DE CONTEXTO
// ============================================================================

const ContextTypes = {
  MEAL_LOGGING: 'meal_logging',
  WEIGHT_TRACKING: 'weight_tracking',
  SYMPTOM_REPORTING: 'symptom_reporting',
  GOAL_SETTING: 'goal_setting',
  EXERCISE_LOGGING: 'exercise_logging',
  WATER_TRACKING: 'water_tracking',
  // Adicione novos tipos aqui conforme evolução
};

const ContextStatus = {
  COLLECTING: 'collecting',    // Coletando informações
  CONFIRMING: 'confirming',    // Aguardando confirmação
  COMPLETED: 'completed',      // Finalizado
  CANCELLED: 'cancelled',      // Cancelado pelo usuário
};

// ============================================================================
// CONVERSATION CONTEXT (Base)
// ============================================================================

class ConversationContext {
  constructor(conversationId, patientId, prescriberId) {
    this.conversationId = conversationId;
    this.patientId = patientId;
    this.prescriberId = prescriberId;
    this.currentContext = null;
    this.history = [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h
  }

  setContext(type, data) {
    // Arquivar contexto anterior se existir
    if (this.currentContext) {
      this.history.push({
        ...this.currentContext,
        completedAt: new Date().toISOString()
      });
    }

    this.currentContext = {
      type,
      status: ContextStatus.COLLECTING,
      data,
      startedAt: new Date().toISOString()
    };
    this.updatedAt = new Date().toISOString();
  }

  updateContext(updates) {
    if (!this.currentContext) {
      throw new Error('No active context to update');
    }

    this.currentContext.data = {
      ...this.currentContext.data,
      ...updates
    };
    this.updatedAt = new Date().toISOString();
  }

  updateStatus(status) {
    if (!this.currentContext) {
      throw new Error('No active context to update');
    }

    this.currentContext.status = status;
    this.updatedAt = new Date().toISOString();
  }

  completeContext() {
    if (!this.currentContext) {
      throw new Error('No active context to complete');
    }

    this.currentContext.status = ContextStatus.COMPLETED;
    this.history.push({
      ...this.currentContext,
      completedAt: new Date().toISOString()
    });
    this.currentContext = null;
    this.updatedAt = new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  refreshExpiration() {
    this.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }

  toJSON() {
    return {
      conversationId: this.conversationId,
      patientId: this.patientId,
      prescriberId: this.prescriberId,
      currentContext: this.currentContext,
      history: this.history,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt
    };
  }
}

// ============================================================================
// MEAL LOGGING CONTEXT (Específico)
// ============================================================================

class MealLoggingContext {
  constructor(photoUrl = null) {
    this.mealType = null; // breakfast | lunch | dinner | snack
    this.startedAt = new Date().toISOString();
    this.photoUrl = photoUrl;
    this.foods = [];
    this.totalMacros = {
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0
    };
    this.conversationFlow = [];
    this.pendingQuestion = null;
    this.awaitingResponse = false;
  }

  addFood(food) {
    const foodItem = {
      id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: food.name,
      weight_grams: food.weight_grams,
      confidence: food.confidence || 'medium',
      source: food.source || 'user_input',
      macros: food.macros,
      addedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    this.foods.push(foodItem);
    this.recalculateTotals();
    
    this.addFlowStep('food_added', {
      food_name: food.name,
      weight: food.weight_grams
    });

    return foodItem;
  }

  updateFood(foodId, updates) {
    const foodIndex = this.foods.findIndex(f => f.id === foodId);
    if (foodIndex === -1) {
      throw new Error(`Food with id ${foodId} not found`);
    }

    this.foods[foodIndex] = {
      ...this.foods[foodIndex],
      ...updates,
      modifiedAt: new Date().toISOString()
    };
    this.recalculateTotals();
    
    this.addFlowStep('food_updated', {
      food_id: foodId,
      updates
    });
  }

  removeFood(foodId) {
    const foodIndex = this.foods.findIndex(f => f.id === foodId);
    if (foodIndex === -1) {
      throw new Error(`Food with id ${foodId} not found`);
    }

    const removed = this.foods.splice(foodIndex, 1)[0];
    this.recalculateTotals();
    
    this.addFlowStep('food_removed', {
      food_name: removed.name
    });

    return removed;
  }

  recalculateTotals() {
    this.totalMacros = this.foods.reduce((totals, food) => ({
      protein: totals.protein + (food.macros.protein || 0),
      carbs: totals.carbs + (food.macros.carbs || 0),
      fats: totals.fats + (food.macros.fats || 0),
      calories: totals.calories + (food.macros.calories || 0)
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

    // Arredondar para 2 casas decimais
    this.totalMacros.protein = Math.round(this.totalMacros.protein * 100) / 100;
    this.totalMacros.carbs = Math.round(this.totalMacros.carbs * 100) / 100;
    this.totalMacros.fats = Math.round(this.totalMacros.fats * 100) / 100;
    this.totalMacros.calories = Math.round(this.totalMacros.calories * 100) / 100;
  }

  addFlowStep(step, data = {}) {
    this.conversationFlow.push({
      step,
      timestamp: new Date().toISOString(),
      data
    });
  }

  setPendingQuestion(question) {
    this.pendingQuestion = question;
    this.awaitingResponse = true;
  }

  clearPendingQuestion() {
    this.pendingQuestion = null;
    this.awaitingResponse = false;
  }

  getSummary() {
    return {
      mealType: this.mealType,
      foodCount: this.foods.length,
      foods: this.foods.map(f => ({
        name: f.name,
        weight: f.weight_grams,
        macros: f.macros
      })),
      totalMacros: this.totalMacros,
      photoUrl: this.photoUrl
    };
  }

  toJSON() {
    return {
      mealType: this.mealType,
      startedAt: this.startedAt,
      photoUrl: this.photoUrl,
      foods: this.foods,
      totalMacros: this.totalMacros,
      conversationFlow: this.conversationFlow,
      pendingQuestion: this.pendingQuestion,
      awaitingResponse: this.awaitingResponse
    };
  }
}

// ============================================================================
// MEAL LOG (Registro Final)
// ============================================================================

class MealLog {
  constructor(patientId, prescriberId, conversationId, mealContext) {
    this.id = `meal_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.patientId = patientId;
    this.prescriberId = prescriberId;
    this.conversationId = conversationId;
    this.mealType = mealContext.mealType;
    this.timestamp = new Date().toISOString();
    this.photoUrl = mealContext.photoUrl;
    this.foods = mealContext.foods.map(f => ({
      name: f.name,
      weight_grams: f.weight_grams,
      macros: f.macros,
      source: f.source
    }));
    this.totalMacros = mealContext.totalMacros;
    this.adherence = null; // Será preenchido depois
    this.notes = 'Refeição registrada via chat com IA';
    this.createdAt = new Date().toISOString();
  }

  setAdherence(adherenceData) {
    this.adherence = {
      score: adherenceData.score,
      approvedFoods: adherenceData.approvedFoods || [],
      unapprovedFoods: adherenceData.unapprovedFoods || []
    };
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      prescriberId: this.prescriberId,
      conversationId: this.conversationId,
      mealType: this.mealType,
      timestamp: this.timestamp,
      photoUrl: this.photoUrl,
      foods: this.foods,
      totalMacros: this.totalMacros,
      adherence: this.adherence,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcular macros de um alimento baseado em peso e tabela nutricional
 */
function calculateMacros(foodName, weightGrams, nutritionTable) {
  const baseNutrition = nutritionTable[foodName.toLowerCase()];
  if (!baseNutrition) {
    throw new Error(`Nutrition data not found for: ${foodName}`);
  }

  const factor = weightGrams / 100; // Tabela é por 100g

  return {
    protein: Math.round(baseNutrition.protein * factor * 100) / 100,
    carbs: Math.round(baseNutrition.carbs * factor * 100) / 100,
    fats: Math.round(baseNutrition.fats * factor * 100) / 100,
    calories: Math.round(baseNutrition.calories * factor * 100) / 100
  };
}

/**
 * Detectar tipo de refeição baseado no horário
 */
function detectMealType(timestamp = new Date()) {
  const hour = new Date(timestamp).getHours();
  
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'snack';
  if (hour >= 18 && hour < 23) return 'dinner';
  
  return 'snack';
}

/**
 * Validar contexto antes de salvar
 */
function validateMealContext(mealContext) {
  const errors = [];

  if (!mealContext.foods || mealContext.foods.length === 0) {
    errors.push('Meal must have at least one food item');
  }

  if (!mealContext.totalMacros || mealContext.totalMacros.calories === 0) {
    errors.push('Total macros must be calculated');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ContextTypes,
  ContextStatus,
  ConversationContext,
  MealLoggingContext,
  MealLog,
  calculateMacros,
  detectMealType,
  validateMealContext
};

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

/*
// 1. Criar contexto de conversa
const context = new ConversationContext(
  'conv_123',
  'patient_456',
  'prescriber_789'
);

// 2. Iniciar contexto de refeição
const mealContext = new MealLoggingContext('https://photo.url');
mealContext.mealType = detectMealType();

// 3. Adicionar alimento (da análise de foto)
mealContext.addFood({
  name: 'Torta de frango',
  weight_grams: 200,
  confidence: 'high',
  source: 'vision_analysis',
  macros: { protein: 20, carbs: 30, fats: 15, calories: 350 }
});

// 4. Usuário corrige peso
const food = mealContext.foods[0];
mealContext.updateFood(food.id, {
  weight_grams: 325,
  source: 'user_correction',
  macros: { protein: 32.5, carbs: 48.75, fats: 24.375, calories: 568.75 }
});

// 5. Usuário adiciona mais alimento
mealContext.addFood({
  name: 'Arroz integral',
  weight_grams: 100,
  source: 'user_input',
  macros: { protein: 2.6, carbs: 23, fats: 0.9, calories: 111 }
});

// 6. Salvar contexto
context.setContext(ContextTypes.MEAL_LOGGING, mealContext.toJSON());

// 7. Validar antes de registrar
const validation = validateMealContext(mealContext);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// 8. Criar registro final
const mealLog = new MealLog(
  'patient_456',
  'prescriber_789',
  'conv_123',
  mealContext
);

mealLog.setAdherence({
  score: 85,
  approvedFoods: ['Torta de frango', 'Arroz integral'],
  unapprovedFoods: []
});

// 9. Salvar no Firestore
await db.collection('mealLogs').doc(mealLog.id).set(mealLog.toJSON());

// 10. Finalizar contexto
context.completeContext();
*/

