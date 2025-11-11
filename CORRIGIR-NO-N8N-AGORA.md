# 🔧 COMO CORRIGIR O ERRO 404 NO N8N - PASSO A PASSO

**Erro:** `{"error":"Route not found","path":"/"}`  
**Causa:** URL incompleta no nó HTTP Request  
**Tempo para corrigir:** 2 minutos por nó

---

## 🎯 SOLUÇÃO RÁPIDA

Você tem **2 opções:**

### Opção 1: Importar workflow atualizado (MAIS RÁPIDO) ⚡
### Opção 2: Editar manualmente cada nó (5 minutos)

---

## 📥 OPÇÃO 1: IMPORTAR WORKFLOW ATUALIZADO

### Passo 1: Abrir N8N
1. Acesse: https://n8n-production-3eae.up.railway.app
2. Faça login

### Passo 2: Deletar workflow antigo
1. Na lista de workflows, clique no workflow **"NutriBuddy - Análise..."**
2. Clique nos **3 pontinhos (...)** → **Delete**
3. Confirme

### Passo 3: Importar novo workflow
1. Clique em **"+ Add workflow"** (canto superior direito)
2. Clique no **ícone de menu (☰)** → **Import from File**
3. Selecione o arquivo: `n8n-workflows/2-analise-sentimento-openai-RAILWAY-FINAL.json`
4. Clique em **Import**

### Passo 4: Configurar credencial OpenAI
1. Clique no nó **"OpenAI: Analisar Mensagem"**
2. Em **Credentials**, clique em **"SELECIONE_SUA_CREDENCIAL"**
3. Selecione sua credencial OpenAI (a que você criou do zero no Railway)
4. Clique em **Save**

### Passo 5: Ativar workflow
1. Toggle no canto superior direito: **OFF → ON**
2. ✅ Pronto!

---

## ✏️ OPÇÃO 2: EDITAR MANUALMENTE

Se preferir editar ao invés de importar:

### 📍 NÓ: "Atualizar Tags"

1. Clique no nó **"Atualizar Tags"**
2. **URL:** Mude de:
   ```
   ❌ https://web-production-c9eaf.up.railway.app
   ```
   Para:
   ```
   ✅ https://web-production-c9eaf.up.railway.app/api/n8n/update-conversation
   ```

3. **Method:** Mude de `PATCH` para `POST`

4. **Headers:** Adicione/atualize:
   - Name: `Content-Type` | Value: `application/json`
   - Name: `X-Webhook-Secret` | Value: `nutribuddy-secret-2024`

5. **Body (JSON):** Cole:
   ```json
   {
     "conversationId": "{{$json.conversationId}}",
     "tags": {{JSON.stringify($json.tags)}},
     "priority": "low",
     "status": "open"
   }
   ```

6. Clique em **"Execute node"** para testar
7. Clique em **Save**

---

### 📍 NÓ: "Marcar como Urgente"

1. Clique no nó **"Marcar como Urgente"**
2. **URL:** Mude para:
   ```
   https://web-production-c9eaf.up.railway.app/api/n8n/mark-urgent
   ```

3. **Method:** Mude de `PATCH` para `POST`

4. **Headers:**
   - Name: `Content-Type` | Value: `application/json`
   - Name: `X-Webhook-Secret` | Value: `nutribuddy-secret-2024`

5. **Body (JSON):**
   ```json
   {
     "conversationId": "{{$json.conversationId}}",
     "reason": "Urgência: {{$json.urgency}} | Sentimento: {{$json.sentiment}}"
   }
   ```

6. Clique em **Save**

---

### 📍 NÓ: "Enviar Alerta" (ou "Enviar Email de Alerta")

1. Clique no nó
2. **URL:** Mude para:
   ```
   https://web-production-c9eaf.up.railway.app/api/n8n/send-alert
   ```

3. **Method:** `POST`

4. **Headers:**
   - Name: `Content-Type` | Value: `application/json`
   - Name: `X-Webhook-Secret` | Value: `nutribuddy-secret-2024`

5. **Body (JSON):**
   ```json
   {
     "conversationId": "{{$json.conversationId}}",
     "alertType": "urgent",
     "message": "Paciente precisa de atenção",
     "metadata": {
       "urgency": "{{$json.urgency}}",
       "sentiment": "{{$json.sentiment}}",
       "tags": {{JSON.stringify($json.tags)}}
     }
   }
   ```

6. Clique em **Save**

---

## ✅ DEPOIS DE CORRIGIR

### Teste o workflow:

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -d '{
    "conversationId": "test-conv-123",
    "messageId": "test-msg-123",
    "patientName": "João Silva",
    "content": "Estou muito desanimado com a dieta"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "analysis": {
    "conversationId": "test-conv-123",
    "urgency": "high",
    "sentiment": "negative",
    "category": "nutrition",
    "tags": ["desânimo", "dieta"]
  }
}
```

---

## 🔍 TROUBLESHOOTING

### ❌ Erro 401 - Unauthorized
**Solução:** Verifique se o header `X-Webhook-Secret` está correto

### ❌ Erro 404 - Route not found
**Solução:** Verifique se a URL tem `/api/n8n/` no caminho

### ❌ Erro 400 - conversationId is required
**Solução:** Verifique se `{{$json.conversationId}}` existe no JSON body

---

## 📋 CHECKLIST

- [ ] Nó "Atualizar Tags" - URL corrigida
- [ ] Nó "Marcar como Urgente" - URL corrigida
- [ ] Nó "Enviar Alerta" - URL corrigida
- [ ] Todos os nós têm header `X-Webhook-Secret`
- [ ] Todos os nós têm header `Content-Type`
- [ ] Todos os nós têm Method `POST`
- [ ] Workflow ativado (toggle ON)
- [ ] Teste realizado com curl

---

## 🎯 RESUMO - URLs CORRETAS

```
✅ Atualizar conversação:
POST https://web-production-c9eaf.up.railway.app/api/n8n/update-conversation

✅ Marcar urgente:
POST https://web-production-c9eaf.up.railway.app/api/n8n/mark-urgent

✅ Enviar alerta:
POST https://web-production-c9eaf.up.railway.app/api/n8n/send-alert
```

**Todas com:**
- Header: `Content-Type: application/json`
- Header: `X-Webhook-Secret: nutribuddy-secret-2024`
- Method: `POST`

---

**Boa sorte! 🚀**

