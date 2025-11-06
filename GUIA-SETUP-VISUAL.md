# 🚀 GUIA DE SETUP COMPLETO - NUTRIBUDDY

> **Criado em:** $(date)  
> **Última atualização:** Após validação automática

---

## 📊 STATUS ATUAL DO SISTEMA

### ✅ O que está funcionando:

- ✅ **Estrutura de arquivos** - Todos os arquivos necessários estão presentes
- ✅ **Firebase** - Configurado e pronto para uso
- ✅ **Frontend** - Next.js e HTML disponíveis
- ✅ **Dependências** - node_modules instalados (backend e frontend)
- ✅ **Documentação** - Guias e manuais disponíveis

### ⚠️ O que precisa de atenção:

- ⚠️ **Backend** - Não está rodando (precisa iniciar)
- ⚠️ **Variáveis de Ambiente** - Algumas precisam ser configuradas
- ⚠️ **N8N** - Configuração opcional (se quiser usar)

---

## 🎯 PASSO A PASSO PARA COMEÇAR

### 1️⃣ Configurar Variáveis de Ambiente

#### Backend (.env)

Edite o arquivo `.env` na raiz do projeto e configure:

```bash
# Porta do servidor
PORT=3000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Webhook Secret (para N8N)
WEBHOOK_SECRET=nutribuddy-secret-2024

# CORS (pode deixar * para desenvolvimento)
CORS_ORIGIN=*

# N8N (opcional)
N8N_URL=http://localhost:5678
N8N_API_KEY=sua-chave-api-n8n

# OpenAI (para chat IA)
OPENAI_API_KEY=sk-...

# Google AI (alternativa ao OpenAI)
GOOGLE_AI_API_KEY=...
```

**📝 Onde obter as credenciais Firebase:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Contas de Serviço**
5. Clique em **Gerar nova chave privada**
6. Copie os valores do JSON para o .env

#### Frontend (.env.local)

Edite o arquivo `frontend/.env.local`:

```bash
# URL da API (backend)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**📝 Onde obter as credenciais Firebase Client:**
1. Firebase Console → Seu Projeto
2. **Configurações do Projeto**
3. Aba **Geral**
4. Role até **Seus apps** → **SDK setup and configuration**
5. Copie os valores do `firebaseConfig`

---

### 2️⃣ Iniciar o Backend

Abra um terminal e execute:

```bash
# Na raiz do projeto
npm start
```

**Você verá:**
```
🚀 NutriBuddy API Server Running
📍 Port: 3000
🌍 Environment: development
📡 Firebase: Connected
🔗 http://localhost:3000
```

**Testar se está funcionando:**
```bash
curl http://localhost:3000/api/health
```

Deve retornar: `{"status":"ok","message":"API is running"}`

---

### 3️⃣ Iniciar o Frontend (Next.js)

Abra **outro terminal** e execute:

```bash
cd frontend
npm run dev
```

**Você verá:**
```
▲ Next.js 14.x
- Local:        http://localhost:3001
- Ready in 2.5s
```

Acesse: **http://localhost:3001**

---

### 4️⃣ Testar Frontend HTML (Alternativa)

Se preferir usar o frontend HTML simples:

1. Abra o arquivo `frontend-html-completo/index.html` no navegador
2. Ou use um servidor local:
   ```bash
   cd frontend-html-completo
   python3 -m http.server 8080
   ```
3. Acesse: **http://localhost:8080**

---

## 🔄 CONFIGURAR N8N (Opcional)

Se quiser usar automações com N8N:

### Instalar N8N:

```bash
npm install -g n8n
```

### Iniciar N8N:

```bash
n8n start
```

Acesse: **http://localhost:5678**

### Importar Workflow:

1. No N8N, clique em **Workflows** → **Import from File**
2. Selecione o arquivo `N8N-WORKFLOW.json`
3. Configure as credenciais
4. Ative o workflow

### Configurar no Backend:

Edite o `.env` e adicione:

```bash
N8N_URL=http://localhost:5678
N8N_API_KEY=sua-chave-api
```

---

## 🧪 TESTAR TUDO

### 1. Testar Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Ver endpoints disponíveis
curl http://localhost:3000/

# Testar webhook (deve retornar 401 sem auth)
curl -X POST http://localhost:3000/api/webhook
```

### 2. Testar Frontend

1. Acesse http://localhost:3001
2. Faça login com suas credenciais Firebase
3. Teste adicionar uma refeição
4. Teste adicionar água
5. Verifique o dashboard

### 3. Testar Conexões

No frontend Next.js, verifique:
- ✅ Dashboard carrega
- ✅ Botões funcionam
- ✅ Dados são salvos
- ✅ API responde

---

## 📱 FUNCIONALIDADES DISPONÍVEIS

### Frontend Next.js (`http://localhost:3001`)

**Páginas disponíveis:**
- `/` - Página inicial (login/registro)
- `/dashboard/dashboard` - Dashboard principal
- `/dashboard/meals` - Gerenciar refeições
- `/dashboard/water` - Controle de água
- `/dashboard/exercises` - Exercícios
- `/dashboard/fasting` - Jejum intermitente
- `/dashboard/chat` - Chat com IA
- `/dashboard/settings` - Configurações
- `/admin` - Painel administrativo (apenas admin)

**Botões e ações:**
- ✅ Adicionar refeição → `POST /api/meals`
- ✅ Adicionar água → `POST /api/water`
- ✅ Adicionar exercício → `POST /api/exercises`
- ✅ Iniciar/parar jejum → `POST /api/fasting/start|stop`
- ✅ Chat com IA → `POST /api/chat/message`
- ✅ Editar/deletar itens → `PUT|DELETE /api/*/:id`

### Frontend HTML (`frontend-html-completo/index.html`)

Versão simplificada com:
- Dashboard com estatísticas
- Formulários de refeições
- Controle de água
- Exercícios
- Jejum

**Configurar API URL:**
Edite no topo do arquivo HTML:
```javascript
const API_BASE = 'http://localhost:3000';
const WEBHOOK_SECRET = 'nutribuddy-secret-2024';
```

---

## 🔐 AUTENTICAÇÃO

### Criar Primeiro Usuário:

1. Acesse o frontend
2. Clique em **Registrar**
3. Preencha email e senha
4. Firebase criará o usuário automaticamente

### Tornar Usuário Admin:

```bash
node set-admin.js seu-email@exemplo.com
```

Ou edite diretamente no Firebase Console:
1. Firestore → Collection `users`
2. Encontre seu usuário
3. Adicione campo: `role: "admin"`

---

## 🐛 TROUBLESHOOTING

### Backend não inicia:

```bash
# Verificar se a porta 3000 está em uso
lsof -i :3000

# Matar processo se necessário
kill -9 $(lsof -t -i:3000)

# Verificar logs
npm start
```

### Frontend não conecta ao Backend:

1. Verifique se o backend está rodando
2. Confirme a URL no `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. Verifique CORS no backend (`.env`):
   ```bash
   CORS_ORIGIN=*
   ```

### Firebase Error:

- Verifique se as credenciais estão corretas
- Confirme que o projeto existe no Firebase Console
- Verifique se o Firestore está habilitado
- Certifique-se que Authentication está ativo

### Erro de CORS:

Adicione no `server.js`:
```javascript
app.use(cors({
  origin: '*', // ou 'http://localhost:3001'
  credentials: true
}));
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Consulte estes arquivos para mais informações:

- **COMEÇAR-AQUI.md** - Introdução rápida
- **COMO-RODAR-TUDO.md** - Guia completo de execução
- **CONFIGURAR-BACKEND-ROLES.md** - Sistema de permissões
- **CONFIGURAR-FIREBASE.md** - Setup detalhado Firebase
- **ATUALIZAR-N8N-PRODUCAO.md** - Deploy N8N
- **DEPLOY-RAPIDO.md** - Deploy em produção

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Iniciar tudo de uma vez (em terminais separados):

# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - N8N (opcional)
n8n start

# Testar API
curl http://localhost:3000/api/health

# Ver logs (se configurado)
tail -f logs/server.log
```

---

## ✅ CHECKLIST FINAL

Antes de começar a usar, confirme:

- [ ] `.env` configurado com credenciais Firebase
- [ ] `frontend/.env.local` configurado
- [ ] Backend iniciado (porta 3000)
- [ ] Frontend iniciado (porta 3001)
- [ ] Firestore habilitado no Firebase
- [ ] Authentication habilitado no Firebase
- [ ] Primeiro usuário criado
- [ ] API respondendo a `/api/health`
- [ ] Dashboard carregando corretamente

---

## 🎉 PRONTO!

Seu NutriBuddy está configurado e pronto para uso!

**Acesse:** http://localhost:3001

**Qualquer dúvida:**
- Consulte a documentação na pasta do projeto
- Verifique os arquivos de troubleshooting
- Execute novamente: `./SETUP-COMPLETO-NUTRIBUDDY.sh`

---

**Última validação:** Executada automaticamente pelo script de setup
**Relatório salvo em:** RELATORIO-SETUP-*.txt

