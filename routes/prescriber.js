const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { db, admin } = require('../config/firebase');
const { sendOnboardingEmail, sendLoginVoucher } = require('../services/email');
const { validateAndFixPatient } = require('../services/patient-validator');
const aiProfileService = require('../services/ai-profiles');

const ALLOWED_ROLES_TO_CREATE = ['patient', 'prescriber'];

// Todas as rotas aqui requerem autenticação + role prescriber
router.use(verifyToken);
router.use(requireRole(['prescriber', 'admin']));

const generateTemporaryPassword = () => {
  const random = Math.random().toString(36).slice(-8);
  return `Temp${random.charAt(0).toUpperCase()}${random.slice(1)}!1`;
};

async function ensureActiveConnection({
  prescriberId,
  patientId,
  patientEmail = null,
  patientName = null,
  status = 'active',
}) {
  if (!prescriberId || !patientId) {
    return null;
  }

  const connectionId = `${prescriberId}_${patientId}`;
  const connectionRef = db.collection('connections').doc(connectionId);
  const connectionSnapshot = await connectionRef.get();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  const data = {
    prescriberId,
    patientId,
    patientEmail: patientEmail || null,
    patientName: patientName || null,
    status,
    updatedAt: timestamp,
  };

  if (!connectionSnapshot.exists) {
    data.createdAt = timestamp;
  }

  await connectionRef.set(data, { merge: true });
  return connectionId;
}

/**
 * GET /api/prescriber/patients
 * Listar todos os pacientes do prescritor (conexões ativas)
 */
router.get('/patients', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    console.log('📋 [PRESCRIBER] Fetching patients for:', prescriberId);
    
    const connectionsSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'active')
      .get();
    
    const patients = [];
    for (const doc of connectionsSnapshot.docs) {
      const connection = doc.data();
      const patientDoc = await db.collection('users').doc(connection.patientId).get();
      
      if (patientDoc.exists) {
        patients.push({
          id: patientDoc.id,
          ...patientDoc.data(),
          connectionId: doc.id,
          connectionDate: connection.createdAt
        });
      }
    }
    
    console.log('✅ [PRESCRIBER] Found', patients.length, 'patients');
    
    res.json({
      success: true,
      data: patients,
      total: patients.length
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/create
 * Criar paciente/prescritor e garantir cadastro no Firebase Auth
 */
router.post('/patients/create', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      height,
      weight,
      gender = 'other',
      goals,
      role,
      status = 'active',
      prescriberId: requestedPrescriberId
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const requesterRole = req.user.role;
    const requesterId = req.user.uid;

    const targetRole =
      requesterRole === 'admin' && role && ALLOWED_ROLES_TO_CREATE.includes(role)
        ? role
        : 'patient';

    let userRecord;
    let createdAuthUser = false;
    const tempPassword = generateTemporaryPassword();

    try {
      userRecord = await admin.auth().getUserByEmail(normalizedEmail);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: normalizedEmail,
          password: tempPassword,
          displayName: name,
          emailVerified: false
        });
        createdAuthUser = true;
      } else {
        console.error('❌ [PRESCRIBER] Error fetching user from Auth:', error);
        throw error;
      }
    }

    const userId = userRecord.uid;

    // Atualizar displayName se necessário
    if (!createdAuthUser && userRecord.displayName !== name) {
      await admin.auth().updateUser(userId, {
        displayName: name
      });
    }

    // Atualizar custom claims para refletir o papel atual
    try {
      await admin.auth().setCustomUserClaims(userId, { role: targetRole });
    } catch (error) {
      console.warn('⚠️ [PRESCRIBER] Failed to set custom claims:', error.message);
    }

    const userDocRef = db.collection('users').doc(userId);
    const existingDoc = await userDocRef.get();

    if (
      existingDoc.exists &&
      targetRole === 'patient' &&
      requesterRole === 'prescriber' &&
      existingDoc.data().prescriberId &&
      existingDoc.data().prescriberId !== requesterId
    ) {
      return res.status(409).json({
        success: false,
        error: 'Paciente já está vinculado a outro prescritor'
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const goalsArray = Array.isArray(goals)
      ? goals
      : typeof goals === 'string' && goals.trim().length
        ? goals
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const parsed = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    let assignedPrescriberId = null;

    const dataToSave = {
      uid: userId,
      email: normalizedEmail,
      displayName: name,
      name,
      phone: phone || null,
      age: parseNumber(age),
      height: parseNumber(height),
      weight: parseNumber(weight),
      gender,
      goals: goalsArray,
      role: targetRole,
      status: status || 'active',
      updatedAt: now
    };

    if (targetRole === 'patient') {
      if (requesterRole === 'prescriber') {
        assignedPrescriberId = requesterId;
      } else if (requestedPrescriberId) {
        assignedPrescriberId = requestedPrescriberId;
      } else {
        const prescribersSnapshot = await db.collection('users')
          .where('role', '==', 'prescriber')
          .limit(1)
          .get();
        
        if (!prescribersSnapshot.empty) {
          assignedPrescriberId = prescribersSnapshot.docs[0].id;
        }
      }

      dataToSave.prescriberId = assignedPrescriberId || null;
    }

    if (!existingDoc.exists) {
      dataToSave.createdAt = now;
    }

    await userDocRef.set(dataToSave, { merge: true });

    if (targetRole === 'patient' && assignedPrescriberId) {
      await ensureActiveConnection({
        prescriberId: assignedPrescriberId,
        patientId: userId,
        patientEmail: normalizedEmail,
        patientName: name,
      });
    }

    // ✅ Validação automática para garantir consistência
    console.log('🔧 [PRESCRIBER] Running automatic validation...');
    const validationResult = await validateAndFixPatient(
      dataToSave,
      dataToSave.prescriberId || assignedPrescriberId
    );
    
    if (validationResult.fixes.length > 0) {
      console.log('✅ [PRESCRIBER] Auto-fixes applied:', validationResult.fixes);
    }

    // ✅ NOVO: Enviar email de onboarding automaticamente quando criar novo usuário
    if (createdAuthUser) {
      try {
        await sendOnboardingEmail({
          patientName: name,
          patientEmail: normalizedEmail,
          tempPassword: tempPassword,
        });
        console.log('✅ [PRESCRIBER] Onboarding email sent to:', normalizedEmail);
      } catch (emailError) {
        console.error('⚠️ [PRESCRIBER] Failed to send onboarding email:', emailError.message);
        // Não falha a criação do usuário se o email falhar
      }
    }

    res.status(createdAuthUser ? 201 : 200).json({
      success: true,
      message: createdAuthUser
        ? 'Usuário criado com sucesso e email de boas-vindas enviado'
        : 'Usuário atualizado com sucesso',
      data: {
        userId,
        email: normalizedEmail,
        role: targetRole,
        createdAuthUser,
        prescriberId: dataToSave.prescriberId || null,
        emailSent: createdAuthUser, // Indica se email foi enviado
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar usuário'
    });
  }
});

/**
 * GET /api/prescriber/patients/pending
 * Listar convites pendentes
 */
router.get('/patients/pending', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    const connectionsSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'pending')
      .get();
    
    const pending = connectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: pending,
      total: pending.length
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching pending invites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/invite
 * Enviar convite para paciente por email
 */
router.post('/patients/invite', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const prescriberId = req.user.uid;
    
    console.log('📧 [PRESCRIBER] Sending invite to:', patientEmail);
    
    if (!patientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Patient email is required'
      });
    }
    
    // Buscar paciente por email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', patientEmail.toLowerCase())
      .where('role', '==', 'patient')
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found. Make sure the user is registered as a patient.'
      });
    }
    
    const patientDoc = usersSnapshot.docs[0];
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();
    
    // Verificar se conexão já existe
    const existingConnection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .limit(1)
      .get();
    
    if (!existingConnection.empty) {
      const status = existingConnection.docs[0].data().status;
      return res.status(400).json({
        success: false,
        error: `Connection already exists with status: ${status}`
      });
    }
    
    // Criar conexão pendente
    const connectionRef = await db.collection('connections').add({
      prescriberId,
      patientId,
      patientEmail: patientData.email,
      patientName: patientData.displayName || 'Unknown',
      status: 'pending',
      createdAt: new Date()
    });
    
    console.log('✅ [PRESCRIBER] Invite sent successfully:', connectionRef.id);
    
    res.json({
      success: true,
      data: {
        connectionId: connectionRef.id,
        message: 'Invite sent successfully'
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error sending invite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/:patientId/assign
 * Atribuir paciente diretamente ao prescritor atual (sem convite)
 */
router.post('/patients/:patientId/assign', async (req, res) => {
  try {
    const { patientId } = req.params;
    const requesterRole = req.user.role;
    const requesterId = req.user.uid;
    const requestedPrescriberId = req.body?.prescriberId;

    const targetPrescriberId =
      requesterRole === 'admin' && requestedPrescriberId
        ? requestedPrescriberId
        : requesterId;

    if (!targetPrescriberId) {
      return res.status(400).json({
        success: false,
        error: 'PrescriberId is required to assign a patient',
      });
    }

    const patientRef = db.collection('users').doc(patientId);
    const patientDoc = await patientRef.get();

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
    }

    const patientData = patientDoc.data();

    if (patientData.role && patientData.role !== 'patient') {
      return res.status(400).json({
        success: false,
        error: 'Only users with patient role can be assigned to a prescriber',
      });
    }

    if (!patientData.email) {
      return res.status(400).json({
        success: false,
        error: 'Patient email is required to complete the assignment',
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    await patientRef.set(
      {
        prescriberId: targetPrescriberId,
        updatedAt: now,
      },
      { merge: true }
    );

    const connectionId = await ensureActiveConnection({
      prescriberId: targetPrescriberId,
      patientId,
      patientEmail: patientData.email,
      patientName: patientData.name || patientData.displayName || 'Paciente',
    });

    await validateAndFixPatient(
      {
        ...patientData,
        uid: patientId,
        email: patientData.email,
        name: patientData.name || patientData.displayName || 'Paciente',
      },
      targetPrescriberId
    );

    res.json({
      success: true,
      message: 'Paciente atribuído com sucesso',
      data: {
        patientId,
        prescriberId: targetPrescriberId,
        connectionId,
      },
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error assigning patient:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/prescriber/patient/:patientId
 * Ver detalhes de um paciente específico
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    // Verificar conexão ativa
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    // Buscar dados do paciente
    const patientDoc = await db.collection('users').doc(patientId).get();
    
    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: patientDoc.id,
        ...patientDoc.data()
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching patient details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/dietPlans
 * Criar plano alimentar para paciente
 */
router.post('/dietPlans', async (req, res) => {
  try {
    const { patientId, name, description, meals, dailyCalories, dailyProtein, dailyCarbs, dailyFats } = req.body;
    const prescriberId = req.user.uid;
    
    console.log('📋 [PRESCRIBER] Creating diet plan for patient:', patientId);
    
    if (!patientId || !name || !meals) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientId, name, meals'
      });
    }
    
    // Verificar conexão ativa
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    // Desativar planos anteriores
    const previousPlans = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();
    
    const batch = db.batch();
    previousPlans.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    await batch.commit();
    
    // Criar novo plano
    const planRef = await db.collection('dietPlans').add({
      prescriberId,
      patientId,
      name,
      description: description || '',
      meals: meals || [],
      dailyCalories: dailyCalories || 2000,
      dailyProtein: dailyProtein || 150,
      dailyCarbs: dailyCarbs || 250,
      dailyFats: dailyFats || 65,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ [PRESCRIBER] Diet plan created:', planRef.id);
    
    res.json({
      success: true,
      data: {
        planId: planRef.id,
        message: 'Diet plan created successfully'
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error creating diet plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/dietPlans/:patientId
 * Listar planos alimentares de um paciente
 */
router.get('/dietPlans/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    // Verificar conexão
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    const plansSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const plans = plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching diet plans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/:userId/send-credentials
 * Reenviar credenciais de acesso por email
 */
router.post('/patients/:userId/send-credentials', async (req, res) => {
  try {
    const { userId } = req.params;
    const { method = 'email' } = req.body; // 'email' ou 'whatsapp'
    const requesterId = req.user.uid;
    const requesterRole = req.user.role;

    console.log('📧 [PRESCRIBER] Sending credentials to user:', userId, 'via:', method);

    // Buscar dados do paciente
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const userData = userDoc.data();

    // Verificar permissão
    if (requesterRole !== 'admin') {
      if (userData.role !== 'patient' || userData.prescriberId !== requesterId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para enviar credenciais deste usuário'
        });
      }
    }

    // Gerar nova senha temporária
    const newTempPassword = generateTemporaryPassword();
    
    // Atualizar senha no Firebase Auth
    try {
      await admin.auth().updateUser(userId, {
        password: newTempPassword
      });
    } catch (authError) {
      console.error('❌ [PRESCRIBER] Failed to update password:', authError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar senha'
      });
    }

    // Enviar credenciais
    if (method === 'email') {
      try {
        await sendLoginVoucher({
          patientName: userData.displayName || userData.name,
          patientEmail: userData.email,
          tempPassword: newTempPassword,
        });
        
        res.json({
          success: true,
          message: 'Credenciais enviadas por email com sucesso',
          method: 'email',
        });
      } catch (emailError) {
        console.error('❌ [PRESCRIBER] Failed to send email:', emailError);
        res.status(500).json({
          success: false,
          error: 'Erro ao enviar email'
        });
      }
    } else if (method === 'whatsapp') {
      // TODO: Implementar envio via WhatsApp
      const whatsappMessage = `🔑 *Suas Credenciais NutriBuddy*\n\n📧 Email: ${userData.email}\n🔑 Senha: ${newTempPassword}\n\n🔗 Acesse: https://nutribuddy.vercel.app/login`;
      
      res.json({
        success: true,
        message: 'Credenciais geradas. Envio por WhatsApp disponível em breve.',
        method: 'whatsapp',
        whatsappMessage, // Para copiar manualmente por enquanto
        phone: userData.phone,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Método inválido. Use "email" ou "whatsapp"'
      });
    }
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error sending credentials:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar credenciais'
    });
  }
});

/**
 * DELETE /api/prescriber/patients/:userId
 * Excluir paciente (Firebase Auth + Firestore)
 */
router.delete('/patients/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.uid;
    const requesterRole = req.user.role;

    console.log('🗑️ [PRESCRIBER] Deleting user:', userId, 'by:', requesterId);

    // Buscar usuário no Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const userData = userDoc.data();

    // Verificar permissão:
    // - Admin pode excluir qualquer um
    // - Prescritor pode excluir apenas seus próprios pacientes
    if (requesterRole !== 'admin') {
      if (userData.role !== 'patient' || userData.prescriberId !== requesterId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para excluir este usuário'
        });
      }
    }

    // Excluir do Firebase Auth
    try {
      await admin.auth().deleteUser(userId);
      console.log('✅ [PRESCRIBER] User deleted from Firebase Auth:', userId);
    } catch (authError) {
      console.warn('⚠️ [PRESCRIBER] Failed to delete from Auth (may not exist):', authError.message);
    }

    // Excluir do Firestore
    await db.collection('users').doc(userId).delete();
    console.log('✅ [PRESCRIBER] User deleted from Firestore:', userId);

    // Excluir conexões relacionadas
    const connectionsSnapshot = await db.collection('connections')
      .where('patientId', '==', userId)
      .get();
    
    const batch = db.batch();
    connectionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log('✅ [PRESCRIBER] User and connections deleted successfully');

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir usuário'
    });
  }
});

/**
 * GET /api/prescriber/stats
 * Obter estatísticas do prescritor
 */
router.get('/stats', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    // Contar pacientes ativos
    const activeConnections = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'active')
      .get();
    
    // Contar convites pendentes
    const pendingConnections = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'pending')
      .get();
    
    // Contar planos ativos
    const activePlans = await db.collection('dietPlans')
      .where('prescriberId', '==', prescriberId)
      .where('isActive', '==', true)
      .get();
    
    res.json({
      success: true,
      data: {
        totalPatients: activeConnections.size,
        activePatients: activeConnections.size,
        pendingApprovals: pendingConnections.size,
        activePlans: activePlans.size
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/ai-profiles/types
 * Listar todos os tipos de perfil de IA disponíveis
 */
router.get('/ai-profiles/types', async (req, res) => {
  try {
    console.log('🤖 [PRESCRIBER] Fetching AI profile types');
    
    const profileTypes = aiProfileService.getAllProfileTypes();
    
    res.json({
      success: true,
      data: profileTypes
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching AI profile types:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prescriber/patients/:patientId/ai-profile
 * Buscar perfil de IA de um paciente específico
 */
router.get('/patients/:patientId/ai-profile', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    console.log('🤖 [PRESCRIBER] Fetching AI profile for patient:', patientId);
    
    // Verificar se o paciente pertence a este prescritor
    const connection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connection.empty) {
      return res.status(403).json({
        success: false,
        error: 'Patient not found or not connected to this prescriber'
      });
    }
    
    const profile = await aiProfileService.getOrCreateDefaultProfile(patientId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error fetching patient AI profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/:patientId/ai-profile
 * Criar ou atualizar perfil de IA de um paciente
 */
router.post('/patients/:patientId/ai-profile', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    const config = req.body;
    
    console.log('🤖 [PRESCRIBER] Saving AI profile for patient:', patientId);
    
    // Verificar se o paciente pertence a este prescritor
    const connection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connection.empty) {
      return res.status(403).json({
        success: false,
        error: 'Patient not found or not connected to this prescriber'
      });
    }
    
    // Validar configuração
    if (!config.profileType) {
      return res.status(400).json({
        success: false,
        error: 'profileType is required'
      });
    }
    
    const profile = await aiProfileService.savePatientAIProfile(
      patientId,
      config,
      prescriberId
    );
    
    console.log('✅ [PRESCRIBER] AI profile saved successfully');
    
    res.json({
      success: true,
      data: profile,
      message: 'AI profile saved successfully'
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error saving AI profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/prescriber/patients/:patientId/ai-profile
 * Deletar perfil de IA de um paciente (volta ao padrão)
 */
router.delete('/patients/:patientId/ai-profile', async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriberId = req.user.uid;
    
    console.log('🤖 [PRESCRIBER] Deleting AI profile for patient:', patientId);
    
    // Verificar se o paciente pertence a este prescritor
    const connection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connection.empty) {
      return res.status(403).json({
        success: false,
        error: 'Patient not found or not connected to this prescriber'
      });
    }
    
    await aiProfileService.deletePatientAIProfile(patientId);
    
    console.log('✅ [PRESCRIBER] AI profile deleted successfully');
    
    res.json({
      success: true,
      message: 'AI profile deleted successfully, patient will use default profile'
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error deleting AI profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/prescriber/patients/:patientId/ai-profile/generate-prompt
 * Gerar prompt personalizado baseado no perfil do paciente
 */
router.post('/patients/:patientId/ai-profile/generate-prompt', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { context } = req.body;
    const prescriberId = req.user.uid;
    
    console.log('🤖 [PRESCRIBER] Generating AI prompt for patient:', patientId);
    
    // Verificar se o paciente pertence a este prescritor
    const connection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connection.empty) {
      return res.status(403).json({
        success: false,
        error: 'Patient not found or not connected to this prescriber'
      });
    }
    
    const profile = await aiProfileService.getOrCreateDefaultProfile(patientId);
    const prompt = aiProfileService.generateAIPrompt(profile, context);
    
    res.json({
      success: true,
      data: {
        prompt,
        profile: profile.config
      }
    });
  } catch (error) {
    console.error('❌ [PRESCRIBER] Error generating AI prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

