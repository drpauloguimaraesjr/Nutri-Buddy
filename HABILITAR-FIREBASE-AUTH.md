# 🔓 Como Habilitar Firebase Authentication

## ❌ Problema Atual

O erro `auth/configuration-not-found` ocorre porque o **Firebase Authentication não está habilitado** no seu projeto.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acessar Firebase Console

1. Abra: https://console.firebase.google.com
2. Faça login (se necessário)
3. Selecione o projeto: **nutribuddy-2fc9c**

### Passo 2: Habilitar Authentication

1. No menu lateral esquerdo, clique em **"Authentication"** (ou **"Autenticação"**)
2. Se aparecer um botão **"Get started"** (ou **"Começar"**), clique nele
3. Você verá uma lista de métodos de autenticação

### Passo 3: Habilitar Email/Password

1. Na lista de métodos, encontre **"Email/Password"** (ou **"Email/Senha"**)
2. Clique no toggle para **ativar** (ficará verde/azul)
3. Opcionalmente, habilite também **"Email link (passwordless sign-in)"** se quiser
4. Clique em **"Save"** (Salvar)

### Passo 4: Verificar

1. Aguarde alguns segundos (10-30s) para a configuração ser propagada
2. Você deve ver uma tela com "Users" (Usuários) vazia
3. Isso significa que está funcionando!

### Passo 5: Testar Novamente

Volte ao terminal e execute:

```bash
node generate-token.js
```

Deve funcionar agora! ✅

---

## 📸 Visualização

Após habilitar, você verá algo assim:

```
Authentication
├── Users (0 usuários)
├── Sign-in method
│   ├── Email/Password ✅ (Enabled)
│   ├── Google
│   ├── Facebook
│   └── ...
```

---

## 🎯 Métodos Recomendados

Para o NutriBuddy, recomendo habilitar:

1. ✅ **Email/Password** (obrigatório para o projeto)
2. ⚠️ **Google** (opcional, se quiser login social)

**Email/Password é suficiente** para o funcionamento do generate-token.js!

---

## ⚠️ Problemas Comuns

### "Não vejo o menu Authentication"

**Solução:** 
- Certifique-se de que está no projeto correto: **nutribuddy-2fc9c**
- Verifique se você tem permissões de administrador no projeto

### "Botão não habilita"

**Solução:**
- Recarregue a página (F5)
- Tente em outro navegador
- Aguarde alguns segundos e tente novamente

### "Ainda dá erro após habilitar"

**Solução:**
- Aguarde 30-60 segundos (propagação da configuração)
- Verifique se realmente salvou (deve aparecer "Enabled")
- Execute novamente: `node generate-token.js`

---

## 🚀 Próximos Passos

Após habilitar e gerar o token:

1. ✅ Token será gerado com sucesso
2. ✅ Copie o token gerado
3. ✅ Configure no N8N Cloud (veja GERAR-TOKEN-COMANDO.md)

---

**🎉 Pronto! Agora você pode gerar tokens do Firebase!**

