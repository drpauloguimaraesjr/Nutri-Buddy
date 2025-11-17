# 🚀 Integração WhatsApp ↔ Chat Interno - COMPLETA

## ✅ **O QUE FOI IMPLEMENTADO (Backend)**

### **📱 FASE 1: Integração WhatsApp ↔ Chat Interno**

#### **1.1 Unificação de Collections**
- ✅ Adicionado campo `channel: 'whatsapp' | 'internal'` em todas as mensagens
- ✅ Campos `whatsappEnabled` e `whatsappPhone` nas conversations
- ✅ Metadados `patientPhone` nas conversations

#### **1.2 Webhook Twilio → Chat Interno**
**Arquivo:** `routes/whatsapp.js` (linha 627-790)

**O que faz:**
1. Recebe mensagem do WhatsApp via Twilio
2. Normaliza número do paciente (múltiplas variações)
3. Busca ou cria conversa no chat interno
4. Salva mensagem em `conversations/{id}/messages` com `channel: 'whatsapp'`
5. Atualiza unread count da conversa

**Fluxo:**
```
WhatsApp → Twilio → Webhook → Firestore (conversations/messages)
```

#### **1.3 Chat Interno → WhatsApp Automático**
**Arquivo:** `routes/messages.js` (linha 686-716)

**O que faz:**
1. Prescritor envia mensagem no chat
2. Sistema verifica se `whatsappEnabled = true`
3. Se sim, envia automaticamente via Twilio
4. Salva cópia da mensagem com `channel: 'whatsapp'`

**Fluxo:**
```
Prescritor envia no chat → Sistema detecta WhatsApp habilitado → Envia via Twilio
```

---

### **📅 FASE 2: Templates + Mensagens Agendadas**

#### **2.1 Templates Pré-definidos**
**Arquivo:** `routes/scheduled-messages.js`

**8 Templates Disponíveis:**

| ID | Nome | Categoria | Uso |
|----|------|-----------|-----|
| `MEAL_REMINDER` | Lembrete de Refeição | reminders | Lembrar horário da refeição |
| `APPOINTMENT_REMINDER` | Lembrete de Consulta | appointments | Lembrar consulta agendada |
| `WELCOME` | Boas-vindas | onboarding | Novo paciente |
| `ACHIEVEMENT` | Parabéns por Conquista | engagement | Conquista/meta atingida |
| `WEEKLY_CHECKIN` | Check-in Semanal | follow-up | Check-in semanal |
| `HYDRATION_REMINDER` | Lembrete de Hidratação | reminders | Lembrar de beber água |
| `EXERCISE_REMINDER` | Lembrete de Exercício | reminders | Lembrar exercícios |
| `POSITIVE_FEEDBACK` | Feedback Positivo | engagement | Feedback sobre progresso |

**Exemplo de Template:**
```javascript
{
  id: 'meal_reminder',
  template: 'Olá {{patientName}}! 🍽️\n\nÉ hora do seu {{mealName}}!\n\nBoa refeição! 😊',
  variables: ['patientName', 'mealName']
}
```

#### **2.2 Endpoints REST**

**GET `/api/scheduled-messages/templates`**
- Listar todos os templates
- Filtrar por categoria: `?category=reminders`

**GET `/api/scheduled-messages/templates/:id`**
- Detalhes de um template específico

**POST `/api/scheduled-messages`**
- Agendar nova mensagem
- Body:
```json
{
  "patientId": "abc123",
  "templateId": "meal_reminder",
  "variables": {
    "patientName": "João",
    "mealName": "café da manhã"
  },
  "scheduledFor": "2024-11-20T08:00:00Z",
  "channel": "whatsapp",
  "repeat": "daily"
}
```

**GET `/api/scheduled-messages`**
- Listar mensagens agendadas do prescritor
- Filtros: `?status=pending&patientId=abc123&limit=50`

**DELETE `/api/scheduled-messages/:id`**
- Cancelar mensagem agendada

#### **2.3 Collection Firestore: `scheduledMessages`**

**Estrutura:**
```javascript
{
  prescriberId: "xyz",
  patientId: "abc",
  patientPhone: "+5547999999999",
  patientName: "João Silva",
  templateId: "meal_reminder",
  message: "Olá João! É hora do seu café da manhã!",
  variables: { ... },
  scheduledFor: Timestamp,
  channel: "whatsapp", // 'whatsapp' | 'internal' | 'both'
  repeat: "daily", // 'once' | 'daily' | 'weekly' | 'monthly'
  status: "pending", // 'pending' | 'sent' | 'failed' | 'cancelled'
  sentAt: null,
  error: null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### **⏰ FASE 3: Cron Job (Processamento Automático)**

#### **3.1 Cron Job de Mensagens Agendadas**
**Arquivo:** `services/cron-jobs.js` (linha 76-240)

**Executa:** A cada 1 minuto

**O que faz:**
1. Busca mensagens com `status = 'pending'` e `scheduledFor <= now`
2. Para cada mensagem:
   - **Se channel = 'whatsapp' ou 'both':** Envia via Twilio
   - **Se channel = 'internal' ou 'both':** Adiciona mensagem no chat
   - Marca como `sent` ou `failed`
   - **Se recorrente:** Cria próxima mensagem automaticamente
3. Logs detalhados de sucesso/erro

**Mensagens Recorrentes:**
- `daily`: Repete todo dia no mesmo horário
- `weekly`: Repete toda semana
- `monthly`: Repete todo mês

---

## 📊 **COMO USAR (Exemplos)**

### **Exemplo 1: Lembrete de Refeição Diário**

```bash
POST /api/scheduled-messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "abc123",
  "templateId": "MEAL_REMINDER",
  "variables": {
    "patientName": "João",
    "mealName": "café da manhã"
  },
  "scheduledFor": "2024-11-21T07:00:00Z",
  "channel": "whatsapp",
  "repeat": "daily"
}
```

**Resultado:**
- Todo dia às 7h, João recebe WhatsApp: "Olá João! 🍽️ É hora do seu café da manhã!"

---

### **Exemplo 2: Boas-vindas no Chat Interno**

```bash
POST /api/scheduled-messages

{
  "patientId": "abc123",
  "templateId": "WELCOME",
  "variables": {
    "patientName": "Maria",
    "prescriberName": "Dr. Paulo"
  },
  "scheduledFor": "2024-11-20T09:00:00Z",
  "channel": "internal",
  "repeat": "once"
}
```

**Resultado:**
- Maria recebe mensagem no chat interno às 9h

---

### **Exemplo 3: Check-in Semanal (WhatsApp + Chat)**

```bash
POST /api/scheduled-messages

{
  "patientId": "abc123",
  "templateId": "WEEKLY_CHECKIN",
  "variables": {
    "patientName": "Pedro"
  },
  "scheduledFor": "2024-11-25T10:00:00Z",
  "channel": "both",
  "repeat": "weekly"
}
```

**Resultado:**
- Toda segunda às 10h, Pedro recebe mensagem via WhatsApp E no chat interno

---

## 🎨 **PENDENTE: Frontend (Você precisa implementar)**

### **✅ O que já funciona (Backend pronto):**
1. ✅ WhatsApp ↔ Chat unificado
2. ✅ Mensagens agendadas
3. ✅ Templates prontos
4. ✅ Cron job processando

### **❌ O que falta (Frontend):**

#### **1. Indicador de Canal nas Mensagens**
**Onde:** Componente de chat (exibição de mensagens)

**O que fazer:**
- Adicionar ícone WhatsApp 📱 se `message.channel === 'whatsapp'`
- Adicionar ícone Chat 💬 se `message.channel === 'internal'`

**Exemplo (React):**
```tsx
// No componente de mensagem:
{message.channel === 'whatsapp' && (
  <Chip size="sm" color="success" variant="flat">
    📱 WhatsApp
  </Chip>
)}
```

---

#### **2. Toggle para Habilitar/Desabilitar WhatsApp**
**Onde:** Detalhes da conversa / Configurações do paciente

**O que fazer:**
- Botão toggle para `whatsappEnabled`
- Atualizar Firestore quando toggle mudar

**Exemplo:**
```tsx
<Switch
  checked={conversation.whatsappEnabled}
  onChange={async (e) => {
    await updateConversation(conversationId, {
      whatsappEnabled: e.target.checked
    });
  }}
>
  Enviar também via WhatsApp
</Switch>
```

---

#### **3. Interface de Mensagens Agendadas**
**Onde:** Nova página/modal no dashboard do prescritor

**Componentes necessários:**
1. **Lista de mensagens agendadas** (`GET /api/scheduled-messages`)
2. **Formulário para agendar** (`POST /api/scheduled-messages`)
   - Select de template
   - Campos de variáveis dinâmicos
   - DateTimePicker para `scheduledFor`
   - Radio button para `channel` (WhatsApp/Interno/Ambos)
   - Select para `repeat` (Uma vez/Diário/Semanal/Mensal)
3. **Botão cancelar** (`DELETE /api/scheduled-messages/:id`)

**Exemplo de formulário:**
```tsx
<form onSubmit={handleScheduleMessage}>
  <Select label="Template" options={templates} />
  <Input label="Nome do paciente" name="patientName" />
  <DateTimePicker label="Agendar para" />
  <RadioGroup label="Enviar via">
    <Radio value="whatsapp">WhatsApp</Radio>
    <Radio value="internal">Chat Interno</Radio>
    <Radio value="both">Ambos</Radio>
  </RadioGroup>
  <Select label="Repetir">
    <option value="once">Uma vez</option>
    <option value="daily">Todo dia</option>
    <option value="weekly">Toda semana</option>
    <option value="monthly">Todo mês</option>
  </Select>
  <Button type="submit">Agendar</Button>
</form>
```

---

#### **4. Biblioteca de Templates (Opcional)**
**Onde:** Modal ou página separada

**O que mostrar:**
- Lista visual de todos os templates disponíveis
- Preview do template com variáveis
- Botão "Usar este template"

---

## 🔥 **PRÓXIMOS PASSOS**

### **Imediato (Você pode fazer agora):**
1. ✅ **Aguardar deploy do Railway** (2 minutos)
2. ✅ **Testar integração WhatsApp ↔ Chat:**
   - Enviar mensagem no WhatsApp → Ver no chat interno
   - Enviar no chat interno → Receber no WhatsApp
3. ✅ **Testar mensagem agendada:**
   ```bash
   curl -X POST https://web-production-c9eaf.up.railway.app/api/scheduled-messages \
     -H "Authorization: Bearer <seu-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "patientId": "...",
       "templateId": "MEAL_REMINDER",
       "variables": {"patientName": "João", "mealName": "almoço"},
       "scheduledFor": "2024-11-20T12:00:00Z",
       "channel": "whatsapp",
       "repeat": "once"
     }'
   ```

### **Curto prazo (1-2 dias):**
4. 🎨 Implementar indicadores visuais no chat (ícone WhatsApp/Chat)
5. 🎨 Criar toggle de WhatsApp nas conversas
6. 🎨 Criar página de mensagens agendadas

### **Médio prazo (1 semana):**
7. 📊 Analytics de mensagens WhatsApp
8. 🤖 Templates personalizados (prescritor criar seus próprios)
9. 📱 Suporte a imagens/mídia em mensagens agendadas
10. 🔔 Notificações push quando recebe WhatsApp

---

## 📚 **DOCUMENTAÇÃO DOS ENDPOINTS**

### **Templates**
```
GET  /api/scheduled-messages/templates
GET  /api/scheduled-messages/templates/:id
```

### **Mensagens Agendadas**
```
GET    /api/scheduled-messages
POST   /api/scheduled-messages
DELETE /api/scheduled-messages/:id
```

### **Conversa com WhatsApp**
```
Não há endpoint novo. Apenas use os endpoints de messages normalmente.
Se whatsappEnabled = true, mensagem vai automaticamente para WhatsApp.
```

---

## 🎯 **RESUMO DO QUE VOCÊ GANHOU**

### **Antes:**
❌ WhatsApp e Chat separados  
❌ Sem mensagens agendadas  
❌ Sem templates  
❌ Prescritor precisava enviar manualmente

### **Agora:**
✅ WhatsApp e Chat unificados  
✅ Mensagens agendadas automáticas  
✅ 8 templates prontos para usar  
✅ Prescritor envia 1 vez → Vai para WhatsApp E Chat  
✅ Cron job processa tudo automaticamente  
✅ Suporte a mensagens recorrentes

---

**🚀 DEPLOY FEITO! Railway fazendo deploy agora...**

**Aguarde 2 minutos e teste!** 📱✨

