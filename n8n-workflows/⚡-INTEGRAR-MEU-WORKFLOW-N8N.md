# ⚡ COMO INTEGRAR SEU WORKFLOW N8N

## 🎯 OBJETIVO

Você está criando um workflow no n8n manualmente. Vou te mostrar **exatamente** o que fazer para integrar com o NutriBuddy.

---

## 📋 ESTRUTURA DO SEU WORKFLOW N8N

### 1. Webhook (Início)
**Recebe dados** quando paciente envia mensagem

### 2. Análise com GPT-4 Vision
**Processa** a foto e gera resposta

### 3. **ENVIAR AO CHAT** ⚡ (CRITICAL!)
**Este node é essencial** - envia resposta ao paciente

### 4. Responder ao Webhook
**Confirma** que processou

---

## 🔧 PASSO A PASSO DE INTEGRAÇÃO

## PARTE 1: CONFIGURAR WEBHOOK NO N8N

### 1.1 Criar Node Webhook

No seu workflow n8n, o primeiro node deve ser:

```
Type: Webhook
HTTP Method: POST
Path: nutribuddy-chat-photo
Response Mode: "Using 'Respond to Webhook' node"
```

### 1.2 Copiar URL do Webhook

Após salvar, o n8n mostra URLs como:

```
Production URL:
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo

Test URL:
https://n8n-production-3eae.up.railway.app/webhook-test/nutribuddy-chat-photo
```

**Copie a Production URL!**

---

## PARTE 2: O NODE MAIS IMPORTANTE ⚡

**Depois da análise do GPT-4 Vision**, adicione este node:

### Node: HTTP Request (Enviar ao Chat)

```javascript
Name: Enviar Resposta ao Chat

Method: POST

URL:
https://web-production-c9eaf.up.railway.app/api/n8n/conversations/{{ $json.conversationId }}/messages

Authentication: None

Headers:
  1. Name: Content-Type
     Value: application/json
  
  2. Name: X-Webhook-Secret
     Value: nutribuddy-secret-2024

Send Body: Yes
Body Content Type: JSON

JSON Body:
{
  "senderId": "{{ $json.senderId || $json.prescriberId || 'system' }}",
  "senderRole": "prescriber",
  "content": "{{ $json.content }}",
  "type": "text",
  "isAiGenerated": true
}

Options:
  Timeout: 15000
```

**Este node é o que faz a mensagem aparecer no chat!**

---

## PARTE 3: DADOS QUE O WEBHOOK RECEBE

Quando o backend chamar seu webhook, você receberá:

```json
{
  "conversationId": "T57IAET5UAcfkAO6HFUF",
  "messageId": "abc123...",
  "senderId": "patient_id_here",
  "senderRole": "patient",
  "patientId": "patient_id_here",
  "prescriberId": "prescriber_id_here",
  "content": "Olá! Foto da refeição",
  "type": "text",
  "timestamp": "2025-11-16T20:38:28.937Z",
  "attachments": [
    {
      "url": "https://storage.googleapis.com/nutribuddy.../photo.jpg",
      "type": "image",
      "name": "photo.jpg"
    }
  ]
}
```

**Campos importantes:**
- `conversationId` - Usar no node "Enviar ao Chat"
- `attachments[0].url` - URL da foto para GPT-4 Vision
- `patientId` - Para buscar contexto nutricional
- `prescriberId` - Para o senderId da resposta

---

## PARTE 4: ADICIONAR CÓDIGO NO BACKEND

Agora você precisa fazer o backend chamar seu webhook n8n.

### 4.1 Abrir arquivo de rotas

```bash
/Users/drpgjr.../NutriBuddy/routes/messages.js
```

### 4.2 Encontrar onde mensagens são criadas

Procure pela função que cria mensagens (algo como `router.post('/conversations/:conversationId/messages')`).

### 4.3 Adicionar chamada ao n8n

**DEPOIS** de salvar a mensagem no Firestore, adicione:

```javascript
// Depois de criar a mensagem no Firestore...

// 🔔 Trigger n8n workflow para análise de foto
if (messageData.attachments && messageData.attachments.length > 0) {
  const hasImage = messageData.attachments.some(att => 
    att.type === 'image' || att.contentType?.startsWith('image/')
  );
  
  if (hasImage) {
    console.log('📸 [N8N] Imagem detectada, acionando workflow...');
    
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_PHOTO_ANALYSIS || 
        'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo';
      
      const n8nPayload = {
        conversationId: messageData.conversationId,
        messageId: messageRef.id,
        senderId: messageData.senderId,
        senderRole: messageData.senderRole,
        patientId: conversation.patientId,
        prescriberId: conversation.prescriberId,
        content: messageData.content,
        type: messageData.type,
        timestamp: messageData.createdAt.toISOString(),
        attachments: messageData.attachments.map(att => ({
          url: att.url,
          type: att.type || 'image',
          name: att.name || 'image.jpg'
        }))
      };
      
      // Chamar webhook n8n (não espera resposta - fire and forget)
      axios.post(n8nWebhookUrl, n8nPayload, {
        timeout: 3000,
        validateStatus: () => true // Aceita qualquer status
      }).catch(err => {
        console.error('⚠️ [N8N] Erro ao acionar webhook:', err.message);
      });
      
      console.log('✅ [N8N] Webhook acionado');
      
    } catch (error) {
      console.error('❌ [N8N] Erro no trigger:', error.message);
    }
  }
}

// Continua com o resto da função...
```

---

## PARTE 5: VARIÁVEL DE AMBIENTE

Adicione no `.env`:

```bash
# N8N Webhook URLs
N8N_WEBHOOK_PHOTO_ANALYSIS=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-photo
```

---

## PARTE 6: TESTAR A INTEGRAÇÃO

### 6.1 Ativar Workflow no n8n

```
1. Salve o workflow
2. Clique no toggle "Active" (fica verde)
3. Workflow está esperando chamadas
```

### 6.2 Enviar Mensagem de Teste

No chat NutriBuddy:

```
1. Anexe uma foto de comida
2. Envie
3. Aguarde 5-10 segundos
```

### 6.3 Verificar Logs

**No n8n:**
```
Executions → Ver última execução → Cada node deve estar verde
```

**No Railway (backend):**
```
📸 [N8N] Imagem detectada, acionando workflow...
✅ [N8N] Webhook acionado
```

**No chat:**
```
✅ Mensagem da IA deve aparecer!
```

---

## 📊 FLUXO COMPLETO

```
1. PACIENTE envia foto no chat
   ↓
2. FRONTEND cria mensagem no Firestore
   ↓
3. BACKEND detecta imagem
   ↓
4. BACKEND chama webhook n8n
   ↓
5. N8N recebe dados (node Webhook)
   ↓
6. N8N processa com GPT-4 Vision
   ↓
7. N8N gera resposta personalizada
   ↓
8. N8N ENVIA resposta ao chat (node HTTP Request)
   ↓
9. BACKEND salva mensagem no Firestore
   ↓
10. FRONTEND atualiza em tempo real
   ↓
11. PACIENTE vê resposta da IA!
```

---

## 🎯 CHECKLIST DE INTEGRAÇÃO

- [ ] Workflow criado no n8n
- [ ] Node Webhook configurado
- [ ] URL do webhook copiada
- [ ] Node "Enviar ao Chat" adicionado
- [ ] Headers configurados (X-Webhook-Secret)
- [ ] Código adicionado no backend
- [ ] Variável de ambiente configurada
- [ ] Workflow ativado no n8n
- [ ] Testado com foto real
- [ ] Resposta apareceu no chat

---

## 🐛 TROUBLESHOOTING

### Webhook n8n não é chamado

**Verificar:**
1. Backend está fazendo o POST?
   - Procure log: `📸 [N8N] Imagem detectada`
2. URL do webhook está correta?
   - Verifique a variável `N8N_WEBHOOK_PHOTO_ANALYSIS`
3. Workflow está ativo?
   - Toggle verde no n8n

---

### Node "Enviar ao Chat" falha

**Erro: "Invalid or missing webhook secret"**
```
Solução: Verificar header X-Webhook-Secret
Deve ser: nutribuddy-secret-2024
```

**Erro: "conversationId is required"**
```
Solução: Verificar que $json.conversationId existe
Adicionar node Code antes para validar
```

**Erro: "Conversation not found"**
```
Solução: conversationId incorreto
Verificar que o ID vem do webhook inicial
```

---

### Mensagem não aparece no chat

**Possíveis causas:**

1. **Node "Enviar ao Chat" não executou:**
   - Verificar execução no n8n (deve estar verde)
   - Ver output do node (deve ter `success: true`)

2. **senderId incorreto:**
   - Usar prescriberId ou "system"
   - Não usar patientId

3. **Frontend não atualizou:**
   - Recarregar página (F5)
   - Verificar listener do Firestore

---

## 💡 DICAS IMPORTANTES

### 1. Fire and Forget

O backend chama o webhook mas **não espera** a resposta:

```javascript
// ✅ CORRETO (não espera)
axios.post(url, data).catch(() => {});

// ❌ ERRADO (trava a resposta)
await axios.post(url, data);
```

### 2. Timeout Curto no Backend

```javascript
axios.post(url, data, {
  timeout: 3000  // 3 segundos apenas
})
```

O n8n vai processar em background.

### 3. Validar Dados no n8n

Adicione um node Code no início:

```javascript
// Validar dados recebidos
const data = $input.first().json;

if (!data.conversationId) {
  throw new Error('conversationId obrigatório');
}

if (!data.attachments || data.attachments.length === 0) {
  throw new Error('Nenhuma imagem encontrada');
}

return { json: data };
```

---

## 📝 EXEMPLO DE WORKFLOW COMPLETO

```
1. Webhook
   ↓
2. Validar Dados (Code)
   ↓
3. Buscar Perfil do Paciente (HTTP Request)
   ↓
4. Buscar Refeições Hoje (HTTP Request)
   ↓
5. Construir Contexto (Code)
   ↓
6. GPT-4 Vision Análise (HTTP Request ou OpenAI node)
   ↓
7. Parse Resposta (Code)
   ↓
8. ENVIAR AO CHAT ⚡ (HTTP Request)
   ↓
9. Responder ao Webhook (Respond to Webhook)
```

---

## 🎉 RESULTADO FINAL

Depois de integrar:

```
Paciente envia foto
   ↓
Backend detecta imagem
   ↓
Backend aciona n8n (assíncrono)
   ↓
Backend responde ao frontend (rápido)
   ↓
N8n processa em background
   ↓
N8n envia resposta ao chat
   ↓
Paciente recebe análise da IA!
```

---

**Tempo de integração:** 10-15 minutos  
**Dificuldade:** Média  
**Impacto:** Alto - Análise automática de fotos

🚀 **Comece pela PARTE 1 e vá seguindo em ordem!**


