# 🔧 Troubleshooting - Problemas de Conexão

## 📋 Como Diagnosticar

### 1. Abra o Console do Navegador

1. Acesse: https://nutri-buddy-ir2n.vercel.app
2. Pressione **F12** (ou **Cmd+Option+I** no Mac)
3. Vá na aba **Console**
4. Recarregue a página (F5)

### 2. Veja os Logs Detalhados

Você verá logs assim:

```
=== NutriBuddy Iniciado ===
🌐 API Base URL: https://web-production-c9eaf.up.railway.app
🔐 Webhook Secret: ✅ Configurado
📍 Frontend URL: https://nutri-buddy-ir2n.vercel.app
🔍 Verificando conexão com API...
🔄 API Request: { endpoint: '/api/health', method: 'GET' }
📤 Sending request to: https://web-production-c9eaf.up.railway.app/api/health
```

---

## 🐛 Erros Comuns e Soluções

### Erro 1: CORS (Access-Control-Allow-Origin)

**Sintoma:**
```
❌ API Error: Failed to fetch
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Causa:** Backend não está permitindo requisições do Vercel

**Solução:**

1. No Railway, vá em **Variables**
2. Adicione ou atualize:
   ```
   CORS_ORIGIN=https://nutri-buddy-ir2n.vercel.app
   ```
3. Ou use `*` para permitir todos:
   ```
   CORS_ORIGIN=*
   ```
4. Aguarde o deploy (~2 minutos)

---

### Erro 2: 401 Unauthorized

**Sintoma:**
```
❌ Request failed: { error: 'Invalid token' }
📥 Response status: 401 Unauthorized
```

**Causa:** WEBHOOK_SECRET incorreto

**Solução:**

1. Verifique no Railway se `WEBHOOK_SECRET` está como:
   ```
   WEBHOOK_SECRET=nutribuddy-secret-2024
   ```
2. O valor deve ser **exatamente** igual no frontend e backend
3. Aguarde o deploy

---

### Erro 3: API Não Responde

**Sintoma:**
```
❌ API Error: Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**Causa:** API offline ou URL incorreta

**Solução:**

1. Teste a API diretamente:
   ```bash
   curl https://web-production-c9eaf.up.railway.app/api/health
   ```

2. Se não responder:
   - Vá no Railway e verifique se o deploy está "Active"
   - Veja os logs no Railway para erros
   - Verifique se a URL está correta

---

### Erro 4: Network Error / Failed to Fetch (sem CORS)

**Sintoma:**
```
🔥 API Error: TypeError: Failed to fetch
🔥 Error details: { name: 'TypeError', message: 'Failed to fetch' }
```

**Causa:** Problema de rede ou DNS

**Solução:**

1. Verifique sua conexão de internet
2. Tente acessar a URL da API diretamente no navegador
3. Aguarde alguns minutos e tente novamente

---

## ✅ Teste Manual

### Teste 1: Health Check

No console do navegador, cole e execute:

```javascript
fetch('https://web-production-c9eaf.up.railway.app/api/health', {
  headers: {
    'x-webhook-secret': 'nutribuddy-secret-2024'
  }
})
.then(r => r.json())
.then(d => console.log('✅ API OK:', d))
.catch(e => console.error('❌ Erro:', e));
```

**Resultado esperado:**
```
✅ API OK: { status: 'ok', timestamp: '...', service: 'NutriBuddy API' }
```

---

### Teste 2: Criar Refeição

```javascript
fetch('https://web-production-c9eaf.up.railway.app/api/meals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-secret': 'nutribuddy-secret-2024'
  },
  body: JSON.stringify({
    type: 'breakfast',
    name: 'Teste',
    calories: 100,
    protein: 10,
    carbs: 20,
    fats: 5,
    date: '2025-11-05',
    time: '08:00:00'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Refeição criada:', d))
.catch(e => console.error('❌ Erro:', e));
```

---

## 🔍 Verificar Aba Network

1. No DevTools, vá na aba **Network**
2. Recarregue a página
3. Clique em qualquer requisição para `/api/...`
4. Veja:
   - **Status:** deve ser `200` ou `201`
   - **Headers → Response Headers:** deve ter `access-control-allow-origin`
   - **Preview:** veja a resposta da API

---

## 📞 Checklist Completo

- [ ] API está rodando (teste com curl)
- [ ] CORS_ORIGIN configurado no Railway
- [ ] WEBHOOK_SECRET igual no frontend e backend
- [ ] URL da API está correta no frontend
- [ ] Console mostra logs detalhados
- [ ] Aba Network mostra requisições
- [ ] Sem erros de CORS no console
- [ ] Status 200/201 nas requisições

---

## 🆘 Ainda com Problemas?

Compartilhe os logs do console completos, incluindo:
- Mensagem de erro
- Response status
- Headers da requisição
- Aba Network (screenshot)

---

## 📱 Contato

Se nada funcionar, tente:
1. Limpar cache do navegador (Ctrl+Shift+Del)
2. Testar em aba anônima
3. Testar em outro navegador
4. Aguardar 5 minutos (às vezes é propagação de DNS)


