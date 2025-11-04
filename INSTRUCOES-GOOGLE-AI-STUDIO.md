# 🎨 Frontend NutriBuddy - Google AI Studio

## 🎯 SETUP NO GOOGLE AI STUDIO

### Por que Google AI Studio?
- ✅ Integração com IA do Google (Gemini)
- ✅ Deploy rápido
- ✅ Gratuito
- ✅ Fácil de usar

---

## 📋 PASSO A PASSO

### 1️⃣ Acessar Google AI Studio

1. Acesse: https://aistudio.google.com
2. Faça login com sua conta Google
3. Crie um novo projeto

### 2️⃣ Criar o Frontend

Você tem o arquivo: `frontend-replit.html`

**OPÇÃO A - Usar o HTML como está:**
- Copie o conteúdo de `frontend-replit.html`
- Cole no Google AI Studio
- O dashboard funcionará normalmente

**OPÇÃO B - Integrar com Gemini (recomendado):**
- Use o HTML base
- Adicione integração com Gemini API
- IA pode sugerir refeições, calcular macros, etc.

### 3️⃣ Configurar API

No código, atualize:

```javascript
// Configuração da API Backend
const API_BASE = 'http://localhost:3000';  // Dev
// ou
const API_BASE = 'https://sua-url.com';    // Produção

// Configuração Gemini (se usar)
const GEMINI_API_KEY = 'sua-chave-gemini';
```

### 4️⃣ Deploy

1. No Google AI Studio, clique em "Deploy"
2. Escolha as opções de deploy
3. Obtenha a URL pública

---

## 🤖 VANTAGENS DE USAR GOOGLE AI STUDIO

### Com Gemini Integrado

Você pode adicionar funcionalidades IA:

1. **Análise Nutricional Inteligente**
   ```javascript
   "Analise esta refeição: 200g de frango, 100g de arroz"
   → IA calcula calorias, proteínas automaticamente
   ```

2. **Sugestões de Refeições**
   ```javascript
   "Sugira uma refeição com 500 calorias e 30g de proteína"
   → IA sugere opções
   ```

3. **Planejamento Semanal**
   ```javascript
   "Crie um cardápio semanal para 2000 calorias/dia"
   → IA gera plano completo
   ```

---

## 🔗 INTEGRAÇÃO COMPLETA

```
┌─────────────────┐
│  Google AI      │
│  Studio         │
│  (Frontend)     │
└────────┬────────┘
         │
         │ HTTP REST
         ▼
┌─────────────────┐
│  NutriBuddy API │
│  (Backend)      │
└────────┬────────┘
         │
         │ Webhook
         ▼
┌─────────────────┐
│      N8N        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Firebase     │
└─────────────────┘
```

---

## 📝 EXEMPLO COM GEMINI

Crie um arquivo `index.html` no Google AI Studio:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>NutriBuddy AI</title>
</head>
<body>
    <h1>🍎 NutriBuddy AI</h1>
    
    <!-- Seu dashboard aqui -->
    <div id="dashboard"></div>
    
    <!-- Chat com IA -->
    <div id="ai-chat">
        <input id="ai-input" placeholder="Pergunte à IA sobre nutrição...">
        <button onclick="askAI()">Perguntar</button>
        <div id="ai-response"></div>
    </div>

    <script>
        // Configuração
        const API_BASE = 'http://localhost:3000';
        const GEMINI_API_KEY = 'sua-chave';

        // Função para perguntar à IA
        async function askAI() {
            const question = document.getElementById('ai-input').value;
            
            // Chamar Gemini API
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Como nutricionista, responda: ${question}`
                        }]
                    }]
                })
            });
            
            const data = await response.json();
            document.getElementById('ai-response').innerText = 
                data.candidates[0].content.parts[0].text;
        }

        // Seu código do dashboard aqui
        // (copie do frontend-replit.html)
    </script>
</body>
</html>
```

---

## ⚙️ CONFIGURAÇÃO

### 1. Obter Chave Gemini API

1. Acesse: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave
4. Cole no código: `GEMINI_API_KEY`

### 2. Configurar Backend URL

Se backend está em:
- **Localhost**: `http://localhost:3000`
- **ngrok**: `https://abc123.ngrok.io`
- **Cloud**: `https://sua-api.railway.app`

Atualize `API_BASE` no código

---

## 🚀 VANTAGENS vs REPLIT

| Feature | Replit | Google AI Studio |
|---------|--------|------------------|
| Grátis | ✅ | ✅ |
| IA Integrada | ❌ | ✅ Gemini |
| Deploy Fácil | ✅ | ✅ |
| Custom Domain | 💰 Pago | ✅ Grátis |
| Gemini API | Precisa adicionar | 🎯 Nativo |

---

## 📚 RECURSOS ADICIONAIS

### Usar o Dashboard Existente

1. Copie `frontend-replit.html`
2. Cole no Google AI Studio
3. Adicione Gemini se quiser IA
4. Deploy!

### Adicionar IA ao Dashboard

Integre Gemini para:
- Análise automática de refeições
- Sugestões inteligentes
- Cálculo de macros por foto
- Planejamento de cardápio

---

## 🎯 RECOMENDAÇÃO

### Opção 1: Dashboard Simples
✅ Use `frontend-replit.html` direto  
✅ Funciona igual no Google AI Studio  
✅ Sem IA, apenas dashboard visual  

### Opção 2: Dashboard + IA (RECOMENDADO!)
✅ Use `frontend-replit.html` como base  
✅ Adicione Gemini API  
✅ IA ajuda usuário com nutrição  
✅ Diferencial do app!  

---

## 🔧 TROUBLESHOOTING

### CORS Error
```javascript
// No backend (.env)
CORS_ORIGIN=https://seu-app.google.com
```

### Gemini não responde
- Verifique API Key
- Confira quotas no console

### Backend não conecta
- Use ngrok se backend for localhost
- Configure CORS corretamente

---

## ✅ CHECKLIST

- [ ] Google AI Studio aberto
- [ ] Código copiado de `frontend-replit.html`
- [ ] API_BASE configurado
- [ ] Gemini API Key obtida (se usar IA)
- [ ] Deploy feito
- [ ] Testado e funcionando

---

## 🎉 RESULTADO FINAL

Você terá:
- ✅ Dashboard visual moderno
- ✅ Integração com backend
- ✅ IA Gemini (opcional)
- ✅ Deploy público grátis
- ✅ Fácil de manter

---

**Google AI Studio + NutriBuddy = App Completo! 🚀**

