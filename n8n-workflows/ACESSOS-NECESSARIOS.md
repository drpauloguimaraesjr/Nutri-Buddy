# 🔐 Acessos Necessários - NutriBuddy

Para concluir a implementação, você precisará de acesso aos seguintes serviços:

---

## ✅ SERVIÇOS QUE VOCÊ PRECISA ACESSAR

### 1. 🚂 Railway (Backend)

**URL:** https://railway.app  
**Projeto:** `web-production-c9eaf` (Backend API)

**O que fazer:**
- [ ] Fazer login
- [ ] Ir em "Variables"
- [ ] Adicionar/atualizar variáveis de ambiente
- [ ] Clicar em "Deploy"

**Variáveis a adicionar:**
```env
N8N_URL=https://n8n-production-3eae.up.railway.app
N8N_NEW_MESSAGE_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-messages
WEBHOOK_SECRET=nutribuddy-secret-2024
ZAPI_INSTANCE_ID=3EA240373A126172229A82761BB89DF3
ZAPI_TOKEN=8F4DA3C4CA0EFA2069E84E7D
ZAPI_BASE_URL=https://api.z-api.io
```

---

### 2. 🤖 n8n (Automação/Workflows)

**URL:** https://n8n-production-3eae.up.railway.app  
**Status:** ✅ Online

**O que fazer:**
- [ ] Fazer login
- [ ] Importar workflows (botão "Add workflow" → "Import from File")
- [ ] Configurar credenciais:
  - [ ] Google Service Account (Firebase)
  - [ ] OpenAI API
- [ ] Ativar workflows (toggle no topo)

**Workflows para importar:**
1. `1-AUTO-RESPOSTA-FINAL.json`
2. `2-ANALISE-COMPLETO-FINAL.json`
3. `3-SUGESTOES-RESPOSTA-FINAL.json`
4. `9-PROCESSAR-DIETA-PDF-GPT4O-VISION.json`

---

### 3. 💬 Z-API (WhatsApp)

**URL:** https://z-api.io  
**Instância ID:** `3EA240373A126172229A82761BB89DF3`

**O que fazer:**
- [ ] Fazer login
- [ ] Verificar se WhatsApp está conectado (QR Code)
- [ ] Configurar Webhook:
  - URL: `https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp`
  - Eventos: `message-received`, `message-ack`
- [ ] Testar envio de mensagem

---

### 4. 🎨 Vercel (Frontend)

**URL:** https://vercel.com  
**Projeto:** (seu projeto Next.js)

**O que fazer:**
- [ ] Ir em Settings → Environment Variables
- [ ] Adicionar:
  ```env
  NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet
  NEXT_PUBLIC_API_BASE_URL=https://web-production-c9eaf.up.railway.app
  ```
- [ ] Redeploy

---

### 5. 🔥 Firebase (Banco de dados)

**URL:** https://console.firebase.google.com  
**Projeto:** (seu projeto Firebase)

**O que fazer:**
- [ ] Verificar Storage Rules (permitir leitura pública para PDFs)
- [ ] Verificar Firestore Rules
- [ ] Criar índices se necessário

**Storage Rules importantes:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /diets/{patientId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == patientId;
      allow read: if true; // ← Importante para n8n acessar
    }
  }
}
```

---

### 6. 🧠 OpenAI (API para IA)

**URL:** https://platform.openai.com  
**Chave:** `NEXT_PUBLIC_OPENAI_API_KEY`

**O que fazer:**
- [ ] Verificar saldo/créditos
- [ ] Confirmar acesso ao modelo `gpt-4o` (Vision)
- [ ] Copiar API Key para n8n

---

## 📝 CHECKLIST DE ACESSOS

Marque o que você **JÁ TEM ACESSO**:

- [ ] Railway (login funcionando)
- [ ] n8n (consigo fazer login)
- [ ] Z-API (tenho usuário e senha)
- [ ] Vercel (tenho acesso ao projeto)
- [ ] Firebase Console (consigo editar rules)
- [ ] OpenAI (tenho API key válida)

---

## 🆘 SE NÃO TIVER ACESSO

### Caso 1: Não tem login do Railway
**Solução:** Peça ao administrador ou crie nova conta e faça deploy do backend

### Caso 2: Não tem login do n8n
**Solução:** 
- Se for self-hosted: Configure usuário/senha no Railway
- Se for n8n Cloud: Faça cadastro em n8n.io

### Caso 3: Não tem conta Z-API
**Solução:** Crie conta grátis em https://z-api.io (7 dias trial)

### Caso 4: Não tem API Key OpenAI
**Solução:** 
- Crie conta em https://platform.openai.com
- Adicione créditos (mínimo $5)
- Gere API Key

---

## 🎯 PRÓXIMO PASSO

Depois de confirmar todos os acessos:

1. ✅ Execute o script: `./COMANDOS-QUICK-START.sh`
2. ✅ Siga o plano: `PLANO-IMPLEMENTACAO-HOJE.md`
3. ✅ Teste o sistema completo

---

## 💡 DICA

Se você **NÃO** tiver algum acesso, **me avise** e posso:
- Criar scripts alternativos
- Sugerir outras soluções
- Fazer deploy em outro lugar

**O importante é não travar!** 🚀

---

**Criado em:** 15/11/2024  
**Status:** Aguardando confirmação de acessos

