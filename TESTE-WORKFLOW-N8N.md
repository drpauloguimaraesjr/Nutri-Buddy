# 🧪 Teste do Workflow N8N - Passo a Passo

## 🎯 Situação Atual

Você está vendo "Waiting for trigger event" - isso significa que o workflow está esperando receber uma chamada HTTP no webhook.

## ✅ Solução: Testar o Webhook

### PASSO 1: Copiar a URL do Webhook

No N8N, no nó **"Webhook: Nova Conversa"**:

1. Clique no nó "Webhook: Nova Conversa"
2. No painel de configuração, você verá duas URLs:
   - **Production URL** (para usar quando ativar)
   - **Test URL** (para testar agora)

3. Copie a **Test URL** - deve ser algo como:
   ```
   http://localhost:5678/webhook-test/nutribuddy-new-conversation
   ```

### PASSO 2: Enviar Teste Manual

Abra um terminal e execute:

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-123",
    "patientId": "patient-123",
    "prescriberId": "prescriber-123"
  }'
```

⚠️ **IMPORTANTE:** Substitua a URL pela Test URL que você copiou!

### PASSO 3: Verificar Resultado

No N8N, você deve ver:

1. ✅ O nó "Webhook: Nova Conversa" ficará verde
2. ⏱️ O nó "Aguardar 2 Minutos" começará a contar
3. Depois verá se há erros nos próximos nós

---

## 🔍 Se AINDA Houver Erros nos Nós HTTP

### Problema: Nó "Verificar se Prescritor Respondeu" com erro

**Causa:** O servidor backend não está rodando OU a URL está incorreta.

**Solução 1: Iniciar o servidor**

```bash
# Em um novo terminal
cd /Users/drpgjr.../NutriBuddy
node server.js
```

Deve aparecer: `Server running on port 3000`

**Solução 2: Simplificar o teste temporariamente**

1. Clique no nó "Verificar se Prescritor Respondeu"
2. Mude temporariamente a URL para:
   ```
   https://jsonplaceholder.typicode.com/todos/1
   ```
3. Salve
4. Execute o teste novamente

Isso vai testar se o problema é o nó em si ou o servidor backend.

---

## 🔧 Configurar Nós HTTP Request Corretamente

### Para o nó "Verificar se Prescritor Respondeu":

1. **Clique no nó**
2. **Configurações:**
   - Method: `GET`
   - URL: `http://localhost:3000/api/messages/conversations/{{$json.conversationId}}`
   - Authentication: `None`
3. **Clique em "Save"**

### Para o nó "Enviar Auto-resposta":

1. **Clique no nó**
2. **Configurações:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/messages/webhook/ai-response`
   - Authentication: `None`
   - Body Content Type: `JSON`
   - Specify Body: `Using JSON`
   - JSON Body:
   ```json
   {
     "conversationId": "={{$json.conversationId}}",
     "content": "Olá! 👋 Recebi sua mensagem e vou responder em breve.",
     "aiContext": {
       "type": "auto-response",
       "reason": "prescriber-delayed"
     }
   }
   ```
3. **Clique em "Save"**

---

## 🎬 Teste Completo (Sem Esperar 2 Minutos)

Para testar mais rápido, vamos reduzir o tempo de espera:

### 1. Modificar tempo de espera

1. Clique no nó "Aguardar 2 Minutos"
2. Mude de `2 minutes` para `10 seconds`
3. Salve

### 2. Executar teste

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-conv-123",
    "patientId": "patient-123",
    "prescriberId": "prescriber-123"
  }'
```

### 3. Observar execução

Em 10 segundos, você verá todos os nós executarem.

---

## ❌ Erros Comuns e Soluções

### Erro 1: "Cannot read property 'conversationId' of undefined"

**Problema:** O webhook não está recebendo os dados corretamente.

**Solução:** Verifique se o JSON que você está enviando está correto:
```json
{
  "conversationId": "test-123"
}
```

### Erro 2: "ECONNREFUSED localhost:3000"

**Problema:** Servidor backend não está rodando.

**Solução:**
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### Erro 3: "404 Not Found"

**Problema:** A rota não existe no servidor.

**Solução:** Verifique se o arquivo `routes/messages.js` está carregado no `server.js`:

```bash
# Ver se a rota está registrada
grep -n "messages" /Users/drpgjr.../NutriBuddy/server.js
```

Deve ter algo como:
```javascript
app.use('/api/messages', messagesRouter);
```

### Erro 4: Webhook não dispara

**Problema:** URL do webhook incorreta.

**Solução:** 
1. No nó Webhook, verifique o **Path**: deve ser `nutribuddy-new-conversation`
2. Use a URL exata que aparece no painel do N8N

---

## 🎯 Teste Mínimo Viável

Se ainda não funcionar, vamos testar cada nó isoladamente:

### Teste 1: Só o Webhook

1. No N8N, crie um workflow novo temporário
2. Adicione apenas um nó Webhook
3. Configure o path: `test-webhook`
4. Execute e teste:
   ```bash
   curl -X POST http://localhost:5678/webhook-test/test-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "hello"}'
   ```

Se isso funcionar, o problema está nos nós HTTP Request.

### Teste 2: Nó HTTP Request isolado

1. Crie workflow novo
2. Adicione nó "HTTP Request"
3. Configure:
   - URL: `https://jsonplaceholder.typicode.com/todos/1`
   - Method: GET
4. Execute manualmente (botão play no nó)

Se isso funcionar, o problema é a conexão com seu servidor local.

---

## 🆘 Debug Avançado

### Ver logs do N8N

No N8N:
1. Menu lateral → **Executions**
2. Clique na última execução
3. Veja os detalhes de cada nó
4. Procure mensagens de erro específicas

### Ver logs do servidor

No terminal onde está rodando o servidor:
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

Observe se aparecem requisições quando o workflow executa.

---

## ✅ Checklist de Verificação

Antes de testar novamente:

- [ ] N8N está rodando (localhost:5678)
- [ ] Servidor Node.js está rodando (localhost:3000)
- [ ] Workflow está em modo "Execute Workflow"
- [ ] Nó Webhook mostra "Waiting for trigger event"
- [ ] URL do webhook está correta
- [ ] JSON do teste está correto
- [ ] Nós HTTP Request não têm ícone vermelho de erro

---

## 🚀 Após Funcionar

Quando o teste passar com sucesso:

1. **Volte o tempo de espera para 2 minutos**
2. **Ative o workflow** (toggle no canto superior direito)
3. **Copie a Production URL** do webhook
4. **Configure no backend** (arquivo `.env`):
   ```
   N8N_WEBHOOK_URL=SUA_PRODUCTION_URL_AQUI
   ```

---

## 📞 Me Informe

Após tentar, me diga:

1. ✅ O webhook recebeu a chamada? (nó ficou verde?)
2. ❌ Qual nó está com erro? (qual tem ícone vermelho?)
3. 📋 Qual a mensagem de erro exata? (clique no nó com erro)
4. 🖥️ O servidor Node.js está rodando?

Com essas informações posso ajudar melhor! 🎯

