# 🚀 Deploy Evolution API - Passo a Passo

**Tempo estimado:** 10 minutos  
**Status atual:** Sistema 95% pronto, falta apenas Evolution API  
**Depois deste deploy:** Sistema 100% operacional! 🎉

---

## 📋 PRÉ-REQUISITOS

- [x] Workflows N8N importados ✅ (você já fez!)
- [x] Conta Railway ativa
- [x] WhatsApp Business disponível para conectar
- [x] URL N8N webhook: `https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp`

---

## 🎯 OPÇÃO 1: DEPLOY VIA TEMPLATE RAILWAY (Recomendado - 5 min)

### Passo 1: Acessar Railway

```
https://railway.app
→ Login com sua conta
```

### Passo 2: Criar Novo Projeto

```
1. Dashboard → "New Project"
2. Selecionar: "Deploy from a Template"
3. Buscar: "evolution-api"
4. OU usar link direto:
   https://railway.app/template/evolution-api
```

### Passo 3: Configurar Variáveis Obrigatórias

**Template vai pedir estas variáveis:**

```env
# 1. Authentication (IMPORTANTE - anote esta chave!)
AUTHENTICATION_API_KEY=NutriBuddy2025!Secure#Key

# 2. Database (Railway cria automaticamente PostgreSQL)
# Deixe vazio, Railway vai preencher automaticamente

# 3. Server URL
SERVER_URL=${RAILWAY_PUBLIC_DOMAIN}
# OU manualmente: https://seu-projeto.up.railway.app

# 4. Webhook N8N (IMPORTANTE!)
WEBHOOK_GLOBAL_URL=https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true

# 5. Eventos WhatsApp
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
```

### Passo 4: Deploy

```
1. Clicar "Deploy"
2. Aguardar 2-3 minutos
3. Railway vai:
   - Criar PostgreSQL
   - Build da Evolution API
   - Deploy automático
   - Gerar URL pública
```

### Passo 5: Copiar URL

```
Após deploy:
1. Clicar no projeto Evolution API
2. Settings → Domains
3. Copiar URL pública
   Exemplo: https://evolution-api-production-xxxx.up.railway.app
```

**✅ PRONTO! Evolution API deployada!**

---

## 🎯 OPÇÃO 2: DEPLOY MANUAL (Advanced - 10 min)

### Passo 1: Criar Projeto Railway

```bash
# 1. Instalar Railway CLI (se não tiver)
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init
# Nome: "nutribuddy-evolution-api"
```

### Passo 2: Adicionar PostgreSQL

```bash
# No Railway Dashboard:
# Projeto → New → Database → PostgreSQL
# Copiar DATABASE_URL
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# No Railway Dashboard → Variables
# Adicionar uma por uma:

AUTHENTICATION_API_KEY=NutriBuddy2025!Secure#Key
SERVER_URL=https://seu-projeto.up.railway.app
PORT=8080
NODE_ENV=production

# Database
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=${DATABASE_URL}
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true

# Webhooks N8N
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true

# Eventos
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=false
WEBHOOK_EVENTS_STATUS_INSTANCE=true

# Storage (opcional - desabilitar para começar)
STORAGE_ENABLED=false

# Logs
LOG_LEVEL=info
LOG_COLOR=true

# Qrcode
QRCODE_LIMIT=30
QRCODE_COLOR=#198754
```

### Passo 4: Deploy via GitHub (Recomendado)

```bash
# 1. Clonar repositório Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# 2. Criar repo no seu GitHub
gh repo create nutribuddy-evolution --private

# 3. Push
git remote add origin https://github.com/seu-usuario/nutribuddy-evolution.git
git push -u origin main

# 4. Railway → New Project → Deploy from GitHub
# Selecionar: nutribuddy-evolution
```

### Passo 5: Aguardar Deploy

```
Railway vai:
- Detectar Dockerfile
- Build da imagem
- Deploy automático
- Gerar URL
```

---

## ✅ VERIFICAR DEPLOY

### Teste 1: API está respondendo

```bash
# Substituir pela sua URL
export EVOLUTION_URL="https://seu-projeto.up.railway.app"

# Teste básico
curl -I $EVOLUTION_URL

# Esperado: HTTP/2 200 OK
```

### Teste 2: Manager disponível

```bash
# Abrir no navegador
open $EVOLUTION_URL/manager

# OU
curl $EVOLUTION_URL/manager

# Esperado: Página HTML do manager
```

### Teste 3: API Key funcionando

```bash
export API_KEY="NutriBuddy2025!Secure#Key"

curl -X GET "$EVOLUTION_URL/instance/fetchInstances" \
  -H "apikey: $API_KEY"

# Esperado: [] (lista vazia de instâncias - normal no início)
```

**Se todos os testes passaram: ✅ Evolution API OK!**

---

## 📱 CRIAR INSTÂNCIA WHATSAPP

### Opção A: Via cURL (Recomendado)

```bash
# Definir variáveis
export EVOLUTION_URL="https://seu-projeto.up.railway.app"
export API_KEY="NutriBuddy2025!Secure#Key"
export INSTANCE_NAME="nutribuddy-clinic"

# Criar instância
curl -X POST "$EVOLUTION_URL/instance/create" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "'$INSTANCE_NAME'",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "webhookUrl": "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp",
    "webhookByEvents": true,
    "webhookEvents": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }'
```

**Resposta esperada:**

```json
{
  "instance": {
    "instanceName": "nutribuddy-clinic",
    "status": "created"
  },
  "hash": {
    "apikey": "sua-instance-api-key"
  },
  "qrcode": {
    "code": "2@...",
    "base64": "data:image/png;base64,iVBORw0KG..."
  }
}
```

### Opção B: Via Manager (Interface gráfica)

```bash
# 1. Abrir Manager
open $EVOLUTION_URL/manager

# 2. Login com API Key
# Usuário: (deixar vazio)
# Senha: NutriBuddy2025!Secure#Key

# 3. Clicar "Create Instance"
# Nome: nutribuddy-clinic
# Webhook: https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp

# 4. Clicar "Create"
```

---

## 📲 CONECTAR WHATSAPP VIA QR CODE

### Método 1: Pegar QR Code via API

```bash
# 1. Conectar instância (gera QR Code)
curl -X GET "$EVOLUTION_URL/instance/connect/$INSTANCE_NAME" \
  -H "apikey: $API_KEY"

# Resposta: JSON com QR Code base64
# Copiar o campo "base64"
```

**Decodificar QR Code:**

```bash
# Método A: Online
# 1. Copiar string base64 (data:image/png;base64,...)
# 2. Abrir: https://base64.guru/converter/decode/image
# 3. Colar e converter
# 4. Baixar imagem QR Code

# Método B: Salvar arquivo
# No response JSON, copiar base64 e salvar:
echo "data:image/png;base64,iVBORw..." > qrcode.txt

# Usar website para ver imagem
```

### Método 2: Via Manager (Mais fácil)

```bash
# 1. Abrir Manager
open $EVOLUTION_URL/manager

# 2. Ver instância "nutribuddy-clinic"
# 3. QR Code aparece na tela automaticamente
# 4. Escanear com WhatsApp
```

### Escanear QR Code no WhatsApp

```
1. Abrir WhatsApp no celular
2. Menu (⋮) → "Aparelhos conectados"
3. "Conectar um aparelho"
4. Escanear QR Code que apareceu
5. Aguardar conexão (5-10 segundos)
```

---

## ✅ VERIFICAR CONEXÃO

```bash
# Verificar status da conexão
curl -X GET "$EVOLUTION_URL/instance/connectionState/$INSTANCE_NAME" \
  -H "apikey: $API_KEY"
```

**Respostas possíveis:**

```json
// ✅ Conectado
{"state": "open"}

// ⏳ Aguardando QR Code
{"state": "connecting"}

// ❌ Desconectado
{"state": "close"}
```

**Se state = "open": ✅ WhatsApp conectado com sucesso!**

---

## 🔗 CONFIGURAR WEBHOOK N8N (Verificação)

### Verificar se webhook está configurado

```bash
curl -X GET "$EVOLUTION_URL/webhook/find/$INSTANCE_NAME" \
  -H "apikey: $API_KEY"
```

**Esperado:**

```json
{
  "url": "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp",
  "enabled": true,
  "webhookByEvents": true,
  "events": [
    "MESSAGES_UPSERT",
    "CONNECTION_UPDATE"
  ]
}
```

### Se webhook não estiver configurado, configurar:

```bash
curl -X POST "$EVOLUTION_URL/webhook/set/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp",
    "enabled": true,
    "webhookByEvents": true,
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }'
```

---

## 🧪 TESTAR INTEGRAÇÃO COMPLETA

### Teste 1: Enviar mensagem de teste

```bash
# Enviar mensagem para um número (substitua pelo seu)
curl -X POST "$EVOLUTION_URL/message/sendText/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999998888",
    "text": "🤖 Teste automático do NutriBuddy! Sistema funcionando!"
  }'
```

**Esperado:**
- ✅ Retorna JSON com `key.id`
- ✅ Mensagem chega no WhatsApp

### Teste 2: Verificar webhook N8N

```bash
# Enviar mensagem do WhatsApp para o número conectado
# Ex: "Olá, teste!"

# Verificar se N8N recebeu:
# 1. Abrir N8N: https://n8n-production-3eae.up.railway.app
# 2. Workflow: "Evolution: Receber Mensagens WhatsApp"
# 3. Ver "Executions" (menu lateral)
# 4. Deve aparecer execução nova ✅
```

---

## 📊 CONFIGURAR VARIÁVEIS N8N (Importante!)

### Adicionar variáveis no Railway N8N

```bash
# Railway → Projeto N8N → Variables → Add Variable

# 1. Evolution API URL
EVOLUTION_API_URL=https://seu-evolution.up.railway.app

# 2. Evolution API Key
EVOLUTION_API_KEY=NutriBuddy2025!Secure#Key

# 3. Evolution Instance Name
EVOLUTION_INSTANCE_NAME=nutribuddy-clinic
```

### Após adicionar variáveis:

```
1. Railway → N8N → Redeploy
2. Aguardar 1-2 minutos
3. Workflows vão usar as variáveis automaticamente
```

---

## ✅ CHECKLIST FINAL

### Evolution API
- [ ] Deployada no Railway
- [ ] URL pública funcionando
- [ ] Manager acessível
- [ ] API Key definida
- [ ] Database PostgreSQL conectada
- [ ] Variáveis de ambiente configuradas

### Instância WhatsApp
- [ ] Instância criada (`nutribuddy-clinic`)
- [ ] QR Code gerado
- [ ] QR Code escaneado no WhatsApp
- [ ] Status: "open" (conectado)
- [ ] Webhook N8N configurado

### Integração N8N
- [ ] Variáveis adicionadas no Railway N8N
- [ ] N8N redeployado
- [ ] Webhook testado (enviar mensagem)
- [ ] Execução aparece no N8N

### Testes
- [ ] Enviar mensagem via API → WhatsApp
- [ ] Enviar mensagem WhatsApp → N8N recebe
- [ ] Manager mostra instância conectada

---

## 🎉 PRONTO!

**Se todos os checks acima estão ✅:**

→ Evolution API está 100% operacional!  
→ Próximo arquivo: `ATIVAR-WORKFLOWS-E-TESTAR.md`  
→ Sistema 100% completo em 5 minutos!

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Erro: "Unauthorized"
```bash
# Verificar API Key está correta
echo $API_KEY
# Deve ser exatamente: NutriBuddy2025!Secure#Key
```

### Erro: "Instance not found"
```bash
# Listar instâncias
curl "$EVOLUTION_URL/instance/fetchInstances" -H "apikey: $API_KEY"
# Verificar nome correto
```

### Erro: "Connection lost"
```bash
# Reconectar QR Code
curl "$EVOLUTION_URL/instance/connect/$INSTANCE_NAME" -H "apikey: $API_KEY"
# Escanear novo QR Code
```

### Erro: "Webhook not working"
```bash
# Testar webhook manualmente
curl -X POST "https://n8n-production-3eae.up.railway.app/webhook/evolution-whatsapp" \
  -d '{"test": true}'
# Deve retornar 200 OK
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Ver todas as instâncias
curl "$EVOLUTION_URL/instance/fetchInstances" -H "apikey: $API_KEY"

# Logout instância
curl -X DELETE "$EVOLUTION_URL/instance/logout/$INSTANCE_NAME" -H "apikey: $API_KEY"

# Deletar instância
curl -X DELETE "$EVOLUTION_URL/instance/delete/$INSTANCE_NAME" -H "apikey: $API_KEY"

# Restart instância
curl -X PUT "$EVOLUTION_URL/instance/restart/$INSTANCE_NAME" -H "apikey: $API_KEY"

# Ver informações da instância
curl "$EVOLUTION_URL/instance/connectionState/$INSTANCE_NAME" -H "apikey: $API_KEY"
```

---

**🚀 Boa sorte com o deploy!**

