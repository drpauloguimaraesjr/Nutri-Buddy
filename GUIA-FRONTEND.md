# 🎨 NutriBuddy Frontend - Guia Completo

## 📦 Estrutura do Projeto

```
frontend/
├── app/
│   ├── (dashboard)/          # Dashboard e módulos protegidos
│   │   ├── layout.tsx       # Layout com Sidebar + Header
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── meals/          # Módulo de Refeições
│   │   ├── exercises/      # Módulo de Exercícios
│   │   ├── measurements/   # Módulo de Medidas
│   │   ├── water/          # Módulo de Água
│   │   ├── goals/          # Módulo de Metas
│   │   ├── chat/           # Chat com IA
│   │   ├── recipes/        # Receitas
│   │   ├── reports/        # Relatórios
│   │   ├── fasting/        # Jejum
│   │   ├── glucose/        # Glicemia
│   │   ├── benefits/       # Clube de Benefícios
│   │   └── settings/       # Configurações
│   ├── login/              # Página de login
│   ├── register/           # Página de registro
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redireciona)
│   └── providers.tsx       # Providers (Auth, React Query)
├── components/
│   ├── ui/                 # Componentes UI reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ProgressBar.tsx
│   ├── Sidebar.tsx         # Sidebar de navegação
│   └── Header.tsx          # Header com perfil
├── context/
│   └── AuthContext.tsx     # Context de autenticação
├── hooks/
│   └── useProtectedRoute.ts # Hook para rotas protegidas
├── lib/
│   ├── firebase.ts         # Config Firebase
│   ├── api.ts             # Cliente API
│   └── utils.ts           # Utilitários
├── store/
│   └── useStore.ts        # Zustand store
├── types/
│   └── index.ts           # TypeScript types
└── .env.local             # Variáveis de ambiente
```

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=SUA_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutribuddy-2fc9c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutribuddy-2fc9c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutribuddy-2fc9c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=225946487395
NEXT_PUBLIC_FIREBASE_APP_ID=1:225946487395:web:d14ef325c8970061aa4656
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MB7VG6TFXN
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Rodar o Backend

Em outro terminal:

```bash
cd ..
npm run dev
```

Backend rodará em `http://localhost:3000`

### 4. Rodar o Frontend

```bash
npm run dev
```

Frontend rodará em `http://localhost:3001`

## 📱 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email/senha
- Login com Google
- Registro de novos usuários
- Recuperação de senha
- Proteção de rotas

### ✅ Dashboard
- Resumo diário de calorias e macros
- Progresso de metas
- Balanço calórico
- Quick actions
- Timer de jejum
- Últimas refeições

### ✅ Layout
- Sidebar responsiva
- Header com perfil
- Navegação entre módulos
- Design moderno e clean

## 🔧 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Firebase** - Auth, Firestore, Storage
- **React Query** - Cache e estado de servidor
- **Zustand** - Estado global
- **Lucide React** - Ícones
- **Sonner** - Notificações toast
- **Date-fns** - Manipulação de datas
- **Recharts** - Gráficos
- **Axios** - Cliente HTTP

## 📡 Integração com Backend

Todas as chamadas de API são feitas através de `lib/api.ts`:

```typescript
import { mealsAPI } from '@/lib/api';

// Buscar refeições
const meals = await mealsAPI.getAll({ date: '2024-01-01' });

// Criar refeição
await mealsAPI.create(mealData);

// Upload de imagem
await mealsAPI.upload(formData);
```

## 🎨 Componentes UI

### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Salvar
</Button>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### ProgressBar
```tsx
<ProgressBar
  value={150}
  max={200}
  label="Proteína"
  color="blue"
/>
```

## 🔐 Autenticação

### Usar hook useAuth
```tsx
const { user, signIn, signOut } = useAuth();

await signIn('email@example.com', 'password');
await signOut();
```

### Proteger rotas
```tsx
'use client';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function ProtectedPage() {
  const { user, loading } = useProtectedRoute();
  // ...
}
```

## 📊 Estado Global (Zustand)

```tsx
import { useStore } from '@/store/useStore';

const { waterIntakeToday, addWater } = useStore();

// Adicionar 250ml de água
addWater(250);
```

## 🎯 Próximos Passos

1. Implementar módulos restantes:
   - ✅ Dashboard
   - ⏳ Refeições (com IA)
   - ⏳ Água
   - ⏳ Exercícios
   - ⏳ Medidas
   - ⏳ Metas
   - ⏳ Chat IA
   - ⏳ Receitas
   - ⏳ Relatórios
   - ⏳ Jejum
   - ⏳ Glicemia
   - ⏳ Benefícios

2. Integrar IA (Google AI Studio)
3. Integrar Strava
4. Integrar Freestyle Libre
5. PWA e notificações push
6. Testes end-to-end

## 📝 Notas

- O frontend está configurado para rodar na porta 3001
- O backend deve estar rodando na porta 3000
- Todos os módulos usam autenticação Firebase
- Os dados são salvos no Firestore
- Imagens são armazenadas no Firebase Storage

