# 🚀 GUIA DE INTEGRAÇÃO: Frontend de Dieta PDF

## ✅ COMPONENTES CRIADOS

Todos os componentes foram criados e estão prontos para uso:

### **1. Tipos TypeScript**
```
📁 frontend/src/types/diet.ts
```
- Interfaces completas para estrutura de dados
- Type-safe em todo o código

### **2. Componentes React**
```
📁 frontend/src/components/diet/
├── DietUpload.tsx       # Upload de PDF com progresso
├── DietDisplay.tsx      # Visualização da dieta transcrita
├── DietHistory.tsx      # Histórico de dietas
├── DietTab.tsx          # Componente principal (integra tudo)
└── index.ts             # Exports
```

### **3. Hooks Personalizados**
```
📁 frontend/src/hooks/useDiet.ts
```
- Gerenciamento de estado
- Fetch de dieta atual e histórico
- Reativação de dietas

---

## 🎯 COMO INTEGRAR NA PÁGINA DO PACIENTE

### **OPÇÃO 1: Usar o DietTab (Recomendado)**

O componente `DietTab` já integra tudo (upload, visualização, histórico).

```typescript
// frontend/src/app/(dashboard)/patients/[patientId]/page.tsx

import { DietTab } from '@/components/diet';

export default function PatientPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;
  const prescriberId = user.uid; // Obter do contexto/auth
  const patientName = patient?.name; // Obter dos dados do paciente

  return (
    <div>
      {/* ... outras seções ... */}

      {/* Aba de Dieta & Treino */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Dieta & Treino</h2>
        
        <DietTab
          patientId={patientId}
          prescriberId={prescriberId}
          patientName={patientName}
        />
      </div>
    </div>
  );
}
```

### **OPÇÃO 2: Usar componentes separadamente**

Se preferir mais controle:

```typescript
import { useState } from 'react';
import { useDiet } from '@/hooks/useDiet';
import { DietUpload, DietDisplay, DietHistory } from '@/components/diet';

export default function PatientPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const {
    currentDiet,
    dietHistory,
    loading,
    refresh,
  } = useDiet({ patientId, autoLoad: true });

  return (
    <div>
      {/* Tabs */}
      <div className="border-b mb-6">
        <button onClick={() => setActiveTab('current')}>Dieta Atual</button>
        <button onClick={() => setActiveTab('history')}>Histórico</button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'current' && (
        <>
          {currentDiet ? (
            <DietDisplay dietPlan={currentDiet} />
          ) : (
            <DietUpload
              patientId={patientId}
              prescriberId={prescriberId}
              onSuccess={refresh}
            />
          )}
        </>
      )}

      {activeTab === 'history' && (
        <DietHistory
          history={dietHistory}
          currentDietId={currentDiet?.id}
          onSelectDiet={(diet) => console.log('Selected:', diet)}
        />
      )}
    </div>
  );
}
```

---

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### **1. Variável de Ambiente no Vercel**

Adicionar em: https://vercel.com/seu-projeto/settings/environment-variables

```env
NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL=https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-process-diet
```

**Ambientes:** Production, Preview, Development

**Depois de adicionar:** Fazer **Redeploy**

---

### **2. Verificar Imports**

Certifique-se que estes arquivos existem e estão configurados:

```typescript
// @/lib/firebase
export { storage, db } from './firebase-config';

// @/types/diet
// ✅ Já criado!

// lucide-react (instalar se necessário)
npm install lucide-react
// ou
yarn add lucide-react
```

---

### **3. Configurar Toast (react-hot-toast)**

Se ainda não tiver configurado:

```bash
npm install react-hot-toast
# ou
yarn add react-hot-toast
```

Adicionar no layout principal:

```typescript
// app/layout.tsx ou _app.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

---

## 🎨 PERSONALIZAÇÃO

### **Cores dos Macros**

Editar em `DietDisplay.tsx`:

```typescript
const getMacroColor = (type: 'protein' | 'carbs' | 'fats') => {
  const colors = {
    protein: 'text-blue-600 bg-blue-100',    // Azul
    carbs: 'text-orange-600 bg-orange-100',  // Laranja
    fats: 'text-green-600 bg-green-100',     // Verde
  };
  return colors[type];
};
```

### **Ícones das Refeições**

Editar em `DietDisplay.tsx`:

```typescript
const getMealIcon = (mealName: string) => {
  const name = mealName.toLowerCase();
  if (name.includes('café')) return '☕';
  if (name.includes('almoço')) return '🍽️';
  if (name.includes('lanche')) return '🍎';
  if (name.includes('jantar')) return '🌙';
  // ... adicionar mais
  return '🍴';
};
```

### **Tamanho Máximo do PDF**

Editar em `DietUpload.tsx`:

```typescript
const maxSize = 10 * 1024 * 1024; // 10MB
// Mudar para 20MB:
const maxSize = 20 * 1024 * 1024;
```

---

## 🧪 TESTES

### **Teste 1: Upload de PDF**

1. Login como prescritor
2. Abrir página de paciente
3. Ir na aba "Dieta & Treino"
4. Clicar em "Upload PDF da Dieta"
5. Selecionar PDF de dieta
6. Aguardar upload (barra de progresso)
7. Aguardar transcrição (~30-45s)
8. Ver toast de sucesso
9. Ver dieta exibida

### **Teste 2: Visualização**

1. Com dieta carregada
2. Verificar resumo executivo (calorias, macros)
3. Expandir/recolher refeições
4. Verificar alimentos e quantidades
5. Verificar substituições (se houver)
6. Verificar observações do nutricionista

### **Teste 3: Histórico**

1. Fazer upload de 2-3 PDFs diferentes
2. Ir na aba "Histórico"
3. Ver lista de dietas
4. Clicar em "Visualizar" em uma dieta antiga
5. Ver dieta antiga exibida
6. Clicar em "Reativar"
7. Ver dieta antiga se tornar ativa

---

## 🐛 TROUBLESHOOTING

### **Erro: "Cannot read property 'uid' of undefined"**

**Solução:** Certifique-se de obter o `prescriberId` do contexto de autenticação:

```typescript
import { useAuth } from '@/hooks/useAuth'; // ou seu hook de auth

const { user } = useAuth();
const prescriberId = user?.uid;
```

---

### **Erro: "NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL is not defined"**

**Solução:**
1. Adicionar variável no Vercel
2. Fazer redeploy
3. Limpar cache do navegador

---

### **Erro: "Failed to fetch"**

**Possíveis causas:**
1. N8N está offline
2. URL do webhook incorreta
3. CORS bloqueando

**Solução:**
- Verificar se N8N está no ar
- Testar webhook com cURL
- Ver logs do navegador (F12)

---

### **Dieta não aparece após upload**

**Solução:**
1. Verificar se transcrição foi bem-sucedida (ver logs N8N)
2. Verificar se dados foram salvos no Firestore
3. Forçar refresh: `await refresh()`
4. Verificar query Firestore (índices)

---

### **Erro: "Missing or insufficient permissions"**

**Solução:**
Adicionar regras Firestore:

```javascript
// firestore.rules
match /dietPlans/{planId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.patientId || 
     request.auth.token.role == 'prescriber');
  
  allow write: if false; // Apenas backend via N8N
}
```

---

## 📊 ESTRUTURA DE DADOS

### **Firestore: dietPlans/{id}**

```typescript
{
  patientId: string;
  name: string;
  description: string;
  meals: Refeicao[];
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  dailyCalories: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    meta: { ... },
    macronutrientes: { ... },
    micronutrientes: [ ... ],
    observacoes: [ ... ],
    substituicoes: [ ... ],
    resumo: { ... }
  }
}
```

### **Índices Necessários**

Criar no Firebase Console → Firestore → Indexes:

```
Collection: dietPlans
Fields:
  - patientId (Ascending)
  - isActive (Ascending)
  - createdAt (Descending)
```

---

## 🚀 DEPLOY

### **1. Build local para testar**

```bash
npm run build
# ou
yarn build
```

### **2. Deploy no Vercel**

```bash
# Se usando Vercel CLI
vercel deploy --prod

# Ou via Git
git add .
git commit -m "feat: add diet PDF upload and display"
git push origin main
```

### **3. Verificar após deploy**

- [ ] Variável ambiente configurada
- [ ] Build sem erros
- [ ] Componentes carregando
- [ ] Upload funcionando
- [ ] Transcrição funcionando
- [ ] Visualização funcionando

---

## ✅ CHECKLIST FINAL

### **Código**
- [x] Tipos TypeScript criados
- [x] Componentes React criados
- [x] Hooks personalizados criados
- [x] Imports corretos
- [x] Sem erros de TypeScript

### **Configuração**
- [ ] Variável `NEXT_PUBLIC_N8N_TRANSCRIBE_DIET_URL` no Vercel
- [ ] `lucide-react` instalado
- [ ] `react-hot-toast` configurado
- [ ] Firebase configurado
- [ ] Índices Firestore criados

### **Integração**
- [ ] Componente adicionado na página do paciente
- [ ] Props passados corretamente
- [ ] Auth funcionando
- [ ] Deploy feito

### **Testes**
- [ ] Upload de PDF funciona
- [ ] Transcrição completa
- [ ] Dieta exibida corretamente
- [ ] Histórico funciona
- [ ] Reativação funciona

---

## 🎉 PRONTO!

Depois de seguir este guia, você terá:

✅ Sistema completo de upload e transcrição de dieta  
✅ Visualização linda e funcional  
✅ Histórico de versões  
✅ Integração com N8N e GPT-4o Vision  
✅ Type-safe com TypeScript  

---

**Criado em:** 17 de novembro de 2024  
**Sistema:** NutriBuddy - Frontend de Dieta PDF  
**Componentes:** 4 componentes + 1 hook + tipos

