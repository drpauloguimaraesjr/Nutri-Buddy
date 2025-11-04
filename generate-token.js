// generate-token.js

const admin = require('firebase-admin');
require('dotenv').config();

// Verificar se Firebase já está inicializado e deletar apps existentes
if (admin.apps.length > 0) {
  admin.apps.forEach(app => {
    try {
      app.delete();
    } catch (e) {
      // Ignorar erros ao deletar
    }
  });
}

// Validar variáveis de ambiente
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('\n🔧 Verifique o arquivo .env e certifique-se de que contém:');
  console.error('   - FIREBASE_PROJECT_ID');
  console.error('   - FIREBASE_PRIVATE_KEY');
  console.error('   - FIREBASE_CLIENT_EMAIL\n');
  process.exit(1);
}

// Preparar credenciais
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: privateKey,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Inicializar Firebase
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  console.error('\nDetalhes:', error);
  process.exit(1);
}

async function generateToken() {
  try {
    const auth = admin.auth();
    
    // Criar ou buscar usuário de teste
    const testEmail = 'n8n-test@nutribuddy.com';
    let user;
    
    try {
      user = await auth.getUserByEmail(testEmail);
      console.log('✅ Usuário encontrado:', user.email);
    } catch (error) {
      user = await auth.createUser({
        email: testEmail,
        password: 'TempPassword123!',
        displayName: 'N8N Test User',
        emailVerified: true
      });
      console.log('✅ Usuário criado:', user.email);
    }
    
    // Gerar custom token
    const customToken = await auth.createCustomToken(user.uid);
    
    console.log('\n🎯 TOKEN GERADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(customToken);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 INFORMAÇÕES:');
    console.log('User ID:', user.uid);
    console.log('Email:', user.email);
    console.log('Display Name:', user.displayName);
    console.log('\n💡 COMO USAR NO N8N:');
    console.log('1. Copie o token acima (entre as linhas)');
    console.log('2. No N8N Cloud → Settings → Environment Variables');
    console.log('3. FIREBASE_TOKEN = [cole o token aqui]');
    console.log('4. Save');
    console.log('\n✅ Este token nunca expira e é perfeito para N8N!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao gerar token:', error.message);
    console.error('\n📋 Detalhes do erro:');
    console.error('   Código:', error.code || 'N/A');
    console.error('   Tipo:', error.constructor.name);
    
    if (error.message.includes('configuration')) {
      console.error('\n🔍 DIAGNÓSTICO:');
      console.error('   O erro indica que as credenciais não correspondem ao projeto.');
      console.error('   Isso pode acontecer se:');
      console.error('   1. As credenciais são de outro projeto Firebase');
      console.error('   2. O projeto Firebase foi deletado ou desativado');
      console.error('   3. A Service Account foi revogada');
    }
    
    console.error('\n🔧 SOLUÇÃO:');
    console.error('   1. Acesse: https://console.firebase.google.com');
    console.error('   2. Selecione o projeto: nutribuddy-2fc9c');
    console.error('   3. Vá em ⚙️ Settings → Service accounts');
    console.error('   4. Gere uma nova chave privada');
    console.error('   5. Atualize o arquivo .env com as novas credenciais');
    console.error('\n📖 Veja: COMO-OBTER-CREDENCIAIS-FIREBASE.md\n');
    
    process.exit(1);
  }
}

generateToken();

