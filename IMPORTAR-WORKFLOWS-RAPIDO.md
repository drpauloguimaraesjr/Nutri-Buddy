# ⚡ IMPORTAR WORKFLOWS N8N - GUIA RÁPIDO (5 MIN)

## 🎯 OBJETIVO
Importar os 3 workflows principais do WhatsApp no seu N8N do Railway

---

## 📍 SUAS CREDENCIAIS

**N8N:** https://n8n-production-3eae.up.railway.app/

**API Key:** (já está salva no N8N)

---

## 🚀 PASSO A PASSO RÁPIDO

### **1. Acessar N8N (1 min)**
```
https://n8n-production-3eae.up.railway.app/
→ Fazer login
```

### **2. Importar Workflow 1 (1 min)**
```
1. Workflows → + New Workflow
2. Menu (⋮) → Import from File...
3. Selecionar: n8n-workflows/EVOLUTION-1-RECEBER-MENSAGENS.json
4. Import
```

### **3. Importar Workflow 2 (1 min)**
```
Repetir processo:
→ n8n-workflows/EVOLUTION-2-ENVIAR-MENSAGENS.json
```

### **4. Importar Workflow 3 (1 min)**
```
Repetir processo:
→ n8n-workflows/EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO.json
```

### **5. Configurar Firebase Credentials (1 min)**
```
Settings → Credentials → Add Credential
→ Google Service Account
→ Nome: "Firebase Service Account"
→ Colar JSON do Firebase (pegar no Firebase Console)
→ Save
```

---

## 📂 WORKFLOWS PRONTOS PARA IMPORTAR

### ✅ **PRINCIPAIS (Importar Hoje):**

1. **EVOLUTION-1-RECEBER-MENSAGENS.json**
   - Recebe mensagens do WhatsApp
   - Salva no Firestore
   - Dashboard atualiza

2. **EVOLUTION-2-ENVIAR-MENSAGENS.json**
   - Envia respostas do prescritor
   - Via WhatsApp

3. **EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO.json**
   - Calcula score automaticamente
   - Envia parabéns quando conquista badge

### 📊 **OPCIONAIS (Importar Depois):**

4. `1-AUTO-RESPOSTA-FINAL.json` - Respostas automáticas
5. `2-ANALISE-COMPLETO-FINAL.json` - Análise de sentimento
6. `3-SUGESTOES-RESPOSTA-FINAL.json` - Sugestões
7. `4-FOLLOWUP-AUTOMATICO-FINAL.json` - Follow-up
8. `5-RESUMO-DIARIO-FINAL.json` - Resumo diário

---

## 🔑 OBTER FIREBASE JSON

**Pegar credenciais Firebase:**

1. https://console.firebase.google.com
2. Projeto → nutribuddy-2fc9c
3. ⚙️ Configurações → Contas de serviço
4. "Gerar nova chave privada"
5. Baixar JSON
6. Colar no N8N

---

## ✅ ATIVAR WORKFLOWS

**Depois de importar os 3:**

```
1. Abrir Workflow 1
2. Toggle "Inactive" → "Active" ✅
3. Repetir para Workflows 2 e 3
```

---

## 🧪 TESTAR (Depois de Configurar Evolution API)

### Teste 1: Enviar WhatsApp → Dashboard
```
Envie mensagem do seu celular para WhatsApp da clínica
→ Deve aparecer no Dashboard
```

### Teste 2: Responder → WhatsApp
```
Dashboard → Clicar no card → Digitar resposta
→ Deve chegar no WhatsApp do paciente
```

### Teste 3: Refeição → Score Atualiza
```
Registrar refeição como paciente
→ Score deve atualizar automaticamente
```

---

## ⚠️ FALTA CONFIGURAR

**Depois de importar workflows, ainda precisa:**

1. **Evolution API** (WhatsApp)
   - Deploy no Railway
   - Conectar via QR Code
   - Ver: `WHATSAPP-EVOLUTION-API-SETUP.md`

2. **Configurar Webhook**
   - Pegar URL do webhook no Workflow 1
   - Configurar na Evolution API

---

## 🐛 SE DER ERRO

### "Credential not found"
→ Configurar credencial Firebase (passo 5)

### "Node Firestore not working"
→ Verificar se Service Account JSON está correto

### "Webhook not receiving"
→ Ativar workflow primeiro

---

## 📚 DOCUMENTAÇÃO COMPLETA

**Guia Detalhado:**
`IMPORTAR-WORKFLOWS-N8N-RAILWAY-COMPLETO.md`

**Integração Geral:**
`INTEGRACAO-COMPLETA-WHATSAPP.md`

**Setup Evolution:**
`WHATSAPP-EVOLUTION-API-SETUP.md`

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Acessou N8N: https://n8n-production-3eae.up.railway.app/
- [ ] Importou Workflow 1 (RECEBER-MENSAGENS)
- [ ] Importou Workflow 2 (ENVIAR-MENSAGENS)
- [ ] Importou Workflow 3 (ATUALIZAR-SCORE)
- [ ] Configurou credencial Firebase
- [ ] Ativou os 3 workflows
- [ ] (Próximo) Configurar Evolution API
- [ ] (Próximo) Testar fluxo completo

---

**🎉 PRONTO! Em 5 minutos você importou os workflows principais!**

**Próximo passo:** Configurar Evolution API para conectar com WhatsApp real! 🚀

