# 💬 TESTE DOS ENDPOINTS: Conversa e Mensagens

## 📍 ENDPOINTS CRIADOS

### **1. Buscar Conversa**
```
GET /api/n8n/conversations/:conversationId
```

### **2. Buscar Mensagens**
```
GET /api/n8n/conversations/:conversationId/messages?limit=10
```

**Autenticação:** `X-Webhook-Secret` header para ambos

---

## 🧪 TESTES MANUAIS (cURL)

### **Teste 1: Buscar Conversa**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/T57IAET5UAcfkAO6HFUF" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "T57IAET5UAcfkAO6HFUF",
    "patientId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
    "prescriberId": "6yooHer7ZgYOcYe0JHkXHLnWBq83",
    "patientName": "paulo coelho",
    "prescriberName": "paulo",
    "status": "new",
    "kanbanColumn": "new",
    "priority": "medium",
    "tags": [],
    "lastMessage": "filé de frango grelhado tb pode",
    "lastMessageAt": "2025-11-16T03:00:42.000Z",
    "lastMessageBy": "prescriber",
    "unreadCount": 0,
    "createdAt": "2025-11-15T07:32:51.000Z",
    "updatedAt": "2025-11-16T03:00:42.000Z",
    "metadata": {
      "patientName": "paulo coelho",
      "patientEmail": "guimaraesjrpaulo@gmail.com",
      "prescriberName": "paulo"
    }
  }
}
```

---

### **Teste 2: Buscar Mensagens (últimas 10)**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/T57IAET5UAcfkAO6HFUF/messages?limit=10" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg1",
        "conversationId": "T57IAET5UAcfkAO6HFUF",
        "senderId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
        "senderRole": "patient",
        "content": "Olá! Gostaria de tirar algumas dúvidas.",
        "type": "text",
        "status": "read",
        "isAiGenerated": false,
        "createdAt": "2025-11-15T07:32:51.000Z",
        "readAt": "2025-11-15T07:33:00.000Z",
        "attachments": []
      },
      {
        "id": "msg2",
        "conversationId": "T57IAET5UAcfkAO6HFUF",
        "senderId": "6yooHer7ZgYOcYe0JHkXHLnWBq83",
        "senderRole": "prescriber",
        "content": "Olá! Estou aqui para te ajudar.",
        "type": "text",
        "status": "read",
        "isAiGenerated": false,
        "createdAt": "2025-11-15T07:33:15.000Z",
        "readAt": null,
        "attachments": []
      }
    ],
    "count": 2,
    "conversationId": "T57IAET5UAcfkAO6HFUF"
  }
}
```

---

### **Teste 3: Buscar Mensagens (últimas 5)**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/T57IAET5UAcfkAO6HFUF/messages?limit=5" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json"
```

---

## 🔧 USO NO WORKFLOW N8N

### **Node 1: HTTP Request - Buscar Conversa**

```javascript
// Configuração do node HTTP Request
{
  "method": "GET",
  "url": "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/{{ $json.conversationId }}",
  "headers": {
    "X-Webhook-Secret": "nutribuddy-secret-2024",
    "Content-Type": "application/json"
  }
}

// Output:
// $json.data.patientId
// $json.data.prescriberId
// $json.data.patientName
// etc.
```

---

### **Node 2: HTTP Request - Buscar Mensagens**

```javascript
// Configuração do node HTTP Request
{
  "method": "GET",
  "url": "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/{{ $json.conversationId }}/messages?limit=10",
  "headers": {
    "X-Webhook-Secret": "nutribuddy-secret-2024",
    "Content-Type": "application/json"
  }
}

// Output:
// $json.data.messages (array)
// $json.data.count (número de mensagens)
```

---

### **Node 3: Construir Histórico para IA**

```javascript
const messages = $input.first().json.data.messages;

// Formatar histórico de mensagens
const history = messages.map(msg => {
  const role = msg.senderRole === 'patient' ? 'Paciente' : 'Nutricionista';
  return `[${role}]: ${msg.content}`;
}).join('\n');

return {
  history,
  messageCount: messages.length,
  lastMessage: messages[messages.length - 1]?.content || ''
};
```

---

## 🎯 EXEMPLO DE FLUXO COMPLETO NO N8N

### **Workflow: Análise de Conversa**

```
1. [Webhook] Recebe conversationId
   ↓
2. [HTTP Request] GET /conversations/:id
   → Pega patientId, patientName
   ↓
3. [HTTP Request] GET /conversations/:id/messages?limit=10
   → Pega últimas 10 mensagens
   ↓
4. [HTTP Request] GET /patients/:patientId/diet
   → Pega dieta do paciente
   ↓
5. [Code] Construir contexto para IA
   → Monta prompt com: conversa + histórico + dieta
   ↓
6. [OpenAI] Análise da IA
   → GPT-4 analisa e responde
   ↓
7. [HTTP Response] Retorna resposta
```

---

### **Código do Node 5: Construir Contexto**

```javascript
const conversationData = $input.item(0).json.data;
const messagesData = $input.item(1).json.data;
const dietData = $input.item(2).json.data;

// Construir histórico
const history = messagesData.messages.map(msg => {
  const role = msg.senderRole === 'patient' ? 'Paciente' : 'Nutricionista';
  const timestamp = new Date(msg.createdAt._seconds * 1000).toLocaleString('pt-BR');
  return `[${timestamp}] ${role}: ${msg.content}`;
}).join('\n\n');

// Construir contexto completo
const context = `
## 🎯 CONTEXTO DA CONVERSA

**Paciente:** ${conversationData.patientName}
**Status:** ${conversationData.status}
**Prioridade:** ${conversationData.priority}
**Tags:** ${conversationData.tags.join(', ') || 'Nenhuma'}

---

## 📊 PLANO ALIMENTAR

${dietData.meals.length > 0 ? `
**Calorias diárias:** ${dietData.macros.calories} kcal
**Proteína:** ${dietData.macros.protein}g
**Carboidratos:** ${dietData.macros.carbs}g
**Gordura:** ${dietData.macros.fats}g

**Refeições:**
${dietData.meals.map(meal => `- ${meal.name} (${meal.time})`).join('\n')}
` : '⚠️ Paciente ainda não possui plano alimentar cadastrado.'}

---

## 💬 HISTÓRICO DE MENSAGENS (Últimas ${messagesData.count})

${history}

---

## 🤖 INSTRUÇÕES PARA A IA

- Analise o histórico completo da conversa
- Considere o plano alimentar do paciente
- Identifique:
  * Urgência (baixa, média, alta)
  * Sentimento (positivo, neutro, negativo)
  * Categoria (dúvida, reclamação, elogio, urgência médica)
  * Necessita resposta automática? (sim/não)
- Se necessitar resposta, gere uma resposta personalizada
- Seja empático, claro e objetivo
`;

return {
  context,
  patientName: conversationData.patientName,
  messageCount: messagesData.count,
  hasDiet: dietData.meals.length > 0
};
```

---

## 🚨 ERROS POSSÍVEIS

### **Erro 1: Conversa não encontrada**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```
**Status:** 404  
**Solução:** Verificar se conversationId está correto

---

### **Erro 2: Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```
**Status:** 401  
**Solução:** Verificar header `X-Webhook-Secret`

---

### **Erro 3: Sem mensagens**
```json
{
  "success": true,
  "data": {
    "messages": [],
    "count": 0
  }
}
```
**Status:** 200  
**Nota:** Não é erro! Conversa existe mas ainda não tem mensagens

---

## 📊 LOGS DO RAILWAY

Quando os endpoints são chamados, você verá estes logs:

```
💬 [N8N] Fetching conversation: T57IAET5UAcfkAO6HFUF
✅ [N8N] Conversation found: { patientId: '...', prescriberId: '...' }

📨 [N8N] Fetching messages for conversation: T57IAET5UAcfkAO6HFUF | Limit: 10
✅ [N8N] Messages found: 5
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Endpoint 1 retorna dados da conversa corretamente
- [ ] Endpoint 2 retorna mensagens em ordem cronológica
- [ ] Limit query param funciona (testar com 5, 10, 20)
- [ ] Retorna 404 para conversationId inexistente
- [ ] Retorna 401 sem X-Webhook-Secret
- [ ] Logs aparecem no Railway
- [ ] Performance < 500ms para queries normais

---

## 🎉 PRÓXIMOS PASSOS

1. ⏰ **Aguardar deploy** do Railway (2-5 min)
2. 🧪 **Testar endpoints** com cURL
3. 📦 **Integrar no workflow** do n8n
4. 🤖 **Testar contexto completo** da IA
5. 🚀 **Deploy final!**

---

**ENDPOINTS PRONTOS!** 🎊

Agora o workflow n8n pode buscar:
- ✅ Dados da conversa (quem, quando, status)
- ✅ Histórico de mensagens (últimas N)
- ✅ Dieta do paciente (macros, refeições)

**Contexto COMPLETO para a IA!** 🤖✨

