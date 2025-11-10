# 🚀 Setup Completo - Sistema de Mensagens NutriBuddy

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Backend](#setup-backend)
3. [Setup Frontend](#setup-frontend)
4. [Setup N8N Docker](#setup-n8n-docker)
5. [Configurar Firestore](#configurar-firestore)
6. [Importar Workflows N8N](#importar-workflows-n8n)
7. [Testar Sistema](#testar-sistema)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### Instalados no Sistema:
- ✅ Node.js 18+ 
- ✅ Docker Desktop (para N8N)
- ✅ Git
- ✅ Conta Firebase com projeto configurado

### Contas Necessárias:
- Firebase (já configurado)
- OpenAI (para IA) ou Google AI Studio
- Gmail (para envio de emails via N8N)

---

## 🔧 Setup Backend

### 1. Verificar se o backend está rodando

```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

**Resposta esperada:**
```
🚀 NutriBuddy API Server Running
📍 Port: 3000
🌍 Environment: development
📡 Firebase: Connected
🔗 http://localhost:3000
```

### 2. Testar endpoints de mensagens

```bash
# Health check
curl http://localhost:3000/api/health

# Testar endpoint de conversas (precisa de token)
curl -H "Authorization: Bearer SEU_TOKEN" \
     http://localhost:3000/api/messages/conversations
```

**✅ Se funcionou:** Continue para próximo passo

**❌ Se deu erro:** Verifique:
- Backend está rodando?
- Arquivo `.env` está configurado?
- Firebase está conectado?

---

## 🎨 Setup Frontend

### 1. Instalar dependências (se ainda não instalou)

```bash
cd /Users/drpgjr.../NutriBuddy/frontend
npm install
```

### 2. Verificar variáveis de ambiente

Criar/verificar arquivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=sua-chave-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
```

### 3. Rodar frontend

```bash
npm run dev
```

**Resposta esperada:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
- Ready in 2.5s
```

### 4. Acessar páginas de mensagens

**Para Prescritores:**
```
http://localhost:3001/messages
```

**Para Pacientes:**
```
http://localhost:3001/chat
```

---

## 🐳 Setup N8N Docker

### 1. Criar diretório para N8N

```bash
mkdir -p ~/.n8n
cd ~/.n8n
```

### 2. Criar arquivo docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: nutribuddy-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=nutribuddy123
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      # Variáveis para os workflows
      - API_URL=http://host.docker.internal:3000
      - FIREBASE_TOKEN=${FIREBASE_TOKEN}
      - PRESCRIBER_EMAIL=${PRESCRIBER_EMAIL}
      - FRONTEND_URL=http://localhost:3001
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### 3. Criar arquivo .env no mesmo diretório

```bash
# ~/.n8n/.env
FIREBASE_TOKEN=seu-firebase-token-aqui
PRESCRIBER_EMAIL=seu-email@example.com
```

**Como obter o FIREBASE_TOKEN:**

```bash
cd /Users/drpgjr.../NutriBuddy
node generate-token.js
```

Copie o token gerado e cole no arquivo `.env`

### 4. Iniciar N8N

```bash
cd ~/.n8n
docker-compose up -d
```

**Verificar se está rodando:**

```bash
docker ps
```

Deve aparecer: `nutribuddy-n8n`

### 5. Acessar N8N

```
http://localhost:5678
```

**Login:**
- Username: `admin`
- Password: `nutribuddy123`

---

## 🔥 Configurar Firestore

### 1. Configurar Rules

Acesse: Firebase Console → Firestore Database → Rules

Cole o seguinte:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para conversas
    match /conversations/{conversationId} {
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.prescriberId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow create: if request.auth != null;
      
      allow update: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.prescriberId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        resource.data.prescriberId == request.auth.uid
      );
      
      // Subcollection de mensagens
      match /messages/{messageId} {
        allow read: if request.auth != null && (
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.patientId == request.auth.uid ||
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.prescriberId == request.auth.uid ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
        
        allow create: if request.auth != null;
        allow update: if request.auth != null;
      }
    }
    
    // Regras para templates (apenas prescritores)
    match /message-templates/{templateId} {
      allow read: if request.auth != null && (
        resource.data.prescriberId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow create: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prescriber' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow update, delete: if request.auth != null && (
        resource.data.prescriberId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
  }
}
```

**Clique em "Publicar"**

### 2. Criar Índices Compostos

Acesse: Firebase Console → Firestore Database → Indexes

Clique em "Add Index" e crie os seguintes:

**Índice 1:**
- Collection: `conversations`
- Fields:
  - `prescriberId` (Ascending)
  - `kanbanColumn` (Ascending)
  - `lastMessageAt` (Descending)

**Índice 2:**
- Collection: `conversations`
- Fields:
  - `patientId` (Ascending)
  - `lastMessageAt` (Descending)

**Índice 3:**
- Collection Group: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `createdAt` (Ascending)

**⚠️ IMPORTANTE:** Os índices podem levar 5-10 minutos para serem criados.

---

## 📥 Importar Workflows N8N

### 1. Acessar N8N

```
http://localhost:5678
```

### 2. Importar cada workflow

Para cada arquivo em `/Users/drpgjr.../NutriBuddy/n8n-workflows/`:

1. No N8N, clique em **"Workflows"** (menu lateral)
2. Clique em **"Add Workflow"** → **"Import from File"**
3. Selecione o arquivo JSON
4. Clique em **"Save"**

**Workflows para importar:**
- ✅ `1-autoresposta-inicial.json`
- ✅ `2-analise-sentimento.json`
- ✅ `3-sugestoes-resposta.json`
- ✅ `4-followup-automatico.json`
- ✅ `5-resumo-diario.json`

### 3. Configurar credenciais OpenAI (se usar workflows com IA)

1. No N8N, vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Selecione **"OpenAI API"**
4. Cole sua API Key
5. Clique em **"Save"**

### 4. Configurar credenciais Gmail (para emails)

1. No N8N, vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Selecione **"Gmail OAuth2 API"**
4. Siga o fluxo OAuth para autorizar
5. Clique em **"Save"**

### 5. Ativar workflows

Para cada workflow importado:

1. Abra o workflow
2. No canto superior direito, clique no toggle para **"Active"**
3. Verifique se não há erros (ícone vermelho)

---

## 🧪 Testar Sistema

### Teste 1: Criar Conversa (Paciente)

1. Faça login como paciente no frontend
2. Acesse: `http://localhost:3001/chat`
3. Digite uma mensagem
4. Clique em "Enviar"

**✅ Sucesso:** Mensagem aparece no chat

### Teste 2: Visualizar no Kanban (Prescritor)

1. Faça login como prescritor
2. Acesse: `http://localhost:3001/messages`
3. Verifique se o card aparece na coluna "Novas"

**✅ Sucesso:** Card aparece com nome do paciente e mensagem

### Teste 3: Responder Mensagem

1. Clique no card do paciente
2. Digite uma resposta
3. Envie

**✅ Sucesso:** Mensagem enviada e card move para "Em Atendimento"

### Teste 4: Auto-resposta (N8N)

1. Como paciente, envie uma mensagem
2. Aguarde 2 minutos sem responder (como prescritor)
3. Verifique se recebe auto-resposta

**✅ Sucesso:** Auto-resposta aparece no chat após 2 minutos

### Teste 5: Análise de Sentimento

1. Como paciente, envie: "URGENTE! Não estou conseguindo seguir a dieta!"
2. Como prescritor, verifique o card no Kanban
3. Deve estar marcado como "Alta Prioridade"

**✅ Sucesso:** Card aparece com badge vermelho "Urgente"

---

## 🔍 Verificar Logs

### Logs do Backend

```bash
# No terminal onde o backend está rodando
# Você verá logs de cada request
```

### Logs do N8N

```bash
docker logs nutribuddy-n8n -f
```

### Logs do Frontend

```bash
# No terminal onde o frontend está rodando
# Você verá logs do Next.js
```

---

## 🐛 Troubleshooting

### Problema: "Conversa não encontrada"

**Solução:**
1. Verifique se o backend está rodando
2. Verifique se as rules do Firestore estão corretas
3. Verifique se o usuário tem permissão

### Problema: "Erro ao enviar mensagem"

**Solução:**
1. Verifique token de autenticação
2. Verifique endpoint no console do navegador (F12)
3. Verifique logs do backend

### Problema: N8N não está enviando auto-respostas

**Solução:**
1. Verifique se o workflow está ativo (toggle verde)
2. Verifique variáveis de ambiente no docker-compose
3. Verifique logs do N8N:
   ```bash
   docker logs nutribuddy-n8n -f
   ```

### Problema: Kanban não carrega conversas

**Solução:**
1. Abra console do navegador (F12)
2. Verifique se há erros de API
3. Verifique se está logado como prescritor
4. Verifique se o endpoint retorna dados:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
        http://localhost:3000/api/messages/conversations
   ```

### Problema: "Cannot find module './routes/messages'"

**Solução:**
```bash
cd /Users/drpgjr.../NutriBuddy
ls -la routes/messages.js
# Se não existir, o arquivo não foi criado corretamente
# Recrie o arquivo routes/messages.js
```

### Problema: Índices do Firestore não funcionam

**Solução:**
1. Firebase Console → Firestore → Indexes
2. Aguarde índices serem criados (5-10 min)
3. Status deve estar "Enabled" (verde)

---

## 📊 Monitoramento

### Dashboard N8N

```
http://localhost:5678/workflows
```

Aqui você vê:
- ✅ Workflows ativos
- 📊 Execuções recentes
- ❌ Erros
- ⏱️ Tempo de execução

### Firestore Console

```
https://console.firebase.google.com
```

- Ver conversas em tempo real
- Ver mensagens
- Verificar regras e índices

### Logs em Tempo Real

Terminal 1 (Backend):
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

Terminal 2 (Frontend):
```bash
cd /Users/drpgjr.../NutriBuddy/frontend
npm run dev
```

Terminal 3 (N8N):
```bash
docker logs nutribuddy-n8n -f
```

---

## 🎯 Próximos Passos

Agora que o sistema está funcionando:

1. ✅ **Personalize templates** de auto-resposta
2. ✅ **Ajuste timers** nos workflows N8N
3. ✅ **Configure notificações** de email
4. ✅ **Crie templates** de resposta rápida
5. ✅ **Monitore** uso e performance

---

## 📚 Recursos Adicionais

- [Documentação Backend API](./SISTEMA-MENSAGENS-ESTRUTURA.md)
- [Workflows N8N](./n8n-workflows/)
- [Componentes Frontend](./frontend/src/components/chat/)
- [Componentes Kanban](./frontend/src/components/kanban/)

---

## 💡 Dicas Importantes

### Segurança
- ✅ Nunca commite tokens ou senhas
- ✅ Use `.env` para variáveis sensíveis
- ✅ Configure CORS adequadamente

### Performance
- ✅ Implemente paginação se tiver muitas conversas
- ✅ Use índices do Firestore
- ✅ Cache dados quando possível

### Manutenção
- ✅ Monitore logs regularmente
- ✅ Faça backup do Firestore
- ✅ Atualize dependências periodicamente

---

## ✅ Checklist Final

- [ ] Backend rodando em http://localhost:3000
- [ ] Frontend rodando em http://localhost:3001
- [ ] N8N rodando em http://localhost:5678
- [ ] Firestore Rules configuradas
- [ ] Índices Firestore criados
- [ ] Workflows N8N importados e ativos
- [ ] Credenciais configuradas (OpenAI, Gmail)
- [ ] Teste de envio de mensagem OK
- [ ] Teste de Kanban OK
- [ ] Teste de auto-resposta OK

---

**🎉 Pronto! Sistema de Mensagens totalmente configurado e funcionando!**

Se tiver qualquer problema, consulte a seção [Troubleshooting](#troubleshooting) ou verifique os logs.

