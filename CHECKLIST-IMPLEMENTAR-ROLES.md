# ✅ Checklist: Implementar Sistema de Roles

## 📋 Resumo do que foi feito

Sistema **completo** de dois tipos de usuários (Prescritor e Paciente) está implementado!

---

## 🎯 O QUE VOCÊ PRECISA FAZER AGORA

### 1️⃣ **Aplicar Firestore Rules** (5 minutos) ⚠️ OBRIGATÓRIO

#### Método A: Firebase Console (Mais Fácil)

```bash
1. Abra: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore/rules

2. Copie TODO o conteúdo do arquivo: firestore.rules

3. Cole no editor do Firebase Console

4. Clique em "Publicar" (ou "Publish")

5. Aguarde confirmação
```

#### Método B: Firebase CLI

```bash
# No terminal, na pasta NutriBuddy/
firebase deploy --only firestore:rules
```

**Por que é obrigatório?**
- Sem essas regras, qualquer usuário pode acessar dados de qualquer outro
- Com as regras, prescritores só acessam seus pacientes
- Pacientes só acessam seus próprios dados

---

### 2️⃣ **Reiniciar o Backend** (1 minuto) ⚠️ OBRIGATÓRIO

```bash
# No terminal, na pasta NutriBuddy/
npm start

# Ou modo desenvolvimento
npm run dev
```

**Você deve ver:**
```
✅ Firebase Admin SDK initialized successfully
🚀 Server running on port 3000
```

---

### 3️⃣ **Testar Sistema** (5 minutos)

#### Teste 1: Criar Conta de Prescritor

```bash
1. Acesse: http://localhost:3001/register
2. Clique em "Sou Prescritor"
3. Preencha: nome, email, senha
4. Crie a conta
5. Você será levado para /prescriber/dashboard
```

**Esperado:** Dashboard do prescritor com cards de pacientes

#### Teste 2: Criar Conta de Paciente

```bash
1. Abra aba anônima (ou outro navegador)
2. Acesse: http://localhost:3001/register
3. Clique em "Sou Paciente/Usuário"
4. Preencha: nome, email, senha
5. Crie a conta
6. Você será levado para /patient/dashboard
```

**Esperado:** Dashboard do paciente com plano alimentar

#### Teste 3: Testar Proteção de Rotas

```bash
1. Logado como Prescritor:
   - Tente acessar: http://localhost:3001/patient/dashboard
   - Deve redirecionar para /prescriber/dashboard

2. Logado como Paciente:
   - Tente acessar: http://localhost:3001/prescriber/dashboard
   - Deve redirecionar para /patient/dashboard
```

**Esperado:** Redirecionamento automático funciona!

---

## 📂 Arquivos Modificados/Criados

### ✅ Backend (Já aplicado)
- [x] `middleware/auth.js` - Atualizado com suporte a roles
- [x] `routes/prescriber.js` - Novo (rotas do prescritor)
- [x] `routes/patient.js` - Novo (rotas do paciente)
- [x] `server.js` - Atualizado (inclui novas rotas)

### ✅ Frontend (Já aplicado)
- [x] `types/index.ts` - Atualizado com UserRole
- [x] `context/AuthContext.tsx` - Suporte a roles
- [x] `hooks/useRoleProtection.ts` - Novo
- [x] `app/register/page.tsx` - Seleção de tipo
- [x] `app/prescriber/*` - Páginas do prescritor
- [x] `app/patient/*` - Páginas do paciente

### ⚠️ Firebase (Você precisa aplicar)
- [ ] `firestore.rules` - **APLICAR NO FIREBASE CONSOLE**

---

## 🔧 Comandos Úteis

### Backend

```bash
# Rodar servidor
npm start

# Rodar em modo dev (auto-reload)
npm run dev

# Ver logs
tail -f logs/server.log
```

### Frontend

```bash
cd frontend

# Rodar frontend
npm run dev

# Build para produção
npm run build
```

### Testar APIs com cURL

```bash
# Obter token (faça login no frontend e pegue do devtools)
TOKEN="cole-seu-token-aqui"

# Listar pacientes (prescritor)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/prescriber/patients

# Ver meu prescritor (paciente)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/patient/prescriber
```

---

## 📊 Estrutura de Dados (Firestore)

### Collections que existirão:

```
users/
  {userId}/
    - role: "prescriber" | "patient"
    - email, displayName, etc.

connections/
  {connectionId}/
    - prescriberId: uid
    - patientId: uid
    - status: "pending" | "active" | "inactive"

dietPlans/
  {planId}/
    - prescriberId: uid
    - patientId: uid
    - meals: []
    - isActive: boolean

meals/
  {mealId}/
    - userId: uid
    - date, calories, etc.
```

---

## 🚀 Funcionalidades Disponíveis

### Prescritor pode:
- ✅ Ver lista de pacientes
- ✅ Enviar convites para pacientes
- ✅ Ver convites pendentes
- ✅ Criar planos alimentares
- ✅ Ver dados dos pacientes
- ✅ Ver estatísticas agregadas

### Paciente pode:
- ✅ Ver seu prescritor
- ✅ Ver plano alimentar prescrito
- ✅ Aceitar/rejeitar convites
- ✅ Registrar refeições
- ✅ Ver histórico de planos

---

## 🔐 Segurança Implementada

### Middleware Backend
- ✅ `verifyToken` - Autentica usuário
- ✅ `requireRole` - Verifica role específico
- ✅ `requirePrescriber` - Só prescritores
- ✅ `requirePatient` - Só pacientes
- ✅ `requireOwnership` - Verifica propriedade de dados

### Firestore Rules
- ✅ Usuários só leem seus próprios dados
- ✅ Prescritores só acessam pacientes vinculados
- ✅ Role não pode ser alterado após criação
- ✅ Conexões validadas antes de criar planos

---

## 🐛 Troubleshooting

### Erro: "No token provided"
```
Solução: Faça login novamente no frontend
```

### Erro: "Forbidden - Role mismatch"
```
Solução: Você está tentando acessar rota de outro role
Verifique: console do navegador → Application → Local Storage
```

### Erro: "Connection already exists"
```
Solução: Prescritor já enviou convite para esse paciente
```

### Regras do Firestore não aplicando
```
Solução:
1. Verifique no Firebase Console se publicou corretamente
2. Aguarde 1-2 minutos para propagar
3. Limpe cache do navegador
4. Teste em aba anônima
```

### Backend não inicia
```
Solução:
1. Verifique se .env está configurado
2. Verifique credenciais do Firebase
3. Execute: npm install
4. Veja logs de erro completos
```

---

## 📱 N8N Integration

**Nada muda no N8N!**

- ✅ Webhooks continuam funcionando normalmente
- ✅ Service accounts têm acesso total
- ✅ Nenhuma mudança necessária nos workflows

Se usar webhook secret:
```javascript
headers: {
  'x-webhook-secret': 'seu-secret-aqui'
}
```

---

## 📝 Próximos Passos (Opcionais)

1. **Criar Interface de Prescrição de Dieta**
   - Arrastar e soltar refeições
   - Biblioteca de alimentos
   - Templates de planos

2. **Notificações**
   - Push notifications para convites
   - Alertas quando paciente registra refeição
   - Lembretes de refeição

3. **Chat Prescritor-Paciente**
   - Mensagens em tempo real
   - Envio de arquivos
   - Histórico de conversas

4. **Relatórios Avançados**
   - Progresso detalhado do paciente
   - Gráficos de evolução
   - Exportar PDF

5. **Agenda**
   - Marcar consultas
   - Lembretes automáticos
   - Histórico de consultas

---

## ✅ CHECKLIST FINAL

Marque conforme for completando:

### Obrigatório
- [ ] Aplicar `firestore.rules` no Firebase Console
- [ ] Reiniciar backend (`npm start`)
- [ ] Testar criação de conta prescritor
- [ ] Testar criação de conta paciente
- [ ] Testar proteção de rotas

### Opcional mas Recomendado
- [ ] Testar envio de convite (prescritor → paciente)
- [ ] Testar aceite de convite (paciente)
- [ ] Testar criação de plano alimentar
- [ ] Ver dados no Firestore Console
- [ ] Testar com cURL as APIs

### Documentação
- [ ] Ler `SISTEMA-ROLES.md`
- [ ] Ler `CONFIGURAR-BACKEND-ROLES.md`
- [ ] Guardar este checklist para referência

---

## 🎉 Resultado Esperado

Após completar:

1. **Frontend:**
   - ✅ Registro com seleção de tipo
   - ✅ Login único para ambos
   - ✅ Dashboards separados
   - ✅ Proteção automática por role

2. **Backend:**
   - ✅ APIs protegidas por role
   - ✅ Validação de conexões
   - ✅ Endpoints específicos funcionando

3. **Firebase:**
   - ✅ Dados seguros
   - ✅ Regras aplicadas
   - ✅ Collections criadas automaticamente

---

## 📞 Suporte

Se encontrar algum problema:

1. Verifique os logs do backend
2. Verifique o console do navegador (F12)
3. Verifique as regras do Firestore
4. Releia a documentação

---

**Tudo pronto! O sistema de roles está 100% implementado! 🚀**

Só falta você **aplicar as regras do Firestore** e está tudo funcionando!

