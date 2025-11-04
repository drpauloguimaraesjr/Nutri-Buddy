# 🔑 Gerar Token Firebase - Via Comando

## 🎯 2 FORMAS DE GERAR TOKEN

### FORMA 1: Via Endpoint (Recomendado)
```bash
# Backend rodando
npm start

# Outro terminal
curl http://localhost:3000/api/get-token
```

### FORMA 2: Via Script (Alternativa)
```bash
node generate-token.js
```

---

## 📋 USAR O SCRIPT (generate-token.js)

### 1️⃣ Certifique-se que .env está configurado

```bash
cat .env
```

Deve ter:
```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@nutribuddy-2fc9c.iam.gserviceaccount.com
```

### 2️⃣ Rodar o script

```bash
node generate-token.js
```

### 3️⃣ Saída esperada

```
✅ Usuário encontrado: n8n-test@nutribuddy.com

🎯 TOKEN GERADO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAÇÕES:
User ID: abc123xyz
Email: n8n-test@nutribuddy.com
Display Name: N8N Test User

💡 COMO USAR NO N8N:
1. Copie o token acima (entre as linhas)
2. No N8N Cloud → Settings → Environment Variables
3. FIREBASE_TOKEN = [cole o token aqui]
4. Save

✅ Este token nunca expira e é perfeito para N8N!
```

### 4️⃣ Copiar o Token

**COPIE** apenas o token (entre as linhas `━━━━`)

### 5️⃣ Usar no N8N

1. N8N Cloud → Settings → Environment Variables
2. FIREBASE_TOKEN = [token copiado]
3. Save

---

## 🔄 COMPARAÇÃO

| Método | Vantagem | Desvantagem |
|--------|----------|-------------|
| **Endpoint** | Fácil, via navegador | Backend precisa estar rodando |
| **Script** | Funciona offline | Precisa terminal |

---

## ⚡ MÉTODO MAIS RÁPIDO

### Se backend já está rodando:
```bash
curl http://localhost:3000/api/get-token
```

### Se backend não está rodando:
```bash
node generate-token.js
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Firebase not configured"
```bash
# Verificar .env
cat .env

# Deve ter FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
```

### Erro: "Admin SDK already initialized"
```bash
# Ignorar, é normal se rodou múltiplas vezes
# O token será gerado mesmo assim
```

### Token muito grande
```
✅ Normal! Token Firebase tem ~800-1000 caracteres
✅ Copie TUDO
```

---

## 📝 ADICIONAR AO package.json

Você pode adicionar um script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "generate-token": "node generate-token.js"
  }
}
```

Depois usar:
```bash
npm run generate-token
```

---

## ✅ RESUMO

```bash
# Método 1 (mais fácil):
npm start
curl http://localhost:3000/api/get-token

# Método 2 (alternativo):
node generate-token.js
```

Ambos geram o mesmo tipo de token!

---

**Escolha o método que preferir! Ambos funcionam perfeitamente! 🎉**

