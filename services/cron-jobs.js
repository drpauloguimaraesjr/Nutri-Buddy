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
const { db } = require('../config/firebase');
const twilioService = require('./twilio-service');
const admin = require('firebase-admin');

let isRunning = false;
let scheduledMessagesRunning = false;

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

  // Processar mensagens agendadas a cada 1 minuto
  // 🛑 TEMPORARIAMENTE DESABILITADO - Aguardando criação de índice no Firestore
  // Reative após criar o índice: https://console.firebase.google.com/v1/r/project/nutribuddy-2fc9c/firestore/indexes
  /*
  cron.schedule('* * * * *', async () => {
    if (scheduledMessagesRunning) {
      return;
    }

    scheduledMessagesRunning = true;
    
    try {
      // Buscar mensagens pendentes que já passaram da hora
      const now = new Date();
      const messagesSnapshot = await db.collection('scheduledMessages')
        .where('status', '==', 'pending')
        .where('scheduledFor', '<=', now)
        .limit(20)
        .get();

      if (messagesSnapshot.empty) {
        scheduledMessagesRunning = false;
        return;
      }

      console.log(`\n📨 [CRON] Processando ${messagesSnapshot.size} mensagens agendadas...`);

      for (const doc of messagesSnapshot.docs) {
        const messageId = doc.id;
        const messageData = doc.data();
        
        try {
          // Enviar via WhatsApp
          if (messageData.channel === 'whatsapp' || messageData.channel === 'both') {
            if (messageData.patientPhone && twilioService.isTwilioConfigured) {
              const result = await twilioService.sendTextMessage(
                messageData.patientPhone,
                messageData.message
              );

              if (result.success) {
                console.log(`✅ [CRON] WhatsApp enviado para ${messageData.patientName}`);
              } else {
                console.error(`❌ [CRON] Erro ao enviar WhatsApp:`, result.error);
              }
            }
          }

          // Enviar via chat interno
          if (messageData.channel === 'internal' || messageData.channel === 'both') {
            // Buscar conversa
            const conversationsQuery = await db.collection('conversations')
              .where('patientId', '==', messageData.patientId)
              .where('prescriberId', '==', messageData.prescriberId)
              .limit(1)
              .get();

            if (!conversationsQuery.empty) {
              const conversationId = conversationsQuery.docs[0].id;
              
              // Adicionar mensagem no chat
              await db.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                  conversationId,
                  senderId: messageData.prescriberId,
                  senderRole: 'prescriber',
                  content: messageData.message,
                  type: 'text',
                  status: 'sent',
                  channel: 'internal',
                  isAiGenerated: false,
                  isScheduled: true,
                  scheduledMessageId: messageId,
                  createdAt: new Date(),
                });

              // Atualizar conversa
              await db.collection('conversations')
                .doc(conversationId)
                .update({
                  lastMessage: messageData.message,
                  lastMessageAt: new Date(),
                  lastMessageBy: 'prescriber',
                  patientUnreadCount: admin.firestore.FieldValue.increment(1),
                  updatedAt: new Date(),
                });

              console.log(`✅ [CRON] Mensagem interna enviada para ${messageData.patientName}`);
            }
          }

          // Marcar como enviada
          await db.collection('scheduledMessages').doc(messageId).update({
            status: 'sent',
            sentAt: new Date(),
            updatedAt: new Date(),
          });

          // Se for recorrente, criar próxima mensagem
          if (messageData.repeat && messageData.repeat !== 'once') {
            const nextScheduledFor = calculateNextScheduleTime(
              messageData.scheduledFor.toDate(),
              messageData.repeat
            );

            await db.collection('scheduledMessages').add({
              ...messageData,
              scheduledFor: nextScheduledFor,
              status: 'pending',
              sentAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            console.log(`🔄 [CRON] Próxima mensagem agendada para ${nextScheduledFor}`);
          }

        } catch (error) {
          console.error(`❌ [CRON] Erro ao processar mensagem ${messageId}:`, error);
          
          // Marcar como falha
          await db.collection('scheduledMessages').doc(messageId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date(),
          });
        }
      }

      console.log('✅ [CRON] Processamento de mensagens agendadas concluído');

    } catch (error) {
      console.error('❌ [CRON] Erro no cron de mensagens agendadas:', error);
    } finally {
      scheduledMessagesRunning = false;
    }
  });
  */

  console.log('✅ [CRON] Cron jobs configurados:');
  console.log('   - Validação de pacientes: a cada 6 horas');
  console.log('   - Validação inicial: em 2 minutos');
  console.log('   - Mensagens agendadas: 🛑 DESABILITADO (aguardando índice Firestore)');
}

/**
 * Calcular próximo horário baseado em repeat
 */
function calculateNextScheduleTime(lastTime, repeat) {
  const next = new Date(lastTime);
  
  switch (repeat) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1); // fallback para daily
  }
  
  return next;
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

