# 📱 RESUMO: Integração Twilio WhatsApp + N8N - Para Manus AI

**Data:** 2025-11-17  
**Backend:** https://web-production-c9eaf.up.railway.app  
**Objetivo:** Atualizar workflow N8N para enviar respostas via WhatsApp

---

## 🎯 CONTEXTO

O sistema NutriBuddy agora está **100% integrado com Twilio WhatsApp Business API**. O workflow N8N "Chat IA - Nutri-Buddy (FASE 2: Contexto Persistente)" já funciona perfeitamente no **chat interno**, e agora **as respostas automáticas da IA também são enviadas via WhatsApp**.

---

## 🏗️ ARQUITETURA ATUAL

```
┌─────────────────┐
│  Paciente       │  1. Envia mensagem
│  WhatsApp       │     via Twilio WhatsApp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Twilio         │  2. Webhook recebe
│  Sandbox        │     POST /webhooks/twilio-whatsapp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │  3. Salva em Firestore
│  NutriBuddy     │     conversations/{id}/messages
│                 │     { channel: 'whatsapp', ... }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  N8N Webhook    │  4. Dispara workflow
│  nutribuddy-    │     POST .../webhook/nutribuddy-chat
│  chat           │     Body: mensagem do paciente
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  N8N Workflow   │  5. Processa com IA
│  (FASE 2)       │     - GPT-4o Vision (fotos)
│                 │     - Whisper (áudio)
│                 │     - OpenAI (texto)
│                 │     - Contexto persistente
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │  6. N8N envia resposta
│  Endpoint N8N   │     POST /api/n8n/conversations/{id}/messages
│                 │     { senderRole: 'prescriber', content: '...' }
└────────┬────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│  Firestore      │           │  Twilio         │
│  Save           │           │  Send WhatsApp  │  🆕 NOVO!
│  (Chat Interno) │           │  (Automático)   │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Paciente       │
                              │  Recebe no      │  7. Pronto!
                              │  WhatsApp       │
                              └─────────────────┘
```

---

## 📊 ESTRUTURA DE DADOS FIRESTORE

### Collection: `conversations`

```javascript
conversations/{conversationId}: {
  // IDs
  patientId: "user_abc123",
  prescriberId: "prescriber_xyz789",
  
  // Informações do paciente
  patientName: "João Silva",
  patientEmail: "joao@example.com",
  patientPhone: "+5547992567770",  // ⚠️ IMPORTANTE: Formato E.164
  
  // 🆕 CAMPOS WHATSAPP (NOVOS)
  whatsappEnabled: true,            // Toggle frontend (ativa/desativa)
  whatsappPhone: "+5547992567770",  // Pode ser diferente do phone principal
  
  // Metadados da conversa
  status: "open",
  lastMessage: "Olá! Quanto de proteína tem no frango?",
  lastMessageAt: Timestamp,
  lastMessageBy: "patient",
  unreadCount: 0,          // Não lidos pelo prescritor
  patientUnreadCount: 2,   // Não lidos pelo paciente
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### SubCollection: `conversations/{conversationId}/messages`

```javascript
messages/{messageId}: {
  // IDs e roles
  conversationId: "conv_xyz789",
  senderId: "user_abc123",
  senderRole: "patient",  // ou "prescriber"
  
  // Conteúdo
  content: "Olá! Quanto de proteína tem no frango?",
  type: "text",  // ou "image", "audio"
  
  // 🆕 CANAL (NOVO)
  channel: "whatsapp",  // ou "internal"
  
  // Flags
  isAiGenerated: false,
  status: "sent",
  
  // WhatsApp específico (se canal = whatsapp)
  whatsappMessageId: "SMxxxxxxxxxxxxxxxxxxxx",  // SID do Twilio
  whatsappStatus: "sent",  // ou "delivered", "read", "failed"
  sentViaWhatsApp: true,
  
  // Anexos (se houver)
  attachments: [
    {
      type: "image",
      url: "https://storage.googleapis.com/.../photo.jpg",
      size: 1024000,
      mimeType: "image/jpeg"
    }
  ],
  
  // Timestamps
  createdAt: Timestamp,
  readAt: Timestamp | null
}
```

---

## 🔌 ENDPOINTS DA API (Backend)

### 1️⃣ **Endpoint que N8N USA para enviar respostas** (PRINCIPAL)

```http
POST /api/n8n/conversations/:conversationId/messages
Headers:
  X-Webhook-Secret: nutribuddy-secret-2024
  Content-Type: application/json

Body:
{
  "senderId": "prescriber_xyz789",
  "senderRole": "prescriber",
  "content": "Ótima escolha! O frango grelhado tem 31g de proteína por 100g. Continue assim! 💪",
  "type": "text",
  "isAiGenerated": true
}

Response 200:
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "conversationId": "conv_xyz789",
    "senderId": "prescriber_xyz789",
    "senderRole": "prescriber",
    "content": "Ótima escolha! O frango...",
    "type": "text",
    "isAiGenerated": true,
    "createdAt": "2025-11-17T23:45:00.000Z",
    "status": "sent",
    
    // 🆕 NOVOS CAMPOS (indicam se foi enviado via WhatsApp)
    "whatsappSent": true,
    "whatsappMessageId": "SM1234567890abcdef"
  }
}
```

**⚡ O QUE ACONTECE INTERNAMENTE:**

1. Backend recebe request do N8N
2. Salva mensagem no Firestore (`conversations/{id}/messages`)
3. **VERIFICA:** Se `conversation.whatsappEnabled === true` e `senderRole === 'prescriber'`
4. **SE SIM:** Envia automaticamente via `twilioService.sendTextMessage()`
5. Salva cópia com `channel: 'whatsapp'` e `whatsappMessageId`
6. Retorna `whatsappSent: true`

**📌 IMPORTANTE:** O N8N **NÃO precisa fazer nada diferente**! O backend cuida de tudo automaticamente.

---

### 2️⃣ **Endpoints auxiliares (já existentes, N8N já usa)**

```http
# Buscar dados da conversa
GET /api/n8n/conversations/:conversationId
Headers: X-Webhook-Secret: nutribuddy-secret-2024

Response:
{
  "success": true,
  "conversation": {
    "id": "conv_xyz789",
    "patientId": "user_abc123",
    "patientName": "João Silva",
    "whatsappEnabled": true,       // 🆕 NOVO
    "whatsappPhone": "+5547992567770",  // 🆕 NOVO
    // ... outros campos
  }
}
```

```http
# Buscar histórico de mensagens
GET /api/n8n/conversations/:conversationId/messages?limit=10
Headers: X-Webhook-Secret: nutribuddy-secret-2024

Response:
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "content": "Olá!",
      "senderRole": "patient",
      "channel": "whatsapp",  // 🆕 NOVO
      "createdAt": "2025-11-17T23:40:00.000Z"
    },
    {
      "id": "msg_124",
      "content": "Como posso ajudar?",
      "senderRole": "prescriber",
      "channel": "internal",  // 🆕 NOVO
      "isAiGenerated": true,
      "createdAt": "2025-11-17T23:41:00.000Z"
    }
  ]
}
```

```http
# Buscar dieta do paciente
GET /api/n8n/patients/:patientId/diet
Headers: X-Webhook-Secret: nutribuddy-secret-2024

Response:
{
  "success": true,
  "data": {
    "name": "Plano de Emagrecimento",
    "meals": [...],
    "macros": {
      "protein": 150,
      "carbs": 200,
      "fats": 60,
      "calories": 1800
    }
  }
}
```

---

## 🔄 FLUXO DO WEBHOOK N8N (Como está HOJE)

### **Webhook recebe mensagem do backend:**

```json
POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat
Headers:
  X-Webhook-Secret: nutribuddy-secret-2024
  Content-Type: application/json

Body:
{
  "conversationId": "conv_xyz789",
  "messageId": "msg_abc123",
  "senderId": "user_abc123",
  "senderRole": "patient",
  "patientId": "user_abc123",
  "prescriberId": "prescriber_xyz789",
  "content": "Olá! Quanto de proteína tem no frango?",
  "type": "text",
  
  // 🆕 NOVO (se for imagem)
  "attachments": [
    {
      "type": "image",
      "url": "https://storage.googleapis.com/.../photo.jpg"
    }
  ],
  
  "timestamp": "2025-11-17T23:40:00.000Z"
}
```

### **N8N processa e envia resposta:**

```javascript
// Node: "10. Enviar Auto-resposta" (ou "12a. Enviar Resposta (FOTO)")
HTTP Request POST /api/n8n/conversations/{{ conversationId }}/messages
Headers:
  X-Webhook-Secret: nutribuddy-secret-2024
  Content-Type: application/json

Body:
{
  "senderId": "{{ prescriberId }}",
  "senderRole": "prescriber",
  "content": "{{ resposta gerada pela IA }}",
  "type": "text",
  "isAiGenerated": true
}
```

---

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### ✅ Backend:
1. **Webhook Twilio** (`/webhooks/twilio-whatsapp`) recebe mensagens do WhatsApp
2. **Salva no Firestore** em `conversations/{id}/messages` com `channel: 'whatsapp'`
3. **Dispara N8N** via webhook (se configurado)
4. **Endpoint N8N** (`/api/n8n/conversations/{id}/messages`) recebe respostas
5. **Envia via Twilio** automaticamente se `whatsappEnabled: true`

### ✅ Frontend:
1. **Toggle WhatsApp** no header do chat (ativa/desativa por conversa)
2. **Badge de canal** nas mensagens (`📱 WhatsApp`, `💬 Interno`, `🤖 IA`)
3. **Histórico unificado** (mensagens internas + WhatsApp no mesmo chat)

### ✅ Twilio:
1. **Recebe mensagens** do WhatsApp Business Sandbox
2. **Envia mensagens** via `twilioService.sendTextMessage()`
3. **Webhooks de status** para rastreamento de entrega

---

## 🎯 O QUE O N8N PRECISA (Checklist)

### ✅ Já está funcionando:
- ✅ Recebe webhook do backend com mensagens dos pacientes
- ✅ Filtra mensagens (`senderRole === 'patient'`)
- ✅ Busca contexto (conversa, histórico, dieta)
- ✅ Processa com IA (GPT-4o Vision, OpenAI, Whisper)
- ✅ Envia resposta para backend via `POST /api/n8n/conversations/{id}/messages`

### 🆕 NOVO (já implementado no backend):
- ✅ Backend **automaticamente** envia via WhatsApp se `whatsappEnabled: true`
- ✅ N8N **não precisa mudar nada**! 🎉

### 🔧 Opcional (melhorias futuras):
- 📌 N8N pode verificar `whatsappEnabled` no node "3. Buscar Conversa"
- 📌 N8N pode logar se mensagem será enviada via WhatsApp
- 📌 N8N pode ajustar tom/formato da resposta se for WhatsApp vs. chat interno

---

## 📝 EXEMPLO PRÁTICO

### Cenário: Paciente envia mensagem no WhatsApp

1. **Paciente envia:** "Oi! Quanto de proteína tem no frango?"
2. **Twilio recebe** e envia webhook para backend
3. **Backend salva** em Firestore:
   ```javascript
   {
     conversationId: "conv_123",
     content: "Oi! Quanto de proteína tem no frango?",
     senderRole: "patient",
     channel: "whatsapp",
     whatsappMessageId: "SM9876543210"
   }
   ```
4. **Backend dispara N8N** com os dados da mensagem
5. **N8N processa:**
   - Valida que é mensagem do paciente ✅
   - Busca dados da conversa
   - Busca dieta do paciente
   - IA gera resposta: "Ótima pergunta! O frango grelhado tem aproximadamente 31g de proteína por 100g. É uma excelente fonte de proteína magra! 🍗"
6. **N8N envia** para backend:
   ```javascript
   POST /api/n8n/conversations/conv_123/messages
   {
     "senderId": "prescriber_xyz",
     "senderRole": "prescriber",
     "content": "Ótima pergunta! O frango grelhado...",
     "isAiGenerated": true
   }
   ```
7. **Backend:**
   - Salva no chat interno ✅
   - Vê que `whatsappEnabled: true` ✅
   - **Envia via Twilio automaticamente** ✅
8. **Paciente recebe** resposta no WhatsApp! 🎉

---

## 🔧 CONFIGURAÇÃO ATUAL

### Variáveis de Ambiente (Backend - Railway):
```env
# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+15558337724

# N8N
N8N_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app
WEBHOOK_SECRET=nutribuddy-secret-2024
```

### Número de Teste WhatsApp:
- **Backend:** `whatsapp:+15558337724` (número Twilio Sandbox)
- **Paciente (você):** `+5547992567770` (formato E.164 no Firestore)

---

## 📋 LOGS DO SISTEMA (Para Debug)

### Backend logs (Railway):
```bash
railway logs -f
```

### Exemplo de logs de sucesso:
```
📱 [Twilio] Mensagem recebida: WhatsApp:+5547992567770
💾 [Twilio] Mensagem salva: msg_abc123
🔔 [N8N] Processando...
✉️ [N8N] Creating message for conversation: conv_xyz789 | Sender: prescriber
✅ [N8N] Message created: msg_def456
📱 [N8N→WhatsApp] Tentando enviar via Twilio...
📤 [Twilio] Enviando para +5547992567770
✅ [Twilio] Mensagem enviada! SID: SM1234567890abcdef
✅ [N8N→WhatsApp] Mensagem enviada via Twilio: SM1234567890abcdef
```

---

## 🎨 MUDANÇAS NO N8N (Opcional)

### Se quiser adicionar lógica específica para WhatsApp:

#### Node: "3. Buscar Conversa"
```javascript
// Após buscar conversa, adicionar log:
const conversation = $input.first().json;

console.log('📱 WhatsApp habilitado:', conversation.whatsappEnabled);
console.log('📞 Telefone WhatsApp:', conversation.whatsappPhone);

return { json: conversation };
```

#### Node: "10. Enviar Auto-resposta" (ou equivalente)
```javascript
// Opcional: Ajustar tom/formato se WhatsApp
const conversation = $('3. Buscar Conversa').first().json;
let content = $json.resposta;

if (conversation.whatsappEnabled) {
  console.log('📱 Esta mensagem será enviada via WhatsApp');
  
  // Opcional: Ajustar formatação para WhatsApp
  // Exemplo: WhatsApp não suporta algumas formatações markdown
  // content = content.replace(/\*\*(.*?)\*\*/g, '*$1*');  // bold
}

return {
  json: {
    senderId: $json.prescriberId,
    senderRole: 'prescriber',
    content: content,
    type: 'text',
    isAiGenerated: true
  }
};
```

**MAS ISSO É OPCIONAL!** O sistema já funciona sem essas mudanças.

---

## ❓ PERGUNTAS FREQUENTES

### 1. **O N8N precisa mudar algo para funcionar com WhatsApp?**
❌ **NÃO!** O backend cuida de tudo automaticamente. O N8N continua fazendo exatamente o que fazia antes.

### 2. **Como ativar WhatsApp para uma conversa?**
No frontend, no header do chat, tem um toggle "📱 WhatsApp". Ative para habilitar.

### 3. **Como saber se uma mensagem veio do WhatsApp?**
O campo `channel` na mensagem do webhook:
- `"channel": "whatsapp"` → Veio do WhatsApp
- `"channel": "internal"` → Veio do chat web

### 4. **E se o paciente não tiver WhatsApp configurado?**
Se `whatsappEnabled: false` ou `whatsappPhone: null`, a mensagem só vai para o chat interno (como era antes).

### 5. **O N8N consegue enviar direto para o Twilio?**
Tecnicamente sim, mas **NÃO RECOMENDADO**. Deixe o backend cuidar disso para manter logs, histórico e sincronização corretos.

### 6. **Como testar?**
1. Ative WhatsApp na conversa (frontend)
2. Envie mensagem do WhatsApp do paciente
3. Verifique logs do Railway
4. Paciente recebe resposta no WhatsApp

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Arquivos no repositório:
- `N8N-WHATSAPP-INTEGRACAO-COMPLETA.md` - Documentação completa da integração
- `INTEGRACAO-WHATSAPP-CHAT-COMPLETA.md` - Chat interno + WhatsApp
- `routes/n8n.js` (linha 1715-1860) - Código do endpoint que N8N usa

---

## 🚀 RESUMO EXECUTIVO

**Para Manus AI:**

O sistema já está 100% funcional. O workflow N8N existente **não precisa de nenhuma mudança obrigatória**. O backend agora:

1. ✅ Recebe mensagens do WhatsApp via Twilio
2. ✅ Dispara o workflow N8N (como sempre fez)
3. ✅ Recebe a resposta do N8N
4. ✅ **AUTOMATICAMENTE envia via WhatsApp** (se habilitado)

**Única mudança no N8N (opcional):**
- Adicionar logs para indicar quando uma conversa tem WhatsApp habilitado
- Ajustar tom/formato da resposta se necessário

**Mas o sistema já funciona perfeitamente sem isso!** 🎉

---

**Contato Backend:**
- URL: `https://web-production-c9eaf.up.railway.app`
- Webhook Secret: `nutribuddy-secret-2024`
- N8N Webhook: `https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat`

---

**Status:** ✅ PRODUÇÃO - FUNCIONANDO  
**Última atualização:** 2025-11-17 (commit: dae12a3)

