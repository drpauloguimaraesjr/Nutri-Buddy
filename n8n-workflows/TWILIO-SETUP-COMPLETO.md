# 📱 TWILIO WHATSAPP - SETUP COMPLETO

## 🎯 **OBJETIVO**

Configurar conta Twilio, conectar WhatsApp Business API e obter credenciais para integração.

---

## ⏱️ **TEMPO ESTIMADO**

- ✅ **Criar conta Twilio:** 5 min
- ✅ **Verificar telefone:** 2 min
- ✅ **Configurar Sandbox:** 5 min
- ✅ **Testar Sandbox:** 3 min
- ✅ **Request WhatsApp API:** 15 min
- ⏳ **Aguardar aprovação Meta:** 2-5 dias úteis
- ✅ **Conectar número:** 5 min

**Total ativo: ~35 min** (+ 2-5 dias aprovação)

---

## 📋 **FASE 1: CRIAR CONTA TWILIO (5 min)**

### **Passo 1: Acessar Twilio**

1. Abrir: https://www.twilio.com/try-twilio

2. Clicar: **Sign up** (ou **Start for free**)

### **Passo 2: Preencher Cadastro**

Informações necessárias:

```
First name: [Seu nome]
Last name: [Seu sobrenome]
Email: [seu-email@exemplo.com]
Password: [senha forte - mínimo 12 caracteres]
```

3. **Marcar:** ☑️ I agree to Twilio's Terms of Service

4. **Clicar:** Sign Up

5. **Verificar email:** Twilio vai enviar email de confirmação

6. **Clicar no link** do email para verificar

### **Passo 3: Verificar Telefone**

1. Twilio vai pedir **número de telefone**

```
Phone number: +55 11 99999-9999
```

2. Escolher método de verificação:
   - **SMS** (mais rápido) ou
   - **Call** (ligação automática)

3. **Digitar código** recebido (6 dígitos)

4. **Clicar:** Submit

### **Passo 4: Questionário Inicial**

Twilio vai fazer algumas perguntas:

```
1. What do you plan to build?
   → Escolher: "Alerts, notifications & marketing"

2. Which Twilio product are you here to use?
   → Escolher: "WhatsApp"

3. How do you want to build with Twilio?
   → Escolher: "With code"

4. What's your preferred language?
   → Escolher: "Node.js" (ou sua preferência)

5. Would you like Twilio to host your code?
   → Escolher: "No, I'll use my own hosting"
```

5. **Clicar:** Get Started

### **Passo 5: Dashboard Twilio - Copiar Credenciais**

Você vai ver o **Dashboard Twilio**:

```
Account Info:
├── Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

└── Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE: Guardar essas credenciais!**

```bash
# Anotar em lugar seguro:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📋 **FASE 2: CONFIGURAR WHATSAPP SANDBOX (10 min)**

### **O que é Sandbox?**

- Ambiente de **teste gratuito**
- Permite testar WhatsApp **sem aprovação Meta**
- Funciona com até **5 números**
- **Código idêntico** ao ambiente produção
- **Ilimitado** para desenvolvimento

### **Passo 1: Acessar WhatsApp Sandbox**

1. No **Dashboard Twilio**

2. Menu lateral: **Messaging** → **Try it out** → **Send a WhatsApp message**

   OU

   Acesso direto: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### **Passo 2: Ver Informações do Sandbox**

Você vai ver:

```
Join your sandbox

To use the Sandbox, send this code from your WhatsApp:
join [palavra-única]

To:
+1 415 523 8886 (número Twilio Sandbox)

Example:
"join elephant-quick"
```

**Cada conta tem código único!** (ex: join elephant-quick, join ocean-blue, etc)

### **Passo 3: Conectar Seu WhatsApp**

1. **Abrir WhatsApp** no seu celular

2. **Criar novo contato:**
   ```
   Nome: Twilio Sandbox
   Número: +1 415 523 8886
   ```

3. **Enviar mensagem:**
   ```
   join [seu-código-único]
   ```

   Exemplo:
   ```
   join elephant-quick
   ```

4. **Aguardar resposta automática:**
   ```
   ✅ "Twilio Sandbox: You are all set! ..."
   ```

5. **Confirmar no Dashboard:**
   - Vai aparecer: ✅ **"Sandbox participants: +55119XXXXXXXX"**

### **Passo 4: Testar Envio (Dashboard)**

1. No mesmo Dashboard, role para baixo até **"Try sending a message"**

2. Preencher:
   ```
   To: +55 11 99999-9999 (seu WhatsApp que conectou)
   Body: Olá! Teste Twilio Sandbox NutriBuddy 🎉
   ```

3. **Clicar:** Make Request

4. **Verificar WhatsApp:** Você deve receber a mensagem!

### **Passo 5: Copiar Número Sandbox**

```bash
# Anotar:
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**⚠️ IMPORTANTE:**
- Sempre com prefixo `whatsapp:`
- Sempre o número Twilio (não o seu)

### **Passo 6: Testar com cURL (opcional)**

```bash
# Substituir:
# - [SID] pelo seu Account SID
# - [TOKEN] pelo seu Auth Token
# - [SEU_NUMERO] pelo seu WhatsApp com código país

curl -X POST "https://api.twilio.com/2010-04-01/Accounts/[SID]/Messages.json" \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:[SEU_NUMERO]" \
  --data-urlencode "Body=Teste via cURL!" \
  -u [SID]:[TOKEN]
```

Se funcionar, você vai receber a mensagem! ✅

---

## 📋 **FASE 3: REQUEST WHATSAPP BUSINESS API (20 min)**

### **Por que Request API?**

**Sandbox é ótimo para desenvolvimento, mas para PRODUÇÃO você precisa:**

- ✅ Seu próprio número WhatsApp
- ✅ Enviar para qualquer cliente
- ✅ Templates personalizados
- ✅ Display Name oficial
- ✅ Maior confiabilidade

### **Passo 1: Acessar WhatsApp Business API**

1. **Twilio Console:** https://console.twilio.com

2. **Menu:** Messaging → WhatsApp → **Overview**

3. **Clicar:** Get started with WhatsApp

   OU

   Acesso direto: https://console.twilio.com/us1/develop/sms/whatsapp/senders

### **Passo 2: Create a Sender**

1. **Clicar:** Create new WhatsApp Sender

2. Você vai ver 2 opções:

   **Opção A: Use Facebook Business Manager**
   - ✅ **RECOMENDADO** (mais rápido)
   - Conecta conta existente
   - Aprovação geralmente mais rápida

   **Opção B: Use Twilio Onboarding**
   - Twilio cria tudo para você
   - Mais simples se não tem FB Business

3. **Escolher Opção A** (se tiver Facebook Business)

### **Passo 3: Conectar Facebook Business Manager**

#### **3.1 - Se você JÁ TEM Facebook Business Manager:**

1. **Clicar:** Connect Facebook Business Manager

2. **Login Facebook:** Fazer login com sua conta Facebook/Meta

3. **Selecionar Business:** Escolher seu Facebook Business Manager

4. **Permitir acesso:** Autorizar Twilio

5. **Continuar** para próximos passos

#### **3.2 - Se você NÃO TEM Facebook Business Manager:**

1. **Criar primeiro:** https://business.facebook.com

2. **Clicar:** Create Account

3. **Preencher:**
   ```
   Business Name: NutriBuddy
   Your Name: [Seu nome]
   Business Email: [seu-email@nutribuddy.com]
   ```

4. **Verificar email**

5. **Voltar para Twilio** e conectar

### **Passo 4: Preencher Formulário Meta**

Twilio vai pedir informações para enviar à Meta:

#### **Business Information:**

```
Business Name: NutriBuddy
(ou nome da sua empresa de nutrição)

Display Name: NutriBuddy
(nome que aparece no WhatsApp para clientes)

Category: Healthcare
(ou Business Services)

Website: https://www.nutribuddy.com
(ou LinkedIn, Instagram, qualquer presença online)

Business Description:
"Plataforma digital de nutrição que conecta nutricionistas 
e pacientes através de acompanhamento personalizado, análise 
alimentar e comunicação via WhatsApp."

Country: Brazil

Business Address:
Street: [Endereço da empresa]
City: [Cidade]
State: [Estado]
Postal Code: [CEP]
```

#### **About Your Business:**

```
How will you use WhatsApp?
→ "Send appointment reminders, health tips, and respond 
    to patient messages."

What type of messages will you send?
→ "Healthcare notifications, dietary guidance, appointment 
    reminders, and educational content."

Expected message volume:
→ Escolher baseado em seus planos:
   - Less than 100/day (até 30 pacientes)
   - 100-1,000/day (30-300 pacientes)
   - 1,000-10,000/day (300-3000 pacientes)
```

#### **Contact Information:**

```
Contact Name: [Seu nome completo]
Contact Email: [email profissional]
Contact Phone: +55 11 99999-9999
```

### **Passo 5: Submit Request**

1. **Revisar** todas as informações

2. **Marcar:** ☑️ I agree to WhatsApp Business Terms

3. **Clicar:** Submit for Review

4. Você vai ver:
   ```
   ✅ "Your request has been submitted!"
   
   Timeline:
   - Meta will review your request: 2-5 business days
   - You'll receive email updates
   - Check status in Twilio Console
   ```

### **Passo 6: O Que Acontece Agora?**

#### **Timeline de Aprovação:**

```
Dia 0 (hoje):
├── ✅ Request enviado
├── 📧 Email: "Your WhatsApp Business request was received"
└── ⏳ Status: "Under Review"

Dia 1-2:
├── 🔍 Meta analisa documentação
├── 🔍 Verifica website e negócio
└── ⏳ Status: "Under Review"

Dia 2-5:
├── ✅ Aprovado! 🎉
├── 📧 Email: "Your WhatsApp Business account has been approved"
└── 🎯 Status: "Approved"

OU

├── ⚠️ Mais informações necessárias
├── 📧 Email: "We need more information"
└── 📝 Responder e aguardar nova análise
```

#### **Acompanhar Status:**

1. **Twilio Console:** Messaging → WhatsApp → Senders

2. Ver status:
   - 🟡 **Pending:** Aguardando análise
   - 🔵 **Under Review:** Meta analisando
   - 🟢 **Approved:** Aprovado! Pode conectar número
   - 🔴 **Rejected:** Rejeitado (raro)

3. **Emails:** Meta/Twilio enviam atualizações

---

## 📋 **FASE 4: CONECTAR NÚMERO WHATSAPP (Após Aprovação)**

### **⏳ Aguardar Aprovação Meta (2-5 dias)**

**Enquanto aguarda, você pode:**
- ✅ Continuar usando **Sandbox** para desenvolvimento
- ✅ Preparar código backend (próximo arquivo)
- ✅ Configurar N8N workflows
- ✅ Fazer testes com Sandbox
- ✅ Preparar templates de mensagens

**⚠️ NÃO PODE:**
- ❌ Enviar para clientes reais (use Sandbox apenas para testes)
- ❌ Conectar número oficial ainda

---

### **📱 Quando Meta Aprovar:**

#### **Passo 1: Verificar Aprovação**

1. **Verificar email:** "Your WhatsApp Business account has been approved" ✅

2. **Twilio Console:** Messaging → WhatsApp → Senders

3. **Status:** 🟢 Approved

#### **Passo 2: Conectar Seu Número WhatsApp**

**⚠️ REQUISITOS IMPORTANTES:**

- ✅ Número **exclusivo** para WhatsApp Business
- ✅ Número **verificado** (pode receber SMS/ligação)
- ✅ **NÃO pode** estar usando WhatsApp Business App
- ✅ **NÃO pode** estar usando WhatsApp pessoal
- ✅ Recomendado: Chip **novo** exclusivo

**Se você vai usar número existente:**
- ⚠️ Vai **desconectar** do WhatsApp pessoal/business app
- ⚠️ **Histórico será perdido** (faça backup antes!)

#### **Passo 3: Add Phone Number**

1. **Twilio Console:** Messaging → WhatsApp → Senders

2. **Clicar** no seu Sender aprovado

3. **Clicar:** Add Phone Number

4. **Preencher:**
   ```
   Country: Brazil (+55)
   Phone Number: 11 99999-9999
   
   ⚠️ Sem +, sem 0, sem espaços
   Exemplo correto: 5511999999999
   ```

5. **Clicar:** Next

#### **Passo 4: Verificar Número**

Escolher método:

**Opção A: SMS (mais rápido)**
```
1. Clicar: Send code via SMS
2. Aguardar SMS no número
3. Digitar código (6 dígitos)
4. Clicar: Verify
```

**Opção B: Voice Call**
```
1. Clicar: Send code via voice call
2. Atender ligação automática
3. Ouvir e anotar código
4. Digitar código
5. Clicar: Verify
```

#### **Passo 5: Configurar Display Name**

```
Display Name: NutriBuddy
(nome que aparece para clientes - deve ser o mesmo do request)

Category: Healthcare

Description: Acompanhamento nutricional personalizado
```

**Clicar:** Save

#### **Passo 6: Aguardar Ativação**

```
⏳ "Activating WhatsApp Business..."

Tempo: ~10-30 minutos

Você receberá email quando estiver pronto.
```

#### **Passo 7: Copiar Número Conectado**

Quando ativado:

```bash
# Anotar (substituir pelo seu número):
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999

# Formato:
# whatsapp:[código_país][ddd][número]
# Sempre com "whatsapp:" na frente!
```

#### **Passo 8: Testar Número Oficial**

**Teste via Dashboard:**

1. Twilio Console → Messaging → Try it out → Send a WhatsApp message

2. Mudar:
   ```
   From: whatsapp:+5511999999999 (seu número oficial)
   To: whatsapp:+5511988888888 (seu número teste)
   Body: Teste número oficial NutriBuddy! 🎉
   ```

3. **Clicar:** Send

4. **Verificar WhatsApp:** Deve receber mensagem do seu número oficial!

**Teste via cURL:**

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/[SID]/Messages.json" \
  --data-urlencode "From=whatsapp:+5511999999999" \
  --data-urlencode "To=whatsapp:+5511988888888" \
  --data-urlencode "Body=Teste via cURL número oficial!" \
  -u [SID]:[TOKEN]
```

Se receber, está **FUNCIONANDO!** ✅

---

## 📋 **FASE 5: CRIAR MESSAGE TEMPLATES (OPCIONAL)**

### **O que são Templates?**

- Mensagens **pré-aprovadas pela Meta**
- Necessárias para iniciar conversas com clientes
- Podem ter **variáveis** dinâmicas
- Aprovação: 2-3 dias úteis

### **Quando Usar Templates?**

**PRECISA de template:**
- ❌ Você inicia conversa com cliente
- ❌ Cliente não te mandou mensagem nas últimas 24h
- ❌ Notificações proativas

**NÃO precisa de template:**
- ✅ Cliente te mandou mensagem
- ✅ Dentro da janela de 24h após mensagem do cliente
- ✅ Respondendo mensagem recente

### **Passo 1: Acessar Templates**

1. **Twilio Console:** Messaging → WhatsApp → Content Templates

2. **Clicar:** Create new template

### **Passo 2: Criar Template**

#### **Exemplo: Lembrete de Consulta**

```
Template Name: lembrete_consulta
(sem espaços, lowercase, pode usar _)

Category: APPOINTMENT_UPDATE

Language: Portuguese (Brazil)

Template Body:
---
Olá {{1}}! 👋

Lembrete: Você tem consulta marcada para {{2}} às {{3}}.

📍 Local: {{4}}

Nos vemos em breve!

NutriBuddy 🥗
---

Variables:
1. Nome do paciente
2. Data (ex: 15/11/2024)
3. Hora (ex: 14:00)
4. Local ou "Telemedicina"
```

#### **Exemplo: Resultado de Análise**

```
Template Name: resultado_analise
Category: ACCOUNT_UPDATE
Language: Portuguese (Brazil)

Template Body:
---
Olá {{1}}! 📊

Sua análise alimentar de hoje está pronta!

Score: {{2}}/10

{{3}}

Acesse o app para ver detalhes.

NutriBuddy 🥗
---

Variables:
1. Nome
2. Score (0-10)
3. Mensagem curta
```

### **Passo 3: Submit Template**

1. **Revisar** template

2. **Clicar:** Submit for Approval

3. **Aguardar:** 2-3 dias úteis

4. **Verificar status:** Twilio Console → Templates

---

## 📋 **RESUMO DAS CREDENCIAIS**

### **Anotar em Lugar Seguro:**

```bash
# ============================================
# TWILIO CREDENTIALS - NUTRIBUDDY
# ============================================

# Account Credentials
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=1234567890abcdef...

# WhatsApp Numbers
TWILIO_WHATSAPP_SANDBOX=whatsapp:+14155238886
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999

# Sandbox Join Code
TWILIO_SANDBOX_CODE=join elephant-quick

# Status
TWILIO_STATUS=sandbox  # ou "production" após aprovação
```

### **Quando Usar Cada Número:**

**Durante Desenvolvimento (antes aprovação):**
```bash
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
# (número sandbox)
```

**Em Produção (após aprovação):**
```bash
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999
# (seu número oficial)
```

---

## ✅ **CHECKLIST COMPLETO**

### **Conta Twilio:**
- [ ] Conta Twilio criada
- [ ] Email verificado
- [ ] Telefone verificado
- [ ] Trial credits ativados ($15)
- [ ] Account SID copiado
- [ ] Auth Token copiado

### **WhatsApp Sandbox:**
- [ ] Sandbox configurado
- [ ] Join code enviado pelo WhatsApp
- [ ] Confirmação recebida
- [ ] Teste de envio OK
- [ ] Número sandbox anotado

### **WhatsApp Business API:**
- [ ] Request enviado à Meta
- [ ] Formulário completo preenchido
- [ ] Email de confirmação recebido
- [ ] Acompanhando status no Console

### **Após Aprovação Meta:**
- [ ] Email de aprovação recebido
- [ ] Número WhatsApp exclusivo pronto
- [ ] Número conectado no Twilio
- [ ] Verificação concluída
- [ ] Display name configurado
- [ ] Ativação concluída
- [ ] Teste com número oficial OK
- [ ] Número oficial anotado

### **Templates (Opcional):**
- [ ] Template(s) criado(s)
- [ ] Submit para aprovação
- [ ] Template(s) aprovado(s)
- [ ] Testado template

---

## ❓ **FAQ - TROUBLESHOOTING**

### **Não recebi código de verificação (telefone)**
- Verificar número correto (com código país)
- Tentar Voice Call ao invés de SMS
- Aguardar 2-3 minutos e tentar novamente

### **Erro ao conectar Sandbox**
- Verificar que enviou exatamente: `join seu-código`
- Verificar número Twilio correto: +1 415 523 8886
- Limpar conversa e tentar novamente

### **Meta rejeitou request**
- Revisar informações (especialmente website)
- Adicionar mais detalhes na descrição
- Verificar categoria correta
- Reenviar request

### **Aprovação Meta está demorando (>7 dias)**
- Verificar email (inclusive spam)
- Abrir ticket no suporte Twilio
- Verificar se Meta pediu mais informações

### **Número não pode ser conectado**
- Verificar se número está em uso em WhatsApp pessoal/business
- Desconectar de outros apps WhatsApp
- Usar número novo exclusivo

### **Templates não são aprovados**
- Evitar linguagem promocional agressiva
- Usar categoria correta
- Seguir guidelines WhatsApp
- Ver exemplos aprovados: https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates

---

## 🔗 **LINKS ÚTEIS**

### **Twilio:**
- Console: https://console.twilio.com
- WhatsApp Docs: https://www.twilio.com/docs/whatsapp
- API Reference: https://www.twilio.com/docs/sms/api
- Status Page: https://status.twilio.com
- Support: https://support.twilio.com

### **Meta/WhatsApp:**
- Business Platform: https://business.facebook.com
- WhatsApp Business Docs: https://developers.facebook.com/docs/whatsapp
- Commerce Policy: https://www.whatsapp.com/legal/commerce-policy
- Business Policy: https://www.whatsapp.com/legal/business-policy

### **Guidelines:**
- Message Templates: https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates
- Best Practices: https://www.twilio.com/docs/whatsapp/tutorial/best-practices

---

## ✅ **PRONTO!**

Agora você tem:

- ✅ Conta Twilio configurada
- ✅ WhatsApp Sandbox funcionando (para desenvolvimento)
- ✅ Request API enviado (aguardando aprovação)
- ✅ Todas as credenciais anotadas

### **Enquanto aguarda aprovação Meta:**

Pode continuar para:

📄 **TWILIO-BACKEND-CODE.js** - Preparar código backend

📄 **TWILIO-DEPLOY-RAILWAY.md** - Configurar Railway

📄 **TWILIO-1-ENVIAR-MENSAGENS.json** - Importar workflow N8N

**Tudo vai funcionar com Sandbox!** Quando Meta aprovar, é só trocar o número! 🚀

---

**Parabéns por configurar Twilio! 🎉**

*Twilio é a melhor plataforma enterprise para WhatsApp! 💪*

