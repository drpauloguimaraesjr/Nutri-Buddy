# 🚀 TWILIO WHATSAPP - DEPLOY RAILWAY

## 🎯 **OBJETIVO**

Fazer deploy do código backend com integração Twilio no Railway e configurar webhooks.

---

## ⏱️ **TEMPO ESTIMADO**

- ✅ **Adicionar variáveis Railway:** 3 min
- ✅ **Integrar código ao backend:** 10 min
- ✅ **Deploy backend:** 5 min
- ✅ **Configurar webhooks Twilio:** 5 min
- ✅ **Testar integração:** 5 min

**Total: ~30 min**

---

## 📋 **PRÉ-REQUISITOS**

Antes de começar, você deve ter:

- ✅ Conta Twilio criada (ver TWILIO-SETUP-COMPLETO.md)
- ✅ WhatsApp Sandbox configurado OU API aprovada pela Meta
- ✅ Credenciais Twilio anotadas:
  ```
  TWILIO_ACCOUNT_SID=AC...
  TWILIO_AUTH_TOKEN=...
  TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
  ```
- ✅ Backend rodando no Railway
- ✅ URL do backend Railway: `https://web-production-c9eaf.up.railway.app`

---

## 📋 **FASE 1: CONFIGURAR VARIÁVEIS RAILWAY (3 min)**

### **Passo 1: Acessar Railway Dashboard**

1. Abrir: https://railway.app

2. **Login** com sua conta

3. **Selecionar** projeto do backend NutriBuddy

### **Passo 2: Adicionar Variáveis de Ambiente**

1. No projeto, clicar: **Variables** (menu lateral)

2. **Clicar:** + New Variable (ou Raw Editor)

### **Passo 3: Adicionar Variáveis Twilio**

Adicionar as seguintes variáveis:

#### **Variável 1: TWILIO_ACCOUNT_SID**

```
Name: TWILIO_ACCOUNT_SID
Value: AC1234567890abcdef...
```

**⚠️ Colar seu Account SID real do Twilio Dashboard**

#### **Variável 2: TWILIO_AUTH_TOKEN**

```
Name: TWILIO_AUTH_TOKEN
Value: 1234567890abcdef...
```

**⚠️ Colar seu Auth Token real do Twilio Dashboard**

#### **Variável 3: TWILIO_WHATSAPP_NUMBER**

**Durante desenvolvimento (Sandbox):**
```
Name: TWILIO_WHATSAPP_NUMBER
Value: whatsapp:+14155238886
```

**Em produção (após aprovação Meta):**
```
Name: TWILIO_WHATSAPP_NUMBER
Value: whatsapp:+5511999999999
```

**⚠️ IMPORTANTE:**
- Sempre com prefixo `whatsapp:`
- Sempre com `+` antes do código do país
- Formato: `whatsapp:+[código_país][ddd][número]`

### **Passo 4: Salvar e Redeploy**

1. **Clicar:** Save Variables (ou sair do editor)

2. Railway vai fazer **redeploy automático** (~2 minutos)

3. **Aguardar** deploy concluir

4. **Ver logs:** Procurar por:
   ```
   📱 Twilio WhatsApp: Configured ✅
      From: whatsapp:+14155238886
   ```

Se aparecer essa mensagem, variáveis estão OK! ✅

---

## 📋 **FASE 2: INTEGRAR CÓDIGO BACKEND (15 min)**

### **Opção A: Projeto Novo (sem backend ainda)**

Se você ainda não tem backend, siga estes passos:

#### **1. Criar estrutura básica**

```bash
# No seu terminal local
mkdir nutribuddy-backend
cd nutribuddy-backend

# Inicializar projeto Node.js
npm init -y

# Instalar dependências
npm install express twilio firebase-admin cors dotenv

# Instalar dev dependencies
npm install --save-dev nodemon
```

#### **2. Criar arquivo server.js**

```bash
touch server.js
```

**Copiar código de `TWILIO-BACKEND-CODE.js` e adaptar para sua estrutura**

Estrutura básica:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // IMPORTANTE para webhooks Twilio!

// Importar código Twilio
// (cole o código de TWILIO-BACKEND-CODE.js aqui)

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'NutriBuddy Backend running',
    twilio: 'configured'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

#### **3. Configurar package.json**

Adicionar script start:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### **4. Criar .gitignore**

```bash
touch .gitignore
```

Conteúdo:

```
node_modules/
.env
.DS_Store
```

#### **5. Conectar ao Railway**

```bash
# Inicializar git
git init
git add .
git commit -m "Initial commit with Twilio integration"

# Criar repositório no GitHub (ou usar Railway CLI)
# Depois conectar ao Railway via Dashboard
```

No Railway Dashboard:
1. New Project → Deploy from GitHub
2. Selecionar repositório
3. Deploy!

---

### **Opção B: Adicionar ao Backend Existente**

Se você já tem backend rodando:

#### **1. Instalar dependência Twilio**

No seu projeto backend:

```bash
npm install twilio
```

Commitar:

```bash
git add package.json package-lock.json
git commit -m "Add Twilio dependency"
```

#### **2. Criar arquivo whatsapp-service.js**

```bash
# Na pasta do backend
touch whatsapp-service.js
```

**Copiar conteúdo de `TWILIO-BACKEND-CODE.js`**

#### **3. Importar no server.js principal**

No seu `server.js` ou `index.js`:

```javascript
// No topo do arquivo
const {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppTemplate
} = require('./whatsapp-service');

// Suas rotas existentes continuam aqui...

// Adicionar rotas WhatsApp (já estão no whatsapp-service.js)
```

OU, se preferir manter separado:

```javascript
// Importar rotas WhatsApp
const whatsappRoutes = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/webhooks', whatsappRoutes);
```

#### **4. Verificar middleware urlencoded**

**IMPORTANTE:** Twilio envia dados como `application/x-www-form-urlencoded`

No seu `server.js`, verificar se tem:

```javascript
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: true })); // Form data (Twilio!)
```

#### **5. Commit e Push**

```bash
git add .
git commit -m "Add Twilio WhatsApp integration"
git push origin main
```

#### **6. Aguardar Deploy Railway**

Railway vai detectar push e fazer deploy automático (~2-3 min)

Acompanhar logs no Railway Dashboard.

---

## 📋 **FASE 3: VERIFICAR DEPLOY (5 min)**

### **Passo 1: Verificar Logs Railway**

1. Railway Dashboard → Seu projeto

2. Clicar em: **Deployments** (últimos deploys)

3. Clicar no deploy mais recente

4. Ver **Logs** em tempo real

**Procurar por:**

```
✅ Sucesso:
📱 Twilio WhatsApp: Configured ✅
   From: whatsapp:+14155238886
🚀 Servidor rodando na porta 3000

❌ Erro (se aparecer):
❌ ERRO: Variáveis Twilio não configuradas!
   → Voltar FASE 1 e configurar variáveis
```

### **Passo 2: Testar Endpoint de Status**

**Abrir no navegador ou usar cURL:**

```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status
```

**Resposta esperada:**

```json
{
  "service": "NutriBuddy WhatsApp Twilio",
  "status": "configured",
  "twilioConfigured": true,
  "twilioStatus": "active",
  "accountInfo": {
    "friendlyName": "Seu Nome/Empresa",
    "status": "active",
    "type": "Full"
  },
  "whatsappNumber": "whatsapp:+14155238886",
  "isSandbox": true
}
```

Se retornar isso, está **funcionando!** ✅

### **Passo 3: Testar Envio de Mensagem**

**⚠️ ATENÇÃO:** Se estiver usando Sandbox, você precisa ter feito "join [código]" antes!

**Teste via cURL:**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "message": "🎉 Teste Twilio NutriBuddy funcionando!"
  }'
```

**Substituir `+5511999999999` pelo seu número WhatsApp que fez join no Sandbox**

**Resposta esperada:**

```json
{
  "success": true,
  "messageId": "SM1234567890abcdef...",
  "status": "queued",
  "message": "Mensagem enviada com sucesso",
  "to": "whatsapp:+5511999999999"
}
```

**Verificar WhatsApp:** Você deve receber a mensagem! 🎉

---

## 📋 **FASE 4: CONFIGURAR WEBHOOKS TWILIO (5 min)**

### **O que são Webhooks?**

Webhooks permitem que Twilio **envie mensagens recebidas** para o seu backend.

### **Passo 1: Acessar Twilio Console**

1. Abrir: https://console.twilio.com

2. **Login** com sua conta

### **Passo 2: Configurar Webhook (Sandbox)**

**Se estiver usando Sandbox:**

1. Menu: **Messaging** → **Try it out** → **Send a WhatsApp message**

   OU

   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. Role para baixo até: **"Sandbox Configuration"**

3. Preencher:

   **When a message comes in:**
   ```
   URL: https://web-production-c9eaf.up.railway.app/api/webhooks/twilio-whatsapp
   Method: POST
   ```

4. **Clicar:** Save

### **Passo 3: Configurar Webhook (Produção)**

**Se já tem número oficial conectado:**

1. Menu: **Phone Numbers** → **Manage** → **Active numbers**

   OU

   https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

2. **Clicar** no seu número WhatsApp (ex: +5511999999999)

3. Role até: **Messaging Configuration**

4. Preencher:

   **A MESSAGE COMES IN:**
   ```
   Webhook: https://web-production-c9eaf.up.railway.app/api/webhooks/twilio-whatsapp
   HTTP POST
   ```

   **STATUS CALLBACK URL (opcional):**
   ```
   Webhook: https://web-production-c9eaf.up.railway.app/api/webhooks/twilio-status
   HTTP POST
   ```

5. **Clicar:** Save

### **Passo 4: Testar Webhook**

**Enviar mensagem pelo WhatsApp para o número Twilio:**

1. Abrir WhatsApp

2. Abrir conversa com número Twilio (Sandbox ou seu número oficial)

3. Enviar mensagem:
   ```
   Teste de webhook! 📩
   ```

4. **Verificar logs Railway:**

   Railway Dashboard → Seu projeto → Logs

   Procurar por:
   ```
   📩 Webhook Twilio recebido:
   {
     "MessageSid": "SM...",
     "From": "whatsapp:+5511999999999",
     "Body": "Teste de webhook! 📩",
     ...
   }
   ✅ Mensagem processada com sucesso
   ```

Se aparecer isso, webhook está **funcionando!** ✅

---

## 📋 **FASE 5: TESTES COMPLETOS (10 min)**

### **Teste 1: Enviar Mensagem de Texto**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "message": "Teste 1: Mensagem de texto ✅"
  }'
```

✅ Deve receber no WhatsApp

### **Teste 2: Enviar Imagem**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "imageUrl": "https://picsum.photos/400/300",
    "caption": "Teste 2: Imagem com legenda 📷"
  }'
```

✅ Deve receber imagem com legenda

### **Teste 3: Receber Mensagem (Webhook)**

1. Enviar mensagem pelo WhatsApp para número Twilio:
   ```
   Teste 3: Recebimento 📩
   ```

2. Verificar logs Railway

3. Verificar se mensagem foi salva no Firestore (se implementado)

✅ Logs devem mostrar processamento

### **Teste 4: Enviar Imagem via WhatsApp**

1. Enviar imagem pelo WhatsApp para número Twilio

2. Verificar logs Railway:
   ```
   📩 Webhook Twilio recebido:
   {
     ...
     "NumMedia": "1",
     "MediaUrl0": "https://...",
     "MediaContentType0": "image/jpeg"
   }
   ```

✅ Logs devem mostrar mídia recebida

### **Teste 5: Health Check**

```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status
```

✅ Deve retornar status configured

---

## 📋 **TROUBLESHOOTING**

### **Problema: Variáveis não aparecem nos logs**

**Sintomas:**
```
❌ ERRO: Variáveis Twilio não configuradas!
```

**Solução:**
1. Railway Dashboard → Variables
2. Verificar se variáveis estão corretas
3. Redeploy manual: Deployments → three dots → Redeploy

---

### **Problema: Erro "Invalid Auth Token"**

**Sintomas:**
```
❌ Erro ao enviar mensagem Twilio: [HTTP 401] Unable to create record
```

**Solução:**
1. Verificar `TWILIO_AUTH_TOKEN` no Railway
2. Copiar novamente do Twilio Console (pode ter expirado)
3. Atualizar variável no Railway
4. Redeploy

---

### **Problema: Webhook não recebe mensagens**

**Sintomas:**
- Envio funciona
- Recebimento não funciona
- Nada aparece nos logs

**Solução:**
1. Verificar URL webhook no Twilio Console
2. Verificar se URL está correta (https://...)
3. Verificar se método é **POST**
4. Testar URL manualmente:
   ```bash
   curl -X POST https://web-production-c9eaf.up.railway.app/api/webhooks/twilio-whatsapp
   ```
5. Verificar middleware `express.urlencoded({ extended: true })`

---

### **Problema: "Missing required parameter 'From'"**

**Sintomas:**
```
❌ Error code: 21603
```

**Solução:**
1. Verificar `TWILIO_WHATSAPP_NUMBER` no Railway
2. Deve ter prefixo `whatsapp:`
3. Formato correto: `whatsapp:+14155238886`

---

### **Problema: "To number is not a valid WhatsApp number"**

**Sintomas:**
```
❌ Error code: 63007
```

**Soluções:**

**Se estiver usando Sandbox:**
- Verificar se número destino fez "join [código]" no Sandbox
- Máximo 5 números podem usar Sandbox

**Se estiver usando produção:**
- Verificar se número destino tem WhatsApp
- Formato correto: `+5511999999999` (com + e código país)

---

### **Problema: Deploy falha no Railway**

**Sintomas:**
- Build error
- Deploy failed

**Solução:**
1. Verificar logs de build no Railway
2. Verificar `package.json` tem todas as dependências:
   ```json
   {
     "dependencies": {
       "express": "^4.18.0",
       "twilio": "^5.0.0",
       "firebase-admin": "^12.0.0",
       "cors": "^2.8.5"
     }
   }
   ```
3. Verificar script `start` no package.json:
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

---

### **Problema: Rate Limit / Too Many Requests**

**Sintomas:**
```
❌ Error code: 20429
```

**Solução:**
- Twilio tem rate limits
- Aguardar alguns minutos
- Implementar retry logic no código
- Considerar upgrade de plano Twilio

---

## 📊 **MONITORAMENTO**

### **Dashboard Twilio**

**Ver todas mensagens:**

1. Twilio Console → Monitor → Logs → **Messaging**

2. Ver:
   - ✅ Mensagens enviadas (sent, delivered, read)
   - ❌ Mensagens com erro (failed, undelivered)
   - 💰 Custo de cada mensagem

### **Logs Railway**

**Ver logs em tempo real:**

1. Railway Dashboard → Seu projeto

2. Clicar no service (backend)

3. **Observability** → **Logs**

4. Procurar por:
   - `✅ Mensagem enviada via Twilio`
   - `📩 Webhook Twilio recebido`
   - `❌ Erro ao enviar mensagem`

### **Alerts (Opcional)**

**Configurar alertas no Railway:**

1. Settings → Webhooks

2. Adicionar webhook para Slack/Discord/Email

3. Receber notificações de:
   - Deploy failed
   - Service crashed
   - High memory usage

---

## ✅ **CHECKLIST FINAL**

### **Railway:**
- [ ] Variáveis Twilio configuradas
- [ ] Deploy concluído com sucesso
- [ ] Logs mostram "Configured ✅"
- [ ] Endpoint /status retorna configured

### **Backend:**
- [ ] Dependência twilio instalada
- [ ] Código integrado ao server.js
- [ ] Middleware urlencoded configurado
- [ ] Rotas WhatsApp funcionando

### **Webhooks:**
- [ ] Webhook mensagens configurado no Twilio
- [ ] Webhook status configurado (opcional)
- [ ] URL Railway correta
- [ ] Método POST selecionado

### **Testes:**
- [ ] Teste envio texto OK
- [ ] Teste envio imagem OK
- [ ] Teste receber mensagem OK
- [ ] Teste receber imagem OK
- [ ] Health check OK

### **Firestore (se aplicável):**
- [ ] Mensagens sendo salvas
- [ ] Conversas sendo atualizadas
- [ ] Busca de paciente funcionando

---

## 🎉 **PRONTO!**

Agora você tem:

- ✅ Backend com Twilio deployado no Railway
- ✅ Variáveis configuradas
- ✅ Webhooks funcionando
- ✅ Envio e recebimento de mensagens OK

### **Próximos passos:**

📄 **TWILIO-1-ENVIAR-MENSAGENS.json** - Importar workflow N8N

📄 **TWILIO-MIGRACAO-CHECKLIST.md** - Checklist completo de migração

---

**Parabéns! Backend Twilio está no ar! 🚀**

*Quando Meta aprovar sua conta, é só trocar `TWILIO_WHATSAPP_NUMBER` para seu número oficial!* 🎉

