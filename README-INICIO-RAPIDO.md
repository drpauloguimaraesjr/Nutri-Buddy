# 🚀 INÍCIO RÁPIDO - NUTRIBUDDY

> **Configure e inicie tudo em 3 passos!**

---

## 📋 ANTES DE COMEÇAR

### Pré-requisitos:
- ✅ Node.js instalado (v16+)
- ✅ npm instalado
- ✅ Conta Firebase criada

---

## 🎯 3 PASSOS PARA COMEÇAR

### 1️⃣ VALIDAR E CONFIGURAR

Execute o script de validação:

```bash
./SETUP-COMPLETO-NUTRIBUDDY.sh
```

**O que ele faz:**
- ✅ Verifica todos os arquivos
- ✅ Cria arquivos `.env` se não existirem
- ✅ Valida configurações
- ✅ Testa conexões
- ✅ Gera relatório completo

---

### 2️⃣ CONFIGURAR CREDENCIAIS

#### Editar `.env` (raiz do projeto):

```bash
nano .env
```

**Configure:**
```env
PORT=3000
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-email@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
WEBHOOK_SECRET=nutribuddy-secret-2024
CORS_ORIGIN=*
```

**Como obter credenciais Firebase:**
1. [Firebase Console](https://console.firebase.google.com)
2. Seu Projeto → ⚙️ Configurações → Contas de Serviço
3. **Gerar nova chave privada** (JSON)
4. Copiar valores para o `.env`

#### Editar `frontend/.env.local`:

```bash
nano frontend/.env.local
```

**Configure:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Como obter credenciais Firebase Client:**
1. Firebase Console → Seu Projeto → ⚙️ Configurações
2. Aba **Geral** → Seus apps
3. Copiar valores do `firebaseConfig`

---

### 3️⃣ INICIAR TUDO

Execute o script de inicialização:

```bash
./INICIAR-TUDO.sh
```

**O que acontece:**
- 🚀 Backend inicia na porta 3000
- 🎨 Frontend inicia na porta 3001
- 📝 Logs são salvos em `logs/`
- ✅ PIDs são salvos para fácil parada

**Acesse:**
- Frontend: **http://localhost:3001**
- Backend API: **http://localhost:3000**

---

## 🛑 PARAR TUDO

```bash
./PARAR-TUDO.sh
```

---

## 📚 SCRIPTS DISPONÍVEIS

| Script | Descrição |
|--------|-----------|
| `SETUP-COMPLETO-NUTRIBUDDY.sh` | Valida e configura tudo |
| `INICIAR-TUDO.sh` | Inicia backend + frontend |
| `PARAR-TUDO.sh` | Para backend + frontend |

---

## 🎯 COMANDOS INDIVIDUAIS

Se preferir controle manual:

### Backend:
```bash
# Iniciar
npm start

# Testar
curl http://localhost:3000/api/health
```

### Frontend:
```bash
# Iniciar
cd frontend
npm run dev

# Acesse: http://localhost:3001
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Testar Backend:
```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{"status":"ok","message":"API is running"}
```

### 2. Testar Frontend:
Acesse: **http://localhost:3001**

Você deve ver a página de login.

### 3. Criar primeiro usuário:
1. Clique em **Registrar**
2. Digite email e senha
3. Firebase criará o usuário automaticamente

---

## 🔧 TROUBLESHOOTING RÁPIDO

### ❌ Erro: "Port 3000 already in use"

```bash
# Encontrar e matar processo na porta 3000
lsof -t -i:3000 | xargs kill -9
```

### ❌ Erro: "Firebase credentials invalid"

1. Verifique se `.env` tem as credenciais corretas
2. Baixe novamente o JSON do Firebase
3. Copie os valores exatamente como estão

### ❌ Erro: "Cannot connect to backend"

1. Verifique se backend está rodando:
   ```bash
   lsof -i :3000
   ```
2. Confirme a URL no `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### ❌ Erro: "CORS error"

Adicione no `.env`:
```env
CORS_ORIGIN=*
```

---

## 📱 FUNCIONALIDADES

Após login, você terá acesso a:

- 📊 **Dashboard** - Visão geral de calorias e nutrição
- 🍽️ **Refeições** - Adicionar e gerenciar refeições
- 💧 **Água** - Controle de hidratação
- 🏋️ **Exercícios** - Registrar atividades físicas
- ⏱️ **Jejum** - Jejum intermitente
- 💬 **Chat IA** - Assistente nutricional
- ⚙️ **Configurações** - Preferências e perfil

---

## 📁 ESTRUTURA DO PROJETO

```
NutriBuddy/
├── server.js                    # Backend principal
├── package.json                 # Dependências backend
├── .env                         # Variáveis backend (configure!)
├── config/
│   └── firebase.js             # Configuração Firebase
├── routes/                     # Rotas da API
│   ├── meals.js
│   ├── water.js
│   ├── exercises.js
│   └── ...
├── frontend/                   # Frontend Next.js
│   ├── package.json
│   ├── .env.local             # Variáveis frontend (configure!)
│   └── app/
│       └── (dashboard)/
│           ├── dashboard/
│           ├── meals/
│           ├── water/
│           └── ...
├── frontend-html-completo/    # Frontend HTML alternativo
│   └── index.html
└── logs/                      # Logs dos servidores
```

---

## 🆘 PRECISA DE AJUDA?

### Documentação completa:
- **GUIA-SETUP-VISUAL.md** - Guia detalhado com imagens
- **COMO-RODAR-TUDO.md** - Instruções completas
- **README.md** - Documentação geral

### Verificar status:
```bash
./SETUP-COMPLETO-NUTRIBUDDY.sh
```

### Ver logs:
```bash
# Logs mais recentes
ls -lt logs/

# Ver log específico
tail -f logs/backend-*.log
tail -f logs/frontend-*.log
```

---

## ✨ ESTÁ PRONTO!

Agora você pode:

1. ✅ Acessar http://localhost:3001
2. ✅ Criar sua conta
3. ✅ Adicionar refeições
4. ✅ Controlar sua nutrição
5. ✅ Conversar com o assistente IA

---

## 🎉 PRÓXIMOS PASSOS

### Deploy em produção:

```bash
# Ver guias de deploy
cat DEPLOY-RAPIDO.md
cat DEPLOY-ONLINE-COMPLETO.md
```

### Configurar N8N (opcional):

```bash
# Ver guia N8N
cat ATUALIZAR-N8N-PRODUCAO.md
```

### Tornar usuário admin:

```bash
node set-admin.js seu-email@exemplo.com
```

---

**🥗 Bom uso do NutriBuddy!**


