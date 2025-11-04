# 🏃‍♂️ CONFIGURAR INTEGRAÇÃO STRAVA

## 📋 O QUE É?

A integração com Strava permite que o NutriBuddy importe automaticamente suas atividades físicas (corridas, ciclismo, natação, etc.) direto do aplicativo Strava para o módulo de Exercícios.

---

## ✅ FUNCIONALIDADES

### 🔄 Sincronização Automática
- ✅ Importa atividades do Strava automaticamente
- ✅ Calorias queimadas calculadas
- ✅ Distância, ritmo e elevação
- ✅ Frequência cardíaca (se disponível)
- ✅ Webhook para importação em tempo real

### 📊 Tipos de Atividades Suportadas
- 🏃‍♂️ Corrida (Run)
- 🚴‍♂️ Ciclismo (Ride)
- 🏊‍♂️ Natação (Swim)
- 🚶‍♂️ Caminhada (Walk)
- 🥾 Trilha (Hike)
- 🏋️‍♂️ Musculação (Weight Training)
- 🧘‍♂️ Yoga
- ⚡ CrossFit
- ⚽ Esportes (Futebol, Basquete, Tênis, etc.)

---

## 🔧 PASSO 1: CRIAR APLICATIVO NO STRAVA

### 1. Acesse o Strava Developers
Visite: https://www.strava.com/settings/api

### 2. Crie uma Nova Aplicação
Clique em **"Create & Manage Your App"**

### 3. Preencha os Dados

```
Application Name: NutriBuddy
Category: Health & Fitness
Club: (deixe em branco)
Website: http://localhost:3001
Authorization Callback Domain: localhost
```

**⚠️ IMPORTANTE:** Para produção, substitua `localhost` pelo seu domínio real.

### 4. Obtenha as Credenciais

Após criar, você receberá:
- **Client ID** (número, ex: 123456)
- **Client Secret** (string longa, ex: abc123def456...)

---

## 🔐 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Backend (`.env`)

Adicione as seguintes variáveis ao arquivo `.env` na raiz do projeto:

```bash
# Strava API
STRAVA_CLIENT_ID=123456
STRAVA_CLIENT_SECRET=abc123def456...
STRAVA_REDIRECT_URI=http://localhost:3001/settings/strava-callback

# Webhook (opcional, para sincronização em tempo real)
STRAVA_WEBHOOK_TOKEN=NUTRIBUDDY_STRAVA_WEBHOOK
```

**📝 Exemplo Completo do `.env`:**

```bash
PORT=3000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=nutribuddy-19862
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@nutribuddy-19862.iam.gserviceaccount.com

# OpenAI API
OPENAI_API_KEY=sk-proj-...

# WhatsApp
WHATSAPP_SESSION_ID=nutribuddy-session

# Strava API
STRAVA_CLIENT_ID=123456
STRAVA_CLIENT_SECRET=abc123def456...
STRAVA_REDIRECT_URI=http://localhost:3001/settings/strava-callback
STRAVA_WEBHOOK_TOKEN=NUTRIBUDDY_STRAVA_WEBHOOK
```

---

## 🚀 PASSO 3: REINICIAR O SERVIDOR

```bash
# Ctrl+C no terminal do backend e reiniciar
cd /Users/drpgjr.../NutriBuddy
npm run dev
```

Você verá:
```
✅ Strava Service inicializado!
```

---

## 🌐 PASSO 4: CONECTAR CONTA NO FRONTEND

### 1. Acesse as Configurações
```
http://localhost:3001/settings
```

### 2. Clique em "Conectar com Strava"

Uma janela popup abrirá solicitando autorização.

### 3. Autorize o Acesso

Permissões solicitadas:
- ✅ `read` - Ler perfil público
- ✅ `activity:read_all` - Ler todas as atividades

**🔒 Segurança:** O NutriBuddy NUNCA pede permissão de escrita. Suas atividades no Strava não serão modificadas.

### 4. Sucesso! 🎉

Após autorizar, você verá:
```
✅ Conectado ao Strava com sucesso!
Atleta: [Seu Nome]
```

---

## 🔄 PASSO 5: SINCRONIZAR ATIVIDADES

### Sincronização Manual

1. Vá em **Configurações > Integração com Strava**
2. Clique em **"Sincronizar Agora"**
3. Aguarde o processo (pode demorar alguns segundos)
4. Veja suas atividades em **Exercícios**

### Sincronização Automática via Webhook (Avançado)

Para receber atividades automaticamente em tempo real:

#### 1. Configure o Webhook no Strava

**POST** para criar subscription:
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=123456 \
  -F client_secret=abc123def456... \
  -F callback_url=https://seu-dominio.com/api/strava/webhook \
  -F verify_token=NUTRIBUDDY_STRAVA_WEBHOOK
```

**⚠️ IMPORTANTE:**
- Substitua `123456` pelo seu Client ID
- Substitua `abc123def456...` pelo seu Client Secret
- Substitua `https://seu-dominio.com` pelo seu domínio real
- Use HTTPS em produção (ngrok para testes locais)

#### 2. Verifique a Subscription

```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=123456 \
  -d client_secret=abc123def456...
```

#### 3. Testar com ngrok (Desenvolvimento)

```bash
# Instalar ngrok
brew install ngrok

# Expor porta 3000
ngrok http 3000

# Use a URL HTTPS fornecida como callback_url
# Exemplo: https://abc123.ngrok.io/api/strava/webhook
```

---

## 📊 COMO FUNCIONA?

### Fluxo de Autorização OAuth2

```
1. Usuário clica "Conectar com Strava"
   ↓
2. Popup abre com página de autorização do Strava
   ↓
3. Usuário autoriza o acesso
   ↓
4. Strava redireciona com código de autorização
   ↓
5. Backend troca código por tokens (access + refresh)
   ↓
6. Tokens salvos no Firestore (coleção users)
   ↓
7. ✅ Conectado!
```

### Fluxo de Sincronização

```
1. Usuário clica "Sincronizar Agora"
   ↓
2. Backend verifica validade do token
   ↓
3. Se expirado, atualiza usando refresh_token
   ↓
4. Busca atividades do Strava API
   ↓
5. Converte para formato NutriBuddy
   ↓
6. Salva na coleção exercises no Firestore
   ↓
7. ✅ Atividades importadas!
```

### Fluxo de Webhook (Tempo Real)

```
1. Usuário completa atividade no Strava
   ↓
2. Strava envia webhook para NutriBuddy
   ↓
3. Backend identifica usuário pelo athleteId
   ↓
4. Busca detalhes da atividade
   ↓
5. Importa automaticamente
   ↓
6. ✅ Atividade já aparece em Exercícios!
```

---

## 📁 ESTRUTURA DE DADOS

### Firestore: `users/{userId}`

```javascript
{
  strava: {
    connected: true,
    accessToken: "abc...",
    refreshToken: "def...",
    expiresAt: 1735934400, // timestamp Unix
    athleteId: 123456,
    athleteName: "João Silva",
    connectedAt: "2025-11-03T18:00:00.000Z",
    lastSync: "2025-11-03T19:30:00.000Z",
    lastSyncCount: 12
  }
}
```

### Firestore: `exercises/{exerciseId}`

```javascript
{
  userId: "user123",
  name: "Corrida Matinal",
  type: "Corrida",
  duration: 45, // minutos
  caloriesBurned: 450,
  date: "2025-11-03T06:30:00.000Z",
  distance: 8.5, // km
  averageHeartRate: 145,
  maxHeartRate: 178,
  source: "strava",
  stravaId: "987654321",
  notes: "Distância: 8.50 km • Ritmo: 11.33 km/h • FC Média: 145 bpm • Importado do Strava 🟠",
  createdAt: "2025-11-03T07:15:00.000Z",
  updatedAt: "2025-11-03T07:15:00.000Z"
}
```

---

## 🛠️ API ENDPOINTS

### `GET /api/strava/status`
Verifica status da conexão

**Response:**
```json
{
  "enabled": true,
  "connected": true,
  "athleteName": "João Silva",
  "lastSync": "2025-11-03T19:30:00.000Z",
  "lastSyncCount": 12,
  "message": "✅ Conectado ao Strava!"
}
```

### `GET /api/strava/connect`
Gera URL de autorização OAuth2

**Response:**
```json
{
  "success": true,
  "authUrl": "https://www.strava.com/oauth/authorize?client_id=..."
}
```

### `POST /api/strava/callback`
Processa código de autorização

**Body:**
```json
{
  "code": "abc123...",
  "state": "eyJ1c2VySWQiOi..."
}
```

### `POST /api/strava/sync`
Sincroniza atividades

**Body:**
```json
{
  "fullSync": false,
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "synced": 12,
  "total": 15,
  "message": "12 atividades sincronizadas!",
  "activities": [...]
}
```

### `GET /api/strava/activities`
Busca atividades (sem salvar)

**Query Params:**
- `page`: número da página (default: 1)
- `limit`: atividades por página (default: 30)
- `after`: data mínima (ISO 8601)
- `before`: data máxima (ISO 8601)

### `POST /api/strava/activities/:activityId/import`
Importa atividade específica

### `POST /api/strava/disconnect`
Desconecta conta do Strava

---

## 🧪 TESTAR A INTEGRAÇÃO

### 1. Verificar Status
```bash
curl http://localhost:3000/api/strava/status \
  -H "Authorization: Bearer SEU_TOKEN_FIREBASE"
```

### 2. Sincronizar Manualmente
```bash
curl -X POST http://localhost:3000/api/strava/sync \
  -H "Authorization: Bearer SEU_TOKEN_FIREBASE" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

### 3. Verificar Exercícios Importados
```bash
curl "http://localhost:3000/api/exercises?userId=user123"
```

---

## 🎯 ESTIMATIVA DE CALORIAS

Se a atividade do Strava não incluir calorias, o NutriBuddy estima baseado no tipo e duração:

| Atividade | Cal/min |
|-----------|---------|
| Corrida | 10 |
| Ciclismo | 8 |
| Natação | 11 |
| Caminhada | 4 |
| Musculação | 6 |
| Treino Geral | 7 |

**Fórmula:** `calorias = duração_minutos × cal_por_minuto`

---

## 🔒 SEGURANÇA

### Tokens
- ✅ Access tokens expiram em ~6 horas
- ✅ Refresh tokens nunca expiram (até revogado)
- ✅ Tokens atualizados automaticamente
- ✅ Armazenados de forma segura no Firestore

### Permissões
- ✅ Apenas LEITURA de atividades
- ✅ Sem permissão de escrita/edição
- ✅ Sem acesso a informações sensíveis

### Revogação
- ✅ Usuário pode desconectar a qualquer momento
- ✅ Tokens são revogados automaticamente
- ✅ Dados locais são mantidos (não deletados)

---

## ❓ TROUBLESHOOTING

### ❌ "Integração Strava não configurada"
**Solução:** Verifique se `STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET` estão no `.env`

### ❌ "Invalid authorization code"
**Solução:** O código expira em 10 minutos. Tente conectar novamente.

### ❌ "Usuário não conectado ao Strava"
**Solução:** Conecte sua conta em Configurações primeiro.

### ❌ Token expirado
**Solução:** O sistema atualiza automaticamente. Se persistir, reconecte a conta.

### ❌ Webhook não funciona
**Soluções:**
1. Verifique se a URL está acessível (use ngrok para testes)
2. Confirme que o `verify_token` está correto
3. Verifique logs do servidor
4. Re-crie a subscription

---

## 📚 REFERÊNCIAS

- **Strava API Docs:** https://developers.strava.com/docs/reference/
- **OAuth2 Guide:** https://developers.strava.com/docs/authentication/
- **Webhooks:** https://developers.strava.com/docs/webhooks/

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] Criar aplicativo no Strava Developers
- [ ] Copiar Client ID e Client Secret
- [ ] Adicionar variáveis no `.env`
- [ ] Reiniciar o backend
- [ ] Acessar Configurações no frontend
- [ ] Conectar conta do Strava
- [ ] Sincronizar atividades
- [ ] Verificar em Exercícios
- [ ] (Opcional) Configurar webhook

---

🎉 **PRONTO! Suas atividades do Strava agora são sincronizadas automaticamente!**

---

**Desenvolvido com ❤️ para NutriBuddy**  
**Data:** 03/11/2025

