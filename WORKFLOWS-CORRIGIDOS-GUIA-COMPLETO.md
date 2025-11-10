# 🚀 Guia Completo - Workflows N8N Corrigidos para Docker

## ✅ Resumo Executivo

**Problema:** Workflows originais não funcionam com n8n rodando no Docker.

**Solução:** Criadas versões v2-fixed de TODOS os workflows com:
- ✅ URLs com `host.docker.internal:3000` (ao invés de localhost)
- ✅ Authentication: `none` (ao invés de genericCredentialType)
- ✅ Header `x-webhook-secret: nutribuddy-secret-2024` (valor hardcoded)
- ✅ IF na versão 1 (mais compatível)
- ✅ Tratamento de erros robusto

---

## 📊 Tabela de Workflows

| # | Nome | Status | Arquivo Original | Arquivo Corrigido |
|---|------|--------|------------------|-------------------|
| 1 | Auto-resposta Inicial | ✅ Corrigido | `1-autoresposta-inicial.json` | `1-autoresposta-inicial-v2-fixed.json` |
| 2 | Análise de Sentimento OpenAI | ✅ Corrigido | `2-analise-sentimento-openai-v3-auth.json` | `2-analise-sentimento-openai-v4-fixed.json` |
| 3 | Sugestões de Resposta IA | ✅ Corrigido | `3-sugestoes-resposta.json` | `3-sugestoes-resposta-v2-fixed.json` |
| 4 | Follow-up Automático | ✅ Corrigido | `4-followup-automatico.json` | `4-followup-automatico-v2-fixed.json` |
| 5 | Resumo Diário | ✅ Corrigido | `5-resumo-diario.json` | `5-resumo-diario-v2-fixed.json` |

---

## 🔧 Workflow 1: Auto-resposta Inicial

### O Que Faz
Aguarda 2 minutos após uma nova conversa. Se o nutricionista não responder, envia uma mensagem automática ao paciente.

### Fluxo
```
Webhook: Nova Conversa
  ↓
Aguardar 2 Minutos ⏰
  ↓
Verificar se Prescritor Respondeu (GET)
  ↓
Se Não Respondeu (IF)
  ↓
  ├─ TRUE → Enviar Auto-resposta (POST)
  └─ FALSE → Resposta: Já Respondeu
```

### Webhooks
- **Input:** `POST /webhook-test/nutribuddy-new-conversation`
- **Body:** `{"conversationId": "conv-123"}`

### Endpoints do Backend Necessários
- `GET /api/messages/conversations/:conversationId`
- `POST /api/messages/webhook/ai-response`

---

## 🔧 Workflow 2: Análise de Sentimento OpenAI

### O Que Faz
Recebe uma mensagem, analisa com OpenAI (sentimento, urgência, categoria) e atualiza a conversa no backend. Se for urgente, marca como prioritária e envia alerta.

### Fluxo
```
Webhook: Nova Mensagem
  ↓
OpenAI: Analisar Mensagem 🤖
  ↓
Parse AI Response (Code)
  ↓
Se Urgente (IF)
  ↓
  ├─ TRUE (urgency = "high")
  │   ↓
  │   Marcar como Urgente (PATCH)
  │   ↓
  │   Enviar Email de Alerta (POST)
  │
  └─ FALSE (urgency = "low/medium")
      ↓
      Atualizar Tags (PATCH)
```

### Webhooks
- **Input:** `POST /webhook-test/nutribuddy-analyze-sentiment`
- **Body:**
```json
{
  "conversationId": "conv-123",
  "messageId": "msg-456",
  "patientName": "João Silva",
  "content": "Estou com dor urgente!"
}
```

### Requisitos
- **Credencial OpenAI** configurada no n8n
- **WEBHOOK_SECRET** configurado no backend (`.env`)

### Endpoints do Backend Necessários
- `PATCH /api/messages/conversations/:conversationId` (marcar urgente / atualizar tags)
- `POST /api/messages/webhook/urgent-alert` (enviar alerta)

---

## 🔧 Workflow 3: Sugestões de Resposta IA

### O Que Faz
Busca o contexto completo de uma conversa (dados do paciente + histórico) e usa OpenAI para gerar 3 sugestões de resposta com tons diferentes.

### Fluxo
```
Webhook: Solicitar Sugestões
  ↓
Buscar Contexto da Conversa (GET)
  ↓
OpenAI: Gerar Sugestões 🤖
  ↓
Parse Sugestões (Code)
  ↓
Retornar Sugestões
```

### Webhooks
- **Input:** `POST /webhook-test/nutribuddy-suggest-response`
- **Body:** `{"conversationId": "conv-123"}`

### Resposta
```json
{
  "success": true,
  "suggestions": [
    {"text": "Resposta profissional...", "tone": "professional"},
    {"text": "Resposta amigável...", "tone": "friendly"},
    {"text": "Resposta motivacional...", "tone": "motivational"}
  ]
}
```

### Requisitos
- **Credencial OpenAI** configurada
- **Endpoint `/conversation-context`** no backend

### Endpoints do Backend Necessários
- `GET /api/messages/webhook/conversation-context/:conversationId`

---

## 🔧 Workflow 4: Follow-up Automático

### O Que Faz
Roda diariamente às 9h. Busca conversas resolvidas há mais de 7 dias e envia follow-up automático ao paciente.

### Fluxo
```
Agendar: Diariamente 9h ⏰
  ↓
Buscar Conversas Resolvidas (GET)
  ↓
Dividir em Items (Loop)
  ↓
Verificar Dias Desde Última Mensagem (Code)
  ↓
Se Deve Enviar Follow-up (IF)
  ↓
  └─ TRUE (>= 7 dias)
      ↓
      Enviar Follow-up (POST)
      ↓
      Atualizar Status (PATCH)
```

### Trigger
- **Agendado:** Cron `0 9 * * *` (todo dia às 9h)

### Endpoints do Backend Necessários
- `GET /api/messages/conversations?status=resolved`
- `POST /api/messages/webhook/ai-response`
- `PATCH /api/messages/conversations/:id`

---

## 🔧 Workflow 5: Resumo Diário

### O Que Faz
Roda diariamente às 9h. Busca todas as conversas, gera estatísticas e envia email HTML com resumo para o nutricionista.

### Fluxo
```
Agendar: Diariamente 9h ⏰
  ↓
Buscar Todas as Conversas (GET)
  ↓
Processar Estatísticas (Code)
  ↓
Gerar Email HTML (Code)
  ↓
Enviar Email (Gmail) 📧
```

### Trigger
- **Agendado:** Cron `0 9 * * *` (todo dia às 9h)

### Requisitos
- **Credencial Gmail OAuth2** configurada no n8n
- **Email do destinatário** configurado no nó

### Endpoints do Backend Necessários
- `GET /api/messages/conversations`

### Estatísticas Incluídas
- Total de conversas
- Novas nas últimas 24h
- Não lidas
- Urgentes
- Por status (new, in-progress, waiting, resolved)
- Lista de conversas urgentes

---

## 🎯 Instalação Rápida

### Passo 1: Certifique-se que o Docker n8n está rodando

```bash
docker ps | grep n8n
```

Se não estiver:
```bash
docker run -d --name n8n -p 5678:5678 \
  -e WEBHOOK_SECRET=nutribuddy-secret-2024 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Passo 2: Configure o Backend

Arquivo `.env`:
```bash
WEBHOOK_SECRET=nutribuddy-secret-2024
PORT=3000
```

Inicie o backend:
```bash
node server.js
```

### Passo 3: Importe os Workflows

No n8n (`http://localhost:5678`):

1. **Import → Select File**
2. Importe os 5 workflows `-v2-fixed.json`
3. **Configure credenciais:**
   - **OpenAI API** (workflows 2 e 3)
   - **Gmail OAuth2** (workflow 5)

### Passo 4: Ative os Workflows

- Workflows 1, 2, 3: Toggle **Active** ✅
- Workflows 4, 5: Toggle **Active** ✅ (rodam automaticamente)

---

## 🧪 Testes Rápidos

### Teste Workflow 1 (Auto-resposta)
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-001"}'
```

### Teste Workflow 2 (Análise)
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-002",
    "messageId": "msg-002",
    "patientName": "Maria",
    "content": "Estou com dor muito forte!"
  }'
```

### Teste Workflow 3 (Sugestões)
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-003"}'
```

### Testar Workflows 4 e 5
No n8n, clique em **"Execute Workflow"** manualmente.

---

## ⚠️ Problemas Comuns

### 1. "The service refused the connection"
**Causa:** Backend não está rodando ou URL errada.

**Solução:**
```bash
# Verificar backend
curl http://localhost:3000/api/health

# Se não responder, inicie:
node server.js
```

### 2. "compareOperationFunctions[...] is not a function"
**Causa:** Nó IF incompatível.

**Solução:** Use os arquivos `-v2-fixed.json` (já têm IF versão 1).

### 3. "No token provided" ou "Invalid webhook secret"
**Causa:** WEBHOOK_SECRET não configurado ou diferente.

**Solução:**
```bash
# No .env do backend:
WEBHOOK_SECRET=nutribuddy-secret-2024

# Reinicie o backend
```

### 4. OpenAI erro de credencial
**Causa:** Credencial OpenAI não configurada.

**Solução:**
1. N8N → Credentials
2. Create New → OpenAI API
3. Cole sua API Key (começa com `sk-...`)

### 5. Gmail erro OAuth2
**Causa:** OAuth2 não configurado.

**Solução:**
1. N8N → Credentials → Gmail OAuth2
2. Siga instruções para autenticar

---

## 📋 Checklist de Configuração

### Backend
- [ ] `.env` com `WEBHOOK_SECRET=nutribuddy-secret-2024`
- [ ] Backend rodando na porta 3000
- [ ] Endpoints implementados (ver lista abaixo)

### Docker N8N
- [ ] Container rodando com `WEBHOOK_SECRET`
- [ ] Porta 5678 acessível

### Workflows
- [ ] Workflow 1 importado e ativo
- [ ] Workflow 2 importado, credencial OpenAI configurada, ativo
- [ ] Workflow 3 importado, credencial OpenAI configurada, ativo
- [ ] Workflow 4 importado e ativo
- [ ] Workflow 5 importado, credencial Gmail configurada, email configurado, ativo

### Testes
- [ ] Workflow 1 testado com curl
- [ ] Workflow 2 testado com curl
- [ ] Workflow 3 testado com curl
- [ ] Workflow 4 executado manualmente
- [ ] Workflow 5 executado manualmente

---

## 🔗 Endpoints Necessários no Backend

Certifique-se que o backend tenha estes endpoints:

```javascript
// Autenticação por header
app.use((req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'No token provided' });
  }
  next();
});

// Endpoints necessários:
GET  /api/health
GET  /api/messages/conversations/:id
GET  /api/messages/conversations?status=resolved
GET  /api/messages/conversations
GET  /api/messages/webhook/conversation-context/:conversationId
POST /api/messages/webhook/ai-response
POST /api/messages/webhook/urgent-alert
PATCH /api/messages/conversations/:id
```

---

## 🎉 Próximos Passos

### 1. Integrar com Frontend
Chame os webhooks do frontend quando:
- Nova conversa criada (Workflow 1)
- Nova mensagem recebida (Workflow 2)
- Nutricionista solicita sugestões (Workflow 3)

### 2. Monitorar Execuções
No n8n:
- Executions → Ver histórico
- Workflows com erro aparecem em vermelho

### 3. Ajustar Timings
- Workflow 1: Mudar de 2 minutos para outro valor
- Workflow 4: Mudar de 7 dias para outro valor
- Workflows 4 e 5: Mudar horário (cron expression)

---

## 📚 Arquivos Criados

```
n8n-workflows/
├── 1-autoresposta-inicial-v2-fixed.json       ✅ Pronto
├── 2-analise-sentimento-openai-v4-fixed.json  ✅ Pronto
├── 3-sugestoes-resposta-v2-fixed.json         ✅ Pronto
├── 4-followup-automatico-v2-fixed.json        ✅ Pronto
└── 5-resumo-diario-v2-fixed.json              ✅ Pronto
```

---

## 🎯 Diferenças vs Originais

| Aspecto | Original | v2-Fixed |
|---------|----------|----------|
| URL | `localhost:3000` ou `$env.API_URL` | `host.docker.internal:3000` |
| Auth | genericCredentialType / predefinedCredentialType | none |
| Header | Bearer token ou variável | `x-webhook-secret: nutribuddy-secret-2024` |
| IF Node | Versão 2 (incompatível) | Versão 1 (compatível) |
| Error Handling | Não | Sim |
| Docker | ❌ | ✅ |

---

## ✅ Status Final

Todos os 5 workflows estão **corrigidos e prontos** para uso com n8n no Docker! 🎉

**Use os arquivos `-v2-fixed.json`** para evitar todos os problemas encontrados.

---

**Criado em:** 10/11/2024  
**Versão:** 2.0 (Docker Compatible)  
**Status:** ✅ Produção Ready

