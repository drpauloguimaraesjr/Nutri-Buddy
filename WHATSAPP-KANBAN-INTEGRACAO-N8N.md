# 📱 Dashboard WhatsApp Kanban - Integração N8N

## 🎯 Visão Geral

Sistema completo de visualização Kanban para acompanhamento de conversas WhatsApp com pacientes, incluindo sistema de score e ranqueamento baseado em aderência ao plano alimentar.

## ✅ Implementado

### 1. Estrutura de Dados (Firestore)

**Coleções criadas:**

#### `whatsappConversations`
```typescript
{
  id: string,
  patientId: string,
  patientName: string,
  patientPhone: string,
  prescriberId: string,
  status: 'active' | 'waiting' | 'needs_attention' | 'urgent',
  score: {
    patientId: string,
    totalScore: number, // 0-100
    adherencePercentage: number,
    mealsLogged: number,
    correctMeals: number,
    lastMealDate: Date,
    consecutiveDays: number,
    badges: string[],
    updatedAt: Date
  },
  lastMessage: {
    content: string,
    timestamp: Date,
    senderType: 'patient' | 'system' | 'prescriber',
    sentiment: 'positive' | 'neutral' | 'negative'
  },
  lastMessageAt: Date,
  unreadCount: number,
  totalMessages: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### `whatsappMessages`
```typescript
{
  id: string,
  conversationId: string,
  patientId: string,
  senderId: string,
  senderName: string,
  senderType: 'patient' | 'system' | 'prescriber',
  content: string,
  timestamp: Date,
  isFromPatient: boolean,
  hasImage: boolean,
  imageUrl?: string,
  sentiment?: 'positive' | 'neutral' | 'negative',
  analyzed: boolean
}
```

### 2. Sistema de Score

**Componentes do Score (Total: 100 pontos):**

- **Frequência de Refeições (30 pontos):** Baseado no número de refeições registradas
- **Aderência ao Plano (40 pontos):** % de refeições corretas seguindo o plano
- **Consistência (20 pontos):** Sequência de dias consecutivos
- **Qualidade (10 pontos):** Qualidade das refeições + bonus de imagem

**Categorização Automática:**

- 🔥 **Alta Aderência:** Score ≥ 80% (Verde)
- ✅ **Aderência Boa:** Score 60-79% (Azul)
- ⚠️ **Precisa Atenção:** Score 40-59% (Amarelo)
- 🚨 **Urgente:** Score < 40% (Vermelho)

### 3. Sistema de Badges

**Badges Conquistáveis:**

- 🏆 **Campeão:** 100% de aderência por 1 semana
- 🔥 **Sequência 7 dias:** 7+ dias consecutivos
- 💪 **Sequência 30 dias:** 30+ dias consecutivos
- ⭐ **Estrela:** 50+ refeições registradas
- 🎯 **Focado:** 90%+ de aderência
- 👑 **Top 3:** Entre os 3 melhores do mês

### 4. Interface Kanban

**Componentes Criados:**

- ✅ `WhatsAppKanbanBoard.tsx` - Board principal com colunas
- ✅ `WhatsAppConversationCard.tsx` - Cards individuais
- ✅ `WhatsAppConversationModal.tsx` - Modal de conversa
- ✅ `/app/(dashboard)/whatsapp/page.tsx` - Página principal
- ✅ `scoreCalculator.ts` - Sistema de cálculo de score

**Funcionalidades:**

- ✅ Visualização horizontal com scroll
- ✅ 4 colunas categorizadas por aderência
- ✅ Cards com informações de score, badges, última mensagem
- ✅ Estatísticas gerais no topo
- ✅ Modal para visualizar conversa completa
- ✅ Envio de mensagens para pacientes
- ✅ Tempo real com Firestore listeners

## 🔄 Integração N8N - Próximos Passos

### Workflow 1: Receber Mensagens WhatsApp

**Função:** Capturar mensagens enviadas pelos pacientes via WhatsApp

**Estrutura:**

1. **Webhook Trigger** - Recebe mensagem do WhatsApp Business API
2. **Identificar Paciente** - Busca o patientId no Firestore pelo número
3. **Salvar Mensagem** - Adiciona documento em `whatsappMessages`
4. **Atualizar Conversa** - Atualiza `lastMessage` e `unreadCount` em `whatsappConversations`
5. **Análise de Sentimento** (Opcional) - Usar OpenAI para detectar sentimento
6. **Notificar Prescritor** - Enviar notificação se mensagem for urgente

**Exemplo de Dados do Webhook:**
```json
{
  "from": "+5511999998888",
  "message": "Acabei de almoçar! Frango com legumes",
  "timestamp": "2025-11-11T15:30:00Z",
  "hasMedia": false
}
```

**Código N8N:**
```javascript
// Node: Salvar Mensagem
const conversationId = $json.conversationId;
const patientId = $json.patientId;

return {
  json: {
    conversationId,
    patientId,
    senderId: patientId,
    senderName: $json.patientName,
    senderType: 'patient',
    content: $json.message,
    timestamp: new Date(),
    isFromPatient: true,
    hasImage: $json.hasMedia || false,
    analyzed: false
  }
};
```

### Workflow 2: Processar Refeição Registrada

**Função:** Quando paciente registra uma refeição, atualizar o score

**Estrutura:**

1. **Firestore Trigger** - Detecta nova refeição em `meals`
2. **Buscar Histórico** - Pega últimas refeições do paciente
3. **Calcular Score** - Usa lógica do `scoreCalculator.ts`
4. **Verificar Badges** - Checa se conquistou novos badges
5. **Atualizar Conversa** - Atualiza score em `whatsappConversations`
6. **Enviar Parabenização** - Se conquistou badge, envia mensagem automática

**Código N8N:**
```javascript
// Node: Calcular Score
const meals = $json.meals; // Array de refeições
const correctMeals = meals.filter(m => m.isCorrect).length;
const adherencePercentage = Math.round((correctMeals / meals.length) * 100);

// Calcular dias consecutivos
const consecutiveDays = calculateConsecutiveDays(meals);

// Score total
const totalScore = Math.min(100, 
  (meals.length / 42 * 30) + // Frequência
  (adherencePercentage / 100 * 40) + // Aderência
  (Math.min(consecutiveDays / 7, 1) * 20) + // Consistência
  10 // Qualidade base
);

return {
  json: {
    patientId: $json.patientId,
    totalScore: Math.round(totalScore),
    adherencePercentage,
    mealsLogged: meals.length,
    correctMeals,
    consecutiveDays,
    updatedAt: new Date()
  }
};
```

### Workflow 3: Enviar Mensagem do Prescritor

**Função:** Enviar mensagens do prescritor para o paciente via WhatsApp

**Estrutura:**

1. **Firestore Trigger** - Detecta nova mensagem de prescritor em `whatsappMessages`
2. **Buscar Telefone** - Pega telefone do paciente
3. **Enviar WhatsApp** - Usa API do WhatsApp Business
4. **Confirmar Envio** - Marca mensagem como enviada

### Workflow 4: Alertas Automáticos

**Função:** Monitorar pacientes que precisam de atenção

**Estrutura:**

1. **Schedule Trigger** - Roda diariamente às 9h
2. **Buscar Conversas** - Pega todas as conversas ativas
3. **Filtrar Problemas** - Identifica pacientes:
   - Score < 40%
   - Sem mensagem há 2+ dias
   - Sem refeição registrada há 1+ dia
4. **Criar Notificações** - Adiciona em `notifications` para o prescritor
5. **Enviar Email** - Email resumo para o prescritor

## 📊 Regras de Firestore

**Adicionar em `firestore.rules`:**

```javascript
// WhatsApp Conversations
match /whatsappConversations/{conversationId} {
  allow read: if isAuthenticated() && (
    resource.data.prescriberId == request.auth.uid ||
    resource.data.patientId == request.auth.uid
  );
  
  allow create, update: if isAuthenticated() && (
    isPrescriber() || isAdmin()
  );
  
  allow list: if isPrescriber() || isAdmin();
}

// WhatsApp Messages
match /whatsappMessages/{messageId} {
  allow read: if isAuthenticated() && (
    get(/databases/$(database)/documents/whatsappConversations/$(resource.data.conversationId)).data.prescriberId == request.auth.uid ||
    get(/databases/$(database)/documents/whatsappConversations/$(resource.data.conversationId)).data.patientId == request.auth.uid
  );
  
  allow create: if isAuthenticated();
  
  allow list: if isAuthenticated();
}
```

## 🚀 Como Usar

### Para Desenvolvedores

1. **Acessar Dashboard:**
   - Login como Admin ou Prescritor
   - Clicar em "WhatsApp" no menu lateral
   - Ver o Kanban Board com conversas

2. **Dados Mock:**
   - Sistema usa dados simulados para demonstração
   - 5 conversas exemplo com diferentes scores
   - Para usar dados reais, conectar N8N workflows

3. **Testar Score:**
   ```typescript
   import { calculatePatientScore, generateMockMealData } from '@/lib/scoreCalculator';
   
   const meals = generateMockMealData('patientId', 7);
   const score = calculatePatientScore({
     patientId: 'test123',
     meals,
     currentStreak: 5,
     existingBadges: []
   });
   
   console.log(score); // { totalScore: 85, adherencePercentage: 90, ... }
   ```

### Para Prescritores

1. **Visualizar Pacientes:**
   - Cards organizados por aderência
   - Ver score, badges, última mensagem
   - Identificar rapidamente quem precisa de atenção

2. **Interagir com Pacientes:**
   - Clicar no card para abrir conversa completa
   - Ver histórico de mensagens
   - Enviar mensagens direto pelo sistema
   - Mensagens são enviadas via WhatsApp automaticamente

3. **Monitorar Progresso:**
   - Badges indicam conquistas
   - Sequência de dias mostra consistência
   - Score geral resume desempenho

## 🔧 Configuração N8N

### Variáveis de Ambiente N8N

```env
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages
WHATSAPP_ACCESS_TOKEN=your_whatsapp_business_access_token
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

# Firebase (para N8N)
FIREBASE_PROJECT_ID=nutribuddy-2fc9c
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# OpenAI (análise de sentimento)
OPENAI_API_KEY=sk-...
```

### Endpoints

- **Receber WhatsApp:** `https://your-n8n.app/webhook/whatsapp/receive`
- **Enviar WhatsApp:** `https://your-n8n.app/webhook/whatsapp/send`
- **Atualizar Score:** `https://your-n8n.app/webhook/score/update`

## 📈 Próximas Melhorias

- [ ] Filtros por período (hoje, semana, mês)
- [ ] Gráficos de evolução de score
- [ ] Ranking mensal de pacientes
- [ ] Exportar relatórios em PDF
- [ ] Notificações push para prescritores
- [ ] Chat em tempo real com WebSocket
- [ ] Análise automática de imagens de refeições
- [ ] Sugestões automáticas de intervenção

## 🎉 Conclusão

O sistema de WhatsApp Kanban está completamente implementado no frontend com:

✅ Interface visual responsiva e moderna
✅ Sistema de score robusto e configurável
✅ Badges e gamificação para engajar pacientes
✅ Visualização em tempo real
✅ Pronto para integração com N8N

**Para ativar completamente:** Configure os workflows N8N conforme documentação acima.

