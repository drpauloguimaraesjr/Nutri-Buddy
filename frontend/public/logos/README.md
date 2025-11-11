# Logo NutriBuddy - Guia de Uso

## Arquivos Disponíveis

### 1. `nutribuddy-logo.svg`
Logo completo em alta resolução com estrutura de DNA em moldura quadrada.
- **Uso**: Páginas de marketing, apresentações, impressos
- **Tamanho**: 1920x1080px (escalável)
- **Formato**: SVG vetorial

### 2. `nutribuddy-icon.svg`
Versão simplificada e colorida do logo (ícone com fundo azul).
- **Uso**: Sidebar, Header, ícones da aplicação
- **Tamanho**: 446x446px (escalável)
- **Formato**: SVG vetorial
- **Cores**: Azul (#0ea5e9) com DNA branco

## Como Usar

### No Next.js (Recomendado)

#### Usando o Componente Logo

```tsx
import Logo from '@/components/Logo';

// Logo com ícone e texto
<Logo size="md" showText={true} href="/dashboard" />

// Apenas ícone
<Logo size="sm" showText={false} />

// Logo grande
<Logo size="xl" showText={true} />
```

#### Usando Image do Next.js

```tsx
import Image from 'next/image';

<Image 
  src="/logos/nutribuddy-icon.svg" 
  alt="NutriBuddy" 
  width={40}
  height={40}
  priority
/>
```

### Em HTML Puro

```html
<!-- Usando img tag -->
<img src="/logos/nutribuddy-icon.svg" alt="NutriBuddy" width="40" height="40">

<!-- SVG inline (para animações/customização) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="496 182 446 446" width="40" height="40">
  <!-- conteúdo do SVG -->
</svg>
```

### Em CSS (Background)

```css
.logo {
  width: 40px;
  height: 40px;
  background-image: url('/logos/nutribuddy-icon.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## Tamanhos Recomendados

| Contexto | Tamanho | Exemplo de Uso |
|----------|---------|----------------|
| Favicon | 16x16, 32x32 | Aba do navegador |
| Sidebar | 40x40 | Menu lateral |
| Header Mobile | 32x32 | Cabeçalho em mobile |
| Header Desktop | 40x40 | Cabeçalho em desktop |
| Splash Screen | 512x512 | Tela de carregamento PWA |
| Marketing | Qualquer | Escalável sem perda |

## Personalização de Cores

### Alterando a cor do ícone (CSS)

```css
/* Para SVGs inline ou usando mask */
.logo-icon {
  background-color: #your-color;
  mask-image: url('/logos/nutribuddy-icon.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}
```

### Cores da Marca

- **Azul Principal**: `#0ea5e9` (Tailwind: sky-500)
- **Branco**: `#ffffff`
- **Cinza Escuro**: `#111827` (Tailwind: gray-900)

## Otimização

### Para Web
- Os arquivos SVG já estão otimizados
- Use `loading="lazy"` para logos abaixo da dobra
- Use `priority` em Next.js para logos above-the-fold

### Para PWA/App Mobile
- Favicon SVG: `/favicon.svg`
- Apple Touch Icon: `/apple-touch-icon.png` (180x180)
- Manifest icons: Veja `/manifest.json`

## Exemplos Práticos

### Logo na Sidebar (implementado)

```tsx
<Link href="/dashboard" className="flex items-center gap-3">
  <div className="w-10 h-10 relative">
    <Image 
      src="/logos/nutribuddy-icon.svg" 
      alt="NutriBuddy Logo" 
      width={40}
      height={40}
      className="object-contain"
      priority
    />
  </div>
  <span className="font-bold text-xl text-gray-900">NutriBuddy</span>
</Link>
```

### Logo no Header (implementado)

```tsx
<div className="hidden lg:flex items-center gap-3 mr-4">
  <Image 
    src="/logos/nutribuddy-icon.svg" 
    alt="NutriBuddy" 
    width={32}
    height={32}
    className="object-contain"
  />
</div>
```

## Estrutura do Logo

A logo representa uma **estrutura de DNA em hélice dupla** dentro de uma **moldura quadrada**, simbolizando:
- 🧬 **DNA**: Personalização baseada em genética
- 📊 **Estrutura**: Organização e precisão científica
- 🎯 **Moldura**: Foco e profissionalismo

## Suporte

- ✅ Todos os navegadores modernos
- ✅ Mobile e Desktop
- ✅ Telas de alta resolução (Retina)
- ✅ Dark mode (requer customização)
- ✅ PWA e aplicativos móveis

## Manutenção

Para atualizar a logo:
1. Edite o arquivo SVG desejado
2. Mantenha o viewBox e dimensões
3. Teste em diferentes tamanhos
4. Atualize o favicon se necessário

---

**Versão**: 1.0  
**Última atualização**: Novembro 2025  
**Criado para**: Sistema NutriBuddy

