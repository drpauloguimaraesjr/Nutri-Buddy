# 🔧 Troubleshooting: Firebase API Key Error

## ❌ Erro Atual
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

---

## ✅ Checklist de Verificação

### 1️⃣ Verificar Variável no Vercel

**No Vercel Dashboard:**
1. Vá em **Settings** → **Environment Variables**
2. Procure por `NEXT_PUBLIC_FIREBASE_API_KEY`
3. Verifique:
   - ✅ Está com o nome exato: `NEXT_PUBLIC_FIREBASE_API_KEY` (case-sensitive)
   - ✅ O valor começa com `AIza` (todas as API keys do Firebase começam assim)
   - ✅ Não tem espaços extras no início/fim
   - ✅ Está marcada para **Production**, **Preview** e **Development**

---

### 2️⃣ Obter a API Key Correta

**No Firebase Console:**
1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
2. Role até **"Your apps"**
3. Clique no app web (ícone `</>`)
4. Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0",  ← COPIE ESTA!
  authDomain: "nutribuddy-2fc9c.firebaseapp.com",
  // ...
};
```

**⚠️ IMPORTANTE:**
- A API key deve começar com `AIza`
- Copie EXATAMENTE como aparece (sem aspas)
- Não adicione espaços

---

### 3️⃣ Forçar Redeploy

**IMPORTANTE:** Após adicionar/editar variáveis no Vercel, você precisa fazer redeploy!

**Opções:**

**Opção A - Redeploy Manual:**
1. No Vercel Dashboard, vá em **Deployments**
2. Clique nos **3 pontos** no último deploy
3. Clique em **Redeploy**
4. Aguarde ~2-3 minutos

**Opção B - Fazer um commit (mais rápido):**
```bash
cd /Users/drpgjr.../NutriBuddy
git commit --allow-empty -m "trigger redeploy"
git push
```

---

### 4️⃣ Verificar Domínio Autorizado

**No Firebase:**
1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication/settings
2. Role até **"Authorized domains"**
3. Verifique se está:
   - `*.vercel.app` (recomendado)
   - OU seu domínio específico: `nutri-buddy-ir2n.vercel.app`

---

### 5️⃣ Verificar no Console do Navegador

**No navegador (F12):**
1. Abra a página do login
2. Abra o Console (F12 → Console)
3. Procure por erros relacionados a Firebase
4. Veja se a API key está sendo carregada:

```javascript
// No console, digite:
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
// Deve mostrar a API key (começando com AIza)
```

**Se mostrar `undefined`:**
- A variável não está configurada no Vercel
- Ou precisa fazer redeploy

---

### 6️⃣ Verificar se a API Key está Ativa

**No Firebase Console:**
1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
2. Vá em **"Your apps"**
3. Verifique se o app web está ativo
4. Se não estiver, clique em **"Add app"** → **Web**

---

## 🎯 Solução Rápida (Passo a Passo)

### Passo 1: Pegar API Key Correta
1. https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
2. Role até "Your apps" → Clique no app web
3. Copie o valor de `apiKey` (deve começar com `AIza`)

### Passo 2: Atualizar no Vercel
1. Vercel Dashboard → Settings → Environment Variables
2. Edite `NEXT_PUBLIC_FIREBASE_API_KEY`
3. Cole a API key correta
4. Salve

### Passo 3: Redeploy
1. Deployments → 3 pontos → Redeploy
2. OU faça um commit vazio:
   ```bash
   git commit --allow-empty -m "fix: redeploy para aplicar variáveis Firebase"
   git push
   ```

### Passo 4: Verificar Domínio
1. https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication/settings
2. Adicione `*.vercel.app` em "Authorized domains"

### Passo 5: Testar
1. Aguarde o redeploy terminar
2. Recarregue a página (Ctrl+Shift+R para limpar cache)
3. Teste o login novamente

---

## 🔍 Verificação Final

**No Console do Navegador (F12):**
```javascript
// Verifique se a variável está carregada
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

// Deve mostrar algo como:
// API Key: AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0
```

**Se ainda mostrar `undefined`:**
- Faça redeploy novamente
- Verifique se marcou a variável para "Production"
- Limpe o cache do navegador

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique se todas as variáveis estão configuradas:**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

2. **Verifique se a API key está no formato correto:**
   - Deve começar com `AIza`
   - Deve ter ~39 caracteres
   - Não deve ter espaços

3. **Tente criar um novo app web no Firebase** (se o atual estiver com problemas)

---

**Me avise qual passo você está e o que encontrou!** 🔍


