# 🚨 COMO FAZER TUDO FUNCIONAR AGORA - GUIA COMPLETO

## ❌ PROBLEMA: Os botões não estão funcionando

**Isso acontece porque o BACKEND não está rodando!**

Os botões que adicionamos fazem chamadas para a API (backend), mas se o backend não estiver rodando, nada vai funcionar.

---

## ✅ SOLUÇÃO: 4 PASSOS SIMPLES

### 📍 PASSO 1: Verificar se o backend está rodando

**Abra o terminal e digite:**

```bash
# Verificar se tem algo rodando na porta 3000
curl http://localhost:3000/api/health
```

**Se der erro ou não retornar nada = backend NÃO está rodando!**

---

### 📍 PASSO 2: Configurar o Firebase (se ainda não fez)

#### 2.1 - Verificar se tem o arquivo `.env`

```bash
# No terminal, na pasta NutriBuddy:
ls -la | grep .env
```

**Se não tiver o arquivo `.env`:**

```bash
# Copiar o exemplo:
cp env.example .env
```

#### 2.2 - Configurar o `.env` com as credenciais do Firebase

**Abra o arquivo `.env` e verifique se tem estas linhas:**

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret-aqui
```

**Se não tiver as credenciais do Firebase:**

1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON
4. Abra o JSON e copie:
   - `project_id` → vai para `FIREBASE_PROJECT_ID`
   - `private_key` → vai para `FIREBASE_PRIVATE_KEY`
   - `client_email` → vai para `FIREBASE_CLIENT_EMAIL`

**📚 Guia completo:** Veja `COMO-OBTER-CREDENCIAIS-FIREBASE.md`

---

### 📍 PASSO 3: Instalar dependências (se necessário)

```bash
# No terminal, na pasta NutriBuddy:
npm install
```

**Isso vai instalar todas as bibliotecas necessárias.**

---

### 📍 PASSO 4: Iniciar o backend

```bash
# No terminal, na pasta NutriBuddy:
npm start
```

**Você deve ver algo assim:**

```
=================================
🚀 NutriBuddy API Server Running
📍 Port: 3000
🌍 Environment: development
📡 Firebase: Connected
🔗 http://localhost:3000
🔗 http://localhost:3000/api/health
=================================
```

**✅ Se aparecer "Firebase: Connected" = TUDO OK!**

**⚠️ Se aparecer erro de Firebase = volte no PASSO 2 e configure o `.env`**

---

## 🧪 TESTAR SE ESTÁ FUNCIONANDO

### Teste 1: Health Check

**Abra no navegador:**
```
http://localhost:3000/api/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-...",
  "service": "NutriBuddy API"
}
```

### Teste 2: Ver todas as rotas

**Abra no navegador:**
```
http://localhost:3000/
```

**Deve mostrar todas as rotas disponíveis, incluindo:**
- `/api/prescriber/patients`
- `/api/prescriber/requests`
- `/api/nutrition`
- `/api/meals`
- etc.

---

## 🎯 AGORA TESTE NO FRONTEND

### 1. Abra o frontend (Next.js)

```bash
# Em outro terminal, na pasta frontend:
cd frontend
npm run dev
```

**O frontend vai rodar em:** `http://localhost:3001` (ou outra porta)

**⚠️ IMPORTANTE:** Verifique se a URL da API está configurada corretamente!

**No arquivo `frontend/lib/api.ts`, a linha 4 deve estar assim:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

**Se você quiser mudar a URL da API (ex: se o backend estiver em outro lugar), crie um arquivo `.env.local` na pasta `frontend`:**

```bash
# No terminal, na pasta frontend:
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

**Depois reinicie o frontend:**
```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

### 2. Faça login ou cadastre-se

- **Crie uma conta como PRESCRITOR** (selecione "Sou Prescritor" no cadastro)
- **OU faça login** se já tiver conta

### 3. Teste os botões

Agora quando você clicar nos botões:
- ✅ "Adicionar Paciente" → Vai abrir o modal
- ✅ "Novo Paciente" → Vai navegar para a página de pacientes
- ✅ "Registrar Refeição" → Vai navegar para a página de refeições
- ✅ Etc.

**Se os botões ainda não funcionarem, veja a seção de TROUBLESHOOTING abaixo.**

---

## 🔧 TROUBLESHOOTING (Se ainda não funcionar)

### ❌ Erro: "Cannot find module"

```bash
# Solução:
npm install
```

### ❌ Erro: "Port 3000 already in use"

```bash
# Matar processo na porta 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID [número_do_PID] /F
```

### ❌ Erro: "Firebase not initialized"

1. Verifique se o arquivo `.env` existe
2. Verifique se tem as 3 variáveis do Firebase preenchidas
3. Reinicie o servidor: `npm start`

### ❌ Erro: "CORS error" no frontend

**No arquivo `server.js`, verifique se tem:**

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

**Se não tiver, adicione (ou altere o `.env` para `CORS_ORIGIN=*`)**

### ❌ Botões navegam mas a página não carrega

**Isso pode ser porque:**
1. O frontend não está rodando
2. A rota não existe no frontend

**Solução:**
- Verifique se o frontend está rodando
- Verifique se a página existe (ex: `/meals`, `/prescriber/patients`, etc.)

### ❌ Erro: "Network Error" ou "Failed to fetch"

**Isso significa que:**
- O backend não está rodando OU
- O frontend está tentando acessar uma URL errada

**Solução:**
1. Verifique se o backend está rodando (`npm start`)
2. Verifique no console do navegador qual URL está tentando acessar
3. Verifique se a URL no frontend está correta (deve ser `http://localhost:3000`)

---

## 📋 CHECKLIST COMPLETO

Marque conforme for fazendo:

```
[ ] Backend instalado (npm install)
[ ] Arquivo .env criado
[ ] Firebase configurado no .env
[ ] Backend rodando (npm start)
[ ] Health check funcionando (http://localhost:3000/api/health)
[ ] Frontend rodando (npm run dev no frontend)
[ ] Conta criada/logada
[ ] Testei os botões
[ ] Tudo funcionando! ✅
```

---

## 🎯 RESUMO RÁPIDO (Copiar e Colar)

```bash
# 1. Ir para pasta do projeto
cd NutriBuddy

# 2. Instalar dependências (se não fez)
npm install

# 3. Verificar se tem .env
ls -la | grep .env

# 4. Se não tiver, copiar:
cp env.example .env

# 5. Editar .env com credenciais do Firebase
# (Veja COMO-OBTER-CREDENCIAIS-FIREBASE.md)

# 6. Iniciar backend
npm start

# 7. Em outro terminal, iniciar frontend
cd frontend
npm run dev

# 8. Testar no navegador
# Backend: http://localhost:3000/api/health
# Frontend: http://localhost:3001 (ou porta que aparecer)
```

---

## 📞 SE AINDA NÃO FUNCIONAR

**Me diga qual erro específico está aparecendo e eu te ajudo!**

**Coisas para verificar:**
1. Qual erro aparece no terminal quando roda `npm start`?
2. Qual erro aparece no console do navegador (F12)?
3. O backend está rodando? (teste http://localhost:3000/api/health)
4. O frontend está rodando?

---

## ✅ PRÓXIMOS PASSOS (Depois que funcionar)

1. **Testar cadastro de prescritor**
2. **Adicionar um paciente**
3. **Ver pacientes no dashboard do prescritor**
4. **Testar todas as funcionalidades**

---

**Agora tente de novo seguindo este guia! Se ainda não funcionar, me diga qual erro específico está aparecendo! 💪**

