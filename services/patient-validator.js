/**
 * Serviço de Validação e Correção Automática de Pacientes
 * 
 * Este serviço garante que todos os pacientes tenham:
 * - Usuário no Firebase Authentication
 * - Documento no Firestore
 * - prescriberId definido
 * - Dados consistentes entre Auth e Firestore
 */

const { db, admin } = require('../config/firebase');

/**
 * Valida e corrige automaticamente um paciente
 * @param {Object} patientData - Dados do paciente
 * @param {string} prescriberId - UID do prescritor (opcional)
 * @returns {Object} - Resultado da validação
 */
async function validateAndFixPatient(patientData, prescriberId = null) {
  const fixes = [];
  const errors = [];
  let userRecord = null;
  let userId = patientData.uid || null;

  try {
    const email = patientData.email?.toLowerCase().trim();
    
    if (!email) {
      errors.push('Email é obrigatório');
      return { success: false, errors };
    }

    // 1. Verificar/criar no Firebase Authentication
    try {
      if (userId) {
        userRecord = await admin.auth().getUser(userId);
      } else {
        userRecord = await admin.auth().getUserByEmail(email);
        userId = userRecord.uid;
      }
      
      console.log('✅ [VALIDATOR] User exists in Auth:', userId);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Criar usuário no Auth
        const tempPassword = generateTemporaryPassword();
        
        userRecord = await admin.auth().createUser({
          email: email,
          password: tempPassword,
          displayName: patientData.name || patientData.displayName || 'Paciente',
          emailVerified: false
        });
        
        userId = userRecord.uid;
        fixes.push('Created user in Firebase Authentication');
        console.log('✅ [VALIDATOR] User created in Auth:', userId);
      } else {
        throw error;
      }
    }

    // 2. Atualizar Custom Claims se necessário
    const currentClaims = userRecord.customClaims || {};
    if (currentClaims.role !== 'patient') {
      await admin.auth().setCustomUserClaims(userId, { role: 'patient' });
      fixes.push('Updated custom claims to patient role');
      console.log('✅ [VALIDATOR] Custom claims updated');
    }

    // 3. Verificar/atualizar Firestore
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    const now = admin.firestore.FieldValue.serverTimestamp();
    const dataToSave = {
      uid: userId,
      email: email,
      displayName: patientData.name || patientData.displayName || userRecord.displayName,
      name: patientData.name || patientData.displayName || userRecord.displayName,
      role: 'patient',
      status: patientData.status || 'active',
      updatedAt: now
    };

    // Campos opcionais
    if (patientData.phone) dataToSave.phone = patientData.phone;
    if (patientData.age) dataToSave.age = patientData.age;
    if (patientData.height) dataToSave.height = patientData.height;
    if (patientData.weight) dataToSave.weight = patientData.weight;
    if (patientData.gender) dataToSave.gender = patientData.gender;
    if (patientData.goals) dataToSave.goals = patientData.goals;

    // 4. Garantir prescriberId
    if (userDoc.exists) {
      const existingData = userDoc.data();
      
      // Se não tem prescriberId, tentar definir
      if (!existingData.prescriberId) {
        if (prescriberId) {
          dataToSave.prescriberId = prescriberId;
          fixes.push('Added missing prescriberId');
        } else {
          // Tentar encontrar um prescritor
          const prescribersSnapshot = await db.collection('users')
            .where('role', '==', 'prescriber')
            .limit(1)
            .get();
          
          if (!prescribersSnapshot.empty) {
            dataToSave.prescriberId = prescribersSnapshot.docs[0].id;
            fixes.push('Auto-assigned to first available prescriber');
          } else {
            fixes.push('⚠️ No prescriber found - prescriberId not set');
          }
        }
      } else {
        dataToSave.prescriberId = existingData.prescriberId;
      }

      // Manter createdAt original
      if (existingData.createdAt) {
        dataToSave.createdAt = existingData.createdAt;
      }
    } else {
      // Novo documento
      dataToSave.createdAt = now;
      
      if (prescriberId) {
        dataToSave.prescriberId = prescriberId;
      } else {
        // Buscar primeiro prescritor disponível
        const prescribersSnapshot = await db.collection('users')
          .where('role', '==', 'prescriber')
          .limit(1)
          .get();
        
        if (!prescribersSnapshot.empty) {
          dataToSave.prescriberId = prescribersSnapshot.docs[0].id;
          fixes.push('Auto-assigned to first available prescriber');
        } else {
          fixes.push('⚠️ No prescriber found - prescriberId not set');
        }
      }
      
      fixes.push('Created document in Firestore');
    }

    // 5. Salvar no Firestore
    await userDocRef.set(dataToSave, { merge: true });
    console.log('✅ [VALIDATOR] Firestore document updated');

    return {
      success: true,
      userId,
      fixes,
      errors: [],
      data: dataToSave
    };

  } catch (error) {
    console.error('❌ [VALIDATOR] Error validating patient:', error);
    errors.push(error.message);
    return {
      success: false,
      userId,
      fixes,
      errors
    };
  }
}

/**
 * Valida todos os pacientes no sistema
 * Usado pelo cron job
 */
async function validateAllPatients() {
  console.log('🔧 [VALIDATOR] Starting automatic validation of all patients...');
  
  const results = {
    checked: 0,
    fixed: 0,
    errors: [],
    details: []
  };

  try {
    // Buscar todos os pacientes
    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .get();

    results.checked = patientsSnapshot.size;
    console.log(`📋 [VALIDATOR] Found ${patientsSnapshot.size} patients to validate`);

    for (const doc of patientsSnapshot.docs) {
      const patientData = doc.data();
      const result = await validateAndFixPatient(patientData);

      if (result.fixes.length > 0) {
        results.fixed++;
        results.details.push({
          patientId: doc.id,
          email: patientData.email,
          fixes: result.fixes
        });
      }

      if (result.errors.length > 0) {
        results.errors.push({
          patientId: doc.id,
          email: patientData.email,
          errors: result.errors
        });
      }
    }

    console.log(`✅ [VALIDATOR] Validation complete: ${results.fixed} patients fixed`);
    
    return results;

  } catch (error) {
    console.error('❌ [VALIDATOR] Error in automatic validation:', error);
    return {
      ...results,
      errors: [...results.errors, error.message]
    };
  }
}

/**
 * Gera senha temporária
 */
function generateTemporaryPassword() {
  const random = Math.random().toString(36).slice(-8);
  return `Temp${random.charAt(0).toUpperCase()}${random.slice(1)}!1`;
}

module.exports = {
  validateAndFixPatient,
  validateAllPatients
};

