# 💬 Sistema de Mensagens NutriBuddy

## 📊 Estrutura de Dados Firestore

### Collection: `conversations`
```
conversations/{conversationId}
├── patientId: string (ref: users/{patientId})
├── prescriberId: string (ref: users/{prescriberId})
├── status: 'new' | 'active' | 'waiting' | 'resolved' | 'archived'
├── kanbanColumn: 'new' | 'in-progress' | 'waiting-response' | 'resolved'
├── lastMessage: string
├── lastMessageAt: timestamp
├── lastMessageBy: 'patient' | 'prescriber' | 'system'
├── unreadCount: number (para o prescritor)
├── patientUnreadCount: number
├── priority: 'low' | 'medium' | 'high'
├── tags: string[] (ex: ['nutricao', 'exercicio', 'duvida'])
├── createdAt: timestamp
├── updatedAt: timestamp
├── metadata: {
    patientName: string
    patientEmail: string
    patientAvatar?: string
    presciberName: string
}
```

### SubCollection: `conversations/{conversationId}/messages`
```
messages/{messageId}
├── conversationId: string
├── senderId: string
├── senderRole: 'patient' | 'prescriber' | 'system'
├── content: string
├── type: 'text' | 'image' | 'file' | 'system' | 'ai-response'
├── status: 'sent' | 'delivered' | 'read'
├── isAiGenerated: boolean
├── aiContext?: {
    model: string
    prompt: string
    confidence: number
}
├── attachments?: [{
    url: string
    type: string
    name: string
    size: number
}]
├── metadata?: object
├── createdAt: timestamp
├── readAt?: timestamp
```

### Collection: `message-templates`
```
message-templates/{templateId}
├── prescriberId: string
├── title: string
├── content: string
├── category: string
├── tags: string[]
├── usageCount: number
├── createdAt: timestamp
├── updatedAt: timestamp
```

---

## 🎨 Layout do Sistema

### Para Pacientes:
```
┌─────────────────────────────────────┐
│  Chat com Nutricionista             │
│  ───────────────────────────────    │
│  [Mensagem do sistema]              │
│  Olá! Como posso ajudar?            │
│                                      │
│                     [Sua mensagem]  │
│                     Tenho dúvidas   │
│                                      │
│  [Resposta do nutricionista]        │
│  Claro! Me conte mais...            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Digite sua mensagem...      [▶]│ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Para Prescritores (Kanban):
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  🆕 Novas   │ 💬 Em Atend.│ ⏳ Aguard.  │ ✅ Resolv.  │
│  (5)        │ (12)        │ (3)         │ (45)        │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Maria S.│ │ │ João P. │ │ │ Ana C.  │ │ │ Pedro M.│ │
│ │ Dúvida  │ │ │ Refeição│ │ │ Resultado│ │ │ Resolvido│
│ │ 5min    │ │ │ 2h      │ │ │ 1d      │ │ │ Hoje    │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│             │             │             │             │
│ ┌─────────┐ │ ┌─────────┐ │             │             │
│ │ Carlos  │ │ │ Luiza K.│ │             │             │
│ │ Urgente │ │ │ Check-in│ │             │             │
│ │ 10min   │ │ │ 4h      │ │             │             │
│ └─────────┘ │ └─────────┘ │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🤖 Fluxos de Automação N8N

### 1. Auto-resposta Inicial
```
Trigger: Nova conversa criada
↓
Aguardar 2 minutos
↓
Se prescritor não respondeu:
  → Enviar mensagem automática de boas-vindas
  → "Olá! Recebi sua mensagem e vou responder em breve."
```

### 2. Análise de Sentimento
```
Trigger: Nova mensagem do paciente
↓
Análise de texto (OpenAI/Google AI)
↓
Se urgência detectada:
  → Marcar conversa como "high priority"
  → Notificar prescritor (email/webhook)
```

### 3. Sugestões de Resposta
```
Trigger: Prescritor abre conversa
↓
Buscar histórico + contexto do paciente
↓
Gerar 3 sugestões de resposta com IA
↓
Exibir no chat do prescritor
```

### 4. Follow-up Automático
```
Trigger: Conversa marcada como "resolved"
↓
Aguardar 7 dias
↓
Se paciente não enviou nova mensagem:
  → Enviar check-in automático
  → "Como está indo seu plano?"
```

### 5. Categorização Automática
```
Trigger: Nova mensagem
↓
Análise de conteúdo (IA)
↓
Adicionar tags automáticas:
  - Nutrição, Exercício, Dúvida, Resultado, etc.
```

### 6. Resumo Diário para Prescritor
```
Trigger: Diariamente às 9h
↓
Buscar conversas do prescritor
↓
Gerar resumo:
  - X novas conversas
  - Y pendentes
  - Z urgentes
↓
Enviar por email
```

---

## 📡 Endpoints Backend

### Conversas
- `GET /api/messages/conversations` - Listar conversas do usuário
- `GET /api/messages/conversations/:id` - Detalhes da conversa
- `POST /api/messages/conversations` - Criar nova conversa
- `PATCH /api/messages/conversations/:id` - Atualizar status/kanban
- `DELETE /api/messages/conversations/:id` - Arquivar conversa

### Mensagens
- `GET /api/messages/conversations/:id/messages` - Listar mensagens
- `POST /api/messages/conversations/:id/messages` - Enviar mensagem
- `PATCH /api/messages/:messageId/read` - Marcar como lida
- `GET /api/messages/unread-count` - Contador de não lidas

### Templates
- `GET /api/messages/templates` - Listar templates
- `POST /api/messages/templates` - Criar template
- `PUT /api/messages/templates/:id` - Atualizar template
- `DELETE /api/messages/templates/:id` - Deletar template

### Automação (N8N)
- `POST /api/messages/webhook/new-message` - Webhook nova mensagem
- `POST /api/messages/webhook/ai-response` - Webhook resposta IA
- `GET /api/messages/webhook/conversation-context/:id` - Contexto para IA

---

## 🔐 Permissões

### Paciente pode:
- ✅ Ver apenas suas próprias conversas
- ✅ Enviar mensagens ao seu prescritor
- ✅ Ver histórico de suas mensagens
- ❌ Ver conversas de outros pacientes
- ❌ Acessar sistema Kanban

### Prescritor pode:
- ✅ Ver todas conversas de seus pacientes
- ✅ Ver histórico completo de cada paciente
- ✅ Enviar mensagens para qualquer paciente
- ✅ Mover cards no Kanban
- ✅ Criar templates de resposta
- ✅ Arquivar conversas
- ✅ Ver analytics de conversas

### Admin pode:
- ✅ Tudo que prescritor pode
- ✅ Ver conversas de todos prescritores
- ✅ Configurar automações N8N
- ✅ Ver logs de mensagens

---

## 🎯 Features Principais

### V1 (MVP) - Implementar Agora:
- [x] Estrutura de dados Firestore
- [ ] Endpoints básicos de mensagens
- [ ] Chat interface para pacientes
- [ ] Kanban board para prescritores
- [ ] Webhook básico para N8N
- [ ] Auto-resposta inicial

### V2 (Próximas):
- [ ] Análise de sentimento IA
- [ ] Sugestões de resposta IA
- [ ] Templates de resposta
- [ ] Notificações real-time
- [ ] Upload de arquivos/imagens
- [ ] Analytics de conversas

### V3 (Futuro):
- [ ] Chatbot completo
- [ ] Integração WhatsApp
- [ ] Vídeo chamadas
- [ ] Transcrição de áudio
- [ ] Multi-idioma

---

## 🚀 Setup Rápido

### 1. Configurar Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.prescriberId == request.auth.uid
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.prescriberId == request.auth.uid
      );
      
      match /messages/{messageId} {
        allow read: if request.auth != null && (
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.patientId == request.auth.uid ||
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.prescriberId == request.auth.uid
        );
        allow create: if request.auth != null;
        allow update: if request.auth != null;
      }
    }
  }
}
```

### 2. Configurar Índices Firestore
```json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "prescriberId", "order": "ASCENDING" },
        { "fieldPath": "kanbanColumn", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "conversationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 3. Configurar N8N
Ver arquivo: `N8N-MESSAGES-WORKFLOW.json`

---

## 📚 Próximos Passos

1. ✅ Revisar e aprovar estrutura
2. ⏳ Implementar backend endpoints
3. ⏳ Criar componentes frontend
4. ⏳ Configurar workflows N8N
5. ⏳ Testes integrados
6. ⏳ Deploy

---

**Pronto para começar a implementação! 🚀**

