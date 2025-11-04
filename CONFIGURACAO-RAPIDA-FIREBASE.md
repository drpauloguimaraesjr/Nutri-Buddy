# ⚡ Configuração Rápida Firebase

## 🎯 Você já tem:

✅ **Firebase Client Config** (Frontend):
```javascript
const firebaseConfig = {
  apiKey: "SUA_FIREBASE_API_KEY",
  authDomain: "nutribuddy-2fc9c.firebaseapp.com",
  projectId: "nutribuddy-2fc9c",
  storageBucket: "nutribuddy-2fc9c.firebasestorage.app",
  messagingSenderId: "225946487395",
  appId: "1:225946487395:web:d14ef325c8970061aa4656",
  measurementId: "G-MB7VG6TFXN"
};
```

---

## ⚠️ Você precisa de:

### Firebase Admin SDK (Backend) - Service Account

## 🚀 Passo a Passo (5 minutos)

### 1️⃣ Baixar Service Account

1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk
2. Clique: **"Generate new private key"**
3. Baixe o arquivo `.json`

### 2️⃣ Extrair Informações

Abra o JSON baixado e copie:

- ✅ `project_id` → Vai para `FIREBASE_PROJECT_ID`
- ✅ `private_key` → Vai para `FIREBASE_PRIVATE_KEY`  
- ✅ `client_email` → Vai para `FIREBASE_CLIENT_EMAIL`

### 3️⃣ Criar .env

```bash
cd NutriBuddy
cp env.example .env
```

### 4️⃣ Editar .env

Cole exatamente assim (copie do JSON):

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOLE_AQUI_A_CHAVE_COMPLETA\n-----END PRIVATE KEY-----\n"

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret-aqui
```

### 5️⃣ Testar

```bash
npm start
```

Deve aparecer: **✅ Firebase: Connected**

---

## 📋 Checklist

- [ ] Firebase Console aberto
- [ ] Service Account gerada
- [ ] JSON baixado
- [ ] .env criado
- [ ] Chaves copiadas
- [ ] npm start funcionando
- [ ] Firebase conectado

---

## 🆘 Link Direto

Vá direto para aqui:
```
https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk
```

---

**Pronto! Em 5 minutos você está rodando! ⚡**

