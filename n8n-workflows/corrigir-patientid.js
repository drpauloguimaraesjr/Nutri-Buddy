// 🔧 SCRIPT DE CORREÇÃO AUTOMÁTICA
// Este script corrige conversas com patientId incorreto
// Execute no Console do Firebase (https://console.firebase.google.com/)

// CONFIGURAÇÃO
const PRESCRIBER_UID = 'hiAf8r28RmfnppmYBpvxQwTroNI2'; // UID do prescritor
const CORRECT_PATIENT_UID = 'INSIRA_UID_CORRETO_AQUI'; // ← PREENCHA COM O UID CORRETO DO PACIENTE

// ========================================
// EXECUÇÃO
// ========================================

(async () => {
  console.log('🔧 ========================================');
  console.log('🔧 CORREÇÃO AUTOMÁTICA - PATIENTID');
  console.log('🔧 ========================================\n');

  if (CORRECT_PATIENT_UID === 'INSIRA_UID_CORRETO_AQUI') {
    console.error('❌ ERRO: Você precisa preencher CORRECT_PATIENT_UID!');
    console.log('💡 Execute o script diagnostico-completo.js primeiro');
    console.log('💡 Copie o UID correto do paciente e cole acima');
    return;
  }

  // Importar Firebase
  const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
  
  console.log('🔍 Buscando conversas com patientId incorreto...');
  
  try {
    // Buscar conversas onde patientId = PRESCRIBER_UID (incorreto)
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('patientId', '==', PRESCRIBER_UID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('✅ Nenhuma conversa com patientId incorreto encontrada!');
      return;
    }

    console.log(`\n📋 Encontradas ${snapshot.size} conversa(s) com patientId incorreto:\n`);

    for (const conversationDoc of snapshot.docs) {
      const conversationId = conversationDoc.id;
      const conversationData = conversationDoc.data();

      console.log(`  Conversa: ${conversationId}`);
      console.log(`    PatientId atual: ${conversationData.patientId} ❌`);
      console.log(`    PatientId correto: ${CORRECT_PATIENT_UID} ✅`);
      console.log(`    PrescriberId: ${conversationData.prescriberId}`);

      // Perguntar confirmação
      const confirmar = confirm(`\nCorrigir conversa ${conversationId}?\n\nDe: ${conversationData.patientId}\nPara: ${CORRECT_PATIENT_UID}`);

      if (confirmar) {
        // Atualizar conversa
        await updateDoc(doc(db, 'conversations', conversationId), {
          patientId: CORRECT_PATIENT_UID,
          updatedAt: new Date(),
        });

        console.log(`    ✅ Conversa ${conversationId} corrigida!\n`);
      } else {
        console.log(`    ⏭️  Conversa ${conversationId} pulada.\n`);
      }
    }

    console.log('\n🎉 Correção concluída!');
    console.log('💡 Teste enviando uma nova mensagem no chat');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
})();

