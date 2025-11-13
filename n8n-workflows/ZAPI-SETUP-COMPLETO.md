# 🚀 Z-API WHATSAPP - GUIA COMPLETO DE SETUP

## ✅ **POR QUE Z-API É MELHOR PARA VOCÊ?**

- ✅ **Funciona IMEDIATAMENTE** (sem aprovação Meta)
- ✅ Empresa **brasileira** com suporte em português
- ✅ Pagamento em **Reais** (PIX/Boleto/Cartão)
- ✅ **Muito estável** e confiável
- ✅ Setup em **5 minutos**
- ✅ Envia para **qualquer número** desde o início
- ✅ API simples e bem documentada
- ✅ Dashboard profissional

---

## 📋 **PASSO 1: CRIAR CONTA Z-API (3 minutos)**

### **1.1. Acessar site:**
```
https://z-api.io
```

### **1.2. Clicar em "Começar Grátis" ou "Criar Conta"**

### **1.3. Preencher cadastro:**
```
- Nome completo
- Email
- Telefone
- Senha
- Aceitar termos
```

### **1.4. Verificar email:**
```
1. Abrir email de confirmação
2. Clicar no link de verificação
3. Login automático
```

---

## 📋 **PASSO 2: CRIAR INSTÂNCIA WHATSAPP (2 minutos)**

### **2.1. No Dashboard Z-API:**
```
1. Após login, clicar em "Nova Instância"
2. Escolher nome: "nutribuddy" ou "nutribuddy-producao"
3. Clicar em "Criar"
```

### **2.2. Aguardar criação:**
```
Leva ~30 segundos para criar a instância
```

### **2.3. Copiar credenciais:**

Vai aparecer 3 informações importantes:

```
INSTANCE_ID: exemplo: 12345
INSTANCE_TOKEN: exemplo: ABC123XYZ789
WEBHOOK_URL: https://api.z-api.io/instances/12345/token/ABC123XYZ789
```

⚠️ **IMPORTANTE:** Guarde essas credenciais! Vamos usar no backend!

---

## 📋 **PASSO 3: CONECTAR WHATSAPP (1 minuto)**

### **3.1. Escanear QR Code:**

No Dashboard Z-API:
```
1. Clicar na instância criada
2. Clicar em "Conectar WhatsApp"
3. QR Code aparece na tela
4. Abrir WhatsApp no celular
5. Menu ⋮ → Aparelhos conectados
6. Escanear QR Code
7. ✅ Conectado!
```

### **3.2. Verificar conexão:**
```
Status deve aparecer: "Conectado" (bolinha verde)
```

✅ **Pronto! WhatsApp conectado e funcionando!**

---

## 📋 **PASSO 4: ESCOLHER PLANO (2 minutos)**

### **4.1. Planos disponíveis:**

| Plano | Mensagens/mês | Preço | Recomendado para |
|-------|---------------|-------|------------------|
| **Start** | 1.000 | R$70/mês | Começar (até 30 pacientes) |
| **Basic** | 5.000 | R$100/mês | Crescimento (até 150 pacientes) |
| **Pro** | 20.000 | R$150/mês | Produção (até 600 pacientes) |
| **Enterprise** | Ilimitado | Consultar | Grande escala |

### **4.2. Minha recomendação:**
```
Começar com GRÁTIS (trial 7 dias)
   ↓
Depois: Plano START (R$70/mês)
   ↓
Crescendo: Upgrade para BASIC (R$100/mês)
```

### **4.3. Como contratar:**
```
1. Dashboard Z-API → Minha Conta → Planos
2. Selecionar plano
3. Escolher forma de pagamento:
   - PIX (instantâneo)
   - Boleto
   - Cartão de crédito
4. Confirmar pagamento
```

---

## 📋 **PASSO 5: CONFIGURAR WEBHOOK (3 minutos)**

O webhook permite que Z-API envie mensagens recebidas para seu backend.

### **5.1. No Dashboard Z-API:**
```
1. Clicar na sua instância
2. Menu lateral → "Webhooks"
3. Ativar "Mensagens recebidas"
```

### **5.2. Configurar URL do webhook:**

```
URL: https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp
Method: POST
```

### **5.3. Configurar eventos:**

Marcar estes checkboxes:
- ✅ **message-received** (mensagens recebidas)
- ✅ **message-ack** (confirmação de entrega)
- ⬜ Outros (opcional)

### **5.4. Salvar:**
```
Clicar em "Salvar Webhooks"
```

---

## 📋 **PASSO 6: TESTAR CONEXÃO (2 minutos)**

### **6.1. Enviar mensagem teste:**

No Dashboard Z-API:
```
1. Ir em "Enviar Mensagem"
2. Número destino: seu celular pessoal (+5511999999999)
3. Mensagem: "Teste Z-API NutriBuddy!"
4. Clicar "Enviar"
```

### **6.2. Verificar:**
```
✅ Mensagem deve chegar no seu WhatsApp em ~1 segundo!
```

### **6.3. Responder:**
```
1. Responder a mensagem no WhatsApp
2. Ver no Dashboard Z-API → "Mensagens Recebidas"
3. Sua resposta deve aparecer lá
```

✅ **Se funcionou: está tudo certo!**

---

## 📋 **PASSO 7: COPIAR CREDENCIAIS PARA O BACKEND**

Você vai precisar destas 3 informações:

### **7.1. Encontrar no Dashboard Z-API:**

```
1. Dashboard → Sua instância
2. Menu → "Detalhes" ou "API"
```

### **7.2. Copiar:**

```bash
ZAPI_INSTANCE_ID=12345
ZAPI_TOKEN=ABC123XYZ789
ZAPI_BASE_URL=https://api.z-api.io
```

⚠️ **Guarde essas credenciais!** Vamos usar no Railway!

---

## 📋 **RESUMO DAS CREDENCIAIS**

Anote aqui suas credenciais:

```
┌─────────────────────────────────────────┐
│ Z-API CREDENTIALS - NUTRIBUDDY          │
├─────────────────────────────────────────┤
│                                         │
│ ZAPI_INSTANCE_ID: _________________     │
│                                         │
│ ZAPI_TOKEN: ___________________________│
│                                         │
│ ZAPI_BASE_URL: https://api.z-api.io    │
│                                         │
│ Webhook URL (backend):                  │
│ https://web-production-c9eaf           │
│ .up.railway.app/api/webhooks/          │
│ zapi-whatsapp                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ **CHECKLIST - SETUP Z-API COMPLETO**

- [ ] Conta Z-API criada
- [ ] Email verificado
- [ ] Instância WhatsApp criada
- [ ] QR Code escaneado
- [ ] WhatsApp conectado (bolinha verde)
- [ ] Plano escolhido (ou trial ativo)
- [ ] Webhook configurado com URL do backend
- [ ] Mensagem teste enviada e recebida
- [ ] Resposta teste recebida
- [ ] Credenciais copiadas (INSTANCE_ID e TOKEN)

---

## 🎉 **PRONTO! Z-API CONFIGURADO!**

Agora você tem:
- ✅ WhatsApp conectado e funcionando
- ✅ Pode enviar para qualquer número IMEDIATAMENTE
- ✅ Webhook configurado para receber mensagens
- ✅ Credenciais prontas para o backend

---

## 📊 **RECURSOS Z-API**

### **Dashboard:**
```
- Ver todas as mensagens enviadas/recebidas
- Status de entrega (enviado/entregue/lido)
- Estatísticas de uso
- Logs de erro
- Gerenciar webhooks
```

### **API REST:**
```
- Enviar texto
- Enviar imagem
- Enviar documento
- Enviar áudio
- Enviar localização
- Criar grupos
- Adicionar participantes
- E muito mais!
```

### **Documentação:**
```
https://developer.z-api.io/
```

---

## 🐛 **TROUBLESHOOTING**

### **QR Code não aparece:**
**Solução:**
1. Aguardar 30 segundos
2. Recarregar página
3. Clicar em "Gerar novo QR Code"

### **"Desconectado" após escanear:**
**Solução:**
1. Verificar se celular está com internet
2. WhatsApp atualizado?
3. Tentar gerar novo QR Code

### **Mensagem não envia:**
**Solução:**
1. Verificar se instância está "Conectada"
2. Número está no formato correto? +5511999999999
3. Ver logs no Dashboard Z-API

### **Webhook não recebe:**
**Solução:**
1. Verificar URL do webhook está correta
2. Backend está no ar? (testar health check)
3. Ver logs no Dashboard Z-API → Webhooks → Tentativas

---

## 💰 **CUSTOS Z-API**

### **Mensalidade:**
- Start: R$70/mês (1.000 mensagens)
- Basic: R$100/mês (5.000 mensagens)
- Pro: R$150/mês (20.000 mensagens)

### **Mensagens extras:**
- Após limite do plano: ~R$0,07 por mensagem

### **Sem surpresas:**
- Sem cobrança por número
- Sem cobrança por instância
- Apenas mensalidade do plano

---

## 🎯 **PRÓXIMOS PASSOS**

Agora que Z-API está configurado:

1. ✅ **Z-API configurado** (este guia)
2. ⏳ **Integrar backend** (ver ZAPI-BACKEND-CODE.js)
3. ⏳ **Configurar Railway** (ver ZAPI-DEPLOY-RAILWAY.md)
4. ⏳ **Importar workflow N8N** (ver ZAPI-1-ENVIAR-MENSAGENS.json)
5. ⏳ **Atualizar frontend** (ver ZAPI-FRONTEND-CONFIG.md)
6. ⏳ **Testar tudo** (ver ZAPI-MIGRACAO-CHECKLIST.md)

**Qualquer dúvida, me chame! 🚀**

---

## 📞 **SUPORTE Z-API**

### **Contatos:**
- Site: https://z-api.io
- Documentação: https://developer.z-api.io
- WhatsApp Suporte: (disponível no Dashboard)
- Email: contato@z-api.io

### **Horário de atendimento:**
- Segunda a Sexta: 9h às 18h (horário de Brasília)
- Suporte em português 🇧🇷

---

**Parabéns! Setup Z-API completo! 🎉**

