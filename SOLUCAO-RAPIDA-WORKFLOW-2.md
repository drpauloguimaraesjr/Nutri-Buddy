# ⚡ Solução Rápida - Workflow 2 (Análise de Sentimento)

## 🎯 Problema
4 nós com erro:
- ❌ OpenAI: Analisar Mensagem
- ❌ Marcar como Urgente  
- ❌ Enviar Email de Alerta
- ❌ Atualizar Tags

## ⚠️ IMPORTANTE: Este workflow precisa de API da OpenAI (paga)

**Custo:** ~$0.0005 por mensagem analisada

---

## ✅ Solução em 3 Passos

### PASSO 1: Reimportar Workflow

1. **Delete o workflow atual**
2. **Importe novamente:** `n8n-workflows/2-analise-sentimento.json`

### PASSO 2: Configurar OpenAI

#### 2.1 Obter API Key

1. Acesse: https://platform.openai.com/api-keys
2. Crie conta ou faça login
3. Clique em **"Create new secret key"**
4. Copie a chave (só aparece uma vez!)

#### 2.2 Adicionar no N8N

1. **Settings → Credentials**
2. **Add Credential → OpenAI API**
3. Configure:
   - Name: `OpenAI NutriBuddy`
   - API Key: Cole a chave
4. **Save**

#### 2.3 Vincular ao Nó

1. Clique no nó **"OpenAI: Analisar Mensagem"**
2. Em "Credential to connect with", selecione **"OpenAI NutriBuddy"**
3. **Save**

### PASSO 3: Testar

```bash
# 1. Certifique-se que o servidor está rodando
cd /Users/drpgjr.../NutriBuddy
node server.js

# 2. Em outro terminal, teste o workflow
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "messageId": "msg-123",
    "patientName": "João Silva",
    "content": "Estou com muita dor de cabeça urgente!"
  }'
```

✅ Deve executar todos os nós sem erro!

---

## 💰 Não Quer Gastar com OpenAI?

### Alternativa GRATUITA: Análise por Palavras-Chave

#### 1. Desconectar OpenAI

1. Delete a conexão entre "Webhook" e "OpenAI"
2. Conecte "Webhook" direto ao "Parse AI Response"

#### 2. Modificar código do Parse

Clique no nó **"Parse AI Response"** e substitua TODO o código por:

```javascript
// Análise GRATUITA baseada em palavras-chave
const content = items[0].json.content.toLowerCase();

// Palavras de urgência
const urgentWords = [
  'urgente', 'emergência', 'dor', 'náusea', 'sangue',
  'ajuda', 'grave', 'socorro', 'rápido', 'agora'
];

// Palavras negativas
const negativeWords = [
  'ruim', 'mal', 'pior', 'não consigo', 'difícil',
  'problema', 'dor', 'triste', 'desanimado'
];

// Palavras positivas
const positiveWords = [
  'melhor', 'bem', 'obrigado', 'melhorou', 'ótimo',
  'bom', 'feliz', 'consegui', 'progresso'
];

// Determinar urgência
const isUrgent = urgentWords.some(word => content.includes(word));

// Determinar sentimento
let sentiment = 'neutral';
if (negativeWords.some(word => content.includes(word))) sentiment = 'negative';
if (positiveWords.some(word => content.includes(word))) sentiment = 'positive';

// Determinar categoria
let category = 'other';
if (content.includes('dieta') || content.includes('alimento')) category = 'nutrition';
if (content.includes('exercício') || content.includes('treino')) category = 'exercise';
if (content.includes('dúvida') || content.includes('pergunta')) category = 'doubt';
if (content.includes('resultado') || content.includes('exame')) category = 'result';

// Gerar tags
const tags = [];
if (isUrgent) tags.push('urgente');
tags.push(category);
tags.push(sentiment);

return {
  json: {
    conversationId: items[0].json.conversationId,
    messageId: items[0].json.messageId,
    patientName: items[0].json.patientName || 'Paciente',
    urgency: isUrgent ? 'high' : 'low',
    sentiment: sentiment,
    category: category,
    tags: tags
  }
};
```

#### 3. Salvar e Testar

Agora funciona **SEM CUSTOS** e sem precisar da OpenAI! 🎉

---

## 🧪 Teste Rápido (Versão Gratuita)

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "messageId": "msg-123",
    "patientName": "Maria",
    "content": "Estou com dor de cabeça urgente!"
  }'
```

**Resultado esperado:**
- Urgência: HIGH (contém "dor" e "urgente")
- Sentimento: NEGATIVE (contém "dor")
- Tags: ["urgente", "other", "negative"]

---

## 📊 Comparação: OpenAI vs Palavras-Chave

| Critério | OpenAI (Paga) | Palavras-Chave (Grátis) |
|----------|---------------|-------------------------|
| **Custo** | ~$0.0005/msg | ✅ Grátis |
| **Precisão** | 95% | 70-80% |
| **Velocidade** | 1-3 seg | < 0.1 seg |
| **Contexto** | Entende contexto | Apenas palavras |
| **Idioma** | Multilíngue | Português definido |
| **Setup** | Precisa API Key | ✅ Imediato |

### 💡 Recomendação:

- **Comece com palavras-chave** (grátis, rápido)
- **Upgrade para OpenAI** quando tiver muitos pacientes

---

## ❌ Problemas Comuns

### Se usar OpenAI:

| Erro | Solução |
|------|---------|
| "Invalid API key" | Verifique a chave em platform.openai.com |
| "Insufficient quota" | Adicione créditos ($5 mínimo) |
| Nó ainda com erro | Vincule a credencial OpenAI ao nó |

### Se usar Palavras-Chave:

| Erro | Solução |
|------|---------|
| "Cannot read property" | Verifique se desconectou o nó OpenAI |
| Análise incorreta | Adicione mais palavras-chave relevantes |
| Erro de sintaxe | Copie o código completo novamente |

### Geral:

| Erro | Solução |
|------|---------|
| "Cannot connect localhost:3000" | Inicie: `node server.js` |
| Webhook não dispara | Use a Test URL correta |
| "Cannot parse JSON" | Verifique payload do webhook |

---

## 📋 Checklist Final

**Para versão com OpenAI:**
- [ ] API Key obtida
- [ ] Credencial criada no N8N
- [ ] Credencial vinculada ao nó
- [ ] Créditos na conta OpenAI
- [ ] Teste executado com sucesso
- [ ] Workflow ativado

**Para versão gratuita (palavras-chave):**
- [ ] Nó OpenAI desconectado
- [ ] Código do Parse substituído
- [ ] Palavras-chave customizadas
- [ ] Teste executado com sucesso
- [ ] Workflow ativado

---

## 🚀 Próximos Passos

Depois que funcionar:

1. **Se usar OpenAI:** Monitore custos em platform.openai.com
2. **Se usar palavras-chave:** Ajuste a lista conforme necessário
3. **Implemente rota de alerta** no backend (opcional)
4. **Ative o workflow** (toggle no canto superior direito)
5. **Copie a Production URL** do webhook
6. **Configure no backend** para chamar o webhook

---

## 💡 Dica de Ouro

**Use híbrido:**
1. Comece com palavras-chave (grátis)
2. Se detectar palavras muito complexas → chame OpenAI
3. Melhor custo-benefício! 💰

---

## 📚 Documentação Completa

Para mais detalhes: `CORRECAO-WORKFLOW-2.md`

---

## 🎉 Pronto!

Escolha sua versão (OpenAI ou gratuita) e ative o workflow! 

**Minha recomendação:** Comece com a versão gratuita e teste com casos reais primeiro! 🚀

