// test-firebase-auth.js - Teste se Firebase Auth está habilitado
const admin = require('firebase-admin');
require('dotenv').config();

// Limpar apps existentes
if (admin.apps.length > 0) {
  admin.apps.forEach(app => {
    try {
      app.delete();
    } catch (e) {}
  });
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK inicializado\n');
} catch (error) {
  console.error('❌ Erro ao inicializar:', error.message);
  process.exit(1);
}

async function testAuth() {
  try {
    const auth = admin.auth();
    
    console.log('🔍 Testando Firebase Authentication...\n');
    
    // Tentar listar usuários (operações básicas)
    try {
      const listResult = await auth.listUsers(1);
      console.log('✅ Firebase Auth está HABILITADO e FUNCIONANDO!');
      console.log(`   Total de usuários: ${listResult.users.length} (primeiros ${listResult.pageToken ? '1000+' : listResult.users.length})\n`);
      
      // Tentar criar um usuário de teste
      console.log('🧪 Testando criação de usuário...');
      const testEmail = 'test-' + Date.now() + '@nutribuddy.com';
      
      const newUser = await auth.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        displayName: 'Test User',
        emailVerified: true
      });
      
      console.log('✅ Usuário de teste criado com sucesso!');
      console.log(`   UID: ${newUser.uid}`);
      console.log(`   Email: ${newUser.email}\n`);
      
      // Deletar usuário de teste
      await auth.deleteUser(newUser.uid);
      console.log('✅ Usuário de teste deletado\n');
      
      console.log('🎯 CONCLUSÃO: Firebase Auth está totalmente funcional!');
      console.log('   O problema pode estar em outro lugar.\n');
      
      process.exit(0);
      
    } catch (error) {
      if (error.code === 'auth/configuration-not-found') {
        console.error('❌ ERRO: Firebase Authentication NÃO está habilitado!');
        console.error('\n📋 SOLUÇÃO:\n');
        console.error('1. Acesse: https://console.firebase.google.com');
        console.error(`2. Selecione o projeto: ${process.env.FIREBASE_PROJECT_ID}`);
        console.error('3. No menu lateral, clique em "Authentication"');
        console.error('4. Clique em "Get started" (se aparecer)');
        console.error('5. Habilite pelo menos um método de autenticação:');
        console.error('   - Email/Password (recomendado)');
        console.error('   - Ou outro método de sua escolha');
        console.error('6. Salve as configurações');
        console.error('7. Aguarde alguns segundos');
        console.error('8. Execute novamente: node generate-token.js\n');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error);
    process.exit(1);
  }
}

testAuth();

