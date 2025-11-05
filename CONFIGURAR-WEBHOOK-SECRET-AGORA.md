# 🔧 Configurar Webhook Secret - Passo a Passo

## ⚠️ PROBLEMA ATUAL
O N8N está tentando se conectar ao backend, mas o `WEBHOOK_SECRET` não está configurado ou não está sendo enviado corretamente.

---

## 📋 PARTE 1: Configurar no Railway (Backend)

### 1. Acesse o Railway
1. Vá para: https://railway.app
2. Faça login
3. Selecione seu projeto NutriBuddy

### 2. Adicionar Variável WEBHOOK_SECRET
1. No dashboard do Railway, clique em **"Variables"** (ou "Environment Variables")
2. Clique em **"+ New Variable"** ou **"Add Variable"**
3. Configure:
   - **Name:** `WEBHOOK_SECRET`
   - **Value:** `nutribuddy-secret-2024`
4. Clique em **"Save"** ou **"Add"**

### 3. Verificar se foi salvo
- Você deve ver `WEBHOOK_SECRET` na lista de variáveis
- O Railway vai fazer redeploy automaticamente

✅ **Railway configurado!**

---

## 📋 PARTE 2: Configurar no N8N

### 1. No Nó "Buscar Nutrição1"

#### Opção A: Importar cURL (Recomendado)
1. No nó, clique em **"Import cURL"**
2. Cole este comando:

```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

3. Clique em **"Import"**
4. Verifique se o header foi criado:
   - Deve aparecer: `x-webhook-secret: nutribuddy-secret-2024`

#### Opção B: Configurar Manualmente
1. No nó, em **"Header Parameters"**
2. Adicione ou edite:
   - **Name:** `x-webhook-secret`
   - **Value:** `nutribuddy-secret-2024`
3. **Remova** o header `Authorization` (se existir)
4. Salve o nó

### 2. Verificar Configuração
O nó deve ter:
- ✅ Method: `GET`
- ✅ URL: `https://web-production-c9eaf.up.railway.app/api/nutrition`
- ✅ Header: `x-webhook-secret: nutribuddy-secret-2024`
- ❌ **NÃO** deve ter header `Authorization`

✅ **N8N configurado!**

---

## 📋 PARTE 3: Testar

### 1. Teste Direto (Terminal)
```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

**Deve retornar:**
```json
{"success":true,"count":0,"data":[]}
```

### 2. Teste no N8N
1. Execute o nó "Buscar Nutrição1"
2. Deve funcionar sem erros ✅

---

## 🔍 Verificar Logs (se ainda não funcionar)

### No Railway:
1. Acesse **"Deployments"** → Clique no último deploy
2. Veja os logs
3. Procure por: `🔐 [AUTH] Checking authentication`
4. Deve mostrar: `providedSecret: ***`

### O que esperar nos logs:
```
🔐 [AUTH] Checking authentication: {
  hasSecret: true,
  providedSecret: '***',
  hasAuthHeader: false
}
✅ [AUTH] Webhook secret validated
```

---

## ⚠️ Problemas Comuns

### Erro: "No token provided"
**Causa:** O header `x-webhook-secret` não está sendo enviado

**Solução:**
1. Verifique se o header está configurado no N8N
2. Verifique se o nome está exato: `x-webhook-secret` (minúsculas, com hífens)
3. Verifique se o valor está correto: `nutribuddy-secret-2024`

### Erro: "Invalid webhook secret"
**Causa:** O valor no Railway é diferente do valor no N8N

**Solução:**
1. Verifique o valor em Railway → Variables → `WEBHOOK_SECRET`
2. Use o mesmo valor no N8N
3. Certifique-se que não há espaços extras

### Erro: Header não aparece após importar cURL
**Solução:**
1. Adicione manualmente em Header Parameters
2. Name: `x-webhook-secret`
3. Value: `nutribuddy-secret-2024`

---

## ✅ Checklist Final

- [ ] `WEBHOOK_SECRET` configurado no Railway
- [ ] Valor no Railway: `nutribuddy-secret-2024`
- [ ] Header `x-webhook-secret` configurado no N8N
- [ ] Valor no N8N: `nutribuddy-secret-2024`
- [ ] Header `Authorization` removido do nó
- [ ] Teste com curl funcionou
- [ ] Teste no N8N funcionou

---

## 🎯 Próximos Passos

Depois de configurar, atualize os outros nós:
- "Salvar Nutrição" → Use o mesmo header `x-webhook-secret`
- "Salvar Refeição" → Use o mesmo header `x-webhook-secret`

**Todos os nós que chamam a API podem usar o mesmo webhook secret!**

---

**Pronto! Agora deve funcionar! 🚀**

