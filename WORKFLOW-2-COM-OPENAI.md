# ✅ Workflow 2 - Versão COM OpenAI (Usando Sua Credencial)

## 🎯 Solução Rápida

Você já tem a credencial OpenAI configurada! Vamos usar ela.

---

## 🚀 Passos para Corrigir

### PASSO 1: Deletar Workflow Antigo

1. No N8N, volte para a lista de workflows
2. Delete "NutriBuddy - Análise de Sentimento"

### PASSO 2: Importar Novo Workflow

1. **Add Workflow → Import from File**
2. Selecione: **`2-analise-sentimento-openai.json`**
3. Clique em **Import**

### PASSO 3: Vincular Sua Credencial OpenAI

Este é o passo mais importante!

1. **Clique no nó "OpenAI: Analisar Mensagem"**

2. No painel de configuração, procure por **"Credential to connect with"**

3. **Selecione sua credencial OpenAI** da lista
   - Se aparecer o nome da sua credencial, selecione ela
   - Se não aparecer, clique em "Select Credential" e escolha

4. **Clique em "Save"** no nó

### PASSO 4: Verificar Outros Nós

Certifique-se de que **NENHUM nó tem ícone vermelho de erro**.

Se algum nó HTTP Request tiver erro:
- Clique nele
- Verifique se Authentication = "None"
- Verifique se a URL está correta
- Salve

### PASSO 5: Testar

```bash
# 1. Servidor rodando
cd /Users/drpgjr.../NutriBuddy
node server.js

# 2. No N8N: Execute Workflow → Listen for test event

# 3. Em outro terminal:
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-openai-123",
    "messageId": "msg-openai-123",
    "patientName": "João Silva",
    "content": "Estou com muita dor de cabeça e náuseas desde ontem. Preciso de ajuda urgente!"
  }'
```

**Resultado esperado:**
- ✅ Nó OpenAI executa e retorna análise inteligente
- ✅ Tags relevantes geradas automaticamente
- ✅ Urgência detectada corretamente (HIGH neste caso)
- ✅ Sentimento negativo identificado

---

## 🎯 Vantagens da Versão com OpenAI

### ✅ Análise Muito Mais Precisa
- Entende contexto e nuances
- Detecta urgência de forma inteligente
- Gera tags relevantes automaticamente
- Identifica sentimento com precisão

### ✅ Menos Manutenção
- Não precisa ficar ajustando palavras-chave
- Aprende com o contexto
- Funciona com variações de linguagem
- Entende sinônimos automaticamente

### ✅ Análise Sofisticada
- Detecta sarcasmo e ironia
- Entende mensagens complexas
- Contextualiza melhor
- Gera insights mais profundos

---

## 💰 Custos Estimados

Com GPT-3.5-turbo (configurado no workflow):

- **Por mensagem:** ~$0.0005 (meio centavo de dólar)
- **100 mensagens/mês:** ~$0.05 (5 centavos)
- **500 mensagens/mês:** ~$0.25 (25 centavos)
- **1000 mensagens/mês:** ~$0.50 (50 centavos)

**Muito barato para o valor que traz!** 🎉

---

## 🔧 Configurações do Nó OpenAI

O workflow já está otimizado:

```json
{
  "model": "gpt-3.5-turbo",  // Mais barato e rápido
  "temperature": 0.3          // Mais consistente
}
```

### Se quiser mais precisão (mais caro):

Mude para GPT-4:
1. Clique no nó OpenAI
2. Em "Model", selecione: `gpt-4`
3. Custo: ~$0.03 por mensagem (60x mais caro)

### Se quiser respostas mais criativas:

1. Clique no nó OpenAI
2. Em "Options" → "Temperature"
3. Aumente para 0.5-0.7

---

## 📊 Exemplo de Análise

### Mensagem do Paciente:
```
"Olá! Estou preocupada porque não consigo seguir a dieta direito. 
Tenho comido muito doce à noite e me sinto mal com isso. 
Preciso de ajuda para controlar a ansiedade."
```

### Análise OpenAI:
```json
{
  "urgency": "medium",
  "sentiment": "negative",
  "category": "nutrition",
  "suggestedTags": [
    "ansiedade",
    "dieta",
    "compulsão-alimentar",
    "noturno",
    "suporte-emocional"
  ]
}
```

**Muito melhor que palavras-chave!** A IA entende:
- O contexto emocional (ansiedade)
- O padrão (comer doce à noite)
- A necessidade (suporte emocional)
- A urgência real (medium, não high)

---

## ❌ Troubleshooting

### Problema: "Invalid API key"

**Causa:** Credencial OpenAI está incorreta

**Solução:**
1. Settings → Credentials
2. Encontre sua credencial OpenAI
3. Clique em Edit
4. Verifique a API Key
5. Gere nova chave em: https://platform.openai.com/api-keys

### Problema: "Insufficient quota"

**Causa:** Sem créditos na conta OpenAI

**Solução:**
1. Acesse: https://platform.openai.com/account/billing
2. Adicione créditos ($5 mínimo)
3. Teste novamente

### Problema: Nó OpenAI não executa

**Causa:** Credencial não vinculada ao nó

**Solução:**
1. Clique no nó "OpenAI: Analisar Mensagem"
2. Verifique "Credential to connect with"
3. **IMPORTANTE:** Selecione sua credencial
4. Salve o nó

### Problema: "Cannot parse JSON response"

**Causa:** OpenAI retornou texto em vez de JSON

**Solução:**
O código já tem tratamento de erro. Verifique:
1. Se o prompt está correto (já está otimizado)
2. Se a temperatura não está muito alta
3. Logs do nó "Parse AI Response" para ver o erro exato

### Problema: Análise sempre retorna "low"

**Causa:** Prompt não está claro ou temperatura muito baixa

**Solução:**
1. Aumente temperature para 0.5
2. Adicione mais exemplos no prompt
3. Use GPT-4 para melhor compreensão

---

## 🎨 Personalizar Análise

Quer ajustar como a IA analisa? Edite o prompt!

### Onde encontrar:

1. Clique no nó **"OpenAI: Analisar Mensagem"**
2. Encontre o campo **"Text"**
3. Edite o prompt

### Exemplo de personalização:

**Adicionar nova categoria:**

```
Analise a seguinte mensagem de um paciente e retorne APENAS um JSON válido com:
- urgency: "low", "medium" ou "high"
- sentiment: "positive", "neutral" ou "negative"
- category: "nutrition", "exercise", "doubt", "result", "sleep" ou "other"
  (NOVO: "sleep" para problemas de sono)
- suggestedTags: array de strings com tags em português

Mensagem: "{{$json.content}}"

Retorne apenas o JSON:
```

**Adicionar instruções específicas:**

```
... (prompt existente) ...

IMPORTANTE:
- Marque como "high" APENAS se houver dor intensa, sangue ou emergência
- Para dúvidas simples, use "low"
- Tags devem ser em português e relevantes para nutrição

Mensagem: "{{$json.content}}"
```

---

## 📈 Monitorar Custos

### Ver uso no OpenAI:

1. Acesse: https://platform.openai.com/usage
2. Veja consumo em tempo real
3. Configure alertas de limite
4. Monitore por dia/semana/mês

### Configurar limite:

1. https://platform.openai.com/account/billing/limits
2. Defina limite mensal (ex: $10)
3. Receba alertas ao atingir 80%

---

## 🔄 Workflow Híbrido (Economizar Dinheiro)

Quer economizar? Use IA apenas quando necessário!

### Estratégia:

1. **Análise simples primeiro** (grátis, palavras-chave)
2. **Se detectar caso complexo** → Chama OpenAI
3. **Melhor custo-benefício!**

### Como implementar:

1. Use workflow `2-analise-sentimento-simples.json` primeiro
2. Se tags incluírem "revisar" ou "complexo"
3. Chame este workflow com OpenAI
4. Economize 70% dos custos!

---

## ✅ Checklist

Antes de ativar:

- [ ] Workflow importado (`2-analise-sentimento-openai.json`)
- [ ] Credencial OpenAI vinculada ao nó
- [ ] Teste executado com sucesso
- [ ] Análise faz sentido (urgência, sentimento corretos)
- [ ] Servidor backend rodando
- [ ] Nenhum nó com erro
- [ ] Conta OpenAI com créditos
- [ ] Limite de gastos configurado (recomendado)
- [ ] Workflow ativado

---

## 🎉 Pronto!

Agora você tem:
- ✅ Análise inteligente com IA
- ✅ Detecção precisa de urgência
- ✅ Tags relevantes automáticas
- ✅ Custo muito baixo
- ✅ Menos manutenção

**Ative o workflow e deixe a IA trabalhar para você!** 🚀

---

## 📚 Comparação de Versões

| Versão | Arquivo | Quando Usar |
|--------|---------|-------------|
| **Com OpenAI** | `2-analise-sentimento-openai.json` | Você tem API Key e quer melhor precisão |
| **Sem OpenAI** | `2-analise-sentimento-simples.json` | Quer grátis ou não tem API Key |
| **Original** | `2-analise-sentimento.json` | ⚠️ Tem erros, não usar |

**Você escolheu certo: OpenAI é muito melhor!** 💪

---

**Custo total estimado para 500 pacientes/mês:** ~$0.25 (vinte e cinco centavos de dólar)

**Vale muito a pena!** 🎯

