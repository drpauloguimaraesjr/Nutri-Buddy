# 🚀 DEPLOY Z-API - FAZER AGORA!

## ✅ **TUDO PRONTO PARA DEPLOY!**

**Status:** 90% Completo - Só falta fazer deploy e configurar webhooks!

---

## 📦 **O QUE FOI INTEGRADO**

### **Backend (100%):**
- ✅ `services/whatsapp-service.js` - Serviço Z-API completo
- ✅ `routes/whatsapp.js` - 8 endpoints + 2 webhooks
- ✅ `server.js` - Rotas registradas
- ✅ `env.example` - Credenciais documentadas

### **Frontend (100%):**
- ✅ `WhatsAppQRCode.tsx` - Componente QR Code atualizado
- ✅ `WhatsAppStatusCard.tsx` - Card de status (NOVO!)
- ✅ `whatsapp/page.tsx` - Status Card integrado

---

## 🚀 **PASSO 1: DEPLOY BACKEND (5 min)**

### **1.1. Commit e Push**

```bash
cd /Users/drpgjr.../NutriBuddy

# Ver mudanças
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: Integrar Z-API WhatsApp completo com QR Code automático"

# Push (Railway faz deploy automático)
git push origin main
```

### **1.2. Adicionar Variáveis no Railway**

1. Acessar: https://railway.app
2. Selecionar projeto backend
3. Ir em **Variables**
4. Adicionar estas 3 variáveis:

```bash
ZAPI_INSTANCE_ID=3EA240373A126172229A82761BB89DF3
ZAPI_TOKEN=8F4DA3C4CA0EFA2069E84E7D
ZAPI_BASE_URL=https://api.z-api.io
```

5. Salvar (Railway vai fazer redeploy automático)

### **1.3. Verificar Deploy**

Aguardar ~2 minutos e verificar logs:

```
Railway → Deployments → View Logs
```

**Procurar por:**
```
📱 Z-API WhatsApp: Configured ✅
```

### **1.4. Testar Backend**

```bash
# Health check
curl https://web-production-c9eaf.up.railway.app/health
```

**Resposta esperada:**
```json
{
  "message": "NutriBuddy API Server",
  "status": "running"
}
```

---

## 🌐 **PASSO 2: CONFIGURAR WEBHOOKS Z-API (2 min)**

### **2.1. Acessar Dashboard Z-API**

https://z-api.io/dashboard

### **2.2. Configurar Webhook 1 - Mensagens**

1. Clicar na sua instância: "Meu número"
2. Ir em **Webhooks**
3. Ativar **"Mensagens recebidas"**
4. Configurar:
   - **URL:** `https://web-production-c9eaf.up.railway.app/webhooks/zapi-whatsapp`
   - **Método:** POST
   - **Eventos:** ✅ message-received
5. Salvar

### **2.3. Configurar Webhook 2 - Status**

Na mesma página:

1. Ativar **"Status de conexão"**
2. Configurar:
   - **URL:** `https://web-production-c9eaf.up.railway.app/webhooks/zapi-status`
   - **Método:** POST
   - **Eventos:** ✅ connection.update, ✅ qrcode.updated
3. Salvar

### **2.4. Testar Webhooks**

No Dashboard Z-API:
1. **Webhooks** → **Testar**
2. Enviar evento de teste
3. Verificar se retornou **200 OK** ✅

---

## 🎨 **PASSO 3: DEPLOY FRONTEND (5 min)**

### **3.1. Adicionar Variável no Vercel**

1. Acessar: https://vercel.com
2. Selecionar projeto frontend
3. **Settings** → **Environment Variables**
4. Adicionar:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://web-production-c9eaf.up.railway.app`
   - **Environment:** Production
5. Salvar

### **3.2. Fazer Redeploy**

Opção A (pelo site):
1. Vercel → **Deployments**
2. Último deployment → **⋯** → **Redeploy**

Opção B (por commit):
```bash
cd /Users/drpgjr.../NutriBuddy/frontend

# Commit vazio para forçar redeploy
git commit --allow-empty -m "chore: Redeploy com nova variável Z-API"
git push origin main
```

### **3.3. Aguardar Build**

Aguardar ~3 minutos até ver **"✓ Deployed"**

---

## 🧪 **PASSO 4: TESTAR TUDO (quando eSIM chegar)**

### **4.1. Abrir Sistema**

Acessar: https://seu-frontend.vercel.app

### **4.2. Login como Prescritor**

Fazer login com sua conta de nutricionista.

### **4.3. Ir para WhatsApp**

Clicar em **"WhatsApp"** no menu.

### **4.4. Ver Status Card**

Você vai ver um card mostrando:
- ⚠️ **Desconectado**
- Botão **"Conectar"**

### **4.5. Gerar QR Code**

1. Clicar em **"Conectar"** ou **"Configurar WhatsApp"**
2. Modal abre com QR Code
3. QR Code é gerado automaticamente via Z-API! 🎉

### **4.6. Escanear QR Code**

Quando seu eSIM chegar:
1. Abrir WhatsApp no celular
2. Menu → **Aparelhos conectados**
3. **Conectar um aparelho**
4. Escanear o QR Code na tela

### **4.7. Verificar Conexão**

Após escanear:
- Status Card muda para: ✅ **Conectado**
- Mostra seu número de telefone
- QR Code fecha automaticamente

### **4.8. Testar Envio**

1. Ir para um paciente no Kanban
2. Abrir conversa
3. Enviar mensagem de teste
4. Verificar se chegou no WhatsApp ✅

### **4.9. Testar Recebimento**

1. Enviar mensagem do WhatsApp para você mesmo
2. Verificar se aparece no sistema ✅
3. Webhook funcionando! 🎉

---

## ✅ **CHECKLIST DE DEPLOY**

### **Backend:**
- [ ] Git add, commit, push
- [ ] Variáveis adicionadas no Railway
- [ ] Deploy SUCCESS
- [ ] Logs mostram "Z-API Configured ✅"
- [ ] Health check retorna 200 OK

### **Z-API:**
- [ ] Webhook mensagens configurado
- [ ] Webhook status configurado
- [ ] Ambos testados (200 OK)

### **Frontend:**
- [ ] Variável NEXT_PUBLIC_API_BASE_URL adicionada no Vercel
- [ ] Redeploy feito
- [ ] Build SUCCESS

### **Testes (quando eSIM chegar):**
- [ ] Sistema abre normalmente
- [ ] WhatsApp page carrega
- [ ] Status Card aparece
- [ ] QR Code é gerado
- [ ] Escanear QR Code funciona
- [ ] Status muda para Conectado
- [ ] Envio de mensagem funciona
- [ ] Recebimento de mensagem funciona
- [ ] Webhooks funcionando

---

## 🎯 **RESUMO DO QUE VAI ACONTECER**

### **Hoje (sem eSIM):**
1. ✅ Fazer deploy backend (5 min)
2. ✅ Configurar variáveis Railway (2 min)
3. ✅ Configurar webhooks Z-API (2 min)
4. ✅ Deploy frontend (5 min)
5. ✅ Testar que backend está rodando

**TOTAL: ~15 minutos** ⏱️

### **Quando eSIM chegar:**
1. ✅ Abrir sistema
2. ✅ Ir em WhatsApp
3. ✅ Clicar em Conectar
4. ✅ Escanear QR Code
5. ✅ FUNCIONANDO! 🎉

**TOTAL: ~2 minutos** ⏱️

---

## 🔥 **COMANDOS RÁPIDOS**

### **Deploy Backend:**
```bash
cd /Users/drpgjr.../NutriBuddy
git add .
git commit -m "feat: Integrar Z-API WhatsApp completo"
git push origin main
```

### **Testar Backend após deploy:**
```bash
curl https://web-production-c9eaf.up.railway.app/health
```

### **Ver logs Railway:**
```bash
# No browser: Railway → Deployments → View Logs
# Procurar: "📱 Z-API WhatsApp: Configured ✅"
```

---

## 🆘 **PROBLEMAS COMUNS**

### **❌ "Z-API WhatsApp: Not configured"**

**Solução:**
- Verificar se as 3 variáveis estão no Railway
- Verificar se os nomes estão corretos (ZAPI_INSTANCE_ID, etc)
- Fazer redeploy

### **❌ Webhook retorna 404**

**Solução:**
- Verificar URL: deve ser `/webhooks/zapi-whatsapp` (sem /api)
- Verificar se deploy foi feito
- Ver logs do Railway

### **❌ QR Code não aparece no frontend**

**Solução:**
- Verificar se NEXT_PUBLIC_API_BASE_URL está no Vercel
- Verificar se URL está correta (sem barra no final)
- Fazer redeploy do frontend
- Ver console do navegador (F12)

### **❌ CORS Error**

**Solução:**
- Adicionar CORS_ORIGIN no Railway:
  ```
  CORS_ORIGIN=https://seu-frontend.vercel.app
  ```
- Redeploy backend

---

## 🎉 **PRONTO PARA DEPLOY?**

**Bora fazer agora! Leva só 15 minutos!** 🚀

Quando terminar, me avisa para eu te ajudar a testar quando o eSIM chegar! 💪

---

**Qualquer dúvida, me chama! 📞**

