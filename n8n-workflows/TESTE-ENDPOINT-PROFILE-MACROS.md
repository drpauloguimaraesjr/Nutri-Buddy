# 🧪 TESTE DO ENDPOINT: Profile Macros (Fallback)

## 📍 NOVO ENDPOINT CRIADO

```
GET /api/n8n/patients/:patientId/profile-macros
```

**Autenticação:** `X-Webhook-Secret` header

**Função:** Buscar macros do perfil do paciente quando **NÃO tem dieta prescrita**

---

## 🎯 COMO FUNCIONA

### **Cenário 1: Paciente TEM macros no perfil**

Se o paciente tem `targetProtein`, `targetCarbs`, `targetFats` ou `dailyProtein`, `dailyCarbs`, `dailyFats` definidos no perfil, o endpoint retorna esses valores.

---

### **Cenário 2: Paciente NÃO TEM macros no perfil**

Se o paciente não tem macros definidos, o endpoint **CALCULA AUTOMATICAMENTE** baseado em:

1. **TMB (Taxa Metabólica Basal)** - Fórmula de Harris-Benedict:
   - Homens: `88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × idade)`
   - Mulheres: `447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × idade)`

2. **Fator de Atividade:**
   - `sedentary`: 1.2 (sedentário)
   - `light`: 1.375 (exercício leve 1-3x/semana)
   - `moderate`: 1.55 (exercício moderado 3-5x/semana)
   - `active`: 1.725 (exercício intenso 6-7x/semana)
   - `very_active`: 1.9 (atleta/trabalho físico)

3. **TDEE (Total Daily Energy Expenditure):**
   - `TDEE = TMB × Fator de Atividade`

4. **Ajuste para Objetivo:**
   - `weight_loss` ou `emagrecimento`: TDEE - 500 kcal (déficit)
   - `muscle_gain` ou `ganho_muscular`: TDEE + 300 kcal (superávit)
   - `maintenance`: TDEE (manutenção)

5. **Distribuição de Macros:**
   - **Proteína:** 30% das calorias ÷ 4 kcal/g
   - **Carboidratos:** 40% das calorias ÷ 4 kcal/g
   - **Gorduras:** 30% das calorias ÷ 9 kcal/g

---

## 🧪 TESTE MANUAL (cURL)

### **Teste 1: Paciente com ID Existente**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/hiAf8r28RmfnppmYBpvxQwTroNI2/profile-macros" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada (cenário 1 - tem macros no perfil):**

```json
{
  "success": true,
  "source": "profile",
  "data": {
    "name": "Macros do Perfil",
    "description": "Macronutrientes baseados no perfil de paulo coelho",
    "macros": {
      "protein": 180,
      "carbs": 200,
      "fats": 60,
      "calories": 2040
    },
    "patientInfo": {
      "weight": 75,
      "height": 175,
      "goal": "muscle_gain",
      "activityLevel": "moderate"
    }
  }
}
```

**Resposta esperada (cenário 2 - calcula automaticamente):**

```json
{
  "success": true,
  "source": "profile",
  "data": {
    "name": "Macros do Perfil",
    "description": "Macronutrientes baseados no perfil de João Silva",
    "macros": {
      "protein": 165,
      "carbs": 220,
      "fats": 58,
      "calories": 2200
    },
    "patientInfo": {
      "weight": 70,
      "height": 175,
      "goal": "maintenance",
      "activityLevel": "moderate"
    }
  }
}
```

---

### **Teste 2: Paciente que Não Existe**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/INVALID_ID/profile-macros" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada:**

```json
{
  "success": false,
  "error": "Patient not found"
}
```

---

### **Teste 3: Sem Autenticação**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/hiAf8r28RmfnppmYBpvxQwTroNI2/profile-macros"
```

**Resposta esperada:**

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```

---

## 🔧 USO NO WORKFLOW N8N

### **Fluxo Completo: Paciente Pergunta sobre Alimento (SEM DIETA)**

```
1. [Webhook] Recebe mensagem do paciente
   "Posso comer banana?"
   ↓
2. [HTTP Request] GET /conversations/:id
   → Busca dados da conversa
   ↓
3. [HTTP Request] GET /patients/:patientId/diet
   → Tenta buscar dieta prescrita
   ↓
4. [If] Se NÃO tem dieta (404 ou dieta inativa):
   ↓
   [HTTP Request] GET /patients/:patientId/profile-macros
   → Busca macros do perfil (fallback)
   ↓
5. [Code] Construir contexto com macros do perfil
   ↓
6. [OpenAI] Análise da IA
   → "Com base no seu perfil (2200 kcal/dia, 220g carbs)..."
   ↓
7. [HTTP Request] POST /conversations/:id/messages
   → Envia resposta da IA
```

---

### **Node 4: Buscar Macros do Perfil (Fallback)**

**Configuração do HTTP Request:**

```javascript
// Method: GET
// URL:
const patientId = $json.patientId;
const url = `https://web-production-c9eaf.up.railway.app/api/n8n/patients/${patientId}/profile-macros`;

// Headers:
{
  "X-Webhook-Secret": "nutribuddy-secret-2024"
}

// Opcional: Adicionar error handling
// OnError: Continue Workflow
```

---

### **Exemplo de Código para N8N (Code Node):**

```javascript
const conversationData = $input.item(0).json.data;
const patientId = conversationData.patientId;

// Tentar buscar dieta prescrita
let dietData = null;
try {
  const dietResponse = await $http.get(
    `https://web-production-c9eaf.up.railway.app/api/n8n/patients/${patientId}/diet`,
    {
      headers: {
        'X-Webhook-Secret': 'nutribuddy-secret-2024'
      }
    }
  );
  dietData = dietResponse.data;
} catch (error) {
  console.log('Dieta não encontrada, buscando macros do perfil...');
}

// Se não tem dieta, buscar macros do perfil
if (!dietData || !dietData.data) {
  const profileResponse = await $http.get(
    `https://web-production-c9eaf.up.railway.app/api/n8n/patients/${patientId}/profile-macros`,
    {
      headers: {
        'X-Webhook-Secret': 'nutribuddy-secret-2024'
      }
    }
  );
  dietData = profileResponse.data;
}

return {
  patientId,
  macros: dietData.data.macros,
  source: dietData.source, // 'diet' ou 'profile'
  description: dietData.data.description
};
```

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### **1. Busca de Macros do Perfil**
✅ Busca `targetProtein`, `targetCarbs`, `targetFats`, `targetCalories`  
✅ Fallback para `dailyProtein`, `dailyCarbs`, `dailyFats`, `dailyCalories`  
✅ Retorna valores do perfil se existirem

### **2. Cálculo Automático de Macros**
✅ Fórmula de Harris-Benedict para TMB (homens e mulheres)  
✅ Fator de atividade física (5 níveis)  
✅ TDEE calculado dinamicamente  
✅ Ajuste para objetivo (perda/ganho de peso/manutenção)  
✅ Distribuição inteligente de macros (30/40/30)

### **3. Fallbacks e Defaults**
✅ Peso padrão: 70kg  
✅ Altura padrão: 170cm  
✅ Idade padrão: 30 anos  
✅ Gênero padrão: masculino  
✅ Objetivo padrão: manutenção  
✅ Atividade padrão: moderado

### **4. Informações Retornadas**
✅ Macros calculados (proteína, carbo, gordura, calorias)  
✅ Fonte dos dados (`source: 'profile'`)  
✅ Info do paciente (peso, altura, objetivo, atividade)  
✅ Descrição amigável

---

## 🎯 CASOS DE USO

### **Caso 1: Paciente Novo (SEM DIETA, SEM MACROS)**

**Cenário:** Paciente acabou de se cadastrar, ainda não tem dieta e nem macros definidos no perfil.

**Endpoint retorna:** Macros calculados automaticamente baseado em peso, altura, idade, objetivo e atividade.

**Resposta da IA:**
> "Olá! Com base no seu perfil (70kg, 175cm, objetivo de manutenção), recomendo consumir cerca de 2200 kcal/dia, com 165g de proteína, 220g de carboidratos e 58g de gorduras. Sim, você pode comer banana! Ela tem cerca de 27g de carboidratos por unidade média."

---

### **Caso 2: Paciente com Macros no Perfil (SEM DIETA)**

**Cenário:** Paciente tem `targetProtein: 180`, `targetCarbs: 200`, `targetFats: 60` no perfil, mas ainda não tem dieta prescrita.

**Endpoint retorna:** Macros do perfil diretamente.

**Resposta da IA:**
> "Com base nos seus macros (180g proteína, 200g carbos, 60g gorduras), sim, você pode comer banana! Ela se encaixa perfeitamente no seu plano de carboidratos."

---

### **Caso 3: Paciente com Dieta Prescrita**

**Cenário:** Paciente tem dieta ativa prescrita pelo nutricionista.

**Endpoint usado:** `/patients/:patientId/diet` (não usa profile-macros)

**Resposta da IA:**
> "Com base na sua dieta de 1800 kcal/dia e 180g de carboidratos, sim, você pode comer banana! Ela tem 27g de carboidratos, o que se encaixa no seu plano."

---

## 🚨 VALIDAÇÕES E ERROS

### **Erro 1: Paciente não encontrado**
```json
{
  "success": false,
  "error": "Patient not found"
}
```
**Status:** 404

---

### **Erro 2: Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```
**Status:** 401

---

### **Erro 3: Server Error**
```json
{
  "success": false,
  "error": "Failed to fetch profile macros",
  "message": "Database connection error"
}
```
**Status:** 500

---

## 📊 LOGS DO RAILWAY

Quando o endpoint é chamado:

```
👤 [N8N] Fetching profile macros for patient: hiAf8r28RmfnppmYBpvxQwTroNI2
⚙️ [N8N] No macros in profile, calculating defaults...
✅ [N8N] Calculated macros: { protein: 165, carbs: 220, fats: 58, calories: 2200 }
```

Ou se tem macros no perfil:

```
👤 [N8N] Fetching profile macros for patient: hiAf8r28RmfnppmYBpvxQwTroNI2
✅ [N8N] Found macros in profile: { protein: 180, carbs: 200, fats: 60, calories: 2040 }
```

---

## 🎉 RESUMO DOS ENDPOINTS N8N

Agora você tem **5 endpoints** completos para o workflow:

| Endpoint | Método | Função |
|----------|--------|--------|
| `/patients/:id/diet` | GET | Buscar dieta prescrita (prioridade) |
| `/patients/:id/profile-macros` | GET | **Buscar macros do perfil (fallback)** |
| `/conversations/:id` | GET | Buscar dados da conversa |
| `/conversations/:id/messages` | GET | Buscar histórico de mensagens |
| `/conversations/:id/messages` | POST | Enviar resposta da IA |

**Todos protegidos por:** `X-Webhook-Secret: nutribuddy-secret-2024`

---

## 🔄 FLUXO INTELIGENTE: DIETA OU PERFIL

```javascript
// Node: Buscar Dados Nutricionais
let nutritionData = null;
let source = null;

// 1. Tentar buscar dieta prescrita
try {
  const dietResponse = await fetch(`/api/n8n/patients/${patientId}/diet`);
  if (dietResponse.ok) {
    nutritionData = await dietResponse.json();
    source = 'diet'; // Dieta prescrita (prioritário)
  }
} catch (error) {
  console.log('Dieta não encontrada');
}

// 2. Se não tem dieta, buscar macros do perfil
if (!nutritionData) {
  const profileResponse = await fetch(`/api/n8n/patients/${patientId}/profile-macros`);
  nutritionData = await profileResponse.json();
  source = 'profile'; // Macros do perfil (fallback)
}

// 3. Usar os dados para gerar resposta personalizada
const macros = nutritionData.data.macros;
console.log(`Usando ${source}: ${macros.calories} kcal/dia`);
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Endpoint retorna macros do perfil se existirem
- [ ] Endpoint calcula macros se não existirem
- [ ] Cálculo de TMB está correto (Harris-Benedict)
- [ ] Fator de atividade está aplicado
- [ ] Ajuste para objetivo está funcionando
- [ ] Distribuição de macros (30/40/30) está correta
- [ ] Retorna info do paciente (peso, altura, objetivo)
- [ ] `source: 'profile'` está presente na resposta
- [ ] Logs aparecem no Railway
- [ ] Performance < 500ms

---

**ENDPOINT PROFILE-MACROS PRONTO!** 🎊

Agora a IA pode dar respostas personalizadas **MESMO SEM DIETA PRESCRITA**! 🤖✨

