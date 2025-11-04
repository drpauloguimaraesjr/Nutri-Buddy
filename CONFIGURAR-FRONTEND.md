# 🔧 Configurar Frontend - ÚLTIMO PASSO!

## ✅ Situação Atual
- ✅ Backend rodando na porta **3000**
- ✅ Frontend rodando na porta **3001**
- ⚠️ Falta apenas configurar Firebase no frontend

---

## 🔥 Passo 1: Obter Credenciais do Firebase

### Acesse o Console:
1. Abra: https://console.firebase.google.com/project/nutribuddy-2fc9c/settings/general
2. Role até **"Seus apps"**
3. Se já existe um app Web, clique em **"Ver configurações"**
4. Se não existe, clique em **"Adicionar app"** > ícone **</> (Web)**

### Você verá algo assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nutribuddy-2fc9c.firebaseapp.com",
  projectId: "nutribuddy-2fc9c",
  storageBucket: "nutribuddy-2fc9c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 📝 Passo 2: Criar Arquivo `.env.local`

Execute este comando no terminal:

```bash
cat > /Users/drpgjr.../NutriBuddy/frontend/.env.local << 'EOF'
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=cole_aqui_seu_apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=cole_aqui_seu_messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=cole_aqui_seu_appId
EOF
```

**IMPORTANTE:** Depois de criar o arquivo, abra-o e **substitua** os valores:
```bash
nano /Users/drpgjr.../NutriBuddy/frontend/.env.local
```

Ou use seu editor preferido.

---

## 🚀 Passo 3: Reiniciar Frontend

Após salvar o `.env.local`:

```bash
# 1. Parar o frontend atual
lsof -ti:3001 | xargs kill -9

# 2. Iniciar novamente
cd /Users/drpgjr.../NutriBuddy/frontend
npm run dev
```

---

## 🎉 Passo 4: Acessar

Abra no navegador:
```
http://localhost:3001
```

Você verá a tela de **Login/Registro** do NutriBuddy! 🎊

---

## ❓ Problemas?

### Firebase retorna erro 400/401?
- Verifique se copiou as credenciais corretamente
- Certifique-se de não ter espaços extras
- Confirme que o projeto é `nutribuddy-2fc9c`

### Porta 3001 em uso?
```bash
lsof -ti:3001 | xargs kill -9
```

### Ainda não funciona?
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor frontend

---

## 📞 Configurações Concluídas!

Após seguir estes passos, você terá:
- ✅ Backend funcionando (porta 3000)
- ✅ Frontend funcionando (porta 3001)
- ✅ Firebase autenticação configurada
- ✅ Firebase storage configurado
- ✅ Pronto para usar! 🚀

