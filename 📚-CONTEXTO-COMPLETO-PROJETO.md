# 📚 CONTEXTO COMPLETO DO PROJETO - NUTRIBUDDY

## 🎯 **OBJETIVO DESTE DOCUMENTO:**

Este documento foi criado para fornecer contexto completo ao assistente AI em sessões futuras, especialmente após atualizações do sistema ou mudanças de ambiente. Ele contém o estado atual completo do projeto, problemas resolvidos, pendências e próximos passos.

**Última atualização:** 20 de Novembro de 2024 - 14:00 (horário aproximado)

---

## 📋 **ÍNDICE:**

1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura e Componentes](#arquitetura)
3. [Estado Atual de Cada Componente](#estado-atual)
4. [Problemas Resolvidos Hoje](#problemas-resolvidos)
5. [Problemas Pendentes](#problemas-pendentes)
6. [Configurações Importantes](#configurações)
7. [Links e Referências](#links)
8. [Estrutura do Projeto](#estrutura)
9. [Próximos Passos](#próximos-passos)
10. [Histórico de Commits Recentes](#histórico)

---

## 🎯 **1. VISÃO GERAL DO PROJETO**

### **Nome do Projeto:**
**NutriBuddy** - Sistema de Nutrição Personalizada

### **Descrição:**
Sistema completo para prescritores nutricionais gerenciarem pacientes, dietas, mensagens WhatsApp e análises de aderência alimentar.

### **Stack Tecnológico:**
- **Frontend:** Next.js 14 (React 18) + TypeScript + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Autenticação:** Firebase Auth
- **Cloud Functions:** Google Cloud Functions (Python)
- **Deploy Frontend:** Vercel
- **Deploy Backend:** Railway
- **Workflows:** N8N (deployado no Railway)
- **OCR/IA:** Google Cloud Vision + OpenAI GPT-4o

---

## 🏗️ **2. ARQUITETURA E COMPONENTES**

### **Componentes Principais:**

#### **A) Frontend (Next.js)**
- **Localização:** `/Users/drpgjr.../NutriBuddy/frontend/`
- **Deploy:** Vercel
- **Projeto Vercel:** `nutri-buddy-novo`
- **Root Directory:** `frontend`
- **Framework:** Next.js 14.2.14
- **Status:** ⏳ Aguardando deploy após correções

#### **B) Backend (Node.js/Express)**
- **Localização:** `/Users/drpgjr.../NutriBuddy/`
- **Entry Point:** `server.js`
- **Deploy:** Railway
- **URL:** https://web-production-c9eaf.up.railway.app
- **Status:** ⚠️ Verificar se está funcionando

#### **C) Google Cloud Function (Transcrição de Dieta)**
- **Localização:** `/Users/drpgjr.../NutriBuddy/n8n-workflows/google-cloud-function/`
- **Função:** `processar-dieta-pdf`
- **Região:** `southamerica-east1` (São Paulo)
- **Trigger:** Firebase Storage (quando PDF é enviado)
- **Runtime:** Python 3.12
- **Status:** ✅ Funcionando (100% Google Cloud)

#### **D) N8N Workflows**
- **Localização:** `/Users/drpgjr.../NutriBuddy/n8n-workflows/`
- **Deploy:** Railway
- **Status:** ⚠️ Verificar integração

#### **E) Firebase**
- **Projeto:** `nutribuddy-2fc9c`
- **Região:** `southamerica-east1`
- **Serviços usados:**
  - Firestore (Database)
  - Storage (PDFs, imagens)
  - Auth (Autenticação)
  - Cloud Functions (Triggers)

---

## 📊 **3. ESTADO ATUAL DE CADA COMPONENTE**

### **✅ FRONTEND (Next.js + Vercel)**

**Status:** ⏳ **AGUARDANDO DEPLOY**

**Último commit:** `44f9e5b` - "chore: forçar redeploy no Vercel"
**Commit anterior:** `079d4e1` - "fix: corrigir exportações Card e tipagem layout.tsx"

**Correções aplicadas hoje:**
1. ✅ `Card.tsx` - Componentes `CardTitle`, `CardDescription`, `CardFooter` com interfaces próprias
2. ✅ `layout.tsx` - Import de `ReactNode` corrigido, interface explícita criada
3. ✅ `vercel.json` - Root Directory configurado como `frontend`
4. ✅ `.vercelignore` - Criado para ignorar arquivos backend

**Erros corrigidos:**
- ❌ ~~`Attempted import error: 'CardTitle' is not exported`~~ → ✅ RESOLVIDO
- ❌ ~~`Type error: File 'layout.tsx' is not a module`~~ → ✅ RESOLVIDO

**Próximo passo:**
- Aguardar deploy no Vercel aparecer
- Verificar se build passa sem erros
- Testar aplicação após deploy

**Link:** https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-novo/deployments

---

### **⚠️ BACKEND (Node.js + Railway)**

**Status:** ⚠️ **PRECISA VERIFICAR**

**URL:** https://web-production-c9eaf.up.railway.app
**Entry Point:** `server.js`
**Configuração:**
- `Procfile`: `web: node server.js`
- `railway.json`: Configurado para rodar `server.js`
- `package.json`: Script `start` aponta para `node server.js`

**Arquivos importantes:**
- `server.js` - Servidor Express principal
- `routes/` - Rotas da API
- `services/` - Serviços (Firebase, WhatsApp, etc.)
- `middleware/` - Middlewares de autenticação

**Problemas conhecidos:**
- ⚠️ Não foi verificado se está funcionando hoje
- ⚠️ Pode estar tentando rodar Next.js ao invés do backend

**Próximo passo:**
- Verificar status no Railway Dashboard
- Testar endpoint `/api/health`
- Verificar logs se houver erro

---

### **✅ GOOGLE CLOUD FUNCTION (Transcrição de Dieta)**

**Status:** ✅ **FUNCIONANDO**

**Função:** `processar-dieta-pdf`
**Região:** `southamerica-east1`
**Trigger:** Firebase Storage (`nutribuddy-2fc9c.firebasestorage.app`)
**Runtime:** Python 3.12

**Funcionalidade:**
1. Detecta novo PDF em `users/{patientId}/diets/`
2. Usa Google Cloud Vision para OCR
3. Usa OpenAI GPT-4o para estruturar dados
4. Salva JSON no Firestore (`users/{patientId}/diets/latest`)

**Problemas resolvidos:**
- ✅ Erro de versão OpenAI/httpx - RESOLVIDO (lazy loading)
- ✅ Erro de região - RESOLVIDO (mudado para `southamerica-east1`)

**Credenciais:**
- Service Account: `225946487395-compute@developer.gserviceaccount.com`
- Secret Manager: `OPENAI_API_KEY`

**Links:**
- Console: https://console.cloud.google.com/functions/list?project=nutribuddy-2fc9c
- Logs: https://console.cloud.google.com/logs/viewer?project=nutribuddy-2fc9c

---

### **⚠️ N8N WORKFLOWS**

**Status:** ⚠️ **PRECISA VERIFICAR**

**Localização:** `/Users/drpgjr.../NutriBuddy/n8n-workflows/`
**Deploy:** Railway

**Workflows principais:**
1. `EVOLUTION-1-RECEBER-MENSAGENS-V2.json` - Recebe mensagens WhatsApp
2. `EVOLUTION-2-ENVIAR-MENSAGENS-V2.json` - Envia mensagens WhatsApp
3. `EVOLUTION-3-ATUALIZAR-SCORE-V2.json` - Atualiza score de pacientes

**Próximo passo:**
- Verificar se N8N está rodando no Railway
- Importar workflows se necessário
- Configurar credenciais

---

### **✅ FIREBASE**

**Status:** ✅ **CONFIGURADO E FUNCIONANDO**

**Projeto:** `nutribuddy-2fc9c`
**Região:** `southamerica-east1`

**Configurações Frontend (variáveis de ambiente):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=225946487395
NEXT_PUBLIC_FIREBASE_APP_ID=1:225946487395:web:d14ef325c8970061aa4656
```

**Console:** https://console.firebase.google.com/project/nutribuddy-2fc9c

---

## 🔧 **4. PROBLEMAS RESOLVIDOS HOJE (20/11/2024)**

### **A) Erros de Build no Vercel:**

**Problema 1:** `CardTitle`, `CardDescription` e `CardFooter` não exportados
- **Erro:** `Attempted import error: 'CardTitle' is not exported from '@/components/ui/card'`
- **Solução:** Criadas interfaces próprias para cada componente (`CardTitleProps`, `CardDescriptionProps`, `CardFooterProps`)
- **Arquivo:** `frontend/src/components/ui/Card.tsx`

**Problema 2:** `layout.tsx` não reconhecido como módulo
- **Erro:** `Type error: File 'layout.tsx' is not a module`
- **Solução:** Import direto de `ReactNode` e criação de interface explícita `DashboardLayoutProps`
- **Arquivo:** `frontend/src/app/(dashboard)/layout.tsx`

### **B) Configuração Vercel:**

**Problema:** Vercel tentando fazer deploy da raiz (backend) ao invés do frontend
- **Solução:** 
  - Configurado `Root Directory: frontend` no `vercel.json`
  - Criado `.vercelignore` para ignorar arquivos backend

### **C) Deploy Travado:**

**Problema:** Deploy não aparecia no Vercel após push
- **Solução:** Commit vazio para forçar redeploy (`44f9e5b`)

---

## ⚠️ **5. PROBLEMAS PENDENTES**

### **A) Frontend:**
- ⏳ Aguardando deploy no Vercel (commit `44f9e5b` enviado, aguardando aparecer)
- ⏳ Verificar se build passa sem erros
- ⏳ Testar aplicação após deploy

### **B) Backend:**
- ⚠️ Não foi verificado se está funcionando hoje
- ⚠️ Pode estar tentando rodar Next.js ao invés do backend
- ⚠️ Verificar Railway Dashboard

### **C) N8N:**
- ⚠️ Não foi verificado status hoje
- ⚠️ Workflows podem precisar ser importados novamente
- ⚠️ Credenciais podem precisar ser configuradas

### **D) Variáveis de Ambiente Vercel:**
- ⚠️ Verificar se todas as variáveis estão configuradas (Production, Preview, Development)
- ✅ Arquivo com variáveis: `VERCEL-ENV.txt`

---

## 🔐 **6. CONFIGURAÇÕES IMPORTANTES**

### **A) Variáveis de Ambiente Frontend (Vercel):**

**Arquivo:** `VERCEL-ENV.txt`

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB5KuimIWLnw3WqMnJqe0nKiXJGYhMzbd0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=225946487395
NEXT_PUBLIC_FIREBASE_APP_ID=1:225946487395:web:d14ef325c8970061aa4656
NEXT_PUBLIC_API_BASE_URL=https://web-production-c9eaf.up.railway.app
```

**Importante:** Configurar para TODOS os ambientes (Production, Preview, Development)

### **B) Estrutura de Arquivos do Projeto:**

```
/Users/drpgjr.../NutriBuddy/
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Pages (Next.js 14 App Router)
│   │   ├── components/   # React Components
│   │   ├── lib/          # Utilities (Firebase, etc)
│   │   ├── hooks/        # Custom Hooks
│   │   └── types/        # TypeScript Types
│   ├── package.json
│   └── next.config.mjs
├── server.js             # Backend Entry Point
├── routes/               # Backend Routes
├── services/             # Backend Services
├── middleware/           # Backend Middleware
├── n8n-workflows/        # N8N Workflows + Cloud Function
│   ├── google-cloud-function/
│   └── *.json            # Workflow files
├── package.json          # Backend dependencies
├── Procfile              # Railway config (web: node server.js)
├── railway.json          # Railway config
├── vercel.json           # Vercel config (Root: frontend)
├── .vercelignore         # Vercel ignore file
└── .gitignore
```

### **C) Configurações de Deploy:**

**Vercel (`vercel.json`):**
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next",
  "rootDirectory": "frontend"
}
```

**Railway (`Procfile`):**
```
web: node server.js
```

**Railway (`railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔗 **7. LINKS E REFERÊNCIAS**

### **Deployments:**
- **Frontend Vercel:** https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-novo
- **Deployments:** https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-novo/deployments
- **Backend Railway:** https://railway.app/project/{project-id} (verificar URL exata)

### **Google Cloud:**
- **Console Principal:** https://console.cloud.google.com/home/dashboard?project=nutribuddy-2fc9c
- **Cloud Functions:** https://console.cloud.google.com/functions/list?project=nutribuddy-2fc9c
- **Cloud Logging:** https://console.cloud.google.com/logs/viewer?project=nutribuddy-2fc9c
- **Firestore:** https://console.cloud.google.com/firestore/data?project=nutribuddy-2fc9c
- **Storage:** https://console.cloud.google.com/storage/browser?project=nutribuddy-2fc9c
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=nutribuddy-2fc9c
- **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam?project=nutribuddy-2fc9c

### **Firebase:**
- **Console:** https://console.firebase.google.com/project/nutribuddy-2fc9c

### **GitHub:**
- **Repositório:** https://github.com/drpauloguimaraesjr/Nutri-Buddy
- **Branch Atual:** `main`

### **APIs:**
- **Backend API:** https://web-production-c9eaf.up.railway.app
- **Health Check:** https://web-production-c9eaf.up.railway.app/api/health

---

## 📁 **8. ESTRUTURA DO PROJETO (DETALHADA)**

### **Frontend (`frontend/`):**

**Principais arquivos:**
- `src/app/` - Pages (Next.js 14 App Router)
  - `(dashboard)/` - Páginas do prescritor
  - `(patient)/` - Páginas do paciente
  - `login/` - Página de login
  - `page.tsx` - Home page
- `src/components/` - Componentes React
  - `ui/` - Componentes UI (Button, Card, Input, Modal, etc)
  - `chat/` - Componentes de chat
  - `kanban/` - Componentes Kanban
  - `whatsapp/` - Componentes WhatsApp
  - `diet/` - Componentes de dieta
- `src/lib/` - Utilitários
  - `firebase.ts` - Configuração Firebase
  - `utils.ts` - Funções utilitárias
- `src/hooks/` - Custom Hooks
  - `useDiet.ts` - Hook para dietas
  - `usePatients.ts` - Hook para pacientes
  - `useProtectedRoute.ts` - Hook para rotas protegidas

### **Backend (raiz):**

**Principais arquivos:**
- `server.js` - Entry point do servidor Express
- `routes/` - Rotas da API
- `services/` - Serviços (Firebase, WhatsApp, etc)
- `middleware/` - Middlewares (auth, etc)
- `config/` - Configurações

### **N8N Workflows (`n8n-workflows/`):**

**Principais arquivos:**
- `EVOLUTION-1-RECEBER-MENSAGENS-V2.json` - Recebe mensagens WhatsApp
- `EVOLUTION-2-ENVIAR-MENSAGENS-V2.json` - Envia mensagens WhatsApp
- `EVOLUTION-3-ATUALIZAR-SCORE-V2.json` - Atualiza score de pacientes
- `google-cloud-function/` - Cloud Function de transcrição de dieta

---

## 🚀 **9. PRÓXIMOS PASSOS**

### **Imediato (Hoje/Amanhã):**

1. **✅ Verificar Deploy Frontend:**
   - Acessar https://vercel.com/drpauloguimaraesjrs-projects/nutri-buddy-novo/deployments
   - Verificar se deploy apareceu e status
   - Se "Ready" → testar aplicação
   - Se "Error" → verificar logs e corrigir

2. **⚠️ Verificar Backend:**
   - Acessar Railway Dashboard
   - Verificar status do backend
   - Testar endpoint `/api/health`
   - Verificar logs se houver erro

3. **⚠️ Verificar Variáveis de Ambiente Vercel:**
   - Acessar Vercel → Settings → Environment Variables
   - Verificar se todas as variáveis estão configuradas
   - Configurar para todos os ambientes (Production, Preview, Development)

4. **⚠️ Testar Aplicação:**
   - Fazer login
   - Navegar entre páginas
   - Verificar console (F12) para erros
   - Testar funcionalidades principais

### **Médio Prazo:**

5. **Verificar N8N:**
   - Verificar status no Railway
   - Importar workflows se necessário
   - Configurar credenciais

6. **Melhorias Visuais (Objetivo Original):**
   - Aplicar melhorias de estética
   - Ajustar cores e UX
   - Melhorar design system

7. **Funcionalidades:**
   - WhatsApp Twilio
   - Sistema Kanban completo
   - Transcrição automática de dieta (já funcionando)

---

## 📝 **10. HISTÓRICO DE COMMITS RECENTES**

### **Commits de Hoje (20/11/2024):**

1. **`44f9e5b`** - "chore: forçar redeploy no Vercel"
   - Commit vazio para forçar deploy
   - Data: Hoje

2. **`079d4e1`** - "fix: corrigir exportações Card e tipagem layout.tsx"
   - Correção de exportações no Card.tsx
   - Correção de tipagem no layout.tsx
   - Arquivos: `frontend/src/components/ui/Card.tsx`, `frontend/src/app/(dashboard)/layout.tsx`

### **Commits Anteriores (Importantes):**

3. **`cd5ce64`** - "🔧 FIX: Corrige troca de temas - componentes agora usam variáveis CSS dinâmicas"
   - Commit que funcionava antes
   - Usado como referência para rollback

---

## 🎓 **11. CONTEXTO DA CONVERSA DE HOJE**

### **Problema Inicial:**
O sistema estava quebrado após tentativas de melhorar a estética. O Grok (assistente anterior) havia deletado arquivos do frontend e causado problemas no deploy.

### **Objetivo Original:**
Melhorar a estética do sistema (cores, UX, design).

### **O Que Foi Feito:**
1. ✅ Restaurados arquivos do frontend de backup
2. ✅ Corrigidos erros de build TypeScript
3. ✅ Configurado Vercel para pasta `frontend/`
4. ✅ Cloud Function já estava funcionando
5. ✅ Preparado sistema para deploy

### **Estado Atual:**
- ✅ Código corrigido e commitado
- ⏳ Aguardando deploy no Vercel
- ⚠️ Backend e N8N precisam ser verificados
- ⏳ Testes pendentes após deploy

---

## 🔑 **12. INFORMAÇÕES TÉCNICAS IMPORTANTES**

### **IDs e Credenciais (NÃO COMMITAR):**

**Firebase:**
- Project ID: `nutribuddy-2fc9c`
- App ID: `1:225946487395:web:d14ef325c8970061aa4656`
- Sender ID: `225946487395`

**Google Cloud:**
- Project ID: `nutribuddy-2fc9c`
- Service Account: `225946487395-compute@developer.gserviceaccount.com`
- Secret: `OPENAI_API_KEY` (no Secret Manager)

**Railway:**
- Backend URL: `https://web-production-c9eaf.up.railway.app`

**Vercel:**
- Projeto: `nutri-buddy-novo`
- Root Directory: `frontend`

### **Regiões:**
- Firebase Storage: `southamerica-east1`
- Cloud Function: `southamerica-east1`
- Firestore: `southamerica-east1`

---

## 📋 **13. CHECKLIST GERAL**

### **Frontend:**
- [x] Código corrigido
- [x] Commits feitos
- [x] Push para GitHub
- [ ] Deploy no Vercel apareceu
- [ ] Build passou sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação testada

### **Backend:**
- [ ] Status verificado no Railway
- [ ] Endpoint `/api/health` testado
- [ ] Logs verificados
- [ ] Funcionando corretamente

### **Cloud Function:**
- [x] Deploy concluído
- [x] Funcionando
- [x] Trigger configurado
- [x] Permissões OK

### **N8N:**
- [ ] Status verificado
- [ ] Workflows importados
- [ ] Credenciais configuradas
- [ ] Funcionando

---

## 🎯 **14. COMO USAR ESTE DOCUMENTO**

### **Para o Assistente AI:**

1. **Leia completamente** este documento antes de começar
2. **Verifique o estado atual** de cada componente
3. **Continue de onde paramos** seguindo os próximos passos
4. **Atualize este documento** quando houver mudanças significativas

### **Quando Atualizar:**

- ✅ Após cada deploy bem-sucedido
- ✅ Após resolver problemas importantes
- ✅ Após adicionar novas funcionalidades
- ✅ Após mudanças de configuração

---

## 📞 **15. COMANDOS ÚTEIS**

### **Git:**
```bash
cd /Users/drpgjr.../NutriBuddy

# Ver status
git status

# Ver últimos commits
git log --oneline -10

# Ver branch atual
git branch

# Push forçado (se necessário)
git push --force origin main
```

### **Verificar Deploy:**
```bash
# Ver logs do Vercel (se tiver CLI)
vercel logs

# Testar API backend
curl https://web-production-c9eaf.up.railway.app/api/health
```

---

## 🎉 **16. RESUMO EXECUTIVO**

**Estado Atual:**
- ✅ Código corrigido e pronto
- ✅ Cloud Function funcionando
- ⏳ Aguardando deploy frontend
- ⚠️ Backend e N8N precisam verificação

**Próxima Ação:**
1. Verificar deploy frontend no Vercel
2. Testar aplicação
3. Verificar backend e N8N
4. Continuar melhorias de estética (objetivo original)

**Principais Descobertas de Hoje:**
- Frontend estava em `/frontend/` (não na raiz)
- Vercel precisava de configuração de Root Directory
- Erros de TypeScript foram resolvidos
- Commit vazio pode forçar redeploy no Vercel

---

## 📅 **17. NOTAS FINAIS**

**Última sessão:** 20 de Novembro de 2024
**Próxima sessão:** Verificar status e continuar desenvolvimento

**Mensagem para o Assistente AI:**
> Este documento contém TODO o contexto necessário para continuar o trabalho. Leia completamente antes de começar. O projeto está quase funcionando, apenas precisa verificar os deploys e testar. O objetivo original era melhorar a estética, mas hoje focamos em restaurar o sistema que estava quebrado.

---

**🚀 BOM TRABALHO NA PRÓXIMA SESSÃO! 🚀**

