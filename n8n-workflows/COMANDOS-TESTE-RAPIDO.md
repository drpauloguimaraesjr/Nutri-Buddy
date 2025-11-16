# ⚡ COMANDOS DE TESTE RÁPIDO

**Use estes comandos para testar antes e depois da correção**

---

## 🔴 TESTE ANTES DA CORREÇÃO

### **1. Ver o problema atual:**

```bash
curl -I -X OPTIONS https://web-production-c9eaf.up.railway.app/api/messages/conversations \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" \
  | grep -i "access-control-allow-origin"
```

**Resultado esperado (ERRADO):**
```
access-control-allow-origin: https://nutri-buddy-ir2h.vercel.app/
```
❌ Note: `ir2h` ao invés de `ir2n` e `/` no final

---

## ✅ TESTE DEPOIS DA CORREÇÃO

### **1. Ver se corrigiu:**

```bash
curl -I -X OPTIONS https://web-production-c9eaf.up.railway.app/api/messages/conversations \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" \
  | grep -i "access-control-allow-origin"
```

**Resultado esperado (CORRETO):**
```
access-control-allow-origin: https://nutri-buddy-ir2n.vercel.app
```
✅ Note: `ir2n` e SEM `/` no final

---

## 🧪 TESTE COMPLETO (DIAGNÓSTICO)

### **Rodar script de diagnóstico completo:**

```bash
cd /Users/drpgjr.../NutriBuddy/n8n-workflows
bash test-cors-issue.sh
```

**Antes da correção:**
```
⚠️  Origem diferente: https://nutri-buddy-ir2h.vercel.app/
→ Deveria ser: https://nutri-buddy-ir2n.vercel.app
```

**Depois da correção:**
```
✅ CORS configurado!
   Allowed Origin: https://nutri-buddy-ir2n.vercel.app
   ✅ Origem permitida corretamente!
```

---

## 🌐 TESTE NO NAVEGADOR

### **1. Abrir DevTools:**

```
Chrome/Edge: F12
Firefox: F12
Safari: Cmd+Option+I
```

### **2. Ir para aba Console:**

```
Console (aba superior)
```

### **3. Rodar este comando:**

```javascript
fetch('https://web-production-c9eaf.up.railway.app/api/messages/conversations', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer fake-token-for-test'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Funcionou:', d))
.catch(e => console.error('❌ Erro:', e.message));
```

**ANTES da correção:**
```
❌ Erro: Failed to fetch
```

**DEPOIS da correção:**
```
✅ Funcionou: {error: "Invalid token"} 
← Isso é correto! Rejeita token fake mas aceita requisição
```

---

## 📊 TESTE DE CONECTIVIDADE

### **1. Backend está online?**

```bash
curl https://web-production-c9eaf.up.railway.app/
```

**Esperado:**
```json
{
  "message": "NutriBuddy API Server",
  "version": "1.0.0",
  "status": "running"
}
```

### **2. Endpoint existe?**

```bash
curl https://web-production-c9eaf.up.railway.app/api/messages/conversations
```

**Esperado:**
```json
{"error":"No token provided"}
```
✅ Correto! Endpoint existe e pede autenticação

### **3. Tempo de resposta:**

```bash
curl -w "\nTempo: %{time_total}s\n" -s -o /dev/null \
  https://web-production-c9eaf.up.railway.app/
```

**Esperado:**
```
Tempo: 0.123s
```
✅ Menos de 1 segundo = ótimo!

---

## 🔍 TESTE CORS ESPECÍFICO

### **Simular requisição do frontend:**

```bash
curl -X GET https://web-production-c9eaf.up.railway.app/api/messages/conversations \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test" \
  -v 2>&1 | grep -i "access-control"
```

**ANTES (bloqueado):**
```
< access-control-allow-origin: https://nutri-buddy-ir2h.vercel.app/
```
❌ Origem não bate → CORS bloqueia

**DEPOIS (permitido):**
```
< access-control-allow-origin: https://nutri-buddy-ir2n.vercel.app
```
✅ Origem bate → CORS permite

---

## 🎯 TESTE FINAL (INTEGRAÇÃO)

### **1. Abrir site:**
```
https://nutri-buddy-ir2n.vercel.app/dashboard/chat
```

### **2. Fazer login**

### **3. Abrir DevTools:**
- F12 → Network
- Recarregar página (Ctrl+R)

### **4. Procurar requisição:**
```
Procure: conversations
Status: 200 OK ✅
```

### **5. Ver resposta:**
```json
{
  "conversations": [...]
}
```
✅ Lista de conversas carregou!

---

## 📋 CHECKLIST DE TESTES

**Antes de corrigir:**
- [ ] Rodei `test-cors-issue.sh`
- [ ] Confirmei origem errada: `ir2h`
- [ ] Teste no navegador falhou

**Depois de corrigir:**
- [ ] Editei CORS_ORIGIN no Railway
- [ ] Aguardei deploy (1-2 min)
- [ ] Rodei `test-cors-issue.sh` novamente
- [ ] Confirmei origem correta: `ir2n`
- [ ] Teste no navegador funcionou
- [ ] Site carrega conversas! ✅

---

## 💻 COMANDO ALL-IN-ONE

**Rode este comando único para testar tudo:**

```bash
echo "🔍 TESTE COMPLETO CORS" && \
echo "" && \
echo "1️⃣ Backend online?" && \
curl -s https://web-production-c9eaf.up.railway.app/ | grep -q "running" && echo "✅ SIM" || echo "❌ NÃO" && \
echo "" && \
echo "2️⃣ Endpoint existe?" && \
curl -s https://web-production-c9eaf.up.railway.app/api/messages/conversations | grep -q "error" && echo "✅ SIM" || echo "❌ NÃO" && \
echo "" && \
echo "3️⃣ CORS configurado?" && \
CORS_HEADER=$(curl -sI -X OPTIONS https://web-production-c9eaf.up.railway.app/api/messages/conversations -H "Origin: https://nutri-buddy-ir2n.vercel.app" | grep -i "access-control-allow-origin" | cut -d: -f2- | tr -d '[:space:]') && \
echo "   Permitido: $CORS_HEADER" && \
if [ "$CORS_HEADER" = "https://nutri-buddy-ir2n.vercel.app" ]; then \
  echo "   ✅ CORRETO!"; \
else \
  echo "   ❌ ERRADO! (deveria ser: https://nutri-buddy-ir2n.vercel.app)"; \
fi && \
echo "" && \
echo "✅ TESTE CONCLUÍDO!"
```

**ANTES da correção:**
```
1️⃣ Backend online? ✅ SIM
2️⃣ Endpoint existe? ✅ SIM
3️⃣ CORS configurado?
   Permitido: https://nutri-buddy-ir2h.vercel.app/
   ❌ ERRADO! (deveria ser: https://nutri-buddy-ir2n.vercel.app)
```

**DEPOIS da correção:**
```
1️⃣ Backend online? ✅ SIM
2️⃣ Endpoint existe? ✅ SIM
3️⃣ CORS configurado?
   Permitido: https://nutri-buddy-ir2n.vercel.app
   ✅ CORRETO!
```

---

## 🚀 ATALHOS

### **Diagnóstico rápido:**
```bash
bash test-cors-issue.sh
```

### **Testar CORS:**
```bash
curl -I -X OPTIONS https://web-production-c9eaf.up.railway.app/api/messages/conversations \
  -H "Origin: https://nutri-buddy-ir2n.vercel.app" | grep access-control
```

### **Testar backend:**
```bash
curl https://web-production-c9eaf.up.railway.app/
```

---

**Salve este arquivo e use sempre que precisar testar!** 🎯

