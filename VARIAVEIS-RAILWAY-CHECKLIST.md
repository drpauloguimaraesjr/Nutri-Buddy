# ✅ Checklist de Variáveis Railway - NutriBuddy Backend

## 🎯 URL do Backend

**Produção:** https://web-production-c9eaf.up.railway.app

---

## 📋 Variáveis Obrigatórias

Acesse: https://railway.app → Seu Projeto → Variables

### ✅ Firebase Admin SDK

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
```

```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

⚠️ **IMPORTANTE:** Mantenha as quebras de linha `\n` na chave privada!

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
```

### ✅ Configuração do Servidor

```env
PORT=3000
```

```env
NODE_ENV=production
```

```env
CORS_ORIGIN=*
```

💡 **Nota:** Em produção final, troque `*` pela URL do Vercel:
```env
CORS_ORIGIN=https://nutri-buddy-xxxxx.vercel.app
```

### ✅ Integração N8N

```env
WEBHOOK_SECRET=nutribuddy-secret-2024
```

---

## 📋 Variáveis Opcionais (Mas Recomendadas)

### OpenAI (para IA no backend)

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Google AI (alternativa à OpenAI)

```env
GOOGLE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SendGrid (para emails do backend)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@nutribuddy.com
SENDGRID_FROM_NAME=NutriBuddy
```

---

## 🔍 Como Verificar se Está Tudo Certo

### 1. Acessar Dashboard Railway

1. Vá para: https://railway.app
2. Clique no seu projeto (Backend NutriBuddy)
3. Vá na aba **"Variables"**

### 2. Confirmar Variáveis

Deve ter **no mínimo 6 variáveis:**

- [x] `FIREBASE_PROJECT_ID`
- [x] `FIREBASE_PRIVATE_KEY`
- [x] `FIREBASE_CLIENT_EMAIL`
- [x] `PORT`
- [x] `NODE_ENV`
- [x] `CORS_ORIGIN`
- [x] `WEBHOOK_SECRET`

### 3. Testar Health Check

```bash
curl https://web-production-c9eaf.up.railway.app/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-10T...",
  "environment": "production"
}
```

---

## 🚨 Se Variável Estiver Faltando

### Como Adicionar Variável no Railway

1. Railway Dashboard → Seu Projeto
2. Aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Preencha:
   - **Variable Name:** (ex: `WEBHOOK_SECRET`)
   - **Value:** (ex: `nutribuddy-secret-2024`)
5. Clique em **"Add"**

### Redeploy Após Adicionar

⚠️ **Importante:** Após adicionar variáveis, é necessário redeploy!

1. Vá na aba **"Deployments"**
2. Clique nos **3 pontinhos** do último deployment
3. Selecione **"Redeploy"**
4. Aguarde ~2-3 minutos

---

## 🔐 Segurança das Variáveis

### ✅ Boas Práticas

- [x] Nunca commitar variáveis no código
- [x] Usar Railway Variables
- [x] Rotacionar secrets periodicamente
- [x] Limitar CORS_ORIGIN em produção

### ⚠️ Variáveis Sensíveis

Estas variáveis são **SECRETAS**. Nunca compartilhe:

- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `SENDGRID_API_KEY`

---

## 📊 Valores Atuais (Para Referência)

### Firebase

- **Project ID:** `nutribuddy-2fc9c`
- **Auth Domain:** `nutribuddy-2fc9c.firebaseapp.com`
- **Storage Bucket:** `nutribuddy-2fc9c.firebasestorage.app`

### Servidor

- **Port:** `3000`
- **Environment:** `production`

### N8N

- **Webhook Secret:** `nutribuddy-secret-2024` (configurado)

---

## 🔄 Sincronizar com .env Local

Se quiser rodar localmente com as mesmas variáveis:

### Arquivo `.env` local:

```env
# Firebase Admin
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# N8N
WEBHOOK_SECRET=nutribuddy-secret-2024

# OpenAI (opcional)
OPENAI_API_KEY=sk-proj-xxxxx

# Google AI (opcional)
GOOGLE_AI_API_KEY=AIzaSyxxxxx
```

---

## ✅ Checklist Final

### Antes de Deploy
- [ ] Todas variáveis obrigatórias configuradas
- [ ] Firebase credentials corretos
- [ ] WEBHOOK_SECRET configurado
- [ ] PORT = 3000

### Após Deploy
- [ ] Health check respondendo
- [ ] Logs sem erros
- [ ] Firebase conectado
- [ ] N8N pode chamar endpoints

### Opcional (Melhorias)
- [ ] CORS_ORIGIN restrito ao domínio Vercel
- [ ] OpenAI API Key configurada
- [ ] SendGrid configurado para emails

---

## 🆘 Troubleshooting

### Erro: "Firebase Admin SDK initialization failed"

**Causa:** Variáveis Firebase incorretas

**Solução:**
1. Verificar `FIREBASE_PRIVATE_KEY` tem quebras de linha
2. Confirmar `FIREBASE_CLIENT_EMAIL` está correto
3. Redeploy após corrigir

### Erro: "Webhook authentication failed"

**Causa:** `WEBHOOK_SECRET` não configurado ou diferente

**Solução:**
1. Adicionar `WEBHOOK_SECRET=nutribuddy-secret-2024`
2. Redeploy
3. Verificar que N8N usa o mesmo secret

### Erro: "Port 3000 already in use"

**Causa:** Variável PORT não configurada

**Solução:**
1. Adicionar `PORT=3000`
2. Ou Railway define automaticamente via `$PORT`

---

## 📝 Onde Obter as Credenciais

### Firebase Private Key

1. Firebase Console → Project Settings
2. Service Accounts
3. Generate New Private Key
4. Copiar do arquivo JSON baixado:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### OpenAI API Key

1. Acesse: https://platform.openai.com/api-keys
2. Create New Secret Key
3. Copie e salve (aparece uma vez só!)

### Google AI API Key

1. Acesse: https://makersuite.google.com/app/apikey
2. Create API Key
3. Copie e salve

---

## ✅ Pronto!

Com todas essas variáveis configuradas, seu backend Railway está pronto para produção! 🚀

**Última atualização:** 2024-11-10

