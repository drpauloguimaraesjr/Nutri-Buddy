# 🔑 Como Obter Credenciais Firebase Client SDK (NEXT_PUBLIC_*)

## ⚠️ IMPORTANTE: Estas são as credenciais do FRONTEND

As credenciais que começam com `NEXT_PUBLIC_` são para o **Frontend/Web App**, não para o backend!

---

## 🎯 Passo a Passo (2 minutos)

### 1️⃣ Acessar Firebase Console

1. Acesse: https://console.firebase.google.com
2. Faça login
3. Selecione o projeto: **nutribuddy-2fc9c**

---

### 2️⃣ Ir para Configurações do App Web

1. Clique na **engrenagem ⚙️** ao lado de "Project Overview"
2. Vá em **"Project settings"**
3. Na aba **"General"** (primeira aba)
4. Role até a seção **"Your apps"**
5. Procure por **"Web app"** (ícone `</>`) ou **"Add app"**

---

### 3️⃣ Encontrar as Credenciais

Se você já tem um app web criado, você verá algo assim:

```
Your apps
┌─────────────────────────────────────┐
│ </> Web app                         │
│ nutribuddy                           │
│                                      │
│ const firebaseConfig = {             │
│   apiKey: "AIzaSyB5KuimIWLnw...",   │ ← ESTA É A API KEY!
│   authDomain: "nutribuddy-2fc9c...",│ ← ESTA É A AUTH DOMAIN!
│   projectId: "nutribuddy-2fc9c",    │ ← ESTA É A PROJECT ID!
│   storageBucket: "nutribuddy-2fc9c...", ← ESTA É A STORAGE BUCKET!
│   messagingSenderId: "225946487395",│ ← ESTA É A MESSAGING SENDER ID!
│   appId: "1:225946487395:web:...",  │ ← ESTA É A APP ID!
│   measurementId: "G-MB7VG6TFXN"     │ ← ESTA É A MEASUREMENT ID!
│ };                                   │
└─────────────────────────────────────┘
```

---

### 4️⃣ Se NÃO Tiver App Web Criado

Se não aparecer nenhum app web:

1. Clique em **"Add app"** ou no ícone `</>`
2. Escolha **"Web"**
3. Dê um nome: **"nutribuddy"** ou **"frontend"**
4. **NÃO** marque a opção "Also set up Firebase Hosting"
5. Clique em **"Register app"**
6. As credenciais aparecerão na tela!

---

### 5️⃣ Copiar as Credenciais

Copie cada valor e adicione no Vercel:

| No Firebase Console | Variável no Vercel | Valor Exemplo |
|---------------------|-------------------|---------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `nutribuddy-2fc9c.firebaseapp.com` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `nutribuddy-2fc9c` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `nutribuddy-2fc9c.firebasestorage.app` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `225946487395` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:225946487395:web:d14ef325c8970061aa4656` |
| `measurementId` | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-MB7VG6TFXN` |

---

## 🔗 Link Direto

Acesse direto aqui:
```
https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
```

---

## 📝 Adicionar no Vercel

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Para cada variável acima, clique em **"Add"**
3. Cole o **Key** e o **Value**
4. Marque **"Production"**, **"Preview"** e **"Development"**
5. Salve

---

## ✅ Credenciais que Você Precisa

Com base no seu projeto, você já tem algumas dessas informações:

- ✅ `projectId`: `nutribuddy-2fc9c`
- ✅ `authDomain`: `nutribuddy-2fc9c.firebaseapp.com`
- ✅ `storageBucket`: `nutribuddy-2fc9c.firebasestorage.app`
- ✅ `messagingSenderId`: `225946487395`
- ⚠️ `apiKey`: Precisa pegar no Firebase Console
- ⚠️ `appId`: Precisa pegar no Firebase Console
- ⚠️ `measurementId`: Precisa pegar no Firebase Console

---

## 🎯 Resumo Rápido

1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
2. Role até "Your apps" → "Web app"
3. Copie as credenciais do `firebaseConfig`
4. Cole no Vercel como variáveis `NEXT_PUBLIC_*`

---

**Pronto! Essas são as credenciais do frontend!** 🚀

