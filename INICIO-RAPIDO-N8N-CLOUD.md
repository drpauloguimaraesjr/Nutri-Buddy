# ⚡ Início Rápido - N8N Cloud (5 Minutos)

## 🎯 Você já criou a conta? Ótimo! Agora siga estes passos:

---

## 1️⃣ Importar o Workflow (1 minuto)

1. No N8N Cloud, clique em **"Workflows"** → **"+ New"**
2. Clique nos **3 pontinhos** (...) → **"Import from File"**
3. Selecione o arquivo **`N8N-WORKFLOW.json`** do seu computador
4. ✅ Workflow importado!

---

## 2️⃣ Configurar 3 Variáveis (2 minutos)

1. Clique em **"Settings"** → **"Environment Variables"**

### Variável 1: WEBHOOK_SECRET
- **Name:** `WEBHOOK_SECRET`
- **Value:** Pegue do seu arquivo `.env` do backend (ou crie: `nutribuddy-secret-2024`)

### Variável 2: FIREBASE_TOKEN
- **Name:** `FIREBASE_TOKEN`
- **Value:** Seu token do Firebase (veja como obter abaixo)

### Variável 3: API_URL
- **Name:** `API_URL`
- **Value:** URL pública do seu backend
  - **Se estiver local:** Use ngrok (veja abaixo)
  - **Se estiver no Railway:** `https://seu-app.railway.app`
  - **Se estiver no Render:** `https://seu-app.onrender.com`

✅ Salve cada variável!

---

## 3️⃣ Atualizar URLs no Workflow (1 minuto)

No workflow, clique em cada bloco verde (HTTP Request) e troque:

**De:** `http://localhost:3000/api/...`  
**Para:** `{{$env.API_URL}}/api/...`

**Blocos para atualizar:**
- "HTTP Request - NutriBuddy API" → `/api/webhook`
- "Salvar Nutrição" → `/api/nutrition`
- "Salvar Refeição" → `/api/meals`
- "Health Check" → `/api/health`
- "Buscar Nutrição" → `/api/nutrition`

✅ Salve o workflow!

---

## 4️⃣ Ativar o Workflow (10 segundos)

1. No canto superior direito, clique no toggle **"Inactive"**
2. Mude para **"Active"** (verde)
3. Clique em **"Save"**

✅ Pronto!

---

## 5️⃣ Copiar URL do Webhook (10 segundos)

1. Clique no bloco **"Webhook - Receber Dados"**
2. Copie a **"Production URL"**
3. Guarde essa URL! (algo como: `https://seu-nome.app.n8n.cloud/webhook/webhook-nutribuddy`)

---

## 🔑 Como Obter Firebase Token

### Opção Rápida (Frontend):
```javascript
// No console do navegador (F12)
firebase.auth().currentUser.getIdToken().then(token => console.log(token))
```

### Opção Backend:
Use o script `generate-token.js` do projeto ou crie um endpoint temporário.

---

## 🌐 Expor Backend Local (ngrok)

Se seu backend está em `localhost:3000`:

```bash
# 1. Instalar ngrok
brew install ngrok  # ou baixe de ngrok.com

# 2. Autenticar
ngrok config add-authtoken SEU_TOKEN

# 3. Expor backend
ngrok http 3000

# 4. Copiar URL: https://xxxxx.ngrok.io
# 5. Usar no API_URL do N8N
```

---

## ✅ Checklist Rápido

- [ ] Workflow importado
- [ ] WEBHOOK_SECRET configurado
- [ ] FIREBASE_TOKEN configurado
- [ ] API_URL configurado (URL pública!)
- [ ] URLs atualizadas (localhost → {{$env.API_URL}})
- [ ] Workflow ativado
- [ ] URL do webhook copiada

---

## 🎉 Pronto!

Agora seu N8N está funcionando! 

**Guia completo:** Veja `GUIA-COMPLETO-N8N-CLOUD.md` para explicações detalhadas.

---

## 🆘 Problema?

**"Cannot connect to localhost"**  
→ Use URL pública (Railway/Render/ngrok) no `API_URL`

**"Invalid webhook secret"**  
→ Verifique se `WEBHOOK_SECRET` é igual no N8N e no backend `.env`

**"Firebase token invalid"**  
→ Gere um novo token

---

**🚀 Tudo funcionando? Teste enviando dados para o webhook!**



