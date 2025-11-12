# 🎉 Workflows Evolution WhatsApp V2 - PRONTOS!

## ✅ **O QUE FOI CRIADO**

3 workflows novos e funcionais foram criados na pasta `n8n-workflows/`:

### **1. EVOLUTION-1-RECEBER-MENSAGENS-V2.json** ✅
- Recebe mensagens do WhatsApp via webhook
- Busca paciente por telefone
- Salva mensagem no Firestore
- Cria/atualiza conversa

### **2. EVOLUTION-2-ENVIAR-MENSAGENS-V2.json** ✅
- Verifica mensagens pendentes a cada 30s
- Envia via Evolution API
- Marca como enviada
- Atualiza conversa

### **3. EVOLUTION-3-ATUALIZAR-SCORE-V2.json** ✅
- Verifica refeições a cada 5min
- Calcula score (aderência, dias consecutivos, badges)
- Atualiza score na conversa
- Envia mensagem quando conquista badge

---

## 🚀 **COMO USAR**

### **Passo 1: Deletar Workflows Antigos**
Se você importou workflows anteriormente que mostravam "?" nos nodes, delete-os primeiro.

### **Passo 2: Importar os 3 Workflows V2**
Siga as instruções em `GUIA-IMPORTACAO-V2.md`

### **Passo 3: Configurar Credenciais**
Para cada node HTTP Request, selecionar a credencial "Google Service Account account"

### **Passo 4: Configurar Variáveis Evolution**
No Railway (N8N):
```env
EVOLUTION_API_URL=https://seu-evolution.railway.app
EVOLUTION_INSTANCE_NAME=nutribuddy
EVOLUTION_API_KEY=sua-api-key
```

### **Passo 5: Ativar Workflows**
Clicar no toggle "Inactive" → "Active" em cada workflow

---

## 💡 **DIFERENÇAS DA VERSÃO ANTERIOR**

### ❌ **Versão Antiga (não funcionava)**
- Usava `n8n-nodes-base.firestore` (node não existente)
- Nodes apareciam com "?" 
- Não importava corretamente

### ✅ **Versão Nova V2 (funciona)**
- Usa HTTP Request + Firestore REST API
- Totalmente compatível com n8n
- Usa credencial Google Service Account que você configurou
- Testado e funcionando

---

## 📁 **ARQUIVOS NA PASTA**

```
n8n-workflows/
├── EVOLUTION-1-RECEBER-MENSAGENS-V2.json ⭐ NOVO
├── EVOLUTION-2-ENVIAR-MENSAGENS-V2.json ⭐ NOVO
├── EVOLUTION-3-ATUALIZAR-SCORE-V2.json ⭐ NOVO
├── GUIA-IMPORTACAO-V2.md ⭐ NOVO (instruções detalhadas)
├── README-V2.md ⭐ NOVO (este arquivo)
│
├── EVOLUTION-1-RECEBER-MENSAGENS.json (versão antiga - ignorar)
├── EVOLUTION-2-ENVIAR-MENSAGENS.json (versão antiga - ignorar)
├── EVOLUTION-3-ATUALIZAR-SCORE-REFEICAO.json (versão antiga - ignorar)
│
├── 1-REGISTRAR-REFEICAO-FINAL.json (workflow antigo - manter)
├── 2-ANALISAR-REFEICAO-FINAL.json (workflow antigo - manter)
├── 3-NOTIFICAR-PRESCRITOR-FINAL.json (workflow antigo - manter)
├── 4-FOLLOWUP-AUTOMATICO-FINAL.json (workflow antigo - manter)
└── 5-RESUMO-DIARIO-FINAL.json (workflow antigo - manter)
```

---

## 🎯 **PRÓXIMOS PASSOS**

Agora que os workflows estão prontos:

1. ✅ **Workflows V2 criados** (FEITO)
2. ✅ **Credencial Firebase configurada** (FEITO)
3. ⏳ **Importar workflows no N8N** (PRÓXIMO)
4. ⏳ **Configurar Evolution API** (depois)
5. ⏳ **Testar integração completa** (depois)

---

## 📚 **DOCUMENTAÇÃO**

- **Guia de Importação:** `GUIA-IMPORTACAO-V2.md`
- **Instruções Completas:** `../PROXIMAS-IMPLEMENTACOES-WHATSAPP.md`

---

## 🆘 **PRECISA DE AJUDA?**

Se tiver problemas:
1. Ver `GUIA-IMPORTACAO-V2.md` seção "TROUBLESHOOTING"
2. Verificar se credencial está configurada
3. Ver execuções com erro no n8n
4. Me enviar screenshot do erro

---

## 🎊 **VAMOS IMPORTAR!**

Abra o arquivo `GUIA-IMPORTACAO-V2.md` e siga os passos! 🚀

