# 🚀 GUIA DE IMPORTAÇÃO - Workflows Evolution WhatsApp V2

## ✅ **O QUE MUDOU?**

Os workflows foram **recriados** para usar **HTTP Request** com Firestore REST API ao invés de Community Nodes, garantindo:
- ✅ Compatibilidade total
- ✅ Sem dependência de community nodes específicos
- ✅ Mais estável e confiável
- ✅ Usa a credencial Google Service Account que você já configurou

---

## 📦 **ARQUIVOS CRIADOS**

3 novos workflows na pasta `n8n-workflows/`:

1. **EVOLUTION-1-RECEBER-MENSAGENS-V2.json** ✅
   - Recebe mensagens do WhatsApp via webhook Evolution API
   - Busca paciente no Firestore
   - Salva mensagem no Firestore
   - Cria ou atualiza conversa

2. **EVOLUTION-2-ENVIAR-MENSAGENS-V2.json** ✅
   - Verifica mensagens pendentes a cada 30 segundos
   - Busca telefone do paciente
   - Envia via Evolution API
   - Marca como enviada no Firestore

3. **EVOLUTION-3-ATUALIZAR-SCORE-V2.json** ✅
   - Verifica refeições a cada 5 minutos
   - Calcula score de cada paciente
   - Atualiza score na conversa
   - Envia mensagem automática quando conquista badge

---

## 📝 **PASSO A PASSO: IMPORTAR WORKFLOWS**

### **Passo 1: Deletar Workflows Antigos (se existirem)**

No N8N:
```
1. Workflows → Lista de workflows
2. Encontrar workflows com "?" (não funcionando)
3. Clicar em ⋮ (três pontinhos)
4. Delete
5. Confirmar
```

---

### **Passo 2: Importar Workflow 1 - Receber Mensagens**

**No N8N:**
```
1. Workflows → "Add workflow" (botão laranja)
2. Menu ⋮ (canto superior direito)
3. "Import from File..."
4. Navegar até: /Users/drpgjr.../NutriBuddy/n8n-workflows/
5. Selecionar: EVOLUTION-1-RECEBER-MENSAGENS-V2.json
6. Clicar "Open"
7. Aguardar carregar
8. Clicar "Save" (Ctrl+S / Cmd+S)
```

**⚠️ IMPORTANTE:**

Depois de importar, você verá alguns nodes com aviso vermelho dizendo que falta configurar a credencial.

**Para CADA node HTTP Request com aviso:**
```
1. Clicar no node
2. Aba "Credentials" (ou "Parameters")
3. Campo "Credential for Google API"
4. Selecionar: "Google Service Account account"
5. ✅ Aviso vermelho deve sumir
```

**Nodes que precisam de credencial neste workflow:**
- Buscar Paciente no Firestore
- Salvar Mensagem no Firestore
- Buscar Conversa Existente
- Atualizar Conversa Existente
- Criar Nova Conversa

**Depois de configurar TODOS:**
- Clicar "Save" novamente
- ✅ Não deve ter mais avisos vermelhos

---

### **Passo 3: Importar Workflow 2 - Enviar Mensagens**

**No N8N:**
```
1. Workflows → "Add workflow" (botão laranja)
2. Menu ⋮ → "Import from File..."
3. Selecionar: EVOLUTION-2-ENVIAR-MENSAGENS-V2.json
4. Importar
```

**Configurar credenciais nos nodes:**
- Buscar Mensagens Pendentes
- Buscar Telefone do Paciente
- Marcar como Enviada
- Atualizar Conversa
- Marcar como Erro

**Configurar variáveis de ambiente:**

Este workflow precisa de 3 variáveis:
```
EVOLUTION_API_URL = https://seu-evolution.railway.app
EVOLUTION_INSTANCE_NAME = nutribuddy
EVOLUTION_API_KEY = sua-api-key
```

**Como configurar no N8N Railway:**
```
1. Railway → Seu projeto N8N
2. Aba "Variables"
3. Adicionar:
   - EVOLUTION_API_URL = [sua URL]
   - EVOLUTION_INSTANCE_NAME = [nome da instância]
   - EVOLUTION_API_KEY = [sua chave]
4. Salvar
5. Redeploy N8N
```

**Depois:**
- Salvar workflow
- ✅ Verificar sem erros

---

### **Passo 4: Importar Workflow 3 - Atualizar Score**

**No N8N:**
```
1. Workflows → "Add workflow" (botão laranja)
2. Menu ⋮ → "Import from File..."
3. Selecionar: EVOLUTION-3-ATUALIZAR-SCORE-V2.json
4. Importar
```

**Configurar credenciais nos nodes:**
- Buscar Últimas 200 Refeições
- Buscar Conversa WhatsApp
- Atualizar Score na Conversa
- Salvar Mensagem de Parabéns

**Depois:**
- Salvar workflow
- ✅ Verificar sem erros

---

## ✅ **CHECKLIST FINAL**

Depois de importar e configurar os 3 workflows:

### **Workflow 1: Evolution: Receber Mensagens WhatsApp**
- [ ] Importado com sucesso
- [ ] Todos os nodes HTTP Request têm credencial configurada
- [ ] Nenhum aviso vermelho
- [ ] Salvo

### **Workflow 2: Evolution: Enviar Mensagens para WhatsApp**
- [ ] Importado com sucesso
- [ ] Todos os nodes HTTP Request têm credencial configurada
- [ ] Variáveis EVOLUTION_* configuradas no Railway
- [ ] Nenhum aviso vermelho
- [ ] Salvo

### **Workflow 3: Evolution: Atualizar Score ao Registrar Refeição**
- [ ] Importado com sucesso
- [ ] Todos os nodes HTTP Request têm credencial configurada
- [ ] Nenhum aviso vermelho
- [ ] Salvo

---

## 🎯 **ATIVAR WORKFLOWS**

**AINDA NÃO ATIVE!**

Antes de ativar, você precisa:
1. ✅ Configurar Evolution API
2. ✅ Testar conexão com Evolution
3. ✅ Verificar se variáveis estão corretas

**Quando estiver tudo pronto:**
```
1. Abrir cada workflow
2. Clicar no toggle "Inactive" → "Active" (canto superior direito)
3. Toggle deve ficar VERDE ✅
4. Workflow começa a rodar automaticamente
```

---

## 🔧 **COMO FUNCIONA CADA WORKFLOW**

### **Workflow 1: Receber Mensagens**
- **Trigger:** Webhook (Evolution API envia mensagens para ele)
- **URL do webhook:** `https://seu-n8n.railway.app/webhook/evolution-whatsapp`
- **O que faz:**
  1. Recebe mensagem do WhatsApp
  2. Busca paciente no Firestore pelo telefone
  3. Se encontrar → salva mensagem
  4. Cria ou atualiza conversa
  5. Responde "success" para Evolution

### **Workflow 2: Enviar Mensagens**
- **Trigger:** Schedule (roda a cada 30 segundos)
- **O que faz:**
  1. Busca mensagens com `sent: false` no Firestore
  2. Para cada mensagem:
     - Busca telefone do paciente
     - Envia via Evolution API
     - Marca como enviada (se sucesso)
     - Atualiza última mensagem da conversa

### **Workflow 3: Atualizar Score**
- **Trigger:** Schedule (roda a cada 5 minutos)
- **O que faz:**
  1. Busca últimas 200 refeições
  2. Agrupa por paciente
  3. Para cada paciente:
     - Calcula score (aderência, dias consecutivos, etc)
     - Atualiza score na conversa WhatsApp
     - Se conquistou novo badge → cria mensagem de parabéns
     - Mensagem vai para fila de envio (Workflow 2 pega)

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Credential not found"**
**Solução:**
1. Abrir workflow
2. Clicar no node com erro
3. Selecionar credencial "Google Service Account account"
4. Salvar

### **Erro: "Invalid JSON"**
**Solução:**
- Os workflows usam Firestore REST API
- JSON pode parecer complexo mas está correto
- Não altere os campos JSON manualmente

### **Erro: "EVOLUTION_API_URL is not defined"**
**Solução:**
1. Railway → N8N → Variables
2. Adicionar variáveis EVOLUTION_*
3. Redeploy

### **Workflow não executa**
**Solução:**
1. Verificar se está ATIVO (toggle verde)
2. Workflow 1: testar enviando mensagem no WhatsApp
3. Workflow 2 e 3: aguardar schedule (30s e 5min)
4. Ver execuções em "Executions" (menu lateral)

---

## 📊 **COMO TESTAR**

### **Teste 1: Receber Mensagem**
```
1. Ativar Workflow 1
2. Enviar mensagem WhatsApp para o número Evolution
3. Ir em "Executions" do workflow
4. Deve aparecer execução nova
5. Verificar se salvou no Firestore
```

### **Teste 2: Enviar Mensagem**
```
1. Criar documento no Firestore:
   Collection: whatsappMessages
   Campos:
     - conversationId: "prescritor_paciente"
     - patientId: "id-do-paciente"
     - content: "Teste de mensagem"
     - senderType: "prescriber"
     - sent: false
2. Ativar Workflow 2
3. Aguardar 30 segundos
4. Verificar se mensagem chegou no WhatsApp
5. Campo "sent" deve mudar para true
```

### **Teste 3: Atualizar Score**
```
1. Registrar refeição no app
2. Ativar Workflow 3
3. Aguardar 5 minutos
4. Verificar score na conversa WhatsApp (Firestore)
5. Se conquistou badge → deve criar mensagem de parabéns
```

---

## 🎉 **PRONTO!**

Agora você tem:
- ✅ 3 workflows funcionais
- ✅ Integração WhatsApp ↔ Firestore
- ✅ Score automático
- ✅ Mensagens de gamificação

**Próximo passo:** Configurar Evolution API no Railway! 🚀

---

## 📞 **PRECISA DE AJUDA?**

Se algum workflow não funcionar:
1. Abrir workflow no n8n
2. Clicar em "Executions" (menu lateral)
3. Ver execuções com erro
4. Clicar na execução
5. Ver qual node falhou
6. Me enviar screenshot do erro

Vamos resolver juntos! 💪

