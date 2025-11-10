# 🔧 Correção - Workflow 2 (Análise de Sentimento)

## ❌ Problemas Identificados

O Workflow 2 tem erros em 4 nós:
1. ❌ **OpenAI: Analisar Mensagem** - Configuração incorreta do nó
2. ❌ **Marcar como Urgente** - Falta autenticação/configuração
3. ❌ **Enviar Email de Alerta** - Falta OAuth2 do Gmail
4. ❌ **Atualizar Tags** - Falta autenticação/configuração

---

## ✅ Solução Rápida

### PASSO 1: Deletar e Reimportar

1. **No N8N, delete o workflow atual:**
   - Abra "NutriBuddy - Análise de Sentimento"
   - Menu (⋮) → Delete

2. **Importe a nova versão:**
   - Workflows → Add Workflow → Import from File
   - Selecione: `n8n-workflows/2-analise-sentimento.json`
   - Clique em Import

### PASSO 2: Configurar Credencial OpenAI

Este workflow **requer** uma chave da API OpenAI!

#### 2.1 Obter API Key da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. Dê um nome: `NutriBuddy N8N`
5. **Copie a chave** (só aparece uma vez!)
6. Guarde em local seguro

#### 2.2 Adicionar Credencial no N8N

1. No N8N, vá em **Settings** (ícone engrenagem) → **Credentials**
2. Clique em **"Add Credential"**
3. Busque por **"OpenAI"** ou **"OpenAI API"**
4. Selecione **"OpenAI API"**
5. Configure:
   - **Name**: `OpenAI NutriBuddy`
   - **API Key**: Cole a chave que você copiou
6. Clique em **"Save"**

#### 2.3 Vincular Credencial ao Nó

1. No workflow, clique no nó **"OpenAI: Analisar Mensagem"**
2. No painel de configuração, procure **"Credential to connect with"**
3. Selecione **"OpenAI NutriBuddy"** (a credencial que você criou)
4. Clique em **"Save"** no nó

### PASSO 3: Verificar Nós HTTP Request

Para cada nó HTTP Request (Marcar como Urgente, Enviar Email, Atualizar Tags):

1. **Clique no nó**
2. **Verifique configurações:**
   - Authentication: `None`
   - URL: Deve apontar para `http://localhost:3000/api/messages/...`
3. **Salve o nó**

### PASSO 4: Testar o Workflow

#### 4.1 Certifique-se que o servidor está rodando

```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

#### 4.2 Execute o workflow

1. No N8N, clique em **"Execute Workflow"**
2. No nó Webhook, clique em **"Listen for test event"**
3. Em outro terminal, execute:

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-123",
    "messageId": "msg-123",
    "patientName": "João Silva",
    "content": "Estou com muita dor de cabeça e náuseas desde ontem. Preciso de ajuda urgente!"
  }'
```

#### 4.3 Resultado esperado

✅ **Todos os nós devem executar sem erro**

O workflow deve:
1. ✅ Receber a mensagem
2. ✅ Analisar com OpenAI (retorna JSON com urgência, sentimento, etc)
3. ✅ Fazer parse da resposta
4. ✅ Se urgente → Marcar como urgente + Enviar alerta
5. ✅ Se não urgente → Atualizar tags
6. ✅ Retornar resposta de sucesso

---

## 💰 Sobre Custos da OpenAI

⚠️ **IMPORTANTE:** Este workflow usa a API da OpenAI, que é **paga**.

### Custos aproximados (GPT-3.5-turbo):
- **$0.0005** por mensagem analisada (meio centavo de dólar)
- 1000 análises = ~$0.50 (cinquenta centavos)

### Alternativas gratuitas:

#### Opção 1: Análise Simplificada (sem IA)
Desative o nó OpenAI e use análise baseada em palavras-chave:

```javascript
// No nó "Parse AI Response", substitua o código por:
const content = items[0].json.content.toLowerCase();

// Palavras-chave de urgência
const urgentKeywords = ['urgente', 'emergência', 'dor', 'náusea', 'sangue', 'ajuda'];
const isUrgent = urgentKeywords.some(keyword => content.includes(keyword));

// Palavras-chave de sentimento
const negativeKeywords = ['ruim', 'mal', 'pior', 'não consigo', 'difícil'];
const positiveKeywords = ['melhor', 'bem', 'obrigado', 'melhorou'];

let sentiment = 'neutral';
if (negativeKeywords.some(k => content.includes(k))) sentiment = 'negative';
if (positiveKeywords.some(k => content.includes(k))) sentiment = 'positive';

return {
  json: {
    conversationId: items[0].json.conversationId,
    messageId: items[0].json.messageId,
    patientName: items[0].json.patientName || 'Paciente',
    urgency: isUrgent ? 'high' : 'low',
    sentiment: sentiment,
    category: 'other',
    tags: isUrgent ? ['urgente'] : ['normal']
  }
};
```

#### Opção 2: Usar apenas quando necessário
Configure o workflow para analisar apenas:
- Primeiras mensagens de uma conversa
- Mensagens com palavras-chave específicas
- Mensagens de novos pacientes

---

## 🧪 Teste sem OpenAI (Temporário)

Para testar o fluxo sem gastar créditos:

### 1. Desconectar nó OpenAI

1. Clique na conexão entre "Webhook" e "OpenAI"
2. Delete a conexão
3. Conecte "Webhook" diretamente ao "Parse AI Response"

### 2. Modificar código do Parse

No nó "Parse AI Response", use dados mockados:

```javascript
// Mock response para teste
return {
  json: {
    conversationId: items[0].json.conversationId,
    messageId: items[0].json.messageId,
    patientName: items[0].json.patientName || 'Paciente',
    urgency: 'high', // Teste o fluxo urgente
    sentiment: 'negative',
    category: 'doubt',
    tags: ['teste', 'urgente']
  }
};
```

### 3. Testar

Execute o workflow - todos os nós devem funcionar sem chamar OpenAI.

---

## 🔐 Configurar Email de Alerta (Opcional)

O nó "Enviar Email de Alerta" atualmente usa uma API do backend. Se quiser usar Gmail diretamente:

### Opção 1: Manter API do Backend (Recomendado)

O nó já está configurado para chamar:
```
POST http://localhost:3000/api/messages/webhook/urgent-alert
```

Você precisa implementar essa rota no backend:

```javascript
// Em routes/messages.js, adicione:
router.post('/webhook/urgent-alert', async (req, res) => {
  const { conversationId, patientName, urgency } = req.body;
  
  // Aqui você pode:
  // 1. Enviar email via nodemailer
  // 2. Enviar notificação push
  // 3. Enviar SMS via Twilio
  // 4. Registrar no banco de dados
  
  console.log(`⚠️ ALERTA URGENTE: ${patientName} - Conversa: ${conversationId}`);
  
  res.json({ success: true });
});
```

### Opção 2: Usar Gmail OAuth2 no N8N

1. Configure credencial Gmail OAuth2 (veja próxima seção)
2. Substitua o nó "Enviar Email de Alerta" por um nó Gmail
3. Configure:
   - **To**: Seu email
   - **Subject**: `⚠️ Mensagem Urgente - NutriBuddy`
   - **Message**: `Paciente {{$json.patientName}} enviou mensagem urgente`

---

## 📋 Checklist de Verificação

Antes de ativar o workflow:

- [ ] Workflow reimportado
- [ ] Credencial OpenAI criada e configurada
- [ ] API Key da OpenAI válida e com créditos
- [ ] Nó OpenAI vinculado à credencial
- [ ] Nós HTTP Request sem erros
- [ ] Servidor Node.js rodando (localhost:3000)
- [ ] Teste manual executado com sucesso
- [ ] Decidido sobre uso da OpenAI (paga vs. gratuita)

---

## ❌ Problemas Comuns

### Erro: "Invalid API key"

**Causa:** API Key da OpenAI incorreta ou inválida

**Solução:**
1. Verifique se copiou a chave completa
2. Gere uma nova chave em https://platform.openai.com/api-keys
3. Atualize a credencial no N8N

### Erro: "Insufficient quota"

**Causa:** Sem créditos na conta OpenAI

**Solução:**
1. Acesse https://platform.openai.com/account/billing
2. Adicione créditos (mínimo $5)
3. OU use a alternativa sem IA (veja acima)

### Erro: "Cannot parse JSON"

**Causa:** OpenAI retornou resposta em formato não-JSON

**Solução:**
O código do "Parse AI Response" já tem tratamento de erro. Verifique:
1. Se o prompt está correto
2. Se a temperatura não está muito alta (máx 0.5)
3. Adicione mais instruções para retornar apenas JSON

### Erro: "Cannot connect to localhost:3000"

**Causa:** Servidor backend não rodando

**Solução:**
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

---

## 🚀 Após Corrigir

O workflow estará pronto para:

1. 📥 Receber mensagens de pacientes
2. 🤖 Analisar com IA (urgência, sentimento, categoria)
3. 🏷️ Adicionar tags automaticamente
4. ⚠️ Alertar em caso de urgência
5. 📊 Categorizar para relatórios

---

## 💡 Dicas de Uso

### Quando usar este workflow:

✅ Para cada nova mensagem de paciente
✅ Para priorizar atendimentos
✅ Para identificar emergências
✅ Para categorizar conversas

### Quando NÃO usar:

❌ Para todas as mensagens (custo alto)
❌ Para mensagens de teste
❌ Para mensagens do prescritor

### Otimização de custos:

1. Use apenas para primeira mensagem de cada conversa
2. Use GPT-3.5-turbo (mais barato que GPT-4)
3. Implemente cache para conversas recentes
4. Use análise simples para casos óbvios

---

## 📚 Próximos Passos

1. **Teste o workflow** com mensagens reais
2. **Ajuste o prompt** da OpenAI se necessário
3. **Implemente a rota de alerta** no backend
4. **Configure notificações** (email, push, SMS)
5. **Monitore custos** da OpenAI
6. **Ative o workflow** quando estiver satisfeito

---

## 🆘 Precisa de Ajuda?

1. Verifique os logs do N8N (aba "Executions")
2. Teste cada nó individualmente
3. Confirme que credenciais estão configuradas
4. Verifique saldo da conta OpenAI

**Para análise sem IA:** Use a alternativa gratuita baseada em palavras-chave!

