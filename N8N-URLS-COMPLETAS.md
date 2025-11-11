# 🎯 URLs COMPLETAS PARA CONFIGURAR N8N

**Data:** 11/11/2024  
**Status:** ✅ Rotas criadas e funcionando

---

## 📋 RESUMO RÁPIDO

Você tem **3 tipos de URLs** para usar no N8N:

1. **Webhooks** - Para receber dados do backend
2. **HTTP Requests** - Para atualizar o backend
3. **Email/Gmail** - Para enviar resumos diários

---

## 🔵 1. WEBHOOKS (Receber do Backend)

**Estes já estão funcionando!** ✅

### Workflow 1: Auto-resposta Inicial
```
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-new-conversation
```

### Workflow 2: Análise de Sentimento
```
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-analyze-sentiment
```

### Workflow 3: Sugestões de Resposta
```
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-suggest-response
```

---

## 🟢 2. HTTP REQUESTS (Enviar para o Backend)

**Use estas URLs nos nós "HTTP Request" do N8N:**

### 2.1. Atualizar Tags/Prioridade

**URL:**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/update-conversation
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body:**
```json
{
  "conversationId": "{{$json.conversationId}}",
  "tags": ["urgente"],
  "priority": "high",
  "status": "urgent"
}
```

**Campos opcionais:**
- `tags`: Array de strings
- `priority`: "low", "medium", "high"
- `status`: "open", "urgent", "closed"
- `kanbanColumn`: "todo", "in_progress", "done"

---

### 2.2. Marcar como Urgente

**URL:**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/mark-urgent
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body:**
```json
{
  "conversationId": "{{$json.conversationId}}",
  "reason": "Sentimento negativo detectado pela IA"
}
```

**O que faz:**
- Define `priority: "high"`
- Define `status: "urgent"`
- Adiciona tag `"urgente"` ao array de tags
- Salva data/hora: `urgentMarkedAt`
- Salva o motivo: `urgentReason`

---

### 2.3. Enviar Alerta

**URL:**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/send-alert
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body:**
```json
{
  "conversationId": "{{$json.conversationId}}",
  "alertType": "urgent",
  "message": "Paciente precisa de atenção imediata",
  "metadata": {
    "sentiment": "negative",
    "score": -0.8
  }
}
```

**Tipos de alerta:**
- `"urgent"` - Urgente
- `"sentiment"` - Sentimento negativo
- `"followup"` - Follow-up necessário
- `"reminder"` - Lembrete

**O que faz:**
- Cria um documento na collection `alerts` no Firestore
- Alerta fica marcado como `read: false`
- Pode ser expandido para enviar push notification ou email

---

## 🟡 3. EMAIL/GMAIL (Workflow 5 - Resumo Diário)

**Nó:** Gmail (do N8N)

**Configuração:**
1. No N8N, adicione o nó **"Gmail"**
2. Conecte sua conta Gmail (OAuth2)
3. Configure:
   - **To:** Email do prescritor (pode vir de `{{$json.prescriberEmail}}`)
   - **Subject:** "Resumo Diário - NutriBuddy"
   - **Body (HTML):** Template abaixo

**Template HTML:**
```html
<h2>Resumo Diário - NutriBuddy</h2>
<p>Data: {{$now}}</p>

<h3>📊 Estatísticas:</h3>
<ul>
  <li>Total de conversas: {{$json.totalConversations}}</li>
  <li>Conversas urgentes: {{$json.urgentConversations}}</li>
  <li>Novas mensagens: {{$json.newMessages}}</li>
</ul>

<h3>⚠️ Requer atenção:</h3>
<ul>
{{$json.urgentList}}
</ul>

<p>Acesse: <a href="https://nutribuddy-app.com/dashboard">Dashboard NutriBuddy</a></p>
```

---

## 📖 COMO USAR NO N8N

### Passo 1: Abrir o Workflow no N8N
1. Acesse: https://n8n-production-3eae.up.railway.app
2. Faça login
3. Abra o workflow (ex: "2. Análise de Sentimento")

### Passo 2: Editar Nó HTTP Request
1. Clique no nó **"Atualizar Tags"** (ou similar)
2. Configure:
   - **Method:** POST
   - **URL:** (copie da seção 2.1, 2.2 ou 2.3 acima)
   - **Authentication:** None
   - **Headers:**
     - Name: `Content-Type` | Value: `application/json`
     - Name: `X-Webhook-Secret` | Value: `nutribuddy-secret-2024`
   - **Body:**
     - **Content Type:** JSON
     - **Specify Body:** Using JSON
     - **JSON:** (copie o JSON da seção correspondente)

### Passo 3: Testar
1. Clique em **"Test step"** no nó
2. Se der erro 401: Verifique o header `X-Webhook-Secret`
3. Se der erro 404: Verifique a URL
4. Se der erro 400: Verifique o body JSON

### Passo 4: Ativar Workflow
1. Toggle no canto superior direito: **OFF → ON**
2. O workflow agora está ativo 24/7! ✅

---

## 🔧 TROUBLESHOOTING

### ❌ Erro 401 - Unauthorized
**Causa:** Header `X-Webhook-Secret` incorreto ou ausente

**Solução:**
1. Vá no nó HTTP Request
2. Headers → Add Header
3. Name: `X-Webhook-Secret`
4. Value: `nutribuddy-secret-2024`

---

### ❌ Erro 404 - Not Found
**Causa:** URL incorreta

**Solução:**
1. Verifique se a URL está EXATAMENTE como acima
2. Certifique-se de incluir `/api/n8n/` no caminho
3. URL base: `https://web-production-c9eaf.up.railway.app`

---

### ❌ Erro 400 - Bad Request
**Causa:** Body JSON incorreto ou `conversationId` ausente

**Solução:**
1. Verifique o JSON no body
2. Certifique-se que `conversationId` existe
3. Use `{{$json.conversationId}}` para pegar do nó anterior

---

### ❌ Erro 500 - Internal Server Error
**Causa:** Erro no backend (Firestore, etc)

**Solução:**
1. Verifique logs do Railway (serviço backend)
2. Verifique se Firestore está configurado corretamente
3. Verifique se a conversa existe no Firestore

---

## 📦 PRÓXIMOS PASSOS

### 1. Deploy no Railway ✅
**Já feito!** As rotas estão criadas e funcionando.

### 2. Atualizar Workflows no N8N 🔄
**Você precisa fazer:**
1. Abrir cada workflow no N8N
2. Atualizar os nós HTTP Request com as URLs acima
3. Adicionar o header `X-Webhook-Secret`
4. Testar cada nó
5. Ativar o workflow

### 3. Testar End-to-End 🧪
**Fluxo completo:**
1. Enviar mensagem via backend
2. Backend chama webhook do N8N
3. N8N processa e chama endpoint do backend
4. Verificar no Firestore se foi atualizado

---

## 🎯 CHECKLIST FINAL

- [ ] Backend no Railway com as 3 novas rotas
- [ ] N8N no Railway ativo
- [ ] Workflow 1 (Auto-resposta) - URLs atualizadas
- [ ] Workflow 2 (Análise) - URLs atualizadas
- [ ] Workflow 3 (Sugestões) - URLs atualizadas
- [ ] Workflow 4 (Follow-up) - URLs atualizadas
- [ ] Workflow 5 (Resumo Diário) - Gmail configurado
- [ ] Todos os workflows ATIVOS (toggle ON)
- [ ] Teste end-to-end realizado

---

**✅ TUDO PRONTO!**

Agora você tem:
- 3 webhooks funcionando (receber do backend)
- 3 endpoints HTTP (atualizar o backend)
- Segurança com `X-Webhook-Secret`
- Sistema completo de automação!

**Boa sorte! 🚀💜**

