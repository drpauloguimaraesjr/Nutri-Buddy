# 🔍 DIAGNÓSTICO: Bug do senderId

## 🐛 PROBLEMA RELATADO

Quando o **PACIENTE** envia mensagem no chat:
- `senderId`: "hiAf8r28RmfnppmYBpvxQwTroNI2" (ID do prescritor) ❌
- `senderRole`: "patient" (CORRETO) ✅

## 🔎 ANÁLISE DO CÓDIGO

### 1. **Frontend (`ChatInterface.tsx` linha 218-253)**
```typescript
const handleSendMessage = async (content: string) => {
  const response = await fetch(
    `${apiBaseUrl}/api/messages/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,  // Token do Firebase
      },
      body: JSON.stringify({
        content,
        type: 'text',
      }),
    }
  );
};
```

**O frontend NÃO envia `senderId` manualmente!**

---

### 2. **Backend (`routes/messages.js` linha 547-660)**
```javascript
router.post('/conversations/:conversationId/messages', async (req, res) => {
  const userId = req.user.uid;  // ← Pega do token decodificado
  const userRole = req.user.role || 'patient';  // ← Pega do Firestore

  // Criar mensagem
  const messageData = {
    conversationId,
    senderId: userId,  // ← USA O UID DO TOKEN
    senderRole: userRole,  // ← USA O ROLE DO FIRESTORE
    content: messageContent,
    type: messageType,
    status: 'sent',
    isAiGenerated: false,
    createdAt: new Date(),
  };

  // Salvar no Firestore
  await db.collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .add(messageData);

  // Enviar para n8n
  triggerNewMessageWorkflow({
    conversationId,
    messageId: messageRef.id,
    senderId: userId,  // ← USA O UID DO TOKEN
    senderRole: userRole,
    content: messageContent,
  });
});
```

**O backend define `senderId` a partir do token Firebase!**

---

### 3. **Middleware de Autenticação (`middleware/auth.js`)**
```javascript
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  // Decodificar token Firebase
  const decodedToken = await auth.verifyIdToken(token);
  
  // Buscar dados do usuário no Firestore
  const userDoc = await db.collection('users').doc(decodedToken.uid).get();
  const userData = userDoc.exists ? userDoc.data() : {};
  
  // Definir req.user
  req.user = {
    ...decodedToken,
    ...userData,
    uid: decodedToken.uid,  // ← UID do token Firebase
    email: decodedToken.email,
    role: userData.role || 'patient',  // ← Role do Firestore
  };
};
```

**O middleware define `req.user.uid` a partir do token Firebase decodificado!**

---

## 🧠 POSSÍVEIS CAUSAS

### **Causa 1: Documento Firestore do Paciente Está Errado**

Se o documento Firestore do **PACIENTE** tem:
```json
{
  "uid": "hiAf8r28RmfnppmYBpvxQwTroNI2",  // UID do prescritor (ERRADO!)
  "role": "patient"  // Role correto
}
```

**Como verificar:**
```bash
# No console do Firebase Firestore:
1. Abrir collection "users"
2. Procurar por documento com role "patient"
3. Verificar se o uid do documento corresponde ao ID real do usuário
```

---

### **Causa 2: Token Firebase do Paciente Está Errado**

Se o **PACIENTE** está usando o token Firebase do **PRESCRITOR**:
- O backend decodifica o token e pega o UID do prescritor
- Mas busca o role no Firestore e encontra "patient" (se houver documento com o UID do prescritor e role "patient")

**Como verificar:**
```javascript
// No frontend, adicionar log:
const token = await firebaseUser.getIdToken();
console.log('🔐 Token Firebase UID:', firebaseUser.uid);
console.log('🔐 Token Firebase Email:', firebaseUser.email);
console.log('🔐 User Role:', user?.role);
```

---

### **Causa 3: Bug na Conversa (patientId incorreto)**

Se a **conversa** foi criada com `patientId` errado:
```json
{
  "id": "T57IAET5UAcfkAO6HFUF",
  "patientId": "hiAf8r28RmfnppmYBpvxQwTroNI2",  // UID do prescritor (ERRADO!)
  "prescriberId": "6yooHer7ZgYOcYe0JHkXHLnWBq83"
}
```

Quando o paciente autêntico tenta enviar mensagem, o backend:
1. Valida que o usuário tem acesso (linha 577-581)
2. Usa o `userId` do token (correto)
3. Mas a conversa está associada ao UID errado

**Como verificar:**
```bash
# No console do Firebase Firestore:
1. Abrir collection "conversations"
2. Procurar por documento "T57IAET5UAcfkAO6HFUF"
3. Verificar se patientId está correto
```

---

## 🔧 SOLUÇÃO

### **Passo 1: Verificar Token no Frontend**

Adicione log no `ChatInterface.tsx`:

```typescript
const handleSendMessage = async (content: string) => {
  if (!conversationId || !firebaseUser) return;

  // 🔍 ADICIONAR ESTE LOG
  console.log('🔐 Enviando mensagem como:', {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    conversationId,
  });

  try {
    const token = await firebaseUser.getIdToken();
    // ... resto do código
  }
};
```

---

### **Passo 2: Verificar Log no Backend**

O backend já tem logs! Procure no console do Railway:
```
✅ [AUTH] User authenticated: {
  uid: "...",
  email: "...",
  role: "patient"
}
```

---

### **Passo 3: Verificar Firestore**

1. **Collection `users`**:
   - Verificar se o documento do **paciente** tem o UID correto
   - Verificar se o role é "patient"

2. **Collection `conversations`**:
   - Verificar se `patientId` está correto
   - Verificar se `prescriberId` está correto

---

## 🎯 AÇÃO IMEDIATA

**Execute este script no console do navegador (F12) enquanto estiver logado como PACIENTE:**

```javascript
// Copie e cole no console:
(async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ Usuário não autenticado!');
    return;
  }

  console.log('🔐 DADOS DO USUÁRIO AUTENTICADO:');
  console.log('  UID:', user.uid);
  console.log('  Email:', user.email);
  console.log('  DisplayName:', user.displayName);

  const token = await user.getIdToken();
  console.log('\n🎫 TOKEN (primeiros 50 caracteres):', token.substring(0, 50) + '...');

  // Buscar dados no Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    console.log('\n📄 DADOS NO FIRESTORE:');
    console.log(userDoc.data());
  } else {
    console.error('❌ Documento não encontrado no Firestore!');
  }
})();
```

**Envie o resultado desse log para análise!**

---

## 📊 CHECKLIST DE VALIDAÇÃO

- [ ] UID do token Firebase está correto?
- [ ] Role no Firestore está correto?
- [ ] `patientId` na conversa está correto?
- [ ] Log do backend mostra o UID correto?
- [ ] Mensagem salva no Firestore tem `senderId` correto?
- [ ] Payload enviado para n8n tem `senderId` correto?

---

**PRÓXIMO PASSO:** Execute o script acima e envie o resultado!

