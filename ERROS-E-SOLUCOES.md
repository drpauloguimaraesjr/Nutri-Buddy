# 🆘 ERROS COMUNS E SOLUÇÕES RÁPIDAS

## 🔴 ERRO: "Cannot find module"

```
Error: Cannot find module './routes/prescriber'
```

### ✅ Solução:

```bash
# Reinstalar dependências
npm install

# Reiniciar servidor
npm start
```

---

## 🔴 ERRO: "Port 3000 already in use"

```
Error: listen EADDRINUSE: address already in use :::3000
```

### ✅ Solução A: Matar processo

```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Depois:
npm start
```

### ✅ Solução B: Mudar porta

```bash
# Editar .env:
PORT=3001

# Reiniciar:
npm start
```

---

## 🔴 ERRO: "Firebase not initialized"

```
Error: Firebase Admin SDK not initialized
```

### ✅ Solução:

```bash
# 1. Verificar se existe:
ls config/firebase.js

# 2. Verificar credenciais:
ls credentials/serviceAccountKey.json
# OU verificar .env tem FIREBASE_* variáveis

# 3. Se não existir, baixar do Firebase Console:
https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk
```

---

## 🔴 ERRO: "No token provided"

```json
{
  "error": "No token provided",
  "message": "Authentication required"
}
```

### ✅ Solução:

Você precisa estar autenticado. Opções:

**A) Usar webhook secret (para testes):**
```bash
curl -H "x-webhook-secret: SEU_SECRET_AQUI" \
  http://localhost:3000/api/prescriber/patients
```

**B) Usar token Firebase:**
```bash
# 1. Fazer login no frontend
# 2. Abrir DevTools (F12)
# 3. Application → Local Storage → pegar token
# 4. Usar:
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/prescriber/patients
```

---

## 🔴 ERRO: "Forbidden - Role mismatch"

```json
{
  "error": "Forbidden",
  "message": "Role mismatch. Required: prescriber, You have: patient"
}
```

### ✅ Solução:

Você está tentando acessar rota errada!

- **Paciente** só pode acessar `/api/patient/*`
- **Prescritor** só pode acessar `/api/prescriber/*`

**Verificar seu role:**
```bash
# DevTools → Application → Local Storage → user data
# Ou fazer request:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/user
```

---

## 🔴 ERRO: "Connection already exists"

```json
{
  "success": false,
  "error": "Connection already exists with status: pending"
}
```

### ✅ Solução:

O prescritor já enviou convite para esse paciente.

**Opções:**
1. Paciente aceitar/rejeitar o convite pendente
2. Ver convites: `GET /api/patient/connections`
3. Aceitar: `POST /api/patient/connections/:id/accept`

---

## 🔴 ERRO: "No active connection with this patient"

```json
{
  "success": false,
  "error": "No active connection with this patient"
}
```

### ✅ Solução:

Prescritor tentou criar plano para paciente não vinculado.

**Fluxo correto:**
```
1. Prescritor envia convite
   POST /api/prescriber/patients/invite
   
2. Paciente aceita
   POST /api/patient/connections/:id/accept
   
3. Agora prescritor pode criar plano
   POST /api/prescriber/dietPlans
```

---

## 🔴 ERRO: Regras do Firestore não funcionam

```
Error: Missing or insufficient permissions
```

### ✅ Solução:

```bash
1. Verificar se aplicou as regras:
   https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore/rules

2. Aguardar 1-2 minutos para propagar

3. Limpar cache do navegador:
   Ctrl+Shift+Delete → Limpar tudo

4. Testar em aba anônima

5. Verificar no console se publicou:
   - Deve aparecer data/hora da última publicação
   - Status: "Publicado"
```

---

## 🔴 ERRO: "Patient not found"

```json
{
  "success": false,
  "error": "Patient not found. Make sure the user is registered as a patient."
}
```

### ✅ Solução:

O email não existe ou não é paciente.

**Verificar:**
```bash
1. Paciente criou conta?
   - http://localhost:3001/register
   - Escolheu "Sou Paciente/Usuário"

2. Verificar no Firestore:
   - Console → users collection
   - Procurar pelo email
   - Ver campo "role" = "patient"
```

---

## 🔴 ERRO: Frontend não conecta no backend

```
Network Error / CORS Error
```

### ✅ Solução A: CORS

```javascript
// server.js deve ter:
app.use(cors({
  origin: '*',  // ou 'http://localhost:3001'
  credentials: true
}));
```

### ✅ Solução B: URL errada

```typescript
// frontend/lib/api.ts ou similar
const API_URL = 'http://localhost:3000/api'  // Correto
const API_URL = 'http://localhost:3001/api'  // ERRADO!
```

---

## 🔴 ERRO: "Invalid token"

```json
{
  "error": "Invalid token",
  "message": "Authentication failed"
}
```

### ✅ Solução:

Token expirou ou é inválido.

```bash
# 1. Fazer logout
# 2. Fazer login novamente
# 3. Pegar novo token

# Token Firebase expira em 1 hora por padrão
```

---

## 🔴 ERRO: N8N não funciona mais

```
N8N webhook returning 401
```

### ✅ Solução:

N8N CONTINUA funcionando! Use webhook secret:

```javascript
// No N8N HTTP Request:
Headers: {
  "x-webhook-secret": "SEU_SECRET_DO_.ENV"
}

// Isso bypassa a verificação de roles
```

---

## 🔴 ERRO: npm start não funciona

```
Error: Cannot find module 'express'
```

### ✅ Solução:

```bash
# Instalar dependências
npm install

# Se persistir:
rm -rf node_modules
rm package-lock.json
npm install

# Depois:
npm start
```

---

## 🔴 ERRO: "Cannot read property 'role' of undefined"

```
TypeError: Cannot read property 'role' of undefined
```

### ✅ Solução:

Usuário não tem campo `role` no Firestore.

```bash
# 1. Ver no Firestore Console:
https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore

# 2. Collection: users
# 3. Seu documento (uid)
# 4. Adicionar campo: role = "patient" ou "prescriber"

# OU

# Criar nova conta no /register
# Ela já vai ter o campo role
```

---

## 🔴 ERRO: Modal/popup não funciona no frontend

```
TypeScript: Cannot find name 'useState' or similar
```

### ✅ Solução:

```bash
cd frontend
npm install
npm run dev
```

---

## 🟡 AVISO: "WhatsApp Handler não pôde ser inicializado"

```
⚠️ WhatsApp Handler não pôde ser inicializado
```

### ✅ Isso é NORMAL!

Não impede nada de funcionar. WhatsApp é opcional.

Para ativar WhatsApp:
- Veja `GUIA-WHATSAPP-COMPLETO.md`

---

## 📊 VERIFICAR STATUS DO SISTEMA

### ✅ Backend OK se mostrar:

```
=================================
🚀 NutriBuddy API Server Running
📍 Port: 3000
🌍 Environment: development
📡 Firebase: Connected
🔗 http://localhost:3000
=================================
```

### ✅ Firestore Rules OK se:

```
Firebase Console → Rules → 
Status: Publicado
Data: (recente)
```

### ✅ Rotas OK se retornar JSON:

```bash
curl http://localhost:3000/api/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "...",
  "service": "NutriBuddy API"
}
```

---

## 🔧 COMANDOS ÚTEIS PARA DEBUG

```bash
# Ver logs do servidor em tempo real
tail -f logs/app.log

# Testar health check
curl http://localhost:3000/api/health

# Ver rotas disponíveis
curl http://localhost:3000/

# Verificar porta em uso
lsof -i :3000

# Ver processos Node rodando
ps aux | grep node

# Matar todos processos Node (cuidado!)
pkill -f node
```

---

## 📞 AINDA COM PROBLEMAS?

### 1. Checar logs:
```bash
# Ver últimas 50 linhas
tail -50 logs/app.log

# Ou rodar em modo dev pra ver console
npm run dev
```

### 2. Verificar variáveis de ambiente:
```bash
cat .env
# Deve ter: FIREBASE_*, PORT, WEBHOOK_SECRET
```

### 3. Testar backend isolado:
```bash
# Sem frontend, só backend
node server.js
# Deve iniciar sem erros
```

### 4. Verificar Firebase:
```bash
# Ver se credenciais existem
ls credentials/serviceAccountKey.json
```

---

## ✅ CHECKLIST DE DEBUG

Se algo não funcionar, verificar na ordem:

```
[ ] Backend está rodando? (npm start)
[ ] Porta 3000 livre?
[ ] Firebase conectado? (ver logs)
[ ] Regras do Firestore aplicadas?
[ ] Usuário tem campo 'role'?
[ ] Token é válido? (não expirou)
[ ] URL da API está correta?
[ ] CORS configurado?
[ ] Dependencies instaladas? (npm install)
```

---

**Se persistir o erro, copie a mensagem exata e me avise!** 💪



