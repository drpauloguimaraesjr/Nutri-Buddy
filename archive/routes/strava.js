const express = require('express');
const router = express.Router();
const stravaService = require('../services/strava');
const { verifyToken: auth } = require('../middleware/auth');

/**
 * Rotas de Integração com Strava
 */

// Status da integração
router.get('/status', auth, async (req, res) => {
  try {
    if (!stravaService.enabled) {
      return res.json({
        enabled: false,
        message: '⚠️ Configure STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET para habilitar'
      });
    }

    const status = await stravaService.getConnectionStatus(req.user.uid);

    res.json({
      enabled: true,
      ...status,
      message: status.connected 
        ? '✅ Conectado ao Strava!' 
        : 'Não conectado ao Strava'
    });
  } catch (error) {
    console.error('Erro ao verificar status Strava:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do Strava'
    });
  }
});

// Iniciar autorização OAuth2
router.get('/connect', auth, async (req, res) => {
  try {
    if (!stravaService.enabled) {
      return res.status(400).json({
        success: false,
        error: 'Integração Strava não configurada'
      });
    }

    const authUrl = stravaService.getAuthorizationUrl(req.user.uid);
    
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar conexão com Strava'
    });
  }
});

// Callback OAuth2 (processar código de autorização)
router.post('/callback', auth, async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código de autorização não fornecido'
      });
    }

    // Trocar código por tokens
    const tokens = await stravaService.exchangeToken(code);
    
    // Salvar no perfil do usuário
    await stravaService.saveStravaConnection(req.user.uid, tokens);

    res.json({
      success: true,
      message: 'Conectado ao Strava com sucesso!',
      athlete: {
        id: tokens.athlete.id,
        name: `${tokens.athlete.firstname} ${tokens.athlete.lastname}`
      }
    });
  } catch (error) {
    console.error('Erro no callback Strava:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar autorização do Strava'
    });
  }
});

// Sincronizar atividades
router.post('/sync', auth, async (req, res) => {
  try {
    const { fullSync, limit } = req.body;

    const result = await stravaService.syncActivities(req.user.uid, {
      fullSync: fullSync || false,
      limit: limit || 50
    });

    res.json({
      success: true,
      message: `${result.synced} atividades sincronizadas!`,
      ...result
    });
  } catch (error) {
    console.error('Erro ao sincronizar Strava:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao sincronizar atividades do Strava'
    });
  }
});

// Buscar atividades do Strava (sem salvar)
router.get('/activities', auth, async (req, res) => {
  try {
    const { page, limit, after, before } = req.query;

    const activities = await stravaService.getActivities(req.user.uid, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 30,
      after,
      before
    });

    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Erro ao buscar atividades Strava:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar atividades do Strava'
    });
  }
});

// Buscar atividade específica
router.get('/activities/:activityId', auth, async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await stravaService.getActivity(req.user.uid, activityId);

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Erro ao buscar atividade Strava:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar atividade do Strava'
    });
  }
});

// Importar atividade específica
router.post('/activities/:activityId/import', auth, async (req, res) => {
  try {
    const { activityId } = req.params;
    const { db } = require('../config/firebase');

    // Verificar se já existe
    const existingQuery = await db.collection('exercises')
      .where('userId', '==', req.user.uid)
      .where('stravaId', '==', activityId)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return res.status(400).json({
        success: false,
        error: 'Atividade já importada'
      });
    }

    // Buscar do Strava
    const stravaActivity = await stravaService.getActivity(req.user.uid, activityId);
    
    // Converter
    const exercise = stravaService.convertStravaActivity(stravaActivity);
    
    // Salvar
    const exerciseRef = await db.collection('exercises').add({
      ...exercise,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Atividade importada com sucesso!',
      exercise: {
        id: exerciseRef.id,
        ...exercise
      }
    });
  } catch (error) {
    console.error('Erro ao importar atividade:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao importar atividade do Strava'
    });
  }
});

// Desconectar Strava
router.post('/disconnect', auth, async (req, res) => {
  try {
    await stravaService.disconnect(req.user.uid);

    res.json({
      success: true,
      message: 'Desconectado do Strava com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao desconectar Strava:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao desconectar do Strava'
    });
  }
});

// Webhook para receber eventos do Strava
router.get('/webhook', (req, res) => {
  // Validação da subscription do webhook
  const { 'hub.mode': mode, 'hub.verify_token': verifyToken, 'hub.challenge': challenge } = req.query;

  const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_TOKEN || 'NUTRIBUDDY_STRAVA_WEBHOOK';

  if (mode === 'subscribe' && verifyToken === VERIFY_TOKEN) {
    console.log('✅ Webhook Strava validado!');
    res.json({ 'hub.challenge': challenge });
  } else {
    res.status(403).send('Forbidden');
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('📩 Evento Strava recebido:', event);

    // Responder imediatamente para não dar timeout
    res.status(200).send('EVENT_RECEIVED');

    // Processar evento em background
    if (event.object_type === 'activity' && event.aspect_type === 'create') {
      // Nova atividade criada no Strava
      const { owner_id, object_id } = event;
      
      // Buscar usuário que tem esse athlete_id
      const { db } = require('../config/firebase');
      const usersQuery = await db.collection('users')
        .where('strava.athleteId', '==', owner_id)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];
        const userId = userDoc.id;

        // Importar atividade automaticamente
        try {
          const stravaActivity = await stravaService.getActivity(userId, object_id);
          const exercise = stravaService.convertStravaActivity(stravaActivity);
          
          await db.collection('exercises').add({
            ...exercise,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          console.log(`✅ Atividade ${object_id} importada automaticamente para usuário ${userId}`);
        } catch (error) {
          console.error('❌ Erro ao importar atividade via webhook:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook Strava:', error);
  }
});

module.exports = router;

