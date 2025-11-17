# 🧪 EXEMPLOS DE TESTE: Sistema de Dieta PDF

## 📋 OBJETIVOS DOS TESTES

1. ✅ Validar que o workflow N8N está funcionando
2. ✅ Verificar precisão da transcrição (valores exatos)
3. ✅ Confirmar salvamento no Firestore
4. ✅ Testar integração frontend → N8N → backend

---

## 🔥 TESTE 1: Backend Direto (sem N8N)

**Objetivo:** Verificar se o endpoint do backend funciona

**Tempo:** 2 minutos

**Passo a passo:**

```bash
curl -X POST https://web-production-c9eaf.up.railway.app/api/n8n/update-diet-complete \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024" \
  -d '{
    "patientId": "PATIENT_ID_AQUI",
    "diet": {
      "meta": {
        "caloriasDiarias": 1790.36,
        "periodo": "24 horas",
        "objetivo": "emagrecimento",
        "nutricionista": "Dr. Teste",
        "dataCriacao": "2024-11-17"
      },
      "macronutrientes": {
        "carboidratos": { "gramas": 158.40 },
        "proteinas": { "gramas": 137.32 },
        "gorduras": { "gramas": 67.42 }
      },
      "refeicoes": [
        {
          "ordem": 1,
          "nome": "Café da manhã",
          "horario": "07:30",
          "alimentos": [
            {
              "nome": "Ovo",
              "quantidade": 150,
              "unidade": "g"
            }
          ],
          "macros": {
            "calorias": 502.37,
            "carboidratos": 43.18,
            "proteinas": 31.78,
            "gorduras": 22.15
          }
        }
      ]
    },
    "transcriptionStatus": "completed",
    "model": "test"
  }'
```

**Substitua:** `PATIENT_ID_AQUI` por um UID de paciente real do seu Firestore.

**Resposta esperada (sucesso):**

```json
{
  "success": true,
  "dietPlanId": "abc123xyz",
  "resumo": {
    "name": "Plano Emagrecimento",
    "totalCalorias": 1790.36,
    "totalRefeicoes": 1,
    "totalAlimentos": 1,
    "objetivo": "emagrecimento",
    "macros": {
      "proteinas": 137.32,
      "carboidratos": 158.40,
      "gorduras": 67.42
    }
  }
}
```

**Verificar no Firestore:**

1. Abrir Firebase Console
2. Ir em Firestore
3. Collection: `dietPlans`
4. Filtrar por `patientId == PATIENT_ID_AQUI`
5. Ver documento criado ✅

---

## 🔄 TESTE 2: Workflow N8N (sem PDF)

**Objetivo:** Testar workflow N8N com dados mockados

**Tempo:** 3 minutos

**Passo a passo:**

1. Abrir N8N: https://n8n-production-3eae.up.railway.app
2. Abrir workflow: "NutriBuddy - Processar Dieta PDF (GPT-4o Vision)"
3. No primeiro node "Webhook Recebe PDF", clicar em **"Listen for test event"**
4. Em outra aba do terminal, executar:

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://example.com/dieta-teste.pdf",
    "patientId": "PATIENT_ID_AQUI",
    "patientName": "João Teste"
  }'
```

**⚠️ NOTA:** Este teste vai FALHAR no node do GPT-4o (porque a URL é fake), mas serve para testar a estrutura do workflow.

**Verificar:**
- ✅ Webhook recebeu os dados
- ✅ Node "Webhook Recebe PDF" mostra os dados
- ❌ Node "GPT-4o Analisa PDF" falha (esperado, URL fake)

**Para testar com PDF real:**

1. Fazer upload manual de um PDF de dieta no Firebase Storage
2. Obter URL pública do PDF
3. Substituir `pdfUrl` no comando acima
4. Executar novamente
5. Aguardar ~30s
6. Ver resposta de sucesso

---

## 📄 TESTE 3: PDF Real Completo

**Objetivo:** Testar fluxo completo com PDF real de dieta

**Tempo:** 5 minutos

**Requisitos:**
- PDF de dieta real (Dietbox, Avanutri, etc.)
- PDF deve ter texto (não pode ser imagem pura)

**Passo a passo:**

### **Etapa 1: Upload do PDF no Firebase Storage**

```bash
# Via Firebase Console:
1. Abrir Firebase Console → Storage
2. Navegar até: prescribers/{UID}/patients/{PATIENT_ID}/diets/
3. Fazer upload manual do PDF
4. Clicar no arquivo → Copiar URL pública
```

### **Etapa 2: Chamar Webhook N8N**

```bash
curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://firebasestorage.googleapis.com/v0/b/nutribuddy-2fc9c.appspot.com/o/prescribers%2FUID%2Fpatients%2FPATIENT_ID%2Fdiets%2Fdieta.pdf?alt=media",
    "patientId": "PATIENT_ID_AQUI",
    "patientName": "João Silva"
  }'
```

**Substitua:**
- `pdfUrl` pela URL copiada do Firebase Storage
- `PATIENT_ID_AQUI` pelo UID real do paciente

### **Etapa 3: Aguardar Processamento**

```
⏳ Aguarde 20-40 segundos...
```

### **Etapa 4: Ver Resposta**

**Resposta de sucesso:**

```json
{
  "success": true,
  "message": "✅ Dieta transcrita com PRECISÃO COMPLETA usando GPT-4o Vision",
  "patientId": "PATIENT_ID_AQUI",
  "status": "completed",
  "model": "gpt-4o-vision",
  "resumo": {
    "totalCalorias": 1790.36,
    "totalRefeicoes": 6,
    "totalAlimentos": 24,
    "objetivo": "emagrecimento saudável"
  },
  "totalCalorias": 1790.36,
  "totalRefeicoes": 6,
  "totalAlimentos": 24
}
```

### **Etapa 5: Verificar no Firestore**

1. Abrir Firebase Console → Firestore
2. Collection: `dietPlans`
3. Filtrar: `patientId == PATIENT_ID_AQUI` AND `isActive == true`
4. Abrir documento
5. Verificar:
   - ✅ `dailyCalories` está EXATO (ex: 1790.36, não 1800)
   - ✅ `meals` array tem todas as refeições
   - ✅ Cada meal tem `alimentos` array com quantidades
   - ✅ `metadata` tem dados completos

---

## 🖥️ TESTE 4: Frontend → N8N → Backend (Completo)

**Objetivo:** Testar fluxo completo pelo frontend (após implementar componente)

**Tempo:** 2 minutos

**Requisitos:**
- Componente `DietUpload.tsx` implementado
- Variável `NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL` configurada no Vercel
- Deploy feito

**Passo a passo:**

1. ✅ Login como prescritor no frontend
2. ✅ Abrir página de um paciente
3. ✅ Ir na aba "Plano Alimentar"
4. ✅ Clicar em "Upload PDF de Dieta"
5. ✅ Selecionar PDF de dieta
6. ✅ Aguardar upload (2-5s)
7. ✅ Ver mensagem "PDF enviado! Processando..."
8. ✅ Aguardar transcrição (~30s)
9. ✅ Ver toast de sucesso com resumo
10. ✅ Verificar se dieta aparece na UI

**Validações:**

- ✅ Upload funcionou sem erros
- ✅ Progresso foi exibido
- ✅ Mensagem de sucesso apareceu
- ✅ Resumo está correto (calorias, refeições, alimentos)
- ✅ Dieta aparece na página
- ✅ Calorias são EXATAS (não arredondadas)
- ✅ Refeições estão completas
- ✅ Alimentos têm quantidades

---

## 🔍 TESTE 5: Validação de Precisão

**Objetivo:** Verificar se valores são extraídos com precisão cirúrgica

**Tempo:** 5 minutos

**Método:**

1. Pegar um PDF de dieta com valores decimais precisos (ex: 1.790,36 kcal)
2. Anotar valores EXATOS do PDF:
   - Calorias totais
   - Proteínas totais
   - Carboidratos totais
   - Gorduras totais
   - Quantidade de cada alimento
3. Processar PDF pelo sistema
4. Verificar no Firestore
5. Comparar valores

**Exemplo de validação:**

| Campo | PDF Original | Firestore | Status |
|-------|-------------|-----------|---------|
| Calorias | 1.790,36 | 1790.36 | ✅ EXATO |
| Proteínas | 137,32g | 137.32 | ✅ EXATO |
| Carboidratos | 158,40g | 158.40 | ✅ EXATO |
| Gorduras | 67,42g | 67.42 | ✅ EXATO |
| Ovo (Café) | 150g | 150.0 | ✅ EXATO |

**Se valores estiverem arredondados (ex: 1800 ao invés de 1790.36):**

❌ **PROBLEMA!** 

**Solução:**
1. Ver prompt do GPT-4o no workflow N8N
2. Verificar se está usando `temperature: 0.1`
3. Ver resposta raw do GPT-4o nos logs
4. Ajustar prompt se necessário

---

## 📊 TESTE 6: Múltiplas Dietas (Versionamento)

**Objetivo:** Verificar se sistema de versionamento funciona

**Tempo:** 5 minutos

**Passo a passo:**

1. Processar PDF de dieta para paciente X
2. Verificar no Firestore: 1 documento com `isActive: true`
3. Processar OUTRO PDF de dieta para o MESMO paciente X
4. Verificar no Firestore:
   - ✅ 2 documentos no total
   - ✅ 1 com `isActive: true` (o mais recente)
   - ✅ 1 com `isActive: false` (o anterior)
   - ✅ Campo `deactivatedAt` preenchido no anterior
5. Query para histórico:

```javascript
// No Firestore Console ou via código
db.collection('dietPlans')
  .where('patientId', '==', 'PATIENT_ID')
  .orderBy('createdAt', 'desc')
  .get()
```

**Resultado esperado:**
```
[
  { id: 'doc2', isActive: true, createdAt: '2024-11-17T10:30' },  // ← Dieta atual
  { id: 'doc1', isActive: false, createdAt: '2024-11-10T14:20' }  // ← Dieta anterior
]
```

---

## 🤖 TESTE 7: Integração com Chat IA

**Objetivo:** Verificar se IA consegue consultar a dieta

**Tempo:** 3 minutos

**Requisitos:**
- Dieta transcrita e salva no Firestore
- Workflow de chat IA configurado

**Teste via cURL:**

```bash
curl -X GET \
  "https://web-production-c9eaf.up.railway.app/api/n8n/patients/PATIENT_ID/diet" \
  -H "X-Webhook-Secret: nutribuddy-secret-2024"
```

**Resposta esperada:**

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Plano Emagrecimento",
    "description": "Plano de 1790.36 kcal/dia",
    "meals": [
      {
        "nome": "Café da manhã",
        "horario": "07:30",
        "alimentos": [
          {
            "nome": "Ovo caipira",
            "quantidade": 150,
            "unidade": "g"
          }
        ]
      }
    ],
    "macros": {
      "protein": 137.32,
      "carbs": 158.40,
      "fats": 67.42,
      "calories": 1790.36
    },
    "createdAt": "2024-11-17T10:30:00.000Z",
    "updatedAt": "2024-11-17T10:30:00.000Z"
  }
}
```

**Teste no chat:**

1. Login como paciente
2. Abrir chat com IA
3. Perguntar: "Posso comer banana no café da manhã?"
4. IA deve consultar dieta e responder baseado nos alimentos prescritos

---

## 🐛 TROUBLESHOOTING: Testes que Falharam

### **Erro 1: "Invalid or missing webhook secret"**

**Sintoma:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing webhook secret"
}
```

**Solução:**
- Adicionar header: `X-Webhook-Secret: nutribuddy-secret-2024`
- Verificar se workflow N8N está enviando o header correto

---

### **Erro 2: "Paciente não encontrado"**

**Sintoma:**
```json
{
  "success": false,
  "error": "Paciente não encontrado",
  "patientId": "..."
}
```

**Solução:**
- Verificar se `patientId` está correto
- Verificar se paciente existe em `users/{patientId}` ou `patients/{patientId}`
- Criar paciente de teste se necessário

---

### **Erro 3: "JSON.parse failed" no N8N**

**Sintoma:**
```
❌ Erro ao parsear JSON: Unexpected token
```

**Solução:**
1. Ver logs do node "GPT-4o Analisa PDF"
2. Ver resposta raw do GPT-4o
3. GPT-4o pode ter retornado markdown ou texto inválido
4. Tentar novamente (às vezes IA erra)
5. Ajustar temperature do GPT se necessário

---

### **Erro 4: Valores arredondados**

**Sintoma:**
PDF diz: 1.790,36 kcal  
Firestore tem: 1800 kcal

**Solução:**
1. Ver prompt do GPT-4o no workflow
2. Verificar se está usando `temperature: 0.1`
3. Adicionar exemplo específico no prompt:
   ```
   CORRETO: 1790.36 (exato)
   ERRADO: 1800 (arredondado)
   ```

---

### **Erro 5: Algumas refeições não foram extraídas**

**Sintoma:**
PDF tem 6 refeições  
Firestore tem apenas 3 refeições

**Solução:**
1. Ver resposta raw do GPT-4o
2. PDF pode ter layout complexo
3. Melhorar prompt com instruções específicas
4. Testar com outro PDF mais simples
5. Converter PDF para imagem antes (se necessário)

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

Antes de considerar o sistema pronto, validar:

### **Funcionalidade:**
- [ ] Upload de PDF funciona
- [ ] Transcrição completa (sem timeout)
- [ ] Salvamento no Firestore
- [ ] Versionamento automático
- [ ] Visualização na UI
- [ ] Integração com chat IA

### **Precisão:**
- [ ] Calorias EXATAS (não arredondadas)
- [ ] Todas as refeições extraídas
- [ ] Todos os alimentos extraídos
- [ ] Quantidades EXATAS de cada alimento
- [ ] Macros corretos
- [ ] Horários das refeições corretos

### **Performance:**
- [ ] Tempo < 40s
- [ ] Custo < $0.02 por PDF
- [ ] Sem erros de timeout
- [ ] Firestore response < 2s

### **UX:**
- [ ] Loading state durante upload
- [ ] Progresso visível
- [ ] Toast de sucesso
- [ ] Resumo claro (calorias, refeições, alimentos)
- [ ] Dieta aparece imediatamente na UI
- [ ] Validação de arquivo (tipo, tamanho)

---

## 🎉 CONCLUSÃO

Após passar por todos os testes:

✅ **Sistema validado e pronto para produção!**

**Próximos passos:**
1. Monitorar primeiros uploads reais
2. Coletar feedback de nutricionistas
3. Ajustar prompt do GPT se necessário
4. Adicionar melhorias na UI conforme uso

---

**Criado em:** 17 de novembro de 2024  
**Sistema:** NutriBuddy - Testes de Transcrição de Dieta PDF

