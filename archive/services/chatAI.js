/**
 * Serviço de Chat com IA - Assistente Nutricional
 * Usa Google Gemini para conversas contextualizadas sobre nutrição
 */

const OpenAI = require('openai');
const { db } = require('../config/firebase');

class ChatAIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY não configurada. Chat com IA desabilitado.');
      this.enabled = false;
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.enabled = true;
    this.conversations = new Map(); // Cache de conversas ativas
    console.log('✅ Chat AI Service (OpenAI) inicializado!');
  }

  /**
   * Obtém contexto do usuário (metas, refeições recentes, etc)
   */
  async getUserContext(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Buscar dados em paralelo
      const [goalsSnap, mealsSnap, waterSnap, exercisesSnap] = await Promise.all([
        db.collection('goals').where('userId', '==', userId).limit(1).get(),
        db.collection('meals').where('userId', '==', userId)
          .where('date', '>=', yesterday).orderBy('date', 'desc').limit(10).get(),
        db.collection('water').where('userId', '==', userId)
          .where('date', '==', today).get(),
        db.collection('exercises').where('userId', '==', userId)
          .where('date', '==', today).get()
      ]);

      // Processar dados
      const goals = goalsSnap.empty ? null : goalsSnap.docs[0].data();
      const meals = mealsSnap.docs.map(doc => doc.data());
      const todayCalories = meals
        .filter(m => m.date === today)
        .reduce((sum, m) => sum + (m.totalCalories || 0), 0);
      
      const totalWater = waterSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      const totalExercise = exercisesSnap.docs.reduce((sum, doc) => sum + (doc.data().duration || 0), 0);
      const caloriesBurned = exercisesSnap.docs.reduce((sum, doc) => sum + (doc.data().caloriesBurned || 0), 0);

      return {
        goals,
        todayCalories,
        totalWater,
        totalExercise,
        caloriesBurned,
        recentMeals: meals.slice(0, 3),
        balance: todayCalories - caloriesBurned
      };
    } catch (error) {
      console.error('Erro ao obter contexto do usuário:', error);
      return null;
    }
  }

  /**
   * Cria prompt do sistema com contexto do usuário
   */
  createSystemPrompt(context) {
    let prompt = `Você é NutriBot, um assistente nutricional inteligente e amigável.

Seu papel:
- Responder perguntas sobre nutrição, dietas e saúde
- Analisar refeições e dar feedback
- Sugerir melhorias e alternativas saudáveis
- Criar planos alimentares personalizados
- Motivar e encorajar hábitos saudáveis

Diretrizes:
- Use linguagem clara e acessível (português do Brasil)
- Seja empático e motivador
- Use emojis para tornar a conversa mais amigável
- Sempre baseie respostas em ciência nutricional
- Avise que não substitui consulta com nutricionista
- Seja breve mas informativo

`;

    if (context) {
      prompt += `\nCONTEXTO DO USUÁRIO (use para personalizar respostas):\n`;
      
      if (context.goals) {
        prompt += `\nMetas Diárias:
- Calorias: ${context.goals.dailyCalories} kcal
- Proteínas: ${context.goals.protein}g
- Carboidratos: ${context.goals.carbs}g
- Gorduras: ${context.goals.fat}g
- Água: ${context.goals.water}ml
- Objetivo: ${context.goals.objective === 'lose' ? 'Perder peso' : context.goals.objective === 'gain' ? 'Ganhar peso' : 'Manter peso'}
- Peso atual: ${context.goals.weight}kg
- Meta de peso: ${context.goals.weightGoal}kg\n`;
      }

      prompt += `\nProgresso Hoje:
- Calorias consumidas: ${context.todayCalories} kcal
- Água consumida: ${context.totalWater}ml
- Exercício: ${context.totalExercise} minutos
- Calorias queimadas: ${context.caloriesBurned} kcal
- Saldo calórico: ${context.balance > 0 ? '+' : ''}${context.balance} kcal\n`;

      if (context.recentMeals && context.recentMeals.length > 0) {
        prompt += `\nÚltimas Refeições:
`;
        context.recentMeals.forEach((meal, i) => {
          prompt += `${i + 1}. ${meal.name} (${meal.totalCalories} kcal)\n`;
        });
      }
    }

    return prompt;
  }

  /**
   * Envia mensagem e recebe resposta da IA
   */
  async sendMessage(userId, message, conversationId = null) {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Chat com IA não está habilitado. Configure OPENAI_API_KEY.'
      };
    }

    try {
      // Obter ou criar conversa
      let conversation;
      if (conversationId && this.conversations.has(conversationId)) {
        conversation = this.conversations.get(conversationId);
      } else {
        // Nova conversa - obter contexto do usuário
        const userContext = await this.getUserContext(userId);
        const systemPrompt = this.createSystemPrompt(userContext);
        
        conversation = {
          id: conversationId || this.generateConversationId(),
          userId,
          history: [],
          systemPrompt,
          createdAt: new Date().toISOString()
        };
        
        this.conversations.set(conversation.id, conversation);
      }

      // Preparar mensagens para OpenAI
      const messages = [
        { role: 'system', content: conversation.systemPrompt }
      ];
      
      // Adicionar histórico recente (últimas 10 mensagens)
      const recentHistory = conversation.history.slice(-10);
      messages.push(...recentHistory);
      
      // Adicionar mensagem atual
      messages.push({ role: 'user', content: message });

      // Gerar resposta com OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.8
      });

      const botReply = response.choices[0].message.content.trim();

      // Salvar no histórico
      conversation.history.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: botReply, timestamp: new Date().toISOString() }
      );

      // Salvar no Firestore (async, não bloqueia resposta)
      this.saveMessageToFirestore(userId, conversation.id, message, botReply).catch(err => {
        console.error('Erro ao salvar mensagem:', err);
      });

      return {
        success: true,
        conversationId: conversation.id,
        message: botReply,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.'
      };
    }
  }

  /**
   * Salva mensagem no Firestore
   */
  async saveMessageToFirestore(userId, conversationId, userMessage, botReply) {
    try {
      const messagesRef = db.collection('chat_messages');
      
      await messagesRef.add({
        userId,
        conversationId,
        messages: [
          { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
          { role: 'assistant', content: botReply, timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar no Firestore:', error);
    }
  }

  /**
   * Obtém histórico de conversa do Firestore
   */
  async getConversationHistory(userId, conversationId) {
    try {
      const snapshot = await db.collection('chat_messages')
        .where('userId', '==', userId)
        .where('conversationId', '==', conversationId)
        .orderBy('createdAt', 'asc')
        .get();

      const history = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.messages) {
          history.push(...data.messages);
        }
      });

      return history;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Lista conversas do usuário
   */
  async getUserConversations(userId, limit = 10) {
    try {
      const snapshot = await db.collection('chat_messages')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit * 2) // Pegar mais pois vamos agrupar
        .get();

      // Agrupar por conversationId
      const conversationsMap = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const convId = data.conversationId;
        
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            lastMessage: data.messages[data.messages.length - 1],
            createdAt: data.createdAt,
            messageCount: 0
          });
        }
        
        conversationsMap.get(convId).messageCount += data.messages.length;
      });

      // Converter para array e ordenar
      return Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      return [];
    }
  }

  /**
   * Cria uma nova conversa
   */
  async createNewConversation(userId) {
    const conversationId = this.generateConversationId();
    const userContext = await this.getUserContext(userId);
    const systemPrompt = this.createSystemPrompt(userContext);
    
    const conversation = {
      id: conversationId,
      userId,
      history: [],
      systemPrompt,
      createdAt: new Date().toISOString()
    };
    
    this.conversations.set(conversationId, conversation);
    
    return {
      success: true,
      conversationId,
      welcomeMessage: '👋 Olá! Sou o NutriBot, seu assistente nutricional. Como posso ajudar você hoje?'
    };
  }

  /**
   * Limpa cache de conversa (economiza memória)
   */
  clearConversationCache(conversationId) {
    this.conversations.delete(conversationId);
  }

  /**
   * Gera ID único para conversa
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sugestões de perguntas comuns
   */
  getSuggestedQuestions(context) {
    const suggestions = [
      '💪 Como posso aumentar minha ingestão de proteínas?',
      '🥗 Quais alimentos são bons para perder peso?',
      '🏃 Quantas calorias devo consumir por dia?',
      '🍎 Pode analisar minha última refeição?',
      '📊 Como está meu progresso hoje?'
    ];

    if (context?.goals?.objective === 'lose') {
      suggestions.push('⚖️ Dicas para acelerar a perda de peso?');
    } else if (context?.goals?.objective === 'gain') {
      suggestions.push('💪 Como ganhar massa muscular?');
    }

    if (context?.balance > 500) {
      suggestions.push('🔥 Comi muito hoje, o que fazer?');
    } else if (context?.balance < -500) {
      suggestions.push('🍽️ Comi pouco, o que comer?');
    }

    return suggestions;
  }
}

module.exports = new ChatAIService();

