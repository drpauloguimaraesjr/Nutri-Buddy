# 🔥 SETUP AUTOMÁTICO DO FIRESTORE

## 🎯 **O QUE ESTE SCRIPT FAZ**

Cria automaticamente as **3 collections** necessárias para o sistema conversacional:

1. ✅ `conversationContexts` - Contextos ativos de conversas
2. ✅ `mealLogs` - Registros de refeições
3. ✅ `dailyMacros` - Totais diários de macros

**Cada collection vem com documentos de exemplo já configurados!**

---

## 🚀 **COMO USAR**

### **Passo 1: Executar o Script**

```bash
cd /Users/drpgjr.../NutriBuddy
node scripts/setup-firestore-collections.js
```

### **Passo 2: Ver o Resultado**

O script vai:
- ✅ Criar as 3 collections
- ✅ Adicionar documentos de exemplo
- ✅ Validar se foram criadas
- ✅ Testar queries básicas
- ✅ Mostrar relatório completo

**Tempo de execução:** ~5 segundos ⚡

---

## 📊 **OUTPUT ESPERADO**

```
🔥 SETUP FIRESTORE COLLECTIONS
================================

🔹 Criando collection: conversationContexts
✅ Collection conversationContexts criada com documento de exemplo

🔹 Criando collection: mealLogs
✅ Collection mealLogs criada com documento de exemplo

🔹 Criando collection: dailyMacros
✅ Collection dailyMacros criada com documento de exemplo

🔹 Validando collections criadas...
✅ ✓ conversationContexts validada
✅ ✓ mealLogs validada
✅ ✓ dailyMacros validada

🔹 Testando queries básicas...
✅ ✓ Query em mealLogs funcionando
✅ ✓ Query em conversationContexts funcionando

================================================
📊 RELATÓRIO FINAL
================================================

Collections criadas:
  conversationContexts: ✅
  mealLogs: ✅
  dailyMacros: ✅

Queries funcionando: ✅

🎉 SUCESSO! Firestore configurado e pronto!

Próximos passos:
1. Testar endpoints via cURL ou Postman
2. Configurar workflow N8N
3. Criar índices compostos (se necessário)

================================================
```

---

## ⚠️ **SE DER ERRO DE ÍNDICES**

Se você ver este erro:

```
⚠️  ÍNDICES COMPOSTOS NECESSÁRIOS:

Acesse Firebase Console → Firestore → Indexes
```

**Solução:**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Firestore Database** → **Indexes**
3. Clique em **"Create Index"** e crie:

**Índice 1:**
- Collection: `mealLogs`
- Fields: `patientId` (Ascending), `timestamp` (Ascending)

**Índice 2:**
- Collection: `conversationContexts`
- Fields: `patientId` (Ascending), `expiresAt` (Ascending)

**OBS:** Índices levam 1-2 minutos para serem criados.

---

## 🧪 **TESTAR OS ENDPOINTS**

Após rodar o script, teste os endpoints:

### **1. Buscar Contexto**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/conversations/EXAMPLE_CONTEXT_123/context" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada:**
```json
{
  "success": true,
  "hasContext": true,
  "context": {
    "conversationId": "EXAMPLE_CONTEXT_123",
    "patientId": "patient_example_456",
    ...
  }
}
```

---

### **2. Buscar Refeições do Dia**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/patient_example_456/meals/today" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada:**
```json
{
  "success": true,
  "date": "2025-11-16",
  "mealCount": 1,
  "meals": [...],
  "dailyTotals": {
    "protein": 67.6,
    "carbs": 71.75,
    "fats": 25.275,
    "calories": 793.5
  }
}
```

---

### **3. Buscar Resumo de Macros**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/patient_example_456/meals/summary" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada:**
```json
{
  "success": true,
  "consumed": { ... },
  "target": { ... },
  "percentages": { ... },
  "remaining": { ... },
  "status": "below_target"
}
```

---

## 🗑️ **LIMPAR DADOS DE EXEMPLO**

Se quiser remover os documentos de exemplo após testar:

```bash
# No Firebase Console:
# Firestore Database → Collections
# 
# Deletar documentos:
# - conversationContexts/EXAMPLE_CONTEXT_123
# - mealLogs/meal_log_example_123
# - dailyMacros/patient_example_456_2025-11-16
```

Ou criar um script de limpeza:

```bash
node scripts/cleanup-firestore-examples.js
```

_(Script de limpeza não incluído, mas fácil de criar se necessário)_

---

## 📋 **ESTRUTURA DAS COLLECTIONS**

### **conversationContexts**

```
conversationContexts/
  └── {conversationId}/
      ├── conversationId: string
      ├── patientId: string
      ├── prescriberId: string
      ├── currentContext: map
      │   ├── type: string
      │   ├── status: string
      │   ├── data: map
      │   └── startedAt: timestamp
      ├── history: array
      ├── createdAt: timestamp
      ├── updatedAt: timestamp
      └── expiresAt: timestamp
```

---

### **mealLogs**

```
mealLogs/
  └── {mealLogId}/
      ├── id: string
      ├── patientId: string
      ├── prescriberId: string
      ├── conversationId: string
      ├── mealType: string
      ├── timestamp: timestamp
      ├── photoUrl: string
      ├── foods: array
      ├── totalMacros: map
      ├── adherence: map
      ├── notes: string
      └── createdAt: timestamp
```

---

### **dailyMacros**

```
dailyMacros/
  └── {patientId}_{date}/
      ├── patientId: string
      ├── date: string
      ├── protein: number
      ├── carbs: number
      ├── fats: number
      ├── calories: number
      ├── mealCount: number
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

---

## ✅ **CHECKLIST**

- [ ] Executar script: `node scripts/setup-firestore-collections.js`
- [ ] Ver relatório de sucesso
- [ ] Verificar collections no Firebase Console
- [ ] Testar endpoint de contexto
- [ ] Testar endpoint de refeições
- [ ] Testar endpoint de resumo
- [ ] Criar índices compostos (se necessário)
- [ ] Deletar documentos de exemplo (opcional)

---

## 🎉 **PRONTO!**

Firestore configurado e pronto para produção! 🚀

**Próximo passo:** Configurar workflow N8N para usar estes endpoints.

