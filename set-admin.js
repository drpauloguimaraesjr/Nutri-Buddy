/**
 * Script para definir um usuário como admin
 * 
 * Uso: node set-admin.js <email>
 * 
 * Exemplo: node set-admin.js seu-email@exemplo.com
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK initialized');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function setAdmin(email) {
  try {
    if (!email) {
      throw new Error('Email é obrigatório. Uso: node set-admin.js <email>');
    }

    console.log(`\n🔍 Buscando usuário: ${email}...`);

    // 1. Encontrar usuário pelo email
    const user = await auth.getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${user.uid}`);
    console.log(`   Nome: ${user.displayName || 'N/A'}`);
    console.log(`   Email: ${user.email}`);

    // 2. Atualizar Firestore
    console.log('\n📝 Atualizando Firestore...');
    await db.collection('users').doc(user.uid).set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Firestore atualizado');

    // 3. Atualizar Custom Claims
    console.log('\n🔐 Atualizando Custom Claims...');
    await auth.setCustomUserClaims(user.uid, { role: 'admin' });
    console.log('✅ Custom claims atualizado');

    // 4. Verificar se foi aplicado
    const updatedUser = await auth.getUser(user.uid);
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    console.log('\n📊 Verificação:');
    console.log(`   Firestore role: ${userDoc.data()?.role || 'N/A'}`);
    console.log(`   Custom Claims: ${JSON.stringify(updatedUser.customClaims || {})}`);

    console.log(`\n✅ Usuário ${email} agora é admin!`);
    console.log('\n⚠️ IMPORTANTE:');
    console.log('   1. Faça logout do sistema');
    console.log('   2. Faça login novamente');
    console.log('   3. Acesse: nutri-buddy-ir2n.vercel.app/admin');
    console.log('\n');

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Usuário não encontrado: ${email}`);
      console.error('   Verifique se o email está correto e se o usuário existe no Firebase Auth.');
    } else {
      console.error('❌ Erro:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Obter email dos argumentos
const email = process.argv[2];

if (!email) {
  console.error('❌ Email é obrigatório!');
  console.error('\nUso: node set-admin.js <email>');
  console.error('Exemplo: node set-admin.js seu-email@exemplo.com\n');
  process.exit(1);
}

setAdmin(email).then(() => {
  console.log('✅ Concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});


