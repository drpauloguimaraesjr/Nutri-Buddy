# 🤖 Guia: Chat com IA - NutriBot

## 🎯 O Que é o NutriBot?

NutriBot é seu assistente nutricional pessoal alimentado por IA (Google Gemini 1.5 Flash). Ele conhece seu perfil, suas metas, suas refeições recentes e pode ajudar com:

- 💬 Responder dúvidas sobre nutrição
- 📊 Analisar suas refeições
- 💡 Sugerir melhorias no seu plano alimentar
- 🍽️ Recomendar alternativas saudáveis
- 📈 Avaliar seu progresso
- 🎯 Ajustar suas metas

---

## ✨ Características Principais

### 🧠 Contexto Inteligente
O NutriBot tem acesso ao seu perfil:
- ✅ Suas metas nutricionais (calorias, macros)
- ✅ Suas refeições de hoje e ontem
- ✅ Seu consumo de água
- ✅ Seus exercícios
- ✅ Seu objetivo (perder/ganhar/manter peso)
- ✅ Seu saldo calórico atual

### 💬 Conversa Natural
- Responde em português brasileiro
- Usa emojis para facilitar leitura
- Mantém contexto da conversa
- Personaliza respostas baseadas no seu perfil

### 🎯 Sugestões Personalizadas
- Perguntassuggeridas baseadas no seu progresso
- Adapta-se ao seu objetivo (perda/ganho de peso)
- Considera seu saldo calórico do dia

---

## 🚀 Como Usar

### 1. Acessar o Chat
**Via Web App:**
```
http://localhost:3001/dashboard/chat
```

**Via WhatsApp:**
O NutriBot também está disponível via WhatsApp (veja `GUIA-WHATSAPP-INTEGRADO.md`)

---

### 2. Fazer Perguntas

#### Perguntas Gerais sobre Nutrição:
```
"O que é índice glicêmico?"
"Quantas proteínas devo comer por dia?"
"Carboidratos engordam?"
"Qual a melhor fonte de ômega-3?"
```

#### Análise de Refeições:
```
"Pode analisar minha última refeição?"
"O que você acha do meu café da manhã de hoje?"
"Meu almoço estava saudável?"
"Comi muito no jantar?"
```

#### Sugestões e Alternativas:
```
"O que posso comer para jantar?"
"Preciso de ideias para lanches saudáveis"
"Como aumentar minha ingestão de proteínas?"
"Alternativas saudáveis para açúcar"
```

#### Avaliação de Progresso:
```
"Como está meu progresso hoje?"
"Estou no caminho certo?"
"O que preciso melhorar?"
"Vou conseguir bater minha meta?"
```

#### Ajustes e Metas:
```
"Como ajustar minhas metas?"
"Quanto devo comer para perder peso?"
"Estou comendo pouco?"
"Meu saldo calórico está bom?"
```

---

## 💡 Exemplos de Conversas

### Exemplo 1: Análise de Refeição
```
Você: Pode analisar minha última refeição?

NutriBot: 📊 Claro! Vi que você comeu:
• Frango grelhado (150g) - 165 kcal
• Arroz integral (100g) - 123 kcal
• Brócolis (80g) - 27 kcal

Total: 315 kcal

✅ Análise: Excelente refeição! Está bem equilibrada:
- ✅ Boa quantidade de proteínas (35g)
- ✅ Carboidratos complexos
- ✅ Fibras do brócolis
- ⚠️ Poderia adicionar uma gordura saudável (azeite, abacate)

💡 Sugestão: Na próxima, adicione 1 colher de azeite (40 kcal) 
para melhorar absorção de vitaminas! 🥑
```

### Exemplo 2: Sugestões de Lanches
```
Você: Preciso de ideias para lanches saudáveis

NutriBot: 🍎 Aqui vão algumas opções deliciosas e nutritivas:

🥜 Opção 1 (180 kcal):
• 30g de castanhas mistas
• 1 maçã pequena

🥤 Opção 2 (150 kcal):
• Iogurte grego natural
• 1 colher de mel
• Canela a gosto

🥑 Opção 3 (200 kcal):
• 2 torradas integrais
• 1/4 de abacate amassado
• Tomate e sal

🍌 Opção 4 (160 kcal):
• 1 banana
• 2 colheres de pasta de amendoim

Todas se encaixam bem nas suas metas! Qual te interessou mais? 😊
```

### Exemplo 3: Avaliação de Progresso
```
Você: Como está meu progresso hoje?

NutriBot: 📈 Vamos ver como você está hoje:

🍽️ Alimentação:
• Consumidas: 1,450 kcal / 2,000 kcal (73%)
• Proteínas: 85g / 150g ✅
• Carboidratos: 180g / 250g
• Gorduras: 45g / 65g

🏃 Atividade:
• 30 min de corrida
• ~180 kcal queimadas

💧 Hidratação:
• 1,500ml / 2,500ml (60%)

⚖️ Saldo: +1,270 kcal

💡 Avaliação: Você está indo bem! Algumas dicas:
✅ Proteínas estão ótimas
⚠️ Falta beber mais água (1L ainda)
⚠️ Ainda pode comer ~550 kcal hoje

Continue assim! 💪
```

---

## 🔧 Endpoints da API

### POST /api/chat/message
Envia mensagem e recebe resposta.

**Request:**
```json
{
  "userId": "user123",
  "message": "Como aumentar proteínas?",
  "conversationId": "conv_123" // opcional
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_1730678400_abc123",
  "message": "🥚 Ótima pergunta! Aqui estão as melhores formas...",
  "timestamp": "2025-11-03T..."
}
```

### POST /api/chat/new
Cria nova conversa.

**Request:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_1730678400_xyz789",
  "welcomeMessage": "👋 Olá! Sou o NutriBot..."
}
```

### GET /api/chat/suggestions?userId=user123
Obtém sugestões personalizadas.

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "💪 Como posso aumentar minha ingestão de proteínas?",
    "🥗 Quais alimentos são bons para perder peso?",
    "📊 Como está meu progresso hoje?"
  ]
}
```

### GET /api/chat/history/:conversationId?userId=user123
Obtém histórico de conversa.

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_123",
  "history": [
    {
      "role": "user",
      "content": "Como aumentar proteínas?",
      "timestamp": "2025-11-03T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Ótima pergunta!...",
      "timestamp": "2025-11-03T10:00:05Z"
    }
  ]
}
```

### GET /api/chat/status
Verifica se o chat está habilitado.

**Response:**
```json
{
  "enabled": true,
  "message": "✅ Chat com IA está funcionando!"
}
```

---

## 🔐 Contexto e Privacidade

### O que o NutriBot Sabe:
- ✅ Suas metas configuradas
- ✅ Suas refeições de hoje e ontem
- ✅ Seu consumo de água hoje
- ✅ Seus exercícios hoje
- ✅ Seu objetivo e peso
- ✅ Histórico desta conversa

### O que NÃO Sabe:
- ❌ Dados de outros usuários
- ❌ Conversas antigas (a menos que solicitado)
- ❌ Informações médicas sensíveis
- ❌ Dados não relacionados a nutrição

### Privacidade:
- Conversas são salvas no seu Firestore pessoal
- Apenas você tem acesso às suas conversas
- Dados não são compartilhados
- Cache local é limpo automaticamente

---

## 💾 Armazenamento

### Cache em Memória:
- Conversas recentes ficam em cache
- Acesso mais rápido
- Limpa automaticamente após inatividade

### Firestore:
- Histórico completo salvo
- Recuperável a qualquer momento
- Organizado por `conversationId`

**Coleção:** `chat_messages`
```javascript
{
  userId: "user123",
  conversationId: "conv_abc",
  messages: [
    { role: "user", content: "...", timestamp: "..." },
    { role: "assistant", content: "...", timestamp: "..." }
  ],
  createdAt: "2025-11-03T..."
}
```

---

## 🎯 Dicas de Uso

### ✅ Faça:
- Seja específico nas perguntas
- Pergunte sobre suas refeições recentes
- Peça análise do seu progresso
- Use as sugestões fornecidas
- Mantenha conversa natural

### ❌ Evite:
- Perguntas médicas complexas
- Diagnósticos de doenças
- Prescrições de medicamentos
- Informações não relacionadas a nutrição

---

## 🚀 Casos de Uso Avançados

### 1. Planejamento de Refeições
```
"Crie um plano de almoço para a semana que se encaixe 
nas minhas metas de 500 kcal por refeição"
```

### 2. Análise de Tendências
```
"Olhando minhas últimas refeições, o que você acha 
que eu preciso melhorar?"
```

### 3. Ajustes de Metas
```
"Não estou conseguindo comer toda proteína da meta. 
Como posso ajustar?"
```

### 4. Receitas Personalizadas
```
"Me dê uma receita de jantar com frango que tenha 
cerca de 400 kcal"
```

---

## 🐛 Troubleshooting

### "Chat não está respondendo"
```bash
# Verificar status
curl http://localhost:3000/api/chat/status

# Deve retornar: {"enabled": true}
```

### "IA não está habilitada"
- Configure `GOOGLE_AI_API_KEY` no `.env`
- Veja: `CONFIGURAR-GOOGLE-AI.md`

### "Respostas estão lentas"
- Normal: IA processa contexto completo
- Média: 2-5 segundos por resposta
- Cache acelera conversas contínuas

### "Contexto está desatualizado"
- Cache é atualizado automaticamente
- Inicie nova conversa para refresh completo
- Pergunte: "Como está meu progresso hoje?"

---

## 📱 Integração com WhatsApp

O NutriBot também funciona via WhatsApp! Todas as funcionalidades estão disponíveis.

Veja: `GUIA-WHATSAPP-INTEGRADO.md`

---

## 🎉 Recursos Futuros

### Em Desenvolvimento:
- [ ] Histórico de conversas na interface
- [ ] Múltiplas conversas simultâneas
- [ ] Análise de fotos via chat
- [ ] Lembretes via chat
- [ ] Exportar conversas

### Planejado:
- [ ] Voz para texto (áudio)
- [ ] Texto para voz (resposta falada)
- [ ] Videochamadas com IA
- [ ] Integração com calendário
- [ ] Compartilhamento de conversas com nutricionista

---

## 📊 Estatísticas de Uso

### Performance:
- ⚡ Resposta média: 2-4 segundos
- 📝 Contexto completo em cada mensagem
- 💾 Histórico ilimitado no Firestore
- 🔄 Cache inteligente para rapidez

### Limites:
- 📨 Sem limite de mensagens por dia
- ⏱️ Sem timeout de conversa
- 💬 Histórico completo preservado
- 🔁 Conversas ilimitadas

---

## 🎓 Baseado em Ciência

O NutriBot usa:
- ✅ Recomendações da OMS
- ✅ Diretrizes nutricionais brasileiras
- ✅ Estudos científicos atualizados
- ✅ Boas práticas de nutrição

**Sempre menciona que não substitui consulta profissional!**

---

## 🚀 Está Pronto para Usar!

Acesse agora:
```
http://localhost:3001/dashboard/chat
```

Ou teste via API:
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","message":"Olá!"}'
```

---

**Criado com ❤️ e Google Gemini 1.5 Flash**

