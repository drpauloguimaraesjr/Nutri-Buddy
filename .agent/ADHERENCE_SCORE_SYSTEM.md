# 🎯 Sistema de Score de Aderência à Dieta - NutriBuddy

## 📊 **Visão Geral**

O sistema de score mede o quão próximo o paciente está seguindo o plano alimentar prescrito, comparando:
- ✅ **Planejado**: Dieta transcrita do PDF
- 📱 **Consumido**: Registros do paciente via WhatsApp/Chat

---

## 🔢 **Cálculo do Score**

### **Score Diário (0-100%)**

```typescript
Score = (
  ScoreCalórico × 0.30 +
  ScoreMacros × 0.50 +
  ScoreRefeições × 0.20
) × 100
```

### **1. Score Calórico (30%)**
Proximidade das calorias consumidas vs planejadas:

```typescript
ScoreCalórico = 1 - |CaloriasConsumidas - CaloriasPlanejadas| / CaloriasPlanejadas
// Limite: máximo 20% de desvio = score 0
```

**Exemplo:**
- Planejado: 2.717 kcal
- Consumido: 2.500 kcal
- Desvio: 217 kcal (8%)
- Score: 92%

---

### **2. Score de Macros (50%)**
Média ponderada dos 3 macronutrientes:

```typescript
ScoreMacros = (
  ScoreProteínas × 0.40 +
  ScoreCarboidratos × 0.35 +
  ScoreGorduras × 0.25
)
```

**Para cada macro:**
```typescript
ScoreMacro = 1 - |MacroConsumido - MacroPlanejado| / MacroPlanejado
// Limite: máximo 25% de desvio = score 0
```

**Exemplo:**
- **Proteínas** (40% do peso):
  - Planejado: 192g
  - Consumido: 180g
  - Score: 94%

- **Carboidratos** (35% do peso):
  - Planejado: 328g
  - Consumido: 310g
  - Score: 94%

- **Gorduras** (25% do peso):
  - Planejado: 77g
  - Consumido: 70g
  - Score: 91%

**Score Final de Macros**: (94×0.4 + 94×0.35 + 91×0.25) = **93%**

---

### **3. Score de Refeições (20%)**
Quantas refeições planejadas foram cumpridas:

```typescript
ScoreRefeições = RefeiçõesCumpridas / RefeiçõesPlanejadas
```

**Critério de "cumprida":**
- Refeição registrada no horário ±2h
- Pelo menos 70% dos alimentos principais presentes

**Exemplo:**
- Planejadas: 7 refeições
- Cumpridas: 6 refeições
- Score: 86%

---

## 🎨 **Visualização do Score**

### **Cores e Classificação:**

| Score | Cor | Classificação | Emoji |
|-------|-----|---------------|-------|
| 90-100% | 🟢 Verde | Excelente | ⭐⭐⭐ |
| 75-89% | 🟡 Amarelo | Bom | ⭐⭐ |
| 60-74% | 🟠 Laranja | Regular | ⭐ |
| 0-59% | 🔴 Vermelho | Precisa melhorar | ⚠️ |

---

## 📈 **Dados Armazenados**

### **Estrutura no Firestore:**

```typescript
// Collection: dailyAdherence
{
  id: "patientId_2024-01-15",
  patientId: "abc123",
  date: "2024-01-15",
  
  // Planejado (da dieta)
  planned: {
    calories: 2717,
    protein: 192,
    carbs: 328,
    fats: 77,
    meals: 7
  },
  
  // Consumido (registros)
  consumed: {
    calories: 2500,
    protein: 180,
    carbs: 310,
    fats: 70,
    meals: 6
  },
  
  // Scores
  scores: {
    caloric: 92,
    macros: 93,
    meals: 86,
    total: 91
  },
  
  // Detalhes por refeição
  mealDetails: [
    {
      name: "Café da Manhã",
      time: "07:30",
      planned: { calories: 647, protein: 40, carbs: 62, fats: 27 },
      consumed: { calories: 600, protein: 38, carbs: 60, fats: 25 },
      score: 94,
      completed: true
    },
    // ... outras refeições
  ],
  
  // Metadados
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🚀 **Implementação**

### **Fase 1: Cálculo Básico** ✅
- [x] Armazenar macros por refeição na dieta
- [x] Estrutura de dados completa
- [ ] Função de cálculo de score
- [ ] Endpoint API para score diário

### **Fase 2: Visualização** 🔄
- [ ] Card de score no dashboard
- [ ] Gráfico de evolução semanal
- [ ] Detalhamento por refeição
- [ ] Alertas de desvio

### **Fase 3: Inteligência** 🎯
- [ ] Sugestões de ajuste
- [ ] Predição de tendências
- [ ] Gamificação (badges, streaks)
- [ ] Relatórios para nutricionista

---

## 💡 **Exemplos de Uso**

### **Dashboard do Paciente:**
```
┌─────────────────────────────────┐
│  Score de Aderência - Hoje      │
│                                 │
│         ⭐⭐⭐ 91%               │
│                                 │
│  🔥 Calorias:    92% ✅         │
│  💪 Macros:      93% ✅         │
│  🍽️ Refeições:   86% ⚠️         │
│                                 │
│  Faltou: Lanche da Tarde        │
└─────────────────────────────────┘
```

### **Alerta para Nutricionista:**
```
🚨 Paciente João Silva
Score: 65% (Regular)

Principais desvios:
- Carboidratos: -18g (-5%)
- Refeições perdidas: 2/7
- Jantar atrasado em 3h

Sugestão: Ajustar horários
```

---

## 🎯 **Benefícios**

1. **Para o Paciente:**
   - Feedback imediato
   - Motivação visual
   - Gamificação

2. **Para o Nutricionista:**
   - Monitoramento em tempo real
   - Identificação de padrões
   - Ajustes baseados em dados

3. **Para o Sistema:**
   - Dados para ML/IA
   - Métricas de sucesso
   - Insights de comportamento

---

## 📝 **Próximos Passos**

1. ✅ Corrigir metadata (FEITO)
2. 🔄 Implementar cálculo de score
3. 🔄 Criar endpoint `/api/adherence/calculate`
4. 🔄 Adicionar card de score no dashboard
5. 🔄 Implementar tracking de refeições

---

**Prioridade:** 🔥 ALTA
**Impacto:** 🎯 CRÍTICO para valor do produto
**Complexidade:** ⭐⭐⭐ Média
