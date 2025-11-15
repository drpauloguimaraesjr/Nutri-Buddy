# 📱 **TWILIO WHATSAPP - SETUP RÁPIDO PARA USAR EM 24H**

## 🎯 **ESTRATÉGIA INTELIGENTE:**

### **FASE 1: HOJE (Sandbox - 15 minutos)**
Usar **Twilio Sandbox** para testar IMEDIATAMENTE:
- ✅ Funciona em 15 minutos
- ✅ Grátis
- ✅ Você testa amanhã com 1-2 pacientes
- ⚠️ Pacientes precisam enviar código para ativar

### **FASE 2: DEPOIS (Conta Aprovada)**
Migrar para **WhatsApp Business API**:
- ✅ Seu número oficial
- ✅ Sem código de ativação
- ⏳ Aprovação Meta (2-5 dias)

---

## 🚀 **FASE 1: TWILIO SANDBOX (AGORA!)**

### **PASSO 1: Criar Conta Twilio (3 min)**

1. **Acessar:** https://www.twilio.com/try-twilio

2. **Sign Up:**
```
Email: seu-email@gmail.com
Password: [senha forte]
```

3. **Verificar email** → Clicar no link

4. **Verificar telefone:**
```
+55 47 99272-7770 (seu número)
→ Recebe SMS com código
→ Digitar código
```

5. **Questionário:**
```
- What do you plan to build? → "Alerts, notifications & marketing"
- Which product? → "WhatsApp"
- How to build? → "With code"
- Language? → "Node.js"
- Host code? → "No, my own hosting"
```

---

### **PASSO 2: Ativar WhatsApp Sandbox (2 min)**

1. **No Dashboard Twilio:**
```
Menu (☰) → Messaging → Try it out → Send a WhatsApp message
```

2. **Vai aparecer:**
```
┌─────────────────────────────────────────┐
│ WhatsApp Sandbox                        │
├─────────────────────────────────────────┤
│ Join Code: join [palavra-aleatória]     │
│                                         │
│ Sandbox Number: +1 415 523 8886        │
└─────────────────────────────────────────┘
```

3. **No SEU WhatsApp:**
```
1. Adicionar contato: +1 415 523 8886
2. Enviar: join [palavra-que-apareceu]
3. Recebe: "You are all set!"
```

✅ **SANDBOX ATIVO!**

---

### **PASSO 3: Copiar Credenciais (1 min)**

No Dashboard Twilio:

```
Account Info (lado direito):
├─ Account SID: ACxxxxxxxxxxxxxxx (COPIAR!)
└─ Auth Token: [show] → xxxxxxxxxxxx (COPIAR!)
```

**Guardar:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

### **PASSO 4: Configurar Webhook (5 min)**

1. **No Twilio Sandbox Settings:**
```
When a message comes in:
https://web-production-c9eaf.up.railway.app/webhooks/twilio
```

2. **HTTP Method:** POST

3. **Save**

---

## 🎯 **COMO FUNCIONA (SANDBOX):**

```
PACIENTE:
1. Adiciona +1 415 523 8886 no WhatsApp
2. Envia: join [código]
3. Recebe confirmação
4. Envia: "Oi, sou João Silva..."

SISTEMA:
5. Backend recebe via webhook
6. Identifica paciente
7. IA responde personalizada
8. Envia de volta via Twilio
```

---

## ⚠️ **LIMITAÇÕES DO SANDBOX:**

```
❌ Cada paciente precisa "join" antes
❌ Número é dos EUA (+1 415...)
❌ Tem marca d'água "Twilio Sandbox"
```

**MAS FUNCIONA para testar com 2-3 pacientes amanhã!**

---

## 📋 **PRÓXIMOS PASSOS:**

Depois de testar no Sandbox, você:

1. ✅ Request produção (no próprio Twilio)
2. ⏳ Aguarda 2-5 dias (Meta aprova)
3. ✅ Conecta SEU número (47) 99272-7770
4. ✅ Remove limitações do Sandbox
5. 🎉 **PRODUÇÃO COMPLETA!**

---

## 💰 **CUSTO TWILIO:**

### **Sandbox (Teste):**
```
✅ GRÁTIS
✅ $15 de crédito grátis
✅ ~1000 mensagens grátis
```

### **Produção:**
```
📱 WhatsApp Business API: ~$0.005-0.01/msg
💳 ~R$0.03-0.05 por mensagem
💰 100 mensagens/dia = ~R$3-5/dia = R$100-150/mês
```

---

## 🔥 **COMEÇAR AGORA?**

1. ✅ Crie conta Twilio (link acima)
2. ✅ Ative Sandbox
3. ✅ Me passa as 3 credenciais
4. ✅ Eu configuro no backend!

**BORA?** 🚀


