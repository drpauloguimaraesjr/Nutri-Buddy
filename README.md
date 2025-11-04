# NutriBuddy API Server

API REST completa para integração com N8N e Firebase. Projeto construído para processar dados nutricionais e integrar com workflows automatizados.

## 🚀 Características

- ✅ Servidor Express.js com endpoints REST
- ✅ Integração com Firebase Admin SDK (Firestore)
- ✅ Autenticação JWT via Firebase
- ✅ Middleware de segurança para webhooks
- ✅ Pronto para integração com N8N
- ✅ CORS configurável
- ✅ Logging e tratamento de erros
- ✅ **Integração WhatsApp (Baileys)** 📱
- ✅ Envio e recebimento de mensagens automáticas

## 📱 Integração WhatsApp

**🎉 NOVO!** NutriBuddy agora tem integração completa com WhatsApp!

**⚡ GUIA RÁPIDO:** Veja `WHATSAPP-SETUP-RAPIDO.md` para começar em 5 minutos!  
**📚 GUIA COMPLETO:** Veja `GUIA-WHATSAPP-COMPLETO.md` para todas as funcionalidades!  
**📋 RESUMO:** Veja `RESUMO-WHATSAPP.md` para visão geral!

### Funcionalidades WhatsApp:
- 🔌 Conexão via QR Code
- 📤 Envio de mensagens automáticas
- 📨 Recebimento de mensagens
- 🖼️ Envio de imagens
- 💾 Salvamento automático no Firebase
- 🔄 Reconexão automática

---

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais do Firebase:

```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5678
WEBHOOK_SECRET=seu-secret-aqui
```

### 3. Obter credenciais do Firebase

**📚 GUIA COMPLETO:** Veja `COMO-OBTER-CREDENCIAIS-FIREBASE.md` para instruções detalhadas!

**⚡ GUIA RÁPIDO:** Veja `CONFIGURACAO-RAPIDA-FIREBASE.md` para setup em 5 minutos!

Passos básicos:
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto **nutribuddy-2fc9c**
3. Vá em **Configurações** → **Contas de serviço** → **Firebase Admin SDK**
4. Clique em **Gerar nova chave privada**
5. Baixe o arquivo JSON
6. Extraia `project_id`, `private_key` e `client_email` para o `.env`

## ▶️ Execução

### Modo desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Modo produção

```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 🌐 Deploy Online (Produção)

**Quer rodar 24/7 sem depender do seu computador?**

**⚡ GUIA RÁPIDO:** Veja `DEPLOY-RAPIDO.md` para deploy em 5 minutos!

**📚 GUIA COMPLETO:** Veja `DEPLOY-ONLINE-COMPLETO.md` para todas as opções (Railway, Render, Heroku)

**🔄 CONECTAR N8N:** Depois do deploy, veja `ATUALIZAR-N8N-PRODUCAO.md`

## 📡 Endpoints da API

### Health Check
```
GET /api/health
```

### Nutrição
```
GET    /api/nutrition       # Listar registros de nutrição
POST   /api/nutrition       # Criar novo registro
```

### Refeições
```
GET    /api/meals          # Listar refeições
POST   /api/meals          # Criar nova refeição
```

### Usuários
```
GET    /api/user           # Obter dados do usuário
PUT    /api/user           # Atualizar dados do usuário
```

### Webhook (para N8N)
```
POST   /api/webhook        # Receber webhooks do N8N
```

## 🔒 Autenticação

A maioria dos endpoints requer autenticação via Firebase JWT token.

**Header obrigatório:**
```
Authorization: Bearer <seu-token-firebase>
```

Para obter um token Firebase:
1. Use o Firebase Auth no seu frontend
2. Ou gere um token custom no Firebase Admin

## 🔗 Integração com N8N

### 1. Configurar Webhook no N8N

No seu workflow N8N:

1. Adicione um nó **HTTP Request**
2. Configure:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/webhook`
   - **Authentication**: Header Auth
   - **Header Name**: `x-webhook-secret`
   - **Value**: `seu-secret-aqui` (mesmo do .env)
3. **Body**: JSON com os dados que deseja enviar

### 2. Exemplo de Payload para Webhook

```json
{
  "event": "nutrition_update",
  "data": {
    "userId": "user123",
    "calories": 2500,
    "protein": 150,
    "carbs": 200,
    "fats": 80,
    "date": "2024-11-02"
  }
}
```

### 3. Consumir API no N8N

Para buscar dados da API no N8N:

```javascript
// Exemplo em um node "Code" no N8N
const response = await $http.request({
  method: 'GET',
  url: 'http://localhost:3000/api/nutrition',
  headers: {
    'Authorization': 'Bearer seu-token-aqui'
  }
});

return response;
```

## 📁 Estrutura do Projeto

```
NutriBuddy/
├── config/
│   └── firebase.js          # Configuração Firebase
├── middleware/
│   └── auth.js              # Middleware de autenticação
├── routes/
│   └── api.js               # Rotas da API
├── .env                     # Variáveis de ambiente (não versionado)
├── .gitignore               # Arquivos ignorados
├── env.example              # Exemplo de variáveis
├── package.json             # Dependências
├── server.js                # Servidor principal
└── README.md                # Documentação
```

## 🗄️ Estrutura do Firestore

### Coleções esperadas:

- `users` - Dados dos usuários
- `nutrition_data` - Registros nutricionais
- `meals` - Refeições cadastradas
- `webhook_events` - Eventos recebidos via webhook

## 🧪 Testando a API

### Usando cURL

#### Health Check
```bash
curl http://localhost:3000/api/health
```

#### Webhook (sem autenticação)
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu-secret-aqui" \
  -d '{
    "event": "test",
    "data": {"message": "Hello from N8N"}
  }'
```

#### Criar registro (requer autenticação)
```bash
curl -X POST http://localhost:3000/api/nutrition \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fats": 50,
    "date": "2024-11-02"
  }'
```

## 🛠️ Troubleshooting

### Erro: "Firebase Admin SDK initialized"
- Verifique se as credenciais no `.env` estão corretas
- Certifique-se de que `FIREBASE_PRIVATE_KEY` contém quebras de linha `\n`

### Erro: "Authentication failed"
- Token expirado ou inválido
- Gere um novo token Firebase

### Erro: "CORS blocked"
- Configure `CORS_ORIGIN` no `.env` com a URL do N8N
- Para desenvolvimento: `http://localhost:5678`

## 📝 Desenvolvimento

### Adicionar novos endpoints

1. Edite `routes/api.js`
2. Adicione a nova rota
3. Configure middleware de autenticação se necessário
4. Reinicie o servidor

### Modificar estrutura do Firebase

1. Atualize `config/firebase.js` se necessário
2. Ajuste as queries nos endpoints
3. Documente mudanças no README

## 📄 Licença

ISC

## 🤝 Suporte

Para dúvidas ou problemas, verifique:
- Logs do servidor no console
- Documentação do Firebase
- Documentação do N8N

---

**Desenvolvido para integração N8N** 🚀

