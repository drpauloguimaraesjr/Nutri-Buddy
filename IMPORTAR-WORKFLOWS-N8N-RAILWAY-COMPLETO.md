# 🚀 IMPORTAR WORKFLOWS N8N NO RAILWAY - GUIA COMPLETO

## 📍 SUAS CREDENCIAIS

**N8N URL:** https://n8n-production-3eae.up.railway.app/

**API Key:** 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGUzYmE0ZS1iZjkyLTRlNmItOTdmMy1kNWU2NGUyYTM0NmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyODM3NDMyLCJleHAiOjE3NjU0MjIwMDB9.aofaDiwQ51Nol3fDkfX8Qs_TWpfp_XFaIXvE5ABQ7Jo
```

---

## 📋 WORKFLOWS DISPONÍVEIS PARA IMPORTAR

Você tem **8 workflows** prontos na pasta `n8n-workflows/`:

### ✅ **Workflows WhatsApp Evolution API (Recomendados):**
1. ✅ `EVOLUTION-1-RECEBER-MENSAGENS.json` - Recebe mensagens do WhatsApp
2. ✅ `EVOLUTION-2-ENVIAR-MENSAGENS.json` - Envia mensagens para WhatsApp
3. ✅ `EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO.json` - Atualiza score automaticamente

### 📊 **Workflows Complementares (Opcionais):**
4. `1-AUTO-RESPOSTA-FINAL.json` - Respostas automáticas
5. `2-ANALISE-COMPLETO-FINAL.json` - Análise de sentimento
6. `3-SUGESTOES-RESPOSTA-FINAL.json` - Sugestões de resposta
7. `4-FOLLOWUP-AUTOMATICO-FINAL.json` - Follow-up automático
8. `5-RESUMO-DIARIO-FINAL.json` - Resumo diário

---

## 🚀 MÉTODO 1: IMPORTAR VIA INTERFACE N8N (RECOMENDADO)

### Passo 1: Acessar N8N
```
1. Abra: https://n8n-production-3eae.up.railway.app/
2. Faça login com suas credenciais
```

### Passo 2: Importar Workflow
```
1. Clique em "Workflows" no menu lateral
2. Clique no botão "+ New Workflow" 
3. Clique nos três pontinhos (⋮) no canto superior direito
4. Selecione "Import from File..."
5. Escolha o arquivo (comece com EVOLUTION-1-RECEBER-MENSAGENS.json)
6. Clique "Import"
```

### Passo 3: Configurar Credenciais Firebase

**Antes de ativar os workflows, configure as credenciais:**

1. **No N8N, vá em:** Settings → Credentials
2. **Adicionar:** Google Service Account
3. **Nome:** Firebase Service Account
4. **Service Account JSON:**

```json
{
  "type": "service_account",
  "project_id": "nutribuddy-2fc9c",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Como obter:**
- Firebase Console: https://console.firebase.google.com
- Projeto nutribuddy-2fc9c
- Configurações (⚙️) → Contas de serviço
- Gerar nova chave privada
- Baixar JSON e colar acima

### Passo 4: Configurar Variáveis de Ambiente

**No Railway (não no N8N):**

1. Acesse: https://railway.app
2. Selecione projeto N8N
3. Vá em: Variables
4. Adicione:

```env
# Evolution API
EVOLUTION_API_URL=https://sua-evolution.railway.app
EVOLUTION_INSTANCE_NAME=nutribuddy-clinic
EVOLUTION_API_KEY=SuaSenhaForte123

# Firebase
FIREBASE_PROJECT_ID=nutribuddy-2fc9c

# OpenAI (Opcional)
OPENAI_API_KEY=sk-...
```

### Passo 5: Ativar Workflows

1. **Workflow 1:** EVOLUTION-1-RECEBER-MENSAGENS
   - Abra o workflow
   - Clique no switch "Inactive" → Mude para "Active"
   - ✅ Ativado!

2. **Workflow 2:** EVOLUTION-2-ENVIAR-MENSAGENS
   - Repita o processo
   - ✅ Ativado!

3. **Workflow 3:** EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO
   - Repita o processo
   - ✅ Ativado!

---

## 🔧 MÉTODO 2: IMPORTAR VIA API (AVANÇADO)

### Importar Workflow 1 via cURL:

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/api/v1/workflows \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGUzYmE0ZS1iZjkyLTRlNmItOTdmMy1kNWU2NGUyYTM0NmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyODM3NDMyLCJleHAiOjE3NjU0MjIwMDB9.aofaDiwQ51Nol3fDkfX8Qs_TWpfp_XFaIXvE5ABQ7Jo" \
  -H "Content-Type: application/json" \
  -d @n8n-workflows/EVOLUTION-1-RECEBER-MENSAGENS.json
```

---

## 📊 ORDEM DE IMPORTAÇÃO RECOMENDADA

### Para WhatsApp Completo:

1. ✅ **Primeiro:** EVOLUTION-1-RECEBER-MENSAGENS
   - Recebe mensagens do WhatsApp
   - Salva no Firestore
   - Dashboard atualiza em tempo real

2. ✅ **Segundo:** EVOLUTION-2-ENVIAR-MENSAGENS
   - Envia respostas do prescritor
   - Via Evolution API → WhatsApp

3. ✅ **Terceiro:** EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO
   - Calcula score automaticamente
   - Envia parabéns quando conquista badge

### Opcionais (Depois):

4. **2-ANALISE-COMPLETO-FINAL.json**
   - Análise de sentimento com OpenAI
   - Requer: OPENAI_API_KEY

5. **4-FOLLOWUP-AUTOMATICO-FINAL.json**
   - Follow-up automático de pacientes inativos
   - Envia mensagens motivacionais

6. **5-RESUMO-DIARIO-FINAL.json**
   - Resumo diário para prescritor
   - Email ou WhatsApp com estatísticas

---

## 🔗 CONFIGURAR WEBHOOKS

### Webhook para Receber Mensagens WhatsApp

**URL do Webhook (Workflow 1):**
```
https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp
```

**Configurar na Evolution API:**
```bash
curl -X POST https://sua-evolution.railway.app/webhook/set/nutribuddy-clinic \
  -H "apikey: SuaSenhaForte123" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp",
    "webhook_by_events": true,
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }'
```

---

## ✅ TESTAR OS WORKFLOWS

### Teste 1: Webhook Funcionando

```bash
# Enviar mensagem de teste para o webhook
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "data": {
      "key": {
        "remoteJid": "5511999998888@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "message": {
        "conversation": "Teste de integração!"
      },
      "messageTimestamp": 1699999999
    }
  }'
```

**Verificar:**
1. N8N → Executions (ver se processou)
2. Firestore → whatsappMessages (ver se salvou)

### Teste 2: Enviar Mensagem do Dashboard

1. Dashboard → WhatsApp
2. Clicar em card de paciente
3. Digitar mensagem
4. Enviar
5. Ver se chegou no WhatsApp

### Teste 3: Registrar Refeição → Score Atualiza

1. Como paciente, registrar refeição
2. Aguardar ~10 segundos
3. Dashboard → Ver se score atualizou
4. Se conquistou badge → WhatsApp recebe parabéns

---

## 🔐 SEGURANÇA

### Proteger Webhooks

**Adicionar autenticação no Workflow 1:**

1. Abra EVOLUTION-1-RECEBER-MENSAGENS
2. No node "Webhook Evolution API"
3. Em "Authentication" → Selecione "Header Auth"
4. Nome do header: `X-Webhook-Secret`
5. Valor: Gere uma senha forte

**Configurar na Evolution API:**
```bash
curl -X POST https://sua-evolution.railway.app/webhook/set/nutribuddy-clinic \
  -H "apikey: SuaSenhaForte123" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp",
    "webhook_by_events": true,
    "webhook_base64": false,
    "headers": {
      "X-Webhook-Secret": "SuaSenhaSecretaWebhook123"
    },
    "events": ["MESSAGES_UPSERT"]
  }'
```

---

## 📊 MONITORAMENTO

### Ver Execuções dos Workflows

1. **N8N Dashboard:** https://n8n-production-3eae.up.railway.app/
2. **Menu:** Executions
3. **Filtrar:** Por workflow, status, data
4. **Debug:** Clicar em execução → Ver dados de cada step

### Logs Railway

1. **Railway Dashboard:** https://railway.app
2. **Projeto N8N** → Deployments
3. **View Logs** → Ver logs em tempo real

---

## 🐛 TROUBLESHOOTING

### Erro: "Credential not found"

**Solução:** Configurar credencial Firebase
1. Settings → Credentials
2. Add Credential → Google Service Account
3. Nome: "Firebase Service Account"
4. Salvar

### Erro: "Webhook not receiving"

**Solução:** Verificar URL do webhook
1. Workflow → Node Webhook → Ver URL
2. Copiar URL completa
3. Configurar na Evolution API

### Erro: "Firebase permission denied"

**Solução:** Verificar regras Firestore
1. Firebase Console → Firestore → Rules
2. Verificar se regras foram deployadas
3. Re-deploy: `firebase deploy --only firestore:rules`

### Erro: "Evolution API timeout"

**Solução:** Verificar variáveis de ambiente
1. Railway → N8N → Variables
2. Adicionar: EVOLUTION_API_URL, EVOLUTION_API_KEY
3. Restart N8N

---

## 📋 CHECKLIST COMPLETO

### Pré-requisitos:
- [x] N8N no Railway funcionando
- [x] API Key do N8N obtida
- [ ] Firebase Service Account JSON obtido
- [ ] Evolution API configurada (próximo passo)

### Importar Workflows:
- [ ] EVOLUTION-1-RECEBER-MENSAGENS.json importado
- [ ] EVOLUTION-2-ENVIAR-MENSAGENS.json importado
- [ ] EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO.json importado
- [ ] (Opcional) Outros workflows importados

### Configurar:
- [ ] Credencial Firebase configurada no N8N
- [ ] Variáveis de ambiente no Railway
- [ ] Webhooks configurados na Evolution API
- [ ] Workflows ativados

### Testar:
- [ ] Webhook recebe mensagens
- [ ] Dashboard recebe mensagens
- [ ] Prescritor pode responder
- [ ] Score atualiza automaticamente
- [ ] Badges funcionam

---

## 🎯 PRÓXIMO PASSO

**Depois de importar os workflows:**

1. **Configurar Evolution API** (se ainda não fez)
   - Ver: `WHATSAPP-EVOLUTION-API-SETUP.md`
   - Deploy no Railway
   - Conectar via QR Code

2. **Testar Fluxo Completo**
   - Enviar WhatsApp → Dashboard
   - Responder → WhatsApp
   - Registrar refeição → Score atualiza

---

## 📞 SUPORTE

**Documentação Completa:**
- `INTEGRACAO-COMPLETA-WHATSAPP.md` - Visão geral
- `WHATSAPP-EVOLUTION-API-SETUP.md` - Setup Evolution API
- `SETUP-COMPLETO-10-MINUTOS.md` - Guia rápido

**N8N Docs:**
- https://docs.n8n.io

**Railway Docs:**
- https://docs.railway.app

---

**🎉 TUDO PRONTO PARA IMPORTAR OS WORKFLOWS!**

Comece importando os 3 workflows principais (EVOLUTION-1, 2 e 3) e teste! 🚀

