# 🚀 COMO USAR O DASHBOARD WHATSAPP KANBAN

## 📍 Acesso Rápido

### 1. Iniciar o Frontend
```bash
cd frontend
npm run dev
```

Frontend rodará em: **http://localhost:3001**

### 2. Fazer Login
- Acesse: `http://localhost:3001/login`
- Entre com credenciais de **Admin** ou **Prescritor**
- (Pacientes não têm acesso a este dashboard)

### 3. Abrir Dashboard WhatsApp
- No menu lateral, clique em **"WhatsApp"** (ícone de mensagem)
- Ou acesse direto: `http://localhost:3001/whatsapp`

## 🎯 O Que Você Verá

### Topo: Estatísticas Gerais
```
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ Total de Conversas  │ Score Médio         │ Alta Aderência      │ Precisam Atenção    │
│       5             │      85%            │        2            │         2           │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

### Kanban Board (4 Colunas Horizontais)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  🔥 Alta Aderência  │  │  ✅ Aderência Boa   │  │  ⚠️ Precisa Atenção │  │  🚨 Urgente         │
│     (Score ≥ 80%)   │  │    (Score 60-79%)   │  │    (Score 40-59%)   │  │    (Score < 40%)    │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │  │                     │
│  Maria Silva        │  │  João Santos        │  │  Ana Costa          │  │  Carlos Pereira     │
│  Score: 95          │  │  Score: 72          │  │  Score: 55          │  │  Score: 32          │
│  🏆 🔥             │  │  ⭐                │  │                     │  │                     │
│  Refeições: 41/45   │  │  Refeições: 15/20   │  │  Refeições: 6/12    │  │  Refeições: 2/6     │
│  Aderência: ✅      │  │  Aderência: 👍      │  │  Aderência: ⚠️      │  │  Aderência: 🚨      │
│  7 dias sequência   │  │  5 dias sequência   │  │  2 dias sequência   │  │  0 dias sequência   │
│  "Acabei de         │  │  "Ótimo trabalho!"  │  │  "Estou com         │  │  "Não consegui      │
│   almoçar! 🥗"      │  │                     │  │   dificuldade..."   │  │   fazer..."         │
│  há 30 min          │  │  há 2h              │  │  há 5h              │  │  há 1 dia           │
│  📩 1 nova          │  │                     │  │  📩 2 novas         │  │  📩 3 novas         │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
         ↓ CLIQUE           ↓ CLIQUE                ↓ CLIQUE                 ↓ CLIQUE
   Abre modal de       Abre modal de           Abre modal de           Abre modal de
     conversa             conversa                conversa                conversa
```

## 💬 Modal de Conversa (Ao Clicar no Card)

```
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Maria Silva                           📊 Score: 95      [X Fechar]│
│  +5511999998888                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  Aderência: 90%  │  Refeições: 41/45  │  Sequência: 7 dias  │ Badges: 2│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Sistema:                                                             │
│  Oi Maria! Comece a seguir o plano alimentar hoje 😊                 │
│  há 2 dias                                                            │
│                                                                       │
│                                        Maria Silva: 😊                │
│                      Acabei o café da manhã! Ovos e abacate 🥚🥑    │
│                                                         há 1 dia      │
│                                                                       │
│  Sistema:                                                             │
│  Ótimo! Continue assim. Registre todas as refeições.                 │
│  há 1 dia                                                             │
│                                                                       │
│                                        Maria Silva: 😊                │
│                             Almoço pronto! Frango com legumes 🍗🥗    │
│                                                         há 30 min     │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  [Digite sua mensagem...]                               [📤 Enviar]  │
│  💡 Esta mensagem será enviada via WhatsApp através do sistema N8N   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎮 Como Interagir

### 1. Visualizar Pacientes
- **Scroll horizontal** → Deslize para ver todas as colunas
- **Cores** → Verde (ótimo), Azul (bom), Amarelo (atenção), Vermelho (urgente)
- **Badges** → Mostram conquistas (🏆 campeão, 🔥 sequência, ⭐ estrela)

### 2. Priorizar Atendimento
- Comece pela coluna **🚨 Urgente** (vermelho)
- Depois veja **⚠️ Precisa Atenção** (amarelo)
- Parabenize os de **🔥 Alta Aderência** (verde)

### 3. Abrir Conversa
- **Clique no card** do paciente
- Veja histórico completo
- Envie mensagem de apoio/orientação
- Mensagem vai para WhatsApp do paciente

### 4. Enviar Mensagem
```
1. Digite a mensagem no campo
2. Clique em "Enviar" (ou Enter)
3. Mensagem aparece na conversa
4. N8N envia automaticamente via WhatsApp
```

### 5. Atualizar Dados
- Clique no botão **"Atualizar"** no topo
- Dados são atualizados em tempo real automaticamente

## 📊 Entendendo o Score

### Score Total: 0-100 pontos

```
┌─────────────────────────────────────────┐
│  COMPONENTES DO SCORE                   │
├─────────────────────────────────────────┤
│  30 pts │ Frequência de Refeições       │
│         │ (21 refeições/semana = 100%)  │
├─────────────────────────────────────────┤
│  40 pts │ Aderência ao Plano            │
│         │ (% refeições corretas)        │
├─────────────────────────────────────────┤
│  20 pts │ Consistência                  │
│         │ (dias consecutivos)           │
├─────────────────────────────────────────┤
│  10 pts │ Qualidade                     │
│         │ (qualidade + fotos)           │
└─────────────────────────────────────────┘
```

### Categorias Automáticas

| Score | Categoria | Cor | O Que Fazer |
|-------|-----------|-----|-------------|
| 80-100 | 🔥 Alta Aderência | Verde | Parabenizar! Manter motivado |
| 60-79 | ✅ Aderência Boa | Azul | Encorajar a continuar |
| 40-59 | ⚠️ Precisa Atenção | Amarelo | Identificar dificuldades |
| 0-39 | 🚨 Urgente | Vermelho | Intervir imediatamente |

## 🏅 Badges (Conquistas)

### Como Funcionam
- Conquistadas **automaticamente** quando critérios são atingidos
- Aparecem no card do paciente
- Motivam a continuar

### Lista de Badges

| Badge | Nome | Critério |
|-------|------|----------|
| 🏆 | Campeão | 100% de aderência por 1 semana |
| 🔥 | Sequência 7 dias | 7+ dias consecutivos |
| 💪 | Dedicado | 30+ dias consecutivos |
| ⭐ | Estrela | 50+ refeições registradas |
| 🎯 | Focado | 90%+ de aderência |
| 👑 | Top 3 | Entre os 3 melhores do mês |

## 🎯 Casos de Uso Práticos

### Caso 1: Paciente com Alta Aderência
```
Situação: Maria está com score 95, streak de 7 dias, badges 🏆 🔥
Ação: Enviar mensagem de parabenização
Mensagem: "Parabéns Maria! 🎉 Você está arrasando com 7 dias 
          consecutivos! Continue assim, você é exemplo! 💪"
```

### Caso 2: Paciente Precisando Atenção
```
Situação: Ana está com score 55, apenas 2 dias de sequência
Ação: Identificar dificuldades e oferecer suporte
Mensagem: "Oi Ana! Vi que você está enfrentando algumas 
          dificuldades. Posso te ajudar? O que está sendo 
          mais difícil no plano? Vamos ajustar juntos! 😊"
```

### Caso 3: Paciente Urgente
```
Situação: Carlos com score 32, sem sequência, 1 dia sem mensagem
Ação: Contato imediato
Mensagem: "Carlos, tudo bem? Vi que você está com dificuldade 
          para seguir o plano. Vamos conversar hoje? Quero 
          entender o que está acontecendo e te ajudar! 🤝"
```

### Caso 4: Paciente Conquistou Badge
```
Situação: João acabou de conquistar badge "Sequência 7 dias" 🔥
Ação: Sistema envia automaticamente (via N8N)
Mensagem: "🎉 PARABÉNS JOÃO! Você conquistou o badge 
          'Sequência 7 dias'! 🔥 Continue assim, você está 
          no caminho certo! 💪"
```

## 📱 Integração WhatsApp (Via N8N)

### Como Funciona (Fluxo Completo)

```
1. Paciente envia mensagem no WhatsApp
   ↓
2. WhatsApp Business API recebe
   ↓
3. Webhook N8N é acionado
   ↓
4. N8N salva mensagem no Firestore
   ↓
5. Dashboard atualiza em tempo real
   ↓
6. Você vê a mensagem no card/modal
   ↓
7. Você responde pelo dashboard
   ↓
8. N8N envia via WhatsApp
   ↓
9. Paciente recebe no WhatsApp dele
```

### Status Atual
- ✅ Frontend completamente funcional
- ✅ Interface para enviar/receber mensagens
- ✅ Dados mock para demonstração
- 🔄 Aguardando configuração dos workflows N8N
- 🔄 Aguardando WhatsApp Business API

## 🔧 Configuração N8N (Próximo Passo)

Para ativar completamente, veja:
- **`WHATSAPP-KANBAN-INTEGRACAO-N8N.md`** - Guia completo
- **4 workflows** precisam ser configurados
- **WhatsApp Business API** precisa ser conectada
- **Variáveis de ambiente** precisam ser configuradas

## 💡 Dicas de Uso

### 1. Rotina Diária Sugerida
```
🌅 Manhã (9h)
- Abrir Dashboard WhatsApp
- Ver coluna "Urgente" primeiro
- Responder mensagens não lidas
- Parabenizar quem está bem

🌆 Tarde (14h)
- Verificar novos pacientes em "Precisa Atenção"
- Enviar mensagens de suporte
- Checar se alguém conquistou badge

🌙 Noite (20h)
- Revisar score médio do dia
- Planejar intervenções para amanhã
```

### 2. Mensagens Padrão Sugeridas

**Para Alta Aderência:**
```
"Parabéns {nome}! 🎉 Seu score está incrível em {score}! 
Continue assim, você é exemplo para outros pacientes! 💪"
```

**Para Aderência Boa:**
```
"Olá {nome}! 😊 Você está indo muito bem com {score} de score! 
Vamos tentar chegar aos 80% essa semana? Você consegue! 🎯"
```

**Para Precisa Atenção:**
```
"Oi {nome}! Vi que você está com {score} de score. 
Tem algo que posso ajudar? Vamos ajustar o plano juntos? 🤝"
```

**Para Urgente:**
```
"{nome}, tudo bem? Estou preocupado com seu score de {score}. 
Podemos conversar hoje? Quero muito te ajudar! 💚"
```

## 📈 Métricas para Acompanhar

### Diariamente
- Total de conversas ativas
- Score médio de todos os pacientes
- Quantos estão em "Urgente"
- Quantos conquistaram badges hoje

### Semanalmente
- Evolução do score médio
- Pacientes que subiram de categoria
- Pacientes que caíram de categoria
- Total de badges conquistadas

### Mensalmente
- Ranking dos 10 melhores pacientes
- Taxa de aderência geral
- Número de dias consecutivos (média)
- Total de refeições registradas

## 🎉 Resumo

**O Dashboard WhatsApp Kanban permite:**

✅ Visualizar todos os pacientes em um só lugar
✅ Priorizar quem precisa de atenção urgente
✅ Acompanhar progresso com score objetivo
✅ Motivar através de badges e gamificação
✅ Comunicar direto pelo WhatsApp
✅ Monitorar métricas em tempo real
✅ Escalar atendimento de forma eficiente

**É como ter um "Trello" + WhatsApp + Sistema de Score, tudo integrado!**

---

Dúvidas? Veja a documentação completa em:
- **`DASHBOARD-WHATSAPP-RESUMO.md`** - Visão geral técnica
- **`WHATSAPP-KANBAN-INTEGRACAO-N8N.md`** - Integração detalhada

