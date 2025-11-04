// check-env.js - Script de diagnóstico do .env
require('dotenv').config();

console.log('\n🔍 DIAGNÓSTICO DO .ENV\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Verificar se as variáveis existem
const vars = {
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
};

let hasErrors = false;

Object.entries(vars).forEach(([key, value]) => {
  if (!value || value.trim() === '' || value === 'your-project-id' || value.includes('xxxxx')) {
    console.log(`❌ ${key}: NÃO CONFIGURADO ou VALOR PADRÃO`);
    hasErrors = true;
  } else {
    // Mostrar apenas primeiros/últimos caracteres para segurança
    if (key === 'FIREBASE_PRIVATE_KEY') {
      const preview = value.length > 50 
        ? `${value.substring(0, 30)}...${value.substring(value.length - 30)}`
        : value;
      console.log(`✅ ${key}: Configurado (${value.length} caracteres)`);
      console.log(`   Preview: ${preview}`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('❌ PROBLEMAS ENCONTRADOS!\n');
  console.log('📋 SOLUÇÃO:\n');
  console.log('1. Abra o arquivo .env');
  console.log('2. Verifique se as credenciais estão preenchidas');
  console.log('3. Certifique-se de que não há valores padrão (your-project-id, xxxxx)');
  console.log('4. A FIREBASE_PRIVATE_KEY deve estar entre aspas duplas');
  console.log('5. As quebras de linha \\n devem estar preservadas\n');
  console.log('📖 Veja: COMO-OBTER-CREDENCIAIS-FIREBASE.md\n');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis estão configuradas!\n');
  console.log('🔍 Verificando formato das credenciais...\n');
  
  // Verificar formato da private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    console.log('⚠️  ATENÇÃO: FIREBASE_PRIVATE_KEY pode estar mal formatada');
    console.log('   Deve conter: -----BEGIN PRIVATE KEY----- e -----END PRIVATE KEY-----\n');
  }
  
  // Verificar formato do email
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (!clientEmail.includes('@') || !clientEmail.includes('.iam.gserviceaccount.com')) {
    console.log('⚠️  ATENÇÃO: FIREBASE_CLIENT_EMAIL pode estar incorreto');
    console.log('   Deve ser: firebase-adminsdk-xxxxx@projeto.iam.gserviceaccount.com\n');
  }
  
  console.log('💡 Se ainda houver erro, verifique:');
  console.log('   - Se o projeto Firebase existe e está ativo');
  console.log('   - Se as credenciais são do projeto correto');
  console.log('   - Veja COMO-OBTER-CREDENCIAIS-FIREBASE.md\n');
  process.exit(0);
}

