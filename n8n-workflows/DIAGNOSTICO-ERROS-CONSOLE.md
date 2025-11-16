# 🔍 DIAGNÓSTICO: Erros no Console do Chat

## ❌ **ERROS DETECTADOS NA SCREENSHOT**

Vi vários erros repetidos no console:

```
❌ Erro ao buscar mensagens: TypeError: Failed to fetch
❌ Erro ao enviar mídia
   Error: Erro ao enviar mídia
   at B (...CwdFpGt1j9261:13422)
   at async B (...NCmFpGt1j926:1:6463)
```

---

## 🎯 **POSSÍVEIS CAUSAS**

### **1. Firebase Storage Rules Ainda Propagando**

As regras do Firebase podem levar **alguns minutos** para propagar globalmente.

**Solução:** Aguarde 2-5 minutos e teste novamente.

---

### **2. Cache do Navegador**

O navegador pode ter cacheado as regras antigas ou o token expirado.

**Solução:**

```javascript
// 1. Limpar cache e recarregar
// DevTools (F12) → Application → Storage → Clear site data
// Depois: Ctrl+Shift+R (hard reload)

// 2. Ou fazer logout/login
// Isso força a obtenção de um novo token
```

---

### **3. Token Firebase Expirado**

Tokens do Firebase expiram após 1 hora.

**Verificar:**

```javascript
// Cole no console:
const user = firebase.auth().currentUser;
if (user) {
  user.getIdToken(true).then(token => {
    console.log('Token renovado:', token.substring(0, 50) + '...');
  });
}
```

---

### **4. CORS Headers**

Mesmo com CORS configurado, pode haver problemas com FormData.

**Verificar no backend (server.js):**

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://nutri-buddy-ir2n.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
}));

// IMPORTANTE: Não adicionar 'Content-Type' manualmente ao fazer upload
// O browser define automaticamente para multipart/form-data
```

---

### **5. Tamanho do Arquivo**

O arquivo pode estar excedendo o limite do Multer ou Railway.

**Verificar:**

```javascript
// Backend: routes/messages.js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
```

**Railway pode ter limite de payload:**
- Free tier: 10 MB
- Pro: 100 MB

---

### **6. Network Error (Railway/Vercel Down)**

Pode ser problema temporário de rede.

**Verificar:**

```bash
# Testar se o backend está respondendo
curl https://web-production-c9eaf.up.railway.app/health
```

---

## 🧪 **SCRIPT DE DIAGNÓSTICO COMPLETO**

Cole este script no **Console do navegador** (F12) **ANTES** de tentar enviar imagem:

```javascript
console.clear();
console.log('🔍 DEBUG: Upload de Mídia\n');

// 1. Verificar autenticação
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    console.log('✅ Autenticado:', user.email);
    const token = await user.getIdToken(true); // Force refresh
    console.log('✅ Token renovado:', token.substring(0, 50) + '...');
  } else {
    console.error('❌ NÃO autenticado!');
  }
});

// 2. Interceptar fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/attachments')) {
    console.log('📤 UPLOAD INICIADO:', url);
    console.log('📤 Headers:', args[1]?.headers);
    console.log('📤 Body:', args[1]?.body);
    
    try {
      const response = await originalFetch.apply(this, args);
      console.log('✅ Status:', response.status);
      
      if (!response.ok) {
        const error = await response.clone().json();
        console.error('❌ Erro:', error);
      } else {
        const data = await response.clone().json();
        console.log('✅ Sucesso:', data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ ERRO DE REDE:', error);
      throw error;
    }
  }
  return originalFetch.apply(this, args);
};

console.log('✅ Debug ativo! Tente enviar uma imagem agora.\n');
```

**Depois:**
1. Tente enviar uma imagem
2. Veja os logs no console
3. **Me envie uma screenshot dos logs!**

---

## 🔧 **CORREÇÕES RÁPIDAS**

### **Correção 1: Limpar Cache e Renovar Token**

```javascript
// Cole no console:

// 1. Limpar localStorage
localStorage.clear();
sessionStorage.clear();

// 2. Renovar token Firebase
firebase.auth().currentUser?.getIdToken(true).then(() => {
  console.log('✅ Token renovado!');
  // 3. Recarregar página
  window.location.reload();
});
```

---

### **Correção 2: Fazer Logout/Login**

1. Click em **Sair** no menu
2. Faça login novamente
3. Tente enviar a imagem

Isso força a obtenção de um novo token atualizado.

---

### **Correção 3: Aguardar Propagação das Regras**

As Firebase Storage Rules podem levar **2-5 minutos** para propagar.

**Verificar se propagou:**

```javascript
// Teste direto no Firebase Storage
const storageRef = firebase.storage().ref();
const testRef = storageRef.child('chat-media/test/test/test/test.jpg');

testRef.putString('test', 'raw').then(() => {
  console.log('✅ Storage Rules funcionando!');
  testRef.delete();
}).catch((error) => {
  console.error('❌ Storage Rules ainda bloqueando:', error.code);
});
```

---

## 📊 **CHECKLIST DE VERIFICAÇÃO**

Execute na ordem:

- [ ] **1. Aguardar 5 minutos** (regras propagarem)
- [ ] **2. Limpar cache** (Ctrl+Shift+Delete)
- [ ] **3. Hard reload** (Ctrl+Shift+R)
- [ ] **4. Renovar token** (script acima)
- [ ] **5. Verificar autenticação** (console.log do user)
- [ ] **6. Testar backend** (curl /health)
- [ ] **7. Executar script de debug**
- [ ] **8. Tentar enviar imagem pequena** (< 1 MB)
- [ ] **9. Verificar logs do Railway**
- [ ] **10. Fazer logout/login**

---

## 🆘 **SE CONTINUAR COM ERRO**

**Me envie:**

1. ✅ Screenshot do console **COM O SCRIPT DE DEBUG ATIVO**
2. ✅ Logs do Railway ao tentar enviar (railway.app → View Logs)
3. ✅ Resposta do comando:
   ```bash
   curl https://web-production-c9eaf.up.railway.app/health
   ```
4. ✅ Qual foi o tamanho do arquivo que tentou enviar?
5. ✅ Você fez logout/login antes de testar?

---

## 🎯 **MAIS PROVÁVEL:**

**90% de chance:** Token expirado ou cache antigo 🔥

**SOLUÇÃO RÁPIDA:**

1. Abra o console (F12)
2. Execute:
   ```javascript
   localStorage.clear();
   firebase.auth().currentUser.getIdToken(true).then(() => location.reload());
   ```
3. Aguarde recarregar
4. Tente enviar a imagem novamente

---

**Teste estas soluções e me avise o resultado!** 🚀

