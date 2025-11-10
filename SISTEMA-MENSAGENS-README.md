# 💬 Sistema de Mensagens NutriBuddy

## 🎯 Visão Geral

Sistema completo de mensagens em tempo real entre prescritores e pacientes, com automação via N8N e interface Kanban para gestão eficiente de conversas.

---

## ✨ Features Implementadas

### Para Prescritores
- ✅ **Dashboard Kanban** - Gestão visual de conversas em 4 colunas
- ✅ **Chat em Tempo Real** - Responda diretamente pelo board
- ✅ **Priorização Automática** - IA detecta urgência e prioriza
- ✅ **Histórico Completo** - Todo histórico de conversas do paciente
- ✅ **Estatísticas** - Métricas de resposta e engajamento
- ✅ **Resumo Diário** - Email com resumo de conversas
- ✅ **Templates** (em breve) - Respostas rápidas salvas

### Para Pacientes
- ✅ **Chat Simples** - Interface limpa e intuitiva
- ✅ **Status de Leitura** - Veja quando mensagens foram lidas
- ✅ **Auto-resposta** - Confirmação automática em 2 minutos
- ✅ **Notificações** - Badge de mensagens não lidas
- ✅ **Histórico** - Acesso a todas conversas anteriores

### Automações N8N
- ✅ **Auto-resposta Inicial** - Resposta automática se prescritor não responder em 2min
- ✅ **Análise de Sentimento** - IA analisa urgência e categoriza mensagens
- ✅ **Sugestões de Resposta** - IA sugere 3 respostas contextualizadas
- ✅ **Follow-up Automático** - Check-in após 7 dias de conversa resolvida
- ✅ **Resumo Diário** - Email com estatísticas e conversas urgentes

---

## 📁 Estrutura de Arquivos

```
NutriBuddy/
├── routes/
│   └── messages.js                    # API endpoints de mensagens
│
├── frontend/src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── messages/
│   │   │       └── page.tsx          # Página Kanban (prescritores)
│   │   └── (patient)/
│   │       └── chat/
│   │           └── page.tsx          # Página Chat (pacientes)
│   │
│   └── components/
│       ├── chat/
│       │   ├── ChatInterface.tsx      # Componente principal do chat
│       │   ├── ChatInput.tsx          # Input de mensagens
│       │   └── MessageBubble.tsx      # Bolha de mensagem
│       │
│       └── kanban/
│           ├── KanbanBoard.tsx        # Board principal
│           ├── KanbanColumn.tsx       # Coluna do Kanban
│           └── KanbanCard.tsx         # Card de conversa
│
├── n8n-workflows/
│   ├── 1-autoresposta-inicial.json
│   ├── 2-analise-sentimento.json
│   ├── 3-sugestoes-resposta.json
│   ├── 4-followup-automatico.json
│   └── 5-resumo-diario.json
│
└── docs/
    ├── SISTEMA-MENSAGENS-ESTRUTURA.md  # Arquitetura completa
    ├── SETUP-SISTEMA-MENSAGENS.md      # Guia de instalação
    ├── GUIA-USO-MENSAGENS.md           # Manual de uso
    └── SISTEMA-MENSAGENS-README.md     # Este arquivo
```

---

## 🚀 Quick Start

### 1. Backend
```bash
cd /Users/drpgjr.../NutriBuddy
node server.js
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. N8N (Docker)
```bash
cd ~/.n8n
docker-compose up -d
```

### 4. Acessar

**Prescritor:**
```
http://localhost:3001/messages
```

**Paciente:**
```
http://localhost:3001/chat
```

**N8N:**
```
http://localhost:5678
```

---

## 📊 Endpoints API

### Conversas
```
GET    /api/messages/conversations              # Listar conversas
GET    /api/messages/conversations/:id          # Detalhes da conversa
POST   /api/messages/conversations              # Criar conversa
PATCH  /api/messages/conversations/:id          # Atualizar (status/kanban)
DELETE /api/messages/conversations/:id          # Arquivar conversa
```

### Mensagens
```
GET    /api/messages/conversations/:id/messages # Listar mensagens
POST   /api/messages/conversations/:id/messages # Enviar mensagem
PATCH  /api/messages/:id/read                   # Marcar como lida
GET    /api/messages/unread-count               # Contador de não lidas
```

### Templates
```
GET    /api/messages/templates                  # Listar templates
POST   /api/messages/templates                  # Criar template
PUT    /api/messages/templates/:id              # Atualizar
DELETE /api/messages/templates/:id              # Deletar
```

### Webhooks (N8N)
```
POST   /api/messages/webhook/new-message        # Webhook nova mensagem
POST   /api/messages/webhook/ai-response        # Webhook resposta IA
GET    /api/messages/webhook/conversation-context/:id  # Contexto para IA
```

---

## 🔥 Firestore Schema

### Collection: `conversations`
```javascript
{
  patientId: string,
  prescriberId: string,
  status: 'new' | 'active' | 'waiting' | 'resolved' | 'archived',
  kanbanColumn: 'new' | 'in-progress' | 'waiting-response' | 'resolved',
  lastMessage: string,
  lastMessageAt: timestamp,
  lastMessageBy: 'patient' | 'prescriber' | 'system',
  unreadCount: number,
  patientUnreadCount: number,
  priority: 'low' | 'medium' | 'high',
  tags: string[],
  metadata: {
    patientName: string,
    patientEmail: string,
    prescriberName: string
  }
}
```

### SubCollection: `conversations/{id}/messages`
```javascript
{
  conversationId: string,
  senderId: string,
  senderRole: 'patient' | 'prescriber' | 'system',
  content: string,
  type: 'text' | 'image' | 'file' | 'system' | 'ai-response',
  status: 'sent' | 'delivered' | 'read',
  isAiGenerated: boolean,
  createdAt: timestamp
}
```

---

## 🤖 Workflows N8N

### 1. Auto-resposta Inicial
**Trigger:** Nova conversa criada  
**Ação:** Aguardar 2min → Verificar se prescritor respondeu → Enviar auto-resposta

### 2. Análise de Sentimento
**Trigger:** Nova mensagem do paciente  
**Ação:** Analisar com IA → Se urgente: marcar prioridade + enviar email

### 3. Sugestões de Resposta
**Trigger:** Prescritor abre conversa  
**Ação:** Buscar contexto → Gerar 3 sugestões com IA → Exibir

### 4. Follow-up Automático
**Trigger:** Diariamente às 9h  
**Ação:** Buscar conversas resolvidas há 7+ dias → Enviar check-in

### 5. Resumo Diário
**Trigger:** Diariamente às 9h  
**Ação:** Buscar estatísticas → Gerar email HTML → Enviar para prescritor

---

## 🎨 Design System

### Cores do Kanban

- **Novas (Azul):** `#3B82F6`
- **Em Atendimento (Roxo):** `#8B5CF6`
- **Aguardando (Amarelo):** `#F59E0B`
- **Resolvidas (Verde):** `#10B981`

### Prioridades

- **Alta:** Vermelho `#EF4444`
- **Média:** Azul `#3B82F6`
- **Baixa:** Cinza `#6B7280`

### Componentes Tailwind

Todos os componentes usam:
- `framer-motion` para animações
- `lucide-react` para ícones
- Tailwind CSS para estilização
- Design responsivo mobile-first

---

## 🔒 Permissões

### Paciente pode:
- ✅ Ver suas próprias conversas
- ✅ Enviar mensagens
- ❌ Ver conversas de outros
- ❌ Acessar Kanban

### Prescritor pode:
- ✅ Ver conversas de seus pacientes
- ✅ Mover cards no Kanban
- ✅ Ver histórico completo
- ✅ Criar templates
- ❌ Ver pacientes de outros prescritores

### Admin pode:
- ✅ Tudo
- ✅ Ver todas conversas
- ✅ Configurar automações

---

## 📈 Métricas

O sistema rastreia:
- Total de conversas
- Novas conversas (24h, 7d)
- Taxa de resposta
- Tempo médio de resposta
- Conversas por status
- Conversas urgentes
- Pacientes ativos em chat

---

## 🧪 Testes

### Teste Manual Rápido

```bash
# 1. Criar conversa
curl -X POST http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prescriberId":"PRESCRIBER_ID","initialMessage":"Teste"}'

# 2. Enviar mensagem
curl -X POST http://localhost:3000/api/messages/conversations/CONV_ID/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Mensagem de teste"}'

# 3. Buscar conversas
curl http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module './routes/messages'"
```bash
ls -la routes/messages.js
# Se não existir, recrie o arquivo
```

### Erro: Firestore permission denied
- Verifique Firestore Rules
- Verifique se usuário está autenticado
- Verifique role do usuário

### Erro: N8N não responde
```bash
docker logs nutribuddy-n8n -f
# Verifique variáveis de ambiente
# Verifique se workflow está ativo
```

### Chat não atualiza
- Polling a cada 3 segundos
- Verifique console do navegador (F12)
- Verifique se backend está rodando

---

## 📚 Documentação Completa

1. **[Estrutura](./SISTEMA-MENSAGENS-ESTRUTURA.md)** - Arquitetura e schema
2. **[Setup](./SETUP-SISTEMA-MENSAGENS.md)** - Instalação passo a passo
3. **[Guia de Uso](./GUIA-USO-MENSAGENS.md)** - Como usar o sistema
4. **[README](./SISTEMA-MENSAGENS-README.md)** - Este arquivo

---

## 🔄 Roadmap

### V1 (Implementado) ✅
- Sistema de mensagens básico
- Interface Kanban
- Chat em tempo real
- 5 workflows N8N
- Auto-resposta
- Análise de urgência

### V2 (Próximo) 🚧
- Templates de resposta
- Drag & drop no Kanban
- Notificações push
- Upload de imagens
- Busca avançada
- Analytics detalhado

### V3 (Futuro) 📅
- Chatbot completo
- WhatsApp integration
- Vídeo chamadas
- Transcrição de áudio
- Multi-idioma
- App mobile

---

## 👥 Contribuindo

Este sistema foi desenvolvido como parte do NutriBuddy. Para contribuir:

1. Teste o sistema
2. Reporte bugs
3. Sugira melhorias
4. Documente uso real

---

## 📝 Changelog

### v1.0.0 (Novembro 2024)
- ✅ Sistema de mensagens completo
- ✅ Interface Kanban para prescritores
- ✅ Chat para pacientes
- ✅ 5 workflows N8N funcionais
- ✅ Documentação completa
- ✅ Setup automatizado

---

## 🎉 Créditos

- **Backend:** Express.js + Firebase
- **Frontend:** Next.js 14 + Tailwind CSS
- **Automação:** N8N + OpenAI
- **Design:** Framer Motion + Lucide Icons
- **Deploy:** Docker + Vercel

---

## 📞 Suporte

- **Documentação:** Ver arquivos `.md` na pasta raiz
- **Logs:** `docker logs nutribuddy-n8n -f`
- **Issues:** Verifique console do navegador
- **Email:** suporte@nutribuddy.com

---

**🚀 Sistema 100% funcional e pronto para uso!**

Desenvolvido com ❤️ para NutriBuddy

