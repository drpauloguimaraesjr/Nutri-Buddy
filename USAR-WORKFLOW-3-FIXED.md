# 🎯 Workflow 3 - Sugestões de Resposta IA (Corrigido)

## ✅ O Que Foi Corrigido Preventivamente

Baseado nos problemas do Workflow 2, já corrigi:

### 1. URL com host.docker.internal
**Antes:**
```
{{$env.API_URL}}/api/messages/webhook/conversation-context/...
```

**Depois:**
```
http://host.docker.internal:3000/api/messages/webhook/conversation-context/...
```

### 2. Autenticação Simplificada
**Antes:**
```json
"authentication": "genericCredentialType",
"genericAuthType": "httpHeaderAuth"
```

**Depois:**
```json
"authentication": "none"
```

### 3. Header de Autenticação
**Antes:**
```
Bearer {{$env.FIREBASE_TOKEN}}
```

**Depois:**
```
x-webhook-secret: nutribuddy-secret-2024
```

⚠️ **Nota:** O workflow original usava Bearer token do Firebase, mas mudei para usar o mesmo `x-webhook-secret` que o backend já valida!

### 4. OpenAI Simplificado
**Antes:** Usava nó `@n8n/n8n-nodes-langchain.openAi` (mais complexo)

**Depois:** Usa nó `n8n-nodes-base.openAi` (padrão, mais simples)

### 5. Parse com Tratamento de Erros
Adicionei tratamento de erros robusto no código de parse, com sugestões padrão caso a IA falhe.

---

## 📋 Como Usar

### Passo 1: Importe o Workflow

No N8N:
1. Clique em **"+"** ou **Import**
2. Selecione: `n8n-workflows/3-sugestoes-resposta-v2-fixed.json`
3. Importe

### Passo 2: Configure a Credencial OpenAI

1. Clique no nó **"OpenAI: Gerar Sugestões"**
2. Selecione sua credencial OpenAI (a mesma do Workflow 2)
3. Salve

### Passo 3: Ative o Workflow

1. **Save** (salvar)
2. Toggle para **Active**

---

## 🧪 Testar o Workflow

### 1. Certifique-se que o backend está rodando:
```bash
# Verificar se está rodando
curl http://localhost:3000/api/health
```

### 2. Teste o workflow:
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-test-001"
  }'
```

### Resposta esperada:
```json
{
  "success": true,
  "suggestions": [
    {
      "text": "Obrigado por compartilhar...",
      "tone": "professional"
    },
    {
      "text": "Que bom que você está se dedicando!...",
      "tone": "motivational"
    },
    {
      "text": "Entendo sua situação...",
      "tone": "friendly"
    }
  ]
}
```

---

## 🔄 Fluxo do Workflow

```
Webhook: Solicitar Sugestões
  ↓
Buscar Contexto da Conversa (GET do backend)
  ↓
OpenAI: Gerar Sugestões (com contexto do paciente)
  ↓
Parse Sugestões (extrai JSON)
  ↓
Retornar Sugestões (webhook response)
```

---

## 🎯 O Que Este Workflow Faz

1. **Recebe** uma solicitação com `conversationId`
2. **Busca** o contexto completo da conversa no backend:
   - Dados do paciente (nome, idade, objetivos, restrições)
   - Histórico de mensagens
3. **Envia para OpenAI** com prompt especializado
4. **Recebe 3 sugestões** de respostas com tons diferentes:
   - Professional (profissional)
   - Friendly (amigável)
   - Motivational (motivacional)
5. **Retorna** as sugestões para o frontend

---

## 📝 Endpoint do Backend Necessário

O workflow espera que o backend tenha este endpoint:

```
GET /api/messages/webhook/conversation-context/:conversationId
Header: x-webhook-secret: nutribuddy-secret-2024
```

**Resposta esperada:**
```json
{
  "context": {
    "patient": {
      "name": "João Silva",
      "age": 35,
      "goals": "Perder peso e ganhar massa muscular",
      "restrictions": "Intolerância à lactose"
    },
    "messages": [
      {
        "senderRole": "patient",
        "content": "Estou com dificuldade para seguir a dieta"
      },
      {
        "senderRole": "nutritionist",
        "content": "Vamos ajustar o plano para facilitar"
      }
    ]
  }
}
```

---

## ⚠️ Se o Endpoint Não Existir

Caso o backend ainda não tenha o endpoint `/conversation-context`, você tem 2 opções:

### Opção A: Criar o endpoint no backend
(Posso ajudar com isso depois!)

### Opção B: Simplificar o workflow
Remover o nó "Buscar Contexto" e passar o contexto direto no webhook:

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-001",
    "patientName": "João",
    "lastMessage": "Estou com dificuldade na dieta"
  }'
```

---

## 🔧 Diferenças vs Workflow Original

| Aspecto | Original | v2-Fixed |
|---------|----------|----------|
| URL | `$env.API_URL` | `host.docker.internal:3000` |
| Auth | genericCredentialType | none (header manual) |
| Token | Bearer Firebase | x-webhook-secret |
| OpenAI Node | langchain | base (mais simples) |
| Error Handling | Não | Sim (sugestões padrão) |
| Docker Compatible | ❌ | ✅ |

---

## ✅ Checklist

- [ ] Workflow importado
- [ ] Credencial OpenAI configurada
- [ ] Backend rodando (porta 3000)
- [ ] Endpoint `/conversation-context` existe (ou workflow adaptado)
- [ ] WEBHOOK_SECRET configurado no backend
- [ ] Teste executado com sucesso
- [ ] Workflow ativado

---

## 💡 Dica

Use este workflow no frontend para:
- Sugerir respostas rápidas ao nutricionista
- Economizar tempo de digitação
- Manter tom consistente e profissional
- Personalizar respostas baseado no contexto do paciente

---

**Arquivo:** `3-sugestoes-resposta-v2-fixed.json`

**Status:** Pronto para uso com n8n no Docker! 🚀

