const { db, admin } = require('../config/firebase');

/**
 * Serviço de envio de emails usando Firebase Trigger Email Extension
 * 
 * ✅ Totalmente gerenciado pelo Firebase
 * ✅ Grátis até 1000 emails/mês (SendGrid free tier)
 * ✅ Sem configuração de servidor SMTP
 * 
 * COMO CONFIGURAR:
 * 1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/extensions
 * 2. Instale: "Trigger Email" extension
 * 3. Configure com SendGrid API Key ou SMTP
 * 4. Pronto! Os emails serão enviados automaticamente ao criar docs na coleção 'mail'
 */

/**
 * Buscar template de email do admin no Firestore
 */
const getEmailTemplate = async () => {
  try {
    const settingsDoc = await db.collection('settings').doc('emailTemplate').get();
    
    if (settingsDoc.exists) {
      return settingsDoc.data();
    }
    
    // Template padrão se não existir
    return {
      subject: 'Bem-vindo ao NutriBuddy! 🎉',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Bem-vindo ao NutriBuddy! 🎉</h1>
          
          <p>Olá <strong>{{PATIENT_NAME}}</strong>,</p>
          
          <p>Sua conta foi criada com sucesso! Abaixo estão suas credenciais de acesso:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> {{PATIENT_EMAIL}}</p>
            <p style="margin: 5px 0;"><strong>🔑 Senha Temporária:</strong> <code style="background: #E5E7EB; padding: 5px 10px; border-radius: 4px;">{{TEMP_PASSWORD}}</code></p>
          </div>
          
          <p><strong>⚠️ Importante:</strong> Por favor, altere sua senha no primeiro acesso.</p>
          
          <a href="{{LOGIN_URL}}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Acessar o Sistema
          </a>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Este é um email automático. Por favor, não responda.
          </p>
        </div>
      `,
      fromName: 'NutriBuddy',
      fromEmail: process.env.EMAIL_USER || 'noreply@nutribuddy.com',
    };
  } catch (error) {
    console.error('❌ [EMAIL] Error fetching template:', error);
    throw error;
  }
};

/**
 * Enviar email de onboarding para novo paciente
 * Usa Firebase Trigger Email Extension
 */
const sendOnboardingEmail = async ({ patientName, patientEmail, tempPassword }) => {
  try {
    console.log('📧 [EMAIL] Queueing onboarding email to:', patientEmail);
    
    const template = await getEmailTemplate();
    
    // Substituir variáveis no template
    const loginUrl = process.env.FRONTEND_URL || 'https://nutribuddy.vercel.app/login';
    
    let emailBody = template.body
      .replace(/{{PATIENT_NAME}}/g, patientName)
      .replace(/{{PATIENT_EMAIL}}/g, patientEmail)
      .replace(/{{TEMP_PASSWORD}}/g, tempPassword)
      .replace(/{{LOGIN_URL}}/g, loginUrl);
    
    // Criar documento na coleção 'mail' - Firebase Extension enviará automaticamente
    const mailRef = await db.collection('mail').add({
      to: patientEmail,
      from: `${template.fromName} <${template.fromEmail}>`,
      replyTo: template.fromEmail,
      message: {
        subject: template.subject,
        html: emailBody,
        text: `Bem-vindo ao NutriBuddy!\n\nEmail: ${patientEmail}\nSenha Temporária: ${tempPassword}\n\nAcesse: ${loginUrl}`,
      },
      template: {
        name: 'onboarding',
        data: {
          patientName,
          patientEmail,
          tempPassword,
          loginUrl,
        },
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ [EMAIL] Email queued successfully:', mailRef.id);
    
    return {
      success: true,
      mailId: mailRef.id,
    };
  } catch (error) {
    console.error('❌ [EMAIL] Error queueing email:', error);
    throw error;
  }
};

/**
 * Enviar voucher de login (reenvio manual)
 * Usa Firebase Trigger Email Extension
 */
const sendLoginVoucher = async ({ patientName, patientEmail, tempPassword }) => {
  try {
    console.log('📧 [EMAIL] Queueing login voucher to:', patientEmail);
    
    const loginUrl = process.env.FRONTEND_URL || 'https://nutribuddy.vercel.app/login';
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Suas Credenciais de Acesso 🔑</h1>
        
        <p>Olá <strong>${patientName}</strong>,</p>
        
        <p>Aqui estão suas credenciais para acessar o NutriBuddy:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${patientEmail}</p>
          <p style="margin: 5px 0;"><strong>🔑 Senha:</strong> <code style="background: #E5E7EB; padding: 5px 10px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        
        <a href="${loginUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Acessar o Sistema
        </a>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Se você não solicitou este email, por favor ignore.
        </p>
      </div>
    `;
    
    // Criar documento na coleção 'mail'
    const mailRef = await db.collection('mail').add({
      to: patientEmail,
      from: 'NutriBuddy <noreply@nutribuddy.com>',
      replyTo: process.env.ADMIN_EMAIL || 'drpauloguimaraesjr@gmail.com',
      message: {
        subject: '🔑 Suas Credenciais de Acesso - NutriBuddy',
        html: emailBody,
        text: `Suas Credenciais de Acesso\n\nEmail: ${patientEmail}\nSenha: ${tempPassword}\n\nAcesse: ${loginUrl}`,
      },
      template: {
        name: 'login-voucher',
        data: {
          patientName,
          patientEmail,
          tempPassword,
          loginUrl,
        },
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ [EMAIL] Voucher queued successfully:', mailRef.id);
    
    return {
      success: true,
      mailId: mailRef.id,
    };
  } catch (error) {
    console.error('❌ [EMAIL] Error queueing voucher:', error);
    throw error;
  }
};

/**
 * Verificar se Firebase Trigger Email Extension está instalada
 */
const verifyEmailConfig = async () => {
  try {
    // Verificar se a coleção 'mail' existe (criada pela extension)
    const mailTest = await db.collection('mail').limit(1).get();
    console.log('✅ [EMAIL] Firebase Trigger Email Extension is configured');
    return { 
      success: true,
      message: 'Firebase Trigger Email Extension está ativa',
    };
  } catch (error) {
    console.error('❌ [EMAIL] Firebase Trigger Email Extension may not be installed:', error.message);
    return { 
      success: false, 
      error: 'Firebase Trigger Email Extension não encontrada. Instale em: https://console.firebase.google.com/project/nutribuddy-2fc9c/extensions',
    };
  }
};

module.exports = {
  sendOnboardingEmail,
  sendLoginVoucher,
  getEmailTemplate,
  verifyEmailConfig,
};

