# 📱 INTEGRAÇÃO WHATSAPP - NUTRIBUDDY

## ✅ STATUS: IMPLEMENTAÇÃO COMPLETA

A integração com WhatsApp está **100% funcional** e pronta para uso!

---

## 🎯 COMO FUNCIONA

### **Arquitetura**

```
┌─────────────────┐
│   WhatsApp      │ ← Usuário envia mensagem
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Baileys API    │ ← Biblioteca não oficial do WhatsApp
│  (services/     │
│  whatsapp.js)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Message        │ ← Processa comandos
│  Handler        │
│  (services/     │
│  whatsappHandler│
│  .js)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Firebase       │ ← Salva dados
│  Firestore      │
└─────────────────┘
```

---

## 📂 ARQUIVOS IMPLEMENTADOS

### **1. Serviço WhatsApp** (`services/whatsapp.js`)
- ✅ Conexão via QR Code
- ✅ Envio de mensagens de texto
- ✅ Envio de imagens
- ✅ Recebimento de mensagens
- ✅ Download de mídia (imagens, vídeos, áudios)
- ✅ Status de conexão
- ✅ Reconexão automática
- ✅ Salvamento de mensagens no Firebase

### **2. Rotas API** (`routes/whatsapp.js`)
- ✅ `GET /api/whatsapp/connect` - Iniciar conexão
- ✅ `GET /api/whatsapp/qr` - Obter QR Code
- ✅ `GET /api/whatsapp/status` - Ver status
- ✅ `POST /api/whatsapp/send` - Enviar mensagem
- ✅ `POST /api/whatsapp/send-image` - Enviar imagem
- ✅ `POST /api/whatsapp/disconnect` - Desconectar
- ✅ `POST /api/whatsapp/clean-auth` - Limpar autenticação
- ✅ `GET /api/whatsapp/messages` - Listar mensagens

### **3. Handler de Mensagens** (`services/whatsappHandler.js`)
- ✅ Processa comandos de texto
- ✅ Analisa fotos de alimentos com IA
- ✅ Registra refeições automaticamente
- ✅ Registra água, exercícios, peso
- ✅ Fornece resumos do dia
- ✅ Menu de ajuda interativo

---

## 🚀 COMO USAR - PASSO A PASSO

### **PASSO 1: Iniciar o Servidor**

```bash
npm start
```

Você verá:
```
🚀 NutriBuddy API Server Running
✅ WhatsApp Message Handler registrado!
```

### **PASSO 2: Conectar WhatsApp**

**Opção A: Via navegador**
```
http://localhost:3000/api/whatsapp/connect
```

**Opção B: Via terminal**
```bash
curl http://localhost:3000/api/whatsapp/connect
```

### **PASSO 3: Obter QR Code**

**Opção A: Via navegador**
```
http://localhost:3000/api/whatsapp/qr
```

**Opção B: Via terminal**
```bash
curl http://localhost:3000/api/whatsapp/qr
```

O QR Code também aparece automaticamente no terminal!

### **PASSO 4: Escanear QR Code**

1. 📱 Abra o WhatsApp no seu celular
2. ⚙️ Menu (3 pontinhos) → **Aparelhos Conectados**
3. ➕ **Conectar um aparelho**
4. 📷 Escaneie o QR Code

### **PASSO 5: Verificar Status**

```bash
curl http://localhost:3000/api/whatsapp/status
```

Resposta esperada:
```json
{
  "success": true,
  "connected": true,
  "status": "open",
  "message": "WhatsApp está conectado e pronto!"
}
```

---

## 📤 ENVIAR MENSAGENS

### **Enviar Texto**

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999@s.whatsapp.net",
    "message": "Olá do NutriBuddy! 🍎"
  }'
```

### **Enviar Imagem**

```bash
curl -X POST http://localhost:3000/api/whatsapp/send-image \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999@s.whatsapp.net",
    "imageUrl": "https://exemplo.com/imagem.png",
    "caption": "Gráfico do seu progresso 📊"
  }'
```

---

## 📨 RECEBER E PROCESSAR MENSAGENS

### **Comandos Disponíveis**

O handler processa automaticamente os seguintes comandos:

#### **1. Menu de Ajuda**
```
menu
ajuda
help
```

#### **2. Registrar Água**
```
Bebi 500ml de água
Bebi 1 litro
```

#### **3. Registrar Exercício**
```
Fiz 30min de corrida
Fiz 1h de academia
Fiz 45min de musculação
```

#### **4. Registrar Peso**
```
Meu peso está 75kg
Peso: 75kg
```

#### **5. Resumo do Dia**
```
resumo
hoje
saldo
```

#### **6. Enviar Foto de Alimento**
- 📸 Envie uma foto da sua refeição
- O bot analisa automaticamente com IA
- Registra a refeição no Firebase

#### **7. Descrever Refeição**
```
Comi 2 ovos mexidos com 2 fatias de pão integral
Comi 200g de frango grelhado com 150g de arroz
```

---

## 🔄 FLUXO COMPLETO DE UMA MENSAGEM

### **Exemplo: Usuário envia foto de alimento**

```
1. Usuário envia foto no WhatsApp
   ↓
2. Baileys recebe a mensagem
   ↓
3. WhatsAppService.processa mensagem
   ↓
4. WhatsAppHandler.handleFoodImage()
   ↓
5. Download da imagem (downloadMediaMessage)
   ↓
6. Análise com IA (OpenAI Vision)
   ↓
7. Extração de dados nutricionais
   ↓
8. Salvar no Firestore (coleção 'meals')
   ↓
9. Enviar resposta formatada ao usuário
```

---

## 💾 DADOS NO FIREBASE

### **Coleção: `whatsapp_messages`**
Mensagens enviadas e recebidas são salvas automaticamente:

```json
{
  "type": "sent" | "received",
  "to": "5511999999999@s.whatsapp.net",
  "from": "5511888888888@s.whatsapp.net",
  "message": "Conteúdo da mensagem",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "success": true
}
```

### **Coleção: `meals`**
Refeições registradas via WhatsApp:

```json
{
  "userId": "user123",
  "date": "2024-01-01",
  "name": "Refeição via WhatsApp",
  "totalCalories": 500,
  "protein": 30,
  "carbs": 50,
  "fat": 20,
  "source": "whatsapp",
  "analysis": "Análise da IA...",
  "foods": [...]
}
```

---

## 🔗 INTEGRAÇÃO COM N8N

### **Enviar Mensagem via N8N**

Configure um nó HTTP Request no N8N:

```
Method: POST
URL: http://seu-servidor:3000/api/whatsapp/send
Headers:
  Content-Type: application/json
Body:
{
  "to": "{{ $json.phone }}",
  "message": "{{ $json.message }}"
}
```

### **Exemplo de Workflow**

```
Webhook Trigger
    ↓
Processar Dados
    ↓
Calcular Resumo Nutricional
    ↓
HTTP Request → /api/whatsapp/send
    ↓
Enviar Resumo ao Usuário
```

---

## 🎨 CASOS DE USO

### **1. Lembretes de Refeição**
Enviar lembretes 3x por dia para o usuário se alimentar.

### **2. Resumo Diário**
Enviar resumo nutricional ao final do dia.

### **3. Análise de Fotos**
Usuário envia foto → Bot analisa → Registra automaticamente.

### **4. Avisos de Meta**
Notificar quando o usuário atingir suas metas nutricionais.

### **5. Receitas Personalizadas**
Enviar receitas baseadas no perfil do usuário.

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### **Variáveis de Ambiente**

No arquivo `.env`:

```env
# WhatsApp (já configurado automaticamente)
# Não precisa de configuração adicional

# OpenAI (para análise de imagens)
OPENAI_API_KEY=sk-...

# Firebase (já configurado)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

### **Dependências**

Já instaladas no `package.json`:
- ✅ `@whiskeysockets/baileys` - API WhatsApp
- ✅ `pino` - Logs
- ✅ `openai` - IA para análise

---

## 🛠️ TROUBLESHOOTING

### **❌ Problema: "WhatsApp não está conectado"**

**Solução:**
1. Verifique se escaneou o QR Code
2. Chame `/api/whatsapp/status` para verificar
3. Se não conectado, chame `/api/whatsapp/connect` novamente

### **❌ Problema: QR Code expira**

**Solução:**
- QR Code expira a cada 20 segundos
- Chame `/api/whatsapp/connect` para gerar novo
- Ou chame `/api/whatsapp/qr` para ver o QR atual

### **❌ Problema: Mensagem não enviada**

**Verifique:**
1. ✅ WhatsApp está conectado? (`/api/whatsapp/status`)
2. ✅ Número está no formato correto? (`5511999999999@s.whatsapp.net`)
3. ✅ Número existe no WhatsApp?
4. ✅ Verifique logs no terminal

### **❌ Problema: "Session logged out"**

**Solução:**
1. Sessão expirada
2. Chame `/api/whatsapp/clean-auth` para limpar
3. Chame `/api/whatsapp/connect` novamente
4. Escaneie novo QR Code

### **❌ Problema: Análise de imagem não funciona**

**Verifique:**
1. ✅ `OPENAI_API_KEY` está configurada?
2. ✅ Créditos OpenAI disponíveis?
3. ✅ Imagem está em formato suportado? (JPEG, PNG)

---

## 📊 FORMATO DO NÚMERO

⚠️ **IMPORTANTE:** O número precisa estar no formato correto!

### **Formato:**
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

### **Como Converter:**
```
Exemplo: (11) 99999-9999
1. Remover: parênteses, espaços, hífens → 11999999999
2. Adicionar código do país → 5511999999999
3. Adicionar @s.whatsapp.net → 5511999999999@s.whatsapp.net
```

---

## 🔒 SEGURANÇA E AVISOS

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

## 📚 DOCUMENTAÇÃO ADICIONAL

### **Guias Disponíveis:**
- 📖 `GUIA-WHATSAPP-COMPLETO.md` - Documentação completa
- ⚡ `WHATSAPP-SETUP-RAPIDO.md` - Setup em 5 minutos
- 📋 `RESUMO-WHATSAPP.md` - Visão geral

### **Recursos Externos:**
- **Baileys:** https://github.com/WhiskeySockets/Baileys
- **WhatsApp Business API:** https://www.whatsapp.com/business/api

---

## ✅ RESUMO

### **O que está implementado:**
- ✅ Conexão WhatsApp via QR Code
- ✅ Envio de mensagens
- ✅ Recebimento de mensagens
- ✅ Análise de imagens com IA
- ✅ Processamento de comandos
- ✅ Integração com Firebase
- ✅ Handler inteligente de mensagens

### **Próximos passos:**
1. ✅ Conecte seu WhatsApp (`/api/whatsapp/connect`)
2. ✅ Teste envio de mensagens
3. ✅ Teste recebimento (envie mensagens para o número conectado)
4. ✅ Configure integração com N8N
5. ✅ Faça deploy online se necessário

---

**🚀 A integração está completa e pronta para uso!**

**📱 NutriBuddy + WhatsApp = Sucesso!** 🎉


