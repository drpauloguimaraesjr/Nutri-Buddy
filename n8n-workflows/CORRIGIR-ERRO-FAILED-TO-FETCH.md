# 🔧 SOLUÇÃO: Erro "Failed to fetch" no Dashboard

## 🐛 Problema Identificado

Na página **"Central de atendimento"** (`/dashboard/chat`), aparece o erro:
```
❌ Failed to fetch
```

### Causa Raiz

A variável de ambiente `NEXT_PUBLIC_API_BASE_URL` **não está configurada no Vercel**.

O código está tentando se conectar a `http://localhost:3000` em produção:

```typescript
// frontend/src/app/(dashboard)/dashboard/chat/page.tsx (linha 48)
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
```

---

## ✅ SOLUÇÃO (5 minutos)

### Passo 1: Acessar Vercel

1. Abra: https://vercel.com
2. Faça login
3. Selecione o projeto `nutribuddy` (ou nome do seu frontend)

### Passo 2: Configurar Variável

1. Vá em **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Configure:

```
Name: NEXT_PUBLIC_API_BASE_URL
Value: https://web-production-c9eaf.up.railway.app
Environment: Production, Preview, Development
```

4. Clique em **Save**

### Passo 3: Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Clique em **Redeploy**
4. Aguarde ~2 minutos

### Passo 4: Testar

1. Abra seu frontend: https://nutri-buddy-ir2n.vercel.app/dashboard/chat
2. A página deve carregar sem erro "Failed to fetch"
3. Lista de conversas deve aparecer (vazia ou com conversas existentes)

---

## 🧪 TESTE RÁPIDO

Após configurar, teste se está funcionando:

```bash
# Abra o Console do navegador (F12)
# Execute:
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)

# Deve mostrar:
# "https://web-production-c9eaf.up.railway.app"
```

---

## 📊 PROGRESSO ATUAL

### ✅ O QUE JÁ ESTÁ FUNCIONANDO (80%)

1. **Frontend Deployado** (Vercel)
   - ✅ Next.js + TypeScript
   - ✅ Firebase integrado
   - ✅ Páginas de chat criadas
   - ✅ Componentes completos
   - ✅ Upload de PDF funcionando

2. **Backend Funcionando** (Railway)
   - ✅ API rodando: https://web-production-c9eaf.up.railway.app/
   - ✅ Rotas de mensagens COMPLETAS (1305 linhas!)
   - ✅ Sistema de conversas implementado
   - ✅ Webhooks para n8n prontos
   - ✅ Integração Firebase

3. **n8n Online** (Railway)
   - ✅ URL: https://n8n-production-3eae.up.railway.app/
   - ✅ Status: OK
   - ⚠️ Workflows precisam ser importados

4. **Z-API Credenciais**
   - ✅ ZAPI_INSTANCE_ID existe
   - ✅ ZAPI_TOKEN existe
   - ⚠️ Precisa verificar se está ativo

### ⚠️ O QUE FALTA (20%)

1. **Configurar variável Vercel** (5 min) ← **VOCÊ ESTÁ AQUI**
2. **Importar workflows n8n** (1h)
3. **Testar sistema de mensagens** (30 min)
4. **Conectar Z-API** (30 min)
5. **Teste end-to-end** (30 min)

**Total faltando:** ~2-3 horas

---

## 🎯 PRÓXIMO PASSO

Depois de corrigir a variável Vercel:

1. ✅ Sistema de mensagens funcionará
2. ✅ Prescritor poderá ver conversas
3. ✅ Chat funcionará
4. ⏳ Depois: Importar workflows n8n

---

## 💡 POR QUE ISSO ACONTECEU?

Durante o desenvolvimento local:
- Frontend rodava em `localhost:3001`
- Backend rodava em `localhost:3000`
- Funcionava!

No deploy:
- Frontend foi para Vercel
- Backend foi para Railway
- **Mas a variável não foi configurada no Vercel**
- Frontend continua tentando `localhost:3000` ❌

---

## ✅ CHECKLIST

Marque quando fizer:

- [ ] Acessei o Vercel
- [ ] Adicionei `NEXT_PUBLIC_API_BASE_URL`
- [ ] Fiz redeploy
- [ ] Testei e funcionou!

---

**Criado em:** 15/11/2024  
**Problema:** Failed to fetch  
**Solução:** Configurar NEXT_PUBLIC_API_BASE_URL no Vercel  
**Tempo estimado:** 5 minutos

