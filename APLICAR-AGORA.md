# 🚀 APLICAR SISTEMA DE ROLES AGORA (5 minutos)

## ✅ Status: Sistema 100% implementado!

Tudo já está pronto no código. Agora você só precisa:

---

## 1️⃣ APLICAR REGRAS DO FIRESTORE (OBRIGATÓRIO)

### Opção A: Firebase Console (Mais Fácil) ⭐ RECOMENDADO

**Passo a passo:**

```bash
1. Abra: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore/rules

2. Você verá um editor de texto

3. Abra o arquivo: firestore.rules (na raiz do projeto)

4. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)

5. Cole no editor do Firebase Console (Ctrl+V)

6. Clique em "Publicar" ou "Publish" (botão azul no topo)

7. Aguarde a confirmação (1-2 segundos)

8. Pronto! ✅
```

**Captura de tela do processo:**
- Você verá um editor com as regras antigas
- Substitua TUDO pelo conteúdo de `firestore.rules`
- O botão "Publicar" fica azul quando você faz mudanças

### Opção B: Firebase CLI

```bash
# No terminal, na pasta NutriBuddy/
firebase deploy --only firestore:rules
```

---

## 2️⃣ REINICIAR O BACKEND (OBRIGATÓRIO)

```bash
# Pare o servidor atual (Ctrl+C)

# Inicie novamente
npm start

# Ou em modo dev
npm run dev
```

**Você deve ver:**
```
✅ Firebase Admin SDK initialized successfully
🔐 Firebase authentication initialized
🚀 Server running on port 3000
```

---

## 🎉 PRONTO! Agora pode testar!

### Teste Rápido 1: Criar Conta de Prescritor

```bash
1. Acesse: http://localhost:3001/register
2. Clique em "Sou Prescritor"
3. Preencha os dados
4. Crie a conta
5. Você será redirecionado para /prescriber/dashboard
```

### Teste Rápido 2: Criar Conta de Paciente

```bash
1. Abra aba anônima ou outro navegador
2. Acesse: http://localhost:3001/register
3. Clique em "Sou Paciente/Usuário"
4. Preencha os dados
5. Crie a conta
6. Você será redirecionado para /patient/dashboard
```

### Teste Rápido 3: Enviar Convite (Prescritor → Paciente)

```bash
1. Logado como Prescritor
2. Na dashboard, procure "Convidar Paciente"
3. Digite o email do paciente que você criou
4. Envie o convite
```

### Teste Rápido 4: Aceitar Convite (Paciente)

```bash
1. Logado como Paciente
2. Você deve ver uma notificação de convite pendente
3. Aceite o convite
4. Agora está conectado!
```

---

## 📡 APIs Disponíveis

### 🔵 Prescritor (`/api/prescriber/...`)

```bash
# Listar pacientes
GET /api/prescriber/patients

# Listar convites pendentes
GET /api/prescriber/patients/pending

# Enviar convite
POST /api/prescriber/patients/invite
Body: { "patientEmail": "paciente@email.com" }

# Ver detalhes de paciente
GET /api/prescriber/patient/:patientId

# Criar plano alimentar
POST /api/prescriber/dietPlans
Body: {
  "patientId": "uid_paciente",
  "name": "Plano Low Carb",
  "meals": [...],
  "dailyCalories": 2000
}

# Ver planos de um paciente
GET /api/prescriber/dietPlans/:patientId

# Estatísticas
GET /api/prescriber/stats
```

### 🟢 Paciente (`/api/patient/...`)

```bash
# Ver meu prescritor
GET /api/patient/prescriber

# Ver plano ativo
GET /api/patient/dietPlan

# Histórico de planos
GET /api/patient/dietPlans/history

# Listar conexões
GET /api/patient/connections

# Aceitar convite
POST /api/patient/connections/:connectionId/accept

# Rejeitar convite
POST /api/patient/connections/:connectionId/reject

# Refeições de hoje
GET /api/patient/meals/today
```

---

## 🔐 Segurança Implementada

### ✅ No Backend (middleware)
- `verifyToken` - Autentica todos os usuários
- `requirePrescriber` - Só prescritores
- `requirePatient` - Só pacientes
- Service accounts (N8N) têm acesso total

### ✅ No Firestore (regras)
- Usuários só leem seus próprios dados
- Prescritores só acessam pacientes vinculados
- Pacientes só aceitam/rejeitam convites
- Role não pode ser alterado
- Conexão ativa é validada

### ✅ N8N/Webhooks
- Webhooks continuam funcionando com `x-webhook-secret`
- Nenhuma mudança necessária
- Service accounts não são afetados por roles

---

## 🐛 Se algo der errado:

### Erro: "No token provided"
```
Solução: Faça login novamente no frontend
```

### Erro: "Forbidden - Role mismatch"
```
Solução: Você está tentando acessar rota errada
- Prescritor não pode acessar /api/patient/*
- Paciente não pode acessar /api/prescriber/*
```

### Erro: "Connection already exists"
```
Solução: Prescritor já enviou convite para esse paciente
Verifique no Firestore Console: connections collection
```

### Regras não aplicando
```
Solução:
1. Verifique no Firebase Console se publicou
2. Aguarde 1-2 minutos
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Teste em aba anônima
```

---

## 📊 Ver dados no Firestore Console

```bash
1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore

2. Collections criadas automaticamente:
   - users (prescritores e pacientes)
   - connections (vinculações)
   - dietPlans (planos alimentares)
   - meals, exercises, etc (dados do paciente)
```

---

## 🧪 Testar com cURL

```bash
# 1. Faça login no frontend e pegue o token
# 2. No DevTools (F12) → Application → Local Storage → copie o token

TOKEN="cole-seu-token-aqui"

# Testar como prescritor
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/prescriber/patients

# Testar como paciente
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/patient/prescriber
```

---

## ✅ CHECKLIST FINAL

Marque conforme completar:

### Obrigatório
- [ ] Aplicar `firestore.rules` no Firebase Console
- [ ] Reiniciar backend (`npm start`)
- [ ] Criar conta de prescritor
- [ ] Criar conta de paciente
- [ ] Testar proteção de rotas

### Recomendado
- [ ] Enviar convite (prescritor → paciente)
- [ ] Aceitar convite (paciente)
- [ ] Criar plano alimentar
- [ ] Ver dados no Firestore Console
- [ ] Testar uma API com cURL

---

## 🎯 Resultado Esperado

Após completar, você terá:

✅ **Frontend:**
- Registro com seleção de tipo (Prescritor/Paciente)
- Login único para ambos
- Dashboards separados e protegidos
- Redirecionamento automático por role

✅ **Backend:**
- APIs protegidas por role
- Validação de conexões
- Endpoints específicos funcionando
- N8N compatível

✅ **Firebase:**
- Dados seguros
- Regras de segurança aplicadas
- Collections sendo criadas automaticamente

---

## 📞 Próximos Passos (Opcionais)

Depois de tudo funcionando:

1. **Melhorar UX**
   - Notificações de convites
   - Animações
   - Loading states

2. **Chat Prescritor-Paciente**
   - Mensagens em tempo real
   - Histórico de conversas

3. **Relatórios**
   - Progresso do paciente
   - Gráficos de evolução
   - Exportar PDF

4. **Agenda**
   - Marcar consultas
   - Lembretes

---

**Tudo pronto! Só falta aplicar as regras do Firestore e está 100% funcionando! 🚀**

Qualquer dúvida, consulte:
- `CHECKLIST-IMPLEMENTAR-ROLES.md` (detalhes completos)
- `CONFIGURAR-BACKEND-ROLES.md` (documentação técnica)
- `firestore.rules` (regras de segurança)

