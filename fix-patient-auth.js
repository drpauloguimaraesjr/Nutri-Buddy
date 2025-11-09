const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ========================================
// Configurações - AJUSTE AQUI
// ========================================
const PATIENT_EMAIL = 'guimaraesjrpaulo@gmail.com';
const PATIENT_NAME = 'Paulo';
const PRESCRIBER_UID = 'DUrjyamCs5Yc5K4vNQyqJr6...'; // ⚠️ COLE SEU UID COMPLETO AQUI
const TEMP_PASSWORD = 'Temp1234!';

async function fixPatientAuth() {
  try {
    console.log('🔧 Corrigindo autenticação do paciente...\n');

    // 1. Verificar/criar usuário no Authentication
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(PATIENT_EMAIL);
      console.log('✅ Usuário já existe no Authentication:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 Criando usuário no Authentication...');
        userRecord = await auth.createUser({
          email: PATIENT_EMAIL,
          password: TEMP_PASSWORD,
          displayName: PATIENT_NAME,
          emailVerified: false,
        });
        console.log('✅ Usuário criado no Authentication:', userRecord.uid);
        console.log(`   Senha temporária: ${TEMP_PASSWORD}`);
        console.log('   ⚠️  Peça para o paciente usar "Esqueci minha senha" para definir uma nova senha.\n');
      } else {
        throw error;
      }
    }

    // 2. Atualizar documento no Firestore
    console.log('📝 Atualizando documento no Firestore...');
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists()) {
      console.log('⚠️  Documento não existe, criando novo...');
      await userDocRef.set({
        uid: userRecord.uid,
        email: PATIENT_EMAIL,
        displayName: PATIENT_NAME,
        name: PATIENT_NAME,
        role: 'patient',
        status: 'active',
        prescriberId: PRESCRIBER_UID,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Documento criado no Firestore');
    } else {
      console.log('📝 Documento existe, atualizando prescriberId...');
      await userDocRef.update({
        prescriberId: PRESCRIBER_UID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Documento atualizado no Firestore');
    }

    // 3. Enviar link de redefinição de senha
    console.log('\n📧 Gerando link de redefinição de senha...');
    const resetLink = await auth.generatePasswordResetLink(PATIENT_EMAIL);
    console.log('✅ Link de redefinição gerado:');
    console.log(`   ${resetLink}\n`);
    console.log('   📋 Copie e envie esse link para o paciente.');
    console.log('   🔒 Com ele, o paciente poderá definir uma senha nova.\n');

    console.log('✅ PROCESSO CONCLUÍDO!\n');
    console.log('Agora o paciente pode:');
    console.log('1. Usar o link acima para definir uma senha, OU');
    console.log('2. Clicar em "Esqueci minha senha" na tela de login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixPatientAuth();

