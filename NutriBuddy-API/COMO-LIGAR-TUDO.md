# 🔌 Como Ligar Tudo - NutriBuddy Completo

## 🎯 VISÃO GERAL

Você tem 3 componentes que precisam trabalhar juntos:

```
┌─────────────┐     HTTP/REST      ┌─────────────┐
│  Frontend   │◄───────────────────►│   Backend   │
│   (Replit)  │                     │   (API)     │
└─────────────┘                     └──────┬──────┘
                                           │
                                           │ Webhook
                                           ▼
                                    ┌─────────────┐
                                    │     N8N     │
                                    │ (Workflows) │
                                    └──────┬──────┘
                                           │
                                           │ Save Data
                                           ▼
                                    ┌─────────────┐
                                    │  Firebase   │
                                    │  Firestore  │
                                    └─────────────┘
```

---

## 🚀 SETUP COMPLETO EM 3 ETAPAS

### ETAPA 1: BACKEND (API) ✅

#### 1.1 Descompactar e instalar

```bash
# Se estiver usando o ZIP
unzip NutriBuddy-API.zip
cd NutriBuddy

# Instalar dependências
npm install
```

#### 1.2 Configurar Firebase

**IMPORTANTE:** Você precisa baixar o Service Account JSON!

1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/serviceaccounts/adminsdk
2. Clique em **"Generate new private key"**
3. Baixe o arquivo `.json`
4. Abra o JSON e copie:

```bash
# Edite o arquivo .env
cp env.example .env
nano .env  # ou use seu editor preferido
```

Cole no `.env`:
```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOLE_AQUI_A_CHAVE_COMPLETA_DO_JSON\n-----END PRIVATE KEY-----\n"

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-XXXXX@nutribuddy-2fc9c.iam.gserviceaccount.com

PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WEBHOOK_SECRET=nutribuddy-secret-2024
```

#### 1.3 Iniciar Backend

```bash
npm start
```

**Deve aparecer:**
```
=================================
🚀 NutriBuddy API Server Running
📍 Port: 3000
📡 Firebase: Connected ✅
🔗 http://localhost:3000
=================================
```

✅ **BACKEND LIGADO!**

---

### ETAPA 2: N8N (Automação) 🔄

#### 2.1 Importar Workflow

1. Abra o **N8N** (cloud ou local)
2. Vá em **"Workflows"** → **"Import from File"**
3. Selecione o arquivo: `N8N-WORKFLOW.json`
4. O workflow será importado

#### 2.2 Configurar Variáveis

No N8N, vá em **Settings** → **Variables** e adicione:

```env
WEBHOOK_SECRET=nutribuddy-secret-2024
FIREBASE_TOKEN=seu-firebase-token-aqui
API_URL=http://localhost:3000
```

#### 2.3 Ativar Workflow

1. Clique no workflow importado
2. Clique em **"Active"** (toggle no topo)
3. O workflow estará rodando

#### 2.4 Testar Webhook

O N8N criará um webhook em:
```
http://seu-n8n.com/webhook/webhook-nutribuddy
```

**Ou se estiver local:**
```
http://localhost:5678/webhook/webhook-nutribuddy
```

✅ **N8N LIGADO!**

---

### ETAPA 3: FRONTEND (Dashboard) 🎨

#### 3.1 Abrir Replit

1. Acesse https://replit.com
2. Crie um novo repl: **"HTML/CSS/JS"**
3. Nome: `NutriBuddy-Frontend`

#### 3.2 Copiar HTML

1. Abra o arquivo `frontend-replit.html`
2. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. No Replit, apague tudo que está no `index.html`
4. Cole o conteúdo copiado
5. Salve

#### 3.3 Configurar API

Antes de rodar, no topo do HTML, configure:

Procure por:
```javascript
const API_BASE = 'http://localhost:3000';
```

Se o backend estiver em outro lugar, atualize:
```javascript
const API_BASE = 'http://SEU-IP:3000';
// ou
const API_BASE = 'https://seu-dominio.com';
```

#### 3.4 Rodar Frontend

1. Clique no botão **"Run"** verde no Replit
2. O dashboard abrirá
3. Configure o Firebase Token no topo da página

✅ **FRONTEND LIGADO!**

---

## 🔗 COMO TUDO SE CONECTA

### Fluxo 1: Frontend → Backend → Firebase

```
1. Usuário preenche formulário no Frontend
2. Frontend faz POST → http://localhost:3000/api/meals
3. Backend valida com Firebase Auth
4. Backend salva no Firestore
5. Backend retorna sucesso
6. Frontend mostra mensagem
```

### Fluxo 2: N8N → Backend → Firebase

```
1. N8N recebe webhook externo
2. N8N faz POST → http://localhost:3000/api/webhook
3. Backend processa webhook
4. Backend salva no Firestore (opcional)
5. Backend retorna para N8N
6. N8N continua workflow
```

### Fluxo 3: Frontend → Backend → N8N

```
1. Usuário registra refeição no Frontend
2. Frontend → Backend → Firebase
3. Backend dispara webhook para N8N (opcional)
4. N8N processa e faz ações automáticas
5. N8N pode enviar notificação, email, etc.
```

---

## 📡 ENDPOINTS DISPONÍVEIS

### Backend (localhost:3000)

```
GET  /api/health           - Verificar se está online
GET  /api/nutrition        - Buscar nutrição
POST /api/nutrition        - Registrar nutrição
GET  /api/meals            - Buscar refeições
POST /api/meals            - Registrar refeição
GET  /api/user             - Obter usuário
PUT  /api/user             - Atualizar usuário
POST /api/webhook          - Receber webhooks N8N
```

### N8N

```
POST /webhook/webhook-nutribuddy  - N8N receber dados externos
```

---

## 🧪 TESTAR TUDO

### Teste 1: Backend

```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-02T11:00:00.000Z",
  "service": "NutriBuddy API"
}
```

### Teste 2: Frontend

1. Abra o dashboard no Replit
2. Preencha o formulário de refeição
3. Clique em **Registrar**
4. Deve aparecer: ✅ "Refeição registrada com sucesso!"

### Teste 3: N8N

1. No N8N, ative o workflow
2. Faça um teste manual
3. Verifique os logs
4. Deve processar corretamente

---

## 🔧 TROUBLESHOOTING

### Backend não inicia

```bash
# Verificar erros
npm start

# Erro de Firebase?
→ Verificar .env está correto
→ Private key precisa ter quebras de linha \n

# Porta 3000 já em uso?
→ Mudar PORT no .env
```

### Frontend não conecta

```javascript
// Verificar CORS
// No backend (.env):
CORS_ORIGIN=*

// Verificar console do navegador (F12)
// Ver erros de rede
```

### N8N não recebe webhooks

```bash
# Verificar WEBHOOK_SECRET
# No backend (.env):
WEBHOOK_SECRET=nutribuddy-secret-2024

# No N8N Settings:
WEBHOOK_SECRET=nutribuddy-secret-2024

# Devem ser iguais!
```

### Firebase não conecta

```bash
# Verificar credenciais
# .env deve ter:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# IMPORTANTE: Aspas duplas e \n preservados!
```

---

## 🎯 CHECKLIST FINAL

### Backend ✅
- [ ] npm install rodou
- [ ] .env configurado
- [ ] Firebase Service Account baixado
- [ ] npm start funcionando
- [ ] Health check OK
- [ ] http://localhost:3000/api/health retorna OK

### N8N ✅
- [ ] Workflow importado
- [ ] Variáveis configuradas
- [ ] Workflow ativo
- [ ] Webhook criado
- [ ] Teste manual funciona

### Frontend ✅
- [ ] HTML copiado no Replit
- [ ] API_BASE configurado
- [ ] Replit rodando
- [ ] Dashboard abre
- [ ] Formulários funcionam
- [ ] Estatísticas atualizam

### Integração ✅
- [ ] Frontend → Backend funciona
- [ ] Backend → Firebase salva
- [ ] N8N → Backend webhook funciona
- [ ] Dados aparecem no Firebase

---

## 🎉 TUDO LIGADO!

Se todos os checklists estão ✅, tudo está funcionando!

Você agora tem:
- ✅ Dashboard visual (Frontend)
- ✅ API REST completa (Backend)
- ✅ Automação (N8N)
- ✅ Banco de dados (Firebase)

**Sistema 100% operacional!** 🚀

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- `README.md` - Guia completo do backend
- `README-N8N-FRONTEND.md` - Setup completo
- `CONFIGURACAO-RAPIDA-FIREBASE.md` - Firebase em 5 min
- `INSTRUCOES-REPLIT.md` - Setup Replit detalhado
- `INSTALACAO-RAPIDA.md` - Quick start

---

**Boa sorte! 🍀**

