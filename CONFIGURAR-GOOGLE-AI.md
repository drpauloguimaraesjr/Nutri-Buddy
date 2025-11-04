# 🤖 Configurar Google AI (Gemini) para Análise de Alimentos

## 🎯 O que é isso?

A integração com Google AI Studio (Gemini) permite que o NutriBuddy analise **automaticamente** fotos de refeições e retorne informações nutricionais detalhadas:

- 🍽️ Identificação automática de alimentos
- 📊 Cálculo de calorias e macronutrientes
- ⚖️ Estimativa de peso/porções
- 💡 Sugestões nutricionais
- 📈 Índice glicêmico e outras métricas

---

## 📝 Passo 1: Obter a API Key (GRÁTIS!)

### 1. Acesse o Google AI Studio
👉 https://makersuite.google.com/app/apikey

### 2. Faça login com sua conta Google

### 3. Clique em "Create API Key"
- Você pode criar uma nova API key ou usar uma existente
- **É GRÁTIS** para uso pessoal/desenvolvimento
- Limite gratuito: 60 requisições por minuto

### 4. Copie a chave
Você verá algo como:
```
AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq
```

---

## 🔧 Passo 2: Configurar no Backend

### Opção A: Arquivo `.env` (Recomendado)

Edite o arquivo `.env` na raiz do projeto:

```bash
nano /Users/drpgjr.../NutriBuddy/.env
```

Adicione esta linha:
```env
GOOGLE_AI_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq
```

### Opção B: Comando Rápido

```bash
echo "GOOGLE_AI_API_KEY=SUA_CHAVE_AQUI" >> /Users/drpgjr.../NutriBuddy/.env
```

Substitua `SUA_CHAVE_AQUI` pela chave que você copiou.

---

## 🚀 Passo 3: Reiniciar Backend

```bash
# Se o backend estiver rodando, pare-o (Ctrl+C)
# Depois reinicie:
cd /Users/drpgjr.../NutriBuddy
npm run dev
```

Você verá no console:
```
✅ Serviço de IA inicializado com sucesso!
```

---

## 🧪 Passo 4: Testar a Integração

### Teste 1: Verificar Status

```bash
curl http://localhost:3000/api/ai/status
```

Resposta esperada:
```json
{
  "enabled": true,
  "model": "gemini-1.5-flash",
  "message": "Serviço de IA está funcionando!"
}
```

### Teste 2: Analisar Texto

```bash
curl -X POST http://localhost:3000/api/ai/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"description": "2 ovos mexidos com 2 fatias de pão integral"}'
```

### Teste 3: Analisar Imagem

```bash
curl -X POST http://localhost:3000/api/ai/analyze-image \
  -F "image=@caminho/para/foto-comida.jpg"
```

---

## 📡 Endpoints Disponíveis

### 1. `GET /api/ai/status`
Verifica se a IA está configurada.

### 2. `POST /api/ai/analyze-image`
Analisa uma foto de alimento.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "name": "Arroz branco",
        "quantity": "150g",
        "calories": 195,
        "protein": 4,
        "carbs": 43,
        "fat": 0.5,
        "fiber": 0.6,
        "confidence": 0.9
      }
    ],
    "totalCalories": 195,
    "totalProtein": 4,
    "totalCarbs": 43,
    "totalFat": 0.5,
    "totalFiber": 0.6,
    "analysis": "Refeição rica em carboidratos...",
    "healthScore": 6,
    "suggestions": ["Adicione proteína", "Inclua vegetais"]
  },
  "model": "gemini-1.5-flash",
  "timestamp": "2025-11-03T..."
}
```

### 3. `POST /api/ai/analyze-text`
Analisa descrição textual de uma refeição.

**Request:**
```json
{
  "description": "2 ovos mexidos com bacon e torrada"
}
```

**Response:** (mesmo formato do analyze-image)

### 4. `POST /api/ai/advanced-estimates`
Calcula métricas avançadas.

**Request:**
```json
{
  "foods": [
    {
      "name": "Arroz",
      "quantity": "100g"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "glycemicIndex": 73,
    "glycemicLoad": "alta",
    "cholesterol": 0,
    "sodium": 1,
    "vitamins": {
      "A": "0 IU",
      "C": "0 mg",
      "D": "0 IU"
    }
  }
}
```

---

## 🔒 Segurança

- ✅ A chave fica apenas no arquivo `.env` (não commitado no Git)
- ✅ Nunca exponha a chave publicamente
- ✅ O `.env` já está no `.gitignore`

---

## 💰 Limites Gratuitos

**Google AI Studio (Free Tier):**
- 60 requisições por minuto
- 1.500 requisições por dia
- **Sem custo** para uso pessoal/desenvolvimento

Se precisar de mais:
- Upgrade para Google Cloud (pague por uso)
- Preço: ~$0.001 por requisição

---

## ❓ Problemas Comuns

### "Serviço de IA não está habilitado"
- Verifique se adicionou `GOOGLE_AI_API_KEY` no `.env`
- Reinicie o backend

### "Invalid API Key"
- Confirme que copiou a chave completa
- Verifique se não tem espaços extras
- Gere uma nova chave se necessário

### "Quota exceeded"
- Você atingiu o limite gratuito
- Aguarde alguns minutos
- Upgrade para plano pago se necessário

---

## 🎉 Pronto!

Agora o NutriBuddy pode analisar fotos de alimentos automaticamente! 🚀

### Próximos Passos:
1. ✅ Configure a API Key
2. ✅ Teste os endpoints
3. ✅ Integre com o frontend
4. ✅ Teste com fotos reais de comida

