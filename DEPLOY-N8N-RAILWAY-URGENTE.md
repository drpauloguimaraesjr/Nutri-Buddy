# 🚀 Deploy N8N no Railway - GUIA URGENTE

**Data:** 10/11/2024  
**Tempo estimado:** 15-20 minutos  
**Custo:** $5-10/mês (vs $20 N8N Cloud)

---

## ⚡ ANTES DE COMEÇAR

Tenha em mãos:
- ✅ Conta Railway (https://railway.app)
- ✅ Sua OpenAI API Key
- ✅ Seu Gmail e senha/app password
- ✅ URL do backend: `https://web-production-c9eaf.up.railway.app`

---

## 📋 PASSO A PASSO

### PASSO 1: Criar Novo Projeto N8N no Railway (3 min)

1. **Acesse:** https://railway.app

2. **Clique em:** "New Project"

3. **Escolha:** "Deploy from a template" ou "Empty Project"

4. **Se escolher Empty Project:**
   - Clique em "+ New"
   - Selecione "Database" → "PostgreSQL" (N8N precisa!)
   - Aguarde PostgreSQL provisionar (30 segundos)

5. **Adicionar N8N:**
   - Clique em "+ New" novamente
   - Selecione "GitHub Repo" ou "Docker Image"
   - **Recomendado:** Docker Image
   - Use a imagem: `n8nio/n8n:latest`

---

### PASSO 2: Configurar Variáveis de Ambiente (5 min)

Clique no serviço N8N → Aba "Variables"

**Cole TODAS estas variáveis:**

```bash
# === BÁSICAS (OBRIGATÓRIAS) ===
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=nutribuddy2024

# === URL E HOST ===
WEBHOOK_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
N8N_HOST=${{RAILWAY_PUBLIC_DOMAIN}}
N8N_PROTOCOL=https
N8N_PORT=5678

# === DATABASE (CONECTA COM POSTGRESQL) ===
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{POSTGRES_HOST}}
DB_POSTGRESDB_PORT=${{POSTGRES_PORT}}
DB_POSTGRESDB_DATABASE=${{POSTGRES_DATABASE}}
DB_POSTGRESDB_USER=${{POSTGRES_USER}}
DB_POSTGRESDB_PASSWORD=${{POSTGRES_PASSWORD}}

# === TIMEZONE ===
GENERIC_TIMEZONE=America/Sao_Paulo
TZ=America/Sao_Paulo

# === EXECUÇÕES ===
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# === WEBHOOK SECRET (IGUAL AO BACKEND!) ===
WEBHOOK_SECRET=nutribuddy-secret-2024
```

**IMPORTANTE:**
- As variáveis `${{POSTGRES_*}}` são automaticamente preenchidas pelo Railway
- `WEBHOOK_URL` e `N8N_HOST` usam `${{RAILWAY_PUBLIC_DOMAIN}}` (Railway preenche)

---

### PASSO 3: Gerar Domínio Público (1 min)

1. No serviço N8N, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Railway vai gerar algo como: `n8n-production-xxxx.up.railway.app`
5. **ANOTE ESSA URL!** Você vai precisar!

---

### PASSO 4: Deploy e Aguardar (2 min)

1. Railway vai iniciar o deploy automaticamente
2. Vá em **"Deployments"** para ver progresso
3. Status vai mudar:
   - 🔵 Building → 🟡 Deploying → ✅ Active
4. Aguarde até ficar **Active** (1-2 min)

---

### PASSO 5: Acessar N8N (1 min)

1. Abra a URL gerada: `https://n8n-production-xxxx.up.railway.app`
2. Vai pedir login:
   - **Username:** `admin`
   - **Password:** `nutribuddy2024`
3. Pronto! Você está no N8N! 🎉

---

### PASSO 6: Importar Workflows (3 min)

**Você tem 5 arquivos na pasta `n8n-workflows/`:**

1. **No N8N, clique em "Workflows" (menu lateral)**

2. **Para CADA arquivo, faça:**
   - Clique em **"+ Add Workflow"** ou ícone de importar
   - Escolha **"Import from File"**  
   - Selecione o arquivo:
     - ✅ `1-auto-resposta-inicial-v2-fixed.json`
     - ✅ `2-analise-sentimento-openai-v4-fixed.json`
     - ✅ `3-sugestoes-resposta-ia-v2-fixed.json`
     - ✅ `4-followup-automatico-v2-fixed.json`
     - ✅ `5-resumo-diario-v2-fixed.json`
   - Clique em **"Import"**

3. **Repita para os 5 workflows**

---

### PASSO 7: Ajustar URLs nos Workflows (5 min)

**Para CADA workflow importado, você precisa trocar as URLs!**

#### Workflow 1: Auto-resposta inicial
1. Abra o workflow
2. Procure nó **"HTTP Request"** (chamada ao backend)
3. Troque URL:
   - ❌ De: `http://host.docker.internal:3000`
   - ✅ Para: `https://web-production-c9eaf.up.railway.app`
4. Clique em **"Save"**

#### Workflow 2: Análise de Sentimento
1. Abra o workflow
2. Procure **"HTTP Request"** nodes
3. Troque TODAS URLs:
   - ❌ De: `http://host.docker.internal:3000`
   - ✅ Para: `https://web-production-c9eaf.up.railway.app`
4. Procure nó **"OpenAI"**
5. Clique em "Credentials" → **"Create New"**
6. Cole sua **OpenAI API Key**
7. Clique em **"Save"**

#### Workflow 3: Sugestões de Resposta
1. Abra o workflow
2. Troque URLs dos **"HTTP Request"**
3. Configure credencial **OpenAI** (mesmo processo)
4. Clique em **"Save"**

#### Workflow 4: Follow-up Automático
1. Abra o workflow
2. Troque URLs dos **"HTTP Request"**
3. Clique em **"Save"**

#### Workflow 5: Resumo Diário
1. Abra o workflow
2. Troque URLs dos **"HTTP Request"**
3. Configure **Gmail** credentials:
   - Clique no nó Gmail
   - "Credentials" → **"Create New"**
   - **Método 1 (Recomendado):** OAuth2
     - Siga instruções do N8N
     - Autorize sua conta Gmail
   - **Método 2 (Mais rápido):** SMTP
     - Email: `seu-email@gmail.com`
     - Password: App Password do Gmail
     - Host: `smtp.gmail.com`
     - Port: `587`
4. Configure **seu email** no campo "To"
5. Clique em **"Save"**

---

### PASSO 8: Obter URLs dos Webhooks (2 min)

**Para workflows que usam webhook (1, 2, 3):**

1. Abra o workflow
2. Clique no nó **"Webhook"**
3. Você vai ver **DUAS URLs:**
   - 🔵 **Test URL:** `/webhook-test/...` (só funciona ao clicar "Execute" no canvas)
   - 🟢 **Production URL:** `/webhook/...` (funciona 24/7 quando workflow está ativo)
4. **COPIE a "Production URL"** (sem `-test`)!

**⚠️ IMPORTANTE: Use sempre a PRODUCTION URL (sem `-test`)!**

**Você precisa ter 3 URLs de PRODUÇÃO:**
- Workflow 1 (Auto-resposta):
  ```
  https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-new-conversation
  ```

- Workflow 2 (Análise):
  ```
  https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-analyze-sentiment
  ```

- Workflow 3 (Sugestões):
  ```
  https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-suggest-response
  ```

---

### PASSO 9: Ativar Workflows (1 min)

**Para CADA workflow:**

1. Abra o workflow
2. No canto superior direito, veja o **toggle/switch**
3. Se estiver **"Inactive"**, clique para ativar
4. Deve ficar **"Active"** (verde) ✅

**Ative todos os 5 workflows!**

---

### PASSO 10: Atualizar Backend Railway (2 min)

Agora precisa adicionar as **URLs dos webhooks** no backend!

1. **Vá no Railway** → Projeto do backend
2. **Aba "Variables"**
3. **Adicione/Atualize estas variáveis:**

```bash
# URLs dos Webhooks N8N (PRODUCTION URLs - sem "-test")
N8N_WEBHOOK_AUTO_REPLY=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-new-conversation
N8N_WEBHOOK_ANALYZE_SENTIMENT=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-analyze-sentiment
N8N_WEBHOOK_SUGGEST_REPLY=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-suggest-response

# Webhook Secret (deve ser IGUAL ao do N8N!)
WEBHOOK_SECRET=nutribuddy-secret-2024
```

4. **Salve as variáveis**
5. Railway vai fazer **redeploy automático** (1 min)

---

## ✅ TESTES RÁPIDOS

### Teste 1: N8N está online?

```bash
curl https://n8n-production-3eae.up.railway.app
```

Deve retornar HTML do N8N ✅

### Teste 2: Webhook funciona?

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -d '{
    "messageId": "test123",
    "patientId": "patient123",
    "content": "Olá, preciso de ajuda"
  }'
```

Deve retornar resposta automática ✅

### Teste 3: Ver execuções

1. No N8N, vá em **"Executions"** (menu lateral)
2. Você deve ver a execução do teste acima
3. Status deve estar: **"Success"** ✅

---

## 🎯 CHECKLIST FINAL

Antes de finalizar, confirme:

```
□ PostgreSQL criado no Railway
□ N8N deployado e Active
□ Domínio público gerado
□ Login no N8N funcionando (admin/nutribuddy2024)
□ 5 workflows importados
□ URLs trocadas em todos workflows
□ Credencial OpenAI configurada
□ Credencial Gmail configurada (workflow 5)
□ 5 workflows ativados (Active ✅)
□ URLs dos webhooks copiadas
□ Variáveis adicionadas no backend Railway
□ Backend fez redeploy
□ Teste de webhook funcionou
```

---

## 🔗 URLS IMPORTANTES

**Anote aqui suas URLs:**

```
N8N Dashboard:
https://n8n-production-3eae.up.railway.app

Webhook Auto-resposta (PRODUCTION):
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-new-conversation

Webhook Análise Sentimento (PRODUCTION):
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-analyze-sentiment

Webhook Sugestões Resposta (PRODUCTION):
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-suggest-response

Backend Railway:
https://web-production-c9eaf.up.railway.app
```

---

## 🎉 PRONTO!

Se você chegou até aqui, parabéns! 🎊

Você agora tem:
- ✅ N8N rodando 24/7 na nuvem
- ✅ 5 workflows ativos
- ✅ Integração com backend funcionando
- ✅ IA configurada (OpenAI)
- ✅ Email configurado (Gmail)
- ✅ Custando apenas $5-10/mês

**Seu PC pode ficar desligado!** Tudo continua funcionando! 💪

---

## 🆘 PROBLEMAS COMUNS

### N8N não inicia
- Verifique se PostgreSQL está rodando
- Veja logs em "Deployments" → "View Logs"
- Confirme variáveis de ambiente

### Workflow não executa
- Verifique se está **Active**
- Veja logs em "Executions"
- Confirme URLs estão corretas
- Teste o webhook manualmente (curl)

### Erro de autenticação
- Confirme `WEBHOOK_SECRET` é igual em:
  - Backend Railway
  - Headers dos webhooks
- Deve ser: `nutribuddy-secret-2024`

### Erro OpenAI
- Confirme API Key está correta
- Teste a key em: https://platform.openai.com/api-keys
- Verifique se tem créditos

### Erro Gmail
- Se usar OAuth2: reautorize
- Se usar SMTP: gere App Password em Gmail
- Ative "Acesso a apps menos seguros" (se necessário)

---

## 📱 PRÓXIMOS PASSOS

Agora que N8N está rodando:

1. **Teste cada workflow individualmente**
2. **Envie mensagem de teste do app**
3. **Veja execuções no N8N**
4. **Ajuste conforme necessário**
5. **Celebre!** 🎉

---

## 💰 CUSTOS

**Sua stack completa:**
- Railway Backend: $5-10/mês
- Railway N8N: $5-10/mês
- Railway PostgreSQL: (incluído)
- Vercel Frontend: $0 (grátis)
- Firebase: $0 (grátis)
- OpenAI API: ~$10-30/mês

**Total: $20-50/mês** (vs $35-60 com N8N Cloud)

**Economia: $15/mês = $180/ano!** 💰

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:
1. Veja os logs no Railway (Deployments → View Logs)
2. Veja as execuções no N8N (Executions)
3. Teste webhooks manualmente (curl)
4. Me avise e eu ajudo!

---

**Desenvolvido com 💜 para NutriBuddy**

**Data:** 10/11/2024  
**Versão:** 1.0 - Deploy Urgente  
**Status:** ✅ Pronto para usar

---

## 🔗 URLs DOS NÓS HTTP REQUEST (PARA N8N)

**Após criar as rotas, use estas URLs nos nós HTTP Request do N8N:**

### 1️⃣ **Atualizar Tags e Prioridade**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/update-conversation
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body (JSON):**
```json
{
  "conversationId": "{{$json.conversationId}}",
  "tags": ["urgente", "análise-pendente"],
  "priority": "high",
  "status": "urgent"
}
```

---

### 2️⃣ **Marcar como Urgente**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/mark-urgent
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body (JSON):**
```json
{
  "conversationId": "{{$json.conversationId}}",
  "reason": "Sentimento negativo detectado pela IA"
}
```

---

### 3️⃣ **Enviar Alerta**
```
POST https://web-production-c9eaf.up.railway.app/api/n8n/send-alert
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: nutribuddy-secret-2024
```

**Body (JSON):**
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

---

## ⚠️ IMPORTANTE - SEGURANÇA

**Todas as rotas acima:**
- ✅ **NÃO precisam** de token Firebase
- ✅ **Usam** o header `X-Webhook-Secret` para autenticação
- ✅ **Mesmo secret** que os webhooks: `nutribuddy-secret-2024`
- ✅ **Acessam diretamente** o Firestore (sem passar pela autenticação de usuário)

---

## 🚀 COMECE AGORA!

Abra outra aba com:
- https://railway.app

E siga o passo a passo acima! 

**Boa sorte! Você consegue!** 💪🎯

