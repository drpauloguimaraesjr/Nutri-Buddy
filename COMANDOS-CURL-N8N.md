# 📋 Comandos cURL para Importar no N8N

## 🔧 Configuração Necessária

**IMPORTANTE:** Antes de usar, certifique-se de que `WEBHOOK_SECRET=nutribuddy-secret-2024` está configurado no Railway!

---

## 📡 Comandos para Cada Nó

### 1. Buscar Nutrição (GET)
```bash
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

**Para usar:**
- Cole no Import cURL do nó "Buscar Nutrição1"
- Clique em Import

---

### 2. Salvar Nutrição (POST)
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"calories": 2000, "protein": 150, "carbs": 200, "fats": 80}'
```

**Para usar:**
- Cole no Import cURL do nó "Salvar Nutrição"
- Clique em Import
- O body JSON pode ser ajustado conforme necessário

---

### 3. Salvar Refeição (POST)
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/meals' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"type": "breakfast", "calories": 500, "protein": 30, "carbs": 50, "fats": 20}'
```

**Para usar:**
- Cole no Import cURL do nó "Salvar Refeição"
- Clique em Import

---

### 4. Health Check (GET - Sem autenticação)
```bash
curl 'https://web-production-c9eaf.up.railway.app/api/health'
```

**Para usar:**
- Cole no Import cURL do nó "Health Check - NutriBuddy"
- Clique em Import

---

### 5. HTTP Request - NutriBuddy API (Webhook)
```bash
curl -X POST 'https://web-production-c9eaf.up.railway.app/api/webhook' \
  -H 'x-webhook-secret: nutribuddy-secret-2024' \
  -H 'Content-Type: application/json' \
  -d '{"event": "nutrition_update", "data": {"calories": 2000}}'
```

**Para usar:**
- Cole no Import cURL do nó "HTTP Request - NutriBuddy API"
- Clique em Import

---

## ⚠️ IMPORTANTE

### Se o WEBHOOK_SECRET for diferente:
Substitua `nutribuddy-secret-2024` pelo valor que está configurado no Railway.

### Para descobrir o valor:
1. Acesse Railway → Variables
2. Veja o valor de `WEBHOOK_SECRET`
3. Use esse valor nos comandos acima

---

## ✅ Teste Rápido

Antes de importar no N8N, teste no terminal:

```bash
# Teste Health Check (sem auth)
curl 'https://web-production-c9eaf.up.railway.app/api/health'

# Teste Nutrition (com webhook secret)
curl -X GET 'https://web-production-c9eaf.up.railway.app/api/nutrition' \
  -H 'x-webhook-secret: nutribuddy-secret-2024'
```

Se ambos funcionarem, pode importar no N8N com segurança!

---

**Pronto para usar! 🚀**

