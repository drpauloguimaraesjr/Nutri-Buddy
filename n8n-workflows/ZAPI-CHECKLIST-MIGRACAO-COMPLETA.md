# ✅ CHECKLIST COMPLETO - MIGRAÇÃO Z-API

## 🎯 **OBJETIVO**

Migrar completamente do Evolution API para Z-API com QR Code automático no sistema.

**Tempo estimado total: 2-3 horas**

---

## 📅 **PLANO DE EXECUÇÃO**

### **Sessão 1: Setup Z-API (30min)**
- Criar conta Z-API
- Conectar WhatsApp
- Configurar webhooks

### **Sessão 2: Backend (45min)**
- Adicionar código
- Configurar Railway
- Deploy e testes

### **Sessão 3: Frontend (45min)**
- Adicionar componentes
- Integrar no Kanban
- Deploy e testes

### **Sessão 4: Testes finais (30min)**
- Testar tudo
- Desativar Evolution
- Monitorar

---

## 📋 **FASE 1: SETUP Z-API**

### **1.1. Criar conta Z-API**
- [ ] Acessar https://z-api.io
- [ ] Criar conta (email + senha)
- [ ] Verificar email
- [ ] Login no dashboard

**Tempo: 5 minutos**

### **1.2. Criar instância WhatsApp**
- [ ] Clicar em "Nova Instância"
- [ ] Nome: `nutribuddy-producao`
- [ ] Aguardar criação (~30s)
- [ ] Instância criada ✅

**Tempo: 2 minutos**

### **1.3. Conectar WhatsApp**
- [ ] Clicar em "Conectar WhatsApp"
- [ ] QR Code aparece
- [ ] Abrir WhatsApp no celular
- [ ] Menu → Aparelhos conectados
- [ ] Escanear QR Code
- [ ] Status: "Conectado" (bolinha verde) ✅

**Tempo: 3 minutos**

### **1.4. Copiar credenciais**
- [ ] Anotar ZAPI_INSTANCE_ID: `______________`
- [ ] Anotar ZAPI_TOKEN: `______________`
- [ ] Anotar ZAPI_BASE_URL: `https://api.z-api.io`

**Tempo: 2 minutos**

### **1.5. Configurar webhooks Z-API**
- [ ] Dashboard Z-API → Webhooks
- [ ] Ativar "Mensagens recebidas"
- [ ] URL: `https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-whatsapp`
- [ ] Eventos: ✅ message-received
- [ ] Salvar
- [ ] Ativar "Status de conexão"
- [ ] URL: `https://web-production-c9eaf.up.railway.app/api/webhooks/zapi-status`
- [ ] Eventos: ✅ connection.update, ✅ qrcode.updated
- [ ] Salvar

**Tempo: 5 minutos**

### **1.6. Testar envio manual**
- [ ] Dashboard Z-API → Enviar Mensagem
- [ ] Número: seu celular pessoal
- [ ] Mensagem: "Teste Z-API NutriBuddy"
- [ ] Enviar
- [ ] Mensagem recebida no WhatsApp ✅

**Tempo: 3 minutos**

### **1.7. Escolher plano**
- [ ] Começar com TRIAL GRÁTIS (7 dias)
- [ ] Ou contratar plano START (R$70/mês)

**Tempo: 5 minutos**

**⏱️ TOTAL FASE 1: ~25-30 minutos**

---

## 💻 **FASE 2: BACKEND**

### **2.1. Preparar arquivos**
- [ ] Copiar `CODIGO-BACKEND-WHATSAPP-SERVICE.js` → `backend/whatsapp-service.js`
- [ ] Copiar `CODIGO-BACKEND-WHATSAPP-ROUTES.js` → `backend/whatsapp-routes.js`
- [ ] Verificar arquivos no lugar ✅

**Tempo: 5 minutos**

### **2.2. Atualizar server.js**
- [ ] Abrir `server.js`
- [ ] Adicionar imports:
  ```javascript
  const whatsappRoutes = require('./whatsapp-routes');
  ```
- [ ] Adicionar rotas:
  ```javascript
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/webhooks', whatsappRoutes);
  ```
- [ ] Salvar arquivo ✅

**Tempo: 5 minutos**

### **2.3. Atualizar package.json**
- [ ] Abrir `package.json`
- [ ] Adicionar dependência: `"axios": "^1.6.0"`
- [ ] Rodar: `npm install`
- [ ] Instalação concluída ✅

**Tempo: 3 minutos**

### **2.4. Testar localmente (opcional)**
- [ ] Rodar: `npm run dev`
- [ ] Abrir: `http://localhost:3000/health`
- [ ] Resposta 200 OK ✅
- [ ] Parar servidor (Ctrl+C)

**Tempo: 5 minutos**

### **2.5. Commit e push**
- [ ] `git add .`
- [ ] `git commit -m "feat: Adicionar integração Z-API WhatsApp"`
- [ ] `git push origin main`
- [ ] Push concluído ✅

**Tempo: 2 minutos**

### **2.6. Configurar Railway**
- [ ] Acessar Railway Dashboard
- [ ] Selecionar projeto backend
- [ ] Variables → Add Variable

**Adicionar variáveis:**
- [ ] `ZAPI_INSTANCE_ID` = (seu ID)
- [ ] `ZAPI_TOKEN` = (seu token)
- [ ] `ZAPI_BASE_URL` = `https://api.z-api.io`
- [ ] Todas adicionadas ✅

**Tempo: 5 minutos**

### **2.7. Deploy Railway**
- [ ] Railway faz deploy automático após push
- [ ] Aguardar deploy (2-3 minutos)
- [ ] Status: SUCCESS ✅
- [ ] Ver logs: `✅ Servidor rodando na porta 3000`
- [ ] Ver logs: `📱 Z-API configurado: true`

**Tempo: 5 minutos**

### **2.8. Testar endpoints**

**Teste 1: Health check**
- [ ] `curl https://web-production-c9eaf.up.railway.app/health`
- [ ] Resposta 200 OK ✅

**Teste 2: Status WhatsApp**
- [ ] `curl https://web-production-c9eaf.up.railway.app/api/whatsapp/status`
- [ ] JSON com `"connected": true` ✅

**Teste 3: QR Code**
- [ ] Abrir no navegador: `https://web-production-c9eaf.up.railway.app/api/whatsapp/qrcode`
- [ ] Imagem PNG aparece (mesmo conectado, só para teste) ✅

**Teste 4: Enviar mensagem**
```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999", "message": "Teste via curl!"}'
```
- [ ] Resposta: `"success": true` ✅
- [ ] Mensagem recebida no WhatsApp ✅

**Tempo: 10 minutos**

**⏱️ TOTAL FASE 2: ~40-45 minutos**

---

## 🎨 **FASE 3: FRONTEND**

### **3.1. Preparar componentes**
- [ ] Criar pasta: `frontend/src/components/WhatsApp/`
- [ ] Copiar `CODIGO-FRONTEND-WhatsAppQRCode.jsx` → `WhatsAppQRCode.jsx`
- [ ] Copiar `CODIGO-FRONTEND-WhatsAppQRCode.css` → `WhatsAppQRCode.css`
- [ ] Copiar `CODIGO-FRONTEND-WhatsAppStatusCard.jsx` → `WhatsAppStatusCard.jsx`
- [ ] Copiar `CODIGO-FRONTEND-WhatsAppStatusCard.css` → `WhatsAppStatusCard.css`
- [ ] Todos os arquivos no lugar ✅

**Tempo: 5 minutos**

### **3.2. Configurar variáveis de ambiente**
- [ ] Criar/editar `.env.production`:
  ```
  REACT_APP_API_URL=https://web-production-c9eaf.up.railway.app
  ```
- [ ] Salvar ✅

**Tempo: 2 minutos**

### **3.3. Integrar no Kanban/Dashboard**

**Opção A: Sidebar (recomendado)**
- [ ] Abrir componente do Kanban principal
- [ ] Importar `WhatsAppStatusCard`
- [ ] Adicionar no sidebar:
  ```jsx
  <WhatsAppStatusCard onOpenQRCode={() => setShowModal(true)} />
  ```
- [ ] Salvar ✅

**Opção B: Header**
- [ ] Adicionar no header do Kanban
- [ ] Versão compacta
- [ ] Salvar ✅

**Tempo: 10 minutos**

### **3.4. Adicionar modal QR Code**
- [ ] Criar/editar componente Modal
- [ ] Adicionar estado: `const [showQRModal, setShowQRModal] = useState(false)`
- [ ] Adicionar modal:
  ```jsx
  {showQRModal && (
    <Modal onClose={() => setShowQRModal(false)}>
      <WhatsAppQRCode />
    </Modal>
  )}
  ```
- [ ] Salvar ✅

**Tempo: 5 minutos**

### **3.5. Testar localmente**
- [ ] Rodar: `npm start`
- [ ] Abrir: `http://localhost:3000`
- [ ] Card do WhatsApp aparece ✅
- [ ] Clicar no card
- [ ] Modal abre ✅
- [ ] QR Code aparece (ou status conectado) ✅
- [ ] Fechar modal funciona ✅

**Tempo: 5 minutos**

### **3.6. Build e deploy**
- [ ] `npm run build`
- [ ] Build concluído ✅
- [ ] `git add .`
- [ ] `git commit -m "feat: Adicionar componentes WhatsApp Z-API"`
- [ ] `git push origin main`
- [ ] Deploy automático (Vercel/Netlify)
- [ ] Deploy SUCCESS ✅

**Tempo: 10 minutos**

### **3.7. Testar em produção**
- [ ] Abrir frontend em produção
- [ ] Card WhatsApp aparece ✅
- [ ] Status mostra "Conectado" ✅
- [ ] Clicar no card (se desconectado)
- [ ] Modal abre ✅
- [ ] QR Code aparece ✅
- [ ] Auto-refresh funciona ✅

**Tempo: 5 minutos**

**⏱️ TOTAL FASE 3: ~40-45 minutos**

---

## 🧪 **FASE 4: TESTES COMPLETOS**

### **4.1. Testes de envio**

**Teste 1: Enviar do sistema**
- [ ] Frontend: Abrir chat de paciente
- [ ] Escrever mensagem
- [ ] Enviar
- [ ] Mensagem enviada ✅
- [ ] Paciente recebe no WhatsApp ✅

**Teste 2: Enviar imagem**
- [ ] Upload de imagem
- [ ] Enviar
- [ ] Paciente recebe imagem ✅

**Tempo: 5 minutos**

### **4.2. Testes de recebimento**

**Teste 1: Receber texto**
- [ ] Paciente envia mensagem no WhatsApp
- [ ] Mensagem aparece no sistema ✅
- [ ] Conversa atualizada ✅

**Teste 2: Receber imagem**
- [ ] Paciente envia imagem
- [ ] Imagem aparece no sistema ✅

**Tempo: 5 minutos**

### **4.3. Testes de status**

**Teste 1: Status conectado**
- [ ] Card mostra "Conectado" ✅
- [ ] Número do telefone aparece ✅
- [ ] Bolinha verde piscando ✅

**Teste 2: Desconectar e reconectar**
- [ ] Clicar em "Desconectar"
- [ ] Confirmar
- [ ] Status muda para "Desconectado" ✅
- [ ] Clicar em "Conectar"
- [ ] QR Code aparece ✅
- [ ] Escanear QR Code
- [ ] Status volta para "Conectado" ✅

**Tempo: 5 minutos**

### **4.4. Testes de QR Code automático**

**Teste 1: Gerar QR Code**
- [ ] Desconectar WhatsApp (via Z-API Dashboard)
- [ ] Card detecta desconexão ✅
- [ ] Clicar em "Conectar"
- [ ] QR Code gerado automaticamente ✅

**Teste 2: Auto-refresh QR Code**
- [ ] Deixar QR Code aberto
- [ ] Aguardar 60 segundos
- [ ] QR Code renovado automaticamente ✅

**Tempo: 3 minutos**

### **4.5. Testes de webhooks**

**Teste 1: Webhook de mensagem**
- [ ] Ver logs Railway
- [ ] Enviar mensagem do WhatsApp
- [ ] Log aparece: `📩 Webhook Z-API recebido` ✅

**Teste 2: Webhook de status**
- [ ] Desconectar WhatsApp
- [ ] Log aparece: `⚠️ WhatsApp DESCONECTADO` ✅
- [ ] Conectar WhatsApp
- [ ] Log aparece: `✅ WhatsApp CONECTADO` ✅

**Tempo: 5 minutos**

### **4.6. Testes de performance**

**Teste 1: Latência de envio**
- [ ] Enviar mensagem
- [ ] Tempo < 2 segundos ✅

**Teste 2: Latência de recebimento**
- [ ] Paciente envia mensagem
- [ ] Aparece no sistema em < 3 segundos ✅

**Tempo: 3 minutos**

**⏱️ TOTAL FASE 4: ~25-30 minutos**

---

## 🗑️ **FASE 5: LIMPEZA (OPCIONAL)**

### **5.1. Desativar Evolution API**
- [ ] Acessar N8N
- [ ] Workflows Evolution → Desativar
  - [ ] EVOLUTION-1-RECEBER-MENSAGENS
  - [ ] EVOLUTION-2-ENVIAR-MENSAGENS
  - [ ] EVOLUTION-3-ATUALIZAR-SCORE
- [ ] Todos desativados ✅

**Tempo: 5 minutos**

### **5.2. Desativar serviço Evolution no Render**
- [ ] Acessar Render Dashboard
- [ ] Encontrar serviço Evolution API
- [ ] Suspend service
- [ ] Serviço pausado ✅
- [ ] **NÃO deletar ainda** (manter por 7 dias para garantir)

**Tempo: 3 minutos**

### **5.3. Remover variáveis Evolution do Railway**
- [ ] Railway → Variables
- [ ] Comentar (não deletar):
  - `# EVOLUTION_API_URL`
  - `# EVOLUTION_API_KEY`
  - `# EVOLUTION_INSTANCE_NAME`
- [ ] Manter comentadas por 7 dias ✅

**Tempo: 2 minutos**

**⏱️ TOTAL FASE 5: ~10 minutos**

---

## 📊 **RESUMO FINAL**

### **Tempo total gasto:**
- Fase 1 (Setup Z-API): ~30 min
- Fase 2 (Backend): ~45 min
- Fase 3 (Frontend): ~45 min
- Fase 4 (Testes): ~30 min
- Fase 5 (Limpeza): ~10 min

**TOTAL: ~2h40min** ✅

### **O que você tem agora:**
- ✅ Z-API integrado e funcionando
- ✅ WhatsApp conectado e estável
- ✅ QR Code automático no sistema
- ✅ Card de status no Kanban
- ✅ Envio e recebimento funcionando
- ✅ Webhooks configurados
- ✅ Frontend atualizado
- ✅ Tudo testado e funcionando

### **Benefícios:**
- ✅ 10x mais estável que Evolution
- ✅ Suporte em português
- ✅ Dashboard profissional
- ✅ Sem desconexões aleatórias
- ✅ QR Code no próprio sistema
- ✅ Pagamento em Reais

---

## 🎯 **MONITORAMENTO PÓS-MIGRAÇÃO**

### **Dia 1-3: Monitorar ativamente**
- [ ] Verificar logs Railway 2x por dia
- [ ] Testar envio/recebimento diariamente
- [ ] Verificar status do WhatsApp no card

### **Dia 4-7: Monitorar periodicamente**
- [ ] Verificar logs 1x por dia
- [ ] Testar funcionalidades
- [ ] Confirmar estabilidade

### **Após 7 dias: Deletar Evolution**
- [ ] Se tudo OK, deletar serviço Render
- [ ] Remover variáveis Evolution do Railway
- [ ] Deletar workflows Evolution do N8N

---

## 🆘 **TROUBLESHOOTING RÁPIDO**

### **Problema: QR Code não aparece**
1. [ ] Verificar logs Railway
2. [ ] Testar endpoint `/api/whatsapp/qrcode` direto
3. [ ] Verificar variáveis ZAPI_* no Railway
4. [ ] Reiniciar instância Z-API

### **Problema: Mensagens não enviam**
1. [ ] Verificar status no card: conectado?
2. [ ] Testar com curl
3. [ ] Ver logs Railway
4. [ ] Verificar dashboard Z-API

### **Problema: Mensagens não recebem**
1. [ ] Verificar webhook configurado
2. [ ] Testar webhook manualmente
3. [ ] Ver logs Railway
4. [ ] Dashboard Z-API → Webhooks → Histórico

### **Problema: Frontend não conecta com backend**
1. [ ] Verificar `REACT_APP_API_URL`
2. [ ] Verificar CORS no Railway
3. [ ] Testar endpoint direto no navegador
4. [ ] Ver console do navegador (F12)

---

## 📁 **ARQUIVOS CRIADOS**

Todos os arquivos estão em `n8n-workflows/`:

1. ✅ `ZAPI-QRCODE-AUTOMATICO.md` - Guia completo QR Code
2. ✅ `CODIGO-BACKEND-WHATSAPP-SERVICE.js` - Serviço Z-API
3. ✅ `CODIGO-BACKEND-WHATSAPP-ROUTES.js` - Rotas Z-API
4. ✅ `CODIGO-FRONTEND-WhatsAppQRCode.jsx` - Componente QR Code
5. ✅ `CODIGO-FRONTEND-WhatsAppQRCode.css` - Estilos QR Code
6. ✅ `CODIGO-FRONTEND-WhatsAppStatusCard.jsx` - Card status
7. ✅ `CODIGO-FRONTEND-WhatsAppStatusCard.css` - Estilos card
8. ✅ `CODIGO-FRONTEND-KanbanIntegration.jsx` - Exemplos integração
9. ✅ `CODIGO-FRONTEND-KanbanIntegration.css` - Estilos integração
10. ✅ `ZAPI-DEPLOY-RAILWAY-COMPLETO.md` - Guia deploy
11. ✅ `ZAPI-CHECKLIST-MIGRACAO-COMPLETA.md` - Este checklist

---

## 🎉 **PARABÉNS!**

Se você chegou até aqui e marcou todos os checkboxes, você tem:

- ✅ Sistema NutriBuddy totalmente funcional com Z-API
- ✅ WhatsApp integrado de forma profissional
- ✅ QR Code automático no seu sistema
- ✅ Kanban com status em tempo real
- ✅ Tudo testado e funcionando

**Você migrou com sucesso! 🚀**

---

## 📞 **PRECISA DE AJUDA?**

- **Z-API:** contato@z-api.io ou WhatsApp Suporte
- **Railway:** https://railway.app/help
- **Logs:** Railway Dashboard → Deployments → View Logs

**Me chame se precisar de qualquer ajuda! 💪**

