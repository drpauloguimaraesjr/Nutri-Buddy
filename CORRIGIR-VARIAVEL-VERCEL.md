# 🔧 Corrigir Variável no Vercel - Remover Aspas

## ❌ Problema Identificado

A variável `NEXT_PUBLIC_FIREBASE_API_KEY` no Vercel tem **aspas duplas** no valor:
```
"AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0"
```

**O Firebase não aceita aspas!** Precisa ser apenas:
```
AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0
```

---

## ✅ Solução

### 1️⃣ Editar Variável no Vercel

1. No Vercel Dashboard → Settings → Environment Variables
2. Clique na variável `NEXT_PUBLIC_FIREBASE_API_KEY`
3. No campo **"Valor"**, REMOVA as aspas do início e fim
4. Deve ficar assim (SEM aspas):
   ```
   AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0
   ```
5. Clique em **"Salvar"**

### 2️⃣ Verificar Todas as Variáveis

Verifique se nenhuma outra variável tem aspas:

| Variável | Valor CORRETO (sem aspas) |
|---------|---------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `nutribuddy-2fc9c.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `nutribuddy-2fc9c` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `nutribuddy-2fc9c.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `225946487395` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:225946487395:web:d14ef325c8970061aa4656` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-MB7VG6TFXN` |

### 3️⃣ Aguardar Redeploy

Após salvar, o Vercel deve fazer redeploy automaticamente. Se não fizer:
- Vá em **Deployments** → **3 pontos** → **Redeploy**

---

## 🎯 Resultado Esperado

Após remover as aspas e fazer redeploy:
- ✅ O erro `auth/api-key-not-valid` deve desaparecer
- ✅ O Firebase Auth deve funcionar
- ✅ Login/Registro deve funcionar

---

**Remova as aspas e teste novamente!** 🚀



