# 🔌 NGROK - Faça Agora!

## 🎯 O QUE VOCÊ PRECISA FAZER

### 1️⃣ INSTALAR NGROK (2 min)

Abra o Terminal e rode:

```bash
brew install ngrok
```

Aguarde instalar...

✅ Pronto? Teste:
```bash
ngrok --version
```

---

### 2️⃣ CRIAR CONTA NGROK (3 min)

1. Abra: https://dashboard.ngrok.com/signup
2. **Sign Up** com Google (mais rápido)
3. Após login, clique em **"Your Authtoken"** (menu esquerdo)
4. Copie o token (começa com algo como `2abc...`)

---

### 3️⃣ CONFIGURAR TOKEN (1 min)

No terminal, cole (substitua pelo SEU token):

```bash
ngrok config add-authtoken 34vO5DysKD3dGCnLOGZEg9tBcMP_2k3WZptVpThAmXPMmT2Ca
```

Exemplo real:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl...
```

✅ Verá: `Authtoken saved`

---

### 4️⃣ INICIAR BACKEND (1 min)

**TERMINAL 1** (backend):

```bash
cd /Users/drpgjr.../NutriBuddy
npm start
```

Aguarde ver:
```
🚀 NutriBuddy API Server Running
📍 Port: 3000
```

✅ **DEIXE ESTE TERMINAL ABERTO!**

---

### 5️⃣ INICIAR NGROK (1 min)

Abra **NOVO TERMINAL** (Cmd+T ou Cmd+N)

**TERMINAL 2** (ngrok):

```bash
ngrok http 3000
```

Você verá algo assim:
```
Session Status    online
Forwarding        https://abc1-23-45-67.ngrok.io -> http://localhost:3000
```

✅ **COPIE A URL**: `https://abc1-23-45-67.ngrok.io`

⚠️ **DEIXE ESTE TERMINAL ABERTO TAMBÉM!**

---

### 6️⃣ TESTAR (1 min)

Abra **TERCEIRO TERMINAL** e teste:

```bash
curl https://SUA-URL-NGROK.ngrok.io/api/health
```

Exemplo:
```bash
curl https://abc1-23-45-67.ngrok.io/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","service":"NutriBuddy API"}
```

✅ **FUNCIONOU!**

---

### 7️⃣ CONFIGURAR N8N CLOUD (2 min)

1. Abra N8N Cloud: https://app.n8n.cloud
2. Settings → Environment Variables
3. Encontre `API_URL`
4. Clique em **Edit**
5. Mude de `http://localhost:3000`
6. Para: `https://SUA-URL-NGROK.ngrok.io`
7. **Save**

✅ **PRONTO!**

---

## 📊 CHECKLIST RÁPIDO

- [ ] ngrok instalado (`brew install ngrok`)
- [ ] Conta criada no ngrok.com
- [ ] Token configurado
- [ ] Terminal 1: Backend rodando (`npm start`)
- [ ] Terminal 2: ngrok rodando (`ngrok http 3000`)
- [ ] URL copiada
- [ ] Teste OK (curl)
- [ ] N8N Cloud atualizado

---

## ⚠️ IMPORTANTE

### Você precisa ter 2 TERMINAIS ABERTOS:

```
Terminal 1: npm start           (Backend)
Terminal 2: ngrok http 3000     (Túnel)
```

Se fechar qualquer um, para de funcionar!

### URL do ngrok MUDA

Toda vez que reiniciar ngrok, a URL muda.

Quando mudar:
1. Copie nova URL do ngrok
2. Atualize no N8N Cloud
3. Salve

---

## 🚀 COMANDOS RESUMIDOS

```bash
# 1. Instalar
brew install ngrok

# 2. Token
ngrok config add-authtoken SEU_TOKEN

# 3. Terminal 1: Backend
cd /Users/drpgjr.../NutriBuddy
npm start

# 4. Terminal 2: ngrok
ngrok http 3000

# 5. Testar
curl https://SUA-URL.ngrok.io/api/health

# 6. Atualizar N8N Cloud
Settings → API_URL → https://SUA-URL.ngrok.io
```

---

## ❓ PROBLEMAS?

### "ngrok: command not found"
```bash
# Instalar novamente
brew install ngrok

# Verificar
ngrok --version
```

### "Failed to start tunnel"
```bash
# Verificar se token foi configurado
ngrok config check

# Reconfigurar
ngrok config add-authtoken SEU_TOKEN
```

### Backend não inicia
```bash
# Verificar se instalou dependências
cd /Users/drpgjr.../NutriBuddy
npm install

# Verificar .env
cat .env

# Iniciar
npm start
```

---

## ✅ QUANDO ESTIVER TUDO RODANDO

Você verá:

**Terminal 1:**
```
🚀 NutriBuddy API Server Running
📍 Port: 3000
📡 Firebase: Connected
```

**Terminal 2:**
```
Session Status    online
Forwarding        https://abc123.ngrok.io -> localhost:3000
```

**N8N Cloud:**
- API_URL: `https://abc123.ngrok.io`
- Workflow: Active ✅

---

🎉 **PRONTO PARA USAR!**

