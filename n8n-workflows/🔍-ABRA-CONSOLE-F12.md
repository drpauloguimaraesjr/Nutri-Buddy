# 🔍 DIAGNÓSTICO RÁPIDO - Abra o Console (F12)

**Tempo:** 2 minutos  
**Objetivo:** Ver o erro EXATO que está acontecendo

---

## 📱 PASSO A PASSO (SUPER SIMPLES)

### **1. Abrir o site:**
```
https://nutri-buddy-ir2n.vercel.app/dashboard/chat
```

### **2. Fazer login:**
```
(seu email de prescritor)
```

### **3. Abrir Console do Navegador:**

**Windows/Linux:**
```
Apertar: F12
```

**Mac:**
```
Apertar: Cmd + Option + I
```

### **4. Clicar na aba "Console":**
```
┌─────────────────────────────────────┐
│ Elements  Console  Sources  Network │ ← Clicar aqui
└─────────────────────────────────────┘
```

### **5. Procurar mensagens em VERMELHO:**

**Pode ser algo tipo:**

**Erro 1 (CORS):**
```
❌ Access to fetch at 'https://web-production-c9eaf...' 
   from origin 'https://nutri-buddy-ir2n.vercel.app' 
   has been blocked by CORS policy
```

**Erro 2 (Auth):**
```
❌ Error: Firebase ID token has expired
❌ 401 Unauthorized
```

**Erro 3 (Network):**
```
❌ Failed to fetch
❌ net::ERR_NAME_NOT_RESOLVED
❌ TypeError: Failed to fetch
```

**Erro 4 (URL errada):**
```
❌ http://localhost:3000/api/messages/conversations
   (se aparecer localhost, variável está errada!)
```

---

## 📸 SCREENSHOT

**Opção A:** Me enviar screenshot do Console

**Opção B:** Me copiar o texto do erro em vermelho

**Opção C:** Me dizer qual dos 4 erros acima apareceu

---

## 🔧 SOLUÇÕES RÁPIDAS

### **Se for Erro 1 (CORS):**

**No Railway:**
```
Variables → Add:
CORS_ORIGIN=https://nutri-buddy-ir2n.vercel.app
```

---

### **Se for Erro 2 (Auth):**

**No site:**
```
1. Fazer logout
2. Fazer login novamente
3. Tentar de novo
```

---

### **Se for Erro 3 (Network):**

**Verificar:**
```
1. Backend está online?
   https://web-production-c9eaf.up.railway.app/
   
2. Deve mostrar:
   {"message":"NutriBuddy API Server","status":"running"}
   
3. Se não mostrar: Railway pode estar offline
```

---

### **Se for Erro 4 (URL errada):**

**No Vercel:**
```
Settings → Environment Variables
Verificar:
NEXT_PUBLIC_API_BASE_URL = https://web-production-c9eaf.up.railway.app

Sem http://localhost:3000
```

---

## 🎯 APÓS DESCOBRIR O ERRO

**Me envie:**
1. Qual erro apareceu
2. Screenshot (se possível)
3. Texto completo do erro

**Eu resolvo em minutos!** 🚀

---

## 💡 DICA RÁPIDA

**Enquanto o Console está aberto:**

Vá na aba **"Network"** (ao lado de Console):
1. Recarregue a página (Ctrl+R)
2. Procure linha que fica VERMELHA
3. Clique nela
4. Veja o erro detalhado
5. Me envie!

---

## ⏱️ TEMPO

**Abrir F12:** 5 segundos  
**Ver erro:** 10 segundos  
**Me enviar:** 30 segundos  
**Total:** 45 segundos  

**Eu resolvo:** 2-5 minutos  

---

**FAÇA ISSO AGORA!** 🔍

Abra F12 e me diga que erro aparece! 💬

