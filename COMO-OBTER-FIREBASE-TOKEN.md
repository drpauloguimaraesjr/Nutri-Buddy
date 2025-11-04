# 🔑 Como Obter Firebase Token para N8N

## 🎯 SOLUÇÃO AUTOMÁTICA

Adicionei um endpoint que gera o token automaticamente!

---

## 📋 PASSO A PASSO

### 1️⃣ Certifique-se que o backend está rodando

```bash
cd /Users/drpgjr.../NutriBuddy
npm install  # Se ainda não rodou
npm start
```

Aguarde ver:
```
🚀 NutriBuddy API Server Running
📍 Port: 3000
📡 Firebase: Connected ✅
```

---

### 2️⃣ Obter o Token

Abra o navegador ou use curl:

**Navegador:**
```
http://localhost:3000/api/get-token
```

**Terminal (curl):**
```bash
curl http://localhost:3000/api/get-token
```

---

### 3️⃣ Resposta

Você verá algo assim:

```json
{
  "success": true,
  "message": "Custom token generated. Use this token in N8N.",
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "abc123xyz",
  "email": "n8n-test@nutribuddy.com",
  "instructions": {
    "step1": "Copy the customToken above",
    "step2": "In N8N, set FIREBASE_TOKEN to this customToken",
    "step3": "Use as: Authorization: Bearer YOUR_CUSTOM_TOKEN",
    "note": "This token does not expire and is safe for server-to-server"
  }
}
```

---

### 4️⃣ Copiar o Token

**COPIE** o valor de `customToken` (é um texto longo)

Exemplo:
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY5ODg0MDAwMCwiZXhwIjoxNjk4ODQzNjAwLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BudXRyaWJ1ZGR5LTJmYzljLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAbnV0cmlidWRkeS0yZmM5Yy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6ImFiYzEyM3h5eiJ9...
```

---

### 5️⃣ Usar no N8N Cloud

1. Acesse N8N Cloud
2. Vá em **Settings** → **Environment Variables**
3. Encontre `FIREBASE_TOKEN`
4. Cole o token copiado
5. **Save**

---

### 6️⃣ Testar

No N8N, execute o workflow e veja se funciona!

---

## ✨ VANTAGENS DESTE TOKEN

- ✅ **Nunca expira** (perfeito para N8N)
- ✅ **Server-to-server** (seguro)
- ✅ **Gerado automaticamente**
- ✅ **Não precisa frontend**

---

## 🔄 Se precisar gerar novo token

Basta acessar novamente:
```
http://localhost:3000/api/get-token
```

---

## 🌐 Com ngrok

Se já estiver usando ngrok:

```
https://abc123.ngrok.io/api/get-token
```

---

## 📝 Usuário de Teste Criado

O endpoint cria automaticamente:
- **Email:** `n8n-test@nutribuddy.com`
- **Nome:** `N8N Test User`
- **Verificado:** ✅

Este usuário é usado apenas para N8N fazer requisições.

---

## ⚠️ IMPORTANTE

### Este token NÃO é para usar no frontend!

❌ Não use no Google AI Studio  
❌ Não compartilhe publicamente  
✅ Use APENAS no N8N (server-to-server)

---

## 🔧 Troubleshooting

### "Failed to generate token"

**Causa:** Firebase não configurado

**Solução:**
1. Verifique `.env`
2. Firebase credentials corretas
3. Reinicie backend

### "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
npm start
```

### Token não funciona no N8N

**Causa:** Token copiado incorretamente

**Solução:**
1. Gere novo token
2. Copie TODO o texto (é longo!)
3. Cole no N8N sem espaços extras

---

## ✅ CHECKLIST

- [ ] Backend rodando
- [ ] Acessou `/api/get-token`
- [ ] Token copiado
- [ ] Token colado no N8N
- [ ] Environment Variable salva
- [ ] Workflow testado

---

**Pronto! Token configurado! 🎉**

