# ⚡ Deploy Rápido - NutriBuddy Online

Guia rápido para colocar sua API no ar em 5 minutos!

---

## 🚀 Opção Mais Rápida: Railway

### 1️⃣ Criar conta e projeto (2 min)

1. Acesse: **https://railway.app**
2. Login com GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Escolha seu repositório

### 2️⃣ Configurar variáveis (2 min)

Em **"Variables"**, cole:

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[COLE_SUA_CHAVE_AQUI]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret-webhook
```

**Onde pegar `FIREBASE_PRIVATE_KEY`?**

Veja: `COMO-OBTER-CREDENCIAIS-FIREBASE.md`

### 3️⃣ Aguardar deploy (1 min)

- Railway faz tudo automático
- Aguarde URL: `https://nutribuddy-xxxx.up.railway.app`

### 4️⃣ Testar

```bash
curl https://nutribuddy-xxxx.up.railway.app/api/health
```

✅ **Deve retornar**: `{"status":"ok"}`

---

## 🔗 Conectar N8N

1. Abra N8N Cloud/Self-hosted
2. Vá em **Settings** → **Variables**
3. Edite `API_URL`:
   ```
   https://nutribuddy-xxxx.up.railway.app
   ```
4. **Save** e teste workflows

---

## ✅ Pronto!

Sua API está online 24/7! 🎉

---

## 📚 Guia Completo

Para mais detalhes, veja: `DEPLOY-ONLINE-COMPLETO.md`

