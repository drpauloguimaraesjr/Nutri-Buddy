# 🎨 Frontend NutriBuddy - Replit Setup

## 📋 Como usar no Replit

### 1️⃣ Criar novo Replit

1. Acesse [replit.com](https://replit.com)
2. Clique em **"+ Create Repl"**
3. Escolha **"HTML/CSS/JS"** template
4. Nomeie: `NutriBuddy-Frontend`

### 2️⃣ Configurar arquivos

1. **Apagar tudo que está no index.html**
2. **Copiar TODO o conteúdo** de `frontend-replit.html`
3. **Colar no index.html** do Replit
4. **Salvar** (Ctrl+S ou Cmd+S)

### 3️⃣ Configurar CORS no backend

No seu servidor NutriBuddy (`server.js`), certifique-se que está assim:

```javascript
app.use(cors({
  origin: '*',  // Ou o domínio do seu Replit
  credentials: true
}));
```

### 4️⃣ Configurar API no frontend

Antes de usar, configure no topo da página:

1. **URL da API**: `http://localhost:3000` (dev) ou sua URL de produção
2. **Firebase Token**: Cole seu token de autenticação

### 5️⃣ Rodar o projeto

#### No Replit:
1. Clique no botão **"Run"** verde
2. O frontend abrirá em preview
3. Configure os campos de API

#### No backend (separado):
```bash
npm start
```

---

## 🔧 Variáveis de Ambiente no N8N

Adicione no N8N Settings:

```env
WEBHOOK_SECRET=seu-secret-aqui
FIREBASE_TOKEN=seu-firebase-token-aqui
API_URL=http://localhost:3000
```

---

## 📡 Workflow N8N Completo

### Como importar:

1. Abra o **N8N**
2. Vá em **Workflows** → **Import from File**
3. Selecione o arquivo **N8N-WORKFLOW.json**
4. Configure as **Credentials** e **Variables**
5. **Salve** e **Ative** o workflow

### Endpoints configurados:

- ✅ `Webhook` - Receber dados externos
- ✅ `HTTP Request` - Enviar para API NutriBuddy
- ✅ `IF Condition` - Filtrar por tipo de evento
- ✅ `Save Nutrition` - Salvar nutrição
- ✅ `Save Meal` - Salvar refeição
- ✅ `Health Check` - Verificar API
- ✅ `Get Nutrition` - Buscar dados
- ✅ `Process Data` - Processar com JavaScript

---

## 🎯 Fluxo de Integração

```
Frontend (Replit) 
    ↓
   API NutriBuddy (localhost:3000)
    ↓
   N8N Webhook
    ↓
   Processamento Automatizado
    ↓
   Firebase Firestore
```

---

## 🚀 Deploy em Produção

### Backend (Railway, Render, Heroku):

```bash
# Variáveis de ambiente
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_PRIVATE_KEY=xxxxx
FIREBASE_CLIENT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
PORT=3000
CORS_ORIGIN=https://seu-frontend.repl.co
```

### Frontend (Replit):

1. Atualize `API_BASE` no código para sua URL de produção
2. Configure tokens de produção
3. Ative HTTPS

---

## 🔐 Segurança

### Frontend:
- ✅ CORS configurado
- ✅ Headers corretos
- ✅ Tratamento de erros

### Backend:
- ✅ JWT Authentication
- ✅ Webhook secret validation
- ✅ Rate limiting (adicione se necessário)

### N8N:
- ✅ Environment variables
- ✅ Webhook authentication
- ✅ Secure HTTP requests

---

## 📱 Uso do Frontend

### Registrar Refeição:
1. Selecione o tipo de refeição
2. Preencha calorias, proteínas, carbs e gorduras
3. Clique em **Registrar**

### Registrar Nutrição:
1. Selecione a data
2. Preencha os valores nutricionais
3. Clique em **Salvar**

### Estatísticas:
- Atualização automática a cada 30 segundos
- Total diário de macronutrientes
- Lista de refeições do dia

---

## 🐛 Troubleshooting

### CORS Error:
- Configure `CORS_ORIGIN` no backend
- Use `*` para desenvolvimento

### 401 Unauthorized:
- Verifique o Firebase token
- Token pode ter expirado

### API não responde:
- Verifique se o backend está rodando
- Confira a URL no frontend
- Teste com curl primeiro

### N8N Webhook não recebe:
- Verifique `WEBHOOK_SECRET`
- Confira logs do N8N
- Teste diretamente no Postman

---

## 📝 Exemplo de Teste

### Testar API diretamente:

```bash
# Health check
curl http://localhost:3000/api/health

# Criar refeição
curl -X POST http://localhost:3000/api/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "mealType": "almoco",
    "calories": 500,
    "protein": 30,
    "carbs": 50,
    "fats": 20,
    "date": "2024-11-02"
  }'

# Buscar refeições
curl http://localhost:3000/api/meals?date=2024-11-02 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ✅ Checklist Final

- [ ] Frontend no Replit funcionando
- [ ] Backend rodando
- [ ] Firebase configurado
- [ ] N8N workflow importado
- [ ] Tokens configurados
- [ ] CORS ajustado
- [ ] Testes realizados
- [ ] Produção configurada (se necessário)

---

**Pronto para usar! 🎉**

