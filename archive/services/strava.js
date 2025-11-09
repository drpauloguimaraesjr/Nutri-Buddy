const axios = require('axios');
const { db } = require('../config/firebase');

/**
 * Serviço de Integração com Strava API
 * Gerencia autenticação OAuth2 e sincronização de atividades
 */
class StravaService {
  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID;
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET;
    this.redirectUri = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3001/settings/strava-callback';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Strava credentials não configuradas. Integração desabilitada.');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.baseUrl = 'https://www.strava.com/api/v3';
    console.log('✅ Strava Service inicializado!');
  }

  /**
   * Gera URL de autorização OAuth2
   */
  getAuthorizationUrl(userId) {
    const scope = 'read,activity:read_all,activity:read';
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    
    return `https://www.strava.com/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&approval_prompt=auto&scope=${scope}&state=${state}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso
   */
  async exchangeToken(code) {
    try {
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at,
        athlete: response.data.athlete
      };
    } catch (error) {
      console.error('❌ Erro ao trocar código Strava:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com Strava');
    }
  }

  /**
   * Atualiza o token de acesso usando refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar token Strava:', error.response?.data || error.message);
      throw new Error('Falha ao atualizar token Strava');
    }
  }

  /**
   * Obtém token de acesso válido (atualiza se necessário)
   */
  async getValidAccessToken(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.strava?.refreshToken) {
      throw new Error('Usuário não conectado ao Strava');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Token ainda válido
    if (userData.strava.expiresAt > now + 300) {
      return userData.strava.accessToken;
    }

    // Atualizar token
    const tokens = await this.refreshAccessToken(userData.strava.refreshToken);
    
    await db.collection('users').doc(userId).update({
      'strava.accessToken': tokens.accessToken,
      'strava.refreshToken': tokens.refreshToken,
      'strava.expiresAt': tokens.expiresAt,
      'strava.lastSync': new Date().toISOString()
    });

    return tokens.accessToken;
  }

  /**
   * Salva tokens do Strava no perfil do usuário
   */
  async saveStravaConnection(userId, tokens) {
    await db.collection('users').doc(userId).update({
      strava: {
        connected: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        athleteId: tokens.athlete.id,
        athleteName: `${tokens.athlete.firstname} ${tokens.athlete.lastname}`,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString()
      }
    });
  }

  /**
   * Busca atividades do Strava
   */
  async getActivities(userId, options = {}) {
    try {
      const accessToken = await this.getValidAccessToken(userId);
      
      const params = {
        per_page: options.limit || 30,
        page: options.page || 1
      };

      if (options.after) {
        params.after = Math.floor(new Date(options.after).getTime() / 1000);
      }

      if (options.before) {
        params.before = Math.floor(new Date(options.before).getTime() / 1000);
      }

      const response = await axios.get(`${this.baseUrl}/athlete/activities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar atividades Strava:', error.response?.data || error.message);
      throw new Error('Falha ao buscar atividades do Strava');
    }
  }

  /**
   * Busca detalhes de uma atividade específica
   */
  async getActivity(userId, activityId) {
    try {
      const accessToken = await this.getValidAccessToken(userId);
      
      const response = await axios.get(`${this.baseUrl}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar atividade Strava:', error.response?.data || error.message);
      throw new Error('Falha ao buscar atividade do Strava');
    }
  }

  /**
   * Converte atividade do Strava para formato NutriBuddy
   */
  convertStravaActivity(stravaActivity) {
    const typeMapping = {
      'Run': 'Corrida',
      'Ride': 'Ciclismo',
      'Swim': 'Natação',
      'Walk': 'Caminhada',
      'Hike': 'Trilha',
      'WeightTraining': 'Musculação',
      'Workout': 'Treino',
      'Yoga': 'Yoga',
      'Crossfit': 'CrossFit',
      'Soccer': 'Futebol',
      'Basketball': 'Basquete',
      'Tennis': 'Tênis'
    };

    return {
      name: stravaActivity.name,
      type: typeMapping[stravaActivity.type] || stravaActivity.type,
      duration: Math.round(stravaActivity.moving_time / 60), // segundos para minutos
      caloriesBurned: Math.round(stravaActivity.calories || this.estimateCalories(stravaActivity)),
      date: stravaActivity.start_date,
      distance: stravaActivity.distance ? Math.round(stravaActivity.distance / 1000 * 100) / 100 : null, // metros para km
      averageHeartRate: stravaActivity.average_heartrate || null,
      maxHeartRate: stravaActivity.max_heartrate || null,
      source: 'strava',
      stravaId: stravaActivity.id.toString(),
      notes: this.generateActivityNotes(stravaActivity)
    };
  }

  /**
   * Estima calorias se não fornecidas pelo Strava
   */
  estimateCalories(activity) {
    const duration = activity.moving_time / 60; // minutos
    const caloriesPerMinute = {
      'Run': 10,
      'Ride': 8,
      'Swim': 11,
      'Walk': 4,
      'WeightTraining': 6,
      'Workout': 7
    };

    const rate = caloriesPerMinute[activity.type] || 6;
    return Math.round(duration * rate);
  }

  /**
   * Gera notas descritivas da atividade
   */
  generateActivityNotes(activity) {
    const parts = [];
    
    if (activity.distance) {
      parts.push(`Distância: ${(activity.distance / 1000).toFixed(2)} km`);
    }
    
    if (activity.average_speed) {
      const pace = (activity.distance / 1000) / (activity.moving_time / 3600);
      parts.push(`Ritmo: ${pace.toFixed(2)} km/h`);
    }
    
    if (activity.total_elevation_gain) {
      parts.push(`Elevação: ${Math.round(activity.total_elevation_gain)} m`);
    }
    
    if (activity.average_heartrate) {
      parts.push(`FC Média: ${Math.round(activity.average_heartrate)} bpm`);
    }

    parts.push('Importado do Strava 🟠');
    
    return parts.join(' • ');
  }

  /**
   * Sincroniza atividades do Strava para o NutriBuddy
   */
  async syncActivities(userId, options = {}) {
    try {
      // Buscar última sincronização
      const userDoc = await db.collection('users').doc(userId).get();
      const lastSync = userDoc.data()?.strava?.lastSync;
      
      const syncOptions = {
        limit: options.limit || 50
      };

      // Se já sincronizou antes, buscar apenas atividades novas
      if (lastSync && !options.fullSync) {
        syncOptions.after = lastSync;
      }

      // Buscar atividades do Strava
      const stravaActivities = await this.getActivities(userId, syncOptions);
      
      // Converter e salvar no Firestore
      const savedActivities = [];
      const batch = db.batch();

      for (const stravaActivity of stravaActivities) {
        // Verificar se já existe
        const existingQuery = await db.collection('exercises')
          .where('userId', '==', userId)
          .where('stravaId', '==', stravaActivity.id.toString())
          .limit(1)
          .get();

        if (existingQuery.empty) {
          const exercise = this.convertStravaActivity(stravaActivity);
          const exerciseRef = db.collection('exercises').doc();
          
          batch.set(exerciseRef, {
            ...exercise,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          savedActivities.push(exercise);
        }
      }

      await batch.commit();

      // Atualizar última sincronização
      await db.collection('users').doc(userId).update({
        'strava.lastSync': new Date().toISOString(),
        'strava.lastSyncCount': savedActivities.length
      });

      return {
        synced: savedActivities.length,
        total: stravaActivities.length,
        activities: savedActivities
      };
    } catch (error) {
      console.error('❌ Erro ao sincronizar Strava:', error.message);
      throw error;
    }
  }

  /**
   * Desconecta a conta do Strava
   */
  async disconnect(userId) {
    try {
      // Revogar acesso (opcional)
      const accessToken = await this.getValidAccessToken(userId);
      
      try {
        await axios.post('https://www.strava.com/oauth/deauthorize', null, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (error) {
        console.warn('⚠️ Erro ao revogar token Strava:', error.message);
      }

      // Remover do banco
      await db.collection('users').doc(userId).update({
        strava: {
          connected: false,
          disconnectedAt: new Date().toISOString()
        }
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao desconectar Strava:', error.message);
      throw error;
    }
  }

  /**
   * Verifica status da conexão
   */
  async getConnectionStatus(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const strava = userDoc.data()?.strava;

    if (!strava?.connected) {
      return { connected: false };
    }

    return {
      connected: true,
      athleteName: strava.athleteName,
      connectedAt: strava.connectedAt,
      lastSync: strava.lastSync,
      lastSyncCount: strava.lastSyncCount || 0
    };
  }
}

module.exports = new StravaService();

