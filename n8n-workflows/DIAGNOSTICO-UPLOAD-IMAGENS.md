# 🔍 DIAGNÓSTICO: Upload de Imagens no Chat

## ✅ VERIFICADO: CÓDIGO ESTÁ IMPLEMENTADO

O sistema de upload de imagens **ESTÁ COMPLETO** no código:

### **Frontend:**
- ✅ Botão de imagem no `ChatInput.tsx` (linha 208-216)
- ✅ Input file type="file" accept="image/*" (linha 198-205)
- ✅ Função `handleFileChange` (linha 88-107)
- ✅ Função `handleSendMedia` no `ChatInterface.tsx` (linha 255-288)
- ✅ Upload via FormData para `/api/messages/conversations/:id/attachments`

### **Backend:**
- ✅ Endpoint `POST /conversations/:conversationId/attachments` (routes/messages.js)
- ✅ Multer configurado para upload
- ✅ Firebase Storage configurado
- ✅ Mensagem criada automaticamente após upload

---

## 🚨 POSSÍVEIS CAUSAS DO PROBLEMA

### **1. Firebase Storage Rules (MAIS PROVÁVEL)**

As regras do Firebase Storage podem estar bloqueando o upload.

**Como verificar:**
1. Abra o [Firebase Console](https://console.firebase.google.com/)
2. Acesse seu projeto → **Storage** → **Rules**
3. Verifique se as regras permitem write para `chat-media`

**Regras corretas:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Chat Media - Pacientes e Prescritores podem fazer upload
    match /chat-media/{patientId}/{prescriberId}/{conversationId}/{fileName} {
      allow read: if true; // Qualquer um pode ler (URLs assinadas)
      allow write: if request.auth != null; // Usuário autenticado
    }
    
    // Diet Plans PDFs
    match /diet-plans/{patientId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'prescriber';
    }
    
    // Diet Plans Images
    match /diet-plans-images/{patientId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'prescriber';
    }
  }
}
```

---

### **2. Erro Silencioso no Console**

**Script de Diagnóstico:**

Cole este script no **Console do Navegador** (F12) enquanto estiver no chat:

```javascript
console.log('🔍 DIAGNÓSTICO: Upload de Imagens');

// 1. Verificar se o botão de imagem está presente
const imageButton = document.querySelector('button[title="Enviar foto"]');
console.log('1️⃣ Botão de imagem encontrado:', !!imageButton);

// 2. Verificar se o input file está presente
const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
console.log('2️⃣ Input file encontrado:', !!fileInput);

// 3. Testar click no botão
if (imageButton) {
  console.log('3️⃣ Testando click no botão de imagem...');
  imageButton.click();
  setTimeout(() => {
    console.log('3️⃣ Input file foi acionado:', document.activeElement === fileInput);
  }, 500);
}

// 4. Interceptar erros de upload
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/attachments')) {
    console.log('📤 [UPLOAD] Iniciando upload:', url);
    console.log('📤 [UPLOAD] Body:', args[1]?.body);
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('✅ [UPLOAD] Status:', response.status, response.statusText);
        if (!response.ok) {
          response.clone().json().then(data => {
            console.error('❌ [UPLOAD] Erro:', data);
          });
        }
        return response;
      })
      .catch(error => {
        console.error('❌ [UPLOAD] Falha na requisição:', error);
        throw error;
      });
  }
  return originalFetch.apply(this, args);
};

console.log('✅ Diagnóstico configurado! Tente enviar uma imagem agora.');
console.log('📝 Os logs aparecerão aqui quando você selecionar uma imagem.');
```

---

### **3. Verificar Erros no Backend (Railway)**

**Logs do Railway:**

1. Acesse [railway.app](https://railway.app) → Seu projeto → **Deployments**
2. Clique no deploy ativo → **View Logs**
3. Filtre por: `attachments` ou `upload`
4. Tente fazer upload de uma imagem
5. Veja se aparece erro nos logs

**Erros comuns:**
- `"Arquivo é obrigatório"` → FormData não está chegando
- `"Tipo de arquivo não suportado"` → MIME type incorreto
- `"Sem permissão"` → conversationId ou userId incorretos
- `Firebase Storage error` → Problema com Storage Rules

---

### **4. Verificar CORS**

Se o erro for relacionado a CORS:

**Backend (server.js):**

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://nutri-buddy-ir2n.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret'],
  // IMPORTANTE: não adicionar 'multipart/form-data' aqui
}));
```

---

### **5. Verificar Tamanho do Arquivo**

**Backend (routes/messages.js):**

O multer tem limite de tamanho? Verifique a configuração:

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  },
});
```

---

## 🧪 TESTE MANUAL (cURL)

Teste o endpoint diretamente:

```bash
# 1. Obter o token do Firebase
# (Cole no console do navegador enquanto logado)
await firebase.auth().currentUser.getIdToken()

# 2. Testar upload
curl -X POST \
  "https://web-production-c9eaf.up.railway.app/api/messages/conversations/T57IAET5UAcfkAO6HFUF/attachments" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/imagem.jpg" \
  -F "mediaType=image"
```

**Resposta esperada:**

```json
{
  "success": true,
  "message": {
    "id": "msg123",
    "conversationId": "T57IAET5UAcfkAO6HFUF",
    "content": "Imagem enviada",
    "type": "image",
    "attachments": [
      {
        "url": "https://storage.googleapis.com/...",
        "type": "image",
        "contentType": "image/jpeg"
      }
    ]
  }
}
```

---

## 🔧 CORREÇÃO: Firebase Storage Rules

Se o problema for as Storage Rules, copie e cole isto no Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ===== CHAT MEDIA =====
    // Permitir upload de imagens e áudios no chat
    match /chat-media/{patientId}/{prescriberId}/{conversationId}/{fileName} {
      allow read: if true; // URLs assinadas funcionam
      allow write: if request.auth != null; // Usuário autenticado pode fazer upload
    }
    
    // ===== DIET PLANS =====
    match /diet-plans/{patientId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'prescriber';
    }
    
    match /diet-plans-images/{patientId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'prescriber';
    }
  }
}
```

**IMPORTANTE:** Clique em **"Publish"** para salvar!

---

## 📋 CHECKLIST DE DIAGNÓSTICO

Siga esta ordem:

- [ ] **1. Firebase Storage Rules configuradas?**
  - Acessar Firebase Console → Storage → Rules
  - Verificar se `chat-media` tem `allow write: if request.auth != null`
  - Publicar as regras atualizadas

- [ ] **2. Executar script de diagnóstico no console**
  - Abrir F12 no navegador
  - Colar o script de diagnóstico
  - Tentar enviar uma imagem
  - Ver os logs no console

- [ ] **3. Verificar logs do Railway**
  - Acessar Railway → Deployments → View Logs
  - Tentar enviar uma imagem
  - Ver se aparece erro nos logs

- [ ] **4. Testar endpoint com cURL**
  - Obter token do Firebase
  - Testar upload direto no backend
  - Ver se funciona sem o frontend

- [ ] **5. Verificar CORS no backend**
  - Confirmar que `server.js` tem CORS configurado
  - Verificar se `CORS_ORIGIN` está correto no Railway

---

## 🎯 CAUSA MAIS PROVÁVEL

**90% de chance: Firebase Storage Rules** 🔥

O código está implementado corretamente, mas o Firebase Storage está bloqueando o upload porque as regras não permitem write para o caminho `chat-media`.

**SOLUÇÃO RÁPIDA:**

1. Abra [console.firebase.google.com](https://console.firebase.google.com/)
2. Acesse seu projeto
3. **Storage** → **Rules**
4. Cole as regras acima
5. Clique em **"Publish"**
6. Teste novamente!

---

## 🆘 SE NADA FUNCIONAR

**Me envie:**
1. Print do console do navegador (F12) ao tentar enviar imagem
2. Logs do Railway ao tentar enviar imagem
3. Print das Firebase Storage Rules atuais
4. Resultado do script de diagnóstico

**E eu vou identificar exatamente o problema!** 🔍✨

