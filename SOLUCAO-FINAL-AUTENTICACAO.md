# 🔧 Solução Final - Autenticação N8N

## ⚠️ PROBLEMA IDENTIFICADO

Pelos logs do Railway, vejo que:
```
🔐 [AUTH] Checking authentication: { hasSecret: false, providedSecret: 'none', hasAuthHeader: true }
```

**Isso significa:**
1. ❌ `WEBHOOK_SECRET` não está configurado no Railway (`hasSecret: false`)
2. ❌ O header `x-webhook-secret` não está sendo enviado (`providedSecret: 'none'`)

---

## ✅ SOLUÇÃO: Configurar WEBHOOK_SECRET no Railway

### Passo 1: Adicionar no Railway

1. Acesse: https://railway.app
2. Seu projeto → **Variables** (ou "Environment Variables")
3. Clique em **"+ New Variable"** ou **"Add Variable"**
4. Configure:
   - **Name:** `WEBHOOK_SECRET`
   - **Value:** `nutribuddy-secret-2024`
5. Clique em **Save**

### Passo 2: Aguardar Deploy

- O Railway vai fazer redeploy automaticamente (~1-2 minutos)
- Aguarde aparecer "Deployed successfully" em **Deployments**

### Passo 3: Verificar nos Logs

Depois do deploy, ao testar, os logs devem mostrar:
```
🔐 [AUTH] Checking authentication: { hasSecret: true, providedSecret: '***', hasAuthHeader: false }
✅ [AUTH] Webhook secret validated
```

---

## 📋 Configurar N8N

### No nó "Buscar Nutrição1":

1. **Import cURL:**
```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

2. **OU configure manualmente:**
   - Remove header `Authorization` (se existir)
   - Adicione header:
     - Name: `x-webhook-secret`
     - Value: `nutribuddy-secret-2024`

---

## 🔍 Verificar se Funcionou

### Teste 1: Terminal
```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

**Deve retornar:**
```json
{"success":true,"count":0,"data":[]}
```

### Teste 2: Logs do Railway

Após configurar, os logs devem mostrar:
```
🔐 [AUTH] Checking authentication: { hasSecret: true, providedSecret: '***' }
✅ [AUTH] Webhook secret validated
```

**NÃO deve aparecer:**
```
❌ [AUTH] Token verification error: verifyIdToken() expects an ID token
```

---

## ⚠️ Sobre o Token Firebase

O erro que você viu:
```
❌ [AUTH] Token verification error: verifyIdToken() expects an ID token, but was given a custom token
```

**Isso acontece porque:**
- O endpoint `/api/get-token` retorna um **custom token**
- Mas o middleware espera um **ID token**
- Custom tokens precisam ser trocados por ID tokens no cliente

**Solução:** Use **webhook secret** em vez de token Firebase para N8N. É mais simples e funciona perfeitamente!

---

## ✅ Checklist Final

- [ ] `WEBHOOK_SECRET` adicionado no Railway
- [ ] Valor: `nutribuddy-secret-2024` (ou o valor que você escolher)
- [ ] Railway fez deploy (~1-2 minutos)
- [ ] Header `x-webhook-secret` configurado no N8N
- [ ] Header `Authorization` removido do nó
- [ ] Teste com curl funcionou
- [ ] Teste no N8N funcionou

---

**Depois de configurar o WEBHOOK_SECRET no Railway e aguardar o deploy, tudo deve funcionar! 🚀**

