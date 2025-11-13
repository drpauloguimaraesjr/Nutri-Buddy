# ⚡ VOCÊ FAZER AGORA - 5 MINUTOS!

## ✅ **EU JÁ FIZ:**

- ✅ **Commit feito!** (35 arquivos, 11.437 linhas)
- ✅ **Push feito!** (GitHub atualizado)
- ✅ **Railway fazendo deploy automático AGORA!** 🚀

---

## 🎯 **VOCÊ PRECISA FAZER (5 minutos):**

### **PASSO 1: Railway - Adicionar 3 Variáveis (3 min)**

1. **Abrir:** https://railway.app

2. **Selecionar:** Seu projeto backend

3. **Clicar:** Variables (menu lateral)

4. **Adicionar estas 3 variáveis:**

```
ZAPI_INSTANCE_ID
Valor: 3EA240373A126172229A82761BB89DF3
```

```
ZAPI_TOKEN
Valor: 8F4DA3C4CA0EFA2069E84E7D
```

```
ZAPI_BASE_URL
Valor: https://api.z-api.io
```

5. **Salvar** (Railway vai fazer redeploy automático)

6. **Aguardar** ~2 minutos

7. **Ver logs:** Procurar por:
   ```
   📱 Z-API WhatsApp: Configured ✅
   ```

---

### **PASSO 2: Z-API - Configurar 2 Webhooks (2 min)**

1. **Abrir:** https://z-api.io/dashboard

2. **Clicar:** Na sua instância "Meu número"

3. **Ir em:** Webhooks (menu lateral)

#### **Webhook 1 - Mensagens:**

- **Ativar:** "Mensagens recebidas"
- **URL:** `https://web-production-c9eaf.up.railway.app/webhooks/zapi-whatsapp`
- **Eventos:** ✅ message-received
- **Salvar**

#### **Webhook 2 - Status:**

- **Ativar:** "Status de conexão"  
- **URL:** `https://web-production-c9eaf.up.railway.app/webhooks/zapi-status`
- **Eventos:** ✅ connection.update, ✅ qrcode.updated
- **Salvar**

---

### **PASSO 3: Vercel - Adicionar Variável (2 min)**

**OPCIONAL:** Pode fazer depois quando testar o frontend

1. **Abrir:** https://vercel.com

2. **Selecionar:** Projeto frontend

3. **Settings** → **Environment Variables**

4. **Adicionar:**
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://web-production-c9eaf.up.railway.app`
   - **Environment:** Production

5. **Salvar**

6. **Deployments** → **Redeploy** último deployment

---

## ✅ **PRONTO!**

Depois desses 3 passos:

- ✅ Backend deployado com Z-API
- ✅ Webhooks configurados
- ✅ Frontend pronto

**Quando o eSIM chegar (2 minutos):**
1. Abrir seu sistema
2. WhatsApp → Conectar
3. Escanear QR Code
4. **FUNCIONANDO!** 🎉

---

## 🆘 **PROBLEMAS?**

### **Railway não mostra "Z-API Configured ✅"**

- Verificar se as 3 variáveis estão corretas
- Fazer redeploy manual

### **Webhook retorna erro**

- Verificar se URL está correta
- Ver logs do Railway

### **Qualquer dúvida:**

**Me chama!** 💪

---

**TOTAL: 5 minutos e está TUDO pronto!** ⚡

**BORA FAZER AGORA! 🚀**

