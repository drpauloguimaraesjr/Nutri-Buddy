# 🤖 Guia de Integração: Perfis de IA Personalizados no N8N

## 📋 Visão Geral

Este guia explica como integrar os perfis de IA personalizados nos seus workflows N8N existentes.

**O que muda:**
- Cada paciente pode ter um perfil de IA único (8 opções disponíveis)
- A IA adapta tom, frequência, emojis e estilo baseado no perfil
- Workflows buscam o perfil antes de gerar respostas

---

## 🎯 Perfis Disponíveis

### 1. 🤗 **Acolhedor e Suave** (`welcoming`)
- **Para:** Pacientes ansiosos, sensíveis
- **Tom:** Calmo, paciente, empático
- **Exemplo:** "Tudo bem se hoje não foi como planejado. Amanhã é uma nova chance 💙"

### 2. 🔥 **Motivacional e Energético** (`motivational`)
- **Para:** Pacientes desmotivados
- **Tom:** Entusiasmado, inspirador
- **Exemplo:** "ISSO! Mais uma refeição saudável! Você está arrasando! 🔥"

### 3. 💪 **Firme e Direto** (`direct`)
- **Para:** Pacientes que precisam de limites
- **Tom:** Objetivo, sem rodeios
- **Exemplo:** "3 refeições fora do plano essa semana. Vamos ajustar? 📊"

### 4. 😄 **Descontraído com Humor** (`humorous`)
- **Para:** Pacientes que gostam de leveza
- **Tom:** Leve, bem-humorado
- **Exemplo:** "Pizza às 23h? Aquele momento 'fome da madrugada atacou'? 😄 Amanhã compensamos!"

### 5. 🧘 **Zen e Mindful** (`mindful`)
- **Para:** Pacientes que valorizam consciência
- **Tom:** Reflexivo, conectado
- **Exemplo:** "Como você se sentiu após essa refeição? Mais energizado ou pesado? 🌱"

### 6. 📚 **Educativo e Técnico** (`educational`)
- **Para:** Pacientes curiosos
- **Tom:** Informativo, didático
- **Exemplo:** "Proteína no café da manhã mantém saciedade. Estudos mostram redução de 60% na compulsão 📚"

### 7. 🎯 **Coach Esportivo** (`coach`)
- **Para:** Pacientes competitivos
- **Tom:** Desafiador, metas claras
- **Exemplo:** "META DA SEMANA: 5 dias com café proteico. Você topa? 🎯"

### 8. 🤝 **Parceiro de Jornada** (`partner`)
- **Para:** Pacientes que valorizam parceria
- **Tom:** Colaborativo, usa "nós"
- **Exemplo:** "Vamos ajustar o jantar juntos? O que você acha de... 🤝"

---

## 🔧 Como Integrar nos Workflows

### **Passo 1: Adicionar Node para Buscar Perfil**

Adicione um nó HTTP Request **ANTES** do nó que chama a IA:

```javascript
// Nome do Nó: "Buscar Perfil de IA do Paciente"
// Tipo: HTTP Request

URL: {{$env.BACKEND_URL}}/api/prescriber/patients/{{$json.patientId}}/ai-profile
Method: GET
Authentication: Header Auth
Header Name: Authorization
Header Value: Bearer {{$env.BACKEND_TOKEN}}
```

**Response irá conter:**
```json
{
  "success": true,
  "data": {
    "patientId": "abc123",
    "config": {
      "profileType": "motivational",
      "messageFrequency": "medium",
      "emojiLevel": "high",
      "feedbackStyle": "balanced",
      "responseTiming": "respectful",
      "customInstructions": ""
    },
    "metadata": {
      "emoji": "🔥",
      "name": "Motivacional e Energético",
      "description": "...",
      "characteristics": [...],
      "example": "..."
    }
  }
}
```

---

### **Passo 2: Carregar Biblioteca de Respostas**

Adicione um nó Function para carregar os templates:

```javascript
// Nome do Nó: "Carregar Templates do Perfil"
// Tipo: Function

const fs = require('fs');
const path = require('path');

// Carregar biblioteca de respostas
const libraryPath = path.join(__dirname, 'AI-PROFILES-RESPONSE-LIBRARY.json');
const library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));

// Pegar perfil do paciente
const profileType = $input.first().json.config.profileType || 'welcoming';
const profileData = library.profiles[profileType];

return {
  json: {
    profileType,
    systemPrompt: profileData.systemPrompt,
    responses: profileData.responses,
    metadata: profileData,
    patientData: $input.first().json
  }
};
```

---

### **Passo 3: Atualizar Chamada para IA**

Modifique o nó que chama OpenAI/Google AI:

#### **Para OpenAI:**

```javascript
// Nome do Nó: "OpenAI - Resposta Personalizada"
// Tipo: OpenAI

Model: gpt-4o-mini
Messages:
[
  {
    "role": "system",
    "content": "{{$json.systemPrompt}}"
  },
  {
    "role": "system",
    "content": "Instruções adicionais do nutricionista: {{$json.patientData.config.customInstructions}}"
  },
  {
    "role": "user",
    "content": "{{$json.userMessage}}"
  }
]
Temperature: 0.7
Max Tokens: 500
```

#### **Para Google AI:**

```javascript
// Nome do Nó: "Google AI - Resposta Personalizada"
// Tipo: HTTP Request

URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
Method: POST
Headers:
  Content-Type: application/json
Body:
{
  "contents": [{
    "parts": [{
      "text": "{{$json.systemPrompt}}\n\nInstruções adicionais: {{$json.patientData.config.customInstructions}}\n\nMensagem do paciente: {{$json.userMessage}}"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 500
  }
}
Query Parameters:
  key: {{$env.GOOGLE_AI_API_KEY}}
```

---

### **Passo 4: Ajustar Frequência de Mensagens**

Adicione lógica para respeitar a frequência configurada:

```javascript
// Nome do Nó: "Verificar Frequência de Mensagens"
// Tipo: Function

const config = $input.first().json.config;
const frequency = config.messageFrequency; // 'high', 'medium', 'low'
const lastMessageTime = $input.first().json.lastMessageTime;

const now = Date.now();
const hoursSinceLastMessage = (now - lastMessageTime) / (1000 * 60 * 60);

// Configurar intervalos mínimos
const minIntervals = {
  high: 6,    // 3-4x/dia = ~6h entre mensagens
  medium: 12, // 2x/dia = ~12h entre mensagens
  low: 24     // 1x/dia = ~24h entre mensagens
};

const shouldSendMessage = hoursSinceLastMessage >= minIntervals[frequency];

return {
  json: {
    shouldSend: shouldSendMessage,
    reason: shouldSendMessage ? 'Dentro da frequência configurada' : 'Aguardando intervalo',
    nextAvailableTime: new Date(lastMessageTime + minIntervals[frequency] * 60 * 60 * 1000)
  }
};
```

---

### **Passo 5: Respeitar Timing**

Adicione verificação de horário:

```javascript
// Nome do Nó: "Verificar Timing de Resposta"
// Tipo: Function

const config = $input.first().json.config;
const timing = config.responseTiming; // 'immediate', 'scheduled', 'respectful'

const now = new Date();
const hour = now.getHours();

let shouldSend = true;
let reason = '';

if (timing === 'respectful') {
  // Não enviar entre 22h e 7h
  if (hour >= 22 || hour < 7) {
    shouldSend = false;
    reason = 'Horário de descanso (22h-7h)';
  }
} else if (timing === 'scheduled') {
  // Enviar apenas em horários programados: 9h, 13h, 19h
  const scheduledHours = [9, 13, 19];
  if (!scheduledHours.includes(hour)) {
    shouldSend = false;
    reason = 'Fora dos horários programados (9h, 13h, 19h)';
  }
}
// timing === 'immediate' sempre envia

return {
  json: {
    shouldSend,
    reason: shouldSend ? 'Horário permitido' : reason,
    currentHour: hour
  }
};
```

---

## 🚀 Exemplo de Workflow Completo

```
[1. Trigger: Webhook]
        ↓
[2. Extrair patientId]
        ↓
[3. Buscar Perfil de IA] ← HTTP Request
        ↓
[4. Carregar Templates] ← Function
        ↓
[5. Verificar Frequência] ← Function
        ↓  (shouldSend?)
[6. Verificar Timing] ← Function
        ↓  (shouldSend?)
[7. Gerar Resposta] ← OpenAI/Google AI (com systemPrompt)
        ↓
[8. Enviar Mensagem] ← WhatsApp/Z-API
        ↓
[9. Registrar no Firestore]
```

---

## 📝 Workflows que Precisam ser Atualizados

### ✅ **1-AUTO-RESPOSTA-FINAL.json**
- **O que fazer:** Adicionar busca de perfil antes de gerar resposta automática
- **Nós a adicionar:** Passos 3, 4, 5, 6, 7

### ✅ **2-ANALISE-COMPLETO-FINAL.json**
- **O que fazer:** Usar perfil para análise de refeição
- **Nós a adicionar:** Passos 3, 4, 7

### ✅ **3-SUGESTOES-RESPOSTA-FINAL.json**
- **O que fazer:** Personalizar sugestões baseado no perfil
- **Nós a adicionar:** Passos 3, 4, 7

### ✅ **4-FOLLOWUP-AUTOMATICO-FINAL.json**
- **O que fazer:** Usar tom do perfil para follow-ups
- **Nós a adicionar:** Passos 3, 4, 5, 6, 7

### ✅ **5-RESUMO-DIARIO-FINAL.json**
- **O que fazer:** Ajustar estilo do resumo ao perfil
- **Nós a adicionar:** Passos 3, 4, 7

---

## 🧪 Como Testar

### **1. Testar no Frontend**
1. Ir para página do paciente
2. Clicar na aba "Config"
3. Selecionar um perfil (ex: Motivacional 🔥)
4. Salvar configurações
5. Verificar mensagem de sucesso

### **2. Testar no Backend**
```bash
# Buscar perfil de um paciente
curl -X GET \
  "https://seu-backend.railway.app/api/prescriber/patients/PATIENT_ID/ai-profile" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### **3. Testar no N8N**
1. Abrir workflow de teste
2. Adicionar nó "Buscar Perfil" (Passo 3 acima)
3. Executar workflow manualmente
4. Verificar se `profileType` está correto na resposta
5. Testar com diferentes perfis

### **4. Testar Resposta Completa**
1. Enviar mensagem de teste via WhatsApp
2. Verificar se IA respondeu com tom correto
3. Comparar resposta com exemplos da biblioteca
4. Ajustar se necessário

---

## 🎨 Exemplos de Prompts por Perfil

### **Situação: Paciente comeu fast food**

#### Perfil: Acolhedor 🤗
```
"Tudo bem! Fast food vez ou outra não define sua jornada 💙 
O importante é voltar ao plano com gentileza consigo mesmo(a). 
Como você está se sentindo agora?"
```

#### Perfil: Motivacional 🔥
```
"ATENÇÃO! Isso foi um TROPEÇO, não uma DERROTA! 🔥 
CAMPEÕES caem e LEVANTAM! Amanhã você MOSTRA sua FORÇA! 
BORA VOLTAR MAIS FORTE! 💪"
```

#### Perfil: Direto 💪
```
"Fast food = +800 calorias. Fora do déficit planejado. 
Compensa nas próximas 48h com -400cal/dia. 
Próxima refeição: proteína + vegetais. ✔️"
```

#### Perfil: Humorado 😄
```
"Opa! O McDonald's chamou mais forte né? 😄 
Acontece com os melhores! Mas olha, amanhã a gente 
volta pro jogo. Combinado? 🍔➡️🥗"
```

---

## 🐛 Troubleshooting

### **Problema: Perfil não carrega**
```javascript
// Solução: Adicionar fallback
const profileType = $json.config?.profileType || 'welcoming';
```

### **Problema: IA não respeita o tom**
```javascript
// Solução: Adicionar exemplos no prompt
systemPrompt = `${basePrompt}

EXEMPLOS DE COMO RESPONDER:
Situação Boa: "${profileData.responses.goodMeal[0]}"
Situação Ruim: "${profileData.responses.badMeal[0]}"

Mantenha SEMPRE esse tom!`;
```

### **Problema: Mensagens enviadas no horário errado**
```javascript
// Solução: Adicionar queue de mensagens
// Armazenar mensagens para enviar no horário correto
```

---

## ✅ Checklist de Implementação

- [ ] Backend: Rotas de perfil funcionando
- [ ] Frontend: Aba Config permite salvar perfis
- [ ] N8N: Biblioteca de respostas importada
- [ ] N8N: Nó "Buscar Perfil" adicionado
- [ ] N8N: Nó "Carregar Templates" adicionado
- [ ] N8N: Nó "Verificar Frequência" adicionado
- [ ] N8N: Nó "Verificar Timing" adicionado
- [ ] N8N: Chamada IA atualizada com systemPrompt
- [ ] Testado: Cada perfil com mensagem real
- [ ] Testado: Frequência de mensagens funciona
- [ ] Testado: Timing respeitado
- [ ] Documentação: Equipe treinada

---

## 🚀 Próximos Passos

1. **Implementar em 1 workflow** (começar com AUTO-RESPOSTA)
2. **Testar com 2-3 pacientes** de perfis diferentes
3. **Coletar feedback** dos pacientes
4. **Ajustar prompts** se necessário
5. **Expandir para todos os workflows**
6. **Monitorar engajamento** (taxa de resposta, satisfação)

---

## 📞 Suporte

Dúvidas sobre implementação? Entre em contato!

**Status:** ✅ Sistema completo e pronto para uso!

