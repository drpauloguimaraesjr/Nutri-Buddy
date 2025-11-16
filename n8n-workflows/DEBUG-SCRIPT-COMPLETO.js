/**
 * 🔍 SCRIPT DE DEBUG COMPLETO - Upload de Mídia
 * 
 * Cole este script no Console do navegador (F12) no chat
 * Ele vai interceptar todas as requisições e mostrar exatamente o que está acontecendo
 */

console.clear();
console.log('🔍 ============================================');
console.log('🔍 DEBUG: Upload de Mídia - NutriBuddy');
console.log('🔍 ============================================\n');

// 1. Verificar autenticação Firebase
console.log('1️⃣ Verificando autenticação Firebase...');
if (window.firebase && firebase.auth) {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      console.log('✅ Usuário autenticado:', user.email, user.uid);
      try {
        const token = await user.getIdToken();
        console.log('✅ Token Firebase obtido:', token.substring(0, 50) + '...');
        
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('✅ Token role:', decodedToken.role || 'não definido');
        console.log('✅ Token exp:', new Date(decodedToken.exp * 1000).toLocaleString());
      } catch (error) {
        console.error('❌ Erro ao obter token:', error);
      }
    } else {
      console.error('❌ Usuário NÃO autenticado!');
    }
  });
} else {
  console.warn('⚠️ Firebase não encontrado no window');
}

// 2. Verificar elementos do DOM
console.log('\n2️⃣ Verificando elementos do DOM...');
setTimeout(() => {
  const imageButton = document.querySelector('button[title="Enviar foto"]');
  const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
  
  console.log('📷 Botão de imagem:', imageButton ? '✅ Encontrado' : '❌ Não encontrado');
  console.log('📁 Input file:', fileInput ? '✅ Encontrado' : '❌ Não encontrado');
  
  if (imageButton) {
    console.log('📷 Botão disabled:', imageButton.disabled);
  }
  if (fileInput) {
    console.log('📁 Input accept:', fileInput.accept);
    console.log('📁 Input capture:', fileInput.capture);
  }
}, 1000);

// 3. Interceptar fetch para ver requisições
console.log('\n3️⃣ Interceptando requisições fetch...\n');

const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  // Log apenas requisições relevantes
  if (typeof url === 'string' && (url.includes('/api/') || url.includes('railway'))) {
    const method = options.method || 'GET';
    const isUpload = url.includes('/attachments');
    
    console.log(`\n📤 [${method}] ${url}`);
    console.log('📤 Headers:', options.headers);
    
    if (isUpload && options.body instanceof FormData) {
      console.log('📤 Body type: FormData');
      for (let [key, value] of options.body.entries()) {
        if (value instanceof File) {
          console.log(`   - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`   - ${key}: ${value}`);
        }
      }
    }
    
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      
      console.log(`✅ [${response.status}] ${response.statusText}`);
      
      if (!response.ok) {
        try {
          const errorData = await clonedResponse.json();
          console.error('❌ Erro:', errorData);
        } catch {
          const errorText = await clonedResponse.text();
          console.error('❌ Erro (texto):', errorText);
        }
      } else if (isUpload) {
        try {
          const successData = await clonedResponse.json();
          console.log('✅ Sucesso:', successData);
        } catch (e) {
          console.warn('⚠️ Resposta não é JSON');
        }
      }
      
      return response;
    } catch (error) {
      console.error(`❌ [ERRO] ${error.name}: ${error.message}`);
      console.error('❌ Stack:', error.stack);
      throw error;
    }
  }
  
  return originalFetch.apply(this, args);
};

// 4. Interceptar erros globais
console.log('4️⃣ Interceptando erros globais...\n');

window.addEventListener('error', (event) => {
  if (event.message.includes('fetch') || event.message.includes('mídia')) {
    console.error('❌ [GLOBAL ERROR]', event.message);
    console.error('❌ Arquivo:', event.filename, 'Linha:', event.lineno);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [PROMISE REJECTED]', event.reason);
});

// 5. Testar conectividade com backend
console.log('5️⃣ Testando conectividade com backend...\n');

const API_BASE_URL = 'https://web-production-c9eaf.up.railway.app';

setTimeout(async () => {
  try {
    console.log('🔌 Testando conexão com:', API_BASE_URL);
    const response = await fetch(API_BASE_URL + '/health', { method: 'GET' });
    console.log('✅ Backend responde:', response.status, response.statusText);
  } catch (error) {
    console.error('❌ Backend não acessível:', error.message);
  }
}, 2000);

// 6. Monitorar localStorage/sessionStorage
console.log('6️⃣ Verificando storage...\n');

setTimeout(() => {
  const apiBaseUrl = localStorage.getItem('NEXT_PUBLIC_API_BASE_URL') || 
                     sessionStorage.getItem('NEXT_PUBLIC_API_BASE_URL');
  console.log('🔗 API Base URL (storage):', apiBaseUrl || 'não encontrado');
  console.log('🔗 API Base URL (env):', process?.env?.NEXT_PUBLIC_API_BASE_URL || 'não acessível');
}, 1000);

console.log('\n🔍 ============================================');
console.log('✅ DEBUG SCRIPT ATIVO!');
console.log('📝 Tente enviar uma imagem agora.');
console.log('📊 Todos os logs aparecerão aqui.');
console.log('🔍 ============================================\n');

