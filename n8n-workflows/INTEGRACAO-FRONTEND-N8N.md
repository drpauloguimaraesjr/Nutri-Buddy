# 🔗 Integração Frontend (React) ↔ n8n ↔ Backend

## 📋 Visão Geral do Fluxo

```
┌─────────────────┐
│  Frontend React │
│  (Upload PDF)   │
└────────┬────────┘
         │
         │ 1. Upload PDF
         ↓
┌─────────────────────┐
│ Firebase Storage    │
│ (PDF com token)     │
└────────┬────────────┘
         │
         │ 2. getDownloadURL()
         ↓
    [URL com token]
         │
         │ 3. POST /webhook
         ↓
┌─────────────────────┐
│   n8n Workflow      │
│  (GPT-4o Vision)    │
└────────┬────────────┘
         │
         │ 4. Dados estruturados
         ↓
┌─────────────────────┐
│ Backend (Railway)   │
│ /api/n8n/update-... │
└────────┬────────────┘
         │
         │ 5. Salvar
         ↓
┌─────────────────────┐
│  Firestore          │
│  (dietPlan, etc)    │
└─────────────────────┘
```

---

## 🚀 1. CONFIGURAÇÃO DO WORKFLOW N8N

### **Importar o Workflow:**

1. No n8n, vá em **Workflows** → **Import from File**
2. Selecione: `/Users/drpgjr.../NutriBuddy/n8n-workflows/WORKFLOW-FINAL-COMPLETO.json`
3. Clique em **Import**

### **Configurar OpenAI API:**

1. Clique no nó **"GPT-4o Vision Analisa PDF"**
2. Em **Authentication**: `Predefined Credential Type`
3. Em **Credential Type**: `OpenAI API`
4. **Create New Credential** ou selecione existente
5. Cole sua API Key: `sk-proj-...`
6. **Save**

### **Ativar o Workflow:**

1. Toggle no topo: **Inactive** → **Active** ✅
2. Clique no nó **"Webhook Recebe PDF"**
3. **COPIE A URL DO WEBHOOK** (exemplo):
   ```
   https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet
   ```

---

## 💻 2. CÓDIGO DO FRONTEND (React)

### **Arquivo: `DietUploader.jsx`**

```javascript
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

// ⚠️ CONFIGURAÇÃO: Cole a URL do webhook do n8n aqui
const N8N_WEBHOOK_URL = 'https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet;

const DietUploader = ({ patientId }) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validações
    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 10MB');
      return;
    }
    
    try {
      setError(null);
      setUploading(true);
      
      // 1️⃣ UPLOAD PARA FIREBASE STORAGE
      console.log('📤 Fazendo upload do PDF...');
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `diets/${patientId}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
        customMetadata: {
          patientId: patientId,
          uploadedAt: new Date().toISOString()
        }
      });
      
      // 2️⃣ OBTER URL COM TOKEN
      const pdfUrl = await getDownloadURL(snapshot.ref);
      console.log('✅ Upload concluído!');
      console.log('🔗 URL com token:', pdfUrl);
      
      setUploading(false);
      setProcessing(true);
      
      // 3️⃣ ENVIAR PARA N8N PROCESSAR
      console.log('🤖 Enviando para n8n...');
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: pdfUrl,      // URL do Firebase com token
          patientId: patientId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar PDF');
      }
      
      // 4️⃣ SUCESSO! Dieta transcrita e salva
      const data = await response.json();
      console.log('✅ Processamento concluído:', data);
      
      setResult(data);
      setProcessing(false);
      
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="diet-uploader">
      <h2>📄 Upload de Dieta</h2>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        disabled={uploading || processing}
      />
      
      {uploading && (
        <div className="status uploading">
          <p>📤 Fazendo upload do PDF...</p>
        </div>
      )}
      
      {processing && (
        <div className="status processing">
          <p>🤖 Processando dieta com IA...</p>
          <p>Isso pode levar alguns segundos...</p>
        </div>
      )}
      
      {error && (
        <div className="status error">
          <p>❌ Erro: {error}</p>
        </div>
      )}
      
      {result && (
        <div className="status success">
          <h3>✅ Dieta Processada com Sucesso!</h3>
          <ul>
            <li>📊 Calorias: {result.detalhes?.totalCalorias} kcal</li>
            <li>🍽️ Refeições: {result.detalhes?.totalRefeicoes}</li>
            <li>🥗 Alimentos: {result.detalhes?.totalAlimentos}</li>
            <li>🎯 Objetivo: {result.detalhes?.objetivo}</li>
          </ul>
          <button onClick={() => console.log('Dados completos:', result)}>
            Ver Detalhes Completos
          </button>
        </div>
      )}
    </div>
  );
};

export default DietUploader;
```

---

## 🔧 3. FIREBASE STORAGE RULES

**Arquivo: `storage.rules`**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /diets/{patientId}/{fileName} {
      // Apenas usuário autenticado pode fazer upload
      allow write: if request.auth != null && request.auth.uid == patientId;
      
      // Qualquer um com a URL (incluindo token) pode ler
      // Isso permite que o n8n baixe o PDF
      allow read: if true;
    }
  }
}
```

---

## 🧪 4. TESTE COMPLETO (Passo a Passo)

### **Teste no n8n (interno):**

1. No n8n, clique no nó **"Webhook Recebe PDF"**
2. Clique nos **3 pontinhos (...)** → **"Use test data"**
3. Cole:
```json
{
  "patientId": "TESTE_PATIENT_123",
  "pdfUrl": "https://firebasestorage.googleapis.com/v0/b/nutribuddy-app.appspot.com/o/exemplo.pdf?alt=media&token=abc123"
}
```
4. Clique em **"Execute Workflow"**
5. Veja cada nó processar! ✅

### **Teste com CURL (externo):**

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "TESTE_PATIENT_123",
    "pdfUrl": "https://firebasestorage.googleapis.com/v0/b/nutribuddy-app.appspot.com/o/diets%2FTESTE_PATIENT_123%2F1731699600000_dieta.pdf?alt=media&token=abc-123-def"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "✅ Dieta transcrita com PRECISÃO COMPLETA e salva no Firestore",
  "patientId": "TESTE_PATIENT_123",
  "status": "completed",
  "model": "gpt-4o-vision",
  "detalhes": {
    "totalCalorias": 1790.36,
    "totalRefeicoes": 6,
    "totalAlimentos": 24,
    "objetivo": "emagrecimento saudável"
  }
}
```

---

## 📊 5. DADOS SALVOS NO FIRESTORE

**Coleção: `patients/{patientId}`**

Campos adicionados/atualizados:
- `dietPlan` (object) - Dieta completa estruturada
- `dietSummary` (object) - Resumo (calorias, refeições, alimentos)
- `dietMacros` (object) - Macronutrientes detalhados
- `dietMeals` (array) - Array de refeições
- `dietMicronutrients` (array) - Micronutrientes
- `dietNotes` (array) - Observações do nutricionista
- `dietSubstitutions` (array) - Substituições permitidas
- `dietTranscriptionMeta` (object) - Metadados (modelo, timestamp, etc)
- `dietTranscriptionComplete` (boolean) - true
- `dietLastUpdate` (timestamp) - Data da última atualização

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **n8n:**
- [ ] Workflow `WORKFLOW-FINAL-COMPLETO.json` importado
- [ ] OpenAI API Key configurada
- [ ] Workflow ativado (toggle verde)
- [ ] URL do webhook copiada

### **Frontend:**
- [ ] `DietUploader.jsx` criado
- [ ] `N8N_WEBHOOK_URL` configurada com URL real
- [ ] Firebase SDK configurado (`storage`)
- [ ] Componente integrado na página do prescritor

### **Firebase:**
- [ ] Storage Rules atualizadas
- [ ] Testes de upload funcionando
- [ ] URLs com token acessíveis publicamente

### **Backend:**
- [ ] Endpoint `/api/n8n/update-diet-complete` funcionando
- [ ] Variável `WEBHOOK_SECRET` configurada no Railway
- [ ] Firestore recebendo dados corretamente

---

## 🐛 TROUBLESHOOTING

### **Erro: "Route not found"**
- ✅ Verifique se o workflow está **ativo** no n8n
- ✅ Confirme a URL do webhook (clique no primeiro nó)

### **Erro: "OpenAI API error"**
- ✅ Verifique se a API Key está configurada
- ✅ Confirme se tem créditos na conta OpenAI

### **Erro: "Unauthorized" no backend**
- ✅ Verifique o `X-Webhook-Secret` no workflow (linha 114)
- ✅ Confirme que é igual ao `WEBHOOK_SECRET` no Railway

### **PDF não está sendo baixado**
- ✅ Teste a URL do PDF no navegador anônimo
- ✅ Verifique Firebase Storage Rules (deve permitir `allow read: if true`)

### **Dados não aparecem no Firestore**
- ✅ Veja logs do n8n (Executions)
- ✅ Veja logs do Railway (backend)
- ✅ Confirme que o `patientId` existe no Firestore

---

## 📞 PRÓXIMOS PASSOS

1. **Importe o workflow** `WORKFLOW-FINAL-COMPLETO.json`
2. **Configure a OpenAI API Key**
3. **Ative o workflow**
4. **Copie a URL do webhook**
5. **Atualize o código React** com a URL
6. **Teste com um PDF real!**

---

**Arquivo criado:** `WORKFLOW-FINAL-COMPLETO.json`  
**Documentação:** `INTEGRACAO-FRONTEND-N8N.md`

🚀 **PRONTO PARA PRODUÇÃO!**

