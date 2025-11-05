# 🚀 Conectar Frontend Vercel - Passo a Passo Rápido

## ✅ Status Atual

- ✅ Backend: Railway (`https://web-production-c9eaf.up.railway.app`)
- ✅ N8N: Configurado
- ⏳ Frontend: Vamos fazer deploy agora!

---

## 📋 PASSO 1: Deploy no Vercel (5 minutos)

### 1.1 Acessar Vercel
1. Acesse: **https://vercel.com**
2. Login com **GitHub**
3. Clique em **"Add New Project"** ou **"Import Project"**

### 1.2 Importar Repositório
1. Procure: **`Nutri-Buddy`** ou **`drpauloguimaraesjr/Nutri-Buddy`**
2. Clique em **"Import"**

### 1.3 Configurar ⚠️ IMPORTANTE
- **Root Directory:** `frontend` ⚠️
- **Framework:** Next.js (automático)

### 1.4 Variáveis de Ambiente ⚠️ CRÍTICO
Antes de fazer deploy, clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://web-production-c9eaf.up.railway.app` |

**⚠️ Marque para:** Production, Preview, Development

### 1.5 Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. **ANOTE A URL:** `https://nutri-buddy-xxxxx.vercel.app`

---

## 📋 PASSO 2: Configurar CORS no Railway (2 minutos)

### 2.1 Acessar Railway
1. Acesse: **https://railway.app**
2. Entre no projeto **NutriBuddy**
3. Vá em **Variables**

### 2.2 Atualizar CORS_ORIGIN
1. Encontre `CORS_ORIGIN`
2. **Edite** para:
   ```
   https://nutri-buddy-xxxxx.vercel.app
   ```
   *(Use a URL exata que você anotou do Vercel)*
3. Clique em **Save**
4. Aguarde redeploy (2-3 minutos)

---

## 📋 PASSO 3: Testar (2 minutos)

### 3.1 Testar Frontend
1. Abra a URL do Vercel no navegador
2. Abra o Console (F12) → Network
3. Tente fazer login
4. Verifique se:
   - ✅ Não há erros CORS
   - ✅ Requisições vão para `https://web-production-c9eaf.up.railway.app`

### 3.2 Testar Backend
```bash
curl https://web-production-c9eaf.up.railway.app/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","service":"NutriBuddy API"}
```

---

## ✅ Checklist

- [ ] Código no GitHub
- [ ] Deploy no Vercel feito
- [ ] URL do Vercel anotada
- [ ] `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] `CORS_ORIGIN` atualizado no Railway
- [ ] Frontend carrega sem erros
- [ ] API conecta corretamente
- [ ] Login funciona

---

## 🐛 Problemas Comuns

### Erro CORS
- Verifique se `CORS_ORIGIN` no Railway tem a URL **exata** do Vercel
- Aguarde o redeploy do Railway
- Limpe cache do navegador (Ctrl+Shift+R)

### "API URL not found"
- Verifique se `NEXT_PUBLIC_API_URL` está configurada no Vercel
- Verifique se está marcada para Production, Preview e Development

### Build Failed
- Veja os logs no Vercel Dashboard
- Teste localmente: `cd frontend && npm run build`

---

## 🎉 Pronto!

Agora você tem:
- ✅ Backend no Railway
- ✅ Frontend no Vercel  
- ✅ N8N configurado
- ✅ Tudo conectado!

---

## 📚 Guias Completos

- `DEPLOY-FRONTEND-VERCEL-COMPLETO.md` - Guia detalhado completo
- `DEPLOY-VERCEL-FRONTEND.md` - Guia original atualizado

