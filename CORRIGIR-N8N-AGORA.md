# 🔧 Correção Rápida para N8N

## ✅ PROBLEMA RESOLVIDO!

O n8n está funcionando! A autenticação via `x-webhook-secret` está operacional.

---

## ❌ Problema Anterior (Resolvido)

No n8n, o header `x-webhook-secret` está configurado incorretamente:
- **ERRADO:** `WEBHOOK_SECRET=nutribuddy-secret-2024`
- **CORRETO:** `nutribuddy-secret-2024`

## ✅ Solução

### 1️⃣ Reiniciar o Servidor Backend ⚠️ **OBRIGATÓRIO**

O servidor precisa ser reiniciado para aplicar as mudanças no middleware:

**Opção A: Manual (Recomendado)**
1. No terminal onde o servidor está rodando, pressione `Ctrl+C` para parar
2. Execute novamente: `npm start`

**Opção B: Matar o processo**
```bash
# Ver o processo atual:
ps aux | grep "[n]ode.*server"

# Matar o processo (substitua PID pelo número que aparecer):
kill <PID>

# Reiniciar:
cd /Users/drpgjr.../NutriBuddy
npm start
```

**⚠️ IMPORTANTE:** O servidor DEVE ser reiniciado para que as mudanças no middleware funcionem!

### 2️⃣ Corrigir o N8N

No n8n, no node **"Buscar Nutrição"**:

1. **Remover o campo "Authentication"** (ou deixar como "None")
   - A autenticação pré-definida está causando conflito

2. **Configurar o Header manualmente:**
   - **Send Headers:** ✅ ON
   - **Specify Headers:** "Using Fields Below"
   - **Header Parameters:**
     - **Name:** `x-webhook-secret`
     - **Value:** `nutribuddy-secret-2024` ⚠️ **SEM** o prefixo `WEBHOOK_SECRET=`

3. **Remover qualquer configuração de "Credential Type"** que tenha o triângulo vermelho

### 3️⃣ Testar

Execute o workflow novamente no n8n. Deve funcionar! ✅

---

## 📋 Resumo da Configuração Correta

**No n8n, para o node "Buscar Nutrição":**

```
Method: GET
URL: https://seu-ngrok-url/api/nutrition

Authentication: None (ou Header Auth sem credential type)

Send Headers: ✅ ON
Header Parameters:
  Name: x-webhook-secret
  Value: nutribuddy-secret-2024
```

---

## 💡 Alternativa: Usar Token Firebase (Opcional)

Se preferir usar token Firebase em vez do webhook secret:

1. Gere o token via API:
   ```bash
   curl http://localhost:3000/api/get-token
   ```

2. No n8n, configure:
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer SEU_TOKEN_AQUI`

Mas o **webhook secret é mais simples** para n8n! 🎯

