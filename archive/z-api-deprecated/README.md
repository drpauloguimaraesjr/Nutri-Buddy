# ⚠️ Z-API / Evolution API - Arquivos Descontinuados

## 📌 Sobre esta pasta

Esta pasta contém **código e documentação DESCONTINUADOS** relacionados às antigas integrações:
- **Z-API** (WhatsApp não-oficial)
- **Evolution API** (WhatsApp não-oficial)

---

## 🔄 Migração para Twilio

**Data da migração:** Novembro 2024

**Motivo da migração:**
- ✅ Twilio é a API oficial do WhatsApp Business
- ✅ Mais estável e confiável
- ✅ Melhor suporte e documentação
- ✅ Não requer QR Code (API oficial)
- ✅ Melhor para produção

---

## 📁 O que está arquivado aqui:

### Backend:
- `ZAPI-BACKEND-CODE.js` - Código de integração Z-API
- Documentação de setup e deploy Z-API/Evolution
- Scripts de configuração

### N8N Workflows:
- `EVOLUTION-*.json` - Workflows Evolution API
- `ZAPI-*.json` - Workflows Z-API
- Guias de importação e configuração

### Documentação:
- Manuais de setup e troubleshooting
- Checklists de migração
- Exemplos de uso

---

## ⚠️ IMPORTANTE

**NÃO USAR** estes arquivos em produção.

Se precisar consultar algo para referência, tudo bem. Mas **não implemente** estas integrações novamente.

---

## ✅ Código Atual (Ativo)

O código **ATIVO** e **MANTIDO** está em:

### Backend:
- `services/twilio-service.js` - Serviço Twilio WhatsApp
- `routes/whatsapp.js` - Rotas e webhooks Twilio
- `utils/phone-utils.js` - Utilitários de normalização de telefone

### Variáveis de Ambiente:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+15551234567
```

### Webhooks Ativos:
- `POST /webhooks/twilio-whatsapp` - Receber mensagens
- `POST /webhooks/twilio-status` - Status de mensagens

---

## 📞 Suporte

Para questões sobre a integração **ATUAL** com Twilio, consulte:
- `services/twilio-service.js` (documentação inline)
- `n8n-workflows/TWILIO-*.md` (guias atualizados)
- Documentação oficial: https://www.twilio.com/docs/whatsapp

---

**Última atualização:** Novembro 2024

