#!/usr/bin/env node

/**
 * EXEMPLO DE USO - WhatsApp NutriBuddy
 * 
 * Este script mostra como usar a API WhatsApp
 * para enviar mensagens e lembretes nutricionais
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Exemplos de uso prático
async function exemplosDeUso() {
  console.log('🍎 EXEMPLOS DE USO - WhatsApp NutriBuddy\n');

  // ==========================================
  // EXEMPLO 1: Lembrete de Café da Manhã
  // ==========================================
  console.log('📋 Exemplo 1: Lembrete de Café da Manhã');
  console.log('─────────────────────────────────────────');
  
  const exemplo1 = {
    to: '5511999999999@s.whatsapp.net', // Substitua pelo número real
    message: `
☀️ BOM DIA!

Que tal começar o dia com energia?

🍎 Café da Manhã Sugerido:
━━━━━━━━━━━━━━━━━━━━━━
• 2 ovos mexidos
• 1 fatia de pão integral
• 1 banana
• 200ml de leite

Calorias: 450 kcal
Proteína: 28g
Carboidratos: 50g

✨ Bom treino!
NutriBuddy 🍎
    `.trim()
  };

  console.log('Mensagem:', exemplo1.message);
  // await enviarMensagem(exemplo1); // Descomente para enviar
  console.log('');

  // ==========================================
  // EXEMPLO 2: Resumo Nutricional do Dia
  // ==========================================
  console.log('📋 Exemplo 2: Resumo Nutricional');
  console.log('─────────────────────────────────────────');
  
  const exemplo2 = {
    to: '5511999999999@s.whatsapp.net',
    message: `
📊 SEU RESUMO DE HOJE

━━━━━━━━━━━━━━━━━━━━━━
🔥 Calorias: 1850 / 2000 kcal
   [░░░░░░░░░░░░░░░░░░░░░░░] 92%

🥩 Proteína: 120g ✅
🍞 Carboidratos: 180g ✅
🥑 Gorduras: 60g ✅

━━━━━━━━━━━━━━━━━━━━━━

🎯 Meta diária quase atingida!

Ainda faltam 150 kcal para bater sua meta.
Que tal um lanche saudável?

NutriBuddy 🍎
    `.trim()
  };

  console.log('Mensagem:', exemplo2.message);
  // await enviarMensagem(exemplo2); // Descomente para enviar
  console.log('');

  // ==========================================
  // EXEMPLO 3: Meta Atingida!
  // ==========================================
  console.log('📋 Exemplo 3: Parabéns por bater a meta!');
  console.log('─────────────────────────────────────────');
  
  const exemplo3 = {
    to: '5511999999999@s.whatsapp.net',
    message: `
🎉 PARABÉNS!

Você bateu sua meta de calorias hoje!

✅ 2000 / 2000 kcal
✅ Todos os macronutrientes completos
✅ Hidratação em dia

Continue assim! Você está no caminho certo.

NutriBuddy está orgulhoso de você! 🍎✨
    `.trim()
  };

  console.log('Mensagem:', exemplo3.message);
  // await enviarMensagem(exemplo3); // Descomente para enviar
  console.log('');

  // ==========================================
  // EXEMPLO 4: Receita Personalizada
  // ==========================================
  console.log('📋 Exemplo 4: Receita Sugerida');
  console.log('─────────────────────────────────────────');
  
  const exemplo4 = {
    to: '5511999999999@s.whatsapp.net',
    message: `
🍽️ RECEITA PARA VOCÊ

Bowl de Açaí Energético
━━━━━━━━━━━━━━━━━━━━━━━━━
Ingredientes:
• 200ml de açaí puro
• 1 banana média
• 30g de granola
• 10g de mel
• Morangos a gosto

Calorias: 350 kcal
Proteína: 8g
Carboidratos: 65g

Perfeito para pós-treino! 💪

NutriBuddy 🍎
    `.trim()
  };

  console.log('Mensagem:', exemplo4.message);
  // await enviarMensagem(exemplo4); // Descomente para enviar
  console.log('');

  // ==========================================
  // EXEMPLO 5: Lembrete de Hidratação
  // ==========================================
  console.log('📋 Exemplo 5: Lembrete de Hidratação');
  console.log('─────────────────────────────────────────');
  
  const exemplo5 = {
    to: '5511999999999@s.whatsapp.net',
    message: `
💧 LEMBRETE DE HIDRATAÇÃO

Você já bebeu água hoje?

🎯 Meta: 2 litros/dia
📊 Progresso: 1.2 litros

Faltam 800ml! 

💡 Dica: Beba 1 copo agora!

Manter-se hidratado é essencial para:
✅ Melhor performance nos treinos
✅ Digestão otimizada
✅ Pele saudável
✅ Foco mental

NutriBuddy 🍎
    `.trim()
  };

  console.log('Mensagem:', exemplo5.message);
  // await enviarMensagem(exemplo5); // Descomente para enviar
  console.log('');

  console.log('✅ Exemplos criados!');
  console.log('\n💡 Para enviar, descomente as linhas:');
  console.log('   // await enviarMensagem(...);');
  console.log('\n⚠️  Não esqueça de substituir o número!');
}

// ==========================================
// FUNÇÃO AUXILIAR: Enviar Mensagem
// ==========================================
async function enviarMensagem({ to, message }) {
  try {
    console.log(`📤 Enviando para ${to}...`);
    
    const response = await axios.post(
      `${BASE_URL}/api/whatsapp/send`,
      { to, message },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Enviado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================
// FUNÇÃO AUXILIAR: Verificar Status
// ==========================================
async function verificarStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/api/whatsapp/status`);
    
    if (!response.data.connected) {
      console.error('❌ WhatsApp não está conectado!');
      console.log('💡 Execute: curl http://localhost:3000/api/whatsapp/connect');
      process.exit(1);
    }
    
    console.log('✅ WhatsApp conectado!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    process.exit(1);
  }
}

// ==========================================
// MAIN
// ==========================================
async function main() {
  console.log('🚀 Iniciando exemplos...\n');
  
  // Verificar se WhatsApp está conectado
  await verificarStatus();
  console.log('');
  
  // Mostrar exemplos
  await exemplosDeUso();
  
  console.log('\n📚 Próximos passos:');
  console.log('   1. Substitua os números pelos reais');
  console.log('   2. Descomente as linhas de envio');
  console.log('   3. Execute: node exemplo-uso-whatsapp.js');
  console.log('   4. Automatize com N8N!');
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  exemplosDeUso,
  enviarMensagem,
  verificarStatus
};
