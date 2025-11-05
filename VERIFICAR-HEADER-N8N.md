# 🔍 Verificar Header no N8N - Passo a Passo Visual

## ⚠️ ERRO ATUAL
```
"No token provided" - O header x-webhook-secret não está sendo enviado
```

---

## ✅ VERIFICAÇÃO PASSO A PASSO

### 1. Abra o Nó "Buscar Nutrição1"

### 2. Vá na Aba "Parameters"

### 3. Verifique "Send Headers"
- Deve estar **LIGADO** (toggle verde)
- Se estiver desligado, ligue agora

### 4. Verifique "Specify Headers"
- Deve estar como: **"Using Fields Below"**
- Se estiver como "None", mude para "Using Fields Below"

### 5. Verifique "Header Parameters"

Você deve ver uma lista de headers. Procure por:

#### ✅ CORRETO:
```
Name: x-webhook-secret
Value: nutribuddy-secret-2024
```

#### ❌ ERRADO (se aparecer):
```
Name: Authorization
Value: Bearer ...
```
→ **DELETE este header!**

---

## 🔧 SE O HEADER NÃO EXISTIR

### Adicionar Manualmente:

1. Em "Header Parameters", clique em **"+ Add Parameter"** ou **"Add Header"**
2. Configure:
   - **Name:** `x-webhook-secret` (exatamente assim, minúsculas, com hífens)
   - **Value:** `nutribuddy-secret-2024`
3. Salve

---

## 📋 CONFIGURAÇÃO COMPLETA DO NÓ

O nó deve estar assim:

```
Buscar Nutrição1
├── Method: GET
├── URL: https://web-production-c9eaf.up.railway.app/api/nutrition
├── Authentication: None (ou não configurado)
├── Send Headers: ✅ (LIGADO)
├── Specify Headers: "Using Fields Below"
└── Header Parameters:
    └── x-webhook-secret: nutribuddy-secret-2024
```

**NÃO deve ter:**
- ❌ Header `Authorization`
- ❌ Authentication configurado como "Header Auth"

---

## 🧪 TESTE RÁPIDO

Antes de testar no N8N, teste no terminal:

```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

**Se funcionar no terminal mas não funcionar no N8N:**
- O problema é na configuração do nó
- Verifique novamente os passos acima

---

## 🔍 VERIFICAR NOS LOGS DO RAILWAY

Após testar, veja os logs do Railway. Deve aparecer:

```
🔐 [AUTH] Checking authentication: { 
  hasSecret: true, 
  providedSecret: '***', 
  hasAuthHeader: false 
}
✅ [AUTH] Webhook secret validated
```

**Se aparecer:**
```
providedSecret: 'none'
```
→ O header não está sendo enviado. Verifique a configuração do nó.

---

## ⚠️ PROBLEMAS COMUNS

### Problema 1: Header não aparece após importar cURL
**Solução:** Adicione manualmente em Header Parameters

### Problema 2: "Send Headers" está desligado
**Solução:** Ligue o toggle "Send Headers"

### Problema 3: Nome do header errado
**Solução:** Deve ser exatamente `x-webhook-secret` (minúsculas, hífens)

### Problema 4: Valor com espaços
**Solução:** Remova espaços extras no início/fim do valor

---

## ✅ CHECKLIST FINAL

- [ ] Send Headers está LIGADO
- [ ] Specify Headers = "Using Fields Below"
- [ ] Header `x-webhook-secret` existe
- [ ] Valor: `nutribuddy-secret-2024` (sem espaços)
- [ ] Header `Authorization` foi REMOVIDO
- [ ] Authentication = None (ou não configurado)
- [ ] Nó foi SALVO
- [ ] Teste com curl funcionou
- [ ] Teste no N8N funcionou

---

**Verifique cada item acima e teste novamente!**

