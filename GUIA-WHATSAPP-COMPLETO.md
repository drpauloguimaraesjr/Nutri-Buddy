# 📱 GUIA COMPLETO DE INTEGRAÇÃO WHATSAPP - NutriBuddy

Este guia mostra como integrar o WhatsApp ao seu NutriBuddy usando a biblioteca **Baileys** (API não oficial do WhatsApp).

---

## 🎯 O QUE VOCÊ VAI CONSEGUIR

✅ Enviar mensagens automáticas via WhatsApp  
✅ Receber mensagens dos usuários  
✅ Salvar todas as conversas no Firebase  
✅ Integrar com N8N para automações  
✅ Enviar imagens e documentos  

---

## 📋 PRÉ-REQUISITOS

1. ✅ Projeto NutriBuddy já configurado
2. ✅ Firebase configurado e funcionando
3. ✅ Servidor rodando (local ou online)
4. ✅ Smartphone com WhatsApp para escanear QR Code

---

## 🚀 COMO USAR - PASSO A PASSO

### **PASSO 1: Verificar Instalação**

As dependências já foram instaladas automaticamente:
- `@whiskeysockets/baileys` - Biblioteca do WhatsApp
- `pino` - Sistema de logs
- `@hapi/boom` - Tratamento de erros

### **PASSO 2: Iniciar o Servidor**

```bash
npm start
# ou
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### **PASSO 3: Conectar o WhatsApp**

Abra seu navegador ou use cURL:

#### **Opção A: Via Navegador**

```
http://localhost:3000/api/whatsapp/connect
```

#### **Opção B: Via cURL**

```bash
curl http://localhost:3000/api/whatsapp/connect
```

**O que acontece:**
- O servidor inicia a conexão
- Um QR Code é gerado automaticamente

### **PASSO 4: Obter o QR Code**

#### **Opção A: Via Terminal**
O QR Code aparece automaticamente no terminal quando você conecta!

#### **Opção B: Via API**

```
http://localhost:3000/api/whatsapp/qr
```

**Ou via cURL:**

```bash
curl http://localhost:3000/api/whatsapp/qr
```

A resposta será:
```json
{
  "success": true,
  "qr": "2@s...@...",
  "instructions": {
    "step1": "Abra o WhatsApp no seu celular",
    "step2": "Vá em Configurações > Aparelhos Conectados",
    "step3": "Toque em 'Conectar um aparelho'",
    "step4": "Escaneie este QR Code"
  }
}
```

### **PASSO 5: Escanear QR Code no WhatsApp**

1. 📱 Abra o WhatsApp no seu celular
2. ⚙️ Toque nos **3 pontinhos** (menu)
3. 📡 Selecione **Aparelhos Conectados**
4. ➕ Toque em **Conectar um Aparelho**
5. 📷 Escaneie o QR Code que apareceu no terminal ou navegador

**✅ SUCESSO!** Quando conectar, você verá:
```
✅ WhatsApp conectado com sucesso!
```

### **PASSO 6: Verificar Status**

```bash
curl http://localhost:3000/api/whatsapp/status
```

Resposta esperada:
```json
{
  "success": true,
  "connected": true,
  "status": "open",
  "hasQr": false,
  "message": "WhatsApp está conectado e pronto!"
}
```

---

## 📤 ENVIAR MENSAGENS

### **Enviar Mensagem de Texto**

#### Via cURL:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999@s.whatsapp.net",
    "message": "Olá! Esta é uma mensagem automática do NutriBuddy 🍎"
  }'
```

#### Via JavaScript (Node.js):

```javascript
const axios = require('axios');

async function enviarMensagem() {
  try {
    const response = await axios.post('http://localhost:3000/api/whatsapp/send', {
      to: '5511999999999@s.whatsapp.net',
      message: 'Olá! Seu resumo nutricional está pronto! 🎉'
    });
    
    console.log('✅ Mensagem enviada:', response.data);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

enviarMensagem();
```

#### Via Navegador (Postman ou Thunder Client):

- **Method:** POST
- **URL:** `http://localhost:3000/api/whatsapp/send`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "to": "5511999999999@s.whatsapp.net",
  "message": "Sua meta de calorias: 2000 kcal"
}
```

### **Enviar Imagem**

```bash
curl -X POST http://localhost:3000/api/whatsapp/send-image \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999@s.whatsapp.net",
    "imageUrl": "https://exemplo.com/imagem.png",
    "caption": "Gráfico do seu progresso nutricional 📊"
  }'
```

---

## 📨 RECEBER MENSAGENS

As mensagens recebidas são **automaticamente salvas no Firebase** na coleção `whatsapp_messages`.

### **Ver Mensagens Recebidas**

```bash
curl http://localhost:3000/api/whatsapp/messages
```

### **Estrutura no Firebase**

Todas as mensagens são salvas em:
```
whatsapp_messages/
  └── {messageId}/
      ├── type: "sent" | "received"
      ├── to: "5511999999999@s.whatsapp.net"
      ├── from: "5511888888888@s.whatsapp.net"
      ├── message: "Conteúdo da mensagem"
      ├── timestamp: Timestamp
      └── success: true
```

---

## 🔗 FORMATO DO NÚMERO

⚠️ **IMPORTANTE:** O número do WhatsApp precisa estar no formato correto!

### **Formato Correto:**

```
{PAÍS}{DDD}{NÚMERO}@s.whatsapp.net
```

### **Exemplos:**

- **Brasil:** `5511999999999@s.whatsapp.net`
  - 55 = Código do Brasil
  - 11 = DDD (sem o 0)
  - 999999999 = Número (9 dígitos)

- **EUA:** `15551234567@s.whatsapp.net`
- **Portugal:** `351912345678@s.whatsapp.net`

### **Como Converter seu Número:**

```
Exemplo: (11) 99999-9999
1. Remova parênteses, espaços e hífens: 11999999999
2. Adicione código do país: 5511999999999
3. Adicione @s.whatsapp.net: 5511999999999@s.whatsapp.net
```

---

## 🔄 INTEGRAÇÃO COM N8N

### **Configurar no N8N:**

1. **Adicione um nó HTTP Request**
2. **Configure:**
   - Method: `POST`
   - URL: `http://seu-servidor:3000/api/whatsapp/send`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "to": "{{ $json.phone }}",
     "message": "{{ $json.message }}"
   }
   ```

### **Exemplo de Workflow:**

```
┌─────────────┐
│  Trigger    │ ──> WhatsApp conectado
└─────┬───────┘
      │
┌─────▼──────────────────┐
│  Code (Processar)     │ ──> Preparar mensagem
└─────┬──────────────────┘
      │
┌─────▼──────────────────┐
│  HTTP Request         │ ──> Enviar WhatsApp
└────────────────────────┘
```

---

## 🎨 CASOS DE USO DO NUTRIBUDDY

### **1. Lembretes de Refeição**

```javascript
// Enviar lembrete 3x por dia
const lembretes = [
  { horario: "07:00", mensagem: "☀️ Bom dia! Que tal um café da manhã nutritivo?" },
  { horario: "12:00", mensagem: "🍽️ Hora do almoço! Registre sua refeição." },
  { horario: "19:00", mensagem: "🌙 Bom jantar! Mantenha o foco nos seus objetivos!" }
];
```

### **2. Resumo Diário**

```javascript
// Enviar resumo nutricional diário
const resumo = {
  message: `
📊 SEU RESUMO DE HOJE:

🔥 Calorias: 1850 / 2000 kcal
🥩 Proteína: 120g ✅
🍞 Carboidratos: 180g ✅
🥑 Gorduras: 60g ✅

🎯 Meta alcançada: 92%!
👏 Continue assim!
  `
};
```

### **3. Avisos de Meta**

```javascript
// Avisar quando bater meta
if (calorias >= metaCalorias) {
  enviarMensagem({
    to: usuario.whatsapp,
    message: "🎉 PARABÉNS! Você atingiu sua meta de calorias hoje!"
  });
}
```

### **4. Receitas Personalizadas**

```javascript
// Enviar receita baseada no perfil
const receita = `
🍎 RECEITA PARA VOCÊ:

Bowl de Açaí Energético
━━━━━━━━━━━━━━━━━━━━━
• 200ml de açaí puro
• 1 banana
• 30g de granola
• 10g de mel

Calorias: 350 kcal
Proteína: 8g
Carboidratos: 65g
  `;
```

---

## 📋 ENDPOINTS DISPONÍVEIS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **GET** | `/api/whatsapp/connect` | Iniciar conexão |
| **GET** | `/api/whatsapp/qr` | Obter QR Code |
| **GET** | `/api/whatsapp/status` | Status da conexão |
| **POST** | `/api/whatsapp/send` | Enviar texto |
| **POST** | `/api/whatsapp/send-image` | Enviar imagem |
| **POST** | `/api/whatsapp/disconnect` | Desconectar |
| **POST** | `/api/whatsapp/clean-auth` | Limpar autenticação |
| **GET** | `/api/whatsapp/messages` | Listar mensagens |
| **GET** | `/api/whatsapp/webhook-url` | URL do webhook |

---

## 🛠️ TROUBLESHOOTING

### **❌ Problema: "WhatsApp não está conectado"**

**Solução:**
1. Verifique se escaneou o QR Code: `http://localhost:3000/api/whatsapp/status`
2. Se não, chame `/connect` novamente
3. Aguarde alguns segundos após escanear

### **❌ Problema: QR Code expira**

**Solução:**
1. QR Code expira a cada 20 segundos
2. Chame `/connect` novamente para gerar novo QR
3. Ou chame `/qr` para ver o QR atual

### **❌ Problema: Mensagem não enviada**

**Verifique:**
1. ✅ WhatsApp está conectado? (`/status`)
2. ✅ Número está no formato correto? (`5511999999999@s.whatsapp.net`)
3. ✅ Número existe no WhatsApp?
4. ✅ Consegue ver as mensagens no terminal?

### **❌ Problema: "Cannot send message"**

**Possíveis causas:**
- Número incorreto
- WhatsApp não conectado
- Bloqueio do número
- Timeout de conexão

**Solução:**
1. Verifique logs no terminal
2. Teste com outro número
3. Reinicie o servidor

### **❌ Problema: "Session logged out"**

**Solução:**
1. Sessão expirada
2. Chame `/clean-auth` para limpar
3. Chame `/connect` novamente
4. Escaneie novo QR Code

---

## 🔒 SEGURANÇA

### **⚠️ AVISOS IMPORTANTES**

1. **API Não Oficial**: Esta é uma API não oficial do WhatsApp. Use por sua conta e risco.
2. **Rate Limits**: Evite enviar muitas mensagens em pouco tempo.
3. **Privacidade**: Nunca compartilhe seu QR Code ou credenciais.
4. **Compliance**: Respeite as políticas de uso do WhatsApp.

### **✅ BOAS PRÁTICAS**

- ✅ Use apenas para automações legítimas
- ✅ Sempre peça permissão antes de enviar mensagens
- ✅ Implemente opt-in/opt-out
- ✅ Não envie spam
- ✅ Monitore o uso da API

---

## 🌐 DEPLOY ONLINE

### **Para rodar 24/7:**

1. **Railway/Render/Vercel:** Deploy o servidor
2. **ngrok:** Expor localmente se necessário
3. **Manter conexão:** Use PM2 ou similar

**Ver guia completo:** `DEPLOY-ONLINE-COMPLETO.md`

---

## 📞 TESTAR TUDO

### **Script de Teste Completo:**

```bash
#!/bin/bash

echo "🔍 Testando conexão..."
curl http://localhost:3000/api/whatsapp/status

echo -e "\n\n🔄 Iniciando conexão..."
curl http://localhost:3000/api/whatsapp/connect

echo -e "\n\n📱 Obtendo QR Code..."
curl http://localhost:3000/api/whatsapp/qr

echo -e "\n\n✅ Status final..."
curl http://localhost:3000/api/whatsapp/status
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Baileys:** https://github.com/WhiskeySockets/Baileys
- **WhatsApp Business API:** https://www.whatsapp.com/business/api

---

## 🎉 PRÓXIMOS PASSOS

1. ✅ Conecte seu WhatsApp
2. ✅ Teste envio de mensagens
3. ✅ Configure integração com N8N
4. ✅ Crie seus próprios fluxos de automação
5. ✅ Deploy online se necessário

---

**Desenvolvido para NutriBuddy** 🍎📱  
**Pronto para uso em produção!** 🚀

