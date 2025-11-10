# 🔐 Solução: Erro de Autenticação no Workflow 2

## ❌ O Problema

```
"The service refused the connection - perhaps it is offline"
```

**Causa Real:** A API está rejeitando porque **falta autenticação**!

```json
{"error":"No token provided",
 "message":"Authentication required"}
```

---

## ✅ SOLUÇÃO EM 2 PASSOS

### PASSO 1: Configurar WEBHOOK_SECRET no N8N

#### Opção A: Via Interface do N8N (Recomendado)

1. **No N8N, vá em Settings → Variables (ou Environment)**
2. **Adicione nova variável:**
   - **Name:** `WEBHOOK_SECRET`
   - **Value:** `seu-secret-aqui-123` (escolha um valor seguro)
3. **Salve**

#### Opção B: Via Docker (se estiver usando Docker)

No arquivo `docker-compose.yml` ou comando docker:

```yaml
environment:
  - WEBHOOK_SECRET=nutribuddy-secret-2024
```

Ou no comando:

```bash
docker run -d \
  -e WEBHOOK_SECRET=nutribuddy-secret-2024 \
  ...
```

#### Opção C: Via Linha de Comando (se rodando localmente)

```bash
export WEBHOOK_SECRET=nutribuddy-secret-2024
n8n start
```

---

### PASSO 2: Usar Workflow com Autenticação

#### A. Delete o workflow atual (sem auth)

#### B. Importe o novo workflow:

**Arquivo:** `n8n-workflows/2-analise-sentimento-openai-v3-auth.json`

Este workflow já inclui o header `x-webhook-secret` em todos os nós HTTP Request!

#### C. Vincule sua credencial OpenAI

1. Clique no nó "OpenAI: Analisar Mensagem"
2. Selecione sua credencial OpenAI
3. Salve

#### D. Teste!

Agora deve funcionar! 🎉

---

## 🧪 Testar

```bash
# No N8N: Execute Workflow

# Em outro terminal:
curl -X POST http://localhost:5678/webhook-test/nutribuddy-analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-auth-123",
    "messageId": "msg-auth-123",
    "patientName": "João",
    "content": "Estou com dor urgente!"
  }'
```

**Resultado esperado:**
- ✅ Todos os nós executam sem erro
- ✅ API aceita a requisição
- ✅ Dados são atualizados

---

## 🔍 Como Funciona

### Antes (SEM autenticação):
```
N8N → http://localhost:3000/api/...
      ❌ 401 Unauthorized
```

### Depois (COM autenticação):
```
N8N → http://localhost:3000/api/...
      Header: x-webhook-secret: seu-secret
      ✅ 200 OK
```

---

## 📊 O que Mudou no Workflow

### Antes:
```json
{
  "authentication": "none"
}
```

### Agora:
```json
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "headerParameters": {
    "parameters": [{
      "name": "x-webhook-secret",
      "value": "={{$env.WEBHOOK_SECRET}}"
    }]
  }
}
```

Todos os 3 nós HTTP Request agora incluem o header de autenticação! ✅

---

## ⚙️ Configurar WEBHOOK_SECRET no Backend

Se você ainda não tem, adicione no `.env` do backend:

```bash
# /Users/drpgjr.../NutriBuddy/.env

WEBHOOK_SECRET=nutribuddy-secret-2024
```

**IMPORTANTE:** Use o **MESMO valor** no N8N e no backend!

---

## ❌ Problemas Comuns

### Erro: "No token provided"

**Causa:** WEBHOOK_SECRET não configurado no N8N

**Solução:**
1. Configure a variável no N8N
2. Reinicie o N8N se necessário
3. Reimporte o workflow

### Erro: "Invalid webhook secret"

**Causa:** Valores diferentes no N8N e backend

**Solução:**
1. Verifique o valor no `.env` do backend
2. Use EXATAMENTE o mesmo valor no N8N
3. Sem espaços extras!

### Erro: Variável não encontrada

**Causa:** Sintaxe incorreta `{{$env.WEBHOOK_SECRET}}`

**Solução:**
- Use workflow v3-auth que já tem a sintaxe correta
- Ou edite manualmente: `={{$env.WEBHOOK_SECRET}}` (com `=` no início)

---

## 🎯 Verificar se Está Funcionando

### 1. Testar variável no N8N:

Crie um workflow de teste:
1. Adicione nó "Code"
2. Cole: `return { json: { secret: process.env.WEBHOOK_SECRET } };`
3. Execute
4. Deve mostrar o valor do secret

### 2. Testar com curl:

```bash
curl -X PATCH http://localhost:3000/api/messages/conversations/test-123 \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: seu-secret-aqui-123" \
  -d '{"tags": ["teste"]}'
```

Deve retornar sucesso (ou erro de "conversation not found", mas sem erro de auth).

---

## ✅ Checklist Final

- [ ] WEBHOOK_SECRET configurado no N8N
- [ ] WEBHOOK_SECRET configurado no backend (.env)
- [ ] MESMOS valores em ambos
- [ ] Workflow v3-auth importado
- [ ] Credencial OpenAI vinculada
- [ ] Servidor backend rodando (porta 3000)
- [ ] Teste executado com sucesso
- [ ] Nenhum erro de autenticação
- [ ] Workflow ativado

---

## 🚀 Resumo

**Problema:** API rejeitava requisições sem autenticação

**Solução:**
1. Configure `WEBHOOK_SECRET` no N8N
2. Use workflow `2-analise-sentimento-openai-v3-auth.json`
3. Pronto! ✅

---

## 📚 Arquivos Disponíveis

| Arquivo | Auth | Status |
|---------|------|--------|
| `2-analise-sentimento.json` | ❌ Sem | Versão antiga |
| `2-analise-sentimento-openai.json` | ❌ Sem | Não funciona |
| `2-analise-sentimento-openai-v2.json` | ❌ Sem | IF corrigido, sem auth |
| `2-analise-sentimento-openai-v3-auth.json` | ✅ Com | **USE ESTE!** |
| `2-analise-sentimento-simples.json` | ❌ Sem | Versão gratuita |

---

**RECOMENDAÇÃO:** Use `2-analise-sentimento-openai-v3-auth.json` + configure WEBHOOK_SECRET

**Pronto para funcionar 100%!** 🎉
