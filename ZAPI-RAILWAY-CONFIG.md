# 🚀 CONFIGURAÇÃO Z-API NO RAILWAY

## ✅ **O QUE FOI FEITO NO BACKEND**

1. ✅ Criado `services/whatsapp-service.js` - Serviço Z-API
2. ✅ Atualizado `routes/whatsapp.js` - Rotas Z-API
3. ✅ Atualizado `server.js` - Webhooks registrados
4. ✅ Atualizado `env.example` - Variáveis Z-API

---

## 🔧 **CONFIGURAR RAILWAY AGORA**

### **Passo 1: Acessar Railway**

https://railway.app

### **Passo 2: Adicionar Variáveis**

No Railway Dashboard → Seu projeto backend → Variables:

**ADICIONAR ESTAS 3 VARIÁVEIS:**

```bash
ZAPI_INSTANCE_ID=3EA240373A126172229A82761BB89DF3
ZAPI_TOKEN=8F4DA3C4CA0EFA2069E84E7D
ZAPI_BASE_URL=https://api.z-api.io
```

### **Passo 3: Deploy**

Fazer push do código:

```bash
cd /Users/drpgjr.../NutriBuddy

# Adicionar arquivos novos
git add services/whatsapp-service.js
git add routes/whatsapp.js
git add server.js
git add env.example
git add ZAPI-RAILWAY-CONFIG.md

# Commit
git commit -m "feat: Integrar Z-API WhatsApp completo"

# Push (Railway faz deploy automático)
git push origin main
```

### **Passo 4: Verificar Logs**

No Railway → Deployments → View Logs

**Procurar por:**
```
📱 Z-API WhatsApp: Configured ✅
```

---

## 🌐 **CONFIGURAR WEBHOOKS NO Z-API**

Depois do deploy, configurar no Dashboard Z-API:

### **Webhook 1: Mensagens Recebidas**

```
URL: https://web-production-c9eaf.up.railway.app/webhooks/zapi-whatsapp
Método: POST
Eventos: ✅ message-received
```

### **Webhook 2: Status de Conexão**

```
URL: https://web-production-c9eaf.up.railway.app/webhooks/zapi-status
Método: POST
Eventos: ✅ connection.update, ✅ qrcode.updated
```

---

## 🧪 **TESTAR ENDPOINTS**

Depois do deploy, testar:

### **1. Health Check**
```bash
curl https://web-production-c9eaf.up.railway.app/health
```

### **2. Status WhatsApp** (precisa estar logado)
```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ✅ **ENDPOINTS DISPONÍVEIS**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/whatsapp/qrcode` | QR Code (base64) |
| GET | `/api/whatsapp/status` | Status da conexão |
| POST | `/api/whatsapp/send` | Enviar mensagem |
| POST | `/api/whatsapp/disconnect` | Desconectar |
| POST | `/api/whatsapp/restart` | Reiniciar instância |
| GET | `/api/whatsapp/health` | Health check |
| POST | `/webhooks/zapi-whatsapp` | Webhook mensagens |
| POST | `/webhooks/zapi-status` | Webhook status |

---

## 🎉 **PRONTO!**

Backend Z-API totalmente integrado! 

**Próximo: Integrar frontend!**

