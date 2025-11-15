# 🚀 PLANO DE IMPLEMENTAÇÃO - NutriBuddy (15 Nov 2024)

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### Backend (Railway):
- ✅ URL: https://web-production-c9eaf.up.railway.app/
- ✅ API completa rodando
- ✅ Rotas de mensagens COMPLETAS (1305 linhas!)
- ✅ Integração n8n preparada (`services/n8n-client.js`)
- ✅ Webhooks para IA response
- ✅ Sistema de conversas, templates, attachments

### Frontend (Next.js + TypeScript):
- ✅ Firebase configurado (`src/lib/firebase.ts`)
- ✅ Sistema de Chat completo (`ChatInterface.tsx`)
- ✅ Real-time polling (3 segundos)
- ✅ Suporte a texto, imagem, áudio
- ✅ Componentes WhatsApp prontos
- ✅ Kanban Board integrado

### n8n (Railway):
- ✅ URL: https://n8n-production-3eae.up.railway.app/
- ✅ Status: ONLINE ({"status":"ok"})
- ⚠️ Workflows precisam ser importados

### Z-API (WhatsApp):
- ✅ Credenciais existem no env.example:
  - ZAPI_INSTANCE_ID: 3EA240373A126172229A82761BB89DF3
  - ZAPI_TOKEN: 8F4DA3C4CA0EFA2069E84E7D
- ⚠️ Precisa verificar se está ativo

---

## 🎯 TAREFAS PENDENTES (4-6 horas)

### 1. Configurar Variáveis de Ambiente no Railway ⏰ 30min

**Backend Railway:**
```env
# n8n Integration
N8N_URL=https://n8n-production-3eae.up.railway.app
N8N_NEW_MESSAGE_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-messages
WEBHOOK_SECRET=nutribuddy-secret-2024

# Z-API WhatsApp
ZAPI_INSTANCE_ID=3EA240373A126172229A82761BB89DF3
ZAPI_TOKEN=8F4DA3C4CA0EFA2069E84E7D
ZAPI_BASE_URL=https://api.z-api.io
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet
NEXT_PUBLIC_API_BASE_URL=https://web-production-c9eaf.up.railway.app
```

---

### 2. Importar Workflows Essenciais no n8n ⏰ 1h

**Workflows prioritários:**

1. **1-AUTO-RESPOSTA-FINAL.json** ✅
   - Webhook: `/webhook/nutribuddy-messages`
   - Função: Resposta automática a mensagens
   - Credenciais: Google Service Account

2. **2-ANALISE-COMPLETO-FINAL.json** ✅
   - Análise de sentimento e contexto
   - Classifica urgência

3. **3-SUGESTOES-RESPOSTA-FINAL.json** ✅
   - Sugere respostas ao prescritor
   - Usa histórico da conversa

4. **9-PROCESSAR-DIETA-PDF-GPT4O-VISION.json** ✅
   - Webhook: `/webhook/nutribuddy-process-diet`
   - GPT-4o Vision para transcrever PDFs
   - Credenciais: OpenAI API

**Passos:**
1. Login no n8n: https://n8n-production-3eae.up.railway.app
2. Import from File
3. Configurar credenciais:
   - Google Service Account (Firebase)
   - OpenAI API
4. Ativar workflows

---

### 3. Testar Sistema de Mensagens Interno ⏰ 1h

**Teste 1: Criar Conversa**
```bash
# Prescritor cria conversa com paciente
curl -X POST https://web-production-c9eaf.up.railway.app/api/messages/conversations \
  -H "Authorization: Bearer $PRESCRIBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prescriberId": "PRESCRIBER_ID",
    "initialMessage": "Olá! Como posso ajudar?"
  }'
```

**Teste 2: Enviar Mensagem**
```bash
# Paciente responde
curl -X POST https://web-production-c9eaf.up.railway.app/api/messages/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Olá! Tenho dúvidas sobre minha dieta.",
    "type": "text"
  }'
```

**Teste 3: Verificar IA Response**
- Aguardar webhook n8n processar
- Verificar resposta automática criada
- Conferir no Firestore

**Teste 4: Frontend**
- Abrir `/dashboard/messages`
- Ver conversas no Kanban
- Abrir chat e enviar mensagens
- Verificar polling funcionando

---

### 4. Conectar Z-API WhatsApp ⏰ 45min

**Passo 1: Verificar instância Z-API**
```bash
curl https://api.z-api.io/instances/3EA240373A126172229A82761BB89DF3/token/8F4DA3C4CA0EFA2069E84E7D/status
```

**Passo 2: Configurar Webhook no Z-API Dashboard**
- Login: https://z-api.io
- Instância: 3EA240373A126172229A82761BB89DF3
- Webhook URL: `https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp`
- Eventos: message-received, message-ack

**Passo 3: Testar Mensagem**
```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Teste NutriBuddy!"
  }'
```

---

### 5. Teste End-to-End Completo ⏰ 1h

**Fluxo completo:**

1. **Paciente envia mensagem no WhatsApp** →
2. **Z-API recebe** →
3. **Webhook chama Backend** (`/api/webhooks/zapi-whatsapp`) →
4. **Backend salva no Firestore** →
5. **Backend notifica n8n** (`N8N_NEW_MESSAGE_WEBHOOK_URL`) →
6. **n8n processa com IA** (análise + sugestão) →
7. **n8n envia resposta via webhook** (`/api/messages/webhook/ai-response`) →
8. **Backend salva resposta no Firestore** →
9. **Frontend atualiza via polling** →
10. **Prescritor vê sugestão no dashboard**

---

### 6. Upload de PDF Dieta ⏰ 30min

**Teste:**
1. Frontend: Upload PDF na página do paciente
2. Firebase Storage: PDF salvo
3. Frontend chama n8n: `NEXT_PUBLIC_N8N_WEBHOOK_URL`
4. n8n processa com GPT-4o Vision
5. Backend recebe dados estruturados
6. Salva no Firestore (`dietPlan`)
7. Frontend mostra resumo

---

## 📊 CHECKLIST FINAL

- [ ] Variáveis Railway configuradas
- [ ] Workflows importados e ativos no n8n
- [ ] Credenciais configuradas (Firebase + OpenAI)
- [ ] Teste mensagem interna funcionando
- [ ] Z-API conectada e recebendo webhooks
- [ ] Mensagem teste via WhatsApp enviada e recebida
- [ ] IA responde automaticamente
- [ ] Upload PDF dieta funciona
- [ ] Frontend atualiza em tempo real

---

## 🚨 PONTOS DE ATENÇÃO

1. **Webhook Secret**: Usar `nutribuddy-secret-2024` em todos os lugares
2. **Polling Frontend**: 3 segundos é ok para teste, considerar WebSocket depois
3. **Z-API Trial**: Verificar se instância está ativa (pode precisar renovar)
4. **OpenAI Credits**: Verificar saldo para GPT-4o Vision
5. **Firebase Storage Rules**: Permitir leitura pública para PDFs (para n8n acessar)

---

## 🎊 ESTIMATIVA TOTAL: 4-6 HORAS

Se tudo correr bem, **sistema completo funcionando hoje à noite!** 🚀

---

**Última atualização:** 15/11/2024  
**Status:** Pronto para implementar  
**Próximo passo:** Configurar variáveis Railway

