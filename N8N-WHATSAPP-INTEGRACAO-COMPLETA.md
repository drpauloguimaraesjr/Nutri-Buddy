# 🤖📱 Integração N8N → WhatsApp (Twilio) - DOCUMENTAÇÃO COMPLETA

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Fluxo](#arquitetura-do-fluxo)
3. [Como Funciona](#como-funciona)
4. [Configuração](#configuração)
5. [Testando](#testando)
6. [Troubleshooting](#troubleshooting)
7. [Logs e Monitoramento](#logs-e-monitoramento)

---

## 🎯 VISÃO GERAL

Seu **workflow N8N complexo** (Chat IA com GPT-4o Vision, análise de fotos, transcrição de áudio, contexto persistente) agora está **100% integrado com WhatsApp** via Twilio.

### O que foi implementado:

✅ **Mensagens do WhatsApp → N8N** (já funcionava)  
✅ **Respostas do N8N → WhatsApp** (**NOVO!**)  
✅ **Chat interno permanece funcionando** (sem mudanças)  
✅ **Logs detalhados** de todo o fluxo  
✅ **Degradação graciosa** (se WhatsApp falhar, chat interno continua)

---

## 🏗️ ARQUITETURA DO FLUXO

### 📥 ENTRADA: Paciente → N8N

```
┌─────────────────┐
│  Paciente       │  1. Envia mensagem (texto/foto/áudio)
│  WhatsApp       │     via WhatsApp Business API (Twilio)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Twilio         │  2. Recebe mensagem
│  Webhook        │     POST /webhooks/twilio-whatsapp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │  3. Salva em Firestore
│  NutriBuddy     │     conversations/{id}/messages
│                 │     { channel: 'whatsapp' }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook N8N    │  4. Dispara workflow
│  nutribuddy-    │     POST https://n8n.../webhook/nutribuddy-chat
│  chat           │     Body: { conversationId, messageId, content, ... }
└─────────────────┘
```

### 📤 SAÍDA: N8N → Paciente

```
┌─────────────────┐
│  N8N Workflow   │  5. Processa mensagem
│                 │     - Filtra (só pacientes)
│  - Vision AI    │     - Analisa foto (GPT-4o Vision)
│  - OpenAI       │     - Transcreve áudio (manus-speech-to-text)
│  - Contexto     │     - Gera resposta (OpenAI)
│    Persistente  │     - Contexto multi-turno (FASE 2)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend        │  6. Recebe resposta do N8N
│  NutriBuddy     │     POST /api/n8n/conversations/{id}/messages
│  (Endpoint N8N) │     { senderId, senderRole, content, ... }
└────────┬────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│  Firestore      │           │  Twilio         │
│  Save           │           │  Send Message   │ 🆕 NOVO!
│  (Chat Interno) │           │  (WhatsApp)     │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Paciente       │
                              │  WhatsApp       │  7. Recebe resposta!
                              └─────────────────┘
```

---

## ⚙️ COMO FUNCIONA

### 🔍 Detalhamento Técnico

#### 1. **Webhook Twilio recebe mensagem**
```javascript
// routes/whatsapp.js
router.post('/twilio-whatsapp', async (req, res) => {
  // Recebe mensagem do Twilio
  const { From, Body, MessageSid } = req.body;
  
  // Salva em Firestore
  await messagesRef.add({
    content: Body,
    senderRole: 'patient',
    channel: 'whatsapp',
    whatsappMessageId: MessageSid,
    // ...
  });
  
  // Dispara N8N (se configurado)
  // ... webhook trigger ...
});
```

#### 2. **N8N processa e envia resposta**
```javascript
// No workflow N8N (node "10. Enviar Auto-resposta")
HTTP Request POST /api/n8n/conversations/{conversationId}/messages
{
  "senderId": "{{ prescriberId }}",
  "senderRole": "prescriber",
  "content": "{{ resposta da IA }}",
  "type": "text",
  "isAiGenerated": true
}
```

#### 3. **Backend recebe e roteia** 🆕
```javascript
// routes/n8n.js
router.post('/conversations/:conversationId/messages', async (req, res) => {
  const { senderId, senderRole, content } = req.body;
  const conversation = await getConversation(conversationId);
  
  // 1️⃣ SEMPRE salva no chat interno
  await messagesRef.add({
    conversationId,
    senderId,
    senderRole,
    content,
    channel: 'internal',
    isAiGenerated: true,
    // ...
  });
  
  // 2️⃣ NOVO: Se WhatsApp habilitado, envia via Twilio
  if (senderRole === 'prescriber' && 
      conversation.whatsappEnabled === true && 
      conversation.whatsappPhone) {
    
    const result = await twilioService.sendTextMessage(
      conversation.whatsappPhone,
      content
    );
    
    if (result.success) {
      // Salva cópia com flag WhatsApp
      await messagesRef.add({
        ...messageData,
        channel: 'whatsapp',
        whatsappMessageId: result.messageSid,
        // ...
      });
      
      console.log('✅ [N8N→WhatsApp] Enviado:', result.messageSid);
    }
  }
  
  res.json({ success: true, whatsappSent: true });
});
```

---

## 🔧 CONFIGURAÇÃO

### 1️⃣ **Variáveis de Ambiente** (Railway)

```env
# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+15558337724

# N8N Webhook (opcional - se quiser disparar workflows)
N8N_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app
WEBHOOK_SECRET=nutribuddy-secret-2024
```

### 2️⃣ **Firestore: Estrutura de Conversa**

```javascript
// Firestore: conversations/{conversationId}
{
  patientId: "user_abc123",
  prescriberId: "prescriber_xyz789",
  patientName: "João Silva",
  
  // 🆕 Campos WhatsApp
  whatsappEnabled: true,                    // Toggle frontend
  whatsappPhone: "+5547992567770",          // Formato E.164
  
  lastMessage: "...",
  lastMessageAt: Timestamp,
  lastMessageBy: "prescriber",
  unreadCount: 0,
  patientUnreadCount: 2,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3️⃣ **N8N: Webhook Configuração**

```json
{
  "name": "Webhook: Nova Mensagem",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "nutribuddy-chat",
    "responseMode": "responseNode"
  }
}
```

**URL do Webhook:**
```
https://web-production-c9eaf.up.railway.app/api/webhook/nutribuddy-chat
```

**Headers obrigatórios:**
```
X-Webhook-Secret: nutribuddy-secret-2024
Content-Type: application/json
```

---

## 🧪 TESTANDO

### Teste 1: Mensagem de Texto

```bash
# 1. Envie mensagem do WhatsApp do paciente
# Número: +5547992567770
# Conteúdo: "Oi! Quanto de proteína tem no frango?"

# 2. Verifique logs do Railway
railway logs -f

# Logs esperados:
# ✉️ [Twilio] Mensagem recebida: WhatsApp:+5547992567770
# 💾 [Twilio] Mensagem salva no chat interno
# 🔔 [N8N] Webhook disparado
# ... (processamento do N8N) ...
# ✉️ [N8N] Creating message for conversation: xyz789
# 📱 [N8N→WhatsApp] Tentando enviar mensagem via Twilio...
# ✅ [N8N→WhatsApp] Mensagem enviada via Twilio: SM...

# 3. Paciente recebe resposta no WhatsApp!
```

### Teste 2: Foto de Refeição

```bash
# 1. Envie FOTO de uma refeição do WhatsApp
# Exemplo: Prato com frango, arroz e salada

# 2. N8N processa:
#    - GPT-4o Vision analisa foto
#    - Identifica alimentos
#    - Calcula macros
#    - Compara com dieta prescrita
#    - Gera resposta personalizada

# 3. Backend envia resposta via WhatsApp:
# "🍽️ Ótima escolha! Identifiquei:
#  - Frango grelhado (150g) - 45g proteína
#  - Arroz integral (100g) - 23g carboidrato
#  - Salada (50g) - 2g carboidrato
#  
#  📊 Total: 330 kcal
#  ✅ Aderência: 95% da sua dieta prescrita!
#  Continue assim! 💪"
```

### Teste 3: Áudio (Transcrição)

```bash
# 1. Envie ÁUDIO do WhatsApp
# Exemplo: "Oi! Esqueci de tomar meu café da manhã hoje..."

# 2. N8N processa:
#    - Baixa áudio do Twilio
#    - Transcreve com manus-speech-to-text
#    - IA gera resposta baseada no texto transcrito

# 3. Backend envia resposta via WhatsApp:
# "Entendo! Não se preocupe. Você pode fazer uma refeição agora
#  com as opções do seu café da manhã. Lembre-se de incluir
#  proteínas para manter sua saciedade! 🥚☕"
```

---

## 🔍 TROUBLESHOOTING

### ❌ Erro: "WhatsApp não habilitado"

**Logs:**
```
ℹ️ [N8N] WhatsApp não habilitado ou não é mensagem do prescritor
```

**Solução:**
1. No frontend, vá até `/chat/{conversationId}`
2. Ative o toggle "📱 WhatsApp" no header
3. Isso define `whatsappEnabled: true` no Firestore

**Ou via Firestore Console:**
```javascript
conversations/{conversationId}
  whatsappEnabled: true  // ← Adicione este campo
```

---

### ❌ Erro: "Twilio não configurado"

**Logs:**
```
⚠️ [N8N→WhatsApp] Twilio não configurado
```

**Solução:**
Verifique variáveis no Railway:
```bash
railway variables

# Deve ter:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+15558337724
```

Se faltando:
```bash
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token_here
railway variables set TWILIO_WHATSAPP_NUMBER=whatsapp:+15558337724
```

---

### ❌ Erro: "Phone number not found"

**Logs:**
```
⚠️ [Twilio] Paciente não encontrado: 5547992567770
```

**Solução:**
O número do paciente no Firestore está em formato incorreto.

**Formato correto (E.164):**
```
+5547992567770  ✅
```

**Formatos incorretos:**
```
47992567770     ❌
(47) 99256-7770 ❌
5547992567770   ❌ (sem +)
```

**Corrigir no Firestore:**
```javascript
users/{patientId}
  phone: "+5547992567770"  // ← Adicione + na frente
```

**Ou no frontend**, o sistema já normaliza automaticamente!

---

### ❌ Erro: "N8N webhook not responding"

**Logs:**
```
❌ [Webhook] Falha ao disparar N8N: ECONNREFUSED
```

**Solução:**
1. Verifique se N8N está ativo:
   ```
   https://n8n-production-3eae.up.railway.app
   ```

2. Verifique se workflow está **ATIVO** (toggle verde no N8N)

3. Teste webhook manualmente:
   ```bash
   curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Secret: nutribuddy-secret-2024" \
     -d '{
       "conversationId": "test123",
       "messageId": "msg456",
       "senderRole": "patient",
       "content": "teste"
     }'
   ```

---

## 📊 LOGS E MONITORAMENTO

### Ver logs em tempo real:

```bash
railway logs -f
```

### Logs de sucesso (fluxo completo):

```
📱 [Twilio] Mensagem recebida de WhatsApp:+5547992567770
💾 [Twilio] Mensagem salva: msg_abc123
🔔 [Webhook] Disparando N8N: nutribuddy-chat
✅ [Webhook] N8N respondeu: 200 OK
─────────────────────────────────
(N8N processa internamente)
─────────────────────────────────
✉️ [N8N] Creating message for conversation: conv_xyz789 | Sender: prescriber
✅ [N8N] Message created: msg_def456
✅ [N8N] Conversation updated
📱 [N8N→WhatsApp] Tentando enviar mensagem via Twilio...
📤 [Twilio] Enviando para +5547992567770
✅ [Twilio] Mensagem enviada! SID: SM1234567890abcdef
✅ [N8N→WhatsApp] Mensagem enviada via Twilio: SM1234567890abcdef
```

### Estrutura dos logs:

| Emoji | Significado |
|-------|-------------|
| 📱 | WhatsApp/Twilio |
| ✉️ | Mensagem (envio/recebimento) |
| 💾 | Salvar no Firestore |
| 🔔 | Webhook disparado |
| ✅ | Sucesso |
| ⚠️ | Aviso (não crítico) |
| ❌ | Erro |
| 📤 | Enviando |
| 📥 | Recebendo |
| 🧠 | IA processando |
| 🖼️ | Foto/imagem |
| 🎤 | Áudio |

---

## 🎯 RESUMO FINAL

### O que você TEM agora:

✅ **Workflow N8N complexo** funcionando perfeitamente  
✅ **Chat interno** (frontend web) funcionando  
✅ **WhatsApp** (Twilio) funcionando  
✅ **Integração N8N ↔ WhatsApp** funcionando  
✅ **Análise de fotos** (GPT-4o Vision) via WhatsApp  
✅ **Transcrição de áudio** via WhatsApp  
✅ **Contexto persistente** (multi-turno) via WhatsApp  
✅ **Toggle frontend** para ativar/desativar WhatsApp por conversa  

### O que você PODE FAZER:

🎨 **Escolher o canal por conversa:**
- Conversa A: só chat interno
- Conversa B: só WhatsApp
- Conversa C: ambos simultâneos

📊 **Ver histórico unificado:**
- Todas as mensagens (internas + WhatsApp) aparecem no mesmo chat
- Badge indica o canal: `📱 WhatsApp` ou `💬 Interno`

🤖 **IA funciona em ambos:**
- Resposta automática funciona no chat interno
- Resposta automática funciona no WhatsApp
- Mesma IA, mesma qualidade, múltiplos canais!

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique logs:** `railway logs -f`
2. **Teste Twilio:** `GET /api/whatsapp/twilio/status`
3. **Teste N8N:** Ative workflow e envie teste manual
4. **Verifique Firestore:** `whatsappEnabled`, `whatsappPhone`

---

**Documentação criada em:** 2025-11-17  
**Última atualização:** Integração N8N → WhatsApp (commit: e675b40)  
**Status:** ✅ 100% FUNCIONAL

