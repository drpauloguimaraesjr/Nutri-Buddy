# 🚀 **CONFIGURAR TRANSCRIÇÃO N8N - 5 MINUTOS**

## ✅ **WORKFLOWS JÁ IMPORTADOS NO N8N!**

URLs dos Webhooks:
```
Dieta:  https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-diet
InBody: https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody
```

---

## 📋 **CONFIGURAR NO VERCEL (AGORA):**

### **1. Acessar Vercel:**
```
https://vercel.com/drpauloguimaraesjr/nutri-buddy-ir2n/settings/environment-variables
```

### **2. Adicionar 2 variáveis:**

**Variável 1:**
```
Name:  NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL
Value: https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-diet
```

**Variável 2:**
```
Name:  NEXT_PUBLIC_N8N_TRANSCRIBE_INBODY_URL
Value: https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-transcribe-inbody
```

### **3. Salvar:**
```
1. Clicar "Save" em cada uma
2. Fazer novo deploy:
   - Ir em "Deployments"
   - Clicar "..." no último deploy
   - "Redeploy"
```

---

## 🎯 **COMO VAI FUNCIONAR:**

### **Upload PDF Dieta:**
```
1. Você faz upload do PDF (Med-X)
2. Frontend automaticamente chama:
   POST https://n8n.../nutribuddy-transcribe-diet
   { pdfUrl, patientId }
3. N8N processa (10-30s)
4. GPT-4 extrai refeições e macros
5. Salva no Firestore
6. Campos preenchem sozinhos! ✅
```

### **Upload PDF InBody:**
```
1. Você faz upload do PDF (InBody 770)
2. Frontend automaticamente chama:
   POST https://n8n.../nutribuddy-transcribe-inbody
   { pdfUrl, patientId }
3. N8N processa (10-30s)
4. GPT-4 extrai peso, gordura, medidas
5. Salva no Firestore
6. Aba FÍSICO preenche sozinha! ✅
```

---

## ⚡ **TESTANDO:**

Depois de configurar variáveis e fazer redeploy:

```
1. Login no sistema
2. Abrir qualquer paciente
3. Ir em aba "Dieta & Treino"
4. Fazer upload de PDF
5. Aguardar 10-30s
6. ✅ Campos preenchem automaticamente!
```

---

## 🔑 **IMPORTANTE:**

Certifique-se que no n8n você configurou:
- ✅ Credencial OpenAI (API Key)
- ✅ Workflows estão ATIVOS (toggle ON)

---

**PRONTO! TRANSCRIÇÃO AUTOMÁTICA FUNCIONANDO! 🎉**

