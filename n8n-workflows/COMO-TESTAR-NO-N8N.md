# 🧪 COMO TESTAR WORKFLOW NO N8N (Passo a Passo)

**Problema:** Erro "Campos obrigatórios faltando"  
**Causa:** Workflow espera dados do webhook  
**Solução:** Adicionar dados de teste!

---

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### **PASSO 1: Abrir Workflow no N8N**

```
1. N8N → Workflows
2. Abrir: "Gestão Inteligente Chat Web - Nutri-Buddy"
```

---

### **PASSO 2: Clicar no Primeiro Node (Webhook)**

```
1. Clicar no node: "Webhook: Nova Mensagem Chat"
2. Ver painel lateral direito
3. Procurar: "Test URL" ou "Listen for test event"
4. NÃO precisa clicar nada ainda!
```

---

### **PASSO 3: Adicionar Dados de Teste**

**No n8n:**
```
1. Clicar no node "Webhook: Nova Mensagem Chat"
2. Clicar na aba "Test" (ou botão "Listen for test event")
3. Esperar aparecer "Waiting for test event..."
```

**NO TERMINAL (nova janela):**
```bash
# COPIE E COLE ESTE COMANDO:

curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-handler \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "T57IAET5UAcfkAO6HFUF",
    "messageId": "test-msg-001",
    "senderId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
    "senderRole": "patient",
    "content": "Posso comer banana no café da manhã?",
    "type": "text",
    "patientId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
    "prescriberId": "6yooHer7ZgYOcYe0JHkXHLnWBq83"
  }'
```

**OU use o arquivo:**
```bash
cd /Users/drpgjr.../NutriBuddy/n8n-workflows

curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-handler \
  -H "Content-Type: application/json" \
  -d @DADOS-TESTE-WEBHOOK.json
```

---

### **PASSO 4: Ver Workflow Executar!**

**No n8n:**
```
1. Workflow deve executar automaticamente
2. Ver cada node processar (verde ✓)
3. Ver dados fluindo
4. No final, ver resultado:
   {
     "success": true,
     "urgency": "low",
     "autoReplySent": true
   }
```

---

## ✅ ALTERNATIVA: Dados de Teste Direto no N8N

**Se preferir não usar curl:**

1. **Abra o workflow no n8n**
2. **Clique no node "Webhook: Nova Mensagem Chat"**
3. **Vá em "⋮" (3 pontinhos) → "Add pin data"**
4. **COLE ESTE JSON:**

```json
{
  "conversationId": "T57IAET5UAcfkAO6HFUF",
  "messageId": "test-msg-001",
  "senderId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
  "senderRole": "patient",
  "content": "Posso comer banana no café da manhã?",
  "type": "text",
  "patientId": "hiAf8r28RmfnppmYBpvxQwTroNI2",
  "prescriberId": "6yooHer7ZgYOcYe0JHkXHLnWBq83",
  "timestamp": "2024-11-16T22:36:00.000Z",
  "attachments": []
}
```

5. **Clicar "Execute workflow"**
6. **Ver executar!** ✅

---

## 🎊 O QUE VAI ACONTECER

```
Node 1: ✅ Validar e Filtrar
   → Valida que é mensagem de paciente
   ↓
Node 2: ✅ Foi Filtrado?
   → Não (é paciente)
   ↓
Node 3: ✅ Buscar Conversa
   → Busca dados da conversa T57IAET5UAcfkAO6HFUF
   ↓
Node 4: ✅ Buscar Histórico
   → Busca últimas 10 mensagens
   ↓
Node 5: ✅ Construir Contexto IA
   → Monta prompt rico
   ↓
Node 6: ✅ Análise IA (OpenAI)
   → GPT-4 analisa
   ↓
Node 7: ✅ Parse Análise IA
   → Extrai urgência, sentimento, sugestão
   ↓
Node 8: ✅ É Urgente?
   → Não (mensagem normal)
   ↓
Node 9b: ✅ Atualizar Metadados
   → Aplica tags
   ↓
Node 10: ✅ Reunir Caminhos
   ↓
Node 11: ✅ Enviar Auto-resposta?
   → Sim (dúvida simples)
   ↓
Node 12a: ✅ Enviar Auto-resposta
   → Envia resposta da IA para o paciente
   ↓
Node 13-14: ✅ Finalizar
   → Retorna sucesso
```

---

## 🧪 TESTE COMPLETO

### **Cenário 1: Mensagem Normal**
```json
{
  "content": "Posso comer banana no café da manhã?"
}
```
**Esperado:**
- Urgência: low
- Auto-resposta: Sim
- Resposta personalizada sobre banana

---

### **Cenário 2: Mensagem Urgente**
```json
{
  "content": "Estou com muita dor de estômago e náusea"
}
```
**Esperado:**
- Urgência: HIGH
- Priority: high
- Tags: ["urgente", "sintoma"]
- Kanban: "waiting"

---

### **Cenário 3: Mensagem Prescritor (Filtrada)**
```json
{
  "senderRole": "prescriber",
  "content": "Olá! Como está?"
}
```
**Esperado:**
- Skipped: true
- Reason: "Mensagem do prescritor - não precisa processar"

---

## 🚨 SE DER ERRO

### **Erro: "OpenAI API error"**
**Solução:**
- Verificar credencial no node 6
- Verificar quota OpenAI
- Trocar modelo para gpt-3.5-turbo (mais barato)

### **Erro: "401 Unauthorized" no node 3 ou 4**
**Solução:**
- Verificar se `X-Webhook-Secret` está correto
- Deve ser: `nutribuddy-secret-2024`

### **Erro: "404 Not Found"**
**Solução:**
- Verificar URL do backend
- Deve ser: `https://web-production-c9eaf.up.railway.app`

---

## 📊 VALIDAÇÃO DE SUCESSO

**No n8n:**
- ✅ Todos nodes verdes
- ✅ Duração: 3-5 segundos
- ✅ Resposta: `{"success": true}`

**No Firestore:**
- ✅ Conversa atualizada com tags
- ✅ Auto-resposta salva (isAiGenerated: true)

**No Frontend:**
- ✅ Paciente vê auto-resposta da IA
- ✅ Prescritor vê mensagem + resposta

---

## 🎯 DEPOIS QUE TESTAR COM SUCESSO

**Configure no Railway:**
```
Variables → Add:
N8N_NEW_MESSAGE_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-handler
```

**Aí o backend vai chamar automaticamente!** 🚀

---

**TESTE AGORA!** 🧪

Use o curl acima ou pin data no n8n!

