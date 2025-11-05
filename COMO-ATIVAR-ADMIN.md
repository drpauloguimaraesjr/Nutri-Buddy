# 🔐 Como Ativar Acesso Admin

## 📋 Visão Geral

A página admin está disponível em: `nutri-buddy-ir2n.vercel.app/admin`

Para acessar, você precisa ter a role `admin` no Firestore.

## 🚀 Método 1: Através do Firebase Console (Recomendado)

### Passo 1: Acessar Firebase Console
1. Acesse: https://console.firebase.google.com
2. Selecione o projeto: **nutribuddy-2fc9c**
3. Vá em **Firestore Database**

### Passo 2: Localizar seu usuário
1. Na coleção `users`, encontre o documento do seu usuário (pelo seu `uid` ou `email`)
2. Clique no documento para editar

### Passo 3: Atualizar role
1. Adicione ou edite o campo `role`
2. Defina o valor como: `admin`
3. Salve o documento

### Passo 4: Atualizar Custom Claims (Importante!)
1. Vá em **Authentication** → **Users**
2. Encontre seu usuário pelo email
3. Clique nos três pontos (⋮) → **Edit**
4. Em **Custom claims**, adicione:
   ```json
   {
     "role": "admin"
   }
   ```
5. Salve

### Passo 5: Fazer logout e login novamente
- O token do Firebase precisa ser atualizado para refletir as novas claims
- Faça logout e login novamente no sistema

---

## 🚀 Método 2: Através do Código (Temporário)

Se você não tiver acesso ao Firebase Console, pode criar um script temporário:

### Criar arquivo: `set-admin.js`

```javascript
const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function setAdmin(email) {
  try {
    // 1. Encontrar usuário pelo email
    const user = await auth.getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${user.uid}`);

    // 2. Atualizar Firestore
    await db.collection('users').doc(user.uid).set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Firestore atualizado');

    // 3. Atualizar Custom Claims
    await auth.setCustomUserClaims(user.uid, { role: 'admin' });
    console.log('✅ Custom claims atualizado');

    console.log(`\n✅ Usuário ${email} agora é admin!`);
    console.log('⚠️ Faça logout e login novamente para aplicar as mudanças.');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Substitua pelo seu email
const YOUR_EMAIL = 'seu-email@exemplo.com';

setAdmin(YOUR_EMAIL).then(() => process.exit(0));
```

### Executar:
```bash
node set-admin.js
```

---

## 🚀 Método 3: Através da API Admin (Se já tiver acesso)

Se você já tem acesso a outro admin ou consegue criar um usuário temporário:

1. Faça login com um usuário que tenha role `admin`
2. Acesse `/admin`
3. Use a função de atualizar role (se implementada)

---

## ✅ Verificar se está funcionando

1. Faça logout do sistema
2. Faça login novamente
3. Acesse: `nutri-buddy-ir2n.vercel.app/admin`
4. Se você ver o painel administrativo, está funcionando! ✅

---

## 🔒 Segurança

- **Apenas você** deve ter role `admin`
- Não compartilhe suas credenciais
- A página admin é protegida por middleware no backend
- Todas as requisições de admin exigem autenticação e role `admin`

---

## 📝 Notas

- O sistema verifica a role tanto no Firestore quanto no Firebase Auth Custom Claims
- É necessário fazer logout/login após alterar a role para atualizar o token
- Se você não conseguir acessar, verifique:
  1. Se o campo `role` está definido como `admin` no Firestore
  2. Se as Custom Claims estão configuradas no Firebase Auth
  3. Se você fez logout e login após as alterações


