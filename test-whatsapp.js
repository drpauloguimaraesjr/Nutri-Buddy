#!/usr/bin/env node

/**
 * Script de teste para verificar instalação do WhatsApp
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🧪 TESTANDO INTEGRAÇÃO WHATSAPP\n');
console.log(`📍 URL: ${BASE_URL}\n`);

async function testar() {
  try {
    // Teste 1: Health check
    console.log('1️⃣ Testando health check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Servidor está rodando\n');

    // Teste 2: Status WhatsApp
    console.log('2️⃣ Verificando status do WhatsApp...');
    const status = await axios.get(`${BASE_URL}/api/whatsapp/status`);
    console.log(`Status: ${status.data.connected ? '✅ CONECTADO' : '❌ DESCONECTADO'}`);
    console.log(`Mensagem: ${status.data.message}\n`);

    // Teste 3: Endpoints disponíveis
    console.log('3️⃣ Endpoints disponíveis:');
    console.log(`   • GET  ${BASE_URL}/api/whatsapp/connect`);
    console.log(`   • GET  ${BASE_URL}/api/whatsapp/qr`);
    console.log(`   • GET  ${BASE_URL}/api/whatsapp/status`);
    console.log(`   • POST ${BASE_URL}/api/whatsapp/send\n`);

    console.log('🎉 TUDO PRONTO PARA USAR!\n');
    console.log('📖 Próximos passos:');
    console.log('   1. Acesse: http://localhost:3000/api/whatsapp/connect');
    console.log('   2. Escaneie o QR Code com seu WhatsApp');
    console.log('   3. Comece a enviar mensagens!\n');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ ERRO: Servidor não está rodando!');
      console.log('\n💡 Execute: npm start\n');
    } else {
      console.error('❌ ERRO:', error.message);
      console.error('\n📝 Detalhes:', error.response?.data || error);
    }
    process.exit(1);
  }
}

testar();
