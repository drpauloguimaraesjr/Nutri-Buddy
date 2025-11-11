# 🚀 Setup WhatsApp com Evolution API (NÃO OFICIAL - FÁCIL)

## 🎯 Por Que Evolution API?

✅ **Super Fácil:** Conecta via QR Code como WhatsApp Web
✅ **Rápido:** 5 minutos para configurar
✅ **Grátis:** Open source, sem custos
✅ **Completo:** Texto, imagens, áudios, documentos
✅ **Estável:** Usado por milhares de empresas
✅ **Webhooks:** Integração automática com N8N

## ⚠️ Avisos Importantes

1. **Não é oficial:** WhatsApp pode bloquear contas que usam bots (raro com uso moderado)
2. **Use número separado:** Não use seu número pessoal principal
3. **Volume moderado:** Perfeito para clínicas com até 100-200 pacientes
4. **Backup:** Mantenha backup das conversas importantes

## 📋 Pré-requisitos

- [ ] Chip/número de celular para a clínica (separado)
- [ ] Conta Railway ou Render (grátis)
- [ ] N8N instalado (você já tem)
- [ ] 10 minutos do seu tempo

## 🚀 Passo 1: Deploy da Evolution API

### Opção A: Deploy no Railway (RECOMENDADO)

1. **Acesse Railway:**
   ```
   https://railway.app
   ```

2. **Clique em "New Project" → "Deploy from GitHub repo"**

3. **Use o template oficial:**
   ```
   https://github.com/EvolutionAPI/evolution-api
   ```

4. **Configure as variáveis de ambiente:**
   ```env
   # Básicas
   SERVER_URL=https://seu-app.railway.app
   AUTHENTICATION_API_KEY=MUDE_PARA_UMA_SENHA_FORTE_123
   
   # Database (PostgreSQL do Railway)
   DATABASE_ENABLED=true
   DATABASE_PROVIDER=postgresql
   DATABASE_CONNECTION_URI=postgresql://usuario:senha@host:porta/database
   
   # Webhooks
   WEBHOOK_GLOBAL_ENABLED=true
   WEBHOOK_GLOBAL_URL=https://seu-n8n.app/webhook/evolution
   WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
   
   # Configurações
   CONFIG_SESSION_PHONE_CLIENT=NutriBuddy
   CONFIG_SESSION_PHONE_NAME=Sistema NutriBuddy
   ```

5. **Deploy e anote a URL:**
   ```
   https://seu-app.railway.app
   ```

### Opção B: Docker Local (Para Testar)

```bash
# Clone o repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configure .env
cp .env.example .env
# Edite .env com suas configurações

# Rode com Docker
docker-compose up -d

# Evolution API estará em:
http://localhost:8080
```

## 🔗 Passo 2: Conectar WhatsApp (QR Code)

### 1. Criar Instância

```bash
# Via curl ou Postman
curl -X POST https://seu-app.railway.app/instance/create \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "nutribuddy-clinic",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

**Ou use a interface web:**
```
https://seu-app.railway.app/manager
```

### 2. Conectar WhatsApp

```bash
# Buscar QR Code
curl https://seu-app.railway.app/instance/connect/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY"
```

**Resposta:**
```json
{
  "instance": "nutribuddy-clinic",
  "qrcode": "data:image/png;base64,iVBOR...",
  "code": "ABCD-EFGH-IJKL"
}
```

### 3. Escanear QR Code

1. Abra WhatsApp no celular da clínica
2. Vá em **Configurações → Aparelhos conectados**
3. Clique em **"Conectar um aparelho"**
4. Escaneie o QR Code gerado
5. ✅ Pronto! WhatsApp conectado!

## 📨 Passo 3: Testar Envio de Mensagem

```bash
# Enviar mensagem de teste
curl -X POST https://seu-app.railway.app/message/sendText/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999998888",
    "text": "Olá! Esta é uma mensagem teste do Sistema NutriBuddy 🥗"
  }'
```

## 🔔 Passo 4: Configurar Webhooks para N8N

### No N8N, crie um Webhook Node:

```javascript
// Webhook URL:
https://seu-n8n.app/webhook/evolution-whatsapp

// Método: POST
// Autenticação: Nenhuma (ou adicione header authentication)
```

### Configure na Evolution API:

```bash
curl -X POST https://seu-app.railway.app/webhook/set/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-n8n.app/webhook/evolution-whatsapp",
    "webhook_by_events": true,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "CONNECTION_UPDATE"
    ]
  }'
```

## 🔄 Passo 5: Workflows N8N Atualizados

### Workflow 1: Receber Mensagens WhatsApp

```json
{
  "nodes": [
    {
      "name": "Webhook Evolution",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "evolution-whatsapp",
        "method": "POST"
      }
    },
    {
      "name": "Filtrar Mensagens Recebidas",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event}}",
              "operation": "equals",
              "value2": "messages.upsert"
            },
            {
              "value1": "={{$json.data.key.fromMe}}",
              "operation": "equals",
              "value2": "false"
            }
          ]
        }
      }
    },
    {
      "name": "Extrair Dados",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "phone",
              "value": "={{$json.data.key.remoteJid.replace('@s.whatsapp.net', '')}}"
            },
            {
              "name": "message",
              "value": "={{$json.data.message.conversation || $json.data.message.extendedTextMessage?.text || ''}}"
            },
            {
              "name": "messageId",
              "value": "={{$json.data.key.id}}"
            },
            {
              "name": "timestamp",
              "value": "={{new Date($json.data.messageTimestamp * 1000).toISOString()}}"
            },
            {
              "name": "hasMedia",
              "value": "={{!!$json.data.message.imageMessage || !!$json.data.message.documentMessage}}"
            }
          ]
        }
      }
    },
    {
      "name": "Buscar Paciente no Firestore",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "query",
        "collection": "users",
        "filters": {
          "conditions": [
            {
              "field": "phone",
              "operator": "==",
              "value": "={{$json.phone}}"
            }
          ]
        }
      }
    },
    {
      "name": "Salvar Mensagem",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "create",
        "collection": "whatsappMessages",
        "fields": {
          "conversationId": "={{$json.conversationId}}",
          "patientId": "={{$json.patientId}}",
          "senderId": "={{$json.patientId}}",
          "senderName": "={{$json.patientName}}",
          "senderType": "patient",
          "content": "={{$json.message}}",
          "timestamp": "={{new Date()}}",
          "isFromPatient": true,
          "hasImage": "={{$json.hasMedia}}",
          "analyzed": false
        }
      }
    },
    {
      "name": "Atualizar Conversa",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "update",
        "collection": "whatsappConversations",
        "documentId": "={{$json.conversationId}}",
        "fields": {
          "lastMessage": {
            "content": "={{$json.message}}",
            "timestamp": "={{new Date()}}",
            "senderType": "patient"
          },
          "lastMessageAt": "={{new Date()}}",
          "unreadCount": "={{$json.currentUnreadCount + 1}}",
          "updatedAt": "={{new Date()}}"
        }
      }
    }
  ]
}
```

### Workflow 2: Enviar Mensagens do Dashboard

```json
{
  "nodes": [
    {
      "name": "Firestore Trigger",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "listen",
        "collection": "whatsappMessages",
        "filters": {
          "conditions": [
            {
              "field": "senderType",
              "operator": "==",
              "value": "prescriber"
            },
            {
              "field": "sent",
              "operator": "==",
              "value": false
            }
          ]
        }
      }
    },
    {
      "name": "Buscar Telefone Paciente",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "get",
        "collection": "users",
        "documentId": "={{$json.patientId}}"
      }
    },
    {
      "name": "Enviar via Evolution API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://seu-app.railway.app/message/sendText/nutribuddy-clinic",
        "headers": {
          "apikey": "SUA_API_KEY",
          "Content-Type": "application/json"
        },
        "body": {
          "number": "={{$json.phone}}",
          "text": "={{$json.content}}"
        }
      }
    },
    {
      "name": "Marcar como Enviada",
      "type": "n8n-nodes-base.firestore",
      "parameters": {
        "operation": "update",
        "collection": "whatsappMessages",
        "documentId": "={{$json.messageId}}",
        "fields": {
          "sent": true,
          "sentAt": "={{new Date()}}"
        }
      }
    }
  ]
}
```

## 📱 Estrutura Atualizada do Firestore

### Adicionar campo `phone` em `users`

```typescript
users/{userId} {
  name: string,
  email: string,
  phone: string, // ← ADICIONAR (formato: 5511999998888)
  role: string,
  // ... outros campos
}
```

### Adicionar campo `sent` em `whatsappMessages`

```typescript
whatsappMessages/{messageId} {
  conversationId: string,
  patientId: string,
  content: string,
  senderType: 'patient' | 'prescriber' | 'system',
  timestamp: Date,
  sent: boolean, // ← ADICIONAR
  sentAt: Date?, // ← ADICIONAR
  // ... outros campos
}
```

## 🔧 Comandos Úteis Evolution API

### Verificar Status da Conexão
```bash
curl https://seu-app.railway.app/instance/connectionState/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY"
```

### Desconectar WhatsApp
```bash
curl -X DELETE https://seu-app.railway.app/instance/logout/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY"
```

### Listar Todas as Instâncias
```bash
curl https://seu-app.railway.app/instance/fetchInstances \
  -H "apikey: SUA_API_KEY"
```

### Enviar Imagem
```bash
curl -X POST https://seu-app.railway.app/message/sendMedia/nutribuddy-clinic \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999998888",
    "mediatype": "image",
    "media": "https://url-da-imagem.com/foto.jpg",
    "caption": "Sua dieta da semana!"
  }'
```

## 🎯 Vantagens vs API Oficial

| Característica | Evolution API | WhatsApp Business API Oficial |
|----------------|---------------|-------------------------------|
| **Setup** | 5 minutos | Vários dias/semanas |
| **Custo** | Gratuito | Cobra por conversa |
| **Aprovação** | Não precisa | Meta precisa aprovar |
| **Limite de mensagens** | Ilimitado* | Tiered pricing |
| **QR Code** | Sim (fácil) | Não |
| **Multi-dispositivo** | Sim | Sim |
| **Documentação** | PT-BR | Inglês |

\* *Respeite limites do WhatsApp para evitar ban (não spamme)*

## ⚠️ Boas Práticas

### Para Não Ser Banido:

1. **Não envie spam:** Máximo 20-30 mensagens por hora
2. **Respeite horários:** Evite enviar após 22h
3. **Aguarde resposta:** Não envie múltiplas mensagens seguidas
4. **Use número comercial:** Não use número pessoal
5. **Identifique-se:** Primeira mensagem sempre identifique a clínica
6. **Opt-in:** Paciente deve consentir em receber mensagens

### Mensagem Inicial Recomendada:
```
Olá! Aqui é o Sistema NutriBuddy da Clínica [NOME]. 

Você está recebendo esta mensagem porque se cadastrou 
como nosso paciente. Vamos usar este WhatsApp para:

✅ Acompanhar seu progresso
✅ Enviar lembretes
✅ Responder suas dúvidas

Responda OK para confirmar que deseja receber nossas mensagens.
```

## 🚀 Deploy Rápido (5 minutos)

### Script Completo:

```bash
#!/bin/bash

# 1. Deploy Evolution API no Railway
echo "1. Acesse: https://railway.app"
echo "2. New Project → Deploy Template"
echo "3. Use: https://github.com/EvolutionAPI/evolution-api"

# 2. Configure variáveis (no Railway Dashboard)
echo "Configure as variáveis de ambiente"

# 3. Teste a API
API_URL="https://seu-app.railway.app"
API_KEY="SUA_API_KEY"

# Criar instância
curl -X POST $API_URL/instance/create \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "nutribuddy-clinic",
    "qrcode": true
  }'

# Conectar (pegue o QR Code)
curl $API_URL/instance/connect/nutribuddy-clinic \
  -H "apikey: $API_KEY"

echo "Escaneie o QR Code com o WhatsApp da clínica!"
```

## 🎉 Resultado Final

Depois de configurado, você terá:

✅ WhatsApp conectado via QR Code (como WhatsApp Web)
✅ Mensagens recebidas → Aparecem no Dashboard Kanban
✅ Mensagens enviadas pelo Dashboard → Chegam no WhatsApp do paciente
✅ Sistema de score atualizado automaticamente
✅ Badges conquistadas geram mensagens automáticas
✅ Tudo em tempo real!

## 📞 Suporte Evolution API

- **Documentação:** https://doc.evolution-api.com
- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Discord:** https://discord.gg/evolutionapi
- **Telegram:** https://t.me/evolutionapi

## 💡 Dicas Extras

### Backup Automático
Configure backup diário das conversas no Firestore:
```javascript
// Cloud Function ou N8N Schedule
// Exportar conversas a cada 24h
```

### Múltiplas Clínicas
Crie uma instância para cada clínica:
```
- nutribuddy-clinic-sp (São Paulo)
- nutribuddy-clinic-rj (Rio de Janeiro)
- nutribuddy-clinic-mg (Minas Gerais)
```

### Analytics
Monitore:
- Mensagens enviadas/dia
- Taxa de resposta dos pacientes
- Horários de maior atividade

---

**PRONTO! Muito mais simples que a API oficial!** 🚀

Quer que eu crie os workflows N8N completos agora com a Evolution API?

