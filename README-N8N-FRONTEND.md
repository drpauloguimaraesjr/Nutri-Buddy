# 🚀 NutriBuddy - Setup Completo N8N + Frontend

## 📦 Arquivos Incluídos

```
NutriBuddy/
├── NutriBuddy-API.zip              ✅ Backend completo
├── N8N-WORKFLOW.json               ✅ Workflow para N8N
├── frontend-replit.html            ✅ Frontend pronto
├── INSTRUCOES-REPLIT.md            ✅ Guia Replit
└── README-N8N-FRONTEND.md          ✅ Este arquivo
```

---

## 🎯 Setup em 3 Etapas

### 1️⃣ BACKEND (NutriBuddy API)

```bash
# Descompactar
unzip NutriBuddy-API.zip
cd NutriBuddy

# Instalar
npm install

# Configurar
cp env.example .env
# Edite o .env com suas credenciais Firebase

# Rodar
npm start
```

✅ Backend rodando em `http://localhost:3000`

---

### 2️⃣ N8N WORKFLOW

1. Abrir N8N
2. Workflows → Import from File
3. Selecionar `N8N-WORKFLOW.json`
4. Configurar Variables:
   - `WEBHOOK_SECRET` = seu-secret
   - `FIREBASE_TOKEN` = seu-firebase-token
5. Ativar workflow

✅ N8N conectado ao backend

---

### 3️⃣ FRONTEND (Replit)

1. Abrir [replit.com](https://replit.com)
2. Criar novo repl "HTML/CSS/JS"
3. Copiar TODO conteúdo de `frontend-replit.html`
4. Colar no `index.html`
5. Clicar em "Run"
6. Configurar:
   - API URL: `http://localhost:3000`
   - Firebase Token: seu-token

✅ Frontend funcionando

---

## 🔄 Fluxo Completo

```
┌─────────────┐
│  FRONTEND   │ (Replit)
│  (HTML/JS)  │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────┐
│   BACKEND   │ (API)
│   Express   │
└──────┬──────┘
       │ Webhook
       ▼
┌─────────────┐
│     N8N     │ (Automation)
│  Workflows  │
└──────┬──────┘
       │ Process
       ▼
┌─────────────┐
│  FIREBASE   │ (Database)
│  Firestore  │
└─────────────┘
```

---

## 📡 Endpoints Disponíveis

### Backend API:
- `GET /api/health` - Health check
- `GET /api/nutrition` - Buscar nutrição
- `POST /api/nutrition` - Criar nutrição
- `GET /api/meals` - Buscar refeições
- `POST /api/meals` - Criar refeição
- `GET /api/user` - Buscar usuário
- `PUT /api/user` - Atualizar usuário
- `POST /api/webhook` - Webhook N8N

### N8N Webhooks:
- `Webhook - Receber Dados` - Endpoint público
- `Webhook Response` - Retornar resposta

---

## 🎨 Frontend Features

### Dashboard:
- ✅ Estatísticas diárias (calorias, proteínas, carbs, gorduras)
- ✅ Registro de refeições
- ✅ Registro de nutrição
- ✅ Lista de últimas refeições
- ✅ Auto-atualização a cada 30s

### Interface:
- ✅ Design moderno e responsivo
- ✅ Gradiente roxo/azul
- ✅ Cards com sombra
- ✅ Animações suaves
- ✅ Alertas de sucesso/erro

---

## 🔐 Segurança

### Backend:
- JWT Authentication (Firebase)
- CORS configurável
- Webhook secret validation
- Rate limiting ready

### Frontend:
- Token-based auth
- HTTPS ready
- Error handling
- Input validation

### N8N:
- Environment variables
- Secure credentials
- Webhook authentication
- Encrypted storage

---

## 🧪 Testes

### Testar Backend:
```bash
# Health check
curl http://localhost:3000/api/health

# Com autenticação
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:3000/api/meals
```

### Testar Webhook:
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "x-webhook-secret: SEU_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "nutrition_update",
    "data": {
      "calories": 2500,
      "protein": 150,
      "carbs": 200,
      "fats": 80
    }
  }'
```

---

## 🐛 Troubleshooting

### CORS Error no Frontend:
```javascript
// No server.js, usar:
app.use(cors({
  origin: '*' // ou domínio específico
}));
```

### Token Expirado:
- Gerar novo token no Firebase Console
- Atualizar no frontend e N8N

### N8N não conecta:
- Verificar WEBHOOK_SECRET
- Conferir logs do N8N
- Testar curl primeiro

### Frontend não atualiza:
- Verificar console do navegador
- Conferir Network tab
- Testar API diretamente

---

## 📊 Variáveis de Ambiente

### Backend (.env):
```env
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_PRIVATE_KEY="xxxxx"
FIREBASE_CLIENT_EMAIL=xxxxx
PORT=3000
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret
```

### N8N Settings:
```env
WEBHOOK_SECRET=seu-secret
FIREBASE_TOKEN=seu-token
API_URL=http://localhost:3000
```

---

## 🚀 Produção

### Backend (Railway/Render):
- Adicionar variáveis de ambiente
- Configurar CORS_ORIGIN
- Usar HTTPS

### Frontend (Replit):
- Configurar domínio custom
- Usar HTTPS
- Tokens de produção

### N8N:
- Cloud ou self-hosted
- Configurar HTTPS
- Secrets management

---

## 📚 Documentação Extra

- [README.md](README.md) - Backend completo
- [INSTRUCOES-REPLIT.md](INSTRUCOES-REPLIT.md) - Setup Replit
- [INSTALACAO-RAPIDA.md](INSTALACAO-RAPIDA.md) - Quick start
- [RESUMO-PROJETO.txt](RESUMO-PROJETO.txt) - Visão geral

---

## ✅ Checklist

- [ ] Backend rodando
- [ ] Firebase configurado
- [ ] N8N workflow importado
- [ ] Frontend no Replit
- [ ] Tokens configurados
- [ ] Webhooks funcionando
- [ ] Testes passando
- [ ] Produção ready

---

**🎉 Sistema Completo NutriBuddy + N8N + Frontend!**

