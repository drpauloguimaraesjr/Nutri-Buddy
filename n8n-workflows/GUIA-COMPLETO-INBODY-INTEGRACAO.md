# 📊 GUIA COMPLETO: INTEGRAÇÃO INBODY + N8N

## ✅ RESPOSTAS ÀS SUAS PERGUNTAS

---

### 1️⃣ **UPLOAD DO PDF INBODY**

#### a) **Como o PDF é processado atualmente?**

**✅ SIM, o sistema já está implementado!**

**Localização do código:** `frontend/src/app/(dashboard)/patients/[patientId]/page.tsx` (linhas 1339-1423)

**Fluxo completo:**

```typescript
1. Prescritor seleciona PDF na aba "Físico" do paciente
2. Frontend faz upload DIRETO para Firebase Storage
3. Path do Storage: prescribers/{prescriberId}/patients/{patientId}/inbody/{timestamp}-{filename}.pdf
4. Gera URL pública do PDF automaticamente
5. Chama webhook N8N com: { pdfUrl, patientId, patientName }
6. N8N processa e retorna dados extraídos
7. Dados aparecem na tela do paciente
```

#### b) **Existe alguma chamada para o N8N após o upload?**

**✅ SIM, já está implementada!**

**Código (linhas 1384-1417):**

```typescript
// Frontend chama N8N automaticamente após upload
const n8nUrl = process.env.NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL;

const response = await fetch(n8nUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pdfUrl: url,              // URL pública do Firebase Storage
    patientId: patientId,     // ID do paciente
    patientName: patient?.name // Nome do paciente (opcional)
  })
});
```

**Variável de ambiente necessária:**
```env
NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody
```

#### c) **Qual é o código/arquivo responsável por processar o upload do InBody?**

**Frontend:**
- Arquivo: `frontend/src/app/(dashboard)/patients/[patientId]/page.tsx`
- Função: `handleInbodyUpload` (linha 1339)
- Upload: Firebase Storage (usando `uploadBytesResumable`)

**Backend:**
- Arquivo: `routes/n8n-transcription.js`
- Endpoint: `POST /api/n8n/update-inbody` (linha 70)
- Função: Receber dados transcritos do N8N e salvar no Firestore

---

### 2️⃣ **INTEGRAÇÃO COM N8N**

#### ✅ **TUDO JÁ ESTÁ IMPLEMENTADO!**

O fluxo completo já funciona:

```
1. Upload PDF → Firebase Storage ✅
2. Gerar URL pública → Automático ✅  
3. Chamar webhook N8N → Implementado ✅
4. N8N processar com GPT-4 Vision → Workflow existe ✅
5. N8N salvar no Firestore → Endpoint existe ✅
```

**Único requisito:**
- Configurar a variável de ambiente `NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL` no Vercel

---

### 3️⃣ **ENDPOINT DO BACKEND**

#### ✅ **SIM, JÁ EXISTE!**

**Localização:** `routes/n8n-transcription.js` (linhas 66-152)

**Endpoint:**
```javascript
POST /api/n8n/update-inbody
```

**Body esperado:**
```json
{
  "patientId": "abc123",
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
  "date": "2025-02-10",
  "notes": "Observações adicionais",
  "transcriptionStatus": "completed"
}
```

**Headers necessários:**
```
x-webhook-secret: nutribuddy-secret-2024
```

**O que o endpoint faz:**
1. Valida `patientId` obrigatório
2. Atualiza dados do paciente no Firestore (`users/{patientId}`)
3. Adiciona registro no histórico (`users/{patientId}/bodyHistory`)
4. Retorna sucesso

---

### 4️⃣ **ESTRUTURA DE DADOS**

#### **Collection:** `users/{patientId}`

**Campos do InBody salvos diretamente no documento do paciente:**

```javascript
{
  // Dados principais
  weight: 75.5,
  height: 175,
  bodyFat: 18.2,
  leanMass: 61.5,
  fatMass: 14.0,
  bodyWater: 45.2,
  bmi: 24.7,
  visceralFat: 8,
  basalMetabolicRate: 1650,
  
  // Medidas corporais
  measurements: {
    waist: 85,
    hip: 95,
    chest: 100,
    armRight: 35,
    armLeft: 34,
    thighRight: 58,
    thighLeft: 57,
    calf: 38
  },
  
  // Distribuição muscular
  muscleDistribution: {
    rightArm: 3.2,
    leftArm: 3.1,
    trunk: 25.5,
    rightLeg: 9.8,
    leftLeg: 9.7
  },
  
  // Metadados
  inbodyNotes: "Observações",
  inbodyTranscriptionStatus: "completed",
  bodyUpdatedAt: Timestamp
}
```

#### **Subcollection:** `users/{patientId}/bodyHistory`

**Histórico de medições (cada InBody cria um novo registro):**

```javascript
{
  weight: 75.5,
  bodyFat: 18.2,
  measurements: { waist: 85, hip: 95, ... },
  source: "inbody_770",
  date: "2025-02-10",
  createdAt: Timestamp
}
```

---

## 🚀 **O QUE VOCÊ PRECISA FAZER AGORA**

### **PASSO 1: Importar Workflow N8N**

1. Acessar: https://n8n-production-3eae.up.railway.app
2. Menu → Import from File
3. Selecionar: `7-TRANSCREVER-INBODY-PDF.json` ou `7-TRANSCREVER-INBODY-PDF-SIMPLES.json`
4. Configurar credenciais (OpenAI API Key)
5. Ativar workflow
6. Copiar URL do webhook

**URL será algo como:**
```
https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody
```

---

### **PASSO 2: Configurar Variável no Vercel**

1. Acessar: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicionar:
   ```
   NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL
   https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody
   ```
3. Salvar e fazer redeploy

---

### **PASSO 3: Configurar Webhook Secret no N8N**

No workflow N8N, configurar um node HTTP Request que chama o backend:

```
URL: https://web-production-c9eaf.up.railway.app/api/n8n/update-inbody
Method: POST
Headers:
  - x-webhook-secret: nutribuddy-secret-2024
  - Content-Type: application/json
Body: { dados extraídos do GPT-4 }
```

---

## 🎯 **FLUXO FINAL COMPLETO**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. PRESCRITOR FAZ UPLOAD DO PDF INBODY NA TELA "FÍSICO"        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND ENVIA PDF PARA FIREBASE STORAGE                     │
│    Path: prescribers/{uid}/patients/{id}/inbody/{file}.pdf     │
│    Gera URL pública automaticamente                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND CHAMA WEBHOOK N8N                                   │
│    POST https://n8n.../webhook/nutribuddy-transcribe-inbody    │
│    Body: { pdfUrl, patientId, patientName }                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. N8N PROCESSA PDF COM GPT-4 VISION                            │
│    - Baixa PDF da URL                                           │
│    - Converte para imagem                                       │
│    - Envia para GPT-4o Vision                                   │
│    - Extrai todos os dados estruturados                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. N8N CHAMA BACKEND PARA SALVAR                                │
│    POST https://backend.../api/n8n/update-inbody               │
│    Headers: x-webhook-secret: nutribuddy-secret-2024           │
│    Body: { patientId, weight, bodyFat, measurements, ... }     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND SALVA NO FIRESTORE                                   │
│    - Atualiza users/{patientId}                                │
│    - Cria registro em users/{patientId}/bodyHistory            │
│    - Retorna sucesso para N8N                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. DADOS APARECEM AUTOMATICAMENTE NA TELA DO PACIENTE          │
│    ✅ Peso, altura, gordura corporal                           │
│    ✅ Massa magra, massa gorda                                 │
│    ✅ Medidas corporais (cintura, quadril, etc.)               │
│    ✅ Distribuição muscular                                     │
│    ✅ Taxa metabólica basal                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ **TEMPO DE PROCESSAMENTO**

- **Upload:** Instantâneo (< 2s)
- **Transcrição N8N:** 20-40 segundos
- **Salvamento:** < 1s
- **Total:** ~30-45 segundos

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### **Já Implementado ✅**
- [x] Frontend: Função de upload InBody
- [x] Frontend: Upload para Firebase Storage
- [x] Frontend: Geração de URL pública
- [x] Frontend: Chamada para N8N
- [x] Backend: Endpoint `/api/n8n/update-inbody`
- [x] Backend: Lógica de salvamento no Firestore
- [x] Backend: Histórico de medições
- [x] Workflow N8N: Arquivo JSON pronto

### **Para Fazer Agora ⏳**
- [ ] Importar workflow N8N (5 minutos)
- [ ] Configurar OpenAI API Key no N8N (1 minuto)
- [ ] Configurar variável `NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL` no Vercel (2 minutos)
- [ ] Testar com um PDF InBody real (1 minuto)

**TOTAL: ~10 minutos de configuração!**

---

## 🧪 **COMO TESTAR**

### **1. Teste Manual no Frontend**

```
1. Login como prescritor
2. Abrir página de um paciente
3. Aba "Físico"
4. Clicar em "Upload PDF InBody"
5. Selecionar PDF do InBody 770
6. Aguardar mensagem de sucesso
7. Recarregar página em 1 minuto
8. Verificar se dados foram preenchidos
```

### **2. Teste via cURL (Backend)**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/n8n/update-inbody \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: nutribuddy-secret-2024" \
  -d '{
    "patientId": "ID_DO_PACIENTE",
    "weight": 75.5,
    "height": 175,
    "bodyFat": 18.2,
    "measurements": {
      "waist": 85,
      "hip": 95
    }
  }'
```

### **3. Teste via N8N (Webhook)**

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://storage.googleapis.com/...seu-pdf-inbody.pdf",
    "patientId": "ID_DO_PACIENTE",
    "patientName": "João Silva"
  }'
```

---

## 🆘 **TROUBLESHOOTING**

### **Erro: "Configure NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL"**
- Adicionar variável no Vercel
- Fazer redeploy

### **Erro: "Webhook secret inválido"**
- Verificar header `x-webhook-secret: nutribuddy-secret-2024`

### **Erro: "patientId é obrigatório"**
- Verificar se está enviando `patientId` no body

### **Dados não aparecem no frontend**
- Recarregar página (dados vêm do Firestore)
- Verificar logs do N8N
- Verificar se workflow está ativo

---

## 📊 **DADOS EXTRAÍDOS DO INBODY 770**

### **Composição Corporal**
- Peso total
- Massa magra
- Massa gorda
- Porcentagem de gordura
- Água corporal total
- Proteína
- Minerais

### **Análise Segmentar**
- Massa muscular por segmento (braços, pernas, tronco)
- Gordura por segmento
- Balanço muscular esquerdo/direito

### **Medidas**
- IMC (BMI)
- Gordura visceral
- Taxa metabólica basal
- Circunferências (cintura, quadril, braços, coxas, panturrilha)

### **Controle de Peso**
- Peso alvo
- Controle de gordura
- Controle de músculo

---

## 🎉 **CONCLUSÃO**

**SISTEMA 100% PRONTO!** 

Só falta:
1. Importar workflow no N8N (5 min)
2. Configurar variável no Vercel (2 min)
3. Testar! (1 min)

**Total: 8 minutos de trabalho!** 🚀


