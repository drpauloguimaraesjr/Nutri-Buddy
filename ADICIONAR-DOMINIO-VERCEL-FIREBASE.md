# 🔧 Adicionar Domínio Vercel no Firebase Auth

## 🎯 Problema

O Firebase bloqueia requisições de domínios não autorizados por segurança. O domínio do Vercel precisa estar na lista de domínios autorizados.

---

## ✅ Solução Rápida (2 minutos)

### 1️⃣ Acessar Firebase Console

Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication/settings

Ou:
1. https://console.firebase.google.com
2. Projeto: **nutribuddy-2fc9c**
3. **Authentication** (no menu lateral)
4. **Settings** (aba superior)
5. Role até **"Authorized domains"**

---

### 2️⃣ Adicionar Domínio do Vercel

Na seção **"Authorized domains"**, você verá:

```
Authorized domains:
- nutribuddy-2fc9c.firebaseapp.com
- nutribuddy-2fc9c.web.app
- localhost
```

**Para adicionar o Vercel:**

1. Clique em **"Add domain"**
2. Cole o domínio do Vercel. Exemplos:
   - `nutri-buddy-ir2n.vercel.app` (seu domínio específico)
   - `*.vercel.app` (todos os subdomínios do Vercel - RECOMENDADO)
3. Clique em **"Add"**

---

## 🎯 Recomendação

**Adicione o domínio genérico do Vercel:**
```
*.vercel.app
```

Isso permite que TODOS os deploys do Vercel funcionem (production, preview, etc.).

---

## 📋 Lista de Domínios para Adicionar

Se quiser ser específico, adicione:

| Domínio | Quando usar |
|---------|-------------|
| `*.vercel.app` | ✅ Recomendado - Funciona para todos os deploys |
| `nutri-buddy-ir2n.vercel.app` | Seu domínio específico (se quiser ser mais restritivo) |
| `seu-dominio-customizado.com` | Se você configurou domínio customizado no Vercel |

---

## ✅ Depois de Adicionar

1. **Não precisa fazer redeploy** - A mudança é imediata no Firebase
2. **Recarregue a página** do Vercel (F5)
3. **O erro deve desaparecer!**

---

## 🔍 Como Verificar se Funcionou

1. Abra a página do login no Vercel
2. Abra o Console do navegador (F12)
3. Procure por erros do Firebase
4. Se não houver erro de API key, está funcionando!

---

## 🆘 Se Ainda Não Funcionar

1. Verifique se o domínio está exatamente como aparece na URL do Vercel
2. Verifique se salvou no Firebase
3. Aguarde 1-2 minutos para o Firebase propagar
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

## 🔗 Links Diretos

- **Firebase Auth Settings:** https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication/settings
- **Firebase Console:** https://console.firebase.google.com/project/nutribuddy-2fc9c

---

**Adicione o domínio e teste novamente!** 🚀


