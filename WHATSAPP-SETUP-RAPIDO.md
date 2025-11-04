# ⚡ WHATSAPP SETUP RÁPIDO - 5 MINUTOS

Guia ultra rápido para começar a usar WhatsApp no NutriBuddy!

---

## 🎯 3 PASSOS PARA FUNCIONAR

### **PASSO 1️⃣: Iniciar o Servidor**

```bash
npm start
```

Aguarde aparecer:
```
🚀 NutriBuddy API Server Running
```

---

### **PASSO 2️⃣: Conectar WhatsApp**

Abra no navegador:
```
http://localhost:3000/api/whatsapp/connect
```

**OU use o terminal:**

```bash
curl http://localhost:3000/api/whatsapp/connect
```

---

### **PASSO 3️⃣: Escanear QR Code**

1. 📱 WhatsApp → Menu (⋮) → **Aparelhos Conectados**
2. ➕ Toque **"Conectar um aparelho"**
3. 📷 Escaneie o QR Code que aparece no terminal

**✅ PRONTO!** WhatsApp conectado!

---

## 📤 ENVIAR SUA PRIMEIRA MENSAGEM

### **Formato do Número:**

```
5511999999999@s.whatsapp.net
         ↑↑↑↑↑↑
   (Substitua pelo número real)
```

### **Comando:**

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999@s.whatsapp.net",
    "message": "Olá do NutriBuddy! 🍎"
  }'
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

```bash
# Status
curl http://localhost:3000/api/whatsapp/status

# Ver mensagens
curl http://localhost:3000/api/whatsapp/messages
```

---

## 🆘 PROBLEMAS?

**QR Code não aparece?**
→ Aguarde 5 segundos e recarregue: `http://localhost:3000/api/whatsapp/qr`

**"WhatsApp não conectado"?**
→ Escaneie o QR Code novamente

**Mensagem não enviou?**
→ Verifique se o número está no formato correto

---

## 📚 MAIS DETALHES

Veja o guia completo: `GUIA-WHATSAPP-COMPLETO.md`

---

**🚀 Começou a usar? Mandou bem!** 🎉

