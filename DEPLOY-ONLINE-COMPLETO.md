# 🚀 Como Deixar NutriBuddy Rodando Online 24/7

Este guia mostra como hospedar seu NutriBuddy API online sem depender do seu computador.

---

## 📋 Opções de Hospedagem

### ✅ Recomendadas (gratuitas para começar)

1. **Railway** ⭐ (mais fácil)
2. **Render**
3. **Heroku**
4. **Fly.io**

---

## 🌟 Opção 1: Railway (RECOMENDADA - Mais Fácil)

### Passo 1: Criar conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Login"**
3. Use sua conta GitHub ou Google
4. Após login, clique em **"New Project"**

### Passo 2: Conectar GitHub

1. Selecione **"Deploy from GitHub repo"**
2. Autorize Railway a acessar seus repositórios
3. Escolha o repositório do NutriBuddy
4. Railway detectará automaticamente o `package.json`

### Passo 3: Configurar variáveis de ambiente

No Railway Dashboard, vá em **"Variables"** e adicione:

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

WEBHOOK_SECRET=seu-secret-webhook-aqui
```

**⚠️ IMPORTANTE**: Na `FIREBASE_PRIVATE_KEY`, mantenha as quebras de linha `\n`!

### Passo 4: Deploy automático

1. Railway fará deploy automático
2. Aguarde ~2-3 minutos
3. Você verá uma URL como: `https://nutribuddy-xxxx.up.railway.app`

### Passo 5: Configurar domínio personalizado (opcional)

1. No Railway, vá em **"Settings"** → **"Domains"**
2. Adicione um domínio personalizado (se tiver)
3. Ou use o domínio `.railway.app` fornecido

### Passo 6: Testar a API

```bash
# Teste o health check
curl https://nutribuddy-xxxx.up.railway.app/api/health

# Deve retornar:
# {"status":"ok","timestamp":"2024-11-03T..."}
```

---

## 🌟 Opção 2: Render

### Passo 1: Criar conta

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub/Google
3. Clique em **"New +"** → **"Web Service"**

### Passo 2: Conectar repositório

1. Selecione **"Build and deploy from a Git repository"**
2. Conecte seu GitHub
3. Selecione o repositório NutriBuddy

### Passo 3: Configurar

- **Name**: `nutribuddy-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Passo 4: Adicionar variáveis

Em **"Advanced"** → **"Environment Variables"**:

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret
```

### Passo 5: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde ~5 minutos
3. URL será: `https://nutribuddy-api.onrender.com`

---

## 🌟 Opção 3: Heroku

### Passo 1: Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows: baixe de https://devcenter.heroku.com/articles/heroku-cli
```

### Passo 2: Login no Heroku

```bash
heroku login
```

### Passo 3: Criar app

```bash
heroku create nutribuddy-api
```

### Passo 4: Configurar variáveis

```bash
heroku config:set FIREBASE_PROJECT_ID=nutribuddy-2fc9c
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
heroku config:set PORT=3000
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=*
heroku config:set WEBHOOK_SECRET=seu-secret
```

### Passo 5: Deploy

```bash
git push heroku main
```

### Passo 6: Abrir no navegador

```bash
heroku open
```

---

## 🔗 Atualizar N8N para usar URL online

Após fazer deploy, você precisa atualizar seu N8N para usar a URL online:

### Passo 1: Obter URL da API hospedada

Exemplo: `https://nutribuddy-xxxx.up.railway.app`

### Passo 2: Atualizar variáveis no N8N

No N8N Cloud ou Self-hosted:

1. Vá em **Settings** → **Variables**
2. Edite `API_URL` para:
   ```
   https://nutribuddy-xxxx.up.railway.app
   ```
3. Salve

### Passo 3: Atualizar workflows

Em todos os nós **HTTP Request** que apontavam para `http://localhost:3000`:

1. Altere para sua nova URL
2. Salve o workflow
3. Teste executando

---

## 🔥 Atualizar Firebase com novos domínios

### Configurar CORS autorizado no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione projeto **nutribuddy-2fc9c**
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Adicione:
   - `nutribuddy-xxxx.up.railway.app`
   - Ou seu domínio Render/Heroku
5. Salve

---

## 🧪 Testar API online

### Teste rápido com curl

```bash
# Substitua pela sua URL
API_URL="https://nutribuddy-xxxx.up.railway.app"

# Health check
curl "$API_URL/api/health"

# Teste webhook
curl -X POST "$API_URL/api/webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu-secret" \
  -d '{
    "event": "test",
    "data": {"message": "Hello from production"}
  }'
```

### Teste com Postman/Insomnia

1. Abra Postman
2. Crie novo request
3. URL: `https://nutribuddy-xxxx.up.railway.app/api/health`
4. Method: GET
5. Clique em "Send"

---

## 📊 Monitoramento (Recomendado)

### Railway

- Dashboard mostra logs em tempo real
- Métricas de CPU/Memória
- Alertas de erro

### Render

- Logs disponíveis no dashboard
- Alertas por email se app ficar offline

### Heroku

```bash
# Ver logs em tempo real
heroku logs --tail

# Ver estatísticas
heroku ps
```

---

## 💰 Custos

### Railway

- **Free tier**: $5 de crédito/mês
- Suficiente para APIs pequenas
- Paga apenas se exceder

### Render

- **Free tier**: App desliga após 15min de inatividade
- Para 24/7: $7/mês

### Heroku

- **Free tier**: ~~Removido em 2022~~
- **Basic**: $7/mês

---

## 🔒 Segurança em produção

### 1. Configurar HTTPS

Railway, Render e Heroku já fornecem HTTPS automaticamente ✅

### 2. Renovar Firebase Token periodicamente

```bash
# Criar script para renovar token
node generate-token.js > .env.token
```

### 3. Monitorar logs

Fique atento a tentativas de acesso não autorizado

### 4. Rate limiting (opcional)

Adicione ao `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests
});

app.use('/api', limiter);
```

---

## 🐛 Troubleshooting

### Erro: "Firebase Admin SDK initialization error"

- Verifique `FIREBASE_PRIVATE_KEY` com quebras de linha `\n`
- Confirme que não há espaços extras

### Erro: "CORS policy blocked"

- Configure `CORS_ORIGIN=*` ou seu domínio específico
- Verifique Firebase Authorized Domains

### Erro: "Application error"

- Veja os logs do serviço de hospedagem
- Confirme que todas variáveis estão configuradas
- Teste localmente primeiro

### API responde lentamente

- Normal em free tiers (cold starts)
- Upgrade para planos pagos se necessário

---

## 📝 Checklist Final

- [ ] API deployada em Railway/Render/Heroku
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS funcionando
- [ ] Health check respondendo
- [ ] N8N atualizado com URL online
- [ ] Firebase Authorized Domains atualizado
- [ ] Testes realizados
- [ ] Logs monitorados

---

## ✅ Resultado Final

Agora seu NutriBuddy está online 24/7! 🎉

- ✅ API disponível via URL pública
- ✅ N8N pode acessar a qualquer momento
- ✅ Sem dependência do computador
- ✅ HTTPS seguro
- ✅ Logs centralizados

---

## 🆘 Precisa de Ajuda?

- Veja logs em tempo real no dashboard da plataforma
- Teste localmente primeiro para isolar problemas
- Verifique se Firebase está configurado corretamente

---

**Desenvolvido para NutriBuddy** 🚀

