# 🥗 NutriBuddy Frontend

Frontend moderno e completo para a plataforma NutriBuddy, construído com Next.js 14, TypeScript e Tailwind CSS.

## 🎯 Status da Implementação

### ✅ Completado

#### Infraestrutura Base
- [x] Projeto Next.js 14 com TypeScript
- [x] Tailwind CSS configurado
- [x] Firebase SDK integrado (Auth, Firestore, Storage)
- [x] React Query para cache e estado
- [x] Zustand para estado global
- [x] Estrutura de pastas organizada

#### Autenticação
- [x] Context de autenticação
- [x] Login com email/senha
- [x] Login com Google
- [x] Registro de usuários
- [x] Proteção de rotas
- [x] Persistência de sessão

#### Layout e UI
- [x] Sidebar responsiva com navegação
- [x] Header com perfil e notificações
- [x] Componentes UI reutilizáveis (Button, Card, Input, ProgressBar)
- [x] Layout do dashboard protegido
- [x] Design moderno e responsivo

#### Dashboard Principal
- [x] Resumo diário de calorias
- [x] Cards de macronutrientes
- [x] Progresso de hidratação e exercícios
- [x] Timer de jejum
- [x] Últimas refeições (mock data)
- [x] Quick actions
- [x] Balanço calórico

#### Backend (API)
- [x] Endpoints de refeições (`/api/meals`)
- [x] Endpoints de água (`/api/water`)
- [x] Endpoints de exercícios (`/api/exercises`)
- [x] Endpoints de metas (`/api/goals`)
- [x] Upload de imagens para Firebase Storage
- [x] Análise de IA (estrutura pronta, mock data)

### ⏳ Pendente

#### Módulos Frontend
- [ ] Módulo de Refeições completo
- [ ] Módulo de Controle de Água
- [ ] Módulo de Metas Nutricionais
- [ ] Módulo de Exercícios
- [ ] Módulo de Medidas Corporais
- [ ] Chat com Assistente IA
- [ ] Módulo de Receitas
- [ ] Módulo de Relatórios com gráficos
- [ ] Módulo de Jejum Intermitente
- [ ] Módulo de Glicemia (Freestyle Libre)
- [ ] Clube de Benefícios
- [ ] Módulo de Configurações

#### Integrações
- [ ] Google AI Studio para análise de alimentos
- [ ] Strava API
- [ ] Freestyle Libre
- [ ] Sincronização com WhatsApp

#### Features Avançadas
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Service Worker
- [ ] Modo offline
- [ ] Testes end-to-end

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+
- Backend NutriBuddy rodando (porta 3000)
- Credenciais do Firebase configuradas

### Instalação

```bash
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais
```

### Desenvolvimento

```bash
# Rodar o servidor de desenvolvimento
npm run dev

# O frontend estará disponível em http://localhost:3001
```

### Build de Produção

```bash
# Criar build otimizada
npm run build

# Rodar build de produção
npm start
```

## 📁 Estrutura do Projeto

```
frontend/
├── app/
│   ├── (dashboard)/          # Rotas protegidas
│   │   ├── layout.tsx       # Layout com Sidebar + Header
│   │   ├── dashboard/       # Dashboard principal ✅
│   │   ├── meals/           # Refeições (a implementar)
│   │   ├── exercises/       # Exercícios (a implementar)
│   │   ├── water/           # Água (a implementar)
│   │   ├── goals/           # Metas (a implementar)
│   │   ├── measurements/    # Medidas (a implementar)
│   │   ├── chat/            # Chat IA (a implementar)
│   │   ├── recipes/         # Receitas (a implementar)
│   │   ├── reports/         # Relatórios (a implementar)
│   │   ├── fasting/         # Jejum (a implementar)
│   │   ├── glucose/         # Glicemia (a implementar)
│   │   ├── benefits/        # Benefícios (a implementar)
│   │   └── settings/        # Configurações (a implementar)
│   ├── login/               # Login ✅
│   ├── register/            # Registro ✅
│   ├── layout.tsx           # Root layout ✅
│   ├── page.tsx             # Home ✅
│   └── providers.tsx        # Providers ✅
├── components/
│   ├── ui/                  # Componentes UI ✅
│   ├── Sidebar.tsx          # Sidebar ✅
│   └── Header.tsx           # Header ✅
├── context/
│   └── AuthContext.tsx      # Autenticação ✅
├── hooks/
│   └── useProtectedRoute.ts # Proteção de rotas ✅
├── lib/
│   ├── firebase.ts          # Firebase config ✅
│   ├── api.ts               # Cliente API ✅
│   └── utils.ts             # Utilitários ✅
├── store/
│   └── useStore.ts          # Estado global ✅
├── types/
│   └── index.ts             # TypeScript types ✅
└── .env.local.example       # Template de variáveis ✅
```

## 🔧 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utilitária
- **Firebase** - Auth, Firestore, Storage
- **React Query** - Cache e sincronização de estado
- **Zustand** - Estado global leve
- **Lucide React** - Ícones modernos
- **Sonner** - Notificações toast
- **Date-fns** - Manipulação de datas
- **Recharts** - Gráficos (a integrar)
- **Axios** - Cliente HTTP

## 📡 API

O frontend se comunica com o backend através de `lib/api.ts`:

```typescript
import { mealsAPI, waterAPI, exercisesAPI, goalsAPI } from '@/lib/api';

// Exemplo: Buscar refeições
const { data } = await mealsAPI.getAll({ date: '2024-01-01' });

// Exemplo: Adicionar água
await waterAPI.add(250); // 250ml
```

Todos os endpoints exigem autenticação via Firebase token.

## 🎨 Componentes UI

### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" loading={false}>
  Salvar
</Button>
```

**Variants:** primary, secondary, outline, ghost, danger  
**Sizes:** sm, md, lg

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
</Card>
```

### ProgressBar

```tsx
import { ProgressBar } from '@/components/ui/ProgressBar';

<ProgressBar
  value={150}
  max={200}
  label="Proteína (g)"
  color="blue"
  showPercentage={true}
/>
```

**Colors:** emerald, blue, red, yellow

### Input

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error="Campo obrigatório"
/>
```

## 🔐 Autenticação

### Hook useAuth

```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, signInWithGoogle } = useAuth();

  // Login
  await signIn('email@example.com', 'password');

  // Login com Google
  await signInWithGoogle();

  // Logout
  await signOut();
}
```

### Proteção de Rotas

```tsx
'use client';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function ProtectedPage() {
  const { user, loading } = useProtectedRoute();
  
  if (loading) return <div>Carregando...</div>;
  
  return <div>Conteúdo protegido</div>;
}
```

## 🌐 Estado Global (Zustand)

```tsx
import { useStore } from '@/store/useStore';

function WaterTracker() {
  const { waterIntakeToday, addWater, resetWater } = useStore();

  return (
    <button onClick={() => addWater(250)}>
      Adicionar 250ml ({waterIntakeToday}ml hoje)
    </button>
  );
}
```

**Estado disponível:**
- `theme` - Tema claro/escuro
- `sidebarOpen` - Estado da sidebar
- `selectedDate` - Data selecionada
- `waterIntakeToday` - Água consumida hoje
- `fastingActive` - Jejum ativo
- `notifications` - Lista de notificações

## 📊 React Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { mealsAPI } from '@/lib/api';

function MealsList() {
  // Buscar dados
  const { data, isLoading } = useQuery({
    queryKey: ['meals', date],
    queryFn: () => mealsAPI.getAll({ date }),
  });

  // Mutar dados
  const createMeal = useMutation({
    mutationFn: mealsAPI.create,
    onSuccess: () => {
      // Invalidar cache
      queryClient.invalidateQueries(['meals']);
    },
  });

  return <div>...</div>;
}
```

## 🎯 Próximos Passos para Implementação

### 1. Módulo de Refeições (Prioridade Alta)

Criar `app/(dashboard)/meals/page.tsx`:

```tsx
- Lista de refeições do dia
- Botão para adicionar nova refeição
- Modal com upload de foto
- Análise de IA da foto
- Edição manual de nutrientes
- Histórico de refeições
```

### 2. Módulo de Água (Prioridade Alta)

Criar `app/(dashboard)/water/page.tsx`:

```tsx
- Progresso visual de hidratação
- Botões rápidos (100ml, 250ml, 500ml)
- Histórico diário
- Gráfico semanal
- Lembretes configuráveis
```

### 3. Módulo de Exercícios

Criar `app/(dashboard)/exercises/page.tsx`:

```tsx
- Lista de exercícios do dia
- Adicionar exercício manual
- Sincronização com Strava
- Calorias queimadas
- Histórico e gráficos
```

### 4. Chat com IA

Criar `app/(dashboard)/chat/page.tsx`:

```tsx
- Interface de chat estilo WhatsApp
- Upload de fotos no chat
- Histórico de conversas
- Sugestões contextuais
- Integração com backend
```

### 5. Relatórios

Criar `app/(dashboard)/reports/page.tsx`:

```tsx
- Gráficos com Recharts
- Evolução de peso
- Macronutrientes semanais
- Balanço calórico
- Exportar PDF
```

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm test

# Testes E2E
npm run test:e2e
```

## 📱 PWA (A Implementar)

Para transformar em PWA:

1. Adicionar `manifest.json`
2. Configurar Service Worker
3. Implementar cache de assets
4. Adicionar ícones para instalação
5. Configurar notificações push

## 🤝 Contribuindo

1. Escolha um módulo pendente
2. Crie os arquivos necessários
3. Implemente a funcionalidade
4. Teste localmente
5. Commit e push

## 📝 Notas Importantes

- **Backend:** Deve estar rodando em `http://localhost:3000`
- **Frontend:** Roda em `http://localhost:3001`
- **Autenticação:** Todos os endpoints exigem token Firebase
- **Storage:** Imagens vão para Firebase Storage
- **Database:** Firestore para dados estruturados

## 🔗 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ para NutriBuddy**
