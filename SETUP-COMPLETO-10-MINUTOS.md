# ⚡ SETUP COMPLETO EM 10 MINUTOS

## 🎯 Objetivo

Conectar o Dashboard WhatsApp Kanban com WhatsApp real usando Evolution API (não oficial, fácil e grátis).

## ✅ Checklist de Pré-requisitos

- [ ] Chip/número para a clínica (separado do pessoal)
- [ ] Conta Railway (grátis): https://railway.app
- [ ] Conta N8N Cloud (grátis) ou N8N self-hosted
- [ ] Frontend NutriBuddy rodando

## 🚀 Passo a Passo

### ⏱️ MINUTO 1-3: Deploy Evolution API

1. **Acesse Railway**
   ```
   https://railway.app
   ```

2. **Novo Projeto**
   - Clique "New Project"
   - Selecione "Deploy from GitHub repo"
   - Cole: `https://github.com/EvolutionAPI/evolution-api`
   - Ou use template direto: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/evolution-api)

3. **Configure Variáveis de Ambiente**
   ```env
   SERVER_URL=https://seu-app.railway.app
   AUTHENTICATION_API_KEY=NutriBuddy@2025!Segura
   DATABASE_ENABLED=false
   CONFIG_SESSION_PHONE_CLIENT=NutriBuddy
   WEBHOOK_GLOBAL_ENABLED=false
   ```

4. **Anote a URL gerada**
   ```
   https://nutribuddy-evolution-production.up.railway.app
   ```

### ⏱️ MINUTO 4-5: Criar Instância WhatsApp

1. **Criar instância via curl**
   ```bash
   curl -X POST https://SUA-URL.railway.app/instance/create \
     -H "apikey: NutriBuddy@2025!Segura" \
     -H "Content-Type: application/json" \
     -d '{
       "instanceName": "nutribuddy-clinic",
       "qrcode": true,
       "integration": "WHATSAPP-BAILEYS"
     }'
   ```

2. **Ou use interface web**
   ```
   https://SUA-URL.railway.app/manager
   ```

### ⏱️ MINUTO 6: Conectar WhatsApp

1. **Pegar QR Code**
   ```bash
   curl https://SUA-URL.railway.app/instance/connect/nutribuddy-clinic \
     -H "apikey: NutriBuddy@2025!Segura"
   ```

2. **Abrir resposta em JSON Viewer**
   - Cole o base64 do QR Code em: https://base64.guru/converter/decode/image
   - Ou acesse: `https://SUA-URL.railway.app/manager`

3. **Escanear com WhatsApp**
   - Abra WhatsApp no celular da clínica
   - Vá em **Configurações → Aparelhos conectados**
   - **Conectar um aparelho**
   - Escaneie o QR Code
   - ✅ **Conectado!**

### ⏱️ MINUTO 7: Testar Envio

```bash
# Enviar mensagem de teste para SEU número
curl -X POST https://SUA-URL.railway.app/message/sendText/nutribuddy-clinic \
  -H "apikey: NutriBuddy@2025!Segura" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999998888",
    "text": "🎉 Evolution API funcionando! Sistema NutriBuddy conectado ao WhatsApp!"
  }'
```

**Você deve receber a mensagem no WhatsApp!** ✅

### ⏱️ MINUTO 8-9: Importar Workflows N8N

1. **Acesse seu N8N**
   ```
   https://seu-n8n.app
   ```

2. **Configurar Credenciais Firebase**
   - Vá em **Settings → Credentials**
   - Add Credential → **Google Service Account**
   - Cole o Service Account JSON do Firebase
   - Nome: "Firebase Service Account"
   - Save

3. **Importar Workflow 1: Receber Mensagens**
   - Workflows → Import from File
   - Selecione: `n8n-workflows/EVOLUTION-1-RECEBER-MENSAGENS.json`
   - Abra o workflow
   - No primeiro node "Webhook Evolution API", copie a URL do webhook
   - **Salve**: Ctrl+S

4. **Importar Workflow 2: Enviar Mensagens**
   - Workflows → Import from File
   - Selecione: `n8n-workflows/EVOLUTION-2-ENVIAR-MENSAGENS.json`
   - **Salve**: Ctrl+S

5. **Configurar Variáveis de Ambiente no N8N**
   - Settings → Environment Variables
   - Adicione:
     ```env
     EVOLUTION_API_URL=https://SUA-URL.railway.app
     EVOLUTION_INSTANCE_NAME=nutribuddy-clinic
     EVOLUTION_API_KEY=NutriBuddy@2025!Segura
     ```

### ⏱️ MINUTO 10: Configurar Webhook na Evolution API

```bash
# Configurar webhook para receber mensagens
curl -X POST https://SUA-URL.railway.app/webhook/set/nutribuddy-clinic \
  -H "apikey: NutriBuddy@2025!Segura" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://SEU-N8N.app/webhook/evolution-whatsapp",
    "webhook_by_events": true,
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }'
```

**IMPORTANTE:** Troque `SEU-N8N.app` pela URL do webhook copiada no passo 8!

## ✅ TESTE FINAL

### 1. Enviar Mensagem do WhatsApp para a Clínica

Do seu celular pessoal:
```
Olá! Sou paciente novo, quero começar! 😊
```

### 2. Verificar no Dashboard

1. Acesse: `http://localhost:3001/whatsapp`
2. Recarregue a página (F5)
3. A mensagem deve aparecer no Kanban! 🎉

### 3. Responder pelo Dashboard

1. Clique no card do paciente
2. Digite uma resposta
3. Clique "Enviar"
4. Verifique se chegou no WhatsApp! ✅

## 🎉 PRONTO!

**Você agora tem:**
- ✅ WhatsApp conectado
- ✅ Dashboard Kanban funcionando
- ✅ Mensagens recebidas aparecem em tempo real
- ✅ Mensagens enviadas pelo dashboard chegam no WhatsApp
- ✅ Sistema de score automático
- ✅ Badges e ranqueamento

## 🔧 Troubleshooting

### Erro: "Webhook not receiving messages"

1. **Verifique se o webhook está ativo:**
   ```bash
   curl https://SUA-URL.railway.app/webhook/find/nutribuddy-clinic \
     -H "apikey: NutriBuddy@2025!Segura"
   ```

2. **Re-configure o webhook:**
   ```bash
   # Desabilitar
   curl -X DELETE https://SUA-URL.railway.app/webhook/delete/nutribuddy-clinic \
     -H "apikey: NutriBuddy@2025!Segura"
   
   # Reconfigurar (passo 10 novamente)
   ```

### Erro: "Instance disconnected"

1. **Verificar status:**
   ```bash
   curl https://SUA-URL.railway.app/instance/connectionState/nutribuddy-clinic \
     -H "apikey: NutriBuddy@2025!Segura"
   ```

2. **Reconectar:**
   - Pegar novo QR Code
   - Escanear novamente

### Erro: "Patient not found"

1. **Adicionar campo `phone` no Firestore:**
   - Firebase Console → Firestore
   - Collection: `users`
   - Editar documento do paciente
   - Adicionar campo: `phone: "5511999998888"`
   - **Formato:** Sem espaços, sem + (apenas números)

### Mensagens não aparecem no Dashboard

1. **Verificar se o Firestore foi atualizado:**
   - Firebase Console → Firestore
   - Collection: `whatsappMessages`
   - Deve ter novos documentos

2. **Recarregar página:**
   - F5 no Dashboard
   - Limpar cache: Ctrl+Shift+R

## 📊 Próximos Passos

### Adicionar Todos os Pacientes

Para cada paciente, adicione o campo `phone` no Firestore:

```javascript
// Firebase Console → Firestore → users → {patientId}
{
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "5511999998888", // ← ADICIONAR
  role: "patient",
  prescriberId: "prescritor123",
  // ... outros campos
}
```

### Configurar Workflows Adicionais

Ainda temos 3 workflows opcionais:
- **Workflow 3:** Análise de sentimento com OpenAI
- **Workflow 4:** Atualizar score quando refeição for registrada
- **Workflow 5:** Alertas automáticos diários

Veja documentação completa em:
- `WHATSAPP-EVOLUTION-API-SETUP.md`
- `WHATSAPP-KANBAN-INTEGRACAO-N8N.md`

## 🔐 Segurança

### Alterar API Key Padrão

```bash
# No Railway (Evolution API)
# Vá em Variables
# Mude AUTHENTICATION_API_KEY para algo único:

AUTHENTICATION_API_KEY=S3nh4Sup3rF0rt3!NutriBuddy@2025#
```

### Usar HTTPS

- Railway já fornece HTTPS automaticamente
- N8N Cloud também usa HTTPS
- ✅ Tudo seguro!

## 📱 Apps Recomendados

### Para Testar Webhooks
- **Postman**: https://postman.com
- **Insomnia**: https://insomnia.rest

### Para Ver Logs
- **Railway Dashboard**: Veja logs em tempo real
- **N8N Executions**: Veja execuções dos workflows

## 🆘 Suporte

### Evolution API
- Docs: https://doc.evolution-api.com
- GitHub: https://github.com/EvolutionAPI/evolution-api
- Discord: https://discord.gg/evolutionapi

### N8N
- Docs: https://docs.n8n.io
- Community: https://community.n8n.io

### Firebase
- Docs: https://firebase.google.com/docs
- Console: https://console.firebase.google.com

---

**🎉 PARABÉNS! Sistema completo em produção!**

Agora você tem um **Dashboard Kanban profissional** integrado com **WhatsApp real** usando API não oficial, **grátis** e **funcional**! 🚀

