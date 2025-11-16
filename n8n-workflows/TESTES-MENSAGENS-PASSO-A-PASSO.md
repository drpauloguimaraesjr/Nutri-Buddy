# ✅ Testes - Sistema de Mensagens (Passo a Passo)

**Execute DEPOIS de configurar a variável no Vercel**

---

## 🧪 TESTE 1: Verificar Deploy do Vercel (1 min)

```
1. Abrir: https://vercel.com/seu-projeto/deployments
2. Ver último deployment
3. Status deve estar: ✅ Ready
4. Se ainda estiver "Building": aguardar mais 1-2 minutos
```

---

## 🧪 TESTE 2: Verificar Backend (30 segundos)

**Abrir no navegador:**
```
https://web-production-c9eaf.up.railway.app/api/health
```

**Deve mostrar:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T...",
  "service": "NutriBuddy API"
}
```

✅ Se mostrou isso: Backend OK!  
❌ Se deu erro: Me avisar!

---

## 🧪 TESTE 3: Central de Atendimento (2 min)

```
1. Abrir: https://nutri-buddy-ir2n.vercel.app
2. Fazer login como prescritor
3. Menu lateral → "Conversas"
```

**ANTES (com erro):**
```
❌ Failed to fetch
[ Tentar novamente ]
```

**DEPOIS (funcionando):**
```
✅ Central de atendimento
   ┌─────────────────────────────┐
   │ Buscar paciente             │
   └─────────────────────────────┘
   
   Nenhuma conversa encontrada.
   (ou lista de conversas)
```

✅ Se apareceu isso: FUNCIONOU!  
❌ Se ainda "Failed to fetch": Variável não configurada corretamente

---

## 🧪 TESTE 4: Criar Conversa com Paciente (3 min)

```
1. Dashboard → Menu "Pacientes"
2. Clicar em qualquer paciente (ex: Paulo Coelho)
3. Clicar na aba: "Ativação"
4. Rolar até ver card azul/roxo:

   ╔═══════════════════════════════════════╗
   ║ 💬  Chat Direto com Paciente         ║
   ║                                       ║
   ║ Inicie uma conversa com Paulo Coelho ║
   ║ diretamente pela central...           ║
   ║                                       ║
   ║ [ 💬 Enviar Mensagem ]               ║
   ╚═══════════════════════════════════════╝

5. Clicar no botão "💬 Enviar Mensagem"
```

**Deve acontecer:**
```
⏳ Botão mostra: "Abrindo conversa..."
↓
✅ Feedback: "Conversa iniciada! Redirecionando..."
↓
🔄 Redireciona para: /dashboard/chat?conversationId=ABC123
↓
💬 Chat abre automaticamente
```

✅ Se redirecionou e chat abriu: PERFEITO!  
❌ Se deu erro: Ver console (F12) e me enviar

---

## 🧪 TESTE 5: Enviar Mensagem (2 min)

**No chat que abriu:**

```
1. Ver interface do chat:
   - Header com nome do paciente
   - Área de mensagens (vazia)
   - Input embaixo

2. Digitar no input: "Olá! Tudo bem com sua dieta?"

3. Pressionar Enter (ou clicar no botão azul)

4. Mensagem deve aparecer:
   ┌────────────────────────────────┐
   │ "Olá! Tudo bem com sua dieta?" │ (bolha azul/roxa, lado direito)
   │                           21:30 │
   └────────────────────────────────┘

5. Ver status: ✓ (enviado)
```

✅ Se mensagem apareceu: ENVIOU!  
❌ Se deu erro: Ver console e me enviar

---

## 🧪 TESTE 6: Paciente Vê Mensagem (3 min)

```
1. Abrir aba anônima (Ctrl+Shift+N)
2. Ir: https://nutri-buddy-ir2n.vercel.app
3. Login como paciente:
   - Email: (do paciente que você enviou mensagem)
   - Senha: (senha do paciente)
4. Menu → "Conversa"
5. Ver mensagem do prescritor aparecer!
```

**Deve mostrar:**
```
┌────────────────────────────────┐
│ Chat com seu Nutricionista     │
├────────────────────────────────┤
│                                │
│ ┌────────────────────────────┐ │
│ │ "Olá! Tudo bem com sua     │ │ (bolha verde, lado esquerdo)
│ │  dieta?"                   │ │
│ │ Paulo Guimarães Jr   21:30 │ │
│ └────────────────────────────┘ │
│                                │
│ [Digite sua mensagem...]       │
└────────────────────────────────┘
```

✅ Se viu a mensagem: SINCRONIZOU!  
❌ Se não apareceu: Aguardar 10s (polling)

---

## 🧪 TESTE 7: Paciente Responde (2 min)

**No app do paciente:**

```
1. Digitar: "Oi! Está tudo bem, estou seguindo certinho!"
2. Pressionar Enter
3. Mensagem aparece (bolha verde, lado direito)
```

**Voltar na aba do prescritor:**

```
1. Aguardar 10 segundos (polling automático)
2. Ver resposta aparecer automaticamente:

   ┌────────────────────────────────┐
   │ "Oi! Está tudo bem, estou      │ (bolha branca, lado esquerdo)
   │  seguindo certinho!"           │
   │ Paulo Coelho            21:31  │
   └────────────────────────────────┘
```

✅ Se resposta apareceu: BIDIRECIONAL FUNCIONANDO!  
🎉 **SISTEMA COMPLETO FUNCIONANDO!**

---

## 🧪 TESTE 8: Testar Imagem (BÔNUS - 2 min)

**No chat do prescritor:**

```
1. Clicar no ícone 📷 (câmera)
2. Selecionar uma imagem
3. Aguardar upload
4. Imagem deve aparecer na conversa
```

✅ Se funcionou: Sistema completo!

---

## 🧪 TESTE 9: Testar Áudio (BÔNUS - 2 min)

**No chat:**

```
1. Clicar e segurar ícone 🎤 (microfone)
2. Falar algo: "Teste de áudio"
3. Soltar botão
4. Aguardar upload
5. Player de áudio deve aparecer
```

✅ Se funcionou: TODOS os recursos funcionando!

---

## 📊 CHECKLIST DE TESTES

Marque conforme testa:

- [ ] ✅ Deploy Vercel concluído
- [ ] ✅ Backend respondendo (/api/health)
- [ ] ✅ Central de atendimento sem erro
- [ ] ✅ Botão "Enviar Mensagem" aparece
- [ ] ✅ Clicar botão → chat abre
- [ ] ✅ Enviar mensagem texto
- [ ] ✅ Mensagem aparece no chat
- [ ] ✅ Paciente vê mensagem
- [ ] ✅ Paciente responde
- [ ] ✅ Prescritor vê resposta
- [ ] ✅ Enviar imagem (bônus)
- [ ] ✅ Gravar áudio (bônus)

---

## 🎊 QUANDO TUDO FUNCIONAR

**Me avise:**
> "Tudo funcionando! Prescritor e paciente conversando!"

**Aí você decide:**

**Opção A:** Continuar estudando n8n (sem pressa)  
**Opção B:** Conectar WhatsApp agora (Z-API)  
**Opção C:** Integrar n8n agora (eu te guio)  

**Sem pressa!** Sistema de mensagens já está funcionando. 👍

---

## 🆘 SE DER PROBLEMA

**Problema 1: "Failed to fetch" continua**
```
Solução:
1. Vercel → Verificar se variável foi salva
2. Name está exatamente: NEXT_PUBLIC_API_BASE_URL
3. Value está correto (com https://)
4. Marcou todos ambientes
5. Fez redeploy
6. Aguardou terminar
```

**Problema 2: Botão não aparece**
```
Solução:
1. Recarregar página (Ctrl+R)
2. Limpar cache (Ctrl+Shift+R)
3. Ver se deploy terminou no Vercel
4. Aguardar mais 1-2 minutos
```

**Problema 3: Chat não abre**
```
Solução:
1. F12 → Console
2. Ver mensagens de erro
3. Screenshot do erro
4. Me enviar
```

**Problema 4: Mensagem não envia**
```
Solução:
1. F12 → Network
2. Ver requisições
3. Se 401/403: Problema de autenticação
4. Se 500: Backend com problema
5. Me enviar detalhes
```

---

## 📞 SUPORTE RÁPIDO

**Qualquer problema:**

1. **F12** (abrir Console do navegador)
2. **Screenshot** do erro
3. **Me enviar**
4. **Resolvo em minutos!**

---

**Boa sorte nos testes!** 🚀

**Quando funcionar, vamos para próxima fase!** 🎉

---

**Tempo estimado total:** 15-20 minutos  
**Depois:** Sistema de mensagens 100% funcional!

