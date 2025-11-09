const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { db, admin } = require('../config/firebase');
const { getEmailTemplate, verifyEmailConfig } = require('../services/email');

// Todas as rotas requerem autenticação + role admin
router.use(verifyToken);
router.use(requireRole(['admin']));

/**
 * GET /api/admin/email-template
 * Buscar template de email atual
 */
router.get('/email-template', async (req, res) => {
  try {
    console.log('📧 [ADMIN] Fetching email template');
    
    const template = await getEmailTemplate();
    
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching email template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/email-template
 * Salvar/atualizar template de email
 */
router.post('/email-template', async (req, res) => {
  try {
    const { subject, body, fromName, fromEmail } = req.body;
    
    console.log('📧 [ADMIN] Updating email template');
    
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Subject and body are required',
      });
    }
    
    const templateData = {
      subject,
      body,
      fromName: fromName || 'NutriBuddy',
      fromEmail: fromEmail || process.env.EMAIL_USER,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid,
    };
    
    await db.collection('settings').doc('emailTemplate').set(templateData, { merge: true });
    
    console.log('✅ [ADMIN] Email template updated successfully');
    
    res.json({
      success: true,
      message: 'Template de email atualizado com sucesso',
      data: templateData,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error updating email template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/email-config/verify
 * Verificar configuração de email
 */
router.get('/email-config/verify', async (req, res) => {
  try {
    console.log('🔍 [ADMIN] Verifying email configuration');
    
    const result = await verifyEmailConfig();
    
    res.json({
      success: result.success,
      message: result.success 
        ? 'Configuração de email válida' 
        : 'Configuração de email inválida',
      error: result.error,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error verifying email config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/fix-patients
 * Corrige pacientes antigos sem prescriberId ou sem usuário no Authentication
 */
router.post('/fix-patients', async (req, res) => {
  try {
    console.log('🔧 [ADMIN] Starting patient fix process...');
    
    const results = {
      checked: 0,
      fixed: 0,
      authCreated: 0,
      firestoreUpdated: 0,
      errors: [],
      details: []
    };

    // Buscar todos os usuários com role 'patient'
    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .get();

    console.log(`📋 [ADMIN] Found ${patientsSnapshot.size} patients to check`);
    results.checked = patientsSnapshot.size;

    for (const doc of patientsSnapshot.docs) {
      const patientData = doc.data();
      const patientId = doc.id;
      const patientEmail = patientData.email;
      
      try {
        let needsFix = false;
        let authCreated = false;
        let firestoreUpdated = false;
        const fixes = [];

        // 1. Verificar se tem prescriberId
        if (!patientData.prescriberId || patientData.prescriberId === null) {
          needsFix = true;
          fixes.push('prescriberId missing');
          
          // Buscar primeiro prescritor disponível como fallback
          const prescriberSnapshot = await db.collection('users')
            .where('role', '==', 'prescriber')
            .limit(1)
            .get();
          
          if (!prescriberSnapshot.empty) {
            const prescriberId = prescriberSnapshot.docs[0].id;
            await doc.ref.update({
              prescriberId: prescriberId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            fixes.push(`prescriberId set to ${prescriberId}`);
            firestoreUpdated = true;
          } else {
            fixes.push('⚠️ No prescriber found to assign');
          }
        }

        // 2. Verificar se existe no Authentication
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(patientEmail);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            needsFix = true;
            fixes.push('user not in Authentication');
            
            // Criar usuário no Authentication
            const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!1`;
            userRecord = await admin.auth().createUser({
              email: patientEmail,
              password: tempPassword,
              displayName: patientData.name || patientData.displayName || 'Paciente',
              emailVerified: false
            });
            
            fixes.push(`user created in Auth with temp password`);
            authCreated = true;
            
            // Gerar link de redefinição de senha
            try {
              const resetLink = await admin.auth().generatePasswordResetLink(patientEmail);
              fixes.push(`reset link: ${resetLink}`);
            } catch (linkError) {
              fixes.push(`⚠️ Could not generate reset link: ${linkError.message}`);
            }
          } else {
            throw error;
          }
        }

        if (needsFix) {
          results.fixed++;
          if (authCreated) results.authCreated++;
          if (firestoreUpdated) results.firestoreUpdated++;
          
          results.details.push({
            patientId,
            email: patientEmail,
            name: patientData.name || patientData.displayName,
            fixes
          });
          
          console.log(`✅ [ADMIN] Fixed patient: ${patientEmail} - ${fixes.join(', ')}`);
        }
        
      } catch (error) {
        console.error(`❌ [ADMIN] Error fixing patient ${patientEmail}:`, error);
        results.errors.push({
          patientId,
          email: patientEmail,
          error: error.message
        });
      }
    }

    console.log(`🎉 [ADMIN] Patient fix complete: ${results.fixed} fixed, ${results.authCreated} created in Auth, ${results.firestoreUpdated} updated in Firestore`);

    res.json({
      success: true,
      message: `Verificação concluída: ${results.fixed} pacientes corrigidos de ${results.checked} verificados`,
      data: results
    });
    
  } catch (error) {
    console.error('❌ [ADMIN] Error in fix-patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/users
 * Listar todos os usuários (para administração)
 */
router.get('/users', async (req, res) => {
  try {
    const { role, status } = req.query;
    
    console.log('👥 [ADMIN] Fetching users:', { role, status });
    
    let query = db.collection('users');
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/stats
 * Estatísticas gerais do sistema
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 [ADMIN] Fetching system stats');
    
    // Contar usuários por role
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalUsers: users.length,
      prescribers: users.filter(u => u.role === 'prescriber').length,
      patients: users.filter(u => u.role === 'patient').length,
      admins: users.filter(u => u.role === 'admin').length,
      activeUsers: users.filter(u => u.status === 'active').length,
    };
    
    // Contar conexões
    const connectionsSnapshot = await db.collection('connections').get();
    stats.totalConnections = connectionsSnapshot.size;
    stats.activeConnections = connectionsSnapshot.docs.filter(
      doc => doc.data().status === 'active'
    ).length;
    
    // Contar planos
    const plansSnapshot = await db.collection('dietPlans').get();
    stats.totalPlans = plansSnapshot.size;
    stats.activePlans = plansSnapshot.docs.filter(
      doc => doc.data().isActive === true
    ).length;
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

