# ⚡ DEPLOY RÁPIDO - 3 PASSOS (Railway + Vercel)

## 🎯 Resumo Ultra-Rápido

**Sem instalar nada na máquina! Tudo direto nas plataformas!**

---

## 📍 PASSO 1: Railway (Backend) - 5 min

### 1. Acesse: https://railway.app
- Login com GitHub
- New Project → Deploy from GitHub → NutriBuddy

### 2. Configure Variáveis (Variables):
```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

**📝 Obter Firebase:** https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk

### 3. Generate Domain
- Settings → Domains → Generate Domain
- **Anote a URL:** `https://nutribuddy-xxxxx.up.railway.app`

---

## 📍 PASSO 2: Vercel (Frontend) - 3 min

### 1. Acesse: https://vercel.com
- Login com GitHub
- Add New Project → NutriBuddy

### 2. Configure:
- **Root Directory:** `frontend` ⚠️ IMPORTANTE!
- **Environment Variable:**
  - `NEXT_PUBLIC_API_URL` = URL do Railway (anotada acima)

### 3. Deploy!
- Clique em Deploy
- **Anote a URL:** `https://nutri-buddy-xxxxx.vercel.app`

---

## 📍 PASSO 3: Conectar - 2 min

### 1. Volte no Railway
- Variables → Edite `CORS_ORIGIN`
- Coloque a URL do Vercel: `https://nutri-buddy-xxxxx.vercel.app`
- Railway vai fazer redeploy automaticamente

### 2. Teste!
- Backend: `https://seu-backend.railway.app/api/health`
- Frontend: `https://seu-frontend.vercel.app`
- ✅ Tudo funcionando!

---

## ✅ PRONTO!

**Agora você tem:**
- ✅ Backend rodando no Railway
- ✅ Frontend rodando no Vercel
- ✅ Tudo conectado e funcionando
- ✅ Sem precisar rodar nada na sua máquina!

---

## 🆘 Problemas?

**Railway não conecta Firebase?**
- Verifique se as 3 variáveis estão lá
- Verifique se `FIREBASE_PRIVATE_KEY` tem aspas e `\n`

**Vercel não conecta ao backend?**
- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique se `CORS_ORIGIN` no Railway tem a URL do Vercel

**Frontend dá erro CORS?**
- Atualize `CORS_ORIGIN` no Railway com URL exata do Vercel

---

**📚 Guia completo:** Veja `DEPLOY-DIRETO-RAILWAY-VERCEL.md`

---

**🚀 Agora é só seguir os 3 passos e está pronto!**



