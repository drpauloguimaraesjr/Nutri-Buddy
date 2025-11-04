# 🚀 Como Rodar o NutriBuddy Completo

Guia passo a passo para rodar o backend e frontend juntos.

## ✅ Pré-requisitos

- Node.js 18+ instalado
- Firebase configurado (Auth, Firestore, Storage)
- Credenciais do Firebase Admin SDK
- Terminal aberto

## 📋 Checklist Rápido

- [ ] Backend instalado e configurado
- [ ] Frontend instalado e configurado  
- [ ] Firebase configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Portas 3000 e 3001 livres

---

## 🔧 Passo 1: Configurar Backend

### 1.1 Instalar Dependências

```bash
cd /Users/drpgjr.../NutriBuddy
npm install
```

### 1.2 Configurar Variáveis de Ambiente

Crie o arquivo `.env` (se não existir):

```bash
cp env.example .env
```

Edite `.env` com suas credenciais:

```env
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nutribuddy-2fc9c.iam.gserviceaccount.com

PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WEBHOOK_SECRET=seu-secret-aqui
```

### 1.3 Testar Backend

```bash
npm run dev
```

Você deve ver:

```
🚀 NutriBuddy API Server Running
📍 Port: 3000
✅ Firebase: Connected
```

Acesse: http://localhost:3000/api/health

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "NutriBuddy API"
}
```

✅ **Backend está funcionando!**

---

## 🎨 Passo 2: Configurar Frontend

### 2.1 Navegar para a Pasta Frontend

```bash
cd frontend
```

### 2.2 Instalar Dependências

```bash
npm install
```

### 2.3 Configurar Variáveis de Ambiente

Crie `.env.local`:

```bash
cp .env.local.example .env.local
```

O arquivo já vem com as configurações do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=SUA_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=225946487395
NEXT_PUBLIC_FIREBASE_APP_ID=1:225946487395:web:d14ef325c8970061aa4656
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MB7VG6TFXN
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2.4 Rodar Frontend

```bash
npm run dev
```

Você deve ver:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 2.5s
```

✅ **Frontend está funcionando!**

---

## 🎯 Passo 3: Testar a Aplicação

### 3.1 Abrir no Navegador

Acesse: http://localhost:3001

### 3.2 Criar uma Conta

1. Clique em "Criar conta"
2. Preencha os dados:
   - Nome: Seu nome
   - Email: test@nutribuddy.com
   - Senha: password123
3. Clique em "Criar Conta"

Ou use "Login com Google"

### 3.3 Explorar o Dashboard

Após o login, você verá:
- ✅ Dashboard com cards de resumo
- ✅ Sidebar com navegação
- ✅ Header com perfil
- ✅ Cards de calorias e macros
- ✅ Progresso visual
- ✅ Timer de jejum

### 3.4 Testar Funcionalidades

**Adicionar Água (via Zustand):**
- Clique no botão "Registrar Água" no dashboard
- O contador deve atualizar

**Navegação:**
- Clique nos itens da sidebar
- Observe que a maioria das páginas ainda não foi implementada

---

## 🔴 Troubleshooting

### Backend não conecta ao Firebase

**Erro:** `❌ Error initializing Firebase Admin SDK`

**Solução:**
1. Verifique se o `.env` está correto
2. Confirme que a `FIREBASE_PRIVATE_KEY` tem `\n` corretamente
3. Gere uma nova Service Account Key se necessário

### Frontend não faz login

**Erro:** "Login failed"

**Solução:**
1. Verifique se o Firebase Auth está habilitado
2. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication
3. Habilite "Email/Password" e "Google"

### Porta já em uso

**Erro:** `Port 3000 is already in use`

**Solução:**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou use outra porta
PORT=3001 npm run dev
```

### CORS Error

**Erro:** `Access-Control-Allow-Origin`

**Solução:**
No backend `.env`, configure:
```env
CORS_ORIGIN=*
```

Reinicie o servidor.

---

## 📁 Estrutura de Terminais

Recomendo usar 2 terminais:

**Terminal 1 - Backend:**
```bash
cd /Users/drpgjr.../NutriBuddy
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/drpgjr.../NutriBuddy/frontend
npm run dev
```

---

## 🎨 URLs Importantes

### Desenvolvimento
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health

### Firebase Console
- **Projeto:** https://console.firebase.google.com/project/nutribuddy-2fc9c
- **Authentication:** https://console.firebase.google.com/project/nutribuddy-2fc9c/authentication
- **Firestore:** https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore
- **Storage:** https://console.firebase.google.com/project/nutribuddy-2fc9c/storage

---

## 📊 Status das Funcionalidades

### ✅ Funcionando Agora

**Backend:**
- Health check
- Autenticação JWT
- CRUD de refeições
- CRUD de exercícios
- Controle de água
- Metas nutricionais
- Upload de imagens
- WhatsApp integration

**Frontend:**
- Login/Registro
- Dashboard principal
- Navegação
- Cards de resumo
- Estado global

### ⏳ Em Desenvolvimento

**Módulos a implementar:**
- Página de Refeições completa
- Página de Água completa
- Página de Exercícios
- Página de Metas
- Página de Medidas
- Chat com IA
- Receitas
- Relatórios
- Jejum
- Glicemia
- Benefícios
- Configurações

---

## 🎯 Próximos Passos

### Para Testar Agora

1. **Login/Registro:** ✅ Funcional
2. **Dashboard:** ✅ Funcional
3. **Navegação:** ✅ Funcional

### Para Implementar Depois

1. **Módulo de Refeições** (prioridade)
2. **Módulo de Água** (prioridade)
3. **Integração com IA**
4. Outros módulos conforme `STATUS-IMPLEMENTACAO.md`

---

## 📞 Comandos Úteis

### Backend

```bash
# Rodar dev mode
npm run dev

# Rodar produção
npm start

# Gerar token Firebase
node generate-token.js

# Testar WhatsApp
node test-whatsapp.js

# Ver logs
tail -f logs/*.log
```

### Frontend

```bash
# Rodar dev mode
npm run dev

# Build produção
npm run build

# Rodar produção
npm start

# Lint
npm run lint

# Análise de bundle
npm run analyze
```

---

## ✅ Checklist Final

Antes de começar a desenvolver novos módulos:

- [ ] Backend rodando em http://localhost:3000
- [ ] Frontend rodando em http://localhost:3001
- [ ] Consegue fazer login/registro
- [ ] Dashboard carrega corretamente
- [ ] Firebase está conectado
- [ ] Não há erros no console

Se tudo está ✅, você está pronto para desenvolver!

---

## 🚀 Deploy em Produção

Quando estiver pronto para deploy:

### Backend
- **Opção 1:** Railway (recomendado)
- **Opção 2:** Render
- **Opção 3:** Heroku

Ver: `DEPLOY-ONLINE-COMPLETO.md`

### Frontend
- **Opção 1:** Vercel (recomendado)
- **Opção 2:** Netlify
- **Opção 3:** Firebase Hosting

```bash
# Deploy no Vercel
cd frontend
npm install -g vercel
vercel
```

---

**🎉 Pronto! Seu ambiente está configurado e funcionando!**

Para continuar o desenvolvimento, consulte:
- `STATUS-IMPLEMENTACAO.md` - Status e roadmap
- `frontend/README.md` - Documentação do frontend
- `GUIA-FRONTEND.md` - Guia de desenvolvimento

