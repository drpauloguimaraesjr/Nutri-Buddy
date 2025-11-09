# 🔗 Integração Completa N8N - Backend + Frontend

## ✅ O que foi implementado

A integração do N8N agora está completa tanto no **backend** quanto no **frontend**, permitindo:

### 📡 Backend (`/api/n8n`)

Novos endpoints criados em `routes/n8n.js`:

1. **GET `/api/n8n/status`** - Status do N8N e configuração
2. **GET `/api/n8n/webhooks`** - Histórico de webhooks recebidos
3. **GET `/api/n8n/webhooks/:id`** - Detalhes de um webhook específico
4. **POST `/api/n8n/trigger`** - Disparar workflow manualmente
5. **GET `/api/n8n/workflows`** - Listar workflows disponíveis (se API key configurada)
6. **GET `/api/n8n/executions`** - Histórico de execuções (se API key configurada)
7. **GET `/api/n8n/test`** - Testar conexão com N8N

### 🎨 Frontend

1. **Funções API** (`frontend/lib/api.ts`):
   - `n8nAPI.getStatus()` - Obter status do N8N
   - `n8nAPI.getWebhooks()` - Listar webhooks
   - `n8nAPI.getWebhook(id)` - Detalhes do webhook
   - `n8nAPI.triggerWorkflow()` - Disparar workflow
   - `n8nAPI.getWorkflows()` - Listar workflows
   - `n8nAPI.getExecutions()` - Listar execuções
   - `n8nAPI.testConnection()` - Testar conexão

2. **Interface de Usuário** (`frontend/app/(dashboard)/settings/page.tsx`):
   - Seção completa de integração N8N
   - Visualização de status (online/offline)
   - Lista de workflows disponíveis
   - Execuções recentes
   - Botões para testar conexão e disparar workflows

---

## 🚀 Como usar

### 1. Configurar variáveis de ambiente

No arquivo `.env` do backend, adicione:

```env
# URL do N8N (local ou cloud)
N8N_URL=http://localhost:5678
# OU para N8N Cloud:
# N8N_URL=https://drpauloguimaraesjr.app.n8n.cloud

https://drpauloguimaraesjr.app.n8n.cloud/home/workflows

# API Key do N8N (opcional, mas recomendado para funcionalidades completas)
N8N_API_KEY=sua-api-key-aqui

# Webhook secret (já existente)
WEBHOOK_SECRET=seu-secret-aqui
```

### 2. Obter API Key do N8N

#### N8N Cloud:
1. Acesse: https://app.n8n.cloud
2. Vá em **Settings** → **API**
3. Gere uma nova API Key
4. Copie e cole no `.env`

#### N8N Self-hosted:
1. Configure a API no seu `docker-compose.yml` ou `.env` do N8N:
   ```env
   N8N_API_ENABLED=true
   ```
2. Gere uma API Key via interface ou CLI

### 3. Reiniciar o backend

```bash
npm start
```

### 4. Acessar no frontend

1. Abra o frontend
2. Vá em **Configurações** (Settings)
3. Role até a seção **"Integração com N8N"**
4. Você verá:
   - Status da conexão
   - Lista de workflows (se API key configurada)
   - Execuções recentes
   - Botões para testar e disparar workflows

---

## 📊 Funcionalidades

### ✅ Sem API Key (Básico)

- Status básico do N8N
- Histórico de webhooks recebidos
- Disparar workflows via webhook
- Testar conexão básica

### ✅ Com API Key (Completo)

Tudo acima, mais:

- Listar workflows disponíveis
- Ver execuções recentes
- Disparar workflows via API
- Health check completo
- Informações detalhadas de versão

---

## 🔄 Fluxo de Integração

```
┌─────────────┐
│  FRONTEND   │
│  (Settings) │
└──────┬──────┘
       │ GET /api/n8n/status
       ▼
┌─────────────┐
│   BACKEND   │
│  /api/n8n   │
└──────┬──────┘
       │ Verifica N8N_URL e N8N_API_KEY
       ▼
┌─────────────┐
│     N8N     │
│  (API/Webhook)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  FIREBASE   │
│  Firestore  │
└─────────────┘
```

---

## 🧪 Testando a Integração

### Teste 1: Verificar Status

```bash
# No frontend, vá em Settings → Integração N8N
# Clique em "Verificar Status"
```

### Teste 2: Testar Conexão

```bash
# No frontend, clique em "Testar Conexão"
# Deve mostrar:
# - Health Check: success
# - Webhook Test: success (ou warning se workflow não ativo)
# - Firestore Connection: success
```

### Teste 3: Disparar Workflow

```bash
# No frontend:
# 1. Veja a lista de workflows
# 2. Clique em "Disparar" em um workflow ativo
# 3. Confirme a ação
# 4. Verifique o resultado
```

---

## 📝 Exemplos de Uso

### No Frontend (TypeScript)

```typescript
import { n8nAPI } from '@/lib/api';

// Obter status
const status = await n8nAPI.getStatus();
console.log(status.data.config);

// Listar workflows
const workflows = await n8nAPI.getWorkflows();
console.log(workflows.data.workflows);

// Disparar workflow
await n8nAPI.triggerWorkflow({
  workflowId: '123',
  data: { message: 'Hello from frontend' }
});

// Ver histórico de webhooks
const webhooks = await n8nAPI.getWebhooks({ limit: 10 });
console.log(webhooks.data.events);
```

### No Backend (cURL)

```bash
# Status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/n8n/status

# Testar conexão
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/n8n/test

# Disparar workflow
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "123", "data": {"test": true}}' \
  http://localhost:3000/api/n8n/trigger
```

---

## ⚠️ Troubleshooting

### ❌ "N8N_API_KEY not configured"

**Solução:** Adicione `N8N_API_KEY` no `.env` do backend.

### ❌ "N8N is offline"

**Soluções:**
1. Verifique se o N8N está rodando
2. Verifique se `N8N_URL` está correto
3. Verifique se a API key está correta
4. Teste a conexão manualmente: `curl http://localhost:5678/healthz`

### ❌ "Workflow not found"

**Soluções:**
1. Verifique se o workflow está ativo no N8N
2. Verifique se o `workflowId` está correto
3. Use o webhook URL diretamente se não tiver API key

### ❌ Frontend não mostra workflows

**Soluções:**
1. Verifique se `N8N_API_KEY` está configurada
2. Verifique se o backend está rodando
3. Abra o console do navegador para ver erros
4. Verifique se o token de autenticação está válido

---

## 🎯 Próximos Passos (Opcional)

1. **Criar página dedicada** para gerenciar N8N workflows
2. **Adicionar logs em tempo real** de execuções
3. **Criar dashboard** com estatísticas de workflows
4. **Integrar notificações** quando workflows falharem
5. **Adicionar scheduler** para workflows recorrentes

---

## 📚 Documentação Relacionada

- `routes/n8n.js` - Código do backend
- `frontend/lib/api.ts` - Funções do frontend
- `frontend/app/(dashboard)/settings/page.tsx` - Interface do usuário
- `env.example` - Variáveis de ambiente

---

**✅ Integração completa! Agora você tem controle total do N8N tanto no backend quanto no frontend!**



