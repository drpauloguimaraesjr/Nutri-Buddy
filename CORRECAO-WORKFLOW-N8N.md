# 🔧 Correção de Erros - Workflow N8N

## ❌ Problema Identificado

O workflow 1 (Auto-resposta Inicial) está com erros nos seguintes nós:
- ❌ "Verificar se Prescritor Respondeu"
- ❌ "Enviar Auto-resposta"

## ✅ Solução

### Opção 1: Reimportar Workflow Corrigido (RECOMENDADO)

O arquivo foi atualizado. Siga estes passos:

#### 1. Deletar workflow antigo
1. No N8N, abra o workflow "NutriBuddy - Auto-resposta Inicial"
2. Clique nos 3 pontos (menu) no canto superior direito
3. Selecione **"Delete"**
4. Confirme a exclusão

#### 2. Importar nova versão
1. Clique em **"Workflows"** (menu lateral)
2. Clique em **"Add Workflow"** → **"Import from File"**
3. Selecione: `/Users/drpgjr.../NutriBuddy/n8n-workflows/1-autoresposta-inicial.json`
4. Clique em **"Import"**

#### 3. Configurar credenciais (se necessário)

Se os nós ainda mostrarem erro, você precisa configurar a autenticação:

**Para cada nó HTTP Request com erro:**

1. Clique no nó com erro
2. No painel de configuração, procure por **"Authentication"**
3. Se estiver configurado como "Predefined Credential Type":
   - Clique em **"Select Credential"**
   - Se não houver nenhuma credencial, clique em **"Create New"**
   
4. **Criar credencial HTTP Header Auth:**
   - Name: `NutriBuddy API Auth`
   - Header Name: `Authorization`
   - Header Value: `Bearer SEU_TOKEN_FIREBASE_AQUI`
   - Clique em **"Save"**

5. Selecione a credencial recém-criada
6. Clique em **"Save"** no nó

#### 4. Verificar URLs

Certifique-se de que as URLs estão corretas nos nós HTTP Request:

**Nó "Verificar se Prescritor Respondeu":**
```
http://localhost:3000/api/messages/conversations/{{$json.conversationId}}
```

**Nó "Enviar Auto-resposta":**
```
http://localhost:3000/api/messages/webhook/ai-response
```

⚠️ **IMPORTANTE:** Certifique-se de que:
- O servidor Node.js está rodando na porta 3000
- Se estiver usando porta diferente, atualize as URLs

---

### Opção 2: Corrigir Manualmente (Alternativa)

Se preferir não reimportar, pode corrigir manualmente:

#### 1. Corrigir nó "Verificar se Prescritor Respondeu"

1. Clique no nó
2. Em **"Authentication"**, selecione **"None"** (para teste inicial)
3. Em **"URL"**, verifique: `http://localhost:3000/api/messages/conversations/{{$json.conversationId}}`
4. Clique em **"Save"**

#### 2. Corrigir nó "Enviar Auto-resposta"

1. Clique no nó
2. Em **"Authentication"**, selecione **"None"** (para teste inicial)
3. Em **"URL"**, verifique: `http://localhost:3000/api/messages/webhook/ai-response`
4. Em **"Body Parameters"**, certifique-se de que está configurado como JSON:
   ```json
   {
     "conversationId": "{{$json.conversationId}}",
     "content": "Olá! 👋 Recebi sua mensagem e vou responder em breve. Enquanto isso, sinta-se à vontade para me contar mais detalhes sobre sua dúvida ou necessidade.",
     "aiContext": {
       "type": "auto-response",
       "reason": "prescriber-delayed"
     }
   }
   ```
5. Clique em **"Save"**

---

## 🧪 Testar Workflow

### 1. Executar teste manual

1. No workflow, clique em **"Execute Workflow"**
2. No nó Webhook, clique em **"Listen for test event"**
3. Use a seguinte requisição de teste:

```bash
# Terminal
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test123",
    "patientId": "patient123",
    "prescriberId": "prescriber123"
  }'
```

### 2. Verificar execução

1. Observe cada nó sendo executado
2. Verifique se não há erros (ícones vermelhos)
3. Após 2 minutos, o workflow deve completar

### 3. Resultado esperado

✅ **Sucesso:** 
- Todos os nós executam sem erro
- Resposta final: `{"success": true, "message": "Auto-resposta enviada"}` ou `{"success": true, "message": "Prescritor já respondeu"}`

---

## 🔍 Problemas Comuns

### Problema 1: "Cannot connect to localhost:3000"

**Causa:** Servidor Node.js não está rodando

**Solução:**
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### Problema 2: "Invalid authentication credentials"

**Causa:** Token Firebase não configurado ou inválido

**Solução:**
1. Gere um novo token:
   ```bash
   node generate-token.js
   ```
2. Copie o token gerado
3. Atualize a credencial HTTP Header Auth no N8N

### Problema 3: "URL contains undefined"

**Causa:** O webhook não está enviando `conversationId` corretamente

**Solução:**
1. Verifique o payload do webhook
2. Certifique-se de que contém:
   ```json
   {
     "conversationId": "ID_VALIDO"
   }
   ```

### Problema 4: Workflow não ativa

**Causa:** Erros de configuração impedem ativação

**Solução:**
1. Corrija todos os nós com ícone vermelho
2. Execute teste manual primeiro
3. Só ative após teste bem-sucedido

---

## 📝 Checklist de Verificação

Antes de ativar o workflow, confirme:

- [ ] ✅ Workflow importado com sucesso
- [ ] ✅ Nenhum nó com ícone vermelho de erro
- [ ] ✅ URLs corretas (localhost:3000)
- [ ] ✅ Autenticação configurada ou "None" para teste
- [ ] ✅ Servidor Node.js rodando
- [ ] ✅ Teste manual executado com sucesso
- [ ] ✅ Webhook URL copiada e salva

---

## 🚀 Próximos Passos

Após corrigir o workflow 1:

1. **Configurar webhook no backend:**
   - Copie a URL do webhook do N8N
   - Adicione ao `.env`:
     ```
     N8N_WEBHOOK_URL=https://sua-url-n8n/webhook/nutribuddy-new-conversation
     ```

2. **Testar integração completa:**
   - Crie uma conversa no frontend (como paciente)
   - Aguarde 2 minutos
   - Verifique se auto-resposta é enviada

3. **Ativar workflow:**
   - Toggle "Active" no canto superior direito
   - Workflow ficará ativo permanentemente

---

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas:

1. Verifique os logs do N8N (aba "Executions")
2. Verifique os logs do servidor Node.js
3. Teste cada nó individualmente
4. Confirme que todas as credenciais estão configuradas

**Logs úteis:**

```bash
# Ver logs do servidor
cd /Users/drpgjr.../NutriBuddy
node server.js

# Ver logs do N8N (se rodando via Docker)
docker logs n8n
```

