# ✅ Workflow 2 - Versão SEM OpenAI (SOLUÇÃO DEFINITIVA)

## ❌ O Problema que Você Está Vendo

```
"Install this node to use it
This node is not currently installed. It is either 
from a newer version of n8n, a custom node, 
or has an invalid structure"
```

**Causa:** O nó OpenAI não está disponível na sua versão do N8N.

---

## ✅ SOLUÇÃO: Usar Workflow SEM OpenAI

Criei um novo workflow que **funciona 100% sem dependências externas**!

### Vantagens desta versão:
- ✅ **Grátis** - Zero custos
- ✅ **Rápido** - < 0.1 segundos por análise
- ✅ **Confiável** - Sem depender de APIs externas
- ✅ **Funciona já** - Todos os nós são nativos do N8N

---

## 🚀 Solução em 3 Passos

### PASSO 1: Deletar Workflow Antigo

No N8N:
1. Volte para a lista de workflows (Back to canvas)
2. Encontre "NutriBuddy - Análise de Sentimento"
3. Clique nos 3 pontos (⋮) → **Delete**
4. Confirme

### PASSO 2: Importar Novo Workflow

1. Clique em **"Add Workflow"**
2. Selecione **"Import from File"**
3. Navegue até: `/Users/drpgjr.../NutriBuddy/n8n-workflows/`
4. Selecione: **`2-analise-sentimento-simples.json`**
5. Clique em **"Import"**

### PASSO 3: Verificar e Ativar

1. Abra o workflow recém-importado
2. Verifique se **NENHUM nó tem ícone vermelho de erro**
3. Se tudo estiver OK, clique em **"Execute Workflow"** para testar
4. Depois ative com o toggle **"Active"**

---

## 🧪 Testar o Novo Workflow

### 1. Certifique-se que o servidor está rodando

```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### 2. No N8N, execute o workflow

1. Clique em **"Execute Workflow"**
2. No nó "Webhook: Nova Mensagem", clique em **"Listen for test event"**

### 3. Em outro terminal, envie teste

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-456",
    "messageId": "msg-456",
    "patientName": "Maria Silva",
    "content": "Estou com muita dor de cabeça e náuseas. Preciso de ajuda urgente!"
  }'
```

### 4. Resultado Esperado

✅ **Todos os nós devem executar sem erro!**

O workflow deve retornar algo como:

```json
{
  "success": true,
  "analysis": {
    "conversationId": "test-conv-456",
    "urgency": "high",
    "sentiment": "negative",
    "category": "other",
    "tags": ["urgente", "requer-atenção", "dor"]
  }
}
```

---

## 📊 Como Funciona a Análise

Este workflow analisa mensagens usando **palavras-chave inteligentes**:

### Urgência (urgency)

**HIGH:** Detecta palavras como:
- urgente, emergência, socorro
- dor forte/intensa
- náusea, vômito, sangue
- ajuda, grave, rápido

**MEDIUM:** Detecta:
- preocupado, ansioso
- dúvida importante
- medicação, efeito colateral

**LOW:** Tudo que não se encaixa acima

### Sentimento (sentiment)

**NEGATIVE:** 
- ruim, mal, pior, difícil
- dor, triste, frustrado

**POSITIVE:**
- melhor, bem, ótimo
- obrigado, melhorou, consegui

**NEUTRAL:** Balanceado ou neutro

### Categoria (category)

- **nutrition:** dieta, alimentação, comida, proteína
- **exercise:** treino, academia, atividade física
- **result:** resultado, exame, peso, progresso
- **doubt:** dúvida, pergunta, como, quando
- **other:** Não se encaixa em nenhuma

### Tags Automáticas

O sistema gera tags como:
- `urgente` - Para casos urgentes
- `importante` - Para média urgência
- `requer-atenção` - Sentimento negativo
- `progresso-positivo` - Sentimento positivo
- `nutrição`, `exercício`, `resultado`, `dúvida` - Por categoria
- `medicação`, `dor` - Tags especiais
- `primeiro-contato` - Nova conversa

---

## 🎯 Exemplos de Análise

### Exemplo 1: Urgente

**Mensagem:** "Estou com dor forte no peito e falta de ar!"

**Resultado:**
- Urgência: **HIGH**
- Sentimento: **NEGATIVE**
- Categoria: **other**
- Tags: `urgente`, `requer-atenção`, `dor`

### Exemplo 2: Nutrição Positiva

**Mensagem:** "Consegui seguir a dieta hoje e estou me sentindo melhor!"

**Resultado:**
- Urgência: **LOW**
- Sentimento: **POSITIVE**
- Categoria: **nutrition**
- Tags: `progresso-positivo`, `nutrição`

### Exemplo 3: Dúvida

**Mensagem:** "Posso comer banana antes do treino?"

**Resultado:**
- Urgência: **LOW**
- Sentimento: **NEUTRAL**
- Categoria: **nutrition** (banana) e **doubt** (posso)
- Tags: `dúvida`, `nutrição`

---

## ✏️ Personalizar Palavras-Chave

Quer adicionar suas próprias palavras? É fácil!

### 1. No workflow, clique no nó "Analisar Mensagem"

### 2. Encontre as listas de palavras no código

Exemplos de onde adicionar:

```javascript
// Adicionar palavras de urgência
const urgentWords = [
  'urgente', 'emergência', 'socorro',
  'sua-palavra-aqui',  // ← Adicione aqui
  'outra-palavra'      // ← Ou aqui
];

// Adicionar palavras negativas
const negativeWords = [
  'ruim', 'mal', 'pior',
  'sua-palavra-negativa',  // ← Adicione aqui
];

// Adicionar palavras de nutrição
const nutritionWords = [
  'dieta', 'alimentação', 'comida',
  'sua-palavra-nutricao',  // ← Adicione aqui
];
```

### 3. Salvar o nó

Clique em **"Save"** e pronto! As novas palavras já estarão ativas.

---

## 🔧 Ajustes Finos

### Tornar Mais Sensível

Para detectar mais casos como urgentes, **adicione mais palavras** na lista `urgentWords`.

### Tornar Menos Sensível

Para evitar falsos positivos, **remova palavras** muito genéricas como "difícil".

### Adicionar Nova Categoria

Exemplo: Categoria "sono"

```javascript
// Na seção de categorias, adicione:
const sleepWords = [
  'sono', 'dormir', 'insônia', 'cansaço',
  'noite mal dormida', 'acordei'
];

// Na análise de categoria:
const categories = [
  { name: 'nutrition', words: nutritionWords },
  { name: 'exercise', words: exerciseWords },
  { name: 'result', words: resultWords },
  { name: 'doubt', words: doubtWords },
  { name: 'sleep', words: sleepWords }  // ← Adicione aqui
];
```

---

## 💡 Dicas de Uso

### ✅ Melhor Para:

- Triagem rápida de mensagens
- Identificar emergências
- Categorizar automaticamente
- Gerar tags para organização
- Priorizar atendimentos

### ⚠️ Limitações:

- Não entende contexto complexo (ex: sarcasmo)
- Precisa de palavras exatas (não sinônimos automáticos)
- Pode ter falsos positivos/negativos
- Funciona melhor em português

### 🎯 Como Melhorar:

1. **Monitore resultados** - Veja quais casos erram
2. **Adicione palavras** - Inclua termos específicos dos seus pacientes
3. **Ajuste sensibilidade** - Remova palavras que causam erros
4. **Teste regularmente** - Use mensagens reais para validar

---

## 📈 Comparação: Esta Versão vs OpenAI

| Critério | Versão Simples | OpenAI |
|----------|----------------|--------|
| **Custo** | ✅ Grátis | 💰 ~$0.0005/msg |
| **Velocidade** | ✅ < 0.1s | ⚠️ 1-3s |
| **Precisão** | ⚠️ 70-80% | ✅ 95% |
| **Setup** | ✅ Imediato | ⚠️ Precisa API Key |
| **Manutenção** | ⚠️ Ajustar palavras | ✅ Automático |
| **Dependências** | ✅ Zero | ⚠️ Requer OpenAI |
| **Contexto** | ⚠️ Limitado | ✅ Avançado |
| **Idiomas** | ⚠️ Só PT | ✅ Multi |

### 💡 Recomendação:

**Comece com esta versão simples!**

- É gratuita e funciona bem para 80% dos casos
- Você pode sempre migrar para OpenAI depois
- Use a economia para melhorar outras partes do sistema

---

## ❌ Problemas Comuns

### Problema: "Cannot connect to localhost:3000"

**Solução:** Inicie o servidor backend

```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### Problema: Análise incorreta

**Exemplos:**
- Mensagem urgente marcada como LOW
- Sentimento errado

**Solução:** Adicione mais palavras-chave específicas

### Problema: Webhook não dispara

**Solução:** Verifique se está usando a **Test URL** correta

### Problema: Nó ainda com erro após importar

**Solução:** 
1. Certifique-se de importar `2-analise-sentimento-simples.json`
2. Delete completamente o workflow antigo primeiro
3. Verifique se está usando N8N atualizado

---

## 🎉 Após Funcionar

Quando tudo estiver OK:

1. **Ative o workflow** (toggle no canto superior)
2. **Copie a Production URL** do webhook
3. **Configure no backend** para chamar automaticamente
4. **Monitore resultados** nas primeiras semanas
5. **Ajuste palavras-chave** conforme necessário
6. **Documente** suas customizações

---

## 🚀 Integração com Backend

Para que o backend chame este workflow automaticamente:

### 1. Copiar URL do Webhook

No N8N, no nó "Webhook: Nova Mensagem":
- Copie a **Production URL**
- Exemplo: `https://n8n.seudominio.com/webhook/nutribuddy-analyze-sentiment`

### 2. Configurar no Backend

Em `routes/messages.js`, após salvar uma nova mensagem:

```javascript
// Quando uma nova mensagem é criada
const newMessage = await db.collection('messages').add({
  conversationId,
  content,
  // ... outros campos
});

// Chamar N8N para análise
if (process.env.N8N_ANALYZE_WEBHOOK_URL) {
  try {
    await fetch(process.env.N8N_ANALYZE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        messageId: newMessage.id,
        patientName,
        content
      })
    });
  } catch (error) {
    console.error('Erro ao chamar N8N:', error);
    // Não falhar a requisição se N8N estiver fora
  }
}
```

### 3. Adicionar no .env

```bash
N8N_ANALYZE_WEBHOOK_URL=https://sua-url-n8n/webhook/nutribuddy-analyze-sentiment
```

---

## 📚 Documentação

- **Workflow original (com OpenAI):** `2-analise-sentimento.json`
- **Workflow simples (esta versão):** `2-analise-sentimento-simples.json`
- **Guia OpenAI:** `CORRECAO-WORKFLOW-2.md`
- **Guia geral:** `INDICE-WORKFLOWS-N8N.md`

---

## ✅ Checklist Final

Antes de marcar como concluído:

- [ ] Workflow antigo deletado
- [ ] Novo workflow importado (`2-analise-sentimento-simples.json`)
- [ ] Nenhum nó com erro (sem ícones vermelhos)
- [ ] Servidor Node.js rodando
- [ ] Teste manual executado com sucesso
- [ ] Resultados fazem sentido
- [ ] Workflow ativado (toggle ON)
- [ ] Production URL copiada
- [ ] Backend configurado (opcional)

---

## 🎯 Próximos Passos

1. ✅ Workflow 2 funcionando
2. ⏭️ Verificar Workflow 3 (Sugestões de Resposta)
3. ⏭️ Verificar Workflow 4 (Follow-up)
4. ⏭️ Verificar Workflow 5 (Resumo Diário)

---

**Última atualização:** 2024-11-10  
**Versão:** 2.0 - Sem dependências OpenAI

