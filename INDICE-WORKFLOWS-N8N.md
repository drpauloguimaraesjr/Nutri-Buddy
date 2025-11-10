# 📑 Índice - Workflows N8N do NutriBuddy

## 🎯 Guias de Correção Rápida

### Workflow 1: Auto-resposta Inicial
- **Status:** ❌ Com erros (autenticação HTTP)
- **Solução Rápida:** [`SOLUCAO-RAPIDA-WORKFLOW.md`](SOLUCAO-RAPIDA-WORKFLOW.md)
- **Guia Completo:** [`CORRECAO-WORKFLOW-N8N.md`](CORRECAO-WORKFLOW-N8N.md)
- **Arquivo:** `n8n-workflows/1-autoresposta-inicial.json`
- **Requer:** Servidor Node.js rodando
- **Custo:** ✅ Grátis

### Workflow 2: Análise de Sentimento
- **Status:** ❌ Com erros (OpenAI + autenticação)
- **Solução Rápida:** [`SOLUCAO-RAPIDA-WORKFLOW-2.md`](SOLUCAO-RAPIDA-WORKFLOW-2.md)
- **Guia Completo:** [`CORRECAO-WORKFLOW-2.md`](CORRECAO-WORKFLOW-2.md)
- **Arquivo:** `n8n-workflows/2-analise-sentimento.json`
- **Requer:** OpenAI API Key (paga) OU versão gratuita
- **Custo:** 💰 ~$0.0005/mensagem (OpenAI) ou ✅ Grátis (palavras-chave)

### Workflow 3: Sugestões de Resposta
- **Status:** ⚠️ Não verificado
- **Arquivo:** `n8n-workflows/3-sugestoes-resposta.json`
- **Requer:** OpenAI API Key (provável)
- **Custo:** 💰 Pago (se usar OpenAI)

### Workflow 4: Follow-up Automático
- **Status:** ⚠️ Não verificado
- **Arquivo:** `n8n-workflows/4-followup-automatico.json`
- **Requer:** Servidor Node.js + Timer
- **Custo:** ✅ Grátis

### Workflow 5: Resumo Diário
- **Status:** ⚠️ Não verificado
- **Arquivo:** `n8n-workflows/5-resumo-diario.json`
- **Requer:** OpenAI API Key (provável) + Email
- **Custo:** 💰 Pago (se usar OpenAI)

---

## 📚 Documentação Geral

### Setup Inicial
- **Guia Principal:** [`COMECE-AQUI-MENSAGENS.md`](COMECE-AQUI-MENSAGENS.md)
- **Setup Completo:** [`SETUP-SISTEMA-MENSAGENS.md`](SETUP-SISTEMA-MENSAGENS.md)
- **Setup N8N Cloud:** [`N8N-CLOUD-SETUP-RAPIDO.md`](N8N-CLOUD-SETUP-RAPIDO.md)

### Implementação
- **Estrutura do Sistema:** [`SISTEMA-MENSAGENS-ESTRUTURA.md`](SISTEMA-MENSAGENS-ESTRUTURA.md)
- **Implementação Completa:** [`IMPLEMENTACAO-COMPLETA-MENSAGENS.md`](IMPLEMENTACAO-COMPLETA-MENSAGENS.md)

### Testes
- **Teste Workflow N8N:** [`TESTE-WORKFLOW-N8N.md`](TESTE-WORKFLOW-N8N.md)

---

## 🚀 Ordem Recomendada de Setup

### 1️⃣ Preparação (15 min)
- [ ] Ler [`COMECE-AQUI-MENSAGENS.md`](COMECE-AQUI-MENSAGENS.md)
- [ ] Verificar requisitos do sistema
- [ ] Instalar N8N (local ou cloud)

### 2️⃣ Backend (30 min)
- [ ] Seguir [`SETUP-SISTEMA-MENSAGENS.md`](SETUP-SISTEMA-MENSAGENS.md)
- [ ] Configurar Firestore
- [ ] Testar rotas da API
- [ ] Iniciar servidor: `node server.js`

### 3️⃣ Workflow 1 - Auto-resposta (10 min)
- [ ] Seguir [`SOLUCAO-RAPIDA-WORKFLOW.md`](SOLUCAO-RAPIDA-WORKFLOW.md)
- [ ] Importar workflow
- [ ] Configurar nós HTTP
- [ ] Testar e ativar

### 4️⃣ Workflow 2 - Análise (15 min)
- [ ] Seguir [`SOLUCAO-RAPIDA-WORKFLOW-2.md`](SOLUCAO-RAPIDA-WORKFLOW-2.md)
- [ ] **Decidir:** OpenAI (paga) ou Palavras-chave (grátis)
- [ ] Configurar conforme escolha
- [ ] Testar e ativar

### 5️⃣ Frontend (20 min)
- [ ] Testar interface de mensagens
- [ ] Criar conversa de teste
- [ ] Verificar integração

---

## 🔧 Troubleshooting por Sintoma

### ❌ "Workflow com nós vermelhos"
→ Veja [`CORRECAO-WORKFLOW-N8N.md`](CORRECAO-WORKFLOW-N8N.md)

### ❌ "Cannot connect to localhost:3000"
→ Inicie o servidor:
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### ❌ "Invalid API key" (OpenAI)
→ Veja seção "Configurar OpenAI" em [`CORRECAO-WORKFLOW-2.md`](CORRECAO-WORKFLOW-2.md)

### ❌ "Webhook não dispara"
→ Veja [`TESTE-WORKFLOW-N8N.md`](TESTE-WORKFLOW-N8N.md)

### ❌ "Insufficient quota" (OpenAI)
→ Use versão gratuita em [`SOLUCAO-RAPIDA-WORKFLOW-2.md`](SOLUCAO-RAPIDA-WORKFLOW-2.md)

---

## 💰 Resumo de Custos

| Workflow | Custo | Alternativa Gratuita |
|----------|-------|---------------------|
| 1. Auto-resposta | ✅ Grátis | - |
| 2. Análise Sentimento | 💰 ~$0.0005/msg | ✅ Sim (palavras-chave) |
| 3. Sugestões Resposta | 💰 ~$0.001/msg | ⚠️ Limitado |
| 4. Follow-up | ✅ Grátis | - |
| 5. Resumo Diário | 💰 ~$0.01/dia | ⚠️ Template simples |

**Total estimado com OpenAI:** ~$10-30/mês (100-300 interações)

**Total sem OpenAI:** ✅ Grátis!

---

## ⚡ Comandos Úteis

### Iniciar Servidor
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### Testar Workflow 1
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-new-conversation \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-123"}'
```

### Testar Workflow 2
```bash
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "test-123", "content": "teste urgente"}'
```

### Gerar Token Firebase
```bash
cd /Users/drpgjr.../NutriBuddy
node generate-token.js
```

---

## 🎯 Checklist Geral

### Pré-requisitos
- [ ] Node.js instalado
- [ ] N8N instalado/configurado
- [ ] Firebase configurado
- [ ] Código atualizado

### Backend
- [ ] Servidor rodando (porta 3000)
- [ ] Rotas testadas
- [ ] Firestore conectado
- [ ] Regras de segurança aplicadas

### N8N
- [ ] N8N rodando (porta 5678)
- [ ] Workflow 1 importado e ativo
- [ ] Workflow 2 configurado (OpenAI ou gratuito)
- [ ] Webhooks testados

### Frontend
- [ ] Interface de mensagens acessível
- [ ] Paciente pode enviar mensagens
- [ ] Prescritor vê no kanban
- [ ] Chat em tempo real funciona

---

## 📞 Suporte

### Workflow 1 não funciona?
1. Leia [`SOLUCAO-RAPIDA-WORKFLOW.md`](SOLUCAO-RAPIDA-WORKFLOW.md)
2. Verifique [`CORRECAO-WORKFLOW-N8N.md`](CORRECAO-WORKFLOW-N8N.md)
3. Teste com [`TESTE-WORKFLOW-N8N.md`](TESTE-WORKFLOW-N8N.md)

### Workflow 2 não funciona?
1. Leia [`SOLUCAO-RAPIDA-WORKFLOW-2.md`](SOLUCAO-RAPIDA-WORKFLOW-2.md)
2. Verifique [`CORRECAO-WORKFLOW-2.md`](CORRECAO-WORKFLOW-2.md)
3. Considere versão gratuita (sem OpenAI)

### Setup geral com problemas?
1. Comece pelo [`COMECE-AQUI-MENSAGENS.md`](COMECE-AQUI-MENSAGENS.md)
2. Siga [`SETUP-SISTEMA-MENSAGENS.md`](SETUP-SISTEMA-MENSAGENS.md)
3. Verifique logs do servidor e N8N

---

## 🎉 Após Tudo Funcionar

1. **Teste com usuários reais**
2. **Monitore custos** (se usar OpenAI)
3. **Ajuste palavras-chave** (se usar versão gratuita)
4. **Configure backups** dos workflows
5. **Documente customizações**
6. **Configure alertas** de erro
7. **Monitore performance**

---

## 📊 Status dos Workflows

Atualize conforme avançar:

- [ ] Workflow 1: Corrigido e ativo
- [ ] Workflow 2: Corrigido e ativo (OpenAI / Gratuito)
- [ ] Workflow 3: Verificado e configurado
- [ ] Workflow 4: Verificado e configurado
- [ ] Workflow 5: Verificado e configurado
- [ ] Backend: Rodando sem erros
- [ ] Frontend: Testado e funcional
- [ ] Integração: End-to-end funcionando

---

## 🔄 Próximas Atualizações

À medida que corrigir mais workflows:

1. Atualizar este índice
2. Criar guias específicos
3. Documentar alternativas gratuitas
4. Adicionar exemplos de teste
5. Incluir troubleshooting

---

**Última atualização:** 2024-11-10  
**Workflows corrigidos:** 2/5  
**Versão:** 1.0

