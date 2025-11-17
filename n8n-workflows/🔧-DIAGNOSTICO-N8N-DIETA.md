# 🔧 DIAGNÓSTICO: N8N Workflow de Dieta

## 🚨 PROBLEMA IDENTIFICADO:

**Transcrição genérica ao invés de dados reais do PDF**

### Sintomas:
- ✅ Upload do PDF funciona (Firebase Storage)
- ✅ Webhook responde mas dá erro: `{"message":"Error in workflow"}`
- ❌ Transcrição é texto genérico (fallback)
- ❌ Dados estruturados não são salvos
- ❌ Nenhuma execução aparece no N8N

---

## 🎯 CHECKLIST DE VERIFICAÇÃO:

### **PASSO 1: Verificar se o Workflow está ATIVO**

1. **Acesse o N8N:**
   ```
   https://n8n-production-3eae.up.railway.app
   ```

2. **Procure o workflow:**
   - Nome: **"NutriBuddy - Processar Dieta PDF (GPT-4o Vision)"**
   - Path do webhook: **`nutribuddy-process-diet`**

3. **Verificar o toggle no canto superior direito:**
   - ✅ Deve estar **VERDE/ON** (ATIVO)
   - ❌ Se estiver **CINZA/OFF** → **CLIQUE PARA ATIVAR!**

4. **Verificar o modo:**
   - ✅ Deve estar em **"Production"**
   - ❌ Se estiver em **"Test"** → Mude para Production

---

### **PASSO 2: Verificar Credenciais OpenAI**

O workflow precisa de:

**Credencial:** `OpenAi account`

**Como verificar:**

1. No N8N, clique em **"Credentials"** (menu lateral esquerdo)
2. Procure por: **"OpenAi account"**
3. Verifique se existe e está configurada:
   - ✅ **Existe** e tem API Key válida
   - ❌ **Não existe** → **CRIAR NOVA CREDENCIAL!**

**Se não existir, criar assim:**

1. Clique em **"+ Add Credential"**
2. Escolha: **"OpenAI API"**
3. Preencha:
   - **Name:** `OpenAi account`
   - **API Key:** Sua chave da OpenAI (começa com `sk-...`)
4. Clique em **"Save"**

**Onde pegar a API Key:**
```
https://platform.openai.com/api-keys
```

---

### **PASSO 3: Testar o Workflow Manualmente**

1. **Abra o workflow** no N8N
2. **Clique no node:** "Webhook Recebe PDF1" (primeiro node)
3. **Clique em:** "Listen for Test Event"
4. **No terminal, rode:**

```bash
curl -X POST "https://n8n-production-3eae.up.railway.app/webhook-test/nutribuddy-process-diet" \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://firebasestorage.googleapis.com/v0/b/seu-pdf-real.pdf",
    "patientId": "test-manual",
    "patientName": "Teste Manual"
  }'
```

5. **Observe:**
   - ✅ Cada node deve executar sequencialmente
   - ❌ Se algum node falhar → **VER ERRO!**

---

### **PASSO 4: Verificar Logs de Erro**

1. No N8N, vá em **"Executions"** (menu lateral esquerdo)
2. Procure por execuções **FAILED** (vermelhas)
3. Clique na execução com erro
4. Veja qual node falhou e o erro detalhado

**Erros comuns:**

| Erro | Causa | Solução |
|------|-------|---------|
| `Missing credentials` | OpenAI não configurada | Adicionar credencial |
| `Invalid API key` | Chave OpenAI inválida | Atualizar chave |
| `Insufficient_quota` | Sem créditos OpenAI | Adicionar créditos |
| `Timeout` | PDF muito grande | Aumentar timeout |
| `Failed to fetch PDF` | URL inválida | Verificar Firebase URL |

---

### **PASSO 5: Verificar URL do Backend**

O workflow precisa salvar no backend:

**Node:** "Salvar no Backend/Firestore1"

**URL esperada:**
```
https://web-production-c9eaf.up.railway.app/api/n8n/update-diet-complete
```

**Verificar:**

```bash
curl -X POST "https://web-production-c9eaf.up.railway.app/api/n8n/update-diet-complete" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -d '{"test": true}'
```

**Resposta esperada:**
- ✅ `{"success": true, ...}`
- ❌ `{"error": "..."}` → Backend com problema

---

## 🧪 TESTE COMPLETO PASSO A PASSO:

### **1. Fazer upload de PDF no frontend**
### **2. Verificar logs do N8N:**

No N8N, em **"Executions"**, você DEVE ver:

```
✅ Execution: Webhook triggered
   ↓
✅ GPT-4o Analisa PDF Diretamente1
   ↓
✅ Parse JSON
   ↓
✅ Formatar Resposta
   ↓
✅ Salvar no Backend/Firestore1
   ↓
✅ Responder Webhook1
```

### **3. Verificar resposta no frontend:**

No Console (F12):

```javascript
✅ N8N response: {
  success: true,
  message: "✅ Dieta transcrita com PRECISÃO COMPLETA usando GPT-4o Vision",
  patientId: "...",
  status: "completed",
  model: "gpt-4o-vision",
  resumo: {
    totalCalorias: 1790.36,
    totalRefeicoes: 6,
    totalAlimentos: 25
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS:

1. ✅ **Verificar workflow ATIVO**
2. ✅ **Configurar credencial OpenAI**
3. ✅ **Testar manualmente**
4. ✅ **Verificar logs de erro**
5. ✅ **Fazer upload real e verificar**

---

## 📞 SE AINDA NÃO FUNCIONAR:

**Me mande:**
1. Screenshot do workflow no N8N (mostrando se está ativo)
2. Screenshot da página de Credentials (mostrando OpenAI)
3. Screenshot da última execução com erro
4. Logs do Console (F12) do frontend

---

**Comece pelo PASSO 1 e vá seguindo! 🚀**

