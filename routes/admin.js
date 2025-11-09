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

