# 🚀 DEPLOY NO RAILWAY - Z-API WHATSAPP

## 📋 **CHECKLIST PRÉ-DEPLOY**

Antes de fazer deploy, certifique-se:

- [ ] Conta Z-API criada
- [ ] Instância WhatsApp conectada
- [ ] INSTANCE_ID e TOKEN copiados
- [ ] Código backend atualizado (ZAPI-BACKEND-CODE.js)

---

## 📦 **PASSO 1: ATUALIZAR PACKAGE.JSON**

No seu projeto backend, adicione a dependência Axios (opcional):

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "express": "^4.18.0",
    "firebase-admin": "^12.0.0"
  }
}
```

Ou execute:
```bash
npm install axios
```

⚠️ **Nota:** Axios é opcional. Pode usar `fetch` nativo do Node.js 18+

---

## 📋 **PASSO 2: ADICIONAR CÓDIGO Z-API**

1. **Copiar o arquivo `ZAPI-BACKEND-CODE.js`**
2. **Integrar ao seu backend existente:**

```javascript
// No seu server.js ou app.js principal

// Importar código Z-API
const {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  checkZApiStatus
} = require('./zapi-integration');

// OU copiar as funções diretamente
```

3. **Adicionar as rotas:**
   - `POST /api/whatsapp/send`
   - `POST /api/webhooks/zapi-whatsapp`
   - `GET /api/whatsapp/pending-messages`
   - `POST /api/whatsapp/send-pending`
   - `GET /api/whatsapp/status`
   - `POST /api/whatsapp/send-buttons` (opcional)

---

## 📋 **PASSO 3: CONFIGURAR VARIÁVEIS NO RAILWAY**

### **3.1. Acessar Railway:**
```
1. https://railway.app
2. Login
3. Selecionar projeto backend (web-production-c9eaf)
4. Aba "Variables"
```

### **3.2. Adicionar variáveis Z-API:**

```env
# Z-API WhatsApp (ADICIONAR)
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io
```

⚠️ **Substitua com suas credenciais reais do Z-API Dashboard!**

**Como encontrar:**
1. Z-API Dashboard
2. Sua instância
3. Menu "Detalhes" ou "API"
4. Copiar Instance ID e Token

### **3.3. Remover variáveis Evolution antigas:**

Remover (não precisa mais):
```env
EVOLUTION_API_URL
EVOLUTION_INSTANCE_NAME
EVOLUTION_API_KEY
```

### **3.4. Variáveis finais:**

Seu Railway deve ter (no mínimo):
```env
# Firebase
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
GOOGLE_APPLICATION_CREDENTIALS=...

# Z-API WhatsApp
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io

# Security
X_WEBHOOK_SECRET=nutribuddy-secret-2024

# Outras variáveis do seu projeto...
```

---

## 📋 **PASSO 4: COMMIT E PUSH**

### **4.1. Commit das mudanças:**

```bash
cd /caminho/do/seu/backend

# Ver arquivos modificados
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: Migrar de Evolution para Z-API WhatsApp"

# Push
git push origin main
```

### **4.2. Railway faz deploy automático:**

```
1. Railway detecta push no GitHub
2. Inicia build automático
3. Instala dependências (npm install)
4. Aguarde 2-5 minutos
5. Verifique logs no Railway Dashboard
```

---

## 📋 **PASSO 5: VERIFICAR DEPLOY**

### **5.1. Health Check:**

```bash
curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status
```

Resposta esperada:
```json
{
  "service": "NutriBuddy WhatsApp Z-API",
  "status": "active",
  "zapiConfigured": true,
  "zapiConnected": true,
  "instanceId": "12345",
  "phone": "5511999999999"
}
```

✅ Se `zapiConfigured: true` e `zapiConnected: true` → Tudo certo!

### **5.2. Ver logs no Railway:**

```
1. Railway Dashboard
2. Seu projeto backend
3. Aba "Deployments"
4. Último deployment
5. Ver logs
```

Procure por:
```
✅ Z-API configured
✅ WhatsApp endpoints ready
✅ Server running on port 3000
```

---

## 📋 **PASSO 6: CONFIGURAR WEBHOOK NO Z-API**

Depois do deploy bem-sucedido:

### **6.1. Acessar Z-API Dashboard:**
```
1. https://z-api.io (fazer login)
2. Clicar na sua instância
3. Menu lateral → "Webhooks"
```

### **6.2. Configurar webhook:**

```
1. Ativar: "Mensagens recebidas" (message-received)
2. URL: https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp
3. Método: POST
4. Salvar
```

### **6.3. Testar webhook:**
```
1. No Z-API Dashboard, clicar "Testar Webhook"
2. Ver logs no Railway
3. Deve aparecer: "📩 Webhook Z-API recebido"
```

✅ Agora Z-API vai chamar seu backend quando receber mensagens!

---

## 📋 **PASSO 7: TESTAR INTEGRAÇÃO**

### **7.1. Teste 1: Enviar mensagem**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -d '{
    "to": "5511999999999",
    "message": "🎉 Teste Z-API NutriBuddy!"
  }'
```

✅ Deve receber mensagem no WhatsApp em ~1 segundo!

### **7.2. Teste 2: Receber mensagem**

```
1. No seu WhatsApp
2. Enviar mensagem para o número conectado na Z-API
3. Ver logs no Railway
4. Procurar: "📩 Webhook Z-API recebido"
```

✅ Deve aparecer no log do Railway!

### **7.3. Teste 3: Mensagem pendente**

```
1. Criar mensagem pendente no Firestore:
   - Collection: whatsappMessages
   - Campos:
     * patientId: "id-paciente-real"
     * content: "Teste de mensagem automática"
     * sent: false
     * timestamp: [agora]

2. Aguardar 30 segundos (workflow N8N roda)

3. Verificar:
   - Mensagem chega no WhatsApp do paciente ✅
   - Campo "sent" muda para true no Firestore ✅
```

### **7.4. Teste 4: Ver no Dashboard Z-API**

```
1. Z-API Dashboard → Sua instância
2. Menu "Mensagens"
3. Ver todas mensagens enviadas/recebidas
4. Status: enviado, entregue, lido
```

✅ Todas mensagens devem aparecer lá!

---

## 📋 **PASSO 8: IMPORTAR WORKFLOWS N8N**

### **8.1. Desativar workflows Evolution antigos:**

```
N8N → Workflows:
- Evolution: Receber Mensagens → Desativar (toggle OFF)
- Evolution: Enviar Mensagens → Desativar (toggle OFF)
- Evolution: Atualizar Score → Manter ativo (não depende de Evolution)
```

### **8.2. Importar workflow Z-API:**

```
1. N8N → Add workflow
2. Import from File
3. Selecionar: ZAPI-1-ENVIAR-MENSAGENS.json
4. Importar
5. Salvar
6. Ativar (toggle ON)
```

### **8.3. Testar workflow:**

```
1. Criar mensagem pendente no Firestore (sent: false)
2. Aguardar 30 segundos
3. Verificar:
   - Workflow executou (ver N8N → Executions)
   - Mensagem enviada via Z-API
   - Campo "sent" = true no Firestore
```

---

## ✅ **CHECKLIST FINAL**

Após todos os passos:

### **Backend:**
- [ ] Código Z-API integrado
- [ ] Dependência axios instalada (opcional)
- [ ] Variáveis ZAPI_* configuradas no Railway
- [ ] Deploy realizado com sucesso
- [ ] Health check retorna `zapiConfigured: true`
- [ ] Health check retorna `zapiConnected: true`

### **Z-API:**
- [ ] Webhook configurado com URL do backend
- [ ] Webhook testado e funcionando
- [ ] WhatsApp conectado (bolinha verde)

### **Testes:**
- [ ] Teste de envio funcionando
- [ ] Teste de recebimento funcionando
- [ ] Mensagem aparece no Dashboard Z-API
- [ ] Webhook chega no backend (logs Railway)

### **N8N:**
- [ ] Workflow Z-API importado e ativado
- [ ] Workflows Evolution antigos desativados
- [ ] Teste de mensagem pendente OK

### **Limpeza:**
- [ ] Variáveis Evolution removidas
- [ ] Render desativado/deletado (se quiser)
- [ ] Evolution pode ser desativado

---

## 🎉 **PRONTO! Z-API FUNCIONANDO!**

Agora você tem:
- ✅ WhatsApp conectado via Z-API
- ✅ Envia para qualquer número imediatamente
- ✅ Webhooks estáveis e confiáveis
- ✅ Dashboard profissional
- ✅ Suporte brasileiro
- ✅ Muito mais estável que Evolution

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "zapiConfigured: false"**
**Solução:**
1. Verificar variáveis no Railway (ZAPI_INSTANCE_ID, ZAPI_TOKEN)
2. Variáveis estão corretas?
3. Fazer redeploy
4. Ver logs do Railway

### **Erro: "zapiConnected: false"**
**Solução:**
1. Z-API Dashboard → Ver status da instância
2. WhatsApp desconectou?
3. Escanear QR Code novamente
4. Aguardar 1 minuto e testar novamente

### **Mensagem não envia:**
**Solução:**
1. Verificar se instância está "Conectada" (bolinha verde)
2. Número está no formato correto? `5511999999999` (sem +)
3. Ver logs no Dashboard Z-API → Mensagens
4. Ver logs do backend no Railway

### **Webhook não recebe mensagens:**
**Solução:**
1. URL do webhook no Z-API está correta?
2. Endpoint `/api/webhooks/zapi-whatsapp` está respondendo?
3. Ver logs no Railway quando enviar mensagem de teste
4. Testar webhook no Dashboard Z-API

### **Build error no Railway:**
**Solução:**
1. Ver logs do build no Railway
2. Dependências instaladas? `npm install`
3. Erro de sintaxe no código?
4. Verificar package.json

---

## 📊 **MONITORAMENTO**

### **No Z-API Dashboard:**
```
- Ver todas mensagens enviadas/recebidas
- Status de entrega (enviado/entregue/lido)
- Estatísticas de uso
- Logs de erro
- Status da conexão WhatsApp
```

### **No Railway:**
```
- Ver logs em tempo real
- Monitorar CPU/RAM
- Ver requests HTTP
- Alertas de erro
```

### **No N8N:**
```
- Ver execuções do workflow
- Verificar erros
- Ver quantas mensagens foram processadas
```

---

## 💰 **CUSTOS**

### **Z-API:**
- Trial: Grátis 7 dias
- Start: R$70/mês (1.000 mensagens)
- Basic: R$100/mês (5.000 mensagens)

### **Railway:**
- Grátis até $5/mês de uso
- Depois: ~$5-10/mês

### **Total estimado:**
- **R$70-80/mês** (Z-API Start + Railway)

**Muito mais estável que Evolution grátis! Vale a pena! 🎉**

---

## 📞 **PRÓXIMOS PASSOS**

1. ✅ Backend Z-API funcionando (este guia)
2. ⏳ Testar com pacientes reais
3. ⏳ Monitorar primeiros dias
4. ⏳ Upgrade plano Z-API se necessário
5. ⏳ Adicionar features extras (botões, imagens, etc)

**Qualquer dúvida, me chame! 🚀**

---

## 📚 **RECURSOS Z-API**

### **Documentação:**
- API Reference: https://developer.z-api.io
- Exemplos: https://developer.z-api.io/examples
- FAQ: https://z-api.io/faq

### **Suporte:**
- WhatsApp: (disponível no Dashboard)
- Email: contato@z-api.io
- Horário: Seg-Sex 9h-18h

---

**Parabéns! Deploy Z-API completo! 🎉**

Agora é só usar e aproveitar a estabilidade! 🚀



