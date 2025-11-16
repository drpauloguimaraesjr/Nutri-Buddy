const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db, admin } = require('../config/firebase');
const axios = require('axios');

// Importar estruturas de dados para contexto conversacional
const {
  ConversationContext,
  MealLoggingContext,
  MealLog,
  ContextTypes,
  ContextStatus,
  detectMealType,
  validateMealContext
} = require('../utils/context-data-structures');

// N8N Configuration
const N8N_URL = process.env.N8N_URL || process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Get N8N status and configuration
 * GET /api/n8n/status
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const config = {
      n8nUrl: N8N_URL,
      hasApiKey: !!N8N_API_KEY,
      webhookUrl: `${N8N_URL}/webhook`,
    };

    // Try to ping N8N if API key is available
    if (N8N_API_KEY) {
      try {
        const healthResponse = await axios.get(`${N8N_URL}/healthz`, {
          timeout: 5000,
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        });

        config.connected = true;
        config.status = 'online';
        config.version = healthResponse.data?.version || 'unknown';
      } catch (error) {
        config.connected = false;
        config.status = 'offline';
        config.error = error.message;
      }
    } else {
      config.connected = null;
      config.status = 'unknown';
      config.message = 'N8N_API_KEY not configured';
    }

    // Get webhook events count from Firestore
    const webhookEventsSnapshot = await db.collection('webhook_events')
      .orderBy('receivedAt', 'desc')
      .limit(1)
      .get();

    const lastWebhook = webhookEventsSnapshot.empty 
      ? null 
      : {
          id: webhookEventsSnapshot.docs[0].id,
          ...webhookEventsSnapshot.docs[0].data(),
        };

    res.json({
      success: true,
      config,
      lastWebhook,
      instructions: {
        setup: 'Configure N8N_URL and N8N_API_KEY in .env to enable full integration',
        webhook: `Use ${N8N_URL}/webhook to receive webhooks from N8N`,
      },
    });
  } catch (error) {
    console.error('Error fetching N8N status:', error);
    res.status(500).json({
      error: 'Failed to fetch N8N status',
      message: error.message,
    });
  }
});

/**
 * Get webhook events history
 * GET /api/n8n/webhooks
 */
router.get('/webhooks', verifyToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    let query = db.collection('webhook_events')
      .orderBy('receivedAt', 'desc')
      .limit(parseInt(limit));

    // Note: Firestore doesn't support offset directly
    // For pagination, use startAfter with the last document ID
    const snapshot = await query.get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count (approximate)
    const totalSnapshot = await db.collection('webhook_events').count().get();
    const total = totalSnapshot.data().count || 0;

    res.json({
      success: true,
      count: events.length,
      total,
      events,
      pagination: {
        limit: parseInt(limit),
        hasMore: events.length === parseInt(limit),
        lastId: events.length > 0 ? events[events.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({
      error: 'Failed to fetch webhook events',
      message: error.message,
    });
  }
});

/**
 * Get specific webhook event
 * GET /api/n8n/webhooks/:id
 */
router.get('/webhooks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('webhook_events').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Webhook event not found',
      });
    }

    res.json({
      success: true,
      event: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching webhook event:', error);
    res.status(500).json({
      error: 'Failed to fetch webhook event',
      message: error.message,
    });
  }
});

/**
 * Trigger N8N workflow manually
 * POST /api/n8n/trigger
 */
router.post('/trigger', verifyToken, async (req, res) => {
  try {
    const { workflowId, data } = req.body;

    if (!workflowId && !N8N_API_KEY) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'workflowId is required, or configure N8N_API_KEY for webhook trigger',
      });
    }

    // If N8N_API_KEY is configured, try to trigger via API
    if (N8N_API_KEY && workflowId) {
      try {
        const response = await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflowId}/execute`,
          { data: data || {} },
          {
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        return res.json({
          success: true,
          message: 'Workflow triggered successfully',
          executionId: response.data?.executionId,
          data: response.data,
        });
      } catch (error) {
        console.error('Error triggering workflow via API:', error);
        // Fall through to webhook method
      }
    }

    // Fallback: Trigger via webhook (if webhook URL is configured)
    const webhookUrl = `${N8N_URL}/webhook/${workflowId || 'nutribuddy'}`;
    
    try {
      const response = await axios.post(webhookUrl, {
        event: 'manual_trigger',
        data: data || {},
        triggeredBy: req.user.uid,
        timestamp: new Date().toISOString(),
      }, {
        timeout: 30000,
      });

      // Save to Firestore
      await db.collection('webhook_events').add({
        event: 'manual_trigger',
        data: data || {},
        triggeredBy: req.user.uid,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'api',
      });

      res.json({
        success: true,
        message: 'Workflow triggered via webhook',
        webhookUrl,
        data: response.data,
      });
    } catch (error) {
      console.error('Error triggering workflow via webhook:', error);
      res.status(500).json({
        error: 'Failed to trigger workflow',
        message: error.message,
        suggestions: [
          'Check if N8N is running',
          'Verify webhook URL is correct',
          'Ensure workflow is active',
          'Configure N8N_API_KEY for API-based triggering',
        ],
      });
    }
  } catch (error) {
    console.error('Error triggering workflow:', error);
    res.status(500).json({
      error: 'Failed to trigger workflow',
      message: error.message,
    });
  }
});

/**
 * Get N8N workflows (if API key is configured)
 * GET /api/n8n/workflows
 */
router.get('/workflows', verifyToken, async (req, res) => {
  try {
    if (!N8N_API_KEY) {
      return res.json({
        success: true,
        workflows: [],
        message: 'N8N_API_KEY not configured. Configure it in .env to list workflows.',
      });
    }

    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      timeout: 10000,
    });

    const workflows = (response.data?.data || []).map((wf) => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      tags: wf.tags || [],
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
    }));

    res.json({
      success: true,
      count: workflows.length,
      workflows,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: 'Failed to fetch workflows',
      message: error.message,
      suggestion: 'Ensure N8N is running and N8N_API_KEY is correctly configured',
    });
  }
});

/**
 * Get N8N workflow executions
 * GET /api/n8n/executions
 */
router.get('/executions', verifyToken, async (req, res) => {
  try {
    if (!N8N_API_KEY) {
      return res.json({
        success: true,
        executions: [],
        message: 'N8N_API_KEY not configured.',
      });
    }

    const { workflowId, limit = 20 } = req.query;
    const url = workflowId
      ? `${N8N_URL}/api/v1/executions?workflowId=${workflowId}&limit=${limit}`
      : `${N8N_URL}/api/v1/executions?limit=${limit}`;

    const response = await axios.get(url, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      timeout: 10000,
    });

    const executions = (response.data?.data || []).map((exec) => ({
      id: exec.id,
      workflowId: exec.workflowId,
      workflowName: exec.workflow?.name,
      status: exec.finished ? 'finished' : exec.startedAt ? 'running' : 'waiting',
      startedAt: exec.startedAt,
      stoppedAt: exec.stoppedAt,
      finished: exec.finished,
      mode: exec.mode,
    }));

    res.json({
      success: true,
      count: executions.length,
      executions,
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      error: 'Failed to fetch executions',
      message: error.message,
    });
  }
});

/**
 * Test N8N connection
 * GET /api/n8n/test
 */
router.get('/test', verifyToken, async (req, res) => {
  try {
    const results = {
      n8nUrl: N8N_URL,
      hasApiKey: !!N8N_API_KEY,
      tests: [],
    };

    // Test 1: Health check
    if (N8N_API_KEY) {
      try {
        const healthResponse = await axios.get(`${N8N_URL}/healthz`, {
          timeout: 5000,
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        });
        results.tests.push({
          name: 'Health Check',
          status: 'success',
          message: 'N8N is online',
          data: healthResponse.data,
        });
      } catch (error) {
        results.tests.push({
          name: 'Health Check',
          status: 'error',
          message: error.message,
        });
      }
    } else {
      results.tests.push({
        name: 'Health Check',
        status: 'skipped',
        message: 'N8N_API_KEY not configured',
      });
    }

    // Test 2: Webhook endpoint
    try {
      const webhookUrl = `${N8N_URL}/webhook/test`;
      await axios.post(webhookUrl, { test: true }, { timeout: 5000 });
      results.tests.push({
        name: 'Webhook Test',
        status: 'success',
        message: 'Webhook endpoint is accessible',
      });
    } catch (error) {
      results.tests.push({
        name: 'Webhook Test',
        status: 'warning',
        message: error.response?.status === 404 
          ? 'Webhook endpoint not found (workflow may not be active)'
          : error.message,
      });
    }

    // Test 3: Firestore connection
    try {
      const testDoc = await db.collection('webhook_events').limit(1).get();
      results.tests.push({
        name: 'Firestore Connection',
        status: 'success',
        message: `Found ${testDoc.size} webhook events in database`,
      });
    } catch (error) {
      results.tests.push({
        name: 'Firestore Connection',
        status: 'error',
        message: error.message,
      });
    }

    const allSuccess = results.tests.every((t) => t.status === 'success');
    const hasErrors = results.tests.some((t) => t.status === 'error');

    res.json({
      success: !hasErrors,
      overall: allSuccess ? 'all_passed' : hasErrors ? 'has_errors' : 'partial',
      ...results,
    });
  } catch (error) {
    console.error('Error testing N8N connection:', error);
    res.status(500).json({
      error: 'Failed to test N8N connection',
      message: error.message,
    });
  }
});

/**
 * Middleware to verify webhook secret from N8N
 */
const verifyWebhookSecret = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || 'nutribuddy-secret-2024';

  if (!secret || secret !== expectedSecret) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing webhook secret',
    });
  }

  next();
};

/**
 * Update conversation (tags, priority, status) - Called from N8N
 * POST /api/n8n/update-conversation
 * Body: { conversationId, tags, priority, status }
 */
router.post('/update-conversation', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId, tags, priority, status, kanbanColumn } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required',
      });
    }

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (tags) updateData.tags = tags;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (kanbanColumn) updateData.kanbanColumn = kanbanColumn;

    await conversationRef.update(updateData);

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      conversationId,
      updates: updateData,
    });
  } catch (error) {
    console.error('Error updating conversation from N8N:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation',
      message: error.message,
    });
  }
});

/**
 * Mark conversation as urgent - Called from N8N
 * POST /api/n8n/mark-urgent
 * Body: { conversationId, reason }
 */
router.post('/mark-urgent', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId, reason } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required',
      });
    }

    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const updateData = {
      priority: 'high',
      status: 'urgent',
      tags: admin.firestore.FieldValue.arrayUnion('urgente'),
      urgentMarkedAt: new Date(),
      urgentReason: reason || 'Marcado automaticamente pelo N8N',
      updatedAt: new Date(),
    };

    await conversationRef.update(updateData);

    res.json({
      success: true,
      message: 'Conversation marked as urgent',
      conversationId,
      reason: updateData.urgentReason,
    });
  } catch (error) {
    console.error('Error marking conversation as urgent from N8N:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark conversation as urgent',
      message: error.message,
    });
  }
});

/**
 * Send alert notification - Called from N8N
 * POST /api/n8n/send-alert
 * Body: { conversationId, alertType, message, metadata }
 */
router.post('/send-alert', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId, alertType, message, metadata } = req.body;

    if (!conversationId || !alertType) {
      return res.status(400).json({
        success: false,
        error: 'conversationId and alertType are required',
      });
    }

    // Save alert to Firestore
    const alertData = {
      conversationId,
      alertType, // 'urgent', 'sentiment', 'followup', etc.
      message: message || 'Alert from N8N',
      metadata: metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    };

    const alertRef = await db.collection('alerts').add(alertData);

    // Optionally: Send notification to prescriber
    // TODO: Implement push notification or email here

    res.json({
      success: true,
      message: 'Alert sent successfully',
      alertId: alertRef.id,
      alert: alertData,
    });
  } catch (error) {
    console.error('Error sending alert from N8N:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send alert',
      message: error.message,
    });
  }
});

/**
 * POST /api/n8n/update-diet
 * Recebe dados da dieta transcrita pelo n8n
 */
router.post('/update-diet', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId, meals, macros, notes, fullText, transcriptionStatus } = req.body;
    
    console.log('📄 [N8N] Atualizando dieta transcrita:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    const userRef = db.collection('users').doc(patientId);
    
    await userRef.update({
      dietPlanText: fullText || notes || '',
      dietMeals: meals || [],
      dietMacros: macros || {},
      planTranscriptionStatus: transcriptionStatus || 'completed',
      planUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ [N8N] Dieta salva com sucesso');
    
    res.json({
      success: true,
      message: 'Dieta transcrita e salva com sucesso',
      patientId
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar dieta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/update-inbody
 * Recebe dados da InBody transcrita pelo n8n
 */
router.post('/update-inbody', verifyWebhookSecret, async (req, res) => {
  try {
    const { 
      patientId, 
      weight, 
      height, 
      bodyFat, 
      leanMass, 
      fatMass, 
      bodyWater,
      bmi,
      visceralFat,
      basalMetabolicRate,
      measurements,
      muscleDistribution,
      date,
      notes,
      transcriptionStatus 
    } = req.body;
    
    console.log('📊 [N8N] Atualizando InBody transcrita:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    const userRef = db.collection('users').doc(patientId);
    
    // Atualizar dados do paciente
    const updateData = {
      inbodyTranscriptionStatus: transcriptionStatus || 'completed',
      bodyUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Adicionar apenas campos que existem
    if (weight) updateData.weight = weight;
    if (height) updateData.height = height;
    if (bodyFat) updateData.bodyFat = bodyFat;
    if (leanMass) updateData.leanMass = leanMass;
    if (fatMass) updateData.fatMass = fatMass;
    if (bodyWater) updateData.bodyWater = bodyWater;
    if (bmi) updateData.bmi = bmi;
    if (visceralFat) updateData.visceralFat = visceralFat;
    if (basalMetabolicRate) updateData.basalMetabolicRate = basalMetabolicRate;
    if (measurements) updateData.measurements = measurements;
    if (muscleDistribution) updateData.muscleDistribution = muscleDistribution;
    if (notes) updateData.inbodyNotes = notes;
    
    await userRef.update(updateData);
    
    // Adicionar no histórico de medições
    if (weight || bodyFat) {
      const historyRef = userRef.collection('bodyHistory');
      await historyRef.add({
        weight: weight || null,
        bodyFat: bodyFat || null,
        measurements: measurements || null,
        source: 'inbody_770',
        date: date || new Date().toISOString().split('T')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ [N8N] InBody salva com sucesso');
    
    res.json({
      success: true,
      message: 'InBody transcrita e salva com sucesso',
      patientId,
      data: updateData
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar InBody:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/update-diet-complete
 * Recebe dados COMPLETOS da dieta transcrita pelo n8n com GPT-4o/Gemini
 * Salva na collection dietPlans (plano de dieta estruturado)
 * Requer: X-Webhook-Secret header
 */
router.post('/update-diet-complete', verifyWebhookSecret, async (req, res) => {
  try {
    const { 
      patientId, 
      diet,
      transcriptionStatus,
      transcribedAt,
      model,
      resumo
    } = req.body;
    
    console.log('🎯 [N8N] Salvando dieta COMPLETA estruturada:', patientId, '| Model:', model || 'gpt-4o-vision');
    
    // Validação 1: patientId obrigatório
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    // Validação 2: diet obrigatório
    if (!diet) {
      return res.status(400).json({
        success: false,
        error: 'diet é obrigatório'
      });
    }
    
    // Buscar paciente (verificar se existe em users ou patients)
    let patientRef = db.collection('patients').doc(patientId);
    let patientDoc = await patientRef.get();
    
    // Se não existir em patients, tentar em users (compatibilidade)
    if (!patientDoc.exists) {
      patientRef = db.collection('users').doc(patientId);
      patientDoc = await patientRef.get();
      
      if (!patientDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Paciente não encontrado',
          patientId
        });
      }
    }
    
    // Passo 1: Desativar planos de dieta anteriores do paciente
    const existingPlansSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();
    
    if (!existingPlansSnapshot.empty) {
      console.log(`⚠️ [N8N] Desativando ${existingPlansSnapshot.size} plano(s) anterior(es)`);
      
      const batch = db.batch();
      existingPlansSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          isActive: false, 
          deactivatedAt: new Date()
        });
      });
      await batch.commit();
    }
    
    // Passo 2: Estruturar dados do novo dietPlan
    const dietPlanData = {
      // Identificação
      patientId,
      name: diet.meta?.objetivo 
        ? `Plano ${diet.meta.objetivo.charAt(0).toUpperCase() + diet.meta.objetivo.slice(1)}`
        : 'Plano Alimentar',
      description: diet.meta?.nutricionista 
        ? `Plano criado por ${diet.meta.nutricionista} - ${diet.meta.caloriasDiarias || 0} kcal/dia`
        : `Plano alimentar de ${diet.meta?.caloriasDiarias || 0} kcal/dia`,
      
      // Refeições (array completo)
      meals: diet.refeicoes || [],
      
      // Macronutrientes diários
      dailyProtein: diet.macronutrientes?.proteinas?.gramas || 0,
      dailyCarbs: diet.macronutrientes?.carboidratos?.gramas || 0,
      dailyFats: diet.macronutrientes?.gorduras?.gramas || 0,
      dailyCalories: diet.meta?.caloriasDiarias || 0,
      
      // Status
      isActive: true,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Metadados completos
      metadata: {
        // Meta informações da dieta
        meta: diet.meta || {},
        
        // Macronutrientes detalhados
        macronutrientes: diet.macronutrientes || {},
        
        // Micronutrientes
        micronutrientes: diet.micronutrientes || [],
        
        // Observações
        observacoes: diet.observacoes || [],
        
        // Substituições (se houver)
        substituicoes: diet.substituicoes || [],
        
        // Status da transcrição
        transcriptionStatus: transcriptionStatus || 'completed',
        transcribedAt: transcribedAt || new Date().toISOString(),
        model: model || 'gpt-4o-vision',
        
        // Resumo executivo
        resumo: resumo || {
          totalCalorias: diet.meta?.caloriasDiarias || 0,
          totalRefeicoes: diet.refeicoes?.length || 0,
          totalAlimentos: diet.refeicoes?.reduce((acc, ref) => acc + (ref.alimentos?.length || 0), 0) || 0,
          objetivo: diet.meta?.objetivo || 'não especificado'
        }
      }
    };
    
    // Passo 3: Criar novo dietPlan
    const dietPlanRef = await db.collection('dietPlans').add(dietPlanData);
    
    console.log('✅ [N8N] Dieta COMPLETA salva com sucesso:', {
      dietPlanId: dietPlanRef.id,
      patientId,
      name: dietPlanData.name,
      calorias: dietPlanData.dailyCalories,
      refeicoes: dietPlanData.meals.length,
      model: dietPlanData.metadata.model
    });
    
    // Passo 4: Retornar sucesso com resumo
    res.json({
      success: true,
      dietPlanId: dietPlanRef.id,
      resumo: {
        name: dietPlanData.name,
        totalCalorias: dietPlanData.dailyCalories,
        totalRefeicoes: dietPlanData.meals.length,
        totalAlimentos: dietPlanData.metadata.resumo.totalAlimentos,
        objetivo: dietPlanData.metadata.resumo.objetivo,
        macros: {
          proteinas: dietPlanData.dailyProtein,
          carboidratos: dietPlanData.dailyCarbs,
          gorduras: dietPlanData.dailyFats
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar dieta completa estruturada:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao salvar dieta',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/n8n/patients/:patientId/diet
 * Buscar dieta ativa do paciente (para workflow de chat)
 * Requer: X-Webhook-Secret header
 */
router.get('/patients/:patientId/diet', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('📋 [N8N] Fetching diet for patient:', patientId);
    
    // Buscar plano alimentar ativo
    const planSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (planSnapshot.empty) {
      console.log('⚠️ [N8N] No active diet plan found for patient:', patientId);
      return res.json({
        success: true,
        data: {
          meals: [],
          macros: {
            protein: 0,
            carbs: 0,
            fats: 0,
            calories: 0
          },
          message: 'No active diet plan'
        }
      });
    }
    
    const plan = planSnapshot.docs[0].data();
    
    console.log('✅ [N8N] Diet plan found:', plan.name);
    
    // Formatar resposta
    res.json({
      success: true,
      data: {
        id: planSnapshot.docs[0].id,
        name: plan.name,
        description: plan.description,
        meals: plan.meals || [],
        macros: {
          protein: plan.dailyProtein || 0,
          carbs: plan.dailyCarbs || 0,
          fats: plan.dailyFats || 0,
          calories: plan.dailyCalories || 0
        },
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ [N8N] Error fetching diet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/patients/:patientId/profile-macros
 * Buscar macros do perfil do paciente (quando não tem dieta prescrita)
 * Requer: X-Webhook-Secret header
 */
router.get('/patients/:patientId/profile-macros', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('👤 [N8N] Fetching profile macros for patient:', patientId);
    
    // Buscar dados do paciente
    const patientDoc = await db.collection('users').doc(patientId).get();
    
    if (!patientDoc.exists) {
      console.log('⚠️ [N8N] Patient not found:', patientId);
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    const patientData = patientDoc.data();
    
    // Extrair macros do perfil (se existirem)
    const profileMacros = {
      protein: patientData.targetProtein || patientData.dailyProtein || 0,
      carbs: patientData.targetCarbs || patientData.dailyCarbs || 0,
      fats: patientData.targetFats || patientData.dailyFats || 0,
      calories: patientData.targetCalories || patientData.dailyCalories || 0
    };
    
    // Se não tem nenhum macro definido, calcular baseado em peso e objetivo
    if (profileMacros.protein === 0 && profileMacros.carbs === 0 && profileMacros.fats === 0) {
      console.log('⚙️ [N8N] No macros in profile, calculating defaults...');
      
      const weight = patientData.weight || 70; // kg (default 70kg)
      const height = patientData.height || 170; // cm (default 170cm)
      const age = patientData.age || 30; // anos (default 30)
      const gender = patientData.gender || 'male'; // male/female
      const goal = patientData.goal || 'maintenance'; // weight_loss/muscle_gain/maintenance
      const activityLevel = patientData.activityLevel || 'moderate'; // sedentary/light/moderate/active/very_active
      
      // Calcular TMB (Taxa Metabólica Basal) - Fórmula de Harris-Benedict
      let bmr;
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      
      // Fator de atividade
      const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const activityFactor = activityFactors[activityLevel] || 1.55;
      
      // TDEE (Total Daily Energy Expenditure)
      let tdee = bmr * activityFactor;
      
      // Ajustar baseado no objetivo
      let targetCalories = tdee;
      if (goal === 'weight_loss' || goal === 'emagrecimento') {
        targetCalories = tdee - 500; // Déficit de 500 kcal
      } else if (goal === 'muscle_gain' || goal === 'ganho_muscular') {
        targetCalories = tdee + 300; // Superávit de 300 kcal
      }
      
      // Calcular macros (distribuição padrão: 30% proteína, 40% carbo, 30% gordura)
      profileMacros.protein = Math.round((targetCalories * 0.30) / 4); // 4 kcal/g
      profileMacros.carbs = Math.round((targetCalories * 0.40) / 4); // 4 kcal/g
      profileMacros.fats = Math.round((targetCalories * 0.30) / 9); // 9 kcal/g
      profileMacros.calories = Math.round(targetCalories);
      
      console.log('✅ [N8N] Calculated macros:', profileMacros);
    } else {
      console.log('✅ [N8N] Found macros in profile:', profileMacros);
    }
    
    // Retornar macros do perfil
    res.json({
      success: true,
      source: 'profile', // Indica que veio do perfil, não de uma dieta
      data: {
        name: 'Macros do Perfil',
        description: `Macronutrientes baseados no perfil de ${patientData.displayName || 'Paciente'}`,
        macros: profileMacros,
        patientInfo: {
          weight: patientData.weight || null,
          height: patientData.height || null,
          goal: patientData.goal || null,
          activityLevel: patientData.activityLevel || null
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error fetching profile macros:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile macros',
      message: error.message
    });
  }
});

// ============================================================================
// CONTEXTO DE CONVERSA E REGISTRO DE REFEIÇÕES
// ============================================================================

/**
 * GET /api/n8n/conversations/:conversationId/context
 * Buscar contexto ativo da conversa
 * Requer: X-Webhook-Secret header
 */
router.get('/conversations/:conversationId/context', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    console.log('📋 [N8N] Fetching context for conversation:', conversationId);
    
    // Buscar contexto no Firestore
    const contextDoc = await db.collection('conversationContexts').doc(conversationId).get();
    
    if (!contextDoc.exists) {
      console.log('⚠️ [N8N] No context found for conversation:', conversationId);
      return res.json({
        success: true,
        hasContext: false,
        context: null
      });
    }
    
    const contextData = contextDoc.data();
    
    // Verificar se expirou
    const context = new ConversationContext(
      contextData.conversationId,
      contextData.patientId,
      contextData.prescriberId
    );
    Object.assign(context, contextData);
    
    if (context.isExpired()) {
      console.log('⏰ [N8N] Context expired, cleaning up...');
      await db.collection('conversationContexts').doc(conversationId).delete();
      return res.json({
        success: true,
        hasContext: false,
        context: null,
        reason: 'expired'
      });
    }
    
    // Refresh expiration
    context.refreshExpiration();
    await db.collection('conversationContexts').doc(conversationId).set(context.toJSON());
    
    console.log('✅ [N8N] Context found:', context.currentContext?.type);
    
    res.json({
      success: true,
      hasContext: !!context.currentContext,
      context: context.toJSON()
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error fetching context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch context',
      message: error.message
    });
  }
});

/**
 * POST /api/n8n/conversations/:conversationId/context
 * Criar novo contexto
 * Requer: X-Webhook-Secret header
 */
router.post('/conversations/:conversationId/context', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { patientId, prescriberId, type, data } = req.body;
    
    console.log('🆕 [N8N] Creating context:', { conversationId, type });
    
    // Validar tipo de contexto
    if (!Object.values(ContextTypes).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid context type',
        validTypes: Object.values(ContextTypes)
      });
    }
    
    // Criar contexto
    const context = new ConversationContext(conversationId, patientId, prescriberId);
    context.setContext(type, data);
    
    // Salvar no Firestore
    await db.collection('conversationContexts').doc(conversationId).set(context.toJSON());
    
    console.log('✅ [N8N] Context created successfully');
    
    res.json({
      success: true,
      context: context.toJSON()
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error creating context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create context',
      message: error.message
    });
  }
});

/**
 * PATCH /api/n8n/conversations/:conversationId/context
 * Atualizar contexto existente
 * Requer: X-Webhook-Secret header
 */
router.patch('/conversations/:conversationId/context', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { updates, status } = req.body;
    
    console.log('🔄 [N8N] Updating context:', conversationId);
    
    // Buscar contexto
    const contextDoc = await db.collection('conversationContexts').doc(conversationId).get();
    
    if (!contextDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Context not found'
      });
    }
    
    const contextData = contextDoc.data();
    const context = new ConversationContext(
      contextData.conversationId,
      contextData.patientId,
      contextData.prescriberId
    );
    Object.assign(context, contextData);
    
    // Atualizar dados
    if (updates) {
      context.updateContext(updates);
    }
    
    // Atualizar status
    if (status) {
      context.updateStatus(status);
    }
    
    // Salvar
    await db.collection('conversationContexts').doc(conversationId).set(context.toJSON());
    
    console.log('✅ [N8N] Context updated successfully');
    
    res.json({
      success: true,
      context: context.toJSON()
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error updating context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update context',
      message: error.message
    });
  }
});

/**
 * DELETE /api/n8n/conversations/:conversationId/context
 * Finalizar/deletar contexto
 * Requer: X-Webhook-Secret header
 */
router.delete('/conversations/:conversationId/context', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { complete } = req.query; // ?complete=true para finalizar, senão deleta
    
    console.log('🗑️ [N8N] Deleting context:', conversationId);
    
    if (complete === 'true') {
      // Finalizar contexto (move para history)
      const contextDoc = await db.collection('conversationContexts').doc(conversationId).get();
      
      if (contextDoc.exists) {
        const contextData = contextDoc.data();
        const context = new ConversationContext(
          contextData.conversationId,
          contextData.patientId,
          contextData.prescriberId
        );
        Object.assign(context, contextData);
        
        context.completeContext();
        await db.collection('conversationContexts').doc(conversationId).set(context.toJSON());
      }
    } else {
      // Deletar completamente
      await db.collection('conversationContexts').doc(conversationId).delete();
    }
    
    console.log('✅ [N8N] Context deleted successfully');
    
    res.json({
      success: true,
      message: complete === 'true' ? 'Context completed' : 'Context deleted'
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error deleting context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete context',
      message: error.message
    });
  }
});

/**
 * POST /api/n8n/meals/log
 * Registrar refeição no sistema
 * Requer: X-Webhook-Secret header
 */
router.post('/meals/log', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId, prescriberId, conversationId, mealContext, adherence } = req.body;
    
    console.log('🍽️ [N8N] Logging meal for patient:', patientId);
    
    // Validar contexto de refeição
    const validation = validateMealContext(mealContext);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid meal context',
        validationErrors: validation.errors
      });
    }
    
    // Criar registro de refeição
    const mealLog = new MealLog(patientId, prescriberId, conversationId, mealContext);
    
    // Adicionar dados de aderência se fornecidos
    if (adherence) {
      mealLog.setAdherence(adherence);
    }
    
    // Salvar no Firestore
    await db.collection('mealLogs').doc(mealLog.id).set(mealLog.toJSON());
    
    console.log('✅ [N8N] Meal logged successfully:', mealLog.id);
    
    // Atualizar macros do dia do paciente (opcional)
    await updateDailyMacros(patientId, mealLog.totalMacros, mealLog.timestamp);
    
    res.json({
      success: true,
      mealLog: mealLog.toJSON(),
      message: 'Meal logged successfully'
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error logging meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log meal',
      message: error.message
    });
  }
});

/**
 * GET /api/n8n/patients/:patientId/meals/today
 * Buscar refeições do dia do paciente
 * Requer: X-Webhook-Secret header
 */
router.get('/patients/:patientId/meals/today', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('📊 [N8N] Fetching today\'s meals for patient:', patientId);
    
    // Calcular início e fim do dia
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    // Buscar refeições do dia
    const mealsSnapshot = await db.collection('mealLogs')
      .where('patientId', '==', patientId)
      .where('timestamp', '>=', startOfDay.toISOString())
      .where('timestamp', '<', endOfDay.toISOString())
      .orderBy('timestamp', 'asc')
      .get();
    
    const meals = [];
    mealsSnapshot.forEach(doc => {
      meals.push(doc.data());
    });
    
    // Calcular totais do dia
    const dailyTotals = meals.reduce((totals, meal) => ({
      protein: totals.protein + meal.totalMacros.protein,
      carbs: totals.carbs + meal.totalMacros.carbs,
      fats: totals.fats + meal.totalMacros.fats,
      calories: totals.calories + meal.totalMacros.calories
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
    
    console.log('✅ [N8N] Found', meals.length, 'meals today');
    
    res.json({
      success: true,
      date: startOfDay.toISOString().split('T')[0],
      mealCount: meals.length,
      meals: meals,
      dailyTotals: dailyTotals
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error fetching meals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meals',
      message: error.message
    });
  }
});

/**
 * GET /api/n8n/patients/:patientId/meals/summary
 * Resumo de macros consumidos vs metas do dia
 * Requer: X-Webhook-Secret header
 */
router.get('/patients/:patientId/meals/summary', verifyWebhookSecret, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('📈 [N8N] Fetching meal summary for patient:', patientId);
    
    // Buscar refeições do dia
    const todayResponse = await fetch(
      `${req.protocol}://${req.get('host')}/api/n8n/patients/${patientId}/meals/today`,
      { headers: { 'X-Webhook-Secret': req.get('X-Webhook-Secret') } }
    );
    const todayData = await todayResponse.json();
    
    // Buscar macros do perfil ou dieta
    const profileResponse = await fetch(
      `${req.protocol}://${req.get('host')}/api/n8n/patients/${patientId}/profile-macros`,
      { headers: { 'X-Webhook-Secret': req.get('X-Webhook-Secret') } }
    );
    const profileData = await profileResponse.json();
    
    const consumed = todayData.dailyTotals;
    const target = profileData.data.macros;
    
    // Calcular percentuais
    const percentages = {
      protein: target.protein > 0 ? Math.round((consumed.protein / target.protein) * 100) : 0,
      carbs: target.carbs > 0 ? Math.round((consumed.carbs / target.carbs) * 100) : 0,
      fats: target.fats > 0 ? Math.round((consumed.fats / target.fats) * 100) : 0,
      calories: target.calories > 0 ? Math.round((consumed.calories / target.calories) * 100) : 0
    };
    
    // Calcular restante
    const remaining = {
      protein: Math.max(0, target.protein - consumed.protein),
      carbs: Math.max(0, target.carbs - consumed.carbs),
      fats: Math.max(0, target.fats - consumed.fats),
      calories: Math.max(0, target.calories - consumed.calories)
    };
    
    console.log('✅ [N8N] Summary calculated');
    
    res.json({
      success: true,
      date: todayData.date,
      mealCount: todayData.mealCount,
      consumed: consumed,
      target: target,
      percentages: percentages,
      remaining: remaining,
      status: percentages.calories >= 100 ? 'met' : percentages.calories >= 80 ? 'on_track' : 'below_target'
    });
    
  } catch (error) {
    console.error('❌ [N8N] Error fetching summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
      message: error.message
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Atualizar macros diários do paciente
 */
async function updateDailyMacros(patientId, mealMacros, timestamp) {
  try {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const dailyMacrosRef = db.collection('dailyMacros').doc(`${patientId}_${date}`);
    
    const doc = await dailyMacrosRef.get();
    
    if (doc.exists) {
      // Atualizar existente
      const current = doc.data();
      await dailyMacrosRef.update({
        protein: current.protein + mealMacros.protein,
        carbs: current.carbs + mealMacros.carbs,
        fats: current.fats + mealMacros.fats,
        calories: current.calories + mealMacros.calories,
        mealCount: current.mealCount + 1,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Criar novo
      await dailyMacrosRef.set({
        patientId,
        date,
        protein: mealMacros.protein,
        carbs: mealMacros.carbs,
        fats: mealMacros.fats,
        calories: mealMacros.calories,
        mealCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('✅ Daily macros updated for:', date);
  } catch (error) {
    console.error('❌ Error updating daily macros:', error);
    // Não falhar a requisição principal por causa disso
  }
}

/**
 * GET /api/n8n/conversations/:conversationId
 * Buscar dados da conversa (para workflow de chat)
 * Requer: X-Webhook-Secret header
 */
router.get('/conversations/:conversationId', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    console.log('💬 [N8N] Fetching conversation:', conversationId);
    
    // Buscar conversa
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    
    if (!conversationDoc.exists) {
      console.log('⚠️ [N8N] Conversation not found:', conversationId);
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    const conversation = conversationDoc.data();
    
    console.log('✅ [N8N] Conversation found:', {
      patientId: conversation.patientId,
      prescriberId: conversation.prescriberId
    });
    
    // Formatar resposta
    res.json({
      success: true,
      data: {
        id: conversationDoc.id,
        patientId: conversation.patientId,
        prescriberId: conversation.prescriberId,
        patientName: conversation.metadata?.patientName || 'Paciente',
        prescriberName: conversation.metadata?.prescriberName || 'Nutricionista',
        status: conversation.status,
        kanbanColumn: conversation.kanbanColumn,
        priority: conversation.priority,
        tags: conversation.tags || [],
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        lastMessageBy: conversation.lastMessageBy,
        unreadCount: conversation.unreadCount || 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        metadata: conversation.metadata
      }
    });
  } catch (error) {
    console.error('❌ [N8N] Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/conversations/:conversationId/messages
 * Buscar últimas mensagens da conversa (para workflow de chat)
 * Query param: limit (default: 10)
 * Requer: X-Webhook-Secret header
 */
router.get('/conversations/:conversationId/messages', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 10 } = req.query;
    
    console.log('📨 [N8N] Fetching messages for conversation:', conversationId, '| Limit:', limit);
    
    // Verificar se conversa existe
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    
    if (!conversationDoc.exists) {
      console.log('⚠️ [N8N] Conversation not found:', conversationId);
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Buscar mensagens (últimas N mensagens, ordenadas por createdAt desc)
    const messagesSnapshot = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    if (messagesSnapshot.empty) {
      console.log('⚠️ [N8N] No messages found for conversation:', conversationId);
      return res.json({
        success: true,
        data: {
          messages: [],
          count: 0
        }
      });
    }
    
    // Formatar mensagens (reverter para ordem cronológica)
    const messages = messagesSnapshot.docs.reverse().map(doc => {
      const msg = doc.data();
      return {
        id: doc.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderRole: msg.senderRole,
        content: msg.content,
        type: msg.type,
        status: msg.status,
        isAiGenerated: msg.isAiGenerated || false,
        createdAt: msg.createdAt,
        readAt: msg.readAt || null,
        attachments: msg.attachments || []
      };
    });
    
    console.log('✅ [N8N] Messages found:', messages.length);
    
    // Formatar resposta
    res.json({
      success: true,
      data: {
        messages,
        count: messages.length,
        conversationId
      }
    });
  } catch (error) {
    console.error('❌ [N8N] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/conversations/:conversationId/messages
 * Criar nova mensagem na conversa (para workflow de chat - AI responses)
 * Body: { senderId, senderRole, content, type, isAiGenerated }
 * Requer: X-Webhook-Secret header
 */
router.post('/conversations/:conversationId/messages', verifyWebhookSecret, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderRole, content, type = 'text', isAiGenerated = true } = req.body;
    
    console.log('✉️ [N8N] Creating message for conversation:', conversationId, '| Sender:', senderRole);
    
    // Validações
    if (!senderId || !senderRole || !content) {
      return res.status(400).json({
        success: false,
        error: 'senderId, senderRole and content are required'
      });
    }
    
    // Verificar se conversa existe
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists) {
      console.log('⚠️ [N8N] Conversation not found:', conversationId);
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    const conversation = conversationDoc.data();
    
    // Criar mensagem
    const messageData = {
      conversationId,
      senderId,
      senderRole,
      content: content.trim(),
      type,
      status: 'sent',
      isAiGenerated,
      createdAt: new Date(),
      readAt: null,
      attachments: []
    };
    
    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);
    
    console.log('✅ [N8N] Message created:', messageRef.id);
    
    // Atualizar conversa com última mensagem
    const updateData = {
      lastMessage: content.trim().substring(0, 100), // Limitar a 100 caracteres
      lastMessageAt: new Date(),
      lastMessageBy: senderRole,
      updatedAt: new Date()
    };
    
    // Se for mensagem do prescritor/IA, incrementar unread do paciente
    if (senderRole === 'prescriber' || senderRole === 'system') {
      updateData.patientUnreadCount = (conversation.patientUnreadCount || 0) + 1;
    }
    // Se for mensagem do paciente, incrementar unread do prescritor
    else if (senderRole === 'patient') {
      updateData.unreadCount = (conversation.unreadCount || 0) + 1;
    }
    
    await conversationRef.update(updateData);
    
    console.log('✅ [N8N] Conversation updated');
    
    // Retornar sucesso
    res.json({
      success: true,
      data: {
        messageId: messageRef.id,
        conversationId,
        senderId,
        senderRole,
        content: content.trim(),
        type,
        isAiGenerated,
        createdAt: messageData.createdAt,
        status: 'sent'
      }
    });
  } catch (error) {
    console.error('❌ [N8N] Error creating message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

