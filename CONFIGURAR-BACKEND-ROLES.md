# 🔧 Configuração do Backend para Sistema de Roles

## 📋 O que foi implementado

O backend agora possui **suporte completo** para o sistema de roles (Prescritor e Paciente).

---

## 1️⃣ Middleware de Autenticação Atualizado

### Arquivo: `middleware/auth.js`

**Novas funcionalidades:**

### ✅ `verifyToken`
- Agora busca o **role do usuário** no Firestore
- Adiciona `req.user.role` em todas as requisições autenticadas
- Suporta webhook do N8N (service accounts)

```javascript
// Exemplo de uso
router.get('/api/protected', verifyToken, (req, res) => {
  console.log(req.user.role); // 'patient' ou 'prescriber'
});
```

### ✅ `requireRole(roles)`
- Middleware para proteger rotas por role
- Aceita string ou array de roles

```javascript
// Apenas prescritores
router.post('/api/dietPlans', verifyToken, requireRole('prescriber'), createDietPlan);

// Prescritores ou admins
router.get('/api/admin', verifyToken, requireRole(['prescriber', 'admin']), getAdminData);
```

### ✅ `requirePrescriber`
- Atalho para `requireRole('prescriber')`

```javascript
router.get('/api/patients', verifyToken, requirePrescriber, getPatients);
```

### ✅ `requirePatient`
- Atalho para `requireRole('patient')`

```javascript
router.post('/api/meals', verifyToken, requirePatient, createMeal);
```

### ✅ `requireOwnership`
- Verifica se usuário pode acessar recurso
- Pacientes só acessam seus próprios dados
- Prescritores podem acessar dados de seus pacientes vinculados

```javascript
router.get('/api/meals/:userId', verifyToken, requireOwnership, getUserMeals);
```

---

## 2️⃣ Firestore Security Rules

### Arquivo: `firestore.rules`

**Regras implementadas para cada collection:**

### 📝 `users/`
- ✅ Usuários leem/atualizam seus próprios dados
- ✅ Prescritores podem ler dados básicos de seus pacientes
- ✅ Role não pode ser alterado após criação

### 🔗 `connections/`
- ✅ Prescritores criam convites (status: pending)
- ✅ Pacientes aceitam/rejeitam convites
- ✅ Ambos podem ler suas próprias conexões
- ✅ Prescritores podem ver status de convites enviados

### 📋 `dietPlans/`
- ✅ Apenas prescritores criam planos
- ✅ Prescritores leem/editam seus próprios planos
- ✅ Pacientes leem planos atribuídos a eles
- ✅ Validação de conexão ativa

### 🍽️ `meals/`, `exercises/`, `waterIntake/`, etc.
- ✅ Usuários criam/editam seus próprios dados
- ✅ Prescritores podem **ler** dados de pacientes vinculados
- ✅ Prescritores **não podem editar** dados dos pacientes

### 📖 `recipes/`
- ✅ Todos autenticados podem ler
- ✅ Criadores podem editar suas próprias receitas

---

## 3️⃣ Estrutura de Conexões (Firestore)

### Collection: `connections/`

```javascript
{
  id: "prescriberId_patientId",
  prescriberId: "uid_do_prescritor",
  patientId: "uid_do_paciente",
  patientEmail: "paciente@email.com",
  patientName: "Nome do Paciente",
  status: "pending" | "active" | "inactive",
  createdAt: timestamp,
  notes: "Observações opcionais"
}
```

**Status:**
- `pending` - Convite enviado, aguardando aceite
- `active` - Conexão aceita e ativa
- `inactive` - Conexão desativada/recusada

---

## 4️⃣ Como Aplicar as Regras do Firestore

### Opção 1: Firebase Console (Recomendado)

```bash
1. Acesse: https://console.firebase.google.com/project/nutribuddy-2fc9c/firestore/rules

2. Cole o conteúdo do arquivo firestore.rules

3. Clique em "Publicar"
```

### Opção 2: Firebase CLI

```bash
# Instalar Firebase CLI (se ainda não tem)
npm install -g firebase-tools

# Login
firebase login

# Deploy das regras
firebase deploy --only firestore:rules
```

### Opção 3: Copiar manualmente

```bash
# 1. Abra o arquivo firestore.rules
# 2. Copie todo o conteúdo
# 3. Cole no Firebase Console
# 4. Publique
```

---

## 5️⃣ Exemplo de Rotas com Roles

### Criar em: `routes/prescriber.js` (novo arquivo)

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken, requirePrescriber } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Todas as rotas aqui requerem autenticação + role prescriber
router.use(verifyToken);
router.use(requirePrescriber);

// Listar pacientes do prescritor
router.get('/patients', async (req, res) => {
  try {
    const prescriberId = req.user.uid;
    
    const connectionsSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('status', '==', 'active')
      .get();
    
    const patients = [];
    for (const doc of connectionsSnapshot.docs) {
      const connection = doc.data();
      const patientDoc = await db.collection('users').doc(connection.patientId).get();
      
      if (patientDoc.exists) {
        patients.push({
          id: patientDoc.id,
          ...patientDoc.data(),
          connectionId: doc.id
        });
      }
    }
    
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Criar convite para paciente
router.post('/patients/invite', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const prescriberId = req.user.uid;
    
    // Buscar paciente por email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', patientEmail)
      .where('role', '==', 'patient')
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    const patientDoc = usersSnapshot.docs[0];
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();
    
    // Verificar se conexão já existe
    const existingConnection = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .limit(1)
      .get();
    
    if (!existingConnection.empty) {
      return res.status(400).json({
        success: false,
        error: 'Connection already exists'
      });
    }
    
    // Criar conexão
    const connectionRef = await db.collection('connections').add({
      prescriberId,
      patientId,
      patientEmail: patientData.email,
      patientName: patientData.displayName || 'Unknown',
      status: 'pending',
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      data: {
        connectionId: connectionRef.id,
        message: 'Invite sent successfully'
      }
    });
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Criar plano alimentar
router.post('/dietPlans', async (req, res) => {
  try {
    const { patientId, name, description, meals, dailyCalories } = req.body;
    const prescriberId = req.user.uid;
    
    // Verificar conexão ativa
    const connectionSnapshot = await db.collection('connections')
      .where('prescriberId', '==', prescriberId)
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.status(403).json({
        success: false,
        error: 'No active connection with this patient'
      });
    }
    
    // Criar plano
    const planRef = await db.collection('dietPlans').add({
      prescriberId,
      patientId,
      name,
      description,
      meals,
      dailyCalories,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      data: {
        planId: planRef.id,
        message: 'Diet plan created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating diet plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

### Adicionar no `server.js`:

```javascript
// Importar rotas do prescritor
const prescriberRoutes = require('./routes/prescriber');

// Usar rotas
app.use('/api/prescriber', prescriberRoutes);
```

---

## 6️⃣ Exemplo de Rotas para Paciente

### Criar em: `routes/patient.js` (novo arquivo)

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken, requirePatient } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Todas as rotas requerem autenticação + role patient
router.use(verifyToken);
router.use(requirePatient);

// Ver meu prescritor
router.get('/prescriber', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
    const connectionSnapshot = await db.collection('connections')
      .where('patientId', '==', patientId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (connectionSnapshot.empty) {
      return res.json({
        success: true,
        data: null,
        message: 'No active prescriber'
      });
    }
    
    const connection = connectionSnapshot.docs[0].data();
    const prescriberDoc = await db.collection('users').doc(connection.prescriberId).get();
    
    res.json({
      success: true,
      data: prescriberDoc.exists ? prescriberDoc.data() : null
    });
  } catch (error) {
    console.error('Error fetching prescriber:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ver meu plano alimentar
router.get('/dietPlan', async (req, res) => {
  try {
    const patientId = req.user.uid;
    
    const planSnapshot = await db.collection('dietPlans')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (planSnapshot.empty) {
      return res.json({
        success: true,
        data: null,
        message: 'No active diet plan'
      });
    }
    
    const plan = planSnapshot.docs[0].data();
    
    res.json({
      success: true,
      data: {
        id: planSnapshot.docs[0].id,
        ...plan
      }
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Aceitar convite de prescritor
router.post('/connections/:connectionId/accept', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const patientId = req.user.uid;
    
    const connectionRef = db.collection('connections').doc(connectionId);
    const connectionDoc = await connectionRef.get();
    
    if (!connectionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }
    
    const connection = connectionDoc.data();
    
    if (connection.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    await connectionRef.update({
      status: 'active',
      acceptedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Connection accepted'
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

### Adicionar no `server.js`:

```javascript
// Importar rotas do paciente
const patientRoutes = require('./routes/patient');

// Usar rotas
app.use('/api/patient', patientRoutes);
```

---

## 7️⃣ Checklist de Implementação

### Backend

- [x] ✅ Middleware `verifyToken` atualizado
- [x] ✅ Middleware `requireRole` criado
- [x] ✅ Middleware `requirePrescriber` criado
- [x] ✅ Middleware `requirePatient` criado
- [x] ✅ Middleware `requireOwnership` criado
- [ ] 🔲 Criar `routes/prescriber.js`
- [ ] 🔲 Criar `routes/patient.js`
- [ ] 🔲 Adicionar rotas no `server.js`

### Firebase

- [ ] 🔲 Aplicar `firestore.rules` no console
- [ ] 🔲 Testar regras de segurança
- [ ] 🔲 Criar índices necessários

### Testes

- [ ] 🔲 Testar login como prescritor
- [ ] 🔲 Testar login como paciente
- [ ] 🔲 Testar criação de conexão
- [ ] 🔲 Testar criação de plano alimentar
- [ ] 🔲 Testar acesso de dados

---

## 8️⃣ Comandos Úteis

### Testar com cURL

```bash
# Login e pegar token (use o frontend)
TOKEN="seu-firebase-token-aqui"

# Testar rota de prescritor
curl -X GET http://localhost:3000/api/prescriber/patients \
  -H "Authorization: Bearer $TOKEN"

# Testar rota de paciente
curl -X GET http://localhost:3000/api/patient/prescriber \
  -H "Authorization: Bearer $TOKEN"
```

### Ver logs

```bash
# Rodar servidor em modo dev
npm run dev

# Ver logs em tempo real
tail -f logs/app.log
```

---

## 9️⃣ Estrutura de Pastas Atualizada

```
NutriBuddy/
├── middleware/
│   └── auth.js ✅ (atualizado)
├── routes/
│   ├── api.js (existente)
│   ├── prescriber.js ⚠️ (criar)
│   └── patient.js ⚠️ (criar)
├── firestore.rules ✅ (novo)
└── server.js ⚠️ (atualizar)
```

---

## 🔟 N8N Integration

O sistema de roles **não afeta** a integração com N8N!

- ✅ Webhooks continuam funcionando
- ✅ Service accounts têm acesso total
- ✅ Nenhuma mudança necessária nos workflows

---

## 📝 Resumo

### ✅ O que está pronto:
1. Middleware de autenticação com roles
2. Regras de segurança do Firestore
3. Documentação completa
4. Exemplos de implementação

### ⚠️ O que você precisa fazer:
1. **Aplicar regras do Firestore** (5 minutos)
2. **Criar rotas** `prescriber.js` e `patient.js` (opcional, mas recomendado)
3. **Testar** o sistema completo

### 🎯 Resultado:
- Backend totalmente seguro
- Dados protegidos por role
- Prescritores só acessam seus pacientes
- Pacientes só acessam seus próprios dados

---

**Pronto! Backend configurado para suportar roles! 🚀**

