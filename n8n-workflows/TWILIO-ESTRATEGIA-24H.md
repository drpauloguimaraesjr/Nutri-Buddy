# 🎯 TWILIO - ESTRATÉGIA JANELA 24 HORAS

## 📱 **ENTENDENDO A JANELA DE 24 HORAS**

### **Como Funciona:**

O WhatsApp Business API (Twilio) tem uma regra fundamental:

```
JANELA DE 24 HORAS

├─ Usuário envia mensagem → Janela ABRE ✅
├─ Próximas 24h: Você pode responder LIVREMENTE
├─ Após 24h: Janela FECHA ⏰
└─ Para reabrir: Usuário precisa enviar nova mensagem OU usar Template
```

### **Dentro da Janela (0-24h):**
- ✅ Enviar quantas mensagens quiser
- ✅ Texto, imagem, áudio, documento
- ✅ Automação completa
- ✅ **CUSTO:** GRÁTIS (conversa iniciada pelo usuário)

### **Fora da Janela (>24h):**
- ❌ Não pode enviar mensagem livre
- ✅ Pode usar TEMPLATE aprovado pela Meta
- ✅ **CUSTO:** ~$0.03 USD por conversa iniciada

---

## 🎯 **ESTRATÉGIA RECOMENDADA: OPT-IN ATIVO**

### **Objetivo:**
Fazer com que **PACIENTE sempre inicie** as conversas, mantendo janela aberta.

---

## 📋 **FASE 1: ONBOARDING DO PACIENTE**

### **Quando Cadastrar Novo Paciente:**

**Opção A: Via App/Portal**

1. Após cadastro, mostrar no app:
   ```
   ═══════════════════════════════════════
   🎉 Cadastro Completo!
   
   Para ativar o acompanhamento via WhatsApp:
   
   1. Salve este número: +55 11 99999-9999
   2. Envie uma mensagem: "Oi NutriBuddy"
   3. Aguarde confirmação automática
   
   ✅ Pronto! Vamos começar sua jornada! 🥗
   ═══════════════════════════════════════
   ```

2. Botão no app:
   ```
   [Abrir WhatsApp] → Abre conversa pré-preenchida com "Oi NutriBuddy"
   ```

**Opção B: Via Email**

```
Assunto: Bem-vindo ao NutriBuddy! Ative seu WhatsApp

Olá [Nome],

Cadastro concluído com sucesso! 🎉

Para começarmos o acompanhamento nutricional pelo WhatsApp:

📱 Passo 1: Salve nosso número
   WhatsApp: +55 11 99999-9999
   Nome: NutriBuddy - [Seu Nome]

📱 Passo 2: Envie "Oi"
   Abra o WhatsApp e envie qualquer mensagem para iniciarmos!

Aguardo seu contato! 💪

[Seu Nome]
Nutricionista - NutriBuddy
```

**Opção C: Via SMS (Twilio pode enviar)**

```
Bem-vindo ao NutriBuddy! Para ativar WhatsApp, 
envie "Oi" para +55 11 99999-9999. 
Aguardo você! - [Seu Nome]
```

---

## 📋 **FASE 2: PRIMEIRA MENSAGEM DO PACIENTE**

### **Paciente Envia: "Oi"**

**Resposta Automática Imediata (via N8N/Backend):**

```
Olá [Nome]! 👋

Bem-vindo ao NutriBuddy! Eu sou [Seu Nome], 
sua nutricionista.

🥗 COMO FUNCIONA:

📸 Envie foto das suas refeições
💬 Receba análise personalizada
📊 Acompanhe seu progresso
🎯 Alcance seus objetivos

📅 PRÓXIMOS PASSOS:

1️⃣ Hoje: Envie foto do almoço/jantar
2️⃣ Diário: Compartilhe suas refeições
3️⃣ Semanal: Revisão e ajustes no plano

Pronto para começar? Envie a primeira foto! 📷

Estou aqui para te ajudar! 💪
```

**O que acontece no backend:**

1. ✅ Webhook Twilio recebe mensagem
2. ✅ Identifica paciente pelo telefone
3. ✅ Marca como "opted-in" no Firestore
4. ✅ Envia resposta automática de boas-vindas
5. ✅ **JANELA DE 24H ABERTA!**

---

## 📋 **FASE 3: MANTER ENGAJAMENTO (JANELA SEMPRE ABERTA)**

### **Estratégia: Paciente Envia Algo Todo Dia**

**Gatilhos Naturais para Paciente Enviar:**

1. **Foto da Refeição** (principal!)
   - Paciente envia foto → Janela abre
   - Você responde com análise → Ainda dentro da janela
   
2. **Dúvidas e Perguntas**
   - Paciente: "Posso comer X?"
   - Você: Responde + aproveita janela para enviar dica

3. **Check-ins Motivacionais**
   - Paciente: "Perdi 1kg! 🎉"
   - Você: Parabéns + feedback

### **Automação para Estimular Engajamento:**

**Cenário: Paciente enviou última mensagem há 20h**

```javascript
// N8N Workflow: Lembrete antes de fechar janela

if (horasDesdeUltimaMensagemPaciente >= 20 && horasDesdeUltimaMensagemPaciente < 24) {
  enviarMensagem({
    to: paciente.phone,
    message: `
Oi ${paciente.nome}! 👋

Não se esqueça de enviar a foto do seu jantar 
hoje para eu analisar! 📷

Como está se sentindo? 💪
    `
  });
}
```

**Benefício:** Estimula paciente a enviar foto, mantendo janela aberta.

---

## 📋 **FASE 4: QUANDO JANELA FECHA (>24h)**

### **Cenário: Paciente não enviou nada há 25h**

**Opção A: Aguardar Paciente (Recomendado para maioria)**

- Não fazer nada
- Aguardar paciente enviar quando quiser
- Sem custo
- Respeita ritmo do paciente

**Opção B: Usar Template (Para casos importantes)**

**Templates Úteis:**

**Template 1: Lembrete Gentil**
```
Nome: lembrete_engajamento
Categoria: ACCOUNT_UPDATE

Olá {{1}}! 👋

Sentimos sua falta! Não se esqueça de enviar 
suas refeições para continuarmos o acompanhamento.

Como posso te ajudar hoje? 🥗

{{2}}
Nutricionista - NutriBuddy

Variáveis:
{{1}} = Nome paciente
{{2}} = Seu nome
```

**Template 2: Lembrete Consulta**
```
Nome: lembrete_consulta
Categoria: APPOINTMENT_UPDATE

Olá {{1}}! 📅

Lembrete: Consulta marcada para {{2}} às {{3}}.

📍 Local: {{4}}

Nos vemos em breve!

{{5}}
NutriBuddy

Variáveis:
{{1}} = Nome
{{2}} = Data
{{3}} = Hora
{{4}} = Local/Online
{{5}} = Seu nome
```

**Template 3: Check-in Semanal**
```
Nome: checkin_semanal
Categoria: ACCOUNT_UPDATE

Oi {{1}}! 📊

Como foi sua semana?

📈 Progresso: {{2}}
🎯 Meta próxima semana: {{3}}

Me conte como está! 💪

{{4}}
NutriBuddy
```

### **Quando Usar Templates:**

✅ **Use template:**
- Lembrete consulta marcada
- Follow-up importante (>3 dias sem contato)
- Resultado de exame disponível
- Mudança importante no plano

❌ **Não use template:**
- Mensagens genéricas diárias
- Spam motivacional
- Conteúdo que pode esperar
- Custos desnecessários

---

## 📋 **FASE 5: AUTOMAÇÃO INTELIGENTE**

### **Workflow N8N: Gerenciar Janelas**

```javascript
// ═══════════════════════════════════════════════════
// WORKFLOW: Gerenciar Janela 24h
// ═══════════════════════════════════════════════════

// Trigger: A cada 1 hora
// Verifica todos os pacientes e suas últimas mensagens

const agora = new Date();

for (const paciente of pacientes) {
  const ultimaMensagemPaciente = paciente.ultimaMensagemRecebida;
  const horasDesde = (agora - ultimaMensagemPaciente) / (1000 * 60 * 60);
  
  // ═══════════════════════════════════════════════════
  // CASO 1: Janela ABERTA (0-20h) - Pode responder
  // ═══════════════════════════════════════════════════
  if (horasDesde < 20) {
    // Verificar se há análise pendente
    if (paciente.mensagemPendenteAnalise) {
      await enviarAnalise(paciente);
    }
    
    // Verificar se há dicas pendentes
    if (paciente.dicasPendentes.length > 0) {
      await enviarDica(paciente);
    }
  }
  
  // ═══════════════════════════════════════════════════
  // CASO 2: Janela PERTO DE FECHAR (20-23h) - Estimular
  // ═══════════════════════════════════════════════════
  else if (horasDesde >= 20 && horasDesde < 23) {
    // Enviar lembrete gentil para manter engajamento
    await enviarMensagem({
      to: paciente.phone,
      message: `
Oi ${paciente.nome}! 👋

Como foi seu dia? Já jantou? 
Envia uma foto pra eu ver! 📷

Estou aqui pra te ajudar! 💪
      `
    });
    
    // Marcar que enviou lembrete (não enviar novamente)
    await marcarLembreteEnviado(paciente.id);
  }
  
  // ═══════════════════════════════════════════════════
  // CASO 3: Janela FECHADA (>24h) - Aguardar ou Template
  // ═══════════════════════════════════════════════════
  else if (horasDesde >= 24) {
    
    // Sub-caso A: Há muito tempo sem contato (>72h)
    if (horasDesde > 72 && !paciente.templateEnviado72h) {
      await enviarTemplate({
        to: paciente.phone,
        contentSid: 'HX...', // Template "lembrete_engajamento"
        variables: {
          1: paciente.nome,
          2: 'Dr. João'
        }
      });
      
      await marcarTemplateEnviado(paciente.id, '72h');
    }
    
    // Sub-caso B: Consulta marcada próxima (24h antes)
    else if (paciente.proximaConsulta && horasAteConsulta <= 24) {
      await enviarTemplate({
        to: paciente.phone,
        contentSid: 'HX...', // Template "lembrete_consulta"
        variables: {
          1: paciente.nome,
          2: formatarData(paciente.proximaConsulta),
          3: formatarHora(paciente.proximaConsulta),
          4: paciente.consultaLocal,
          5: 'Dr. João'
        }
      });
    }
    
    // Sub-caso C: Nada urgente - AGUARDAR paciente
    else {
      // Não fazer nada. Aguardar paciente enviar quando quiser.
      console.log(`Aguardando ${paciente.nome} enviar mensagem`);
    }
  }
}
```

---

## 💰 **OTIMIZAÇÃO DE CUSTOS**

### **Estratégia para Minimizar Custos:**

**1. Maximizar Conversas Iniciadas pelo Paciente (GRÁTIS)**
```
✅ Incentive paciente a enviar foto diária
✅ Peça feedback regularmente
✅ Faça perguntas que estimulem resposta
✅ Crie hábito de comunicação bidirecional

💰 CUSTO: $0.00 (conversa iniciada por eles)
```

**2. Agrupar Mensagens Dentro da Janela**
```
✅ Se janela aberta, envie tudo de uma vez:
   - Análise da refeição
   - Dica do dia
   - Lembrete para amanhã
   - Feedback motivacional

💰 CUSTO: $0.00 (dentro da mesma conversa)
```

**3. Usar Templates Apenas Quando Necessário**
```
✅ Lembretes importantes (consulta, exame)
✅ Follow-up crítico (>3 dias sem resposta)
❌ Evitar: Spam diário, mensagens genéricas

💰 CUSTO: ~$0.03 por template (só quando necessário)
```

### **Exemplo Prático de Custos:**

**Cenário A: Paciente Engajado** (Ideal!)
```
Dia 1: Paciente envia foto → Você responde → GRÁTIS
Dia 2: Paciente envia foto → Você responde → GRÁTIS
Dia 3: Paciente envia foto → Você responde → GRÁTIS
...
Mês: 30 conversas → CUSTO: $0.00 ✅
```

**Cenário B: Paciente Esquecido** (Usar template)
```
Dia 1: Paciente envia foto → Você responde → GRÁTIS
Dia 2-4: Paciente sumiu
Dia 5: Você envia template "lembrete" → $0.03
Dia 6: Paciente responde → Você responde → GRÁTIS
...
Mês: 20 conversas GRÁTIS + 5 templates → CUSTO: $0.15 ✅
```

**Cenário C: Spam Desnecessário** (Evitar!)
```
Dia 1: Você envia template "bom dia" → $0.03
Dia 2: Você envia template "dica" → $0.03
Dia 3: Você envia template "motivação" → $0.03
...
Mês: 30 templates → CUSTO: $0.90 ❌ (desnecessário!)
```

---

## 📊 **MÉTRICAS PARA ACOMPANHAR**

### **Dashboard de Janelas:**

```javascript
// Métricas importantes:

const metricas = {
  totalPacientes: 100,
  
  // Janelas abertas (podem responder grátis)
  janelasAbertas: 45,  // 45%
  
  // Janelas fechadas (precisa template)
  janelasFechadas: 55, // 55%
  
  // Engajamento
  pacientesAtivos24h: 45,   // Enviaram mensagem nas últimas 24h
  pacientesAtivos7dias: 78, // Enviaram mensagem nos últimos 7 dias
  pacientesInativos30dias: 5, // Não enviam há 30+ dias
  
  // Custos
  conversasGratis: 450,      // Iniciadas por pacientes
  templatesEnviados: 55,     // Você iniciou com template
  custoTotal: 55 * 0.03,     // $1.65 USD
  custoPorPaciente: 0.0165   // $0.0165 USD por paciente/dia
};

// Meta: >80% conversas iniciadas por pacientes (grátis)
```

---

## ✅ **CHECKLIST ESTRATÉGIA 24H**

### **Setup Inicial:**
- [ ] Templates aprovados pela Meta
- [ ] Workflow de onboarding configurado
- [ ] Mensagem de boas-vindas automática
- [ ] Sistema de opt-in implementado

### **Operacional:**
- [ ] Monitorar janelas abertas/fechadas
- [ ] Responder dentro de 20h quando possível
- [ ] Estimular paciente a enviar diariamente
- [ ] Usar templates apenas quando necessário

### **Otimização:**
- [ ] Meta: >80% conversas iniciadas por pacientes
- [ ] Meta: <20% uso de templates
- [ ] Custo médio: <$0.05 por paciente/dia

---

## 🎯 **RESUMO: SUA ESTRATÉGIA PERFEITA**

```
1. ONBOARDING
   └─ Paciente envia "Oi" primeiro ✅

2. ENGAJAMENTO DIÁRIO
   ├─ Paciente envia foto refeição
   ├─ Você responde com análise
   ├─ Janela fica aberta 24h
   └─ CUSTO: GRÁTIS ✅

3. MANTER JANELA ABERTA
   ├─ Se 20h desde última msg: Enviar lembrete gentil
   ├─ Estimular paciente a enviar de novo
   └─ Janela se renova por +24h

4. QUANDO JANELA FECHA (>24h)
   ├─ Aguardar paciente (maioria dos casos)
   └─ Usar template (só se urgente/importante)

5. RESULTADO
   ├─ 80%+ conversas GRÁTIS
   ├─ Engajamento alto
   ├─ Custo baixo
   └─ Zero risco de bloqueio ✅
```

---

**Pronto! Estratégia completa para maximizar janela de 24h e minimizar custos! 🚀**

*Com Twilio + essa estratégia, você terá comunicação profissional, segura e econômica!* 💪

