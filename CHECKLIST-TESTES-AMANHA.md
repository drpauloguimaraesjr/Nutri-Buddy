# ✅ Checklist de Testes - NutriBuddy em Produção

## 📅 Data: Amanhã (Para Executar pela Manhã)

---

## 🎯 OBJETIVO

Testar todo o sistema em produção para garantir que está funcionando perfeitamente.

---

## 📋 PARTE 1: Verificações Iniciais (5 min)

### ✅ Backend Railway

1. Abrir: https://web-production-c9eaf.up.railway.app/api/health
   - [ ] Responde com `{"status":"ok",...}`
   - [ ] Status 200 OK
   - [ ] Resposta rápida (< 2 segundos)

2. Verificar Logs Railway
   - [ ] Sem erros críticos
   - [ ] API iniciou corretamente

### ✅ Frontend Vercel

1. Abrir URL Vercel: `https://nutri-buddy-xxxxx.vercel.app`
   - [ ] Página carrega
   - [ ] Sem erros no console (F12)
   - [ ] Design aparece corretamente
   - [ ] Sem erros 404 de recursos

2. Verificar Build Status
   - [ ] Deploy com sucesso no Vercel
   - [ ] Última versão deployada

### ✅ N8N

1. Acessar N8N (Cloud ou Railway)
   - [ ] Login funciona
   - [ ] Dashboard carrega
   - [ ] 5 workflows aparecem

2. Status dos Workflows
   - [ ] Workflow 1: Active ✅
   - [ ] Workflow 2: Active ✅
   - [ ] Workflow 3: Active ✅
   - [ ] Workflow 4: Active ✅
   - [ ] Workflow 5: Active ✅

---

## 📋 PARTE 2: Testes Funcionais Frontend (15 min)

### ✅ Teste 1: Autenticação

#### Registro de Novo Usuário
1. Ir para `/register`
   - [ ] Formulário aparece
   - [ ] Pode preencher campos
   - [ ] Botão "Cadastrar" funciona
   - [ ] Registro bem-sucedido
   - [ ] Redirecionamento correto

#### Login
1. Ir para `/login`
   - [ ] Formulário aparece
   - [ ] Login com credenciais corretas funciona
   - [ ] Redirecionamento para dashboard
   - [ ] Sem erros no console

#### Logout
1. Clicar em "Sair" ou "Logout"
   - [ ] Logout funciona
   - [ ] Redirecionamento para home/login

### ✅ Teste 2: Dashboard

1. Acessar Dashboard após login
   - [ ] Cards de estatísticas aparecem
   - [ ] Gráficos carregam
   - [ ] Navegação funciona
   - [ ] Menu lateral visível

### ✅ Teste 3: Sistema de Mensagens (Nutricionista)

1. Ir para `/messages`
   - [ ] Página carrega
   - [ ] Kanban Board aparece
   - [ ] Colunas visíveis (New, In Progress, Waiting, Resolved)
   - [ ] Pode arrastar cards (se houver)

2. Clicar em uma conversa
   - [ ] Chat abre
   - [ ] Mensagens aparecem
   - [ ] Campo de input visível
   - [ ] Pode digitar

3. Enviar mensagem
   - [ ] Mensagem envia
   - [ ] Aparece na conversa
   - [ ] Timestamp correto

### ✅ Teste 4: Chat do Paciente

1. Logout e registrar como paciente
2. Ir para `/chat`
   - [ ] Interface de chat aparece
   - [ ] Pode ver histórico
   - [ ] Campo de input funciona

3. Enviar mensagem
   - [ ] Mensagem envia
   - [ ] Resposta automática chega (Workflow 1)
   - [ ] Tempo de resposta aceitável

---

## 📋 PARTE 3: Testes N8N Workflows (20 min)

### ✅ Workflow 1: Auto-resposta Inicial

**Teste Manual via cURL:**

```bash
# Cole no terminal
curl -X POST https://SEU-N8N.app.n8n.cloud/webhook-test/nutribuddy-autorespond \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-auto-001",
    "patientName": "João Teste"
  }'
```

**Verificações:**
- [ ] Resposta 200 OK
- [ ] JSON de resposta recebido
- [ ] No N8N: Execution aparece em verde
- [ ] Sem erros nos logs

**Teste Integrado:**
- [ ] Paciente envia primeira mensagem
- [ ] Recebe auto-resposta em ~2 min
- [ ] Mensagem aparece no chat

### ✅ Workflow 2: Análise de Sentimento

**Teste com Mensagem Urgente:**

```bash
curl -X POST https://SEU-N8N.app.n8n.cloud/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-urgent-001",
    "messageId": "msg-001",
    "patientName": "Maria Silva",
    "content": "Estou com dor muito forte, preciso de ajuda urgente!"
  }'
```

**Verificações:**
- [ ] Resposta com análise (urgency: "high")
- [ ] Tags relevantes identificadas
- [ ] Sentiment correto
- [ ] Execution verde no N8N

**Teste com Mensagem Normal:**

```bash
curl -X POST https://SEU-N8N.app.n8n.cloud/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-normal-001",
    "messageId": "msg-002",
    "patientName": "Pedro Costa",
    "content": "Olá, tudo bem? Gostaria de saber sobre minha dieta."
  }'
```

**Verificações:**
- [ ] Resposta com análise (urgency: "low" ou "medium")
- [ ] Sentiment neutro ou positivo
- [ ] Execution verde no N8N

### ✅ Workflow 3: Sugestões de Resposta

**Teste Manual:**

```bash
curl -X POST https://SEU-N8N.app.n8n.cloud/webhook-test/nutribuddy-suggest-response \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-suggest-001"
  }'
```

**Verificações:**
- [ ] Resposta com sugestões
- [ ] Sugestões relevantes e em português
- [ ] JSON bem formatado
- [ ] Execution verde no N8N

### ✅ Workflow 4: Follow-up Automático

**Teste Manual (execução imediata):**

1. No N8N, abrir Workflow 4
2. Clicar em **"Execute Workflow"**
3. Observar execução

**Verificações:**
- [ ] Executa sem erros
- [ ] Busca conversas resolvidas
- [ ] Verifica dias desde última mensagem
- [ ] Se >= 7 dias: envia follow-up
- [ ] Atualiza status da conversa
- [ ] Execution verde

**Teste Agendamento:**
- [ ] Verificar que está agendado para 9h (cron: `0 9 * * *`)
- [ ] Workflow está Active

### ✅ Workflow 5: Resumo Diário

**Teste Manual (execução imediata):**

1. No N8N, abrir Workflow 5
2. Clicar em **"Execute Workflow"**
3. Observar execução

**Verificações:**
- [ ] Executa sem erros
- [ ] Busca todas conversas
- [ ] Processa estatísticas corretamente
- [ ] Gera email HTML
- [ ] Email enviado com sucesso
- [ ] Email recebido na caixa de entrada
- [ ] Email bem formatado
- [ ] Execution verde

**Verificar Email Recebido:**
- [ ] Subject correto
- [ ] HTML renderiza bem
- [ ] Estatísticas corretas
- [ ] Botão "Acessar Painel" funciona

---

## 📋 PARTE 4: Testes de Integração End-to-End (15 min)

### ✅ Cenário 1: Novo Paciente

1. **Paciente registra e envia mensagem**
   - [ ] Registro bem-sucedido
   - [ ] Vai para `/chat`
   - [ ] Envia: "Olá, sou novo aqui!"

2. **Sistema responde automaticamente**
   - [ ] Workflow 1 dispara (em ~2 min)
   - [ ] Paciente recebe mensagem de boas-vindas
   - [ ] Mensagem aparece no chat

3. **Nutricionista vê a conversa**
   - [ ] Login como nutricionista
   - [ ] Vai para `/messages`
   - [ ] Nova conversa aparece na coluna "New"
   - [ ] Pode abrir e responder

### ✅ Cenário 2: Mensagem Urgente

1. **Paciente envia mensagem urgente**
   - [ ] Login como paciente
   - [ ] Envia: "Socorro! Estou passando mal!"

2. **Sistema analisa e marca como urgente**
   - [ ] Workflow 2 dispara
   - [ ] Analisa sentimento
   - [ ] Marca como "high priority"
   - [ ] Envia alerta

3. **Nutricionista recebe alerta**
   - [ ] Email ou notificação enviada
   - [ ] Conversa aparece destacada
   - [ ] Pode responder imediatamente

### ✅ Cenário 3: Sugestão de Resposta

1. **Nutricionista abre conversa**
   - [ ] Login como nutricionista
   - [ ] Abre conversa em `/messages`

2. **Clica em "Sugestões IA"** (se houver botão)
   - [ ] Workflow 3 dispara
   - [ ] Retorna sugestões
   - [ ] Sugestões aparecem na interface

3. **Nutricionista usa sugestão**
   - [ ] Pode copiar/usar sugestão
   - [ ] Envia resposta
   - [ ] Paciente recebe

---

## 📋 PARTE 5: Testes de Performance (10 min)

### ✅ Frontend

1. Abrir Chrome DevTools (F12)
2. Ir para aba **"Lighthouse"**
3. Rodar auditoria

**Verificações:**
- [ ] Performance > 70
- [ ] Accessibility > 80
- [ ] Best Practices > 80
- [ ] SEO > 70

### ✅ Backend

**Teste de Carga Básico:**

```bash
# Teste 10 requests simultâneas
for i in {1..10}; do
  curl https://web-production-c9eaf.up.railway.app/api/health &
done
wait
```

**Verificações:**
- [ ] Todas respondem com 200 OK
- [ ] Tempo de resposta < 3s
- [ ] Sem timeouts

### ✅ N8N

1. Ver **Executions** recentes
2. Verificar tempos de execução

**Verificações:**
- [ ] Workflow 1: < 10s
- [ ] Workflow 2: < 30s (OpenAI)
- [ ] Workflow 3: < 30s (OpenAI)
- [ ] Workflow 4: < 2min (loop)
- [ ] Workflow 5: < 1min

---

## 📋 PARTE 6: Monitoramento (5 min)

### ✅ Railway (Backend)

1. Dashboard Railway
2. Ver **Metrics**

**Verificações:**
- [ ] CPU < 80%
- [ ] Memory < 80%
- [ ] Sem crashes
- [ ] Uptime > 99%

### ✅ Vercel (Frontend)

1. Dashboard Vercel
2. Ver **Analytics**

**Verificações:**
- [ ] Build time < 5min
- [ ] Deployment successful
- [ ] Sem errors 500

### ✅ N8N

1. Dashboard N8N
2. Ver **Executions** (últimas 24h)

**Verificações:**
- [ ] Taxa de sucesso > 95%
- [ ] Poucos ou nenhum erro
- [ ] Workflows executando no horário

---

## 📋 PARTE 7: Segurança Básica (5 min)

### ✅ Headers de Segurança

```bash
# Verificar headers
curl -I https://web-production-c9eaf.up.railway.app/api/health
```

**Verificações:**
- [ ] HTTPS ativo (URL começa com https://)
- [ ] Headers CORS configurados

### ✅ Firebase Auth

1. Tentar acessar rota protegida sem login
   - [ ] Redireciona para login
   - [ ] Não permite acesso

2. Token JWT válido
   - [ ] Login gera token
   - [ ] Token aceito pelo backend

### ✅ Webhook Secret

**Teste sem secret (deve falhar):**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/messages/webhook/urgent-alert \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Verificações:**
- [ ] Responde com erro 401 ou 403
- [ ] Não executa sem secret

---

## 📊 RESUMO DOS RESULTADOS

### ✅ Frontend
- Total de testes: ___
- Passaram: ___
- Falharam: ___

### ✅ Backend
- Total de testes: ___
- Passaram: ___
- Falharam: ___

### ✅ N8N Workflows
- Total de testes: ___
- Passaram: ___
- Falharam: ___

### ✅ Integração
- Total de testes: ___
- Passaram: ___
- Falharam: ___

---

## 🐛 Problemas Encontrados

Liste aqui qualquer problema:

1. **Problema:** ___________________
   - **Severidade:** Alta / Média / Baixa
   - **Área:** Frontend / Backend / N8N / Integração
   - **Descrição:** ___________________

2. **Problema:** ___________________
   - **Severidade:** Alta / Média / Baixa
   - **Área:** Frontend / Backend / N8N / Integração
   - **Descrição:** ___________________

---

## ✅ Próximas Ações

Baseado nos testes:

### Se Tudo Passou ✅
- [ ] Sistema está pronto para uso!
- [ ] Pode começar a usar em produção
- [ ] Monitorar por 1 semana

### Se Houver Problemas ⚠️
- [ ] Priorizar correções por severidade
- [ ] Corrigir bugs críticos primeiro
- [ ] Re-testar após correções

---

## 📝 Notas Adicionais

Adicione observações aqui:

_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Conclusão

**Data do teste:** ___/___/2024
**Testador:** _______________
**Status geral:** ✅ Aprovado / ⚠️ Com ressalvas / ❌ Reprovado

**Assinatura:** _______________

---

**Boa sorte nos testes! 🚀**

Se encontrar problemas, estou aqui para ajudar!

