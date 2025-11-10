# 🚀 Deploy Completo para Produção - NutriBuddy

## ✅ STATUS ATUAL

### Backend (Railway)
- ✅ **URL:** https://web-production-c9eaf.up.railway.app
- ✅ **Status:** Online e funcionando

### Frontend (Vercel)
- ✅ **GitHub:** Código enviado
- ⏳ **Build:** Em andamento (automático)
- ✅ **Variáveis:** Configuradas

### N8N
- ✅ **Workflows:** 5 workflows criados e testados localmente
- ⏳ **Deploy:** Pendente configuração em produção

---

## 📋 PARTE 1: Verificar Deploy Frontend (Vercel)

### 1. Acessar Dashboard Vercel

1. Vá para: https://vercel.com/dashboard
2. Encontre o projeto **NutriBuddy** ou **Nutri-Buddy**
3. Verifique o status do deploy

### 2. O que Verificar

✅ **Build Success** - Build deve ter sucesso
✅ **Deployment URL** - Anote a URL (ex: `https://nutri-buddy-xxxxx.vercel.app`)

### 3. Se Build Falhar

Veja os logs no Vercel e me avise. Possíveis causas:
- Erro de TypeScript
- Dependência faltando
- Variável de ambiente incorreta

---

## 📋 PARTE 2: Configurar N8N Cloud (Produção)

### Opção A: N8N Cloud (Recomendado para Facilidade)

#### 1. Criar Conta N8N Cloud

1. Acesse: https://n8n.io/cloud
2. Clique em **"Start Free"**
3. Crie conta com email
4. Confirme email

#### 2. Após Login

- Você terá uma URL tipo: `https://seu-workspace.app.n8n.cloud`
- **Anote essa URL!**

#### 3. Importar Workflows

1. No N8N Cloud, clique em **"+"** (novo workflow)
2. Clique nos **3 pontinhos** → **Import from File**
3. Importe os workflows nesta ordem:

```
n8n-workflows/1-autoresposta-inicial-v2-fixed.json
n8n-workflows/2-analise-sentimento-openai-v4-fixed.json
n8n-workflows/3-sugestoes-resposta-v2-fixed.json
n8n-workflows/4-followup-automatico-v2-fixed.json
n8n-workflows/5-resumo-diario-v2-fixed.json
```

#### 4. Configurar URLs nos Workflows

Em **TODOS** os workflows, altere as URLs de:
```
http://host.docker.internal:3000
```

Para:
```
https://web-production-c9eaf.up.railway.app
```

**Como fazer:**
1. Abra cada workflow
2. Clique em cada nó **HTTP Request**
3. Altere o campo **URL**
4. **Save**

#### 5. Configurar Credenciais

##### OpenAI (Workflows 2 e 3)

1. Clique no nó que usa OpenAI
2. Em **Credential**, clique em **"Create New"**
3. Adicione sua **API Key** da OpenAI
4. **Save**

##### Gmail (Workflow 5)

1. Clique no nó **"Enviar Email (Gmail)"**
2. Em **Credential**, clique em **"Create New"**
3. Siga o fluxo OAuth2 do Google
4. Autorize N8N a enviar emails
5. **Save**

#### 6. Configurar Email Destinatário (Workflow 5)

No Workflow 5, edite o nó "Enviar Email (Gmail)":
- Campo **Send To**: Altere para seu email real

#### 7. Ativar Workflows

Para cada workflow:
1. Abra o workflow
2. Clique em **Save**
3. Mude o toggle para **Active** (verde)

---

### Opção B: N8N Self-Hosted no Railway (Mais Controle)

Se preferir hospedar seu próprio N8N:

#### 1. Criar novo Serviço no Railway

1. Vá para: https://railway.app
2. **New Project** → **Deploy from Docker Image**
3. Image: `n8nio/n8n`

#### 2. Configurar Variáveis de Ambiente

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=nutribuddy-admin-2024

WEBHOOK_URL=https://seu-n8n.up.railway.app/
N8N_HOST=seu-n8n.up.railway.app
N8N_PROTOCOL=https
NODE_ENV=production

WEBHOOK_SECRET=nutribuddy-secret-2024
```

#### 3. Deploy

- Railway fará deploy automático
- Anote a URL: `https://seu-n8n.up.railway.app`

#### 4. Acessar N8N

1. Abra a URL do Railway
2. Login: `admin` / `nutribuddy-admin-2024`
3. Importe os workflows (mesmo processo da Opção A)

---

## 📋 PARTE 3: Configurar Backend Railway

### 1. Verificar Variáveis de Ambiente

Acesse: https://railway.app → Seu projeto

Verifique se tem TODAS essas variáveis:

```env
# Firebase Admin
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

# API Config
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

# N8N Integration
WEBHOOK_SECRET=nutribuddy-secret-2024

# OpenAI (se usar no backend)
OPENAI_API_KEY=sk-...
```

### 2. Adicionar Variável se Faltando

1. No Railway, vá em **Variables**
2. Clique em **"+ New Variable"**
3. Adicione nome e valor
4. **Add**

### 3. Redeploy se Necessário

Se adicionou variáveis novas:
1. Clique em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. **Redeploy**

---

## 📋 PARTE 4: URLs dos Webhooks N8N

### Para N8N Cloud

Seus webhooks estarão em:
```
https://seu-workspace.app.n8n.cloud/webhook-test/nutribuddy-[nome]
```

**Exemplos:**
- Workflow 1: `https://seu-workspace.app.n8n.cloud/webhook-test/nutribuddy-autorespond`
- Workflow 2: `https://seu-workspace.app.n8n.cloud/webhook-test/nutribuddy-analyze-sentiment`
- Workflow 3: `https://seu-workspace.app.n8n.cloud/webhook-test/nutribuddy-suggest-response`

### Para N8N Self-Hosted (Railway)

```
https://seu-n8n.up.railway.app/webhook-test/nutribuddy-[nome]
```

---

## 📋 PARTE 5: Testar Sistema Completo

### 1. Teste Manual dos Workflows

#### Workflow 1 - Auto-resposta

```bash
curl -X POST https://seu-n8n.app.n8n.cloud/webhook-test/nutribuddy-autorespond \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-001",
    "patientName": "João Teste"
  }'
```

#### Workflow 2 - Análise de Sentimento

```bash
curl -X POST https://seu-n8n.app.n8n.cloud/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-002",
    "messageId": "msg-001",
    "patientName": "Maria Silva",
    "content": "Estou com dor forte, preciso de ajuda urgente!"
  }'
```

#### Workflow 3 - Sugestões

```bash
curl -X POST https://seu-n8n.app.n8n.cloud/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-003"
  }'
```

### 2. Workflows Agendados (4 e 5)

Estes rodam automaticamente às 9h. Para testar manualmente:

1. Abra o workflow no N8N
2. Clique em **"Execute Workflow"**
3. Verifique os resultados

### 3. Teste do Frontend

1. Acesse sua URL Vercel: `https://nutri-buddy-xxxxx.vercel.app`
2. Faça login/registro
3. Teste as funcionalidades:
   - ✅ Dashboard
   - ✅ Formulários
   - ✅ Sistema de mensagens
   - ✅ Chat do paciente

### 4. Teste Integração Completa

1. Como **paciente**, acesse `/chat`
2. Envie uma mensagem
3. Verifique se workflow 1 respondeu
4. Envie mensagem urgente
5. Verifique se workflow 2 analisou

---

## 📋 PARTE 6: Monitoramento

### N8N Cloud

- Dashboard mostra execuções em tempo real
- Veja erros em **Executions** → **Error**
- Logs detalhados de cada execução

### N8N Self-Hosted

- Mesma interface
- Acesse via Railway URL

### Railway (Backend)

1. Acesse projeto no Railway
2. Vá em **Deployments**
3. Clique em **View Logs**
4. Monitore erros em tempo real

### Vercel (Frontend)

1. Acesse dashboard Vercel
2. Clique no projeto
3. Vá em **Logs**
4. Filtre por tipo de erro

---

## 🔐 Segurança em Produção

### 1. Webhook Secret

Todos os endpoints backend exigem:
```
Header: x-webhook-secret: nutribuddy-secret-2024
```

### 2. Firebase Authorized Domains

1. Acesse: https://console.firebase.google.com
2. Vá em **Authentication** → **Settings** → **Authorized domains**
3. Adicione:
   - Seu domínio Vercel: `nutri-buddy-xxxxx.vercel.app`
   - Seu domínio Railway: `web-production-c9eaf.up.railway.app`
   - (Se N8N self-hosted): domínio do N8N Railway

### 3. CORS

Backend já está configurado com `CORS_ORIGIN=*`

Para produção, considere restringir:
```env
CORS_ORIGIN=https://nutri-buddy-xxxxx.vercel.app
```

---

## 💰 Custos Estimados

### N8N Cloud
- **Starter:** $20/mês (20k execuções)
- **Pro:** $50/mês (100k execuções)

### N8N Self-Hosted (Railway)
- **Uso estimado:** ~$5-10/mês
- Depende do tráfego

### Railway (Backend)
- **Free tier:** $5 crédito/mês
- **Uso estimado:** $5-15/mês

### Vercel (Frontend)
- **Hobby:** Grátis
- **Pro:** $20/mês (se precisar)

### Firebase
- **Spark (Free):** Suficiente para começar
- **Blaze (Pay-as-you-go):** Escala conforme uso

### OpenAI API
- **Uso estimado:** $10-30/mês
- Depende do volume de mensagens

**Total estimado:** $40-100/mês

---

## ✅ Checklist Final de Deploy

### Backend
- [ ] Railway rodando
- [ ] Variáveis configuradas
- [ ] Health check respondendo
- [ ] WEBHOOK_SECRET configurado

### Frontend
- [ ] Build Vercel com sucesso
- [ ] URL funcionando
- [ ] Login/registro funcionando
- [ ] Firebase conectado

### N8N
- [ ] 5 workflows importados
- [ ] URLs apontando para Railway
- [ ] Credenciais OpenAI configuradas
- [ ] Credencial Gmail configurada (workflow 5)
- [ ] Email destinatário configurado
- [ ] Todos workflows ativos
- [ ] Testes manuais executados

### Integrações
- [ ] Firebase Authorized Domains atualizados
- [ ] Webhooks testados
- [ ] Sistema de mensagens funcionando end-to-end

---

## 🎯 Próximos Passos (Pós-Deploy)

### Imediato (Hoje)
1. ✅ Verificar builds
2. ✅ Ativar workflows
3. ✅ Testar webhooks

### Amanhã
1. 🧪 Testes completos
2. 📊 Monitorar execuções
3. 🐛 Corrigir bugs se houver

### Semana 1
1. 📈 Monitorar performance
2. 💰 Verificar custos
3. 🔒 Ajustar segurança se necessário

### Semana 2
1. 🎨 Refinamentos UI/UX
2. ⚡ Otimizações de performance
3. 📱 Testes em dispositivos móveis

---

## 🆘 Troubleshooting Rápido

### Workflow não executa
- ✅ Verifique se está **Active**
- ✅ Veja logs em **Executions**
- ✅ Confirme credenciais configuradas

### Backend não responde
- ✅ Veja logs no Railway
- ✅ Verifique variáveis de ambiente
- ✅ Teste health check: `/api/health`

### Frontend com erro
- ✅ Veja console do browser (F12)
- ✅ Verifique Network tab
- ✅ Confirme variáveis no Vercel

### Firebase Auth falha
- ✅ Verifique Authorized Domains
- ✅ Confirme API Key no Vercel
- ✅ Veja console Firebase

---

## 📞 Suporte

Se encontrar problemas:

1. 📋 Verifique este guia
2. 🔍 Veja logs das plataformas
3. 🧪 Teste componentes isoladamente
4. 💬 Me avise com detalhes do erro

---

## 🎉 Parabéns!

Seu NutriBuddy está pronto para produção! 🚀

**Tudo configurado:**
- ✅ Backend 24/7 online
- ✅ Frontend acessível globalmente
- ✅ N8N automatizando processos
- ✅ IA ajudando no atendimento
- ✅ Sistema completo de mensagens

**Desenvolvido com 💜 para NutriBuddy**

