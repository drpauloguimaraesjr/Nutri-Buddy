const admin = require('firebase-admin');

/**
 * AI Profile Service
 * Gerencia perfis de IA personalizados para cada paciente
 */

// Profile metadata com descrições completas
const PROFILE_METADATA = {
  welcoming: {
    emoji: '🤗',
    name: 'Acolhedor e Suave',
    description: 'Tom calmo, paciente e empático. Ideal para pacientes ansiosos ou sensíveis.',
    characteristics: [
      'Linguagem suave e reconfortante',
      'Valida emoções antes de orientar',
      'Evita pressão e palavras imperativas',
      'Foco no progresso, não na perfeição'
    ],
    example: 'Tudo bem se hoje não foi como planejado. Amanhã é uma nova chance 💙'
  },
  motivational: {
    emoji: '🔥',
    name: 'Motivacional e Energético',
    description: 'Entusiasmado e inspirador. Ideal para pacientes desmotivados que precisam de energia.',
    characteristics: [
      'Linguagem positiva e energizante',
      'Celebra cada pequena conquista',
      'Usa analogias de superação',
      'Frases curtas e impactantes'
    ],
    example: 'ISSO! Mais uma refeição saudável! Você está arrasando! 🔥'
  },
  direct: {
    emoji: '💪',
    name: 'Firme e Direto',
    description: 'Objetivo e sem rodeios. Ideal para pacientes que precisam de limites claros.',
    characteristics: [
      'Comunicação clara e objetiva',
      'Apresenta fatos e consequências',
      'Estabelece expectativas claras',
      'Não aceita desculpas, oferece soluções'
    ],
    example: '3 refeições fora do plano essa semana. Vamos ajustar? 📊'
  },
  humorous: {
    emoji: '😄',
    name: 'Descontraído com Humor',
    description: 'Leve e bem-humorado. Ideal para pacientes que respondem bem à leveza.',
    characteristics: [
      'Usa humor saudável (nunca ofensivo)',
      'Metáforas e comparações engraçadas',
      'Torna o processo mais leve',
      'Equilíbrio entre diversão e seriedade'
    ],
    example: 'Pizza às 23h? Aquele momento "fome da madrugada atacou"? 😄 Amanhã compensamos!'
  },
  mindful: {
    emoji: '🧘',
    name: 'Zen e Mindful',
    description: 'Reflexivo e consciente. Ideal para pacientes que valorizam conexão mente-corpo.',
    characteristics: [
      'Incentiva autopercepção corporal',
      'Questiona em vez de instruir',
      'Linguagem de mindfulness',
      'Conecta alimentação com emoções'
    ],
    example: 'Como você se sentiu após essa refeição? Mais energizado ou pesado? 🌱'
  },
  educational: {
    emoji: '📚',
    name: 'Educativo e Técnico',
    description: 'Informativo e didático. Ideal para pacientes curiosos que gostam de entender o porquê.',
    characteristics: [
      'Explica o raciocínio das recomendações',
      'Usa dados e fatos científicos',
      'Ensina enquanto orienta',
      'Empodera através do conhecimento'
    ],
    example: 'Proteína no café da manhã mantém saciedade. Estudos mostram redução de 60% na compulsão 📚'
  },
  coach: {
    emoji: '🎯',
    name: 'Coach Esportivo',
    description: 'Desafiador e focado em performance. Ideal para pacientes competitivos.',
    characteristics: [
      'Linguagem de treino e performance',
      'Estabelece metas e desafios',
      'Usa métricas mensuráveis',
      'Celebra recordes pessoais'
    ],
    example: 'META DA SEMANA: 5 dias com café proteico. Você topa? 🎯'
  },
  partner: {
    emoji: '🤝',
    name: 'Parceiro de Jornada',
    description: 'Colaborativo e de parceria. Ideal para pacientes que valorizam trabalho em equipe.',
    characteristics: [
      'Usa "nós" em vez de "você"',
      'Compartilha a responsabilidade',
      'Cria senso de time',
      'Celebra conquistas em conjunto'
    ],
    example: 'Vamos ajustar o jantar juntos? O que você acha de... 🤝'
  }
};

// Perfil padrão para novos pacientes
const DEFAULT_PROFILE = {
  profileType: 'welcoming',
  messageFrequency: 'medium',
  emojiLevel: 'medium',
  feedbackStyle: 'balanced',
  responseTiming: 'respectful',
  customInstructions: ''
};

/**
 * Busca o perfil de IA de um paciente
 * @param {string} patientId - ID do paciente
 * @returns {Promise<Object|null>} - Perfil de IA ou null se não existir
 */
async function getPatientAIProfile(patientId) {
  try {
    const db = admin.firestore();
    const profileDoc = await db.collection('ai_profiles').doc(patientId).get();
    
    if (!profileDoc.exists) {
      return null;
    }
    
    const data = profileDoc.data();
    return {
      patientId,
      config: data.config,
      metadata: PROFILE_METADATA[data.config.profileType],
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      createdBy: data.createdBy
    };
  } catch (error) {
    console.error('Error getting AI profile:', error);
    throw error;
  }
}

/**
 * Cria ou atualiza o perfil de IA de um paciente
 * @param {string} patientId - ID do paciente
 * @param {Object} config - Configuração do perfil
 * @param {string} prescriberId - ID do nutricionista
 * @returns {Promise<Object>} - Perfil criado/atualizado
 */
async function savePatientAIProfile(patientId, config, prescriberId) {
  try {
    const db = admin.firestore();
    const profileRef = db.collection('ai_profiles').doc(patientId);
    const existingProfile = await profileRef.get();
    
    const now = admin.firestore.FieldValue.serverTimestamp();
    const profileData = {
      config: {
        profileType: config.profileType || DEFAULT_PROFILE.profileType,
        messageFrequency: config.messageFrequency || DEFAULT_PROFILE.messageFrequency,
        emojiLevel: config.emojiLevel || DEFAULT_PROFILE.emojiLevel,
        feedbackStyle: config.feedbackStyle || DEFAULT_PROFILE.feedbackStyle,
        responseTiming: config.responseTiming || DEFAULT_PROFILE.responseTiming,
        customInstructions: config.customInstructions || ''
      },
      updatedAt: now
    };
    
    if (existingProfile.exists) {
      // Atualizar perfil existente
      await profileRef.update(profileData);
    } else {
      // Criar novo perfil
      await profileRef.set({
        ...profileData,
        createdAt: now,
        createdBy: prescriberId
      });
    }
    
    return {
      patientId,
      config: profileData.config,
      metadata: PROFILE_METADATA[profileData.config.profileType]
    };
  } catch (error) {
    console.error('Error saving AI profile:', error);
    throw error;
  }
}

/**
 * Busca o perfil de IA ou retorna o padrão
 * @param {string} patientId - ID do paciente
 * @returns {Promise<Object>} - Perfil de IA (existente ou padrão)
 */
async function getOrCreateDefaultProfile(patientId) {
  const profile = await getPatientAIProfile(patientId);
  
  if (profile) {
    return profile;
  }
  
  // Retorna perfil padrão sem salvar no banco
  return {
    patientId,
    config: DEFAULT_PROFILE,
    metadata: PROFILE_METADATA[DEFAULT_PROFILE.profileType],
    isDefault: true
  };
}

/**
 * Gera prompt personalizado para IA baseado no perfil
 * @param {Object} profile - Perfil de IA do paciente
 * @param {string} context - Contexto adicional (refeição, horário, etc)
 * @returns {string} - Prompt personalizado
 */
function generateAIPrompt(profile, context = '') {
  const config = profile.config;
  const metadata = PROFILE_METADATA[config.profileType];
  
  let prompt = `Você é um assistente nutricional com o seguinte perfil de comunicação:\n\n`;
  
  // Tipo de perfil
  prompt += `PERFIL: ${metadata.name} ${metadata.emoji}\n`;
  prompt += `DESCRIÇÃO: ${metadata.description}\n\n`;
  
  // Características
  prompt += `CARACTERÍSTICAS:\n`;
  metadata.characteristics.forEach(char => {
    prompt += `- ${char}\n`;
  });
  prompt += `\n`;
  
  // Frequência de mensagens
  const frequencyMap = {
    high: 'alta (3-4 interações por dia)',
    medium: 'média (2 interações por dia)',
    low: 'baixa (1 interação por dia)'
  };
  prompt += `FREQUÊNCIA: ${frequencyMap[config.messageFrequency]}\n`;
  
  // Nível de emoji
  const emojiMap = {
    high: 'muitos emojis para expressividade',
    medium: 'uso moderado de emojis',
    low: 'poucos ou nenhum emoji'
  };
  prompt += `EMOJIS: ${emojiMap[config.emojiLevel]}\n`;
  
  // Estilo de feedback
  const feedbackMap = {
    positive: 'sempre positivo, foca no que deu certo',
    balanced: 'balanceado, pontos positivos + áreas de melhoria',
    analytical: 'analítico, fatos e dados com menos emoção'
  };
  prompt += `FEEDBACK: ${feedbackMap[config.feedbackStyle]}\n`;
  
  // Timing
  const timingMap = {
    immediate: 'responde imediatamente quando possível',
    scheduled: 'responde em horários programados',
    respectful: 'evita enviar mensagens à noite/madrugada'
  };
  prompt += `TIMING: ${timingMap[config.responseTiming]}\n\n`;
  
  // Instruções customizadas
  if (config.customInstructions) {
    prompt += `INSTRUÇÕES ADICIONAIS DO NUTRICIONISTA:\n${config.customInstructions}\n\n`;
  }
  
  // Exemplo
  prompt += `EXEMPLO DE RESPOSTA: "${metadata.example}"\n\n`;
  
  // Contexto
  if (context) {
    prompt += `CONTEXTO ATUAL:\n${context}\n\n`;
  }
  
  prompt += `Mantenha sempre este perfil de comunicação em todas as suas respostas.`;
  
  return prompt;
}

/**
 * Lista todos os tipos de perfil disponíveis
 * @returns {Object} - Metadata de todos os perfis
 */
function getAllProfileTypes() {
  return PROFILE_METADATA;
}

/**
 * Deleta o perfil de IA de um paciente
 * @param {string} patientId - ID do paciente
 */
async function deletePatientAIProfile(patientId) {
  try {
    const db = admin.firestore();
    await db.collection('ai_profiles').doc(patientId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting AI profile:', error);
    throw error;
  }
}

module.exports = {
  getPatientAIProfile,
  savePatientAIProfile,
  getOrCreateDefaultProfile,
  generateAIPrompt,
  getAllProfileTypes,
  deletePatientAIProfile,
  PROFILE_METADATA,
  DEFAULT_PROFILE
};

