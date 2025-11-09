/**
 * Script para obter ID Token do Firebase
 * Este token pode ser usado para fazer requisições autenticadas
 */

const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

// Validar variáveis de ambiente
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
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
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

async function getIdToken() {
  try {
    const auth = admin.auth();
    
    // Buscar usuário
    const testEmail = 'n8n-test@nutribuddy.com';
    const user = await auth.getUserByEmail(testEmail);
    console.log('✅ Usuário encontrado:', user.email);
    console.log('   Role:', user.customClaims?.role || 'N/A');
    
    // Gerar custom token
    const customToken = await auth.createCustomToken(user.uid);
    console.log('✅ Custom token gerado');
    
    // Trocar custom token por ID token
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    
    if (!FIREBASE_API_KEY) {
      console.error('\n❌ FIREBASE_API_KEY não encontrado no .env');
      console.error('   Adicione: FIREBASE_API_KEY=sua-api-key');
      console.error('   Encontre em: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general\n');
      process.exit(1);
    }
    
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    
    const idToken = response.data.idToken;
    
    console.log('\n🎯 ID TOKEN GERADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(idToken);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 INFORMAÇÕES:');
    console.log('User ID:', user.uid);
    console.log('Email:', user.email);
    console.log('Role:', user.customClaims?.role || 'N/A');
    console.log('Expira em:', '1 hora');
    console.log('\n💡 COMO USAR:');
    console.log('curl -X POST https://web-production-c9eaf.up.railway.app/api/admin/fix-patients \\');
    console.log('  -H "Authorization: Bearer ' + idToken + '" \\');
    console.log('  -H "Content-Type: application/json"');
    console.log('\n✅ Este é um ID Token válido por 1 hora!');
    
    // Retornar token para uso em scripts
    return idToken;
    
  } catch (error) {
    console.error('\n❌ Erro ao gerar ID token:', error.message);
    
    if (error.response) {
      console.error('   Resposta:', error.response.data);
    }
    
    console.error('\n🔧 SOLUÇÃO:');
    console.error('   1. Verifique se FIREBASE_API_KEY está no .env');
    console.error('   2. Certifique-se que o projeto Firebase está ativo');
    console.error('   3. Veja: COMO-OBTER-CREDENCIAIS-FIREBASE.md\n');
    
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  getIdToken().then((token) => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { getIdToken };

