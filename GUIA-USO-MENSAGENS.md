# 📖 Guia de Uso - Sistema de Mensagens NutriBuddy

## 👨‍⚕️ Para Prescritores

### Acessar Painel de Mensagens

```
http://localhost:3001/messages
```

ou no menu lateral: **Mensagens**

---

### 📊 Dashboard de Mensagens

Ao abrir, você vê:

**Cards de Estatísticas:**
- 💬 Total de Conversas
- 🆕 Novas Hoje
- 📈 Taxa de Resposta
- 👥 Pacientes Ativos

**Quadro Kanban com 4 colunas:**
- 🆕 **Novas** - Conversas que acabaram de chegar
- 💬 **Em Atendimento** - Conversas que você está respondendo
- ⏳ **Aguardando Resposta** - Esperando retorno do paciente
- ✅ **Resolvidas** - Conversas finalizadas

---

### 💬 Como Responder uma Mensagem

1. **Clique no card** do paciente no Kanban
2. O chat será aberto à direita
3. **Digite sua resposta** no campo inferior
4. **Clique em enviar** (ícone de avião) ou pressione **Enter**

**Dicas:**
- Use **Shift + Enter** para quebra de linha
- O card **move automaticamente** para "Em Atendimento" ao clicar
- Veja o **histórico completo** da conversa

---

### 🏷️ Organizar Conversas

#### Mover entre Colunas

**Arrastar e Soltar (futuro):**
- Arraste o card para outra coluna

**Ou clique no card → Menu (⋮):**
- Marcar como "Em Atendimento"
- Marcar como "Aguardando Resposta"
- Marcar como "Resolvido"

#### Prioridades

Cards são coloridos por prioridade:
- 🔴 **Vermelho** = Alta prioridade (urgente)
- 🔵 **Azul** = Prioridade normal
- ⚪ **Cinza** = Baixa prioridade

---

### 🤖 Recursos Automáticos

#### Auto-resposta Inicial

Se você **não responder em 2 minutos**, o sistema envia:

> "Olá! 👋 Recebi sua mensagem e vou responder em breve."

**Como desativar:**
- Acesse N8N → Workflow "Auto-resposta Inicial"
- Desative o workflow

#### Análise de Urgência

Mensagens com palavras como:
- "URGENTE"
- "Emergência"
- "Não consigo"
- "Problema"

São **automaticamente marcadas** como alta prioridade (vermelho) e você recebe **email de alerta**.

#### Sugestões de Resposta (Em Breve)

Ao abrir uma conversa, a IA sugere 3 respostas prontas baseadas no contexto.

---

### 📧 Notificações

Você receberá email:

**Diariamente às 9h:**
- Resumo de conversas
- Novas conversas
- Conversas urgentes
- Estatísticas gerais

**Imediatamente:**
- Quando uma conversa é marcada como urgente
- (Configurável no N8N)

---

### 📝 Templates de Resposta (Futuro)

Salve respostas frequentes para reutilizar:

1. Menu → **Templates**
2. **Criar novo template**
3. Dê um nome e escreva o texto
4. Ao responder, clique em **Templates** e selecione

**Exemplos:**
- Boas-vindas
- Orientações sobre hidratação
- Lembretes de consulta
- Parabenizações por meta atingida

---

### 🔍 Buscar Conversas

No topo do Kanban:

1. Digite nome do paciente na busca
2. Filtre por coluna/status
3. Ordene por data, prioridade, etc.

---

### 📊 Relatórios

**Ver histórico completo** de um paciente:

1. Clique no card do paciente
2. Role o chat para cima para ver mensagens antigas
3. Exportar conversa (futuro): Menu → Exportar PDF

---

## 👤 Para Pacientes

### Acessar Chat

```
http://localhost:3001/chat
```

ou no menu: **Mensagens** / **Chat**

---

### 💬 Enviar Mensagem

1. Digite sua mensagem no campo inferior
2. Clique em **Enviar** ou pressione **Enter**
3. Aguarde resposta do nutricionista

**Dicas:**
- Seja claro e objetivo
- Use **Shift + Enter** para quebra de linha
- Pode enviar quantas mensagens precisar

---

### ⏱️ Tempo de Resposta

- **2 minutos:** Auto-resposta automática
- **Até 24h:** Resposta do nutricionista
- **Urgente?** Marque na mensagem com "URGENTE"

---

### 📱 Notificações

Você verá:
- ✅ Mensagem enviada (1 check)
- ✅✅ Mensagem entregue (2 checks)
- 💙 Mensagem lida (checks azuis)

---

### 🔔 Quando Receber Resposta

- Notificação no app (se habilitado)
- Badge com número de mensagens não lidas
- Mensagens novas destacadas

---

### ❓ Dúvidas Comuns

**"Meu nutricionista não está respondendo?"**
- Aguarde até 24h úteis
- Se urgente, ligue para o consultório
- Auto-resposta significa que ele recebeu

**"Como anexar fotos?"**
- Em breve! Por enquanto, descreva ou envie por email

**"Posso apagar mensagens?"**
- Não. Histórico é mantido para acompanhamento

---

## 🔐 Privacidade e Segurança

### ✅ O que é privado

- Apenas você e seu nutricionista veem as mensagens
- Nenhum outro paciente tem acesso
- Mensagens não são compartilhadas

### ✅ Armazenamento

- Mensagens salvas no Firebase (criptografado)
- Backup automático
- LGPD compliant

### ⚠️ Não compartilhe

- Senhas
- Dados bancários
- Documentos pessoais

Para isso, use canais oficiais do consultório.

---

## 🎯 Boas Práticas

### Para Prescritores

**DO ✅**
- Responda dentro de 24h
- Seja empático e profissional
- Use linguagem clara
- Personalize respostas
- Marque conversas como resolvidas

**DON'T ❌**
- Deixar paciente sem resposta
- Copiar/colar respostas genéricas sempre
- Ignorar mensagens urgentes
- Usar linguagem muito técnica

---

### Para Pacientes

**DO ✅**
- Seja claro sobre suas dúvidas
- Aguarde resposta antes de enviar várias mensagens
- Descreva sintomas ou dificuldades
- Pergunte quando tiver dúvida

**DON'T ❌**
- Enviar 10 mensagens seguidas
- Usar linguagem ofensiva
- Compartilhar dados sensíveis
- Esperar resposta imediata (2min)

---

## 📞 Suporte

**Problemas técnicos?**
- Verifique se está logado
- Atualize a página (F5)
- Limpe cache do navegador
- Entre em contato: suporte@nutribuddy.com

**Emergências médicas?**
- NÃO use o chat para emergências
- Ligue para seu médico ou 192

---

## 🚀 Atalhos de Teclado

**No Chat:**
- `Enter` - Enviar mensagem
- `Shift + Enter` - Nova linha
- `Esc` - Fechar chat (prescritor)
- `↑` / `↓` - Navegar histórico

**No Kanban (Prescritor):**
- `1` - Ir para "Novas"
- `2` - Ir para "Em Atendimento"
- `3` - Ir para "Aguardando"
- `4` - Ir para "Resolvidas"
- `/` - Buscar

---

## 💡 Dicas Profissionais

### Para ter Melhores Conversas

**Inicie com nome:**
> "Olá João! Como você está?"

**Seja específico:**
> "Vejo que você está com dificuldade no café da manhã. Vamos ajustar..."

**Finalize com ação:**
> "Tente essa mudança por 3 dias e me conte como foi, ok?"

**Use emojis (com moderação):**
> "Parabéns! 🎉 Você atingiu sua meta!"

---

### Gestão de Tempo

**Prescritor:**
- Reserve 30min pela manhã para responder
- Configure alertas para urgentes
- Use templates para perguntas comuns
- Resolva conversas antigas semanalmente

**Paciente:**
- Envie dúvidas assim que surgirem
- Não acumule várias dúvidas para depois
- Acompanhe progresso pelo chat

---

## 📈 Métricas de Sucesso

### Prescritor

Acompanhe no dashboard:
- **Taxa de resposta:** Ideal > 90%
- **Tempo médio de resposta:** < 12h
- **Conversas resolvidas:** Quanto mais, melhor
- **Satisfação:** Feedback dos pacientes

### Paciente

Você terá melhor experiência com:
- Respostas rápidas do nutricionista
- Clareza nas orientações
- Progresso acompanhado
- Suporte constante

---

## 🎓 Vídeo-Tutoriais (Em Breve)

- [ ] Como usar o Kanban
- [ ] Respondendo mensagens eficientemente
- [ ] Configurando templates
- [ ] Interpretando analytics
- [ ] Melhores práticas de comunicação

---

## ✅ Checklist Rápido

### Primeira Vez Usando (Prescritor)

- [ ] Acesso http://localhost:3001/messages
- [ ] Vejo o Kanban com 4 colunas
- [ ] Clico em um card
- [ ] Consigo ver o chat
- [ ] Envio uma mensagem de teste
- [ ] Movo card para "Resolvido"

### Primeira Vez Usando (Paciente)

- [ ] Acesso http://localhost:3001/chat
- [ ] Vejo interface de chat
- [ ] Envio mensagem: "Olá, gostaria de tirar uma dúvida"
- [ ] Mensagem aparece no chat
- [ ] Aguardo resposta do nutricionista

---

**🎉 Pronto! Agora você sabe usar o sistema de mensagens!**

Qualquer dúvida, consulte este guia ou entre em contato com suporte.

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0

