# 📱 Guia: WhatsApp Totalmente Integrado com NutriBuddy

## 🎉 O Que Foi Implementado

Agora você pode usar **TODAS** as funcionalidades do NutriBuddy diretamente pelo WhatsApp!

---

## 🚀 Como Usar

### 1. Conectar WhatsApp

**Opção A: Via API**
```bash
curl -X POST http://localhost:3000/api/whatsapp/connect
```

**Opção B: Via Frontend**
- Acesse `/dashboard/settings` (quando implementado)
- Clique em "Conectar WhatsApp"
- Escaneie o QR Code

### 2. Obter QR Code

```bash
curl http://localhost:3000/api/whatsapp/qr
```

Escaneie o QR Code com seu WhatsApp.

---

## 📋 Comandos Disponíveis

### 📸 Enviar Foto de Alimento
**Como:**
1. Tire uma foto da sua refeição
2. Envie para o WhatsApp conectado
3. Opcionalmente, adicione uma legenda descritiva

**O que acontece:**
- IA analisa automaticamente a imagem
- Identifica os alimentos
- Calcula calorias e macronutrientes
- Salva no seu histórico
- Envia resumo nutricional

**Exemplo de Resposta:**
```
✅ Refeição Registrada!

📊 Resumo Nutricional:
🔥 Calorias: 450 kcal
💪 Proteínas: 35g
🍞 Carboidratos: 42g
🥑 Gorduras: 12g

🍽️ Alimentos Identificados:
1. Frango grelhado (150g) - 165 kcal
2. Arroz integral (100g) - 123 kcal
3. Brócolis (80g) - 27 kcal

💡 Análise: Refeição equilibrada com boa quantidade de proteínas...

⭐ Pontuação de Saúde: 8/10
```

---

### 💬 Descrever Refeição por Texto

**Como:**
Envie uma mensagem descrevendo o que você comeu.

**Exemplos:**
```
"Comi 2 ovos mexidos com 2 fatias de pão integral"
"Jantar: 200g de salmão grelhado com batata doce"
"Café da manhã: iogurte grego com granola e banana"
```

**O que acontece:**
- IA analisa o texto
- Identifica alimentos e quantidades
- Calcula nutrientes
- Salva automaticamente
- Envia confirmação

---

### 💧 Registrar Água

**Como:**
Envie mensagens como:
```
"Bebi 500ml de água"
"Tomei 1 litro de água"
"Água: 250ml"
```

**Resposta:**
```
💧 Água Registrada!

Você bebeu: 500ml

Continue se hidratando! 💪
```

---

### 🏃 Registrar Exercício

**Como:**
Envie mensagens como:
```
"Fiz 30 minutos de corrida"
"Treino de academia 1 hora"
"Caminhada de 45min"
```

**Resposta:**
```
🏃 Exercício Registrado!

📝 Corrida
⏱️ Duração: 30 minutos
🔥 Calorias queimadas: ~180 kcal

Parabéns pelo treino! 💪
```

---

### ⚖️ Registrar Peso

**Como:**
```
"Meu peso está 75kg"
"Pesei 68.5kg"
```

**Resposta:**
```
⚖️ Peso Registrado!

Seu peso atual: 75kg

Continue acompanhando sua evolução! 📈
```

---

### 📊 Ver Resumo do Dia

**Como:**
Envie:
```
"Resumo"
"Hoje"
"Saldo"
```

**Resposta:**
```
📊 Resumo do Dia - 03/11/2025

🍽️ Alimentação:
• Refeições: 3
• Calorias consumidas: 1850 kcal

🏃 Atividade Física:
• Exercícios: 1
• Tempo total: 30 min
• Calorias queimadas: 180 kcal

💧 Hidratação:
• Água consumida: 1500ml

⚖️ Saldo Calórico: +1670 kcal

✅ Seu saldo calórico está equilibrado!
```

---

### 📋 Menu de Ajuda

**Como:**
Envie:
```
"Menu"
"Ajuda"
"Help"
```

**Resposta:**
Mostra todos os comandos disponíveis.

---

## 🔧 Configuração Técnica

### Backend (`server.js`)
O handler é inicializado automaticamente quando o servidor inicia:

```javascript
const WhatsAppMessageHandler = require('./services/whatsappHandler');
const handler = new WhatsAppMessageHandler(whatsappService);
handler.register();
```

### Handler de Mensagens (`services/whatsappHandler.js`)
Processa:
- ✅ Fotos de alimentos (análise via IA)
- ✅ Áudios (em desenvolvimento)
- ✅ Descrições textuais de refeições
- ✅ Comandos de água
- ✅ Comandos de exercício
- ✅ Comandos de peso
- ✅ Resumos e consultas

### Integração com Firebase
Todos os dados são salvos automaticamente no Firestore:
- `meals` - Refeições
- `water` - Consumo de água
- `exercises` - Exercícios
- `measurements` - Peso e medidas

---

## 🔐 Segurança e Privacidade

### Autenticação
O handler verifica se o número de WhatsApp está cadastrado no Firebase:

```javascript
const userId = await this.getUserIdByPhone(phoneNumber);
```

Se não estiver cadastrado, envia mensagem pedindo para se registrar no app.

### Dados
- Apenas usuários registrados podem usar
- Dados são salvos apenas no Firestore do usuário
- Imagens não são armazenadas (apenas análise)
- Conversas não são logadas permanentemente

---

## 🎯 Fluxo de Uso Típico

### Manhã:
```
Usuário: [Envia foto do café da manhã]
Bot: ✅ Refeição Registrada! 420 kcal

Usuário: Bebi 500ml de água
Bot: 💧 Água Registrada! 500ml
```

### Almoço:
```
Usuário: Almocei 200g de frango com arroz e salada
Bot: ✅ Refeição Registrada! 650 kcal
```

### Tarde:
```
Usuário: Fiz 45min de academia
Bot: 🏃 Exercício Registrado! ~270 kcal queimadas
```

### Noite:
```
Usuário: Resumo
Bot: [Envia resumo completo do dia]
```

---

## 🐛 Troubleshooting

### "WhatsApp não está conectado"
```bash
# Conectar
curl -X POST http://localhost:3000/api/whatsapp/connect

# Verificar status
curl http://localhost:3000/api/whatsapp/status
```

### "IA não conseguiu analisar"
- Certifique-se que `GOOGLE_AI_API_KEY` está configurada
- Verifique se a IA está habilitada: `curl http://localhost:3000/api/api/status`
- Tente descrever por texto em vez de foto

### "Usuário não encontrado"
- O número precisa estar cadastrado no app primeiro
- Adicione o campo `phone` no documento do usuário no Firestore

---

## 🚀 Próximos Passos

### Em Desenvolvimento:
- [ ] Suporte a áudios (transcrição de voz)
- [ ] Lembretes automáticos de refeições
- [ ] Relatórios semanais via WhatsApp
- [ ] Receitas personalizadas
- [ ] Integração com grupos

### Futuro:
- [ ] WhatsApp Business API
- [ ] Múltiplos usuários por número
- [ ] Pagamentos via WhatsApp
- [ ] Videochamadas com nutricionista

---

## 📞 Comandos Administrativos

### Verificar Status
```bash
curl http://localhost:3000/api/whatsapp/status
```

### Desconectar
```bash
curl -X POST http://localhost:3000/api/whatsapp/disconnect
```

### Limpar Autenticação
```bash
curl -X POST http://localhost:3000/api/whatsapp/clean-auth
```

---

## 🎉 Está Tudo Pronto!

O WhatsApp agora está **100% integrado** com todas as funcionalidades do NutriBuddy!

Basta conectar e começar a usar! 📱✨

