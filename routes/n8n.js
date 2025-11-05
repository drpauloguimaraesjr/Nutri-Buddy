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

module.exports = router;

