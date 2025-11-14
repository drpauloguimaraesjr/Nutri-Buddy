const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db, admin } = require('../config/firebase');
const axios = require('axios');

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
 * Com precisão cirúrgica: calorias exatas, macros detalhados, micronutrientes
 */
router.post('/update-diet-complete', verifyWebhookSecret, async (req, res) => {
  try {
    const { 
      patientId, 
      diet,
      resumo,
      meta,
      macronutrientes,
      refeicoes,
      micronutrientes,
      observacoes,
      substituicoes,
      success,
      transcriptionStatus,
      model
    } = req.body;
    
    console.log('🎯 [N8N] Atualizando dieta COMPLETA:', patientId, '| Model:', model || 'GPT-4o');
    
    // Validações
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId é obrigatório'
      });
    }
    
    if (!success || transcriptionStatus === 'error') {
      console.error('❌ [N8N] Transcrição falhou:', req.body.error || 'Erro desconhecido');
      return res.status(400).json({
        success: false,
        error: 'Transcrição da dieta falhou',
        details: req.body.error || 'Erro desconhecido'
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
    
    // Estruturar dados para salvar no Firestore
    const dietData = {
      // Dieta completa estruturada (JSON rico)
      dietPlan: diet || null,
      
      // Resumo rápido para exibir em cards/listas
      dietSummary: {
        totalCalorias: resumo?.totalCalorias || meta?.caloriasDiarias || 0,
        totalRefeicoes: resumo?.totalRefeicoes || refeicoes?.length || 0,
        totalAlimentos: resumo?.totalAlimentos || 0,
        objetivo: meta?.objetivo || 'não especificado',
        nutricionista: meta?.nutricionista || null,
        periodo: meta?.periodo || '24 horas'
      },
      
      // Macronutrientes principais
      dietMacros: macronutrientes ? {
        carboidratos: {
          gramas: macronutrientes.carboidratos?.gramas || 0,
          gramsPerKg: macronutrientes.carboidratos?.gramsPerKg || 0,
          percentual: macronutrientes.carboidratos?.percentual || 0
        },
        proteinas: {
          gramas: macronutrientes.proteinas?.gramas || 0,
          gramsPerKg: macronutrientes.proteinas?.gramsPerKg || 0,
          percentual: macronutrientes.proteinas?.percentual || 0
        },
        gorduras: {
          gramas: macronutrientes.gorduras?.gramas || 0,
          gramsPerKg: macronutrientes.gorduras?.gramsPerKg || 0,
          percentual: macronutrientes.gorduras?.percentual || 0
        },
        fibras: {
          gramas: macronutrientes.fibras?.gramas || 0,
          gramsPerKg: macronutrientes.fibras?.gramsPerKg || 0
        }
      } : null,
      
      // Refeições detalhadas (array completo)
      dietMeals: refeicoes || [],
      
      // Micronutrientes (vitaminas, minerais)
      dietMicronutrients: micronutrientes || [],
      
      // Observações do nutricionista
      dietNotes: observacoes || [],
      
      // Substituições permitidas
      dietSubstitutions: substituicoes || [],
      
      // Metadados da transcrição
      dietTranscriptionMeta: {
        status: transcriptionStatus || 'completed',
        model: model || 'gpt-4o',
        transcribedAt: admin.firestore.FieldValue.serverTimestamp(),
        version: 'complete-v1',
        accuracy: 'high'
      },
      
      // Flags de controle
      dietTranscriptionComplete: true,
      dietLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      
      // Compatibilidade com código antigo
      dietPlanText: diet?.meta?.objetivo || observacoes?.join('\n') || '',
      planTranscriptionStatus: 'completed',
      planUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Salvar no Firestore
    await patientRef.update(dietData);
    
    console.log('✅ [N8N] Dieta COMPLETA salva com sucesso:', {
      patientId,
      calorias: dietData.dietSummary.totalCalorias,
      refeicoes: dietData.dietSummary.totalRefeicoes,
      alimentos: dietData.dietSummary.totalAlimentos,
      model: dietData.dietTranscriptionMeta.model
    });
    
    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Dieta transcrita com PRECISÃO COMPLETA e salva com sucesso',
      patientId,
      summary: dietData.dietSummary,
      transcription: {
        model: dietData.dietTranscriptionMeta.model,
        accuracy: 'high',
        version: 'complete-v1'
      }
    });
    
  } catch (error) {
    console.error('❌ [N8N] Erro ao salvar dieta completa:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao salvar dieta',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

