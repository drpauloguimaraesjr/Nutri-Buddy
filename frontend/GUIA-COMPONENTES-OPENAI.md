# 🎨 Guia de Uso - Componentes Estilo OpenAI

## Visão Geral

Este guia mostra como usar os novos componentes com estética inspirada no OpenAI Platform.

---

## 🎯 Componentes de Tabela

### Uso Básico

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  TableBadge,
} from '@/components/ui/Table';

export default function PatientsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>João Silva</TableCell>
          <TableCell>joao@email.com</TableCell>
          <TableCell>
            <TableBadge variant="success">Ativo</TableBadge>
          </TableCell>
          <TableCell>
            <TableActions
              onEdit={() => console.log('Edit')}
              onDelete={() => console.log('Delete')}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### TableBadge Variants

```tsx
<TableBadge variant="default">Padrão</TableBadge>
<TableBadge variant="success">Sucesso</TableBadge>
<TableBadge variant="warning">Aviso</TableBadge>
<TableBadge variant="error">Erro</TableBadge>
<TableBadge variant="info">Info</TableBadge>
```

---

## 📭 Empty States

### Empty State Padrão

```tsx
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function NoPatients() {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum paciente cadastrado"
      description="Você ainda não tem pacientes cadastrados. Comece adicionando seu primeiro paciente."
      action={{
        label: 'Adicionar Paciente',
        onClick: () => console.log('Add patient'),
      }}
    />
  );
}
```

### Chat Empty State

```tsx
import { ChatEmptyState } from '@/components/ui/EmptyState';

export default function ChatEmpty() {
  return (
    <ChatEmptyState
      title="Como posso ajudá-lo hoje?"
      suggestions={[
        'Como melhorar minha alimentação?',
        'Criar um plano de refeições',
        'Calcular calorias diárias',
        'Sugestões de exercícios',
      ]}
      onSuggestionClick={(suggestion) => {
        console.log('Clicked:', suggestion);
      }}
    />
  );
}
```

---

## 🔘 Botões

### Variantes

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="default">Padrão (Primary)</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destrutivo</Button>
<Button variant="link">Link</Button>
```

### Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="xl">Extra Grande</Button>
<Button size="icon">
  <IconComponent />
</Button>
```

### Com Loading

```tsx
<Button loading={isLoading}>
  Salvar
</Button>
```

---

## 📝 Inputs

### Input Básico

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Nome"
  placeholder="Digite seu nome"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Input com Ícone

```tsx
import { Mail } from 'lucide-react';

<Input
  label="Email"
  icon={<Mail className="w-4 h-4" />}
  placeholder="seu@email.com"
  type="email"
/>
```

### Input com Erro

```tsx
<Input
  label="Senha"
  type="password"
  error="A senha deve ter no mínimo 8 caracteres"
/>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/Input';

<Textarea
  label="Descrição"
  placeholder="Digite uma descrição..."
  rows={5}
/>
```

### Select

```tsx
import { Select } from '@/components/ui/Input';

<Select
  label="Categoria"
  options={[
    { value: 'cafe', label: 'Café da Manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
  ]}
/>
```

---

## 🎨 Classes Utilitárias CSS

### Cards

```tsx
// Card com estilo dark
<div className="card-dark p-6">
  Conteúdo do card
</div>

// Surface elevada
<div className="surface-dark p-4">
  Conteúdo da surface
</div>
```

### Botões (CSS puro)

```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-icon">
  <Icon />
</button>
```

### Inputs (CSS puro)

```tsx
<input className="input-dark" placeholder="Digite algo..." />
```

### Texto

```tsx
<p className="text-secondary">Texto secundário</p>
<p className="text-muted">Texto discreto</p>
<h1 className="text-gradient">Texto com gradiente</h1>
```

### Animações

```tsx
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-in">Slide in</div>
```

---

## 🎭 Sidebar

A nova sidebar já está organizada por seções no estilo OpenAI:

- **Create**: Chat IA, Refeições, Receitas
- **Manage**: Dashboard, Exercícios, Hidratação, etc.
- **Optimize**: Metas, Relatórios, Benefícios

### Adicionar novo item

Edite `/components/Sidebar.tsx`:

```tsx
const menuSections = [
  {
    title: 'Create',
    items: [
      {
        title: 'Novo Item',
        icon: IconComponent,
        href: '/novo-item',
      },
      // ... outros itens
    ],
  },
  // ... outras seções
];
```

---

## 🎨 Paleta de Cores

### Variáveis CSS disponíveis

```css
/* Backgrounds */
--background: 0 0% 4%;        /* #0A0A0A */
--card: 0 0% 9%;              /* #171717 */
--secondary: 0 0% 15%;        /* #262626 */
--surface: 0 0% 15%;          /* #262626 */

/* Text */
--foreground: 0 0% 100%;      /* #FFFFFF */
--text-secondary: 0 0% 64%;   /* #A3A3A3 */
--text-muted: 0 0% 45%;       /* #737373 */

/* Borders */
--border: 0 0% 15%;           /* #262626 */
--border-hover: 0 0% 25%;     /* #404040 */

/* Actions */
--primary: 160 84% 39%;       /* #10B981 */
--destructive: 0 84% 60%;     /* #EF4444 */
```

### Usando no Tailwind

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-foreground">Título</h1>
  <p className="text-muted-foreground">Subtítulo</p>
  <div className="border border-border hover:border-border-hover">
    Card com hover
  </div>
</div>
```

---

## 📊 Exemplo Completo: Página de Pacientes

```tsx
'use client';

import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  TableBadge,
} from '@/components/ui/Table';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);

  if (patients.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Users}
          title="Nenhum paciente cadastrado"
          description="Você ainda não tem pacientes. Comece adicionando seu primeiro paciente para começar a acompanhar sua evolução."
          action={{
            label: 'Adicionar Primeiro Paciente',
            onClick: () => console.log('Add patient'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seus pacientes e acompanhe o progresso
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Paciente
        </Button>
      </div>

      {/* Table */}
      <div className="card-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Consulta</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.phone}
                </TableCell>
                <TableCell>
                  <TableBadge variant={patient.active ? 'success' : 'default'}>
                    {patient.active ? 'Ativo' : 'Inativo'}
                  </TableBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.lastConsult}
                </TableCell>
                <TableCell>
                  <TableActions
                    onEdit={() => console.log('Edit', patient.id)}
                    onDelete={() => console.log('Delete', patient.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## 🚀 Dicas de Uso

1. **Consistência**: Sempre use os componentes e classes utilitárias do design system
2. **Espaçamento**: Use múltiplos de 4 (p-4, gap-6, space-y-4)
3. **Animações**: Use motion do Framer Motion para transições suaves
4. **Acessibilidade**: Sempre adicione `aria-label` em botões de ícone
5. **Dark Mode**: Todos os componentes já suportam dark mode automaticamente
6. **Performance**: Use `React.memo` em componentes de tabela com muitos itens

---

## 📦 Exportações Disponíveis

```tsx
// Tabela
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActions,
  TableBadge,
} from '@/components/ui/Table';

// Empty States
import EmptyState, { ChatEmptyState } from '@/components/ui/EmptyState';

// Forms
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

// Outros
import { Card } from '@/components/ui/Card';
import Sidebar from '@/components/Sidebar';
```

---

## 🎯 Próximos Passos

1. Aplicar os novos componentes nas páginas existentes
2. Criar modals com a nova estética
3. Implementar loading states consistentes
4. Adicionar mais variantes de componentes conforme necessário

