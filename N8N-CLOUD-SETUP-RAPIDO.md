# ⚡ N8N Cloud - Setup em 10 Minutos

## 🎯 RESUMO SUPER RÁPIDO

```
1. Criar conta → n8n.io
2. Importar N8N-WORKFLOW.json
3. Configurar 3 variáveis
4. Expor backend (ngrok)
5. Ativar workflow
✅ PRONTO!
```

---

## 📋 PASSO A PASSO RÁPIDO

### 1️⃣ Criar Conta (2 min)
```
https://n8n.io → Sign Up → Confirmar email
```

### 2️⃣ Importar Workflow (1 min)
```
Workflows → New → ... → Import → N8N-WORKFLOW.json
```

### 3️⃣ Configurar Variáveis (2 min)
```
Settings → Environment Variables → Add:

WEBHOOK_SECRET = nutribuddy-secret-2024
FIREBASE_TOKEN = [seu-token]
API_URL = http://localhost:3000 (mudar depois)
```

### 4️⃣ Expor Backend (3 min)
```bash
# Terminal 1: Backend
cd NutriBuddy
npm start

# Terminal 2: ngrok
ngrok http 3000

# Copie URL: https://xxxxx.ngrok.io
# Atualize API_URL no N8N
```

### 5️⃣ Ativar Workflow (1 min)
```
Workflow → Toggle "Active" → Salvar
```

### 6️⃣ Testar (1 min)
```bash
curl https://seu-nome.app.n8n.cloud/webhook/webhook-nutribuddy \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{"msg":"ok"}}'
```

---

## ⚠️ 3 PONTOS CRÍTICOS

### 1. Backend precisa ser PÚBLICO
```
❌ http://localhost:3000  # N8N Cloud não acessa
✅ https://xxxxx.ngrok.io  # OK!
✅ https://app.railway.app # OK!
```

### 2. CORS precisa estar configurado
```env
# Backend .env
CORS_ORIGIN=*
```

### 3. Webhook Secret precisa ser IGUAL
```env
# Backend .env
WEBHOOK_SECRET=nutribuddy-secret-2024

# N8N Cloud → Environment Variables
WEBHOOK_SECRET=nutribuddy-secret-2024
```

---

## 🔧 PROBLEMAS COMUNS

### "Cannot connect to localhost"
→ Use ngrok para expor backend

### "CORS error"
→ Adicione `CORS_ORIGIN=*` no .env

### "Invalid webhook secret"
→ Verifique se são iguais no backend e N8N

---

## ✅ PRONTO!

URLs importantes:
```
N8N: https://[seu-nome].app.n8n.cloud
Webhook: .../webhook/webhook-nutribuddy
Backend: https://[xxx].ngrok.io
```

**Guia completo:** `SETUP-N8N-CLOUD-COMPLETO.md`

