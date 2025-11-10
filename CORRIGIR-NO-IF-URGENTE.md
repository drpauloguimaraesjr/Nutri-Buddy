# 🔧 Correção: Erro no Nó "Se Urgente"

## ❌ O Erro

```
compareOperationFunctions[compareData.operation] is not a function
Problem in node 'Se Urgente'
```

**Causa:** O nó IF está usando uma versão incompatível com seu N8N.

---

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Reimportar Workflow Corrigido (MAIS FÁCIL)

1. **Delete o workflow atual**

2. **Importe a nova versão:**
   - Arquivo: **`2-analise-sentimento-openai-v2.json`**
   - Este arquivo tem o nó IF na versão correta

3. **Vincule sua credencial OpenAI** novamente
   - Clique no nó "OpenAI: Analisar Mensagem"
   - Selecione sua credencial
   - Salve

4. **Teste e ative!**

---

### Opção 2: Corrigir Manualmente o Nó Atual

Se preferir não reimportar:

#### 1. Delete o nó "Se Urgente" com problema

1. Clique no nó "Se Urgente"
2. Pressione **Delete** ou **Backspace**

#### 2. Adicione novo nó IF

1. Clique no **+** entre "Parse AI Response" e os próximos nós
2. Busque por **"IF"**
3. Adicione o nó

#### 3. Configure o nó IF

**Na aba Parameters:**

- **Conditions:**
  - Mode: **"Rules"** ou **"Conditions"**
  
- **Add Condition:**
  - **Value 1:** `={{ $json.urgency }}`
  - **Operation:** `equals` ou `=`
  - **Value 2:** `high`

#### 4. Reconectar os nós

1. **Saída TRUE (primeira saída):**
   - Conecte ao nó **"Marcar como Urgente"**

2. **Saída FALSE (segunda saída):**
   - Conecte ao nó **"Atualizar Tags"**

#### 5. Salvar workflow

---

## 🧪 Testar

Após corrigir:

```bash
# Servidor rodando
cd /Users/drpgjr.../NutriBuddy
node server.js

# No N8N: Execute Workflow

# Teste:
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "messageId": "msg-123",
    "patientName": "João",
    "content": "Estou com dor urgente!"
  }'
```

**Resultado esperado:**
- ✅ Nó "Se Urgente" executa sem erro
- ✅ Como tem "urgente", deve ir para "Marcar como Urgente"
- ✅ Todos os nós executam com sucesso

---

## 📊 Como o Nó IF Funciona

### Fluxo:

```
Parse AI Response (urgency: "high")
    ↓
Se Urgente (IF)
    ↓
    ├─ TRUE → Marcar como Urgente → Enviar Alerta
    └─ FALSE → Atualizar Tags
```

### Valores de urgency:

- `"high"` → TRUE → Marca como urgente
- `"medium"` → FALSE → Só atualiza tags
- `"low"` → FALSE → Só atualiza tags

---

## ❌ Por Que Deu Erro?

O N8N tem duas versões principais do nó IF:

### Versão 1 (antiga):
```json
{
  "conditions": {
    "string": [...]
  }
}
```

### Versão 2 (nova):
```json
{
  "conditions": {
    "conditions": [...]
  }
}
```

Seu N8N espera a **Versão 2**, mas o JSON tinha **Versão 1**.

---

## 🔍 Verificar se Funcionou

Depois de corrigir, verifique:

1. ✅ Nó "Se Urgente" sem ícone vermelho
2. ✅ Duas saídas do nó (TRUE e FALSE)
3. ✅ TRUE conectado a "Marcar como Urgente"
4. ✅ FALSE conectado a "Atualizar Tags"
5. ✅ Teste manual passa sem erros

---

## 💡 Dica

Se o problema persistir, use o arquivo **`2-analise-sentimento-openai-v2.json`** que já tem tudo corrigido!

---

## ✅ Checklist

- [ ] Workflow corrigido (reimportado ou nó IF recriado)
- [ ] Credencial OpenAI vinculada
- [ ] Nó "Se Urgente" sem erros
- [ ] Conexões corretas (TRUE e FALSE)
- [ ] Teste executado com sucesso
- [ ] Workflow ativado

---

**Arquivo recomendado:** `2-analise-sentimento-openai-v2.json`

Este arquivo já tem todas as correções! 🎯

