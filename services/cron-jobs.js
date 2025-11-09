/**
 * Serviço de Cron Jobs Automáticos
 * 
 * Executa tarefas agendadas automaticamente:
 * - Validação de pacientes a cada 6 horas
 * - Limpeza de dados antigos
 * - Outras tarefas de manutenção
 */

const cron = require('node-cron');
const { validateAllPatients } = require('./patient-validator');

let isRunning = false;

/**
 * Inicia todos os cron jobs
 */
function startCronJobs() {
  console.log('🕐 [CRON] Iniciando cron jobs...');

  // Validação de pacientes a cada 6 horas
  // Executa às: 00:00, 06:00, 12:00, 18:00
  cron.schedule('0 */6 * * *', async () => {
    if (isRunning) {
      console.log('⚠️ [CRON] Validation already running, skipping...');
      return;
    }

    isRunning = true;
    console.log('\n🔧 [CRON] Starting scheduled patient validation...');
    
    try {
      const results = await validateAllPatients();
      
      console.log('✅ [CRON] Patient validation completed');
      console.log(`   Checked: ${results.checked}`);
      console.log(`   Fixed: ${results.fixed}`);
      console.log(`   Errors: ${results.errors.length}`);
      
      if (results.fixed > 0) {
        console.log('\n📋 [CRON] Details:');
        results.details.forEach(detail => {
          console.log(`   - ${detail.email}:`, detail.fixes.join(', '));
        });
      }
      
      if (results.errors.length > 0) {
        console.error('\n❌ [CRON] Errors:');
        results.errors.forEach(error => {
          console.error(`   - ${error.email}:`, error.errors.join(', '));
        });
      }
    } catch (error) {
      console.error('❌ [CRON] Error in scheduled validation:', error);
    } finally {
      isRunning = false;
    }
  });

  // Validação inicial ao iniciar o servidor (após 2 minutos)
  setTimeout(async () => {
    console.log('\n🔧 [CRON] Running initial patient validation...');
    try {
      const results = await validateAllPatients();
      console.log('✅ [CRON] Initial validation completed');
      console.log(`   Checked: ${results.checked}, Fixed: ${results.fixed}`);
    } catch (error) {
      console.error('❌ [CRON] Error in initial validation:', error);
    }
  }, 120000); // 2 minutos após iniciar

  console.log('✅ [CRON] Cron jobs configurados:');
  console.log('   - Validação de pacientes: a cada 6 horas');
  console.log('   - Validação inicial: em 2 minutos');
}

/**
 * Para todos os cron jobs (para testes)
 */
function stopCronJobs() {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 [CRON] Todos os cron jobs foram parados');
}

/**
 * Executa validação manual
 */
async function runManualValidation() {
  console.log('🔧 [CRON] Running manual patient validation...');
  
  try {
    const results = await validateAllPatients();
    return results;
  } catch (error) {
    console.error('❌ [CRON] Error in manual validation:', error);
    throw error;
  }
}

module.exports = {
  startCronJobs,
  stopCronJobs,
  runManualValidation
};

