# 📄 **GUIA: TRANSCRIÇÃO AUTOMÁTICA DE PDFs**

## 🎯 **2 WORKFLOWS CRIADOS:**

### **1. Workflow 6: Transcrever Dieta (Med-X, etc)**
### **2. Workflow 7: Transcrever InBody 770**

---

## 📋 **PASSO 1: IMPORTAR WORKFLOWS NO N8N**

### **1.1. Acessar seu n8n:**
```
https://seu-n8n.railway.app
(ou n8n cloud)
```

### **1.2. Importar Workflow 6 (Dieta):**
```
1. Clicar em "Add workflow" (+)
2. Menu (⋮) → Import from File
3. Selecionar: 6-TRANSCREVER-DIETA-PDF.json
4. Clicar em "Save"
5. Copiar URL do Webhook
```

**URL será algo como:**
```
https://seu-n8n.railway.app/webhook/nutribuddy-transcribe-diet
```

### **1.3. Importar Workflow 7 (InBody):**
```
1. Repetir processo acima
2. Selecionar: 7-TRANSCREVER-INBODY-PDF.json
3. Copiar URL do Webhook
```

**URL será algo como:**
```
https://seu-n8n.railway.app/webhook/nutribuddy-transcribe-inbody
```

---

## 📋 **PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL**

```
1. Acessar: https://vercel.com/seu-projeto/settings/environment-variables

2. Adicionar:
   - NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL
     Value: https://seu-n8n.../webhook/nutribuddy-transcribe-diet
   
   - NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL
     Value: https://seu-n8n.../webhook/nutribuddy-transcribe-inbody

3. Clicar "Save"
4. Fazer novo deploy (ou aguardar próximo commit)
```

---

## 🔧 **COMO FUNCIONA:**

### **FLUXO DIETA:**

```
1. Prescritor faz upload do PDF (Med-X)
   ↓
2. Frontend envia para n8n:
   POST https://n8n.../nutribuddy-transcribe-diet
   {
     "pdfUrl": "https://storage.googleapis.com/...",
     "patientId": "abc123"
   }
   ↓
3. N8N processa:
   ├─ Baixa PDF
   ├─ Extrai texto
   ├─ Envia para GPT-4
   ├─ GPT-4 extrai: refeições, macros, VET
   └─ Salva no Firestore
   ↓
4. Frontend recebe confirmação
   ├─ Mostra "Transcrição completa! ✅"
   └─ Campos preenchidos automaticamente
```

### **FLUXO INBODY:**

```
1. Prescritor faz upload do PDF InBody 770
   ↓
2. Frontend envia para n8n:
   POST https://n8n.../nutribuddy-transcribe-inbody
   {
     "pdfUrl": "https://storage.googleapis.com/...",
     "patientId": "abc123"
   }
   ↓
3. N8N processa:
   ├─ Baixa PDF
   ├─ Extrai texto
   ├─ Envia para GPT-4
   ├─ GPT-4 extrai: peso, % gordura, medidas, etc
   └─ Salva no Firestore
   ↓
4. Frontend recebe confirmação
   ├─ Mostra "InBody transcrita! ✅"
   └─ Aba FÍSICO preenchida automaticamente
```

---

## 🎯 **DADOS EXTRAÍDOS:**

### **PDF DIETA:**
```json
{
  "meals": [
    {
      "name": "Café da manhã",
      "time": "07:00",
      "foods": [
        {"item": "Aveia", "amount": "50g"},
        {"item": "Leite desnatado", "amount": "200ml"},
        {"item": "Banana", "amount": "1 unidade"}
      ]
    },
    {
      "name": "Lanche manhã",
      "time": "10:00",
      "foods": [
        {"item": "Iogurte grego", "amount": "150g"},
        {"item": "Castanhas", "amount": "10 unidades"}
      ]
    }
  ],
  "macros": {
    "carbs": 200,
    "protein": 150,
    "fat": 60,
    "calories": 2000
  },
  "notes": "Dieta para emagrecimento. Beber 2-3L água/dia"
}
```

### **PDF INBODY 770:**
```json
{
  "weight": 75.5,
  "height": 175,
  "bodyFat": 18.2,
  "leanMass": 61.5,
  "fatMass": 14.0,
  "bodyWater": 45.2,
  "bmi": 24.7,
  "visceralFat": 8,
  "basalMetabolicRate": 1650,
  "measurements": {
    "waist": 85,
    "hip": 95,
    "chest": 100,
    "armRight": 35,
    "armLeft": 34,
    "thighRight": 58,
    "thighLeft": 57,
    "calf": 38
  },
  "muscleDistribution": {
    "rightArm": 3.2,
    "leftArm": 3.1,
    "trunk": 25.5,
    "rightLeg": 9.8,
    "leftLeg": 9.7
  },
  "date": "2025-02-10"
}
```

---

## ⚡ **TEMPO DE PROCESSAMENTO:**

- PDF pequeno (1-2 páginas): **10-20 segundos**
- PDF médio (3-5 páginas): **30-45 segundos**
- PDF grande (5+ páginas): **1-2 minutos**

---

## 🔥 **BENEFÍCIOS:**

✅ **Automático** - Zero trabalho manual
✅ **Preciso** - GPT-4 entende contexto
✅ **Rápido** - Processa em background
✅ **Confiável** - Retry automático se falhar
✅ **Rastreável** - Logs no n8n

---

## 🎯 **PRÓXIMOS PASSOS:**

1. ✅ Workflows criados (FEITO!)
2. ⏳ Importar no n8n (VOCÊ FAZ)
3. ⏳ Configurar variáveis Vercel (VOCÊ FAZ)
4. ✅ Frontend já está preparado (FEITO!)

---

## 📱 **TESTE RÁPIDO:**

Depois de configurar, faça upload de um PDF e observe:

```
Frontend:
├─ Upload do PDF ✅
├─ Mostra "Processando..." ⏳
├─ Aguarda resposta do n8n
└─ Exibe "Transcrito! ✅"

N8N:
├─ Recebe webhook ✅
├─ Baixa PDF ✅
├─ Extrai texto ✅
├─ GPT-4 analisa ✅
├─ Salva no Firestore ✅
└─ Responde success ✅
```

---

## 🆘 **SUPORTE:**

Se der erro:
1. Verificar logs no n8n
2. Verificar se OpenAI key está configurada
3. Verificar se webhook secret está correto

**PRONTO PARA USAR! 🚀**

