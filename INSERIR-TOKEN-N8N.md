# 🔑 Como Inserir Token Firebase no N8N

## 🎯 Objetivo

Configurar o token Firebase como variável de ambiente no N8N Cloud para autenticação nos workflows.

---

## ✅ Pré-requisitos

1. ✅ Token Firebase já gerado (via `node generate-token.js`)
2. ✅ Conta N8N Cloud criada
3. ✅ Acesso ao dashboard do N8N Cloud

---

## 📋 PASSO A PASSO COMPLETO

### PASSO 1: Copiar o Token

Se ainda não copiou, execute:

```bash
node generate-token.js
```

**IMPORTANTE:** Copie **TODO o token** que aparece entre as linhas `━━━━`

Exemplo de token:
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlzcyI6ImZpcmViYXNlLWFkbWluc2RrLWZic3ZjQG51dHJpYnVkZHktMmZjOWMuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BudXRyaWJ1ZGR5LTJmYzljLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiaWF0IjoxNzMyMDAwMDAwLCJleHAiOjE3MzIwMDM2MDAsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.M9tpHXdLs5OwANntkwSR20Ryo1saGLVJOpzsVJ5HLDPz2mZk-2_3PefW5JaWtA7-XY_I6kun6lcbFAtrjLBrrmziLvHcsMqidcuUZgAYBPxd0d_eVZrDfY81y5xyPJKAUWJ5HUiuE98z2qlhWtYtSopNSu5Z36Kfb_6YLA_LFCNWCAISQ8Q
```

**⚠️ ATENÇÃO:** 
- O token é muito longo (geralmente 800-1200 caracteres)
- Copie **TUDO**, incluindo pontos e hífens
- Não esqueça nenhuma parte!

---

### PASSO 2: Acessar N8N Cloud

1. Abra seu navegador
2. Acesse: https://app.n8n.cloud
   - Ou use sua URL personalizada: `https://[seu-nome].app.n8n.cloud`
3. Faça login se necessário

---

### PASSO 3: Ir para Settings

1. No **menu lateral esquerdo**, encontre o ícone de **⚙️ Settings** (Configurações)
2. Clique em **"Settings"**
3. No menu de configurações, procure por **"Environment Variables"** (Variáveis de Ambiente)

**Caminho completo:**
```
Menu Lateral → ⚙️ Settings → Environment Variables
```

---

### PASSO 4: Adicionar Variável FIREBASE_TOKEN

1. Na página de **Environment Variables**, clique no botão **"+ Add Variable"** (ou **"+ Adicionar Variável"**)
2. Você verá um formulário com dois campos:
   - **Name** (Nome)
   - **Value** (Valor)

3. Preencha os campos:

   **Name:**
   ```
   FIREBASE_TOKEN
   ```
   
   **Value:**
   ```
   [Cole aqui o token completo que você copiou]
   ```

4. **IMPORTANTE:** 
   - O nome deve ser **exatamente**: `FIREBASE_TOKEN` (em maiúsculas)
   - Cole o token **completo** no campo Value
   - Não adicione espaços no início ou fim

---

### PASSO 5: Salvar

1. Após preencher os campos, clique em **"Save"** (Salvar)
2. Aguarde a confirmação de que a variável foi salva
3. Você verá a variável `FIREBASE_TOKEN` na lista de variáveis

---

## 🔍 VERIFICAÇÃO

### Como verificar se funcionou:

1. Volte para seu workflow no N8N
2. Abra qualquer nó HTTP Request que usa autenticação Firebase
3. Verifique se há referência a `{{$env.FIREBASE_TOKEN}}`
4. Execute um teste do workflow
5. Se funcionar sem erros de autenticação, está configurado! ✅

---

## 📸 VISUALIZAÇÃO NO N8N

Após configurar, você verá algo assim:

```
Environment Variables
├── FIREBASE_TOKEN ✅
│   └── Value: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9... (oculto por segurança)
├── WEBHOOK_SECRET
│   └── Value: nutribuddy-secret-2024
└── API_URL
    └── Value: https://seu-backend.ngrok.io
```

---

## 🎯 USAR NO WORKFLOW

Depois de configurar a variável, você pode usar nos nós HTTP Request:

### Exemplo: Nó "Salvar Nutrição"

1. Abra o nó HTTP Request
2. Vá na aba **"Authentication"** (ou **Headers**)
3. Adicione um header:

   **Header Name:**
   ```
   Authorization
   ```

   **Header Value:**
   ```
   Bearer {{$env.FIREBASE_TOKEN}}
   ```

**OU** se o workflow já está configurado, ele usará automaticamente!

---

## ⚠️ PROBLEMAS COMUNS

### "Variável não encontrada"

**Problema:** O workflow não encontra `{{$env.FIREBASE_TOKEN}}`

**Solução:**
1. Verifique se o nome está exatamente `FIREBASE_TOKEN` (maiúsculas)
2. Salve o workflow novamente após adicionar a variável
3. Recarregue a página do N8N

### "Token inválido"

**Problema:** Erro de autenticação ao usar o token

**Solução:**
1. Verifique se copiou o token **completo** (sem cortar)
2. Verifique se não há espaços extras
3. Gere um novo token: `node generate-token.js`
4. Substitua o token antigo no N8N

### "Não encontro Environment Variables"

**Problema:** Não vejo a opção no Settings

**Solução:**
1. Certifique-se de estar no **N8N Cloud** (não self-hosted)
2. Verifique se sua conta tem permissões de administrador
3. Procure por "Variables" ou "Environment" no menu Settings

---

## ✅ CHECKLIST FINAL

Antes de usar o workflow, verifique:

- [ ] Token foi gerado com sucesso
- [ ] Token foi copiado **completo** (sem cortar)
- [ ] Variável `FIREBASE_TOKEN` foi criada no N8N
- [ ] Valor da variável está correto (token completo)
- [ ] Variável foi salva com sucesso
- [ ] Workflow está usando `{{$env.FIREBASE_TOKEN}}`
- [ ] Teste do workflow funciona sem erros de autenticação

---

## 🚀 PRÓXIMOS PASSOS

Após configurar o token:

1. ✅ Teste o workflow completo
2. ✅ Verifique se os dados estão sendo salvos no Firebase
3. ✅ Configure outros webhooks se necessário
4. ✅ Veja `CORRIGIR-N8N-AGORA.md` para mais detalhes

---

## 📝 RESUMO RÁPIDO

```bash
# 1. Gerar token
node generate-token.js

# 2. Copiar token (entre as linhas ━━━━)

# 3. No N8N Cloud:
Settings → Environment Variables → + Add Variable

# 4. Preencher:
Name: FIREBASE_TOKEN
Value: [token copiado]

# 5. Save

# 6. Usar no workflow:
Authorization: Bearer {{$env.FIREBASE_TOKEN}}
```

---

**🎉 Pronto! O token está configurado e pronto para uso no N8N!**


