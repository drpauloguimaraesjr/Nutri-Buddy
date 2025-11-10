# 👑 Como se Tornar Admin do Sistema

## 📧 Seu Email: `drpauloguimaraesjr@gmail.com`

---

## 🚀 MÉTODO RÁPIDO - Via Firebase Console (2 minutos)

### **PASSO 1: Acessar Firebase Console**

1. Acesse: **https://console.firebase.google.com**
2. Faça login com sua conta Google
3. Selecione o projeto **NutriBuddy**

### **PASSO 2: Abrir Firestore Database**

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Clique na aba **"Data"** (ou "Dados")

### **PASSO 3: Encontrar Seu Usuário**

1. Você verá uma lista de **Collections** (Coleções)
2. Clique na coleção chamada **"users"**
3. Você verá uma lista de documentos (um para cada usuário)
4. Procure pelo seu documento:
   - Pode estar pelo ID (uid) OU
   - Pode ter seu email visível

### **PASSO 4: Editar o Campo Role**

1. Clique no seu documento de usuário
2. Procure o campo **"role"**
3. Clique no valor atual (provavelmente `"patient"`)
4. Mude para: **`admin`**
5. Clique em **"Save"** ou **"Salvar"**

### **PASSO 5: Recarregar o App**

1. Volte para o NutriBuddy no navegador
2. Pressione **Ctrl+Shift+R** (ou **Cmd+Shift+R** no Mac)
3. Você será redirecionado para o Dashboard de Admin
4. ✅ **Pronto! Você é admin agora!**

---

## 🎯 O QUE VOCÊ TERÁ COMO ADMIN

### **✅ Acesso Total:**
- ✅ Dashboard completo
- ✅ Ver todos os pacientes
- ✅ Criar novos pacientes
- ✅ Criar planos alimentares
- ✅ Acessar sistema de mensagens
- ✅ Ver analytics
- ✅ Configurações do sistema

### **✅ Menu Lateral Completo:**
```
📊 Dashboard
👥 Pacientes
  ↳ Ver todos
  ↳ Adicionar novo
  ↳ Gerenciar
📋 Planos
  ↳ Criar plano
  ↳ Editar planos
💬 Mensagens
📈 Analytics
⚙️ Configurações
```

---

## 🔍 SE NÃO ENCONTRAR SUA CONTA

### **Opção A: Procurar por UID**

1. Vá em **Firebase Console** → **Authentication**
2. Encontre seu email na lista de usuários
3. Copie o **UID** (algo como: `xK9mN3pQr...`)
4. Volte para **Firestore Database** → **users**
5. Procure pelo documento com esse UID

### **Opção B: Verificar se o Documento Existe**

Se não aparecer nenhum documento na coleção `users`:

1. Você precisa fazer **logout** e **login** novamente
2. O sistema criará automaticamente seu documento de usuário
3. Depois siga os passos acima para mudar o role

---

## 🛠️ SOLUÇÃO ALTERNATIVA - Via Firebase CLI (Avançado)

Se você preferir usar linha de comando:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Ir para o diretório do projeto
cd /caminho/para/NutriBuddy

# Executar script (criar o script abaixo)
node scripts/make-admin.js
```

**Script: `scripts/make-admin.js`**

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeAdmin(email) {
  try {
    // Buscar usuário por email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('Usuário não encontrado!');
      return;
    }
    
    // Atualizar role
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Usuário agora é admin!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

makeAdmin('drpauloguimaraesjr@gmail.com');
```

---

## 📊 TIPOS DE ROLES DISPONÍVEIS

### **1. patient** (Paciente)
```
✅ Ver seu próprio plano
✅ Registrar refeições
✅ Ver seu progresso
❌ Ver outros pacientes
❌ Criar planos
```

### **2. prescriber** (Prescritor/Nutricionista)
```
✅ Ver seus pacientes
✅ Criar planos alimentares
✅ Gerenciar pacientes
✅ Enviar mensagens
❌ Ver pacientes de outros prescritores
❌ Configurações globais
```

### **3. admin** (Administrador)
```
✅ ACESSO TOTAL
✅ Ver TODOS os usuários
✅ Ver TODOS os pacientes
✅ Gerenciar TODOS os planos
✅ Configurações do sistema
✅ Analytics globais
✅ Pode fazer TUDO
```

---

## 🎯 RECOMENDAÇÃO

**Para você (criador do sistema):**
- Use role: **`admin`**
- Terá acesso total ao sistema
- Poderá gerenciar tudo

**Quando criar contas para nutricionistas:**
- Use role: **`prescriber`**
- Terão acesso aos pacientes deles
- Não poderão ver pacientes de outros

**Quando criar contas para pacientes:**
- Use role: **`patient`**
- Verão apenas seus próprios dados
- Interface simplificada

---

## ✅ CHECKLIST

Depois de virar admin, teste:

- [ ] Dashboard carrega corretamente
- [ ] Menu lateral mostra todas as opções
- [ ] Consegue acessar "Pacientes"
- [ ] Consegue clicar em "Adicionar Paciente"
- [ ] Consegue acessar "Planos"
- [ ] Consegue acessar "Mensagens"
- [ ] Consegue acessar "Analytics"
- [ ] Consegue acessar "Configurações"

---

## 🆘 SE AINDA NÃO FUNCIONAR

1. **Limpe o cache do navegador:**
   - Ctrl+Shift+Delete
   - Limpe cookies e cache do site

2. **Faça logout e login novamente:**
   - Saia do sistema
   - Entre novamente
   - O sistema vai recarregar suas permissões

3. **Verifique o console do navegador:**
   - F12 → Console
   - Veja se há erros
   - Me envie os erros se houver

4. **Verifique se salvou corretamente:**
   - Volte no Firestore
   - Confirme que o campo `role` está como `"admin"`
   - Verifique se não tem erros de validação

---

## 🎉 SUCESSO!

Depois de virar admin, você terá:
- ✅ Acesso completo ao sistema
- ✅ Todos os menus liberados
- ✅ Poder criar e gerenciar pacientes
- ✅ Poder criar planos alimentares
- ✅ Acesso ao sistema de mensagens
- ✅ Ver todas as analytics

**Bem-vindo à área de administração!** 👑

