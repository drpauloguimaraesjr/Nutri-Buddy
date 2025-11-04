/**
 * Handler de Mensagens WhatsApp
 * Processa comandos do usuário e integra com funcionalidades do NutriBuddy
 */

const aiService = require('./ai');
const { db } = require('../config/firebase');

class WhatsAppMessageHandler {
  constructor(whatsappService) {
    this.whatsapp = whatsappService;
    this.userSessions = new Map(); // Armazena contexto de conversas
  }

  /**
   * Registra o handler no serviço WhatsApp
   */
  register() {
    this.whatsapp.onMessage(async (data) => {
      await this.handleMessage(data);
    });
  }

  /**
   * Processa mensagem recebida
   */
  async handleMessage({ from, message, timestamp, raw }) {
    try {
      // Extrair número do WhatsApp (sem @s.whatsapp.net)
      const phoneNumber = from.split('@')[0];
      
      // Buscar usuário no Firebase
      const userId = await this.getUserIdByPhone(phoneNumber);
      
      if (!userId) {
        await this.whatsapp.sendTextMessage(from, 
          '👋 Olá! Para usar o NutriBuddy, você precisa primeiro se cadastrar no app.\n\n' +
          'Acesse: http://localhost:3001/register'
        );
        return;
      }

      // Verificar se é uma imagem (foto de alimento)
      if (raw.message?.imageMessage) {
        await this.handleFoodImage(from, userId, raw);
        return;
      }

      // Verificar se é áudio
      if (raw.message?.audioMessage) {
        await this.handleAudioMessage(from, userId, raw);
        return;
      }

      // Processar comando de texto
      await this.handleTextCommand(from, userId, message);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      await this.whatsapp.sendTextMessage(from, 
        '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
      );
    }
  }

  /**
   * Processa foto de alimento
   */
  async handleFoodImage(from, userId, raw) {
    try {
      await this.whatsapp.sendTextMessage(from, '📸 Analisando sua refeição...');

      // Download da imagem
      const buffer = await this.whatsapp.downloadMediaMessage(raw);
      
      // Analisar com IA
      const analysis = await aiService.analyzeFood(buffer, 'image/jpeg');

      if (!analysis.success) {
        await this.whatsapp.sendTextMessage(from,
          '❌ Não consegui analisar a imagem. Tente descrever o que você comeu:\n\n' +
          'Exemplo: "Comi 2 ovos mexidos com 2 fatias de pão integral"'
        );
        return;
      }

      const { data } = analysis;
      const caption = raw.message.imageMessage?.caption || '';

      // Salvar refeição no Firestore
      const mealData = {
        userId,
        date: new Date().toISOString().split('T')[0],
        name: caption || 'Refeição via WhatsApp',
        totalCalories: data.totalCalories,
        protein: data.totalProtein,
        carbs: data.totalCarbs,
        fat: data.totalFat,
        fiber: data.totalFiber,
        foods: data.foods,
        source: 'whatsapp',
        analysis: data.analysis,
        confidence: data.foods[0]?.confidence || 0.5,
        createdAt: new Date().toISOString()
      };

      await db.collection('meals').add(mealData);

      // Enviar resposta
      let response = `✅ *Refeição Registrada!*\n\n`;
      response += `📊 *Resumo Nutricional:*\n`;
      response += `🔥 Calorias: ${data.totalCalories} kcal\n`;
      response += `💪 Proteínas: ${data.totalProtein}g\n`;
      response += `🍞 Carboidratos: ${data.totalCarbs}g\n`;
      response += `🥑 Gorduras: ${data.totalFat}g\n\n`;

      response += `🍽️ *Alimentos Identificados:*\n`;
      data.foods.forEach((food, index) => {
        response += `${index + 1}. ${food.name} (${food.quantity}) - ${food.calories} kcal\n`;
      });

      response += `\n💡 *Análise:* ${data.analysis}\n`;
      response += `\n⭐ *Pontuação de Saúde:* ${data.healthScore}/10`;

      await this.whatsapp.sendTextMessage(from, response);

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      await this.whatsapp.sendTextMessage(from,
        '❌ Erro ao processar imagem. Tente novamente ou descreva o que você comeu.'
      );
    }
  }

  /**
   * Processa áudio (voz)
   */
  async handleAudioMessage(from, userId, raw) {
    await this.whatsapp.sendTextMessage(from,
      '🎤 Recebi seu áudio!\n\n' +
      'Por enquanto, prefiro que você descreva sua refeição por texto.\n\n' +
      'Exemplo: "Comi 200g de frango grelhado com 150g de arroz integral"'
    );
  }

  /**
   * Processa comandos de texto
   */
  async handleTextCommand(from, userId, message) {
    const msg = message.toLowerCase().trim();

    // Menu de ajuda
    if (msg === 'menu' || msg === 'ajuda' || msg === 'help') {
      await this.sendHelpMenu(from);
      return;
    }

    // Registrar água
    if (msg.includes('água') || msg.includes('agua') || msg.includes('ml')) {
      await this.handleWaterCommand(from, userId, msg);
      return;
    }

    // Registrar exercício
    if (msg.includes('exercício') || msg.includes('exercicio') || msg.includes('treino') || 
        msg.includes('corrida') || msg.includes('academia')) {
      await this.handleExerciseCommand(from, userId, msg);
      return;
    }

    // Consultar saldo calórico
    if (msg.includes('saldo') || msg.includes('resumo') || msg.includes('hoje')) {
      await this.handleSummaryCommand(from, userId);
      return;
    }

    // Registrar peso
    if (msg.includes('peso')) {
      await this.handleWeightCommand(from, userId, msg);
      return;
    }

    // Descrição de refeição (padrão)
    await this.handleMealDescription(from, userId, message);
  }

  /**
   * Menu de ajuda
   */
  async sendHelpMenu(from) {
    const menu = `🤖 *NutriBuddy - Menu de Comandos*\n\n` +
      `📸 *Envie uma foto* da sua refeição para análise automática\n\n` +
      `📝 *Comandos de Texto:*\n` +
      `• "Comi [descrição]" - Registrar refeição\n` +
      `• "Bebi 500ml de água" - Registrar água\n` +
      `• "Fiz 30min de corrida" - Registrar exercício\n` +
      `• "Meu peso está 75kg" - Registrar peso\n` +
      `• "Resumo" ou "Hoje" - Ver resumo do dia\n` +
      `• "Menu" ou "Ajuda" - Ver este menu\n\n` +
      `💡 *Dicas:*\n` +
      `• Seja específico nas quantidades\n` +
      `• Fotos com boa iluminação funcionam melhor\n` +
      `• Você pode enviar várias refeições por dia`;

    await this.whatsapp.sendTextMessage(from, menu);
  }

  /**
   * Registrar água
   */
  async handleWaterCommand(from, userId, message) {
    // Extrair quantidade em ml
    const match = message.match(/(\d+)\s*(ml|litro|l)/i);
    let amount = 250; // padrão

    if (match) {
      amount = parseInt(match[1]);
      if (match[2].toLowerCase().includes('l') && !match[2].toLowerCase().includes('ml')) {
        amount *= 1000; // converter litros para ml
      }
    }

    // Salvar no Firestore
    const waterData = {
      userId,
      amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      source: 'whatsapp'
    };

    await db.collection('water').add(waterData);

    await this.whatsapp.sendTextMessage(from,
      `💧 *Água Registrada!*\n\n` +
      `Você bebeu: ${amount}ml\n\n` +
      `Continue se hidratando! 💪`
    );
  }

  /**
   * Registrar exercício
   */
  async handleExerciseCommand(from, userId, message) {
    // Extrair duração
    const durationMatch = message.match(/(\d+)\s*(min|minuto|hora|h)/i);
    let duration = 30; // padrão

    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
      if (durationMatch[2].toLowerCase().includes('h')) {
        duration *= 60; // converter horas para minutos
      }
    }

    // Detectar tipo de exercício
    let type = 'other';
    let name = 'Exercício via WhatsApp';

    if (message.includes('corrida') || message.includes('correr')) {
      type = 'cardio';
      name = 'Corrida';
    } else if (message.includes('academia') || message.includes('musculação')) {
      type = 'strength';
      name = 'Musculação';
    } else if (message.includes('caminhada')) {
      type = 'cardio';
      name = 'Caminhada';
    }

    // Estimar calorias (5 kcal/min para cardio, 4 para outros)
    const caloriesBurned = Math.round(duration * (type === 'cardio' ? 6 : 4));

    // Salvar no Firestore
    const exerciseData = {
      userId,
      name,
      type,
      duration,
      caloriesBurned,
      intensity: 'moderate',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      source: 'whatsapp'
    };

    await db.collection('exercises').add(exerciseData);

    await this.whatsapp.sendTextMessage(from,
      `🏃 *Exercício Registrado!*\n\n` +
      `📝 ${name}\n` +
      `⏱️ Duração: ${duration} minutos\n` +
      `🔥 Calorias queimadas: ~${caloriesBurned} kcal\n\n` +
      `Parabéns pelo treino! 💪`
    );
  }

  /**
   * Resumo do dia
   */
  async handleSummaryCommand(from, userId) {
    const today = new Date().toISOString().split('T')[0];

    // Buscar dados do dia
    const [meals, water, exercises] = await Promise.all([
      db.collection('meals').where('userId', '==', userId).where('date', '==', today).get(),
      db.collection('water').where('userId', '==', userId).where('date', '==', today).get(),
      db.collection('exercises').where('userId', '==', userId).where('date', '==', today).get()
    ]);

    const totalCalories = meals.docs.reduce((sum, doc) => sum + (doc.data().totalCalories || 0), 0);
    const totalWater = water.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    const totalExercise = exercises.docs.reduce((sum, doc) => sum + (doc.data().duration || 0), 0);
    const totalBurned = exercises.docs.reduce((sum, doc) => sum + (doc.data().caloriesBurned || 0), 0);

    const balance = totalCalories - totalBurned;

    let response = `📊 *Resumo do Dia* - ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    response += `🍽️ *Alimentação:*\n`;
    response += `• Refeições: ${meals.size}\n`;
    response += `• Calorias consumidas: ${totalCalories} kcal\n\n`;
    
    response += `🏃 *Atividade Física:*\n`;
    response += `• Exercícios: ${exercises.size}\n`;
    response += `• Tempo total: ${totalExercise} min\n`;
    response += `• Calorias queimadas: ${totalBurned} kcal\n\n`;
    
    response += `💧 *Hidratação:*\n`;
    response += `• Água consumida: ${totalWater}ml\n\n`;
    
    response += `⚖️ *Saldo Calórico:* ${balance > 0 ? '+' : ''}${balance} kcal\n`;
    
    if (balance > 500) {
      response += `\n💡 Você consumiu mais calorias do que gastou. Considere aumentar a atividade física.`;
    } else if (balance < -500) {
      response += `\n💡 Você gastou mais calorias do que consumiu. Certifique-se de se alimentar adequadamente.`;
    } else {
      response += `\n✅ Seu saldo calórico está equilibrado!`;
    }

    await this.whatsapp.sendTextMessage(from, response);
  }

  /**
   * Registrar peso
   */
  async handleWeightCommand(from, userId, message) {
    const match = message.match(/(\d+\.?\d*)\s*kg/i);
    
    if (!match) {
      await this.whatsapp.sendTextMessage(from,
        'Por favor, informe seu peso no formato: "Meu peso está 75kg"'
      );
      return;
    }

    const weight = parseFloat(match[1]);

    // Salvar no Firestore
    const measurementData = {
      userId,
      weight,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      source: 'whatsapp'
    };

    await db.collection('measurements').add(measurementData);

    await this.whatsapp.sendTextMessage(from,
      `⚖️ *Peso Registrado!*\n\n` +
      `Seu peso atual: ${weight}kg\n\n` +
      `Continue acompanhando sua evolução! 📈`
    );
  }

  /**
   * Processa descrição de refeição em texto
   */
  async handleMealDescription(from, userId, description) {
    try {
      await this.whatsapp.sendTextMessage(from, '🤖 Analisando sua refeição...');

      // Analisar com IA
      const analysis = await aiService.analyzeTextDescription(description);

      if (!analysis.success) {
        await this.whatsapp.sendTextMessage(from,
          '❌ Não consegui entender. Tente ser mais específico.\n\n' +
          'Exemplo: "Comi 2 ovos mexidos, 2 fatias de pão integral e 1 banana"'
        );
        return;
      }

      const { data } = analysis;

      // Salvar refeição
      const mealData = {
        userId,
        date: new Date().toISOString().split('T')[0],
        name: description.substring(0, 100),
        totalCalories: data.totalCalories,
        protein: data.totalProtein,
        carbs: data.totalCarbs,
        fat: data.totalFat,
        fiber: data.totalFiber,
        foods: data.foods,
        source: 'whatsapp',
        analysis: data.analysis,
        createdAt: new Date().toISOString()
      };

      await db.collection('meals').add(mealData);

      // Enviar resposta
      let response = `✅ *Refeição Registrada!*\n\n`;
      response += `📊 *Resumo Nutricional:*\n`;
      response += `🔥 Calorias: ${data.totalCalories} kcal\n`;
      response += `💪 Proteínas: ${data.totalProtein}g\n`;
      response += `🍞 Carboidratos: ${data.totalCarbs}g\n`;
      response += `🥑 Gorduras: ${data.totalFat}g\n\n`;
      response += `💡 ${data.analysis}`;

      await this.whatsapp.sendTextMessage(from, response);

    } catch (error) {
      console.error('Erro ao processar descrição:', error);
      await this.whatsapp.sendTextMessage(from,
        '❌ Erro ao processar sua refeição. Tente novamente ou envie uma foto.'
      );
    }
  }

  /**
   * Busca userId pelo número de telefone
   */
  async getUserIdByPhone(phoneNumber) {
    try {
      const snapshot = await db.collection('users').where('phone', '==', phoneNumber).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].id;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }
}

module.exports = WhatsAppMessageHandler;

