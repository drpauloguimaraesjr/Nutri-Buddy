# 📧 Setup Firebase Trigger Email Extension

## 🎯 O que é?

**Firebase Trigger Email** é uma extensão oficial do Firebase que **envia emails automaticamente** quando você cria documentos em uma coleção específica do Firestore.

### ✅ Vantagens:
- **Totalmente gerenciado** pelo Firebase
- **Grátis** até 1000 emails/mês (SendGrid free tier)
- **Sem servidor SMTP** próprio
- **Fácil de configurar** (5 minutos)

---

## 🚀 Instalação (Passo a Passo)

### 1️⃣ Acesse o Firebase Console

```
https://console.firebase.google.com/project/nutribuddy-2fc9c/extensions
```

### 2️⃣ Instalar a Extensão

1. Clique em **"Install Extension"** ou **"Instalar Extensão"**
2. Procure por: **"Trigger Email"** ou **"trigger-email-from-firestore"**
3. Clique em **"Install"**

### 3️⃣ Configurar a Extensão

Durante a instalação, você precisará configurar:

#### **SMTP Connection**

Escolha uma das opções:

##### 🟢 **Opção 1: Gmail (Mais Fácil)**

```env
SMTP Server: smtp.gmail.com
SMTP Port: 587
SMTP Username: seu-email@gmail.com
SMTP Password: [App Password do Gmail]
```

**Como gerar App Password do Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie uma senha de app para "Mail"
3. Copie a senha gerada (16 caracteres)

---

##### 🔵 **Opção 2: SendGrid (Recomendado para Produção)**

```env
SMTP Server: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [SendGrid API Key]
```

**Como obter SendGrid API Key:**
1. Crie conta gratuita: https://signup.sendgrid.com/
2. Vá em Settings → API Keys
3. Crie uma nova API Key com permissão "Mail Send"
4. Copie a chave

---

#### **Collection Path**

```
mail
```

Este é o nome da coleção onde você criará documentos para enviar emails.

#### **Default FROM Address**

```
NutriBuddy <noreply@nutribuddy.com>
```

Ou use seu email pessoal:

```
Dr. Paulo Guimarães <drpauloguimaraesjr@gmail.com>
```

#### **Default REPLY-TO Address** (Opcional)

```
drpauloguimaraesjr@gmail.com
```

---

### 4️⃣ Finalizar Instalação

1. Clique em **"Install Extension"**
2. Aguarde a instalação (1-2 minutos)
3. ✅ Pronto!

---

## 🧪 Testar o Envio de Email

### Teste Manual no Firestore Console

1. Acesse o Firestore: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore
2. Crie uma nova coleção chamada `mail`
3. Adicione um documento com:

```json
{
  "to": "seu-email@gmail.com",
  "message": {
    "subject": "Teste Firebase Email",
    "html": "<h1>Funciona! 🎉</h1><p>Seu email automático está funcionando!</p>",
    "text": "Funciona! 🎉"
  }
}
```

4. Aguarde 5-10 segundos
5. Verifique seu email! 📧

---

## 📦 Como o NutriBuddy Usa

### 1. **Email de Onboarding** (Automático)

Quando você cria um novo paciente, o sistema **envia automaticamente** um email com:
- Boas-vindas personalizadas (editável pelo admin)
- Email e senha temporária
- Link para acessar o sistema

### 2. **Reenvio de Credenciais** (Manual)

Nos três pontinhos do card do paciente:
- **"Enviar Voucher (Email)"**: Reenvia email com nova senha
- **"Enviar Voucher (WhatsApp)"**: Copia mensagem para enviar manualmente

---

## 🎨 Personalizar Template de Email (Admin)

### Via API (para o Admin)

**Endpoint:** `POST /api/admin/email-template`

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_ADMIN]
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "Bem-vindo ao NutriBuddy! 🎉",
  "body": "<div style='font-family: Arial;'>
    <h1>Olá {{PATIENT_NAME}}!</h1>
    <p>Suas credenciais:</p>
    <p><strong>Email:</strong> {{PATIENT_EMAIL}}</p>
    <p><strong>Senha:</strong> {{TEMP_PASSWORD}}</p>
    <a href='{{LOGIN_URL}}'>Acessar Sistema</a>
  </div>",
  "fromName": "Dr. Paulo Guimarães",
  "fromEmail": "drpauloguimaraesjr@gmail.com"
}
```

**Variáveis Disponíveis:**
- `{{PATIENT_NAME}}` - Nome do paciente
- `{{PATIENT_EMAIL}}` - Email do paciente
- `{{TEMP_PASSWORD}}` - Senha temporária
- `{{LOGIN_URL}}` - URL do sistema

---

## 🔍 Monitorar Envios

### Ver Histórico de Emails

1. Acesse o Firestore
2. Abra a coleção `mail`
3. Cada documento mostra:
   - ✅ `delivery.state: "SUCCESS"` - Email enviado
   - ❌ `delivery.state: "ERROR"` - Erro no envio
   - ⏳ `delivery.state: "PENDING"` - Aguardando envio

---

## ⚠️ Troubleshooting

### Email não foi enviado?

1. **Verifique a extensão está ativa:**
   - Firebase Console → Extensions → "Trigger Email" deve estar "Active"

2. **Verifique as credenciais SMTP:**
   - Gmail: App Password está correto?
   - SendGrid: API Key está ativa?

3. **Verifique o documento no Firestore:**
   - Abra a coleção `mail`
   - Veja o campo `delivery` no documento

4. **Logs da extensão:**
   - Firebase Console → Extensions → "Trigger Email" → "View logs"

---

## 💡 Dicas

### ✅ DO's:
- Use **SendGrid** para produção (mais confiável)
- Configure **domínio personalizado** no SendGrid (evita spam)
- Mantenha templates **curtos e diretos**
- Teste com **seu próprio email** primeiro

### ❌ DON'Ts:
- Não use Gmail pessoal em produção (limite de envios)
- Não coloque HTML muito complexo (pode quebrar em alguns clientes)
- Não esqueça de verificar a pasta de spam

---

## 📋 Checklist Final

- [ ] Extensão "Trigger Email" instalada
- [ ] SMTP configurado (Gmail ou SendGrid)
- [ ] Teste manual funcionou
- [ ] Email de onboarding enviado ao criar paciente
- [ ] Opção "Enviar Voucher" funciona no menu
- [ ] Template personalizado (opcional)

---

## 🔗 Links Úteis

- **Extensão Oficial:** https://extensions.dev/extensions/firebase/firestore-send-email
- **SendGrid Free:** https://signup.sendgrid.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Documentação:** https://firebase.google.com/docs/extensions/official/firestore-send-email

---

**Pronto! Seu sistema de email está configurado! 📧🎉**

