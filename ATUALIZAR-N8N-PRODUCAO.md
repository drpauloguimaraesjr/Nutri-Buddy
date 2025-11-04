# 🔄 Atualizar N8N para Produção

Depois de fazer deploy da API, você precisa atualizar o N8N para usar a URL online.

---

## 📋 Antes de Começar

Você deve ter:
- ✅ API hospedada (Railway/Render/Heroku)
- ✅ URL pública funcionando (ex: `https://nutribuddy-xxxx.up.railway.app`)
- ✅ N8N Cloud ou Self-hosted rodando

---

## 🔧 Para N8N Cloud

### Método 1: Via Variáveis de Ambiente (RECOMENDADO)

1. Acesse **https://app.n8n.io**
2. Clique em **Settings** (canto superior direito)
3. Vá em **Variables**
4. Procure pela variável `API_URL`
5. Se não existir, clique em **"Add Variable"**
6. Configure:
   - **Name**: `API_URL`
   - **Value**: `https://nutribuddy-xxxx.up.railway.app` (sua URL)
7. Clique em **Save**

### Método 2: Atualizar cada Workflow

1. Abra o workflow que precisa ser atualizado
2. Encontre todos os nós **HTTP Request**
3. Em cada nó, altere:
   - De: `http://localhost:3000`
   - Para: `https://nutribuddy-xxxx.up.railway.app`
4. Salve o workflow
5. Execute para testar

---

## 🔧 Para N8N Self-Hosted

### Via Interface Web

1. Acesse seu N8N (ex: `http://seu-servidor:5678`)
2. Siga os passos do Método 1 acima

### Via Variáveis de Ambiente do N8N

Se o N8N está rodando com Docker/Node:

```bash
# Editar docker-compose.yml ou variáveis
export API_URL="https://nutribuddy-xxxx.up.railway.app"
```

Reinicie o N8N:

```bash
# Docker
docker-compose restart

# Node direto
pm2 restart n8n
```

---

## 🧪 Como Testar

### 1. Testar API diretamente

```bash
# Substitua pela sua URL
curl https://nutribuddy-xxxx.up.railway.app/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2024-11-03T..."}
```

### 2. Testar no N8N

1. Abra um workflow no N8N
2. Encontre um nó HTTP Request que chama `/api/health`
3. Clique em **"Execute Workflow"**
4. Veja a resposta: deve estar **verde** ✅

### 3. Testar Webhook

```bash
curl -X POST https://nutribuddy-xxxx.up.railway.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu-secret-aqui" \
  -d '{
    "event": "test",
    "data": {"message": "Teste produção"}
  }'
```

Deve retornar:
```json
{"success":true,"message":"Webhook received"}
```

---

## 🔍 Verificar se está funcionando

### Sinais de que está OK:

- ✅ Logs do N8N não mostram erros de conexão
- ✅ Workflows executam com sucesso
- ✅ Dados aparecem no Firebase
- ✅ Resposta HTTP 200 (não 404 ou 502)

### Sinais de problema:

- ❌ Erro: "ECONNREFUSED" → URL incorreta
- ❌ Erro: "502 Bad Gateway" → API não está rodando
- ❌ Erro: "CORS policy" → Configure CORS no `.env`
- ❌ Erro: "401 Unauthorized" → Token expirado

---

## 🐛 Troubleshooting

### Problema: N8N não consegue conectar

**Solução:**
1. Verifique se a URL da API está correta
2. Teste a URL no navegador: deve abrir um JSON
3. Verifique logs do N8N para erros específicos

### Problema: CORS Error

**Solução:**
Na API hospedada, configure `.env`:
```env
CORS_ORIGIN=*
```

### Problema: 502 Bad Gateway

**Solução:**
1. Verifique logs da plataforma de hospedagem
2. Confirme que todas variáveis de ambiente estão corretas
3. Teste localmente primeiro

### Problema: Token expirado

**Solução:**
1. Gere novo token Firebase: `node generate-token.js`
2. Atualize no N8N Variables
3. Reinicie workflow

---

## 📊 Checklist Final

- [ ] API deployada e funcionando
- [ ] URL pública acessível via browser
- [ ] Health check respondendo OK
- [ ] N8N atualizado com nova URL
- [ ] Workflows testados e funcionando
- [ ] Logs sem erros
- [ ] Dados salvando no Firebase

---

## ✅ Pronto!

Agora seu N8N está conectado à API online! 🎉

Tudo funciona independente do seu computador.

---

**Dúvidas?** Veja: `DEPLOY-ONLINE-COMPLETO.md`

