# 🔧 Fix Backend - Webhook Secret para N8N

## ❌ O Problema

O backend estava configurado para aceitar **APENAS** token Firebase em todas as rotas:

```javascript
router.use(verifyToken); // Requer Firebase token
```

Mas os workflows n8n enviam `x-webhook-secret`, não Firebase token! Por isso dava:

```
Route not found
The resource you are requesting could not be found
```

---

## ✅ A Solução

Criado middleware inteligente que:
- **Rotas `/webhook/*`** → Aceita `x-webhook-secret`
- **Outras rotas** → Requer Firebase token

### Código Atualizado (routes/messages.js)

```javascript
// Middleware para verificar webhook secret (apenas para rotas /webhook/*)
const verifyWebhookSecret = (req, res, next) => {
  // Se a rota começa com /webhook/, usa webhook secret
  if (req.path.startsWith('/webhook/')) {
    const secret = req.headers['x-webhook-secret'];
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authentication required'
      });
    }
    return next();
  }
  // Caso contrário, usa verificação de token normal
  return verifyToken(req, res, next);
};

// Aplicar middleware
router.use(verifyWebhookSecret);
```

---

## 🧪 Teste

Agora funciona:

```bash
curl http://localhost:3000/api/messages/webhook/conversation-context/test-123 \
  -H "x-webhook-secret: nutribuddy-secret-2024"
```

**Antes:** `Route not found` ❌  
**Agora:** `{"success":false,"error":"Conversa não encontrada"}` ✅ (endpoint funciona!)

---

## 🎯 Rotas Webhook Disponíveis

Todas essas rotas agora aceitam `x-webhook-secret`:

| Rota | Método | Descrição |
|------|--------|-----------|
| `/webhook/new-message` | POST | Receber notificação de nova mensagem |
| `/webhook/ai-response` | POST | IA enviar resposta automática |
| `/webhook/conversation-context/:id` | GET | Obter contexto para IA gerar sugestões |
| `/webhook/urgent-alert` | POST | Receber alerta de urgência |

---

## 🔄 Workflow 3 Agora Funciona!

O workflow 3 (Sugestões de Resposta) já pode buscar o contexto:

```
Webhook: Solicitar Sugestões
  ↓
Buscar Contexto da Conversa ✅ (agora funciona!)
  ↓
OpenAI: Gerar Sugestões
  ↓
Parse Sugestões
  ↓
Retornar Sugestões
```

---

## ⚠️ Importante

### Para Produção

Certifique-se que o `.env` tem:

```bash
WEBHOOK_SECRET=nutribuddy-secret-2024
```

E **NUNCA** commite este valor no git! Use o mesmo valor no:
- `.env` do backend
- Docker n8n (variável de ambiente)
- Workflows n8n (hardcoded)

### Segurança

Este middleware permite que:
- ✅ N8N acesse rotas `/webhook/*` com webhook secret
- ✅ Frontend/Apps acessem outras rotas com Firebase token
- ❌ Requisições sem autenticação sejam bloqueadas

---

## 🎉 Status Final

✅ Backend atualizado  
✅ Middleware de webhook secret funcionando  
✅ Endpoint `/webhook/conversation-context/:id` acessível  
✅ Workflow 3 pronto para uso!

**Agora teste o Workflow 3 novamente no n8n!** 🚀

