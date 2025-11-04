# 🔄 Guia de Migração - Estilo OpenAI

Este guia ajuda a migrar páginas existentes do estilo glassmorphism para o novo estilo OpenAI dark premium.

---

## 📋 Checklist de Migração

Para cada página, siga esta ordem:

- [ ] Atualizar classes de layout e containers
- [ ] Substituir componentes Card antigos
- [ ] Atualizar Botões
- [ ] Atualizar Inputs e Forms
- [ ] Adicionar Empty States
- [ ] Converter Tabelas (se houver)
- [ ] Ajustar cores e textos
- [ ] Testar responsividade
- [ ] Verificar acessibilidade

---

## 🎨 Substituições de Classes

### Containers e Layouts

| Antigo | Novo |
|--------|------|
| `glass-card` | `card-dark` |
| `glass-strong` | `surface-dark` |
| `glass-subtle` | `bg-secondary border border-border` |
| `text-gray-900` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted` |

### Botões

| Antigo | Novo |
|--------|------|
| `bg-gradient-to-r from-purple-600 to-pink-600` | `<Button variant="default">` |
| `glass-button` | `<Button variant="secondary">` |
| `border-2 border-white/30 glass-subtle` | `<Button variant="outline">` |

### Inputs

```tsx
// ❌ Antigo
<input className="glass-subtle rounded-xl px-4 py-2" />

// ✅ Novo
<Input />
// ou
<input className="input-dark" />
```

### Cards

```tsx
// ❌ Antigo
<div className="glass-card p-6 rounded-2xl">
  Conteúdo
</div>

// ✅ Novo
<div className="card-dark p-6">
  Conteúdo
</div>
```

---

## 📄 Exemplos de Migração

### Exemplo 1: Página de Dashboard

#### Antes (Glassmorphism)

```tsx
export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold text-gray-900">Total Calorias</h3>
          <p className="text-3xl font-bold text-gradient-emerald mt-2">2.450</p>
        </div>
      </div>
    </div>
  );
}
```

#### Depois (OpenAI Style)

```tsx
export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da sua jornada nutricional
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="card-dark p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Calorias</h3>
          <p className="text-3xl font-semibold text-foreground mt-2">2.450</p>
          <p className="text-xs text-primary mt-1">↑ 12% vs. ontem</p>
        </div>
      </div>
    </div>
  );
}
```

### Exemplo 2: Formulário

#### Antes

```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nome
    </label>
    <input
      type="text"
      className="glass-subtle rounded-xl px-4 py-2 w-full"
      placeholder="Digite seu nome"
    />
  </div>
  
  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl">
    Salvar
  </button>
</form>
```

#### Depois

```tsx
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

<form className="space-y-4">
  <Input
    label="Nome"
    placeholder="Digite seu nome"
  />
  
  <Button className="w-full">
    Salvar
  </Button>
</form>
```

### Exemplo 3: Lista de Itens

#### Antes

```tsx
<div className="glass-card p-6 rounded-2xl">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Refeições</h2>
  
  {meals.length === 0 ? (
    <p className="text-gray-500 text-center py-8">
      Nenhuma refeição registrada
    </p>
  ) : (
    <div className="space-y-3">
      {meals.map(meal => (
        <div key={meal.id} className="glass-subtle p-4 rounded-lg flex justify-between">
          <span className="text-gray-900">{meal.name}</span>
          <span className="text-gray-600">{meal.calories} kcal</span>
        </div>
      ))}
    </div>
  )}
</div>
```

#### Depois

```tsx
import { Utensils } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

<div className="card-dark p-6">
  <h2 className="text-lg font-semibold text-foreground mb-4">Refeições</h2>
  
  {meals.length === 0 ? (
    <EmptyState
      icon={Utensils}
      title="Nenhuma refeição registrada"
      description="Comece registrando sua primeira refeição para acompanhar suas calorias."
      action={{
        label: 'Adicionar Refeição',
        onClick: () => setShowModal(true),
      }}
    />
  ) : (
    <div className="space-y-2">
      {meals.map(meal => (
        <div
          key={meal.id}
          className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors flex justify-between"
        >
          <span className="text-sm font-medium text-foreground">{meal.name}</span>
          <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
        </div>
      ))}
    </div>
  )}
</div>
```

### Exemplo 4: Tabela de Dados

#### Antes

```tsx
<div className="glass-card p-6 rounded-2xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/20">
        <th className="text-left p-3 text-gray-700">Nome</th>
        <th className="text-left p-3 text-gray-700">Status</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-white/10 hover:bg-white/20">
          <td className="p-3 text-gray-900">{item.name}</td>
          <td className="p-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-700 rounded-full text-sm">
              Ativo
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### Depois

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableBadge,
  TableActions,
} from '@/components/ui/Table';

<div className="card-dark">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <TableBadge variant="success">Ativo</TableBadge>
          </TableCell>
          <TableCell>
            <TableActions
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## 🎨 Padrões de Cores

### Texto

```tsx
// ❌ Evitar
<h1 className="text-gray-900">Título</h1>
<p className="text-gray-600">Subtítulo</p>
<span className="text-gray-500">Detalhes</span>

// ✅ Usar
<h1 className="text-foreground">Título</h1>
<p className="text-muted-foreground">Subtítulo</p>
<span className="text-muted">Detalhes</span>
```

### Backgrounds

```tsx
// ❌ Evitar
<div className="bg-white">
<div className="bg-gray-100">
<div className="bg-gray-200">

// ✅ Usar
<div className="bg-background">
<div className="bg-card">
<div className="bg-secondary">
```

### Borders

```tsx
// ❌ Evitar
<div className="border border-gray-200">
<div className="border-2 border-white/30">

// ✅ Usar
<div className="border border-border">
<div className="border border-border hover:border-border-hover">
```

---

## 🚀 Scripts de Migração

### Buscar e Substituir (VSCode)

Use Find & Replace (Cmd/Ctrl + Shift + H) com regex:

1. **Glass cards para card-dark**
   - Buscar: `glass-card`
   - Substituir: `card-dark`

2. **Cores de texto**
   - Buscar: `text-gray-900`
   - Substituir: `text-foreground`
   
   - Buscar: `text-gray-600`
   - Substituir: `text-muted-foreground`

3. **Backgrounds**
   - Buscar: `bg-white(?!/)`
   - Substituir: `bg-background`

---

## 📋 Checklist por Página

### `/dashboard`
- [ ] Atualizar cards de estatísticas
- [ ] Converter gráficos para nova paleta
- [ ] Atualizar botões de ação

### `/meals`
- [ ] Implementar empty state
- [ ] Converter lista de refeições
- [ ] Atualizar modal de adicionar

### `/patients` (prescriber)
- [ ] Converter tabela para novo componente
- [ ] Adicionar TableActions
- [ ] Implementar empty state

### `/chat`
- [x] Já atualizado! ✅

### `/exercises`
- [ ] Converter cards de exercícios
- [ ] Atualizar formulários
- [ ] Adicionar empty state

### `/water`
- [ ] Atualizar indicador de progresso
- [ ] Converter botões de ação

### `/fasting`
- [ ] Atualizar timer visual
- [ ] Converter controles

### `/glucose`
- [ ] Atualizar tabela de leituras
- [ ] Converter gráfico

### `/measurements`
- [ ] Converter tabela
- [ ] Atualizar gráficos

### `/goals`
- [ ] Converter cards de metas
- [ ] Atualizar progress bars

### `/reports`
- [ ] Atualizar layout de relatórios
- [ ] Converter gráficos

### `/benefits`
- [ ] Converter cards de benefícios
- [ ] Atualizar layout de grid

---

## ⚠️ Avisos Importantes

1. **Dark Mode**: Todos os componentes já funcionam em dark mode por padrão
2. **Animações**: Remova `animate-gradient` e efeitos de glassmorphism muito pesados
3. **Performance**: Os novos componentes são mais leves
4. **Acessibilidade**: Sempre adicione labels e aria-labels apropriados
5. **Responsividade**: Teste em mobile após cada migração

---

## 🧪 Testando a Migração

Após migrar cada página:

1. ✅ Verificar visualmente a página
2. ✅ Testar todas as interações (botões, forms, etc.)
3. ✅ Verificar responsividade (mobile, tablet, desktop)
4. ✅ Testar estados vazios (empty states)
5. ✅ Verificar loading states
6. ✅ Checar acessibilidade (navegação por teclado)
7. ✅ Validar formulários
8. ✅ Testar dark mode (se aplicável)

---

## 💡 Dicas Finais

- Migre uma página por vez
- Teste cada migração antes de continuar
- Mantenha commits pequenos e descritivos
- Use o guia de componentes como referência
- Em caso de dúvida, consulte a página `/chat` como exemplo

---

## 🆘 Problemas Comuns

### Problema: Cores não aparecem corretas

**Solução**: Verifique se o elemento pai tem a classe `dark` ou se o dark mode está ativo:

```tsx
<html className="dark">
  {/* ... */}
</html>
```

### Problema: Animações não funcionam

**Solução**: Certifique-se de que o Framer Motion está instalado:

```bash
npm install framer-motion
```

### Problema: Componentes não encontrados

**Solução**: Verifique os imports e caminhos:

```tsx
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
```

---

## 📞 Próximos Passos

1. Escolha uma página para começar (recomendo começar por páginas simples)
2. Siga o checklist de migração
3. Teste completamente
4. Commit e continue para a próxima página
5. Ao final, faça uma revisão geral do design system

Boa migração! 🚀

