# ⚡ Solução Rápida - Erro no Workflow 1

## 🎯 Problema
Os nós "Verificar se Prescritor Respondeu" e "Enviar Auto-resposta" estão com erro de configuração.

## ✅ Solução em 3 Passos

### PASSO 1: Deletar e Reimportar

No N8N:

1. **Deletar workflow antigo:**
   - Abra o workflow "NutriBuddy - Auto-resposta Inicial"
   - Menu (⋮) → Delete

2. **Importar nova versão:**
   - Workflows → Add Workflow → Import from File
   - Selecione: `n8n-workflows/1-autoresposta-inicial.json`
   - Clique em Import

### PASSO 2: Configurar Nós HTTP Request

Para CADA nó com ícone de erro (triângulo vermelho):

1. **Clique no nó com erro**

2. **Configure Authentication:**
   - Encontre o campo "Authentication"
   - Selecione: **"None"** (para começar sem autenticação)
   - OU crie credencial HTTP Header Auth (veja abaixo)

3. **Verifique a URL:**
   - Deve apontar para: `http://localhost:3000/api/messages/...`
   - ⚠️ Se seu servidor usa outra porta, ajuste!

4. **Salve o nó:** Clique em "Save"

### PASSO 3: Testar e Ativar

1. **Teste manual:**
   - Clique em "Execute Workflow"
   - Verifique se todos os nós executam sem erro

2. **Ative o workflow:**
   - Toggle "Active" no canto superior direito
   - ✅ Pronto!

---

## 🔐 Criar Credencial (Opcional - Para Segurança)

Se quiser adicionar autenticação:

### No N8N:

1. **Settings → Credentials**
2. **Add Credential → HTTP Header Auth**
3. **Configurar:**
   - Name: `NutriBuddy API Auth`
   - Header Name: `Authorization`
   - Header Value: `Bearer SEU_TOKEN_AQUI`

4. **Nos nós HTTP Request:**
   - Authentication: "Predefined Credential Type"
   - Select Credential: `NutriBuddy API Auth`

### Gerar Token Firebase:

```bash
cd /Users/drpgjr.../NutriBuddy
node generate-token.js
```

Copie o token gerado e use no Header Value acima.

---

## 🧪 Teste Rápido

### 1. Certifique-se que o servidor está rodando:

```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

Deve mostrar: `Server running on port 3000`

### 2. No N8N, execute o workflow:

- Clique em "Execute Workflow"
- Clique em "Listen for test event" no nó Webhook
- Em outro terminal, execute:

```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test123"}'
```

### 3. Resultado esperado:

✅ Todos os nós executam sem erro
✅ Resposta de sucesso ao final

---

## ❌ Problemas Comuns

| Erro | Solução |
|------|---------|
| 🔴 Nó ainda com erro | Clique no nó, verifique Authentication = "None" ou credencial válida |
| 🔴 "Cannot connect to localhost:3000" | Inicie o servidor: `node server.js` |
| 🔴 "URL contains undefined" | Verifique se o payload do webhook contém `conversationId` |
| 🔴 Workflow não ativa | Corrija todos os nós com erro antes de ativar |

---

## 📋 Checklist Rápido

Antes de ativar:

- [ ] Workflow reimportado
- [ ] Nenhum ícone vermelho nos nós
- [ ] URLs corretas (localhost:3000)
- [ ] Authentication configurada
- [ ] Servidor Node.js rodando
- [ ] Teste manual passou
- [ ] Workflow ativado

---

## 🎉 Após Corrigir

O workflow estará pronto para:

1. ⏰ Receber notificações de novas conversas
2. ⏱️ Aguardar 2 minutos
3. 🔍 Verificar se prescritor respondeu
4. 🤖 Enviar auto-resposta se necessário

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `CORRECAO-WORKFLOW-N8N.md` - Guia completo de correção
- `SETUP-SISTEMA-MENSAGENS.md` - Setup completo do sistema
- `COMECE-AQUI-MENSAGENS.md` - Visão geral do sistema

---

## 🆘 Ainda com Erro?

1. Verifique os logs do servidor:
   ```bash
   node server.js
   ```

2. Verifique as execuções do N8N:
   - Menu lateral → Executions
   - Clique na execução com erro
   - Veja detalhes do erro

3. Confirme que as rotas existem:
   - ✅ GET `/api/messages/conversations/:id`
   - ✅ POST `/api/messages/webhook/ai-response`

**As rotas já estão implementadas em `routes/messages.js`!**

