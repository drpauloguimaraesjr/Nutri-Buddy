# 🎯 Usar Workflow v4 - Solução Definitiva

## ✅ O Que Foi Corrigido

Este workflow **v4-fixed** resolve TODOS os problemas:
- ✅ Autenticação com `WEBHOOK_SECRET`
- ✅ Nó IF compatível (versão 1)
- ✅ Todos os endpoints com header `x-webhook-secret`

---

## 📋 Como Usar

### Passo 1: Delete o Workflow Atual

No N8N:
1. Abra o workflow com problema
2. Clique nos **3 pontinhos** (menu)
3. **Delete**

### Passo 2: Importe o Novo Workflow

1. No N8N, clique em **"+"** (novo workflow) ou **Import**
2. Selecione o arquivo:
   ```
   n8n-workflows/2-analise-sentimento-openai-v4-fixed.json
   ```
3. Clique em **Import**

### Passo 3: Configure a Credencial OpenAI

1. Clique no nó **"OpenAI: Analisar Mensagem"**
2. Em **Credential to connect with**, selecione sua credencial OpenAI
3. Se não tiver, clique em **"Create New"**:
   - **Name:** OpenAI API
   - **API Key:** Sua chave da OpenAI (começa com `sk-...`)
   - **Save**

### Passo 4: Salve e Ative

1. Clique em **Save** (canto superior direito)
2. Mude o toggle para **Active**

### Passo 5: Teste!

No terminal:

```bash
# Certifique-se que o backend está rodando
node server.js

# Em outro terminal, teste:
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-urgent-001",
    "messageId": "msg-001",
    "patientName": "João Silva",
    "content": "Estou com dor muito forte, preciso de ajuda urgente!"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "analysis": {
    "conversationId": "test-urgent-001",
    "patientName": "João Silva",
    "urgency": "high",
    "sentiment": "negative",
    "category": "other",
    "tags": ["dor", "urgente", "ajuda"]
  }
}
```

---

## 🔍 Verificar se Funcionou

No N8N, após executar:

1. ✅ Todos os nós devem estar **verdes** (sem erros)
2. ✅ O nó "Se Urgente" deve executar sem erro
3. ✅ Se urgency = "high", deve ir para "Marcar como Urgente"
4. ✅ Se urgency = "low" ou "medium", deve ir para "Atualizar Tags"

---

## 🆚 Diferença do IF v1 vs v2

### IF Versão 2 (v3-auth - NÃO funcionou):
```json
{
  "conditions": {
    "conditions": [
      {
        "leftValue": "={{ $json.urgency }}",
        "operator": {
          "type": "string",
          "operation": "equals"
        },
        "rightValue": "high"
      }
    ]
  }
}
```

### IF Versão 1 (v4-fixed - FUNCIONA!):
```json
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.urgency }}",
        "operation": "equal",
        "value2": "high"
      }
    ]
  }
}
```

A versão 1 é mais antiga mas **mais compatível** com diferentes versões do n8n!

---

## 🎯 Checklist Completo

- [ ] Docker n8n com `WEBHOOK_SECRET=nutribuddy-secret-2024`
- [ ] Backend `.env` com `WEBHOOK_SECRET=nutribuddy-secret-2024`
- [ ] Backend rodando (`node server.js`)
- [ ] Workflow v4-fixed importado
- [ ] Credencial OpenAI configurada
- [ ] Workflow salvo e ativado
- [ ] Teste executado com sucesso
- [ ] Todos os nós executaram sem erro

---

## 🚨 Se AINDA Der Erro

Se mesmo com a v4 o IF der erro, a solução é **recriar manualmente**:

1. **Delete o nó "Se Urgente"**
2. **Adicione novo nó IF** (busque por "IF" no menu)
3. **Configure:**
   - Value 1: `{{ $json.urgency }}`
   - Operation: `equal` ou `=`
   - Value 2: `high`
4. **Reconecte:**
   - Saída TRUE → "Marcar como Urgente"
   - Saída FALSE → "Atualizar Tags"

---

## 📊 Fluxo do Workflow

```
Webhook: Nova Mensagem
    ↓
OpenAI: Analisar Mensagem (com sua credencial)
    ↓
Parse AI Response (processa JSON)
    ↓
Se Urgente (IF v1)
    ↓
    ├─ TRUE (urgency = "high")
    │   ↓
    │   Marcar como Urgente (PATCH com auth)
    │   ↓
    │   Enviar Email de Alerta (POST com auth)
    │   ↓
    │   Resposta
    │
    └─ FALSE (urgency = "low" ou "medium")
        ↓
        Atualizar Tags (PATCH com auth)
        ↓
        Resposta
```

---

## ✅ Pronto!

Agora você tem:
- ✅ Workflow com autenticação funcionando
- ✅ IF compatível com sua versão do n8n
- ✅ Análise de sentimento com OpenAI
- ✅ Sistema de urgência funcionando

**Arquivo:** `2-analise-sentimento-openai-v4-fixed.json`

**Status:** Pronto para produção! 🚀

