# ⚙️ Configurar Todas as Variáveis no N8N

## 🎯 Objetivo

Configurar todas as variáveis de ambiente necessárias no N8N Cloud para o workflow funcionar corretamente.

---

## ⚠️ AVISO IMPORTANTE

**Diferença importante:**
- **"Environments"** (plural) = Múltiplos ambientes (dev, prod) - **apenas Enterprise** ❌
- **"Environment Variables"** = Variáveis de configuração - **disponível no Pro** ✅

Se você receber o erro **"access to env vars denied"** ao usar variáveis de ambiente em nós "Code in JavaScript":

- **Plano Pro pode ter limitações** de acesso a env vars em código JavaScript customizado
- **Soluções detalhadas:** Veja seção "⚠️ PROBLEMAS COMUNS → access to env vars denied" abaixo
- **Workaround recomendado:** Use nós "Set" ou "HTTP Request" com expressões `{{$env.VARIAVEL}}` em vez de nós JavaScript (funciona no Pro!)

---

## 📋 VARIÁVEIS NECESSÁRIAS

Você precisa configurar **3 variáveis** no N8N:

1. ✅ **FIREBASE_TOKEN** - Já configurado (se seguiu o guia anterior)
2. ⚠️ **WEBHOOK_SECRET** - Precisa configurar agora
3. ⚠️ **API_URL** - Precisa configurar agora (URL pública do backend)

---

## ✅ PASSO 1: Acessar Environment Variables

⚠️ **IMPORTANTE - Diferença:**
- **"Environments"** (plural) = Múltiplos ambientes (dev, prod) - **apenas Enterprise**
- **"Environment Variables"** (singular) = Variáveis de configuração - **disponível no Pro e Enterprise**

Você está no **plano Pro**, então pode usar **Environment Variables** normalmente!

1. No **N8N Cloud**, clique em **⚙️ Settings** (menu lateral)
2. Procure por **"Environment Variables"** (NÃO "Environments")
3. Você verá a lista de variáveis existentes

📝 **Nota:** Se você vir uma tela dizendo "Available on the Enterprise plan" sobre "Environments", isso é diferente! Você precisa acessar "Environment Variables" que está disponível no Pro.

---

## 🔑 PASSO 2: Configurar WEBHOOK_SECRET

### 2.1 Adicionar Variável

1. Clique em **"+ Add Variable"**
2. Preencha os campos:

   **Name:**
   ```
   WEBHOOK_SECRET
   ```

   **Value:**
   ```
   nutribuddy-secret-2024
   ```

   ⚠️ **IMPORTANTE:** 
   - O valor deve ser **exatamente** `nutribuddy-secret-2024` (sem aspas)
   - Deve corresponder ao valor no seu arquivo `.env` do backend

3. Clique em **"Save"**

### 2.2 Verificar

Após salvar, você deve ver:
```
WEBHOOK_SECRET = nutribuddy-secret-2024
```

✅ Esta variável é usada para autenticar webhooks do N8N no backend.

---

## 🌐 PASSO 3: Configurar API_URL

### 3.1 Escolher o Tipo de URL

Você tem **2 opções** dependendo de onde está rodando o backend:

#### OPÇÃO A: Backend Local (Precisa ngrok)

Se o backend está rodando em `localhost:3000`, você precisa expor com **ngrok**.

**Passo a passo:**

1. **Instalar ngrok** (se ainda não tem):
   ```bash
   brew install ngrok
   ```

2. **Criar conta e configurar** (se ainda não tem):
   - Acesse: https://dashboard.ngrok.com/signup
   - Crie conta grátis
   - Copie seu authtoken
   - Configure:
     ```bash
     ngrok config add-authtoken SEU_TOKEN_AQUI
     ```

3. **Iniciar backend** (Terminal 1):
   ```bash
   cd /Users/drpgjr.../NutriBuddy
   npm start
   ```

4. **Iniciar ngrok** (Terminal 2):
   ```bash
   ngrok http 3000
   ```

5. **Copiar URL do ngrok:**
   - Você verá algo como:
     ```
     Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:3000
     ```
   - **COPIE** a URL `https://abc123xyz.ngrok-free.app`

6. **Adicionar no N8N:**
   - Name: `API_URL`
   - Value: `https://abc123xyz.ngrok-free.app`

#### OPÇÃO B: Backend em Servidor/Cloud

Se o backend está hospedado (Railway, Render, Heroku, etc.):

1. **Pegue a URL pública** do seu backend
   - Exemplo: `https://nutribuddy-api.railway.app`
   - Ou: `https://nutribuddy-api.onrender.com`

2. **Adicionar no N8N:**
   - Name: `API_URL`
   - Value: `https://sua-url-aqui.com`

⚠️ **IMPORTANTE:** Não use `http://localhost:3000` - o N8N Cloud não consegue acessar localhost!

### 3.2 Adicionar no N8N

1. Clique em **"+ Add Variable"**
2. Preencha:

   **Name:**
   ```
   API_URL
   ```

   **Value:**
   ```
   https://sua-url-publica-aqui.com
   ```
   (Substitua pela URL real)

3. Clique em **"Save"**

### 3.3 Verificar Formato

A URL deve:
- ✅ Começar com `https://` (ou `http://` se for desenvolvimento local com ngrok)
- ✅ Não terminar com `/` (sem barra no final)
- ✅ Ser acessível publicamente

Exemplos corretos:
```
✅ https://abc123.ngrok-free.app
✅ https://nutribuddy-api.railway.app
✅ https://api.nutribuddy.com
```

Exemplos errados:
```
❌ http://localhost:3000
❌ https://abc123.ngrok-free.app/
❌ localhost:3000
```

---

## ✅ VERIFICAÇÃO FINAL

Após configurar todas as variáveis, você deve ver no N8N:

```
Environment Variables
├── FIREBASE_TOKEN ✅
│   └── Value: eyJhbGciOiJSUzI1NiIs... (token completo)
├── WEBHOOK_SECRET ✅
│   └── Value: nutribuddy-secret-2024
└── API_URL ✅
    └── Value: https://abc123.ngrok-free.app
```

---

## 🧪 TESTAR AS VARIÁVEIS

### Teste 1: Verificar se variáveis estão acessíveis

#### Opção A: Usando nó "Set" (Recomendado)

1. No seu workflow N8N, adicione um nó **"Set"**
2. Adicione campos com expressões para testar:
   ```
   Campo: teste_webhook
   Valor: {{$env.WEBHOOK_SECRET}}
   
   Campo: teste_api
   Valor: {{$env.API_URL}}
   
   Campo: teste_token
   Valor: {{$env.FIREBASE_TOKEN}}
   ```
3. Execute o nó
4. Se aparecer `undefined`, a variável não foi encontrada

#### Opção B: Usando nó "Code in JavaScript"

⚠️ **NOTA:** Se você receber erro "access to env vars denied", use a **Opção A** (nó Set) em vez desta!

1. No seu workflow N8N, adicione um nó **"Code in JavaScript"**
2. ⚠️ **IMPORTANTE:** Use `$env` diretamente (NÃO use `process.env`)
3. Adicione o código para testar:
   ```javascript
   return [
     {
       json: {
         WEBHOOK_SECRET: $env.WEBHOOK_SECRET,
         API_URL: $env.API_URL,
         FIREBASE_TOKEN: $env.FIREBASE_TOKEN,
       },
     },
   ];
   ```
4. Execute o nó
5. Se aparecer `undefined`, a variável não foi encontrada

**❌ ERRADO (não funciona):**
```javascript
// NÃO funciona - process não está definido no n8n
process.env.WEBHOOK_SECRET
```

**✅ CORRETO:**
```javascript
// Funciona - use $env diretamente
$env.WEBHOOK_SECRET
```

### Teste 2: Testar Webhook

1. Execute o workflow manualmente
2. Verifique os logs
3. Se houver erro de `access to env vars denied`, veja seção de problemas abaixo

---

## ⚠️ PROBLEMAS COMUNS

### "access to env vars denied"

**Problema:** O N8N Cloud está negando acesso às variáveis de ambiente em nós "Code in JavaScript", mesmo após configurar corretamente as variáveis.

**Erro comum:**
```
Error: access to env vars denied
TypeError: Cannot assign to read only property 'name'
```

**Causas possíveis (aplicam-se a TODOS os planos, incluindo Pro):**
1. **Plano Pro pode ter limitações** - O plano Pro pode ter algumas restrições de acesso a env vars em nós JavaScript (diferente de "Environments" que é Enterprise-only)
2. **Permissões de workspace** - Verifique se você tem permissões de administrador no workspace
3. **Workflow não está ativo/salvo** - Draft workflows podem ter restrições
4. **Versão do n8n** - Algumas versões podem ter bugs conhecidos com env vars em nós JavaScript
5. **Limitação intencional** - Pode ser uma limitação de segurança do plano Pro para código JavaScript customizado

**Soluções (tente nesta ordem):**

#### Solução 1: Verificar Configurações (Plano Pro)

1. **Verificar permissões de workspace:**
   - Acesse Settings → verifique se você tem acesso completo
   - No plano Pro, você deve ser Owner da conta
   - Se houver múltiplos workspaces, certifique-se de estar no correto

2. **Verificar se Environment Variables está acessível:**
   - Acesse Settings → Environment Variables (NÃO "Environments")
   - Certifique-se de que consegue ver e adicionar variáveis
   - Se não conseguir, verifique se está no plano Pro correto

3. **Verificar Environment Variables:**
   - Acesse Settings → Environment Variables
   - Verifique se cada variável tem:
     - Nome correto (exatamente como usado no workflow)
     - Valor preenchido
     - Status "Active" (se houver opção)

4. **Recarregue completamente o N8N:**
   - Feche todas as abas do N8N
   - Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete no Mac)
   - Faça logout e login novamente
   - Abra o workflow

5. **Verificar workflow:**
   - Certifique-se de que o workflow está **salvo e ativo** (não em draft)
   - Se estiver em modo "Draft", clique em "Save" e depois em "Activate"
   - Execute novamente

#### Solução 2: Usar Credenciais do N8N (Alternativa)

Se env vars não funcionarem, use **Credentials** do N8N:

1. **Settings → Credentials → "+ Create New"**
2. **Crie credenciais genéricas:**
   - Name: `NutriBuddy Config`
   - Type: `Generic Credential Type`
3. **Adicione campos:**
   ```
   WEBHOOK_SECRET: nutribuddy-secret-2024
   API_URL: https://sua-url.com
   FIREBASE_TOKEN: [token]
   ```
4. **Use no workflow:**
   - Em expressões: `{{$credentials.NutriBuddy Config.WEBHOOK_SECRET}}`
   - Em código JavaScript: `$credentials.get('NutriBuddy Config', 'WEBHOOK_SECRET')`

#### Solução 3: Hardcode Temporário (Apenas para Teste)

⚠️ **ATENÇÃO:** Use apenas para testes! NÃO use em produção.

1. **No nó "Code in JavaScript", substitua:**
   ```javascript
   // ❌ Não funciona (env vars negado)
   return [
     {
       json: {
         WEBHOOK_SECRET: $env.WEBHOOK_SECRET,
       },
     },
   ];
   ```

   ```javascript
   // ✅ Hardcode temporário para teste
   return [
     {
       json: {
         WEBHOOK_SECRET: 'nutribuddy-secret-2024',
         API_URL: 'https://sua-url.com',
         FIREBASE_TOKEN: 'seu-token-aqui',
       },
     },
   ];
   ```

2. **⚠️ LEMBRE-SE:** Remova os valores hardcoded após resolver o problema de env vars!

#### Solução 4: Passar Valores como Dados de Entrada

Se você está chamando o workflow via webhook ou manualmente, pode passar valores como dados:

1. **No início do workflow, adicione um nó "Set":**
   ```
   Campo: webhook_secret
   Valor: {{$json.body.webhook_secret || 'nutribuddy-secret-2024'}}
   
   Campo: api_url
   Valor: {{$json.body.api_url || 'https://sua-url.com'}}
   ```

2. **Use `$json.webhook_secret` no resto do workflow**

#### Solução 5: Verificar Versão e Configurações do N8N

1. **Verificar versão do n8n:**
   - A versão 1.118.1 (Cloud) que você está usando pode ter limitações conhecidas
   - Acesse Settings → About ou verifique no rodapé do N8N
   - Considere atualizar para a versão mais recente se disponível

2. **Verificar configurações de execução:**
   - Em alguns casos, o acesso a `$env` pode estar bloqueado por políticas de execução de código
   - Verifique Settings → Executions para ver se há restrições

3. **Contatar administrador do workspace (se aplicável):**
   - Se você não é o Owner do workspace, peça ao administrador para verificar:
     - Políticas de segurança que bloqueiam env vars em código JavaScript
     - Configurações de sandboxing de código
     - Permissões de acesso a variáveis de ambiente

#### Solução 6: Contactar Suporte N8N (Plano Pro)

No **plano Pro**, você também tem acesso ao suporte:

1. **Acesse:** https://n8n.io/support ou use o chat de suporte dentro do N8N
2. **Informe ao suporte:**
   - Você está no **plano Pro** (não Enterprise)
   - Versão: **1.118.1 (Cloud)**
   - Erro: `"access to env vars denied"` ao usar `$env.VARIAVEL` em nó "Code in JavaScript"
   - Erro completo: `TypeError: Cannot assign to read only property 'name'`
   - Você já tentou todas as soluções acima
   - Você consegue acessar "Environment Variables" em Settings (mas não "Environments" que é Enterprise-only)
3. **Peça verificação de:**
   - Se há uma limitação intencional do plano Pro para env vars em nós JavaScript
   - Se há um bug conhecido na versão 1.118.1
   - Qual é a diferença entre ter acesso a "Environment Variables" mas não conseguir usar em nós JavaScript
4. **Alternativa recomendada (use enquanto aguarda):**
   - Use nós "Set" com expressões `{{$env.VARIAVEL}}` (esta solução geralmente funciona no Pro)
   - Ou use Credentials do N8N conforme Solução 2

### "Não encontro 'Environment Variables' no Settings"

**Problema:** Você não encontra "Environment Variables" nas configurações do N8N.

**Possíveis causas:**
1. **Você está procurando "Environments" (plural)** - isso é diferente e apenas para Enterprise
2. **Está no plano errado** - Verifique se está realmente no plano Pro
3. **Localização diferente** - Pode estar em outro lugar no menu Settings

**Soluções:**

1. **Verifique o plano:**
   - Settings → Plan/Billing
   - Certifique-se de estar no **plano Pro** (não Starter/Free)

2. **Procure corretamente:**
   - Settings → **Environment Variables** (singular, não plural)
   - Ou: Settings → Variables
   - Ou: Settings → Configuration → Variables

3. **Se não encontrar:**
   - Verifique se está logado na conta correta
   - Recarregue a página completamente
   - Entre em contato com suporte do N8N para confirmar se seu plano Pro está configurado corretamente

**⚠️ Lembre-se:** "Environment Variables" ≠ "Environments"
- ✅ **Environment Variables** = Variáveis de config (Pro)  
- ❌ **Environments** = Múltiplos ambientes (apenas Enterprise)

### "process is not defined" (erro em nó JavaScript)

**Problema:** Você está tentando usar `process.env` em um nó "Code in JavaScript", mas o `process` não está disponível no contexto do n8n.

**Erro comum:**
```
ReferenceError: process is not defined [line X]
```

**Soluções:**
1. **NÃO use `process.env`** - isso não funciona no n8n
2. **Use `$env` diretamente** dentro de nós JavaScript:
   ```javascript
   // ❌ ERRADO
   process.env.WEBHOOK_SECRET
   
   // ✅ CORRETO
   $env.WEBHOOK_SECRET
   ```
3. Para expressões em outros nós (Set, HTTP Request, etc.), use: `{{$env.NOME_VARIAVEL}}`

### "WEBHOOK_SECRET is undefined"

**Problema:** A variável não está sendo encontrada.

**Soluções:**
1. Verifique o nome: deve ser exatamente `WEBHOOK_SECRET` (maiúsculas)
2. Verifique se salvou a variável corretamente
3. No workflow:
   - Em expressões: use `{{$env.WEBHOOK_SECRET}}`
   - Em código JavaScript: use `$env.WEBHOOK_SECRET` (sem `{{}}`)
4. Recarregue a página do N8N

### "API_URL não funciona"

**Problema:** O N8N não consegue acessar a URL do backend.

**Soluções:**
1. Verifique se a URL é pública (não localhost)
2. Teste a URL no navegador:
   ```
   https://sua-url.com/api/health
   ```
   Deve retornar: `{"status":"ok",...}`
3. Se usar ngrok, verifique se está rodando:
   ```bash
   ngrok http 3000
   ```
4. Se backend está em servidor, verifique se está online

### "ngrok URL muda toda vez"

**Problema:** URLs do ngrok free mudam a cada reinicialização.

**Soluções:**
1. **Plano Pago do ngrok:** URL fixa (mais fácil para produção)
2. **Atualizar manualmente:** Sempre que reiniciar ngrok, atualize `API_URL` no N8N
3. **Script automático:** Veja seção abaixo para script que atualiza automaticamente

---

## 🔄 ATUALIZAR API_URL AUTOMATICAMENTE (Opcional)

Se você usa ngrok e quer atualizar automaticamente, pode criar um script:

```javascript
// update-ngrok-url.js
const axios = require('axios');

// Pegar URL do ngrok via API local
async function getNgrokUrl() {
  try {
    const response = await axios.get('http://localhost:4040/api/tunnels');
    const httpsUrl = response.data.tunnels.find(t => t.proto === 'https');
    return httpsUrl?.public_url;
  } catch (error) {
    console.error('Erro ao obter URL do ngrok:', error.message);
    return null;
  }
}

// Atualizar no N8N (requer API do N8N)
async function updateN8NVariable(url) {
  // Implementar conforme API do N8N
  console.log('Atualizar API_URL para:', url);
}
```

**⚠️ Nota:** Isso requer API do N8N, que pode não estar disponível no plano grátis.

---

## 📝 CHECKLIST COMPLETO

Antes de testar o workflow completo, verifique:

- [ ] **FIREBASE_TOKEN** configurado (valor: token completo gerado)
- [ ] **WEBHOOK_SECRET** configurado (valor: `nutribuddy-secret-2024`)
- [ ] **API_URL** configurado (valor: URL pública do backend)
- [ ] Todas as variáveis foram salvas
- [ ] Backend está rodando
- [ ] Se usa ngrok, ngrok está rodando
- [ ] URL do backend é acessível publicamente
- [ ] Workflow está usando variáveis corretamente:
  - Em expressões: `{{$env.NOME_VARIAVEL}}`
  - Em código JavaScript: `$env.NOME_VARIAVEL` (não use `process.env`)

---

## 🚀 PRÓXIMOS PASSOS

Após configurar todas as variáveis:

1. ✅ **Teste o workflow** executando manualmente
2. ✅ **Verifique os logs** de cada nó
3. ✅ **Teste webhook** enviando dados de teste
4. ✅ **Confira se dados estão sendo salvos** no Firebase
5. ✅ **Veja `CORRIGIR-N8N-AGORA.md`** para ajustes finais

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `INSERIR-TOKEN-N8N.md` - Como configurar FIREBASE_TOKEN
- `NGROK-SETUP-AGORA.md` - Como configurar ngrok para expor backend
- `CORRIGIR-N8N-AGORA.md` - Ajustes finais do workflow
- `SETUP-N8N-CLOUD-COMPLETO.md` - Setup completo passo a passo

---

## 💡 RESUMO RÁPIDO

```bash
# 1. Variáveis necessárias no N8N:
FIREBASE_TOKEN = [token gerado com node generate-token.js]
WEBHOOK_SECRET = nutribuddy-secret-2024
API_URL = https://sua-url-publica.com

# 2. Configurar no N8N:
Settings → Environment Variables → + Add Variable

# 3. Para cada variável:
- Name: NOME_DA_VARIAVEL
- Value: valor_da_variavel
- Save

# 4. Usar no workflow:
# Em expressões (Set, HTTP Request, etc.):
{{$env.FIREBASE_TOKEN}}
{{$env.WEBHOOK_SECRET}}
{{$env.API_URL}}

# Em código JavaScript (nó "Code"):
$env.FIREBASE_TOKEN
$env.WEBHOOK_SECRET
$env.API_URL

# ❌ NÃO use process.env no n8n!
```

---

**🎉 Pronto! Todas as variáveis estão configuradas e o workflow está pronto para funcionar!**

