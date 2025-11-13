# 🚀 GUIA COMPLETO - DEPLOY RAILWAY COM Z-API

## 📋 **OBJETIVO**

Fazer o deploy completo do backend NutriBuddy no Railway com integração Z-API funcionando.

**Tempo estimado: 20 minutos**

---

## ✅ **PRÉ-REQUISITOS**

Antes de começar, você precisa ter:

- [ ] Conta Railway criada (railway.app)
- [ ] Projeto backend no GitHub
- [ ] Conta Z-API criada (z-api.io)
- [ ] Credenciais Z-API (INSTANCE_ID e TOKEN)
- [ ] Firebase configurado

---

## 📦 **PASSO 1: PREPARAR CÓDIGO BACKEND**

### **1.1. Adicionar arquivos ao projeto**

Copie os seguintes arquivos para a pasta do seu backend:

```
backend/
├── server.js (arquivo principal)
├── whatsapp-service.js ✅ NOVO
├── whatsapp-routes.js ✅ NOVO
├── package.json
└── .env.example
```

### **1.2. Atualizar package.json**

Adicione a dependência `axios` (se ainda não tiver):

```json
{
  "name": "nutribuddy-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "firebase-admin": "^11.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### **1.3. Integrar rotas no server.js**

Adicione estas linhas no seu `server.js`:

```javascript
// ==========================================
// IMPORTS
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// ROTAS WHATSAPP (Z-API) ✅ ADICIONAR
// ==========================================
const whatsappRoutes = require('./whatsapp-routes');
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/webhooks', whatsappRoutes);

// ==========================================
// SUAS ROTAS EXISTENTES
// ==========================================
// ... suas outras rotas ...

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'NutriBuddy Backend',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📱 Z-API configurado: ${!!process.env.ZAPI_INSTANCE_ID}`);
});
```

### **1.4. Criar arquivo .env.example**

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://seu-frontend.vercel.app

# Z-API Configuration (WhatsApp)
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io
```

---

## 🚂 **PASSO 2: CONFIGURAR NO RAILWAY**

### **2.1. Acessar Railway**

1. Ir para: https://railway.app
2. Login com GitHub
3. Abrir seu projeto existente (ou criar novo)

### **2.2. Conectar repositório GitHub**

Se ainda não conectou:

```
1. New Project → Deploy from GitHub repo
2. Selecionar repositório do backend
3. Deploy automático
```

### **2.3. Configurar variáveis de ambiente**

No Railway Dashboard:

```
1. Selecionar o serviço (backend)
2. Clicar em "Variables"
3. Adicionar TODAS as variáveis abaixo
```

#### **Variáveis obrigatórias:**

```bash
# ==========================================
# FIREBASE
# ==========================================
FIREBASE_PROJECT_ID=nutribuddy-12345
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-12345.iam.gserviceaccount.com

# ==========================================
# SERVER
# ==========================================
PORT=3000
NODE_ENV=production

# ==========================================
# CORS
# ==========================================
CORS_ORIGIN=https://seu-frontend.vercel.app

# ==========================================
# Z-API (WHATSAPP) ✅ ADICIONAR
# ==========================================
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io
```

#### **⚠️ IMPORTANTE: Como obter as credenciais Z-API**

1. **ZAPI_INSTANCE_ID:**
   - Acessar: https://z-api.io/dashboard
   - Clicar na sua instância
   - Copiar o ID (número, ex: 12345)

2. **ZAPI_TOKEN:**
   - Na mesma página da instância
   - Copiar o Token (alfanumérico longo)

3. **ZAPI_BASE_URL:**
   - Sempre: `https://api.z-api.io`

### **2.4. Exemplo de preenchimento no Railway**

```
┌────────────────────────────────────────────────┐
│ Railway Variables                              │
├────────────────────────────────────────────────┤
│ Name: ZAPI_INSTANCE_ID                        │
│ Value: 12345                                  │
├────────────────────────────────────────────────┤
│ Name: ZAPI_TOKEN                              │
│ Value: ABC123XYZ789                           │
├────────────────────────────────────────────────┤
│ Name: ZAPI_BASE_URL                           │
│ Value: https://api.z-api.io                   │
└────────────────────────────────────────────────┘
```

---

## 🔧 **PASSO 3: DEPLOY**

### **3.1. Fazer commit das mudanças**

No seu terminal local:

```bash
# Adicionar novos arquivos
git add .

# Commit
git commit -m "feat: Adicionar integração Z-API WhatsApp com QR Code"

# Push (Railway faz deploy automático)
git push origin main
```

### **3.2. Acompanhar deploy**

No Railway:

```
1. Abas "Deployments"
2. Ver logs em tempo real
3. Aguardar: ✅ SUCCESS
```

### **3.3. Verificar logs**

Procurar por estas mensagens:

```
✅ Servidor rodando na porta 3000
📱 Z-API configurado: true
```

Se aparecer `Z-API configurado: false`, verificar variáveis de ambiente.

---

## 🧪 **PASSO 4: TESTAR ENDPOINTS**

### **4.1. Obter URL do Railway**

No Railway Dashboard:

```
1. Aba "Settings"
2. "Domains"
3. Copiar URL (ex: https://web-production-c9eaf.up.railway.app)
```

### **4.2. Testar Health Check**

```bash
curl https://web-production-c9eaf.up.railway.app/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "service": "NutriBuddy Backend",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### **4.3. Testar WhatsApp Status**

```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status
```

Resposta esperada:
```json
{
  "success": true,
  "connected": false,
  "phone": null,
  "state": "close",
  "instanceId": "12345"
}
```

### **4.4. Testar QR Code**

Abrir no navegador:
```
https://web-production-c9eaf.up.railway.app/api/whatsapp/qrcode
```

Deve aparecer uma imagem PNG do QR Code.

### **4.5. Testar envio de mensagem**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Teste Z-API NutriBuddy!"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "messageId": "ABC123...",
  "message": "Mensagem enviada com sucesso"
}
```

---

## 🔗 **PASSO 5: CONFIGURAR WEBHOOKS Z-API**

### **5.1. Webhook de mensagens recebidas**

No Dashboard Z-API (https://z-api.io):

```
1. Sua instância → Webhooks
2. Ativar "Mensagens recebidas"
3. URL: https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp
4. Method: POST
5. Eventos:
   ✅ message-received
6. Salvar
```

### **5.2. Webhook de status da conexão**

Na mesma página:

```
1. Ativar "Status de conexão"
2. URL: https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-status
3. Method: POST
4. Eventos:
   ✅ connection.update
   ✅ qrcode.updated
5. Salvar
```

### **5.3. Testar webhooks**

No Z-API Dashboard:

```
1. Webhooks → Testar
2. Enviar evento de teste
3. Verificar se retornou 200 OK
```

Nos logs do Railway, deve aparecer:
```
📩 Webhook Z-API recebido: {...}
```

---

## 🌐 **PASSO 6: ATUALIZAR FRONTEND**

### **6.1. Variáveis de ambiente do frontend**

No Vercel (ou onde seu frontend está hospedado):

```bash
# .env.production
REACT_APP_API_URL=https://web-production-c9eaf.up.railway.app
```

### **6.2. Rebuild frontend**

```bash
# Se estiver no Vercel
# Vai automaticamente rebuild quando fizer push

# Se estiver local
npm run build
```

---

## 🐛 **TROUBLESHOOTING**

### **❌ Erro: "ZAPI_INSTANCE_ID is not defined"**

**Solução:**
1. Verificar se variáveis estão no Railway
2. Redeploy o serviço
3. Verificar logs

### **❌ Erro: "401 Unauthorized" ao chamar Z-API**

**Solução:**
1. Verificar se ZAPI_TOKEN está correto
2. Copiar novamente do Dashboard Z-API
3. Atualizar no Railway
4. Redeploy

### **❌ QR Code não aparece**

**Solução:**
1. Verificar endpoint `/api/whatsapp/qrcode` diretamente
2. Ver logs do Railway
3. Verificar se instância Z-API está ativa

### **❌ Webhook não chega**

**Solução:**
1. Verificar URL do webhook no Z-API
2. Testar endpoint manualmente:
   ```bash
   curl -X POST https://sua-url/api/webhooks/zapi-whatsapp \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
3. Ver logs do Railway

### **❌ CORS Error no frontend**

**Solução:**
1. Adicionar variável CORS_ORIGIN no Railway:
   ```
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```
2. Redeploy

---

## ✅ **CHECKLIST DE DEPLOY**

### **Código:**
- [ ] Arquivos copiados (whatsapp-service.js, whatsapp-routes.js)
- [ ] server.js atualizado com rotas WhatsApp
- [ ] package.json com axios
- [ ] Código commitado e pushed

### **Railway:**
- [ ] Variáveis de ambiente configuradas (Firebase)
- [ ] Variáveis Z-API adicionadas (INSTANCE_ID, TOKEN, BASE_URL)
- [ ] CORS_ORIGIN configurado
- [ ] Deploy SUCCESS
- [ ] Logs sem erros

### **Testes:**
- [ ] /health retorna 200 OK
- [ ] /api/whatsapp/status retorna status
- [ ] /api/whatsapp/qrcode retorna imagem
- [ ] /api/whatsapp/send envia mensagem

### **Z-API:**
- [ ] Webhook de mensagens configurado
- [ ] Webhook de status configurado
- [ ] Webhooks testados (200 OK)

### **Frontend:**
- [ ] REACT_APP_API_URL atualizado
- [ ] Rebuild feito
- [ ] Componente WhatsApp funcionando

---

## 📊 **COMANDOS ÚTEIS**

### **Ver logs do Railway:**
```bash
# No Railway CLI (se instalado)
railway logs

# Ou no Dashboard → Deployments → View Logs
```

### **Testar endpoints localmente antes do deploy:**
```bash
# Rodar backend local
npm run dev

# Testar
curl http://localhost:3000/api/whatsapp/status
```

### **Verificar variáveis de ambiente:**
```javascript
// Adicionar no server.js temporariamente
console.log('Z-API Config:', {
  instanceId: process.env.ZAPI_INSTANCE_ID?.substring(0, 5) + '...',
  tokenConfigured: !!process.env.ZAPI_TOKEN,
  baseUrl: process.env.ZAPI_BASE_URL
});
```

---

## 🎯 **ENDPOINTS DISPONÍVEIS APÓS DEPLOY**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check geral |
| GET | `/api/whatsapp/status` | Status da conexão WhatsApp |
| GET | `/api/whatsapp/qrcode` | QR Code (imagem PNG) |
| GET | `/api/whatsapp/qrcode-base64` | QR Code (base64) |
| GET | `/api/whatsapp/health` | Health check Z-API |
| POST | `/api/whatsapp/send` | Enviar mensagem de texto |
| POST | `/api/whatsapp/send-image` | Enviar imagem |
| POST | `/api/whatsapp/disconnect` | Desconectar WhatsApp |
| POST | `/api/whatsapp/restart` | Reiniciar instância |
| POST | `/api/whatsapp/check-phone` | Verificar se número existe |
| POST | `/api/webhooks/zapi-whatsapp` | Webhook de mensagens |
| POST | `/api/webhooks/zapi-status` | Webhook de status |

---

## 🎉 **PRONTO!**

Agora você tem:

- ✅ Backend deployado no Railway
- ✅ Z-API integrado e funcionando
- ✅ QR Code acessível via API
- ✅ Webhooks configurados
- ✅ Frontend atualizado

**Próximo passo:** Integrar componentes React no frontend!

---

## 📞 **SUPORTE**

- Railway: https://railway.app/help
- Z-API: contato@z-api.io ou WhatsApp Suporte
- Logs Railway: Dashboard → Deployments → View Logs

**Qualquer dúvida, me chame! 🚀**

