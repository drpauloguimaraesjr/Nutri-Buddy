# 🎓 Guia Completo N8N Cloud - Passo a Passo para Iniciantes

## 📚 O que é N8N?

**N8N** é uma ferramenta de automação que conecta diferentes serviços. Pense nele como um "robô" que faz tarefas automaticamente quando você pede.

**Exemplo prático:** Quando alguém envia dados de nutrição para seu backend, o N8N recebe esses dados, processa e salva no Firebase automaticamente.

---

## 🎯 O que você vai fazer

Você vai configurar um **"workflow"** (fluxo de trabalho) que:
1. Recebe dados via webhook (como uma "caixa de correio" online)
2. Envia esses dados para seu backend NutriBuddy
3. Salva no Firebase automaticamente

---

## 📋 PASSO 1: Entrar no N8N Cloud

### 1.1 Acessar o N8N

1. Abra seu navegador (Chrome, Firefox, Safari, etc.)
2. Vá para: **https://app.n8n.cloud**
3. Faça login com a conta que você criou

✅ **Pronto para começar!**

---

## 📋 PASSO 2: Importar o Workflow

### 2.1 Importar o Workflow

1. No menu lateral, clique em **"Workflows"**
2. Clique em **"+ New"**
3. Clique nos **3 pontinhos** (...) no canto superior direito
4. Selecione **"Import from File"**
5. Escolha o arquivo **`N8N-WORKFLOW.json`** do seu projeto NutriBuddy
6. Clique em **"Open"**

✅ **Workflow importado!**

---

## 📋 PASSO 3: Configurar Variáveis de Ambiente

### ⚠️ IMPORTANTE: Limitação de Planos

**Variáveis de Ambiente no N8N Cloud estão disponíveis APENAS no plano Empresarial.**

Se você está usando o plano **Gratuito** ou **Básico**, você NÃO terá acesso a "Environment Variables" no menu Settings.

**Para planos sem variáveis de ambiente, veja a seção 3.3 abaixo (Alternativa para Planos Gratuitos).**

---

### 3.2 Adicionar as Variáveis (Apenas Plano Empresarial)

1. No menu lateral, clique em **"Settings"** → **"Environment Variables"**
2. Adicione 3 variáveis:
   - **WEBHOOK_SECRET:** Valor do arquivo `.env` do backend (ou crie: `nutribuddy-secret-2024`)
   - **FIREBASE_TOKEN:** Token do Firebase (veja seção abaixo)
   - **API_URL:** URL pública do backend (Railway, Render, etc. - **não use localhost**)
3. Clique em **"Save"** para cada variável

✅ **Você deve ter 3 variáveis configuradas agora!**

---

### 3.3 Atualizar os Nós (MÉTODO FÁCIL - Import cURL) ⭐ RECOMENDADO

**🎯 MÉTODO MAIS FÁCIL: Usar Import cURL!**

Esta é a forma mais simples e rápida de configurar os nós. O N8N configura automaticamente tudo (URL, headers, método) quando você importa um comando cURL.

#### ⚠️ IMPORTANTE: Configurar WEBHOOK_SECRET no Railway primeiro!

Antes de configurar os nós, você precisa:
1. No Railway → Variables → Adicionar `WEBHOOK_SECRET=nutribuddy-secret-2024`
2. Aguardar o deploy terminar (~1-2 minutos)

#### Como configurar cada nó:

1. **Clique no nó HTTP Request** para abrir
2. **Clique no botão "Import cURL"** (geralmente abaixo do campo URL)
3. **Cole o comando cURL** correspondente (veja comandos abaixo)
4. **Clique em "Import"**
5. **O N8N configura automaticamente** tudo!
6. **Salve o nó**

#### 📋 Comandos cURL Prontos (Substitua pela sua URL do Railway):

**Buscar Nutrição:**
```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

**Salvar Nutrição:**
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"calories": 2000, "protein": 150, "carbs": 200, "fats": 80}'
```

**Salvar Refeição:**
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/meals' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"type": "breakfast", "calories": 500}'
```

**HTTP Request - NutriBuddy API (Webhook):**
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/webhook' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"event": "nutrition_update", "data": {}}'
```

**Health Check:**
```bash
curl 'https://web-production-c9eaf.up.railway.app/api/health'
```

**⚠️ IMPORTANTE:** Substitua `web-production-c9eaf.up.railway.app` pela URL do seu backend no Railway!

**📚 Veja `COMANDOS-CURL-N8N.md` para todos os comandos prontos!**

---

## 📋 PASSO 4: Verificar e Testar

**📌 Nota:** Se você já usou o Import cURL na seção 3.3, os nós já estão configurados corretamente!

### Verificar se está tudo certo:

1. **Abra cada nó HTTP Request** no workflow
2. **Verifique se:**
   - ✅ URL está apontando para seu Railway (não `localhost`)
   - ✅ Header `x-webhook-secret` está configurado
   - ✅ Método HTTP está correto (GET ou POST)

✅ **Se tudo estiver correto, você está pronto para testar!**

---

## 📋 PASSO 5: Salvar o Workflow

1. No canto superior direito, clique em **"Save"** (Salvar)
2. Se pedir um nome, use: **"NutriBuddy API Integration"**
3. Adicione uma descrição se quiser (opcional)

✅ **Workflow salvo!**

---

## 📋 PASSO 6: Ativar o Workflow

1. No canto superior direito, clique no toggle **"Inactive"** para mudar para **"Active"**
2. Clique em **"Save"**

✅ **Workflow ativo!**

---

## 📋 PASSO 7: Obter a URL do Webhook

1. No workflow, clique no bloco **"Webhook - Receber Dados"**
2. Copie a URL que aparece (exemplo: `https://seu-nome.app.n8n.cloud/webhook/webhook-nutribuddy`)
3. **Guarde essa URL!** Você vai usar ela no seu backend

✅ **URL copiada!**

---

## 📋 PASSO 8: Testar o Workflow

1. No workflow, clique no bloco **"Manual Trigger"**
2. Clique em **"Execute Node"**
3. Verifique se todos os blocos ficaram verdes ✅

### 8.2 Teste via Webhook

Você pode testar enviando dados para a URL do webhook usando **Postman**, **Insomnia** ou `curl`.

---

## 🔧 Autenticação: Usar Webhook Secret (RECOMENDADO) ⭐

**Para planos Gratuito/Básico do N8N, use webhook secret em vez de token Firebase!**

### Por que usar Webhook Secret?

- ✅ **Muito mais simples** - não precisa gerar tokens
- ✅ **Não expira** - funciona sempre
- ✅ **Mais seguro** para server-to-server
- ✅ **Funciona perfeitamente** no N8N

### Como configurar:

1. **No Railway:** Adicione variável `WEBHOOK_SECRET=nutribuddy-secret-2024`
2. **No N8N:** Use header `x-webhook-secret: nutribuddy-secret-2024` em todos os nós
3. **Use Import cURL** (veja seção 3.3) - é muito mais fácil!

**📚 Veja `COMANDOS-CURL-N8N.md` para todos os comandos prontos!**

---

## 🌐 Como Expor Backend Localmente (ngrok)

Para testes locais, você pode usar ngrok para expor seu backend:

1. Instale ngrok: https://ngrok.com/download
2. Crie conta gratuita e copie o token
3. Configure: `ngrok config add-authtoken SEU_TOKEN`
4. Inicie o backend: `npm start`
5. Em outro terminal: `ngrok http 3000`
6. Copie a URL `https://xxxxx.ngrok.io` e use no `API_URL`

⚠️ **Nota:** A URL muda a cada reinício. Para produção, use Railway ou Render.

---

## ✅ Checklist Final

- [ ] Workflow importado no N8N Cloud
- [ ] Variáveis configuradas (Empresarial) ou valores inseridos nos nós (Gratuito/Básico)
- [ ] URLs atualizadas (não usar localhost)
- [ ] Workflow salvo e ativado
- [ ] URL do webhook copiada
- [ ] Teste executado com sucesso
- [ ] Backend acessível publicamente

---

## 🎉 Pronto!

Agora seu N8N está configurado e funcionando! 

**O que acontece agora:**
1. Alguém envia dados para o webhook do N8N
2. O N8N recebe e processa
3. O N8N envia para seu backend
4. O backend salva no Firebase
5. Tudo automático! 🚀

---

## 🆘 Problemas Comuns

### "Cannot connect to localhost"

**Solução:** Use uma URL pública (Railway, Render ou ngrok) no `API_URL`

### "Invalid webhook secret"

**Solução:** Verifique se o `WEBHOOK_SECRET` no N8N é igual ao do backend `.env`

### "Firebase token invalid"

**Solução:** Gere um novo token do Firebase

### "Workflow não está ativo"

**Solução:** Clique no toggle no canto superior direito para ativar

---

## 📚 Próximos Passos

1. **Integrar com o backend:** Configure seu backend para enviar dados para o webhook do N8N
2. **Monitorar execuções:** Veja "Executions" no N8N para ver o histórico
3. **Adicionar mais workflows:** Crie novos workflows para outras automações
4. **Configurar alertas:** Configure notificações quando workflows falharem

---

**🎓 Parabéns! Você configurou o N8N Cloud do zero!** 🎉

Se tiver dúvidas, consulte a documentação do N8N: https://docs.n8n.io

