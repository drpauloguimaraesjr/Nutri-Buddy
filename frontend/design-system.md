# 🎨 NutriBuddy Design System - OpenAI Inspired

## Paleta de Cores - Dark Mode Premium

### Backgrounds
- **Primary Background**: `#0A0A0A` - Preto profundo principal
- **Secondary Background**: `#171717` - Sidebar e cards
- **Tertiary Background**: `#1F1F1F` - Hover states
- **Surface**: `#262626` - Elevated elements

### Text Colors
- **Primary Text**: `#FFFFFF` - Texto principal
- **Secondary Text**: `#A3A3A3` - Texto secundário
- **Muted Text**: `#737373` - Texto terciário/desabilitado
- **Placeholder**: `#525252` - Placeholders

### Borders
- **Border Default**: `#262626` - Bordas sutis
- **Border Hover**: `#404040` - Bordas em hover
- **Divider**: `#1F1F1F` - Divisores

### Action Colors
- **Primary**: `#10B981` - Verde (ações principais)
- **Primary Hover**: `#059669` - Verde hover
- **Destructive**: `#EF4444` - Vermelho (delete)
- **Warning**: `#F59E0B` - Amarelo (avisos)
- **Info**: `#3B82F6` - Azul (informação)

### Chart/Graph Colors
- **Blue**: `#60A5FA`
- **Purple**: `#C084FC`
- **Pink**: `#F472B6`
- **Green**: `#4ADE80`
- **Yellow**: `#FACC15`
- **Cyan**: `#22D3EE`

## Tipografia

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Espaçamento

Baseado em múltiplos de 4px:
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

## Border Radius

- **sm**: 6px - Inputs, small buttons
- **md**: 8px - Cards, buttons
- **lg**: 12px - Modals, large cards
- **full**: 9999px - Pills, tags

## Shadows

```css
/* Subtle */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);

/* Default */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);

/* Medium */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);

/* Large */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
```

## Componentes Base

### Button
- **Height**: 36px (normal), 40px (large)
- **Padding**: 12px 16px
- **Border Radius**: 8px
- **Transition**: 150ms ease

### Input
- **Height**: 40px
- **Padding**: 10px 12px
- **Border**: 1px solid #262626
- **Focus**: 2px solid #10B981

### Card
- **Background**: #171717
- **Border**: 1px solid #262626
- **Border Radius**: 12px
- **Padding**: 24px

### Table
- **Header Background**: #171717
- **Row Hover**: #1F1F1F
- **Border**: 1px solid #262626
- **Cell Padding**: 12px 16px

## Sidebar Navigation

### Structure
- **Width**: 256px (desktop)
- **Background**: #171717
- **Padding**: 16px

### Menu Items
- **Height**: 40px
- **Padding**: 8px 12px
- **Icon Size**: 20px
- **Gap**: 12px
- **Active Background**: #262626
- **Hover Background**: #1F1F1F

### Sections
- **Section Title**: Uppercase, 11px, #737373, letter-spacing: 0.05em
- **Section Margin**: 24px top

## Empty States

### Structure
- **Icon Size**: 48px
- **Icon Color**: #404040
- **Title**: text-lg, #FFFFFF
- **Description**: text-sm, #A3A3A3
- **Max Width**: 400px
- **Text Align**: center

## Animations

### Transitions
- **Fast**: 150ms ease
- **Normal**: 200ms ease
- **Slow**: 300ms ease

### Hover Effects
- **Scale**: transform: scale(1.02)
- **Opacity**: opacity: 0.8
- **Background**: Subtle color change

## Icons

### Icon Library
- **Primary**: Lucide React
- **Size Standard**: 20px
- **Size Large**: 24px
- **Size Small**: 16px
- **Stroke Width**: 2

## Best Practices

1. **Consistência**: Sempre use os tokens do design system
2. **Acessibilidade**: Contraste mínimo WCAG AA (4.5:1)
3. **Responsividade**: Mobile-first approach
4. **Performance**: Minimize reflows, use CSS transforms
5. **Feedback**: Sempre forneça feedback visual em interações
6. **Loading States**: Skeleton loaders com mesmo layout
7. **Empty States**: Sempre forneça contexto e ação
8. **Error States**: Mensagens claras e ações de recuperação

