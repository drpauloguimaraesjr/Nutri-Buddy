# 🔑 Como Obter Credenciais Firebase Admin SDK

## ⚠️ IMPORTANTE: Diferença entre credenciais

Você tem **duas configurações diferentes** no Firebase:

### 1️⃣ Firebase Client SDK (já tem) ✅
**Uso:** Frontend/Web App  
**Config:** firebaseConfig (apiKey, authDomain, etc)  
**Status:** ✅ Já configurado

### 2️⃣ Firebase Admin SDK (precisa configurar) ⚠️
**Uso:** Backend/Server  
**Config:** Service Account (private key)  
**Status:** ⚠️ Precisa baixar

---

## 🎯 Passo a Passo - Obter Service Account

### PASSO 1: Acessar Firebase Console

1. Acesse: [Firebase Console](https://console.firebase.google.com)
2. Faça login (mesma conta que criou o projeto)
3. Selecione o projeto: **nutribuddy-2fc9c**

### PASSO 2: Ir para Service Accounts

1. Clique na **engrenagem ⚙️** ao lado de "Project Overview"
2. Vá em **"Project settings"**
3. Na aba superior, clique em **"Service accounts"**
4. Você verá algo como: "Firebase Admin SDK"

### PASSO 3: Gerar Nova Chave

1. Role a página até **"Generate new private key"**
2. Clique no botão **"Generate new private key"**
3. Um popup aparecerá: **"This will download a JSON file..."**
4. Clique em **"Generate key"**
5. Um arquivo `.json` será baixado!

**Nome do arquivo:** `nutribuddy-2fc9c-firebase-adminsdk-xxxxx-xxxxx.json`

### PASSO 4: Abrir o arquivo JSON

Abra o arquivo que você baixou. Ele terá este formato:

```json
{
  "type": "service_account",
  "project_id": "nutribuddy-2fc9c",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### PASSO 5: Configurar o .env

No seu projeto NutriBuddy, crie/edite o arquivo `.env`:

```bash
# Copie do env.example
cp env.example .env
```

Edite o `.env` e cole as informações do JSON:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=nutribuddy-2fc9c

# IMPORTANTE: Cole a chave EXATAMENTE como está no JSON
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"

# Cole o client_email do JSON
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5678

# N8N Webhook Secret (optional)
WEBHOOK_SECRET=seu-secret-key-here
```

**⚠️ ATENÇÃO:** A `FIREBASE_PRIVATE_KEY` deve ter as quebras de linha `\n` preservadas!

---

## 🔧 Exemplo Completo do .env

Baseado no seu projeto, o `.env` ficaria assim:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=nutribuddy-2fc9c

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration  
CORS_ORIGIN=http://localhost:5678

# N8N Webhook Secret
WEBHOOK_SECRET=nutribuddy-secret-2024
```

---

## ✅ Como Testar se Funcionou

Depois de configurar o `.env`:

```bash
npm start
```

Você deve ver:

```
=================================
🚀 NutriBuddy API Server Running
📍 Port: 3000
🌍 Environment: development
📡 Firebase: Connected ✅
🔗 http://localhost:3000
🔗 http://localhost:3000/api/health
=================================
```

Se aparecer erro, verifique:
1. A chave privada está entre aspas?
2. As quebras de linha `\n` estão preservadas?
3. O client_email está correto?

---

## 🔐 Segurança

⚠️ **NUNCA compartilhe o arquivo JSON ou as credenciais!**

- O arquivo `.env` está no `.gitignore` ✅
- O arquivo JSON baixado deve ser DELETADO após uso ✅
- Não commit credenciais no Git ✅

---

## 📸 Screenshots de Referência

Se precisar de ajuda visual:

1. Firebase Console → Settings → Project settings
2. Aba "Service accounts"
3. Botão "Generate new private key"
4. Baixar JSON
5. Extrair informações para `.env`

---

## 🆘 Problemas Comuns

### Erro: "Credential implementation provided to initializeApp() via the..." 

**Causa:** Formato incorreto da chave privada  
**Solução:** Verifique se está entre aspas e com `\n` preservados

### Erro: "The caller does not have permission"

**Causa:** Conta de serviço sem permissões  
**Solução:** Verifique se gerou corretamente a Service Account

### Erro: "Failed to parse private key"

**Causa:** Chave privada corrompida  
**Solução:** Baixe novamente o JSON e recopie

---

## 📝 Resumo Rápido

```
1. Firebase Console → nutribuddy-2fc9c
2. ⚙️ Settings → Service accounts
3. "Generate new private key"
4. Baixar JSON
5. Extrair: project_id, private_key, client_email
6. Colar no .env
7. npm start
8. ✅ Funcionando!
```

---

**Pronto! Agora você tem as credenciais do backend configuradas! 🚀**

