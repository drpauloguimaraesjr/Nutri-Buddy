// 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO
// Cole este código no Console do Navegador (F12) enquanto estiver logado como PACIENTE

(async () => {
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNÓSTICO COMPLETO - SENDERID BUG');
  console.log('🔍 ========================================\n');

  // Verificar se Firebase Auth está disponível
  if (typeof auth === 'undefined' || typeof db === 'undefined') {
    console.error('❌ Firebase não está disponível!');
    console.log('💡 Execute este script na página do chat do paciente');
    return;
  }

  // 1. VERIFICAR USUÁRIO AUTENTICADO
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ Nenhum usuário autenticado!');
    return;
  }

  console.log('✅ 1. USUÁRIO FIREBASE AUTENTICADO:');
  console.log('   UID:', user.uid);
  console.log('   Email:', user.email);
  console.log('   Display Name:', user.displayName);

  // 2. VERIFICAR TOKEN
  const token = await user.getIdToken();
  console.log('\n✅ 2. TOKEN FIREBASE:');
  console.log('   Token (50 primeiros chars):', token.substring(0, 50) + '...');

  // Decodificar token (base64)
  try {
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('   Token UID:', payload.user_id || payload.sub);
    console.log('   Token Email:', payload.email);
  } catch (e) {
    console.log('   (Não foi possível decodificar token)');
  }

  // 3. VERIFICAR DOCUMENTO NO FIRESTORE
  console.log('\n✅ 3. DOCUMENTO NO FIRESTORE (users):');
  const { getDoc, doc } = await import('firebase/firestore');
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('   Role:', userData.role);
      console.log('   DisplayName:', userData.displayName);
      console.log('   PrescriberId:', userData.prescriberId || 'N/A');
      console.log('   Documento completo:', userData);
    } else {
      console.error('   ❌ Documento NÃO existe no Firestore!');
    }
  } catch (error) {
    console.error('   ❌ Erro ao buscar documento:', error.message);
  }

  // 4. VERIFICAR CONVERSAS
  console.log('\n✅ 4. CONVERSAS DO USUÁRIO:');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://web-production-c9eaf.up.railway.app';
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/messages/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   Total de conversas: ${data.conversations?.length || 0}`);
      
      if (data.conversations && data.conversations.length > 0) {
        data.conversations.forEach((conv, idx) => {
          console.log(`\n   Conversa ${idx + 1}:`);
          console.log(`     ID: ${conv.id}`);
          console.log(`     PatientId: ${conv.patientId}`);
          console.log(`     PrescriberId: ${conv.prescriberId}`);
          console.log(`     PatientId === UID do usuário? ${conv.patientId === user.uid ? '✅ SIM' : '❌ NÃO'}`);
          
          if (conv.patientId !== user.uid) {
            console.error(`     ⚠️ PROBLEMA DETECTADO: patientId deveria ser ${user.uid}`);
          }
        });
      }
    } else {
      console.error('   ❌ Erro ao buscar conversas:', response.status);
    }
  } catch (error) {
    console.error('   ❌ Erro ao buscar conversas:', error.message);
  }

  // 5. TESTAR ENVIO DE MENSAGEM (SIMULADO)
  console.log('\n✅ 5. TESTE DE PAYLOAD DE MENSAGEM:');
  console.log('   Se você enviar uma mensagem agora, o backend receberá:');
  console.log('   {');
  console.log(`     conversationId: "...",`);
  console.log(`     senderId: "${user.uid}",  ← Do token Firebase`);
  console.log(`     senderRole: "...",  ← Do Firestore (users/${user.uid}/role)`);
  console.log('     content: "sua mensagem",');
  console.log('     type: "text"');
  console.log('   }');

  // 6. RESUMO
  console.log('\n🎯 ========================================');
  console.log('🎯 RESUMO DO DIAGNÓSTICO:');
  console.log('🎯 ========================================');
  console.log(`✓ UID do usuário autenticado: ${user.uid}`);
  console.log(`✓ Este UID será usado como senderId em todas as mensagens`);
  console.log('\n💡 Se as mensagens estão sendo salvas com senderId errado:');
  console.log('   1. Verifique se o patientId na conversa está correto');
  console.log('   2. Verifique se você está logado com a conta correta');
  console.log('   3. Envie este log completo para análise');
  
  console.log('\n✅ Diagnóstico concluído!');
})();

