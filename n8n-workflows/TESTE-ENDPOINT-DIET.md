# 🍽️ TESTE DO ENDPOINT: Buscar Dieta do Paciente

## 📍 ENDPOINT CRIADO

```
GET /api/n8n/patients/:patientId/diet
```

**Autenticação:** `X-Webhook-Secret` header

---

## 🧪 COMO TESTAR

### **1. Teste Manual (cURL)**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/hiAf8r28RmfnppmYBpvxQwTroNI2/diet" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -H "Content-Type: application/json"
```

**Substitua:** `hiAf8r28RmfnppmYBpvxQwTroNI2` pelo UID do paciente que você quer testar.

---

### **2. Teste no n8n (HTTP Request Node)**

**No workflow de chat, adicione um node "HTTP Request":**

```javascript
// Node: HTTP Request
{
  "method": "GET",
  "url": "https://web-production-c9eaf.up.railway.app/api/n8n/patients/{{ $json.patientId }}/diet",
  "headers": {
    "X-Webhook-Secret": "nutribuddy-secret-2024",
    "Content-Type": "application/json"
  },
  "options": {
    "timeout": 10000,
    "redirect": {
      "follow": true
    }
  }
}
```

---

## ✅ RESPOSTA ESPERADA

### **Caso 1: Paciente TEM dieta ativa**

```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "name": "Plano de Emagrecimento - 1800 kcal",
    "description": "Dieta hipocalórica com foco em proteína",
    "meals": [
      {
        "name": "Café da Manhã",
        "time": "07:00",
        "foods": [
          {
            "name": "Ovo mexido",
            "quantity": "2 unidades",
            "calories": 140,
            "protein": 12,
            "carbs": 1,
            "fats": 10
          },
          {
            "name": "Pão integral",
            "quantity": "2 fatias",
            "calories": 160,
            "protein": 6,
            "carbs": 28,
            "fats": 2
          }
        ]
      },
      {
        "name": "Almoço",
        "time": "12:00",
        "foods": [
          {
            "name": "Frango grelhado",
            "quantity": "150g",
            "calories": 165,
            "protein": 31,
            "carbs": 0,
            "fats": 3.6
          }
        ]
      }
    ],
    "macros": {
      "protein": 120,
      "carbs": 180,
      "fats": 60,
      "calories": 1800
    },
    "createdAt": "2024-11-15T10:30:00.000Z",
    "updatedAt": "2024-11-15T10:30:00.000Z"
  }
}
```

---

### **Caso 2: Paciente NÃO TEM dieta ativa**

```json
{
  "success": true,
  "data": {
    "meals": [],
    "macros": {
      "protein": 0,
      "carbs": 0,
      "fats": 0,
      "calories": 0
    },
    "message": "No active diet plan"
  }
}
```

---

## 🔧 COMO USAR NO WORKFLOW DE CHAT

### **Node 1: HTTP Request - Buscar Dieta**

```javascript
// Input: patientId do webhook
const patientId = $json.patientId;

// URL
const url = `https://web-production-c9eaf.up.railway.app/api/n8n/patients/${patientId}/diet`;

// Headers
const headers = {
  "X-Webhook-Secret": "nutribuddy-secret-2024",
  "Content-Type": "application/json"
};

// Retorna dados da dieta
```

---

### **Node 2: Verificar se Tem Dieta**

```javascript
const dietData = $input.first().json.data;

if (dietData.meals && dietData.meals.length > 0) {
  // Paciente TEM dieta
  return {
    hasDiet: true,
    macros: dietData.macros,
    meals: dietData.meals,
    totalMeals: dietData.meals.length
  };
} else {
  // Paciente NÃO TEM dieta
  return {
    hasDiet: false,
    message: "Paciente ainda não possui plano alimentar cadastrado"
  };
}
```

---

### **Node 3: Construir Contexto para IA**

```javascript
const conversation = $input.first().json;
const dietInfo = $input.item(1).json;

let context = `Você é um assistente de nutrição inteligente.

**Informações do Paciente:**
- ID: ${conversation.patientId}
- Nome: ${conversation.patientName || 'Paciente'}

`;

if (dietInfo.hasDiet) {
  context += `
**Plano Alimentar Ativo:**
- Calorias diárias: ${dietInfo.macros.calories} kcal
- Proteína: ${dietInfo.macros.protein}g
- Carboidratos: ${dietInfo.macros.carbs}g
- Gordura: ${dietInfo.macros.fats}g
- Total de refeições: ${dietInfo.totalMeals}

**Refeições:**
${dietInfo.meals.map(meal => `- ${meal.name} (${meal.time}): ${meal.foods.map(f => f.name).join(', ')}`).join('\n')}
`;
} else {
  context += `
**Plano Alimentar:**
⚠️ Paciente ainda não possui plano alimentar cadastrado.
`;
}

context += `
**Mensagem do Paciente:**
"${conversation.content}"

**Instruções:**
- Responda de forma clara e objetiva
- Se a pergunta for sobre alimentos na dieta, consulte o plano acima
- Se não tiver dieta cadastrada, oriente o paciente a aguardar o plano
- Seja empático e motivador
`;

return { context };
```

---

## 🎯 EXEMPLO DE USO REAL

### **Pergunta do Paciente:**
```
"Posso comer banana no café da manhã?"
```

### **Workflow N8N:**

1. **Recebe webhook** com a mensagem
2. **Busca dieta** do paciente (GET /api/n8n/patients/{id}/diet)
3. **Verifica** se banana está no plano alimentar
4. **Constrói contexto** para a IA:
   ```
   O paciente tem 1800 kcal/dia prescrito.
   Café da manhã atual: Ovo mexido + Pão integral
   Pergunta: Posso comer banana no café da manhã?
   ```
5. **IA responde** com base nos macros:
   ```
   Olá! 🍌
   
   Sim, você pode adicionar banana no seu café da manhã! 
   
   Uma banana média tem aproximadamente:
   - 105 kcal
   - 27g de carboidratos
   - 1g de proteína
   - 0.4g de gordura
   
   Como seu plano permite 180g de carboidratos por dia, 
   a banana se encaixa perfeitamente! 
   
   Sugestão: Coma com o ovo mexido ou após o treino. 😊
   ```

---

## 🚨 ERROS POSSÍVEIS

### **Erro 1: Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```

**Solução:** Verificar se o header `X-Webhook-Secret` está correto.

---

### **Erro 2: 500 Internal Server Error**
```json
{
  "success": false,
  "error": "Firestore query failed"
}
```

**Solução:** 
- Verificar se a collection `dietPlans` existe
- Verificar índices do Firestore (patientId + isActive + createdAt)

---

## 📊 FIRESTORE: Estrutura de `dietPlans`

Para que o endpoint funcione, a collection deve ter esta estrutura:

```javascript
dietPlans/{planId}
  ├── patientId: "hiAf8r28RmfnppmYBpvxQwTroNI2"
  ├── isActive: true
  ├── name: "Plano de Emagrecimento - 1800 kcal"
  ├── description: "Dieta hipocalórica"
  ├── meals: [...]
  ├── dailyProtein: 120
  ├── dailyCarbs: 180
  ├── dailyFats: 60
  ├── dailyCalories: 1800
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Índice necessário:**
```
Collection: dietPlans
Composite Index:
  - patientId (ASC)
  - isActive (ASC)
  - createdAt (DESC)
```

---

## 🎉 PRÓXIMOS PASSOS

1. ✅ **Aguardar deploy** do Railway (2-5 min)
2. 🧪 **Testar endpoint** com cURL
3. 📦 **Integrar no workflow** do n8n
4. 🤖 **Testar IA** com perguntas sobre a dieta
5. 🚀 **Profit!**

---

**ENDPOINT PRONTO!** 🎊

Agora a IA pode dar respostas personalizadas baseadas na dieta real do paciente! 🍽️✨

