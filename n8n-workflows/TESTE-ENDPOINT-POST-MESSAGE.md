# ✉️ TESTE DO ENDPOINT: Enviar Mensagem (POST)

## 📍 ENDPOINT CRIADO

```
POST /api/n8n/conversations/:conversationId/messages
```

**Autenticação:** `X-Webhook-Secret` header

**Body:**
```json
{
  "senderId": "string",
  "senderRole": "prescriber|patient|system",
  "content": "string",
  "type": "text|image|audio|file",
  "isAiGenerated": true|false
}
```

---

## 🧪 TESTE MANUAL (cURL)

### **Teste 1: Enviar Resposta da IA**

```bash
curl -X POST \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/T57IAET5UAcfkAO6HFUF/messages" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "6yooHer7ZgYOcYe0JHkXHLnWBq83",
    "senderRole": "prescriber",
    "content": "Olá! Com base na sua dieta de 1800 kcal/dia e 180g de carboidratos, você PODE comer banana no café da manhã! Uma banana média tem cerca de 27g de carboidratos, o que se encaixa perfeitamente no seu plano. Recomendo comer junto com o ovo mexido para balancear proteína e carboidratos. 🍌",
    "type": "text",
    "isAiGenerated": true
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "messageId": "abc123xyz",
    "conversationId": "T57IAET5UAcfkAO6HFUF",
    "senderId": "6yooHer7ZgYOcYe0JHkXHLnWBq83",
    "senderRole": "prescriber",
    "content": "Olá! Com base na sua dieta de 1800 kcal/dia...",
    "type": "text",
    "isAiGenerated": true,
    "createdAt": "2025-11-16T03:30:00.000Z",
    "status": "sent"
  }
}
```

---

### **Teste 2: Enviar Mensagem do Sistema**

```bash
curl -X POST \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/T57IAET5UAcfkAO6HFUF/messages" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "system",
    "senderRole": "system",
    "content": "⚠️ Mensagem marcada como URGENTE. O nutricionista foi notificado e responderá em breve.",
    "type": "text",
    "isAiGenerated": false
  }'
```

---

## 🔧 USO NO WORKFLOW N8N

### **Fluxo Completo: Paciente Envia Mensagem → IA Responde**

```
1. [Webhook] Recebe nova mensagem do paciente
   ↓
2. [HTTP Request] GET /conversations/:id
   → Busca dados da conversa
   ↓
3. [HTTP Request] GET /conversations/:id/messages?limit=10
   → Busca histórico
   ↓
4. [HTTP Request] GET /patients/:patientId/diet
   → Busca dieta do paciente
   ↓
5. [Code] Construir contexto completo
   → Monta prompt com conversa + histórico + dieta
   ↓
6. [OpenAI] Análise da IA
   → GPT-4 analisa e gera resposta
   ↓
7. [HTTP Request] POST /conversations/:id/messages
   → Envia resposta da IA para o paciente
   ↓
8. [HTTP Response] Retorna sucesso
```

---

### **Node 7: Enviar Resposta da IA**

**Configuração do HTTP Request:**

```javascript
// Method: POST
// URL:
const conversationId = $json.conversationId;
const url = `https://web-production-c9eaf.up.railway.app/api/n8n/conversations/${conversationId}/messages`;

// Headers:
{
  "X-Webhook-Secret": "nutribuddy-secret-2024",
  "Content-Type": "application/json"
}

// Body:
{
  "senderId": "{{ $json.prescriberId }}",
  "senderRole": "prescriber",
  "content": "{{ $node['OpenAI'].json.response }}",
  "type": "text",
  "isAiGenerated": true
}
```

---

### **Exemplo Completo (Code Node):**

```javascript
const conversationData = $input.item(0).json.data;
const aiResponse = $input.item(1).json.choices[0].message.content;

// Preparar payload para enviar mensagem
return {
  conversationId: conversationData.id,
  prescriberId: conversationData.prescriberId,
  messagePayload: {
    senderId: conversationData.prescriberId,
    senderRole: 'prescriber',
    content: aiResponse.trim(),
    type: 'text',
    isAiGenerated: true
  }
};
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### **1. Criação de Mensagem**
✅ Cria mensagem na subcollection `messages`  
✅ Define `createdAt` automaticamente  
✅ Define `status: 'sent'`  
✅ Suporta `isAiGenerated: true/false`

### **2. Atualização da Conversa**
✅ Atualiza `lastMessage` (primeiros 100 caracteres)  
✅ Atualiza `lastMessageAt`  
✅ Atualiza `lastMessageBy` (senderRole)  
✅ Incrementa `unreadCount` ou `patientUnreadCount`

### **3. Contadores de Não Lidos**
- **Se mensagem de `prescriber` ou `system`:**
  - Incrementa `patientUnreadCount` (paciente precisa ler)
- **Se mensagem de `patient`:**
  - Incrementa `unreadCount` (prescritor precisa ler)

---

## 🎯 CASOS DE USO

### **Caso 1: IA Responde Automaticamente**

**Cenário:** Paciente pergunta algo simples sobre a dieta

**Payload:**
```json
{
  "senderId": "prescriberId-123",
  "senderRole": "prescriber",
  "content": "Sim, você pode comer banana! Ela tem 27g de carboidratos e se encaixa no seu plano de 180g/dia.",
  "type": "text",
  "isAiGenerated": true
}
```

**Resultado:**
- Mensagem aparece no chat com badge "🤖 IA"
- Paciente recebe notificação
- `patientUnreadCount++`

---

### **Caso 2: Sistema Envia Alerta**

**Cenário:** Workflow detecta urgência e notifica paciente

**Payload:**
```json
{
  "senderId": "system",
  "senderRole": "system",
  "content": "⚠️ Sua mensagem foi marcada como URGENTE. O nutricionista foi notificado e responderá em breve.",
  "type": "text",
  "isAiGenerated": false
}
```

**Resultado:**
- Mensagem aparece no chat com ícone de sistema
- Paciente sabe que foi escalado para humano
- `patientUnreadCount++`

---

### **Caso 3: Prescritor Responde Manualmente**

**Cenário:** Prescritor vê a mensagem do paciente no dashboard e responde

**Payload:**
```json
{
  "senderId": "prescriberId-123",
  "senderRole": "prescriber",
  "content": "Olá! Analisei sua dúvida. Você está indo muito bem! Continue assim.",
  "type": "text",
  "isAiGenerated": false
}
```

**Resultado:**
- Mensagem aparece no chat (sem badge de IA)
- Paciente sabe que é resposta humana
- `patientUnreadCount++`

---

## 🚨 VALIDAÇÕES E ERROS

### **Erro 1: Campos obrigatórios faltando**
```json
{
  "success": false,
  "error": "senderId, senderRole and content are required"
}
```
**Status:** 400

---

### **Erro 2: Conversa não encontrada**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```
**Status:** 404

---

### **Erro 3: Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```
**Status:** 401

---

## 📊 LOGS DO RAILWAY

Quando o endpoint é chamado:

```
✉️ [N8N] Creating message for conversation: T57IAET5UAcfkAO6HFUF | Sender: prescriber
✅ [N8N] Message created: msg_abc123xyz
✅ [N8N] Conversation updated
```

---

## 🎯 FLUXO COMPLETO: TESTE END-TO-END

### **1. Paciente envia mensagem no frontend**
```
"Posso comer banana no café da manhã?"
```

### **2. Backend dispara webhook para n8n**
```
POST https://n8n.../webhook/nutribuddy-chat
Body: {
  conversationId: "T57IAET5UAcfkAO6HFUF",
  messageId: "msg1",
  senderId: "patientId",
  senderRole: "patient",
  content: "Posso comer banana no café da manhã?"
}
```

### **3. N8N busca contexto**
```
GET /conversations/:id → Dados da conversa
GET /conversations/:id/messages → Histórico
GET /patients/:patientId/diet → Dieta
```

### **4. N8N chama OpenAI**
```
Prompt: "O paciente tem 1800 kcal/dia, 180g carbs.
Histórico: [últimas 10 mensagens]
Pergunta: Posso comer banana no café da manhã?"

GPT-4: "Sim! Banana tem 27g carbs, se encaixa no plano..."
```

### **5. N8N envia resposta da IA**
```
POST /conversations/:id/messages
Body: {
  senderId: "prescriberId",
  senderRole: "prescriber",
  content: "Sim! Banana tem 27g carbs...",
  isAiGenerated: true
}
```

### **6. Paciente recebe resposta no frontend**
```
[🤖 IA] "Sim! Banana tem 27g carbs, se encaixa no plano..."
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Endpoint cria mensagem corretamente
- [ ] `messageId` é retornado
- [ ] `createdAt` está no formato correto
- [ ] `lastMessage` da conversa é atualizado
- [ ] `unreadCount` é incrementado corretamente
- [ ] Mensagem aparece no frontend
- [ ] Badge "🤖 IA" aparece se `isAiGenerated: true`
- [ ] Logs aparecem no Railway
- [ ] Performance < 500ms

---

## 🎉 RESUMO DOS ENDPOINTS N8N

Agora você tem **4 endpoints** completos para o workflow:

| Endpoint | Método | Função |
|----------|--------|--------|
| `/patients/:id/diet` | GET | Buscar dieta do paciente |
| `/conversations/:id` | GET | Buscar dados da conversa |
| `/conversations/:id/messages` | GET | Buscar histórico de mensagens |
| `/conversations/:id/messages` | POST | **Enviar resposta da IA** |

**Todos protegidos por:** `X-Webhook-Secret: nutribuddy-secret-2024`

---

**ENDPOINT POST PRONTO!** 🎊

Agora o workflow n8n pode **ENVIAR RESPOSTAS** da IA diretamente para o chat! 🤖✨

