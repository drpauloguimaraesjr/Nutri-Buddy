# 🧪 Como Testar os Workflows N8N

## 📋 Pré-requisitos

Antes de testar, certifique-se:

✅ Backend rodando: `node server.js` (porta 3000)  
✅ N8N rodando: Docker ou `n8n start` (porta 5678)  
✅ WEBHOOK_SECRET configurado no backend (`.env`)  
✅ Workflows importados no n8n

---

## 🎯 Teste 1: Endpoint de Teste do Backend

### Primeiro, teste se o backend está respondendo:

```bash
# Health check
curl http://localhost:3000/api/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"...","service":"NutriBuddy API"}
```

### Teste o endpoint fake de contexto:

```bash
curl http://localhost:3000/api/messages/webhook/test-context \
  -H "x-webhook-secret: nutribuddy-secret-2024"
```

**Resultado esperado:**
```json
{
  "success": true,
  "context": {
    "conversation": {...},
    "messages": [...],
    "patient": {
      "name": "Maria Silva",
      "age": 32,
      ...
    }
  }
}
```

✅ Se isso funcionar, seu backend está OK!

---

## 🧪 Teste 2: Workflow 2 (Análise de Sentimento)

### Método 1: Teste Manual no N8N

1. Abra o **Workflow 2** no n8n
2. Clique em **"Execute Workflow"**
3. Na janela "Workflow Starter", clique em **"Use Test Data"**
4. Cole estes dados:

```json
{
  "conversationId": "conv-test-001",
  "messageId": "msg-test-001",
  "patientName": "João Silva",
  "content": "Estou com muita dor e preciso de ajuda urgente!"
}
```

5. Clique em **"Execute"**

### Método 2: Teste com Curl

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-test-001",
    "messageId": "msg-test-001",
    "patientName": "João Silva",
    "content": "Estou com muita dor e preciso de ajuda urgente!"
  }'
```

### Resultado Esperado

✅ **Workflow executa todos os nós**  
✅ **OpenAI analisa a mensagem**  
✅ **IF detecta que é urgente (high)**  
✅ **Tenta marcar como urgente** (pode dar erro de "conversation not found", mas isso é OK!)

**Observar:**
- Nó "Parse AI Response" deve ter:
  - `urgency: "high"`
  - `sentiment: "negative"`
  - `category: "other"`
  - `tags: ["dor", "urgente", "ajuda"]`

---

## 🧪 Teste 3: Workflow 3 (Sugestões IA)

### IMPORTANTE: Teste com Dados FAKE

Para testar sem precisar de conversa real, modifique o workflow TEMPORARIAMENTE:

#### No N8N, edite o nó "Buscar Contexto da Conversa":

**URL atual:**
```
http://host.docker.internal:3000/api/messages/webhook/conversation-context/{{$json.body.conversationId}}
```

**Mude para (TEMPORÁRIO):**
```
http://host.docker.internal:3000/api/messages/webhook/test-context
```

✅ Agora vai usar dados fake!

### Teste com Curl

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "qualquer-id"}'
```

### Resultado Esperado

✅ **Busca contexto fake** (Maria Silva, 32 anos, intolerância a lactose)  
✅ **OpenAI gera 3 sugestões** baseadas no contexto  
✅ **Retorna JSON com suggestions**

**Exemplo de resposta:**
```json
{
  "success": true,
  "suggestions": [
    {
      "text": "Olá Maria! Que ótimo saber que você quer ganhar energia. Com sua intolerância à lactose, vamos focar em alimentos alternativos ricos em cálcio...",
      "tone": "professional"
    },
    {
      "text": "Fico feliz em ajudar você nessa jornada! Vamos juntos encontrar alimentos que te dêem energia sem causar desconforto.",
      "tone": "friendly"
    },
    {
      "text": "Você está no caminho certo! Com as mudanças que vamos fazer, você vai se surpreender com o ganho de disposição!",
      "tone": "motivational"
    }
  ]
}
```

### Depois dos Testes, VOLTE a URL original!

```
http://host.docker.internal:3000/api/messages/webhook/conversation-context/{{$json.body.conversationId}}
```

---

## 🧪 Teste 4: Workflow 1 (Auto-resposta)

### Teste com Curl

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "conv-test-002"}'
```

### O Que Acontece

1. ⏰ **Aguarda 2 minutos** (você vai ver o workflow "em progresso")
2. 🔍 **Verifica se nutricionista respondeu** (GET na conversa)
3. ❓ **IF:** Prescritor respondeu?
   - **NÃO** → Envia auto-resposta
   - **SIM** → Não faz nada

**DICA:** 2 minutos é muito tempo para teste! No n8n, clique no nó "Aguardar 2 Minutos" e mude para `10 seconds` para testar mais rápido!

---

## 🧪 Teste 5: Workflows Agendados (4 e 5)

Esses workflows rodam automaticamente, mas você pode testar manualmente:

### No N8N:

1. Abra o **Workflow 4** ou **5**
2. Clique em **"Execute Workflow"**
3. Clique em **"Execute"**

**Workflow 4** (Follow-up):
- Busca conversas resolvidas há 7+ dias
- Envia follow-up automático

**Workflow 5** (Resumo Diário):
- Busca todas as conversas
- Gera email HTML com estatísticas
- Envia para o nutricionista

---

## 🎯 Teste Completo Workflow 2 + 3 (Integração)

### Cenário Realista:

1. **Paciente envia mensagem urgente**
2. **Workflow 2** analisa e detecta urgência
3. **Sistema marca como urgente**
4. **Nutricionista abre conversa**
5. **Nutricionista clica em "Sugerir Respostas"**
6. **Workflow 3** gera 3 sugestões baseadas no histórico

### Teste com Curl (simulação):

```bash
# 1. Analisar mensagem urgente
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-real-123",
    "messageId": "msg-456",
    "patientName": "Maria Silva",
    "content": "Estou passando muito mal, preciso de ajuda!"
  }'

# 2. (Sistema marca como urgente automaticamente)

# 3. Solicitar sugestões de resposta
curl -X POST http://localhost:5678/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "conv-real-123"}'
```

---

## 📊 Checklist de Testes

### Workflow 2 (Análise)
- [ ] OpenAI responde (credencial configurada?)
- [ ] Parse funciona (extrai JSON corretamente?)
- [ ] IF funciona (detecta urgency = "high"?)
- [ ] Headers de autenticação estão corretos?

### Workflow 3 (Sugestões)
- [ ] Endpoint test-context funciona?
- [ ] URL está pegando conversationId corretamente?
- [ ] OpenAI gera 3 sugestões?
- [ ] Parse retorna suggestions array?

### Workflow 1 (Auto-resposta)
- [ ] Wait funciona (aguarda tempo configurado)?
- [ ] GET conversa funciona?
- [ ] IF detecta se respondeu?
- [ ] POST auto-resposta funciona?

### Geral
- [ ] Backend responde na porta 3000?
- [ ] N8N responde na porta 5678?
- [ ] WEBHOOK_SECRET está configurado?
- [ ] Docker n8n acessa host.docker.internal?

---

## ❌ Problemas Comuns

### "Route not found"
- Backend não está rodando
- URL errada no workflow
- WEBHOOK_SECRET não configurado

### "The service refused the connection"
- Use `host.docker.internal` ao invés de `localhost`
- Backend não está acessível do Docker

### "No token provided"
- Header `x-webhook-secret` não está sendo enviado
- Valor diferente do configurado no `.env`

### "Conversation not found"
- Normal em testes! Significa que a autenticação funcionou
- Use dados fake ou crie uma conversa real

### OpenAI erro
- Credencial não configurada
- API key inválida ou sem créditos
- Quota excedida

---

## 🎉 Teste Final: Tudo Funcionando!

Se todos os workflows passarem nesses testes, está tudo pronto! 🚀

**Próximo passo:** Integrar com o frontend para chamar esses webhooks quando necessário.

---

## 💡 Dicas

1. **Use o console do n8n** para ver dados em cada nó
2. **Logs do backend** mostram requisições recebidas
3. **Chrome DevTools** (Network tab) para debug do frontend
4. **Postman** ou **Insomnia** como alternativa ao curl

---

**Criado em:** 10/11/2024  
**Status:** Pronto para testes! 🧪

