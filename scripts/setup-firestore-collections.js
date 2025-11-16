#!/usr/bin/env node

/**
 * SETUP FIRESTORE COLLECTIONS
 * 
 * Script para criar automaticamente as collections necessárias
 * para o sistema conversacional de registro de refeições
 * 
 * USO: node scripts/setup-firestore-collections.js
 */

const { db } = require('../config/firebase');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}🔹 ${msg}${colors.reset}`)
};

// ============================================================================
// COLLECTION 1: conversationContexts
// ============================================================================

async function createConversationContextsCollection() {
  log.step('Criando collection: conversationContexts');
  
  const exampleContext = {
    conversationId: 'EXAMPLE_CONTEXT_123',
    patientId: 'patient_example_456',
    prescriberId: 'prescriber_example_789',
    currentContext: {
      type: 'meal_logging',
      status: 'collecting',
      data: {
        mealType: 'lunch',
        startedAt: new Date().toISOString(),
        photoUrl: 'https://example.com/photo.jpg',
        foods: [
          {
            id: 'food_example_1',
            name: 'Torta de frango',
            weight_grams: 325,
            confidence: 'high',
            source: 'vision_analysis',
            macros: {
              protein: 65,
              carbs: 48.75,
              fats: 24.375,
              calories: 682.5
            },
            addedAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
          }
        ],
        totalMacros: {
          protein: 65,
          carbs: 48.75,
          fats: 24.375,
          calories: 682.5
        },
        conversationFlow: [
          {
            step: 'food_added',
            timestamp: new Date().toISOString(),
            data: {
              food_name: 'Torta de frango',
              weight: 325
            }
          }
        ],
        pendingQuestion: 'Tem mais alguma coisa nesta refeição?',
        awaitingResponse: true
      },
      startedAt: new Date().toISOString()
    },
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1 hora
  };

  try {
    await db.collection('conversationContexts').doc('EXAMPLE_CONTEXT_123').set(exampleContext);
    log.success('Collection conversationContexts criada com documento de exemplo');
    return true;
  } catch (error) {
    log.error(`Erro ao criar conversationContexts: ${error.message}`);
    return false;
  }
}

// ============================================================================
// COLLECTION 2: mealLogs
// ============================================================================

async function createMealLogsCollection() {
  log.step('Criando collection: mealLogs');
  
  const exampleMeal = {
    id: 'meal_log_example_123',
    patientId: 'patient_example_456',
    prescriberId: 'prescriber_example_789',
    conversationId: 'EXAMPLE_CONTEXT_123',
    mealType: 'lunch',
    timestamp: new Date().toISOString(),
    photoUrl: 'https://example.com/photo.jpg',
    foods: [
      {
        name: 'Torta de frango',
        weight_grams: 325,
        macros: {
          protein: 65,
          carbs: 48.75,
          fats: 24.375,
          calories: 682.5
        },
        source: 'vision_analysis'
      },
      {
        name: 'Arroz integral',
        weight_grams: 100,
        macros: {
          protein: 2.6,
          carbs: 23,
          fats: 0.9,
          calories: 111
        },
        source: 'user_input'
      }
    ],
    totalMacros: {
      protein: 67.6,
      carbs: 71.75,
      fats: 25.275,
      calories: 793.5
    },
    adherence: {
      score: 100,
      approvedFoods: ['Torta de frango', 'Arroz integral'],
      unapprovedFoods: []
    },
    notes: 'Refeição de exemplo registrada via setup script',
    createdAt: new Date().toISOString()
  };

  try {
    await db.collection('mealLogs').doc('meal_log_example_123').set(exampleMeal);
    log.success('Collection mealLogs criada com documento de exemplo');
    return true;
  } catch (error) {
    log.error(`Erro ao criar mealLogs: ${error.message}`);
    return false;
  }
}

// ============================================================================
// COLLECTION 3: dailyMacros
// ============================================================================

async function createDailyMacrosCollection() {
  log.step('Criando collection: dailyMacros');
  
  const today = new Date().toISOString().split('T')[0];
  const docId = `patient_example_456_${today}`;
  
  const exampleDailyMacros = {
    patientId: 'patient_example_456',
    date: today,
    protein: 120.5,
    carbs: 180.25,
    fats: 55.8,
    calories: 1650.75,
    mealCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await db.collection('dailyMacros').doc(docId).set(exampleDailyMacros);
    log.success('Collection dailyMacros criada com documento de exemplo');
    return true;
  } catch (error) {
    log.error(`Erro ao criar dailyMacros: ${error.message}`);
    return false;
  }
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

async function validateCollections() {
  log.step('Validando collections criadas...');
  
  const results = {
    conversationContexts: false,
    mealLogs: false,
    dailyMacros: false
  };

  // Validar conversationContexts
  try {
    const contextDoc = await db.collection('conversationContexts').doc('EXAMPLE_CONTEXT_123').get();
    results.conversationContexts = contextDoc.exists;
    if (contextDoc.exists) {
      log.success('✓ conversationContexts validada');
    }
  } catch (error) {
    log.error(`✗ conversationContexts: ${error.message}`);
  }

  // Validar mealLogs
  try {
    const mealDoc = await db.collection('mealLogs').doc('meal_log_example_123').get();
    results.mealLogs = mealDoc.exists;
    if (mealDoc.exists) {
      log.success('✓ mealLogs validada');
    }
  } catch (error) {
    log.error(`✗ mealLogs: ${error.message}`);
  }

  // Validar dailyMacros
  try {
    const today = new Date().toISOString().split('T')[0];
    const docId = `patient_example_456_${today}`;
    const dailyDoc = await db.collection('dailyMacros').doc(docId).get();
    results.dailyMacros = dailyDoc.exists;
    if (dailyDoc.exists) {
      log.success('✓ dailyMacros validada');
    }
  } catch (error) {
    log.error(`✗ dailyMacros: ${error.message}`);
  }

  return results;
}

// ============================================================================
// TESTAR QUERIES
// ============================================================================

async function testQueries() {
  log.step('Testando queries básicas...');

  try {
    // Testar query em mealLogs
    const mealsSnapshot = await db.collection('mealLogs')
      .where('patientId', '==', 'patient_example_456')
      .limit(1)
      .get();
    
    if (!mealsSnapshot.empty) {
      log.success('✓ Query em mealLogs funcionando');
    } else {
      log.warning('⚠ Query em mealLogs retornou vazio (normal se só tem exemplo)');
    }

    // Testar query em conversationContexts
    const contextsSnapshot = await db.collection('conversationContexts')
      .where('patientId', '==', 'patient_example_456')
      .limit(1)
      .get();
    
    if (!contextsSnapshot.empty) {
      log.success('✓ Query em conversationContexts funcionando');
    } else {
      log.warning('⚠ Query em conversationContexts retornou vazio');
    }

    return true;
  } catch (error) {
    log.error(`Erro ao testar queries: ${error.message}`);
    
    if (error.code === 9) {
      log.warning('');
      log.warning('⚠️  ÍNDICES COMPOSTOS NECESSÁRIOS:');
      log.warning('');
      log.warning('Acesse Firebase Console → Firestore → Indexes');
      log.warning('Clique no link de erro ou crie manualmente:');
      log.warning('');
      log.warning('1. mealLogs:');
      log.warning('   - patientId (Ascending)');
      log.warning('   - timestamp (Ascending)');
      log.warning('');
      log.warning('2. conversationContexts:');
      log.warning('   - patientId (Ascending)');
      log.warning('   - expiresAt (Ascending)');
      log.warning('');
    }
    
    return false;
  }
}

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

function printReport(results, queriesOk) {
  console.log('');
  console.log(`${colors.cyan}================================================${colors.reset}`);
  console.log(`${colors.cyan}📊 RELATÓRIO FINAL${colors.reset}`);
  console.log(`${colors.cyan}================================================${colors.reset}`);
  console.log('');
  
  console.log('Collections criadas:');
  console.log(`  conversationContexts: ${results.conversationContexts ? '✅' : '❌'}`);
  console.log(`  mealLogs: ${results.mealLogs ? '✅' : '❌'}`);
  console.log(`  dailyMacros: ${results.dailyMacros ? '✅' : '❌'}`);
  console.log('');
  
  console.log(`Queries funcionando: ${queriesOk ? '✅' : '⚠️  (índices pendentes)'}`);
  console.log('');
  
  if (results.conversationContexts && results.mealLogs && results.dailyMacros) {
    console.log(`${colors.green}🎉 SUCESSO! Firestore configurado e pronto!${colors.reset}`);
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Testar endpoints via cURL ou Postman');
    console.log('2. Configurar workflow N8N');
    console.log('3. Criar índices compostos (se necessário)');
  } else {
    console.log(`${colors.red}⚠️  Algumas collections não foram criadas.${colors.reset}`);
    console.log('Verifique os erros acima e tente novamente.');
  }
  
  console.log('');
  console.log(`${colors.cyan}================================================${colors.reset}`);
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('');
  console.log(`${colors.magenta}🔥 SETUP FIRESTORE COLLECTIONS${colors.reset}`);
  console.log(`${colors.magenta}================================${colors.reset}`);
  console.log('');

  try {
    // Criar collections
    const contextOk = await createConversationContextsCollection();
    const mealsOk = await createMealLogsCollection();
    const dailyOk = await createDailyMacrosCollection();

    console.log('');

    // Validar
    const validationResults = await validateCollections();

    console.log('');

    // Testar queries
    const queriesOk = await testQueries();

    // Relatório
    printReport(validationResults, queriesOk);

    process.exit(0);
  } catch (error) {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { 
  createConversationContextsCollection,
  createMealLogsCollection,
  createDailyMacrosCollection
};

