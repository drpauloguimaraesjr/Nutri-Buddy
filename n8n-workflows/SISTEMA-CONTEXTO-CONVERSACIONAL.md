# 🧠 SISTEMA DE CONTEXTO CONVERSACIONAL E REGISTRO DE REFEIÇÕES

## 📋 **VISÃO GERAL**

Sistema evolutivo e extensível para gerenciar contextos multi-turno em conversas e registrar refeições com cálculo automático de macros.

---

## 🎯 **ESTRUTURAS DE DADOS**

### **1. ConversationContext (Base)**

Gerencia o contexto ativo de uma conversa, permitindo múltiplos tipos de interações.

```javascript
const context = new ConversationContext(conversationId, patientId, prescriberId);
context.setContext(ContextTypes.MEAL_LOGGING, mealData);
```

**Propriedades:**
- `conversationId`: ID da conversa
- `patientId`: ID do paciente
- `prescriberId`: ID do prescritor
- `currentContext`: Contexto ativo atual
- `history`: Histórico de contextos finalizados
- `expiresAt`: Expiração automática (1h)

---

### **2. MealLoggingContext (Específico)**

Contexto para registro progressivo de refeições.

```javascript
const mealContext = new MealLoggingContext(photoUrl);
mealContext.mealType = 'lunch';
mealContext.addFood({
  name: 'Frango grelhado',
  weight_grams: 150,
  macros: { protein: 45, carbs: 0, fats: 3, calories: 207 }
});
```

**Funcionalidades:**
- ✅ Adicionar, atualizar, remover alimentos
- ✅ Recálculo automático de totais
- ✅ Tracking de fluxo conversacional
- ✅ Perguntas pendentes

---

### **3. MealLog (Registro Final)**

Registro imutável de uma refeição completa.

```javascript
const mealLog = new MealLog(patientId, prescriberId, conversationId, mealContext);
mealLog.setAdherence({ score: 85, approvedFoods: [...], unapprovedFoods: [...] });
```

---

## 📡 **ENDPOINTS IMPLEMENTADOS**

### **🔹 CONTEXTO DE CONVERSA**

---

#### **GET /api/n8n/conversations/:conversationId/context**

Buscar contexto ativo da conversa.

**Headers:**
```
X-Webhook-Secret: nutribuddy-secret-2024
```

**Resposta (contexto ativo):**
```json
{
  "success": true,
  "hasContext": true,
  "context": {
    "conversationId": "conv123",
    "patientId": "patient456",
    "prescriberId": "prescriber789",
    "currentContext": {
      "type": "meal_logging",
      "status": "collecting",
      "data": { ... },
      "startedAt": "2025-11-16T03:00:00Z"
    },
    "history": [],
    "expiresAt": "2025-11-16T04:00:00Z"
  }
}
```

**Resposta (sem contexto):**
```json
{
  "success": true,
  "hasContext": false,
  "context": null
}
```

**Funcionalidades:**
- ✅ Auto-expira após 1h
- ✅ Refresh automático de expiração
- ✅ Cleanup de contextos expirados

---

#### **POST /api/n8n/conversations/:conversationId/context**

Criar novo contexto.

**Headers:**
```
X-Webhook-Secret: nutribuddy-secret-2024
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": "patient456",
  "prescriberId": "prescriber789",
  "type": "meal_logging",
  "data": {
    "mealType": "lunch",
    "photoUrl": "https://storage.../photo.jpg",
    "foods": []
  }
}
```

**Tipos válidos:**
- `meal_logging` - Registro de refeições
- `weight_tracking` - Acompanhamento de peso
- `symptom_reporting` - Relato de sintomas
- `goal_setting` - Definição de metas
- `exercise_logging` - Registro de exercícios
- `water_tracking` - Consumo de água

---

#### **PATCH /api/n8n/conversations/:conversationId/context**

Atualizar contexto existente.

**Body:**
```json
{
  "updates": {
    "foods": [
      {
        "name": "Frango grelhado",
        "weight_grams": 150,
        "macros": { "protein": 45, "carbs": 0, "fats": 3, "calories": 207 }
      }
    ]
  },
  "status": "confirming"
}
```

**Status válidos:**
- `collecting` - Coletando informações
- `confirming` - Aguardando confirmação
- `completed` - Finalizado
- `cancelled` - Cancelado

---

#### **DELETE /api/n8n/conversations/:conversationId/context**

Finalizar ou deletar contexto.

**Query Params:**
- `?complete=true` - Finaliza e move para history
- (sem params) - Deleta completamente

---

### **🔹 REGISTRO DE REFEIÇÕES**

---

#### **POST /api/n8n/meals/log**

Registrar refeição completa no sistema.

**Body:**
```json
{
  "patientId": "patient456",
  "prescriberId": "prescriber789",
  "conversationId": "conv123",
  "mealContext": {
    "mealType": "lunch",
    "photoUrl": "https://storage.../photo.jpg",
    "foods": [
      {
        "name": "Frango grelhado",
        "weight_grams": 150,
        "macros": { "protein": 45, "carbs": 0, "fats": 3, "calories": 207 }
      },
      {
        "name": "Arroz integral",
        "weight_grams": 100,
        "macros": { "protein": 2.6, "carbs": 23, "fats": 0.9, "calories": 111 }
      }
    ],
    "totalMacros": {
      "protein": 47.6,
      "carbs": 23,
      "fats": 3.9,
      "calories": 318
    }
  },
  "adherence": {
    "score": 95,
    "approvedFoods": ["Frango grelhado", "Arroz integral"],
    "unapprovedFoods": []
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "mealLog": {
    "id": "meal_log_1731726000_abc123",
    "patientId": "patient456",
    "mealType": "lunch",
    "timestamp": "2025-11-16T12:00:00Z",
    "foods": [...],
    "totalMacros": { "protein": 47.6, "carbs": 23, "fats": 3.9, "calories": 318 },
    "adherence": { "score": 95, ... },
    "createdAt": "2025-11-16T12:00:00Z"
  },
  "message": "Meal logged successfully"
}
```

**Funcionalidades:**
- ✅ Validação automática de macros
- ✅ Salva em `mealLogs` collection
- ✅ Atualiza `dailyMacros` automaticamente
- ✅ Suporta scoring de aderência

---

#### **GET /api/n8n/patients/:patientId/meals/today**

Buscar todas as refeições do dia do paciente.

**Resposta:**
```json
{
  "success": true,
  "date": "2025-11-16",
  "mealCount": 3,
  "meals": [
    {
      "id": "meal_log_1",
      "mealType": "breakfast",
      "timestamp": "2025-11-16T07:00:00Z",
      "totalMacros": { "protein": 25, "carbs": 40, "fats": 10, "calories": 350 }
    },
    {
      "id": "meal_log_2",
      "mealType": "lunch",
      "timestamp": "2025-11-16T12:00:00Z",
      "totalMacros": { "protein": 47.6, "carbs": 23, "fats": 3.9, "calories": 318 }
    },
    {
      "id": "meal_log_3",
      "mealType": "dinner",
      "timestamp": "2025-11-16T19:00:00Z",
      "totalMacros": { "protein": 35, "carbs": 50, "fats": 15, "calories": 460 }
    }
  ],
  "dailyTotals": {
    "protein": 107.6,
    "carbs": 113,
    "fats": 28.9,
    "calories": 1128
  }
}
```

---

#### **GET /api/n8n/patients/:patientId/meals/summary**

Resumo de macros consumidos vs metas do dia.

**Resposta:**
```json
{
  "success": true,
  "date": "2025-11-16",
  "mealCount": 3,
  "consumed": {
    "protein": 107.6,
    "carbs": 113,
    "fats": 28.9,
    "calories": 1128
  },
  "target": {
    "protein": 180,
    "carbs": 200,
    "fats": 60,
    "calories": 2040
  },
  "percentages": {
    "protein": 60,
    "carbs": 57,
    "fats": 48,
    "calories": 55
  },
  "remaining": {
    "protein": 72.4,
    "carbs": 87,
    "fats": 31.1,
    "calories": 912
  },
  "status": "below_target"
}
```

**Status:**
- `met` - Meta atingida (≥100%)
- `on_track` - No caminho certo (80-99%)
- `below_target` - Abaixo da meta (<80%)

---

## 🔄 **FLUXO COMPLETO: Registro de Refeição**

### **Passo 1: Paciente Envia Foto**

```
1. Paciente: [envia foto de comida]
2. N8N: Analisa foto com Vision AI
3. N8N: Identifica alimentos e pesos
```

---

### **Passo 2: Criar Contexto**

```http
POST /api/n8n/conversations/conv123/context
{
  "patientId": "patient456",
  "prescriberId": "prescriber789",
  "type": "meal_logging",
  "data": {
    "mealType": "lunch",
    "photoUrl": "https://storage.../photo.jpg",
    "foods": [
      {
        "name": "Frango grelhado",
        "weight_grams": 150,
        "confidence": "high",
        "source": "vision_analysis",
        "macros": { "protein": 45, "carbs": 0, "fats": 3, "calories": 207 }
      }
    ]
  }
}
```

---

### **Passo 3: IA Pergunta ao Paciente**

```
IA: "Detectei 150g de frango grelhado no seu almoço. 
     O peso está correto ou gostaria de ajustar?"
```

---

### **Passo 4: Paciente Corrige**

```
Paciente: "Na verdade foram 200g"
```

```http
PATCH /api/n8n/conversations/conv123/context
{
  "updates": {
    "foods": [
      {
        "id": "food_123_abc",
        "weight_grams": 200,
        "source": "user_correction",
        "macros": { "protein": 60, "carbs": 0, "fats": 4, "calories": 276 }
      }
    ]
  },
  "status": "confirming"
}
```

---

### **Passo 5: Confirmação Final**

```
IA: "Perfeito! Registrei 200g de frango grelhado (60g proteína, 276 kcal).
     Algo mais nesta refeição?"
     
Paciente: "Não, só isso"
```

---

### **Passo 6: Registrar Refeição**

```http
POST /api/n8n/meals/log
{
  "patientId": "patient456",
  "prescriberId": "prescriber789",
  "conversationId": "conv123",
  "mealContext": { ... },
  "adherence": {
    "score": 100,
    "approvedFoods": ["Frango grelhado"],
    "unapprovedFoods": []
  }
}
```

---

### **Passo 7: Finalizar Contexto**

```http
DELETE /api/n8n/conversations/conv123/context?complete=true
```

---

### **Passo 8: Mostrar Resumo**

```http
GET /api/n8n/patients/patient456/meals/summary
```

```
IA: "Ótimo! Você já consumiu 60g de proteína (33% da meta) e 276 kcal hoje.
     Faltam 120g de proteína e 1764 kcal para atingir sua meta de 2040 kcal."
```

---

## 🎯 **CASOS DE USO**

### **Caso 1: Registro Simples (1 alimento)**

1. Foto → Vision AI → 1 alimento detectado
2. IA confirma → Paciente confirma
3. Registra → Mostra resumo

---

### **Caso 2: Registro Complexo (múltiplos alimentos)**

1. Foto → Vision AI → 3 alimentos detectados
2. IA confirma cada alimento
3. Paciente corrige pesos
4. IA pergunta se falta algo
5. Paciente adiciona alimento manualmente
6. Registra → Mostra resumo

---

### **Caso 3: Cancelamento**

1. Foto → Vision AI → detecta alimentos
2. IA confirma
3. Paciente: "Não, cancela"
4. IA: deleta contexto (sem registrar)

---

### **Caso 4: Timeout/Expiração**

1. Contexto criado às 12:00
2. Paciente não responde
3. Após 1h (13:00): contexto expira automaticamente
4. Próxima mensagem: inicia novo contexto

---

## 📊 **COLLECTIONS FIRESTORE**

### **conversationContexts**

```
conversationContexts/{conversationId}
  - conversationId: string
  - patientId: string
  - prescriberId: string
  - currentContext: object | null
  - history: array
  - createdAt: timestamp
  - updatedAt: timestamp
  - expiresAt: timestamp
```

---

### **mealLogs**

```
mealLogs/{mealLogId}
  - id: string
  - patientId: string
  - prescriberId: string
  - conversationId: string
  - mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  - timestamp: timestamp
  - photoUrl: string | null
  - foods: array
  - totalMacros: object
  - adherence: object | null
  - notes: string
  - createdAt: timestamp
```

---

### **dailyMacros**

```
dailyMacros/{patientId}_{date}
  - patientId: string
  - date: string (YYYY-MM-DD)
  - protein: number
  - carbs: number
  - fats: number
  - calories: number
  - mealCount: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

---

## ✅ **RESUMO**

### **Endpoints Criados:**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/conversations/:id/context` | GET | Buscar contexto ativo |
| `/conversations/:id/context` | POST | Criar contexto |
| `/conversations/:id/context` | PATCH | Atualizar contexto |
| `/conversations/:id/context` | DELETE | Finalizar/deletar contexto |
| `/meals/log` | POST | Registrar refeição |
| `/patients/:id/meals/today` | GET | Refeições do dia |
| `/patients/:id/meals/summary` | GET | Resumo vs meta |

### **Collections Firestore:**
- ✅ `conversationContexts` - Contextos ativos
- ✅ `mealLogs` - Registros de refeições
- ✅ `dailyMacros` - Totais diários

### **Funcionalidades:**
- ✅ Contexto multi-turno evolutivo
- ✅ Expiração automática (1h)
- ✅ Refresh automático
- ✅ Validação de macros
- ✅ Cálculo automático de totais
- ✅ Tracking de aderência
- ✅ Sistema extensível (novos tipos de contexto)

---

**SISTEMA PRONTO PARA USO EM PRODUÇÃO!** 🎉✨

Todos os endpoints estão protegidos por `X-Webhook-Secret` e integrados com Firestore.

