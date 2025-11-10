# 🔧 Como Corrigir o Problema de Login

## 🔍 O PROBLEMA

O erro "Missing or insufficient permissions" acontece porque:

1. As regras do Firestore são muito restritivas
2. Quando você faz login pela primeira vez, o documento do usuário não existe ainda
3. As regras tentam verificar o `role` do usuário antes de permitir criar o documento
4. Isso cria um "deadlock" - você não pode criar o documento porque não tem permissão, e não tem permissão porque o documento não existe!

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### **PASSO 1: Atualizar Regras do Firestore**

1. Acesse o **Firebase Console**: https://console.firebase.google.com

2. Selecione seu projeto: **NutriBuddy**

3. No menu lateral, clique em **"Firestore Database"**

4. Clique na aba **"Regras"** (Rules)

5. Copie o conteúdo do arquivo `firestore-dev.rules` e cole lá

6. Clique em **"Publicar"** (Publish)

---

### **PASSO 2: Verificar Variáveis de Ambiente no Vercel**

1. Acesse: https://vercel.com/dashboard

2. Selecione seu projeto NutriBuddy

3. Vá em **"Settings" → "Environment Variables"**

4. Verifique se estas variáveis estão configuradas:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://web-production-c9eaf.up.railway.app

# Email Link (opcional)
NEXT_PUBLIC_EMAIL_LINK_REDIRECT_URL=https://seu-app.vercel.app/login
```

5. Se faltarem, adicione-as e clique em **"Save"**

6. Após salvar, faça um **"Redeploy"** do projeto

---

### **PASSO 3: Testar o Login**

Agora tente fazer login novamente:

#### **Opção A: Login com Google**
1. Clique em "Continuar com Google"
2. Selecione sua conta Google
3. Autorize o acesso
4. ✅ Deve funcionar!

#### **Opção B: Criar usuário com Email/Senha**
1. Você precisará criar um usuário primeiro
2. Acesse o Firebase Console → Authentication
3. Adicione manualmente um usuário de teste
4. Depois tente fazer login

---

## 🎯 TESTES PARA FAZER

Após aplicar as correções:

### **1. Teste Login Google**
```
✅ Clicar em "Continuar com Google"
✅ Deve redirecionar para tela de seleção do Google
✅ Após autorizar, deve criar usuário automaticamente
✅ Deve redirecionar para /meu-plano ou /dashboard
```

### **2. Verificar Criação do Usuário**
```
✅ Ir no Firebase Console → Firestore Database
✅ Verificar se existe coleção "users"
✅ Verificar se seu usuário foi criado com:
   - uid
   - email
   - displayName
   - role: "patient" (padrão)
   - createdAt
```

### **3. Teste Navegação**
```
✅ Dashboard deve carregar
✅ Não deve mostrar mais erro de permissão
✅ Dados devem carregar normalmente
```

---

## 🔒 IMPORTANTE SOBRE SEGURANÇA

As regras em `firestore-dev.rules` são **PERMISSIVAS** para facilitar o desenvolvimento.

### **Para PRODUÇÃO, você deve:**

1. Usar as regras originais em `firestore.rules` (mais seguras)
2. Garantir que TODOS os usuários tenham documento em `/users/{uid}`
3. Implementar validações adequadas
4. Limitar acesso baseado em roles

### **Quando mudar para produção:**

```bash
# Copiar regras de produção
firebase deploy --only firestore:rules
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

### **Erro persiste após atualizar regras?**

1. **Limpe o cache do navegador**
   - Ctrl+Shift+Delete
   - Limpar cookies e cache

2. **Tente em aba anônima**
   - Ctrl+Shift+N (Chrome)
   - Cmd+Shift+N (Mac)

3. **Verifique o Console do navegador**
   - F12 → Console
   - Procure erros em vermelho
   - Me envie as mensagens de erro

4. **Verifique Firebase Authentication**
   - Firebase Console → Authentication
   - Veja se "Google" está habilitado como método de login
   - Se não estiver, habilite!

---

## 📊 CHECKLIST COMPLETO

- [ ] Atualizei regras do Firestore (Passo 1)
- [ ] Verifiquei variáveis de ambiente no Vercel (Passo 2)
- [ ] Fiz redeploy no Vercel
- [ ] Google Auth está habilitado no Firebase
- [ ] Testei login com Google
- [ ] Usuário foi criado no Firestore
- [ ] Consigo navegar no app sem erros

---

## 🎉 SUCESSO!

Se conseguiu fazer login e navegar no app sem erros de permissão, **parabéns!** 🚀

O deploy está completo e funcionando!

### **Próximos passos:**
1. Testar todas as funcionalidades
2. Criar mais usuários de teste
3. Configurar N8N workflows
4. Ajustar regras de segurança para produção

