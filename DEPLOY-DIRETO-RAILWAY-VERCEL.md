# 🚀 DEPLOY DIRETO - Railway + Vercel (SEM CONFIGURAR LOCAL)

## ✅ VANTAGENS: Não precisa rodar nada na sua máquina!

- ✅ Sem instalar Node.js localmente
- ✅ Sem configurar .env na máquina
- ✅ Sem rodar `npm start` localmente
- ✅ Tudo funciona direto nas plataformas cloud
- ✅ Atualização automática via GitHub

---

## 📋 PARTE 1: BACKEND NO RAILWAY (10 minutos)

### 1.1 - Acessar Railway

👉 **https://railway.app**

- Faça login com GitHub
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**
- Escolha seu repositório **NutriBuddy**

### 1.2 - Railway vai detectar automaticamente

O Railway vai:
- ✅ Detectar que é Node.js
- ✅ Ler o `package.json`
- ✅ Usar o `railway.json` se existir
- ✅ Iniciar o servidor automaticamente

**Mas ainda precisa configurar as variáveis de ambiente!**

### 1.3 - Configurar Variáveis de Ambiente no Railway

**No dashboard do Railway, vá em "Variables" e adicione:**

#### Firebase (Obrigatório):

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
```

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOLE_A_CHAVE_COMPLETA_AQUI\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:** A chave privada deve estar entre aspas e com `\n` onde tem quebra de linha!

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
```

#### Configurações do Servidor:

```env
PORT=3000
```

```env
NODE_ENV=production
```

```env
CORS_ORIGIN=*
```

**Ou melhor, use a URL do seu frontend depois que deployar no Vercel:**
```env
CORS_ORIGIN=https://nutri-buddy-xxxxx.vercel.app
```

#### N8N (Opcional):

```env
WEBHOOK_SECRET=seu-secret-aqui
```

### 1.4 - Obter Credenciais do Firebase

**Se ainda não tem as credenciais:**

1. Acesse: **https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk**
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON
4. Abra o JSON e copie:
   - `project_id` → Cole no Railway como `FIREBASE_PROJECT_ID`
   - `private_key` → Cole no Railway como `FIREBASE_PRIVATE_KEY` (com aspas e `\n`)
   - `client_email` → Cole no Railway como `FIREBASE_CLIENT_EMAIL`

**📚 Guia detalhado:** Veja `COMO-OBTER-CREDENCIAIS-FIREBASE.md`

### 1.5 - Railway vai fazer o deploy automaticamente

Depois de adicionar as variáveis:
- O Railway vai detectar as mudanças
- Vai fazer rebuild automaticamente
- Você verá os logs em tempo real

**✅ Quando aparecer "Deployed successfully" = Backend online!**

### 1.6 - Obter URL do Backend

**No dashboard do Railway:**
- Vá em **"Settings"**
- Role até **"Domains"**
- Clique em **"Generate Domain"**
- Você receberá uma URL tipo: `https://nutribuddy-production.up.railway.app`

**📝 ANOTE ESSA URL! Você vai precisar para o Vercel!**

---

## 📋 PARTE 2: FRONTEND NO VERCEL (5 minutos)

### 2.1 - Acessar Vercel

👉 **https://vercel.com**

- Faça login com GitHub
- Clique em **"Add New Project"**
- Escolha seu repositório **NutriBuddy**

### 2.2 - Configurar Root Directory (MUITO IMPORTANTE!)

**Na seção "Configure Project":**

- **Root Directory:** Digite `frontend`
- ⚠️ **Isso é CRUCIAL!** O Vercel precisa saber que o Next.js está na pasta `frontend`

### 2.3 - Configurar Variáveis de Ambiente

**Na seção "Environment Variables", adicione:**

#### URL da API (Backend):

```env
NEXT_PUBLIC_API_URL=https://nutribuddy-production.up.railway.app
```

**⚠️ Use a URL que você anotou do Railway!**

#### Firebase Client (Se necessário):

Se você tiver variáveis do Firebase no frontend, adicione também:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=225946487395
NEXT_PUBLIC_FIREBASE_APP_ID=1:225946487395:web:d14ef325c8970061aa4656
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MB7VG6TFXN
```

**Mas normalmente essas já estão no código! Só precisa da URL da API mesmo.**

### 2.4 - Deploy!

- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- ✅ Pronto!

### 2.5 - Obter URL do Frontend

**Você receberá uma URL tipo:**
```
https://nutri-buddy-xxxxx.vercel.app
```

**📝 ANOTE ESSA URL!**

---

## 🔄 PARTE 3: CONECTAR TUDO

### 3.1 - Atualizar CORS no Railway

**Volte no Railway e atualize a variável:**

```env
CORS_ORIGIN=https://nutri-buddy-xxxxx.vercel.app
```

**Ou se quiser permitir qualquer origem (desenvolvimento):**

```env
CORS_ORIGIN=*
```

**O Railway vai fazer redeploy automaticamente!**

### 3.2 - Testar se está tudo conectado

**1. Teste o backend:**
```
https://nutribuddy-production.up.railway.app/api/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "service": "NutriBuddy API"
}
```

**2. Teste o frontend:**
```
https://nutri-buddy-xxxxx.vercel.app
```

**Deve abrir a página de login!**

**3. Teste a integração:**
- Abra o frontend
- Faça login ou cadastre-se
- Clique nos botões
- ✅ Deve funcionar tudo!

---

## ✅ CHECKLIST COMPLETO

### Railway (Backend):
```
[ ] Login no Railway com GitHub
[ ] Conectado ao repositório NutriBuddy
[ ] Variáveis de ambiente configuradas:
    [ ] FIREBASE_PROJECT_ID
    [ ] FIREBASE_PRIVATE_KEY
    [ ] FIREBASE_CLIENT_EMAIL
    [ ] PORT=3000
    [ ] NODE_ENV=production
    [ ] CORS_ORIGIN (URL do Vercel ou *)
[ ] Deploy bem-sucedido
[ ] URL do backend anotada
[ ] Health check funcionando
```

### Vercel (Frontend):
```
[ ] Login no Vercel com GitHub
[ ] Conectado ao repositório NutriBuddy
[ ] Root Directory configurado: `frontend`
[ ] Variável de ambiente:
    [ ] NEXT_PUBLIC_API_URL (URL do Railway)
[ ] Deploy bem-sucedido
[ ] URL do frontend anotada
[ ] Frontend abrindo corretamente
```

### Integração:
```
[ ] CORS atualizado no Railway com URL do Vercel
[ ] Backend respondendo
[ ] Frontend conectando ao backend
[ ] Login funcionando
[ ] Botões funcionando
[ ] Tudo funcionando! ✅
```

---

## 🎯 RESUMO RÁPIDO (Copiar e Colar)

### Railway:
1. Login: https://railway.app
2. New Project → Deploy from GitHub → NutriBuddy
3. Variables → Adicionar Firebase + PORT + CORS_ORIGIN
4. Settings → Generate Domain → Anotar URL

### Vercel:
1. Login: https://vercel.com
2. Add New Project → NutriBuddy
3. Root Directory: `frontend`
4. Environment Variables → `NEXT_PUBLIC_API_URL` (URL do Railway)
5. Deploy

### Conectar:
1. Railway → CORS_ORIGIN = URL do Vercel
2. Testar: Backend + Frontend + Integração

---

## 🆘 TROUBLESHOOTING

### ❌ Railway: "Build failed"

**Causa:** Dependências não instaladas ou erro no código

**Solução:**
1. Verifique os logs no Railway
2. Verifique se o `package.json` está correto
3. Verifique se tem `railway.json` configurado

### ❌ Railway: "Firebase not initialized"

**Causa:** Variáveis de ambiente não configuradas corretamente

**Solução:**
1. Verifique se todas as 3 variáveis do Firebase estão lá
2. Verifique se `FIREBASE_PRIVATE_KEY` tem aspas e `\n`
3. Verifique se não tem espaços extras

### ❌ Vercel: "Build failed"

**Causa:** Root Directory errado ou dependências

**Solução:**
1. Verifique se Root Directory está como `frontend`
2. Verifique os logs no Vercel
3. Verifique se o `frontend/package.json` está correto

### ❌ Vercel: "Cannot connect to API"

**Causa:** URL da API errada ou CORS bloqueando

**Solução:**
1. Verifique se `NEXT_PUBLIC_API_URL` está correto (URL do Railway)
2. Verifique se `CORS_ORIGIN` no Railway tem a URL do Vercel
3. Teste o backend diretamente: `https://seu-backend.railway.app/api/health`

### ❌ Frontend: "Network Error" ou "CORS Error"

**Causa:** CORS não configurado ou URL errada

**Solução:**
1. No Railway, configure `CORS_ORIGIN` com a URL exata do Vercel
2. Ou use `CORS_ORIGIN=*` temporariamente para testar
3. Reinicie o deploy no Railway

---

## 🎉 VANTAGENS DESSA ABORDAGEM

✅ **Sem instalar nada localmente**
✅ **Sem configurar .env na máquina**
✅ **Deploy automático via GitHub**
✅ **Atualização automática quando fazer push**
✅ **Logs em tempo real nas plataformas**
✅ **URLs públicas para testar**
✅ **Escalável automaticamente**

---

## 📝 PRÓXIMOS PASSOS (Depois do Deploy)

1. **Testar cadastro de prescritor**
2. **Testar cadastro de paciente**
3. **Testar adicionar paciente (prescritor)**
4. **Testar todos os botões**
5. **Configurar domínio custom (opcional)**
6. **Configurar N8N com URL de produção**

---

## 🔗 LINKS ÚTEIS

- **Railway:** https://railway.app
- **Vercel:** https://vercel.com
- **Firebase Console:** https://console.firebase.google.com/project/nutribuddy-2fc9c
- **Service Account:** https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk

---

**Agora é só seguir os passos e tudo vai funcionar direto nas plataformas! Sem precisar rodar nada na sua máquina! 🚀**



