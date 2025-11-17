# 🚀 GUIA RÁPIDO: Implementar Upload de Dieta PDF

## ⏱️ TEMPO TOTAL: ~1 hora

---

## ✅ SITUAÇÃO ATUAL

**O que JÁ funciona:**
- ✅ Backend endpoint `/api/n8n/update-diet-complete` (routes/n8n.js)
- ✅ Workflow N8N com GPT-4o Vision (importado)
- ✅ Firestore collection `dietPlans` configurada
- ✅ Sistema de versionamento (desativa anterior, ativa nova)

**O que FALTA:**
- ⚠️ Componente de upload no frontend
- ⚠️ Variável de ambiente no Vercel

---

## 📝 PASSO A PASSO

### **PASSO 1: Criar Componente de Upload (15 min)**

Criar arquivo: `frontend/src/app/(dashboard)/patients/[patientId]/components/DietUpload.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface DietUploadProps {
  patientId: string;
  prescriberId: string;
  patientName?: string;
  onSuccess?: () => void;
}

export default function DietUpload({ 
  patientId, 
  prescriberId, 
  patientName,
  onSuccess 
}: DietUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (file.type !== 'application/pdf') {
      toast.error('❌ Selecione um arquivo PDF');
      return;
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('❌ PDF muito grande. Máximo: 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1. Upload para Firebase Storage
      const storageRef = ref(
        storage,
        `prescribers/${prescriberId}/patients/${patientId}/diets/${Date.now()}-${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      // 2. Monitorar progresso
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Erro no upload:', error);
            reject(error);
          },
          () => resolve(null)
        );
      });

      // 3. Obter URL pública
      const url = await getDownloadURL(uploadTask.snapshot.ref);

      toast.success('✅ PDF enviado! Processando...');

      // 4. Chamar N8N para transcrição
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL;

      if (!n8nUrl) {
        throw new Error('Configure NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL no Vercel');
      }

      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl: url,
          patientId: patientId,
          patientName: patientName || 'Paciente'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `✅ Dieta transcrita!\n\n` +
          `📊 ${result.totalCalorias || 0} kcal/dia\n` +
          `🍽️ ${result.totalRefeicoes || 0} refeições\n` +
          `🥗 ${result.totalAlimentos || 0} alimentos`,
          { duration: 5000 }
        );
        
        onSuccess?.();
      } else {
        throw new Error(result.message || 'Erro ao transcrever');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
      <label className="cursor-pointer block">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="text-6xl">⏳</div>
            <div className="text-xl font-semibold text-gray-700">
              Processando... {uploadProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Aguarde enquanto a IA analisa o PDF...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-6xl">📄</div>
            <div className="text-xl font-semibold text-gray-800">
              Upload PDF de Dieta
            </div>
            <p className="text-sm text-gray-500">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-gray-400">
              Máximo: 10MB | Formato: PDF
            </p>
          </div>
        )}
      </label>
    </div>
  );
}
```

---

### **PASSO 2: Adicionar na Página do Paciente (5 min)**

Editar: `frontend/src/app/(dashboard)/patients/[patientId]/page.tsx`

Adicionar no local apropriado (sugestão: na aba "Plano Alimentar"):

```typescript
import DietUpload from './components/DietUpload';

// ...dentro do componente...

<div className="space-y-6">
  <h2 className="text-2xl font-bold">Plano Alimentar</h2>
  
  {/* Upload de PDF de Dieta */}
  <DietUpload
    patientId={patientId}
    prescriberId={user.uid}
    patientName={patient?.name}
    onSuccess={() => {
      // Recarregar dados do paciente
      fetchPatientData();
    }}
  />
  
  {/* Exibir dieta atual (se houver) */}
  {dietPlan && (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">{dietPlan.name}</h3>
      <p className="text-gray-600 mb-4">{dietPlan.description}</p>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {dietPlan.dailyCalories}
          </div>
          <div className="text-sm text-gray-500">kcal/dia</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {dietPlan.dailyProtein}g
          </div>
          <div className="text-sm text-gray-500">Proteínas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {dietPlan.dailyCarbs}g
          </div>
          <div className="text-sm text-gray-500">Carboidratos</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {dietPlan.dailyFats}g
          </div>
          <div className="text-sm text-gray-500">Gorduras</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold">Refeições ({dietPlan.meals?.length || 0})</h4>
        {dietPlan.meals?.map((meal, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{meal.nome}</div>
                <div className="text-sm text-gray-500">{meal.horario}</div>
              </div>
              {meal.macros && (
                <div className="text-sm text-gray-600">
                  {meal.macros.calorias} kcal
                </div>
              )}
            </div>
            
            {meal.alimentos && (
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {meal.alimentos.map((alimento, i) => (
                  <li key={i}>
                    • {alimento.nome} - {alimento.quantidade}{alimento.unidade}
                    {alimento.observacao && (
                      <span className="text-gray-400 ml-2">({alimento.observacao})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
```

---

### **PASSO 3: Configurar Variável de Ambiente (2 min)**

**No Vercel:**

1. Acessar: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicionar variável:
   - **Name:** `NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL`
   - **Value:** `https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet`
   - **Environment:** Production, Preview, Development
3. Clicar "Save"
4. Fazer **Redeploy** do projeto

---

### **PASSO 4: Verificar Workflow N8N (3 min)**

**Acessar N8N:**

1. URL: https://n8n-production-3eae.up.railway.app
2. Login
3. Verificar se workflow "NutriBuddy - Processar Dieta PDF" está **ATIVO** ✅
4. Copiar URL do webhook (deve ser a mesma do passo 3)
5. Verificar credenciais OpenAI configuradas

---

### **PASSO 5: Testar (10 min)**

**Teste Completo:**

1. ✅ Login como prescritor no frontend
2. ✅ Abrir página de um paciente
3. ✅ Ir na aba "Plano Alimentar"
4. ✅ Fazer upload de um PDF de dieta
5. ✅ Aguardar mensagem de sucesso (~30s)
6. ✅ Verificar se dieta aparece na tela
7. ✅ Verificar no Firestore:
   - Collection: `dietPlans`
   - Filtrar por `patientId`
   - Ver documento criado

**Se der erro:**
- Ver console do navegador (F12)
- Ver logs do N8N
- Ver logs do backend Railway

---

## 🧪 TESTE RÁPIDO (sem frontend)

Se quiser testar o fluxo N8N → Backend antes de criar o frontend:

```bash
# 1. Fazer upload manual de um PDF de dieta no Firebase Storage
# 2. Obter URL pública
# 3. Chamar webhook N8N:

curl -X POST https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://firebasestorage.googleapis.com/.../dieta.pdf",
    "patientId": "ID_DO_PACIENTE",
    "patientName": "João Silva"
  }'

# 4. Aguardar 30s
# 5. Verificar no Firestore se salvou
```

---

## 🐛 TROUBLESHOOTING

### **Erro: "Configure NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL"**

**Solução:**
1. Adicionar variável no Vercel
2. Fazer redeploy
3. Limpar cache do navegador

---

### **Erro: "Invalid or missing webhook secret"**

**Solução:**
- Verificar se workflow N8N está enviando header `X-Webhook-Secret: nutribuddy-secret-2024`
- Verificar no node "Salvar no Backend/Firestore" do workflow

---

### **Erro: "Paciente não encontrado"**

**Solução:**
- Verificar se `patientId` está correto
- Paciente deve existir em `users/{patientId}` ou `patients/{patientId}`

---

### **PDF não é transcrito (fica em "Processando...")**

**Solução:**
1. Ver logs do N8N (abrir workflow → Executions)
2. Verificar se GPT-4o respondeu
3. Verificar se PDF tem texto (não pode ser imagem pura)
4. Testar com outro PDF

---

### **Calorias estão aproximadas (ex: 1800 ao invés de 1790.36)**

**Solução:**
- Ver prompt do GPT-4o no workflow
- Verificar se está usando `temperature: 0.1`
- Ver resposta raw do GPT-4o nos logs

---

## 📊 CHECKLIST FINAL

### **Backend**
- [x] Endpoint `/api/n8n/update-diet-complete` existe
- [x] Webhook secret configurado
- [x] Collection `dietPlans` criada
- [x] Índices configurados

### **N8N**
- [x] Workflow importado
- [ ] Workflow ATIVO ✅
- [ ] Credenciais OpenAI configuradas
- [ ] URL do webhook copiada

### **Frontend**
- [ ] Componente `DietUpload.tsx` criado
- [ ] Adicionado na página do paciente
- [ ] Variável `NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL` configurada no Vercel
- [ ] Deploy feito

### **Teste**
- [ ] Upload de PDF funciona
- [ ] Transcrição completa (30s)
- [ ] Dieta salva no Firestore
- [ ] Dieta aparece na UI
- [ ] Calorias EXATAS
- [ ] Refeições completas
- [ ] Alimentos com quantidades

---

## 🎉 PRONTO!

Após seguir todos os passos, você terá:

✅ Upload de PDF de dieta no frontend  
✅ Transcrição automática com GPT-4o Vision  
✅ Precisão cirúrgica (valores exatos)  
✅ Salvamento estruturado no Firestore  
✅ Visualização da dieta na UI  
✅ Sistema de versionamento automático  

**Tempo total:** ~1 hora  
**Custo por PDF:** ~$0.01-0.02 USD  

---

**Criado em:** 17 de novembro de 2024  
**Sistema:** NutriBuddy - Upload e Transcrição de Dieta PDF

