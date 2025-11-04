# ☁️ Setup Completo N8N Cloud - Passo a Passo

## 🎯 OBJETIVO

Configurar N8N Cloud perfeitamente integrado com NutriBuddy

---

## 📋 PARTE 1: CRIAR CONTA N8N CLOUD

### 1️⃣ Acessar e Criar Conta

1. Acesse: https://n8n.io
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign Up"**
4. Use sua conta Google ou email

**Plano Gratuito inclui:**
- ✅ 500 execuções/mês
- ✅ Workflows ilimitados
- ✅ HTTPS automático
- ✅ Suporte da comunidade

### 2️⃣ Confirmar Email

1. Verifique seu email
2. Clique no link de confirmação
3. Complete o cadastro

### 3️⃣ Acessar Dashboard

URL será algo como:
```
https://[seu-nome].app.n8n.cloud
```

Salve essa URL!

---

## 📋 PARTE 2: IMPORTAR WORKFLOW

### 1️⃣ Criar Novo Workflow

1. No dashboard N8N Cloud, clique em **"Workflows"**
2. Clique em **"+ New"**
3. Clique nos 3 pontinhos **"..."** no canto superior direito
4. Selecione **"Import from File"**

### 2️⃣ Importar N8N-WORKFLOW.json

1. Selecione o arquivo `N8N-WORKFLOW.json` do projeto
2. Clique em **"Open"**
3. O workflow será importado com todos os nós

✅ Você verá 10 nós configurados!

### 3️⃣ Salvar Workflow

1. Clique em **"Save"** (canto superior direito)
2. Nome sugerido: `NutriBuddy API Integration`
3. Adicione descrição se quiser

---

## 📋 PARTE 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 1️⃣ Acessar Settings

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Vá em **"Environment Variables"**
3. Clique em **"+ Add Variable"**

### 2️⃣ Adicionar Variáveis

Adicione estas 3 variáveis:

**Variável 1:**
```
Name: WEBHOOK_SECRET
Value: nutribuddy-secret-2024
```

**Variável 2:**
```
Name: FIREBASE_TOKEN
Value: [seu-token-firebase]
```

**Variável 3:**
```
Name: API_URL
Value: http://localhost:3000
```

⚠️ **IMPORTANTE:** `API_URL` precisa ser uma URL pública!  
Veja seção "EXPOR BACKEND" abaixo.

### 3️⃣ Salvar Variáveis

Clique em **"Save"** após adicionar cada variável.

---

## 📋 PARTE 4: CONFIGURAR WEBHOOK

### 1️⃣ Abrir o Workflow

1. Vá em **"Workflows"**
2. Clique no workflow importado
3. Você verá os nós conectados

### 2️⃣ Configurar Nó Webhook

1. Clique no primeiro nó: **"Webhook - Receber Dados"**
2. Em **"Path"**, deixe: `webhook-nutribuddy`
3. Em **"HTTP Method"**, deixe: `GET`
4. Clique em **"Execute Node"** para testar

### 3️⃣ Obter URL do Webhook

Após executar, você verá a URL:
```
https://[seu-nome].app.n8n.cloud/webhook/webhook-nutribuddy
```

✅ **COPIE ESSA URL!** Você vai usar depois.

---

## 📋 PARTE 5: CONFIGURAR CONEXÃO COM BACKEND

### 🚨 PROBLEMA: Backend localhost não é acessível

N8N Cloud não consegue acessar `http://localhost:3000`  
Você precisa **expor o backend** publicamente.

### SOLUÇÃO 1: Usar ngrok (Rápido para teste)

#### 1️⃣ Instalar ngrok

```bash
# Mac
brew install ngrok

# Windows (baixar de ngrok.com)
# Linux
sudo snap install ngrok
```

#### 2️⃣ Criar conta ngrok

1. Acesse: https://ngrok.com
2. Crie conta gratuita
3. Copie seu token de autenticação

#### 3️⃣ Configurar ngrok

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### 4️⃣ Expor backend

```bash
# Na pasta do projeto
cd NutriBuddy
npm start

# Em outro terminal
ngrok http 3000
```

Você verá algo como:
```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:3000
```

✅ **COPIE A URL `https://abc123xyz.ngrok.io`**

#### 5️⃣ Atualizar variável no N8N

No N8N Cloud:
1. Settings → Environment Variables
2. Edite `API_URL`
3. Mude para: `https://abc123xyz.ngrok.io`
4. Salve

### SOLUÇÃO 2: Deploy Backend na nuvem (Produção)

#### Railway (Recomendado)

1. Acesse: https://railway.app
2. Crie conta (login com GitHub)
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Conecte seu GitHub
5. Faça upload do código NutriBuddy
6. Railway detecta automaticamente e faz deploy
7. Obtenha a URL pública: `https://nutribuddy-xxx.railway.app`
8. Atualize `API_URL` no N8N

#### Render

1. Acesse: https://render.com
2. Crie conta gratuita
3. **"New"** → **"Web Service"**
4. Conecte GitHub ou faça upload
5. Configure:
   - Build: `npm install`
   - Start: `npm start`
6. Adicione variáveis de ambiente (.env)
7. Deploy!
8. URL: `https://nutribuddy.onrender.com`

---

## 📋 PARTE 6: CONFIGURAR NÓS DO WORKFLOW

### 1️⃣ Nó "HTTP Request - NutriBuddy API"

1. Clique no nó
2. **URL**: Deve usar `{{$env.API_URL}}/api/webhook`
3. **Method**: POST
4. **Headers**: 
   - `x-webhook-secret`: `{{$env.WEBHOOK_SECRET}}`
5. Salve

### 2️⃣ Nó "Salvar Nutrição"

1. Clique no nó
2. **URL**: `{{$env.API_URL}}/api/nutrition`
3. **Method**: POST
4. **Headers**:
   - `Authorization`: `Bearer {{$env.FIREBASE_TOKEN}}`
5. Salve

### 3️⃣ Nó "Salvar Refeição"

1. Clique no nó
2. **URL**: `{{$env.API_URL}}/api/meals`
3. **Method**: POST
4. **Headers**:
   - `Authorization`: `Bearer {{$env.FIREBASE_TOKEN}}`
5. Salve

### 4️⃣ Nó "Buscar Nutrição"

1. Clique no nó
2. **URL**: `{{$env.API_URL}}/api/nutrition`
3. **Method**: GET
4. **Headers**:
   - `Authorization`: `Bearer {{$env.FIREBASE_TOKEN}}`
5. Salve

---

## 📋 PARTE 7: ATIVAR WORKFLOW

### 1️⃣ Salvar Tudo

1. Clique em **"Save"** (canto superior direito)
2. Verifique se não há erros

### 2️⃣ Ativar Workflow

1. No canto superior direito, há um toggle **"Inactive/Active"**
2. Clique para mudar para **"Active"**
3. Workflow agora está rodando! 🎉

✅ **Workflow ativo e pronto para receber dados!**

---

## 📋 PARTE 8: TESTAR INTEGRAÇÃO

### Teste 1: Backend Health Check

```bash
curl http://localhost:3000/api/health
# ou
curl https://sua-url.ngrok.io/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-02T10:00:00.000Z",
  "service": "NutriBuddy API"
}
```

### Teste 2: Webhook N8N

```bash
curl -X POST https://seu-nome.app.n8n.cloud/webhook/webhook-nutribuddy \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "data": {"message": "Hello N8N!"}
  }'
```

### Teste 3: Ver Execuções

1. No N8N Cloud, vá em **"Executions"**
2. Você verá as execuções listadas
3. Clique em uma para ver detalhes
4. Verde = sucesso ✅
5. Vermelho = erro ❌

---

## 📋 PARTE 9: OBTER FIREBASE TOKEN

### Opção 1: Usar Firebase Console

1. Acesse: https://console.firebase.google.com
2. Selecione projeto `nutribuddy-2fc9c`
3. Settings → Users and permissions
4. Gere um Custom Token

### Opção 2: Usar Firebase Auth no Frontend

No seu frontend (Google AI Studio):
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  console.log('Token:', token);
  // Use este token
}
```

### Opção 3: Token de teste (DEV ONLY!)

Para desenvolvimento, você pode desabilitar auth temporariamente:

No backend `middleware/auth.js`:
```javascript
const verifyToken = async (req, res, next) => {
  // REMOVER EM PRODUÇÃO!
  if (process.env.NODE_ENV === 'development') {
    req.user = { uid: 'test-user' };
    return next();
  }
  
  // Código normal...
};
```

---

## 📋 PARTE 10: CONFIGURAR CORS

### No Backend (.env)

```env
CORS_ORIGIN=https://seu-nome.app.n8n.cloud
```

Ou para aceitar todos (DEV):
```env
CORS_ORIGIN=*
```

Reinicie o backend:
```bash
npm start
```

---

## 🎯 CHECKLIST FINAL

### Backend
- [ ] npm install completo
- [ ] .env configurado
- [ ] Firebase conectado
- [ ] Backend rodando
- [ ] URL pública (ngrok ou deploy)

### N8N Cloud
- [ ] Conta criada
- [ ] Workflow importado
- [ ] Variáveis configuradas
- [ ] Webhook configurado
- [ ] Workflow ativo
- [ ] Teste realizado

### Integração
- [ ] Backend acessível do N8N
- [ ] CORS configurado
- [ ] Firebase token obtido
- [ ] Teste webhook OK
- [ ] Execuções aparecendo

---

## 🔧 TROUBLESHOOTING

### N8N não consegue acessar backend

**Erro:** `ECONNREFUSED` ou `timeout`

**Solução:**
1. Backend precisa estar em URL pública
2. Use ngrok ou deploy na nuvem
3. Verifique firewall

### Webhook retorna 401

**Erro:** `Unauthorized`

**Solução:**
1. Verifique `WEBHOOK_SECRET` no .env
2. Mesmo valor no N8N
3. Header `x-webhook-secret` correto

### Firebase token inválido

**Erro:** `Invalid token`

**Solução:**
1. Token expirou (gere novo)
2. Token incorreto (copie novamente)
3. Firebase não configurado corretamente

### CORS Error

**Erro:** `Access-Control-Allow-Origin`

**Solução:**
```env
# Backend .env
CORS_ORIGIN=*
```

---

## 📊 MONITORAMENTO

### Ver Execuções

1. N8N Cloud → **"Executions"**
2. Lista todas as execuções
3. Verde = sucesso
4. Vermelho = erro (clique para ver detalhes)

### Ver Logs

1. Clique em uma execução
2. Veja cada nó
3. Input/Output de cada etapa
4. Identifique problemas

### Alertas

Configure no N8N:
1. Settings → Notifications
2. Email quando falhar
3. Webhook para Slack/Discord

---

## 🚀 URLS IMPORTANTES

Salve estas URLs:

```
N8N Dashboard:
https://[seu-nome].app.n8n.cloud

N8N Webhook:
https://[seu-nome].app.n8n.cloud/webhook/webhook-nutribuddy

Backend (ngrok):
https://[xxxxx].ngrok.io

Backend (Railway):
https://nutribuddy-xxx.railway.app

Firebase Console:
https://console.firebase.google.com/project/nutribuddy-2fc9c
```

---

## ✅ CONFIGURAÇÃO CONCLUÍDA!

Você agora tem:
- ✅ N8N Cloud configurado
- ✅ Workflow ativo
- ✅ Backend conectado
- ✅ Webhooks funcionando
- ✅ Integração completa

**Próximo passo:** Configurar frontend no Google AI Studio!

---

## 📞 PRECISA DE AJUDA?

- N8N Community: https://community.n8n.io
- Documentação: https://docs.n8n.io
- Firebase: https://firebase.google.com/docs

---

**Setup completo! Agora teste e divirta-se! 🎉**

