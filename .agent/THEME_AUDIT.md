# 🔍 Auditoria de Adaptação ao Tema - NutriBuddy

## ❌ **Problemas Encontrados**

### **Cores Hardcoded que NÃO se adaptam ao tema:**

#### 1. **Textos Cinza (text-gray-*)**
- ✅ **Já corrigido**: `patients/page.tsx`
- ❌ **Pendente**: 
  - `dashboard/chat/page.tsx` (13 ocorrências)
  - `scheduled-messages/page.tsx` (22 ocorrências)
  - `analytics/page.tsx` (30+ ocorrências)
  - `dashboard/page.tsx`
  - `patients/[patientId]/page.tsx`
  - Componentes diversos

#### 2. **Fundos Cinza (bg-gray-*)**
- Cards com `bg-gray-50`, `bg-gray-100`
- Inputs com `bg-gray-100`
- Hovers com `bg-gray-50`

#### 3. **Textos Slate (text-slate-*)**
- Headers, sidebars
- Navegação

#### 4. **Fundos Brancos Fixos (bg-white)**
- Cards que deveriam ser `bg-background-secondary`
- Modais
- Dropdowns

---

## ✅ **Solução: Classes Theme-Aware**

### **Substituições Recomendadas:**

| ❌ Antes | ✅ Depois |
|---------|----------|
| `text-gray-900` | `text-high-contrast` |
| `text-gray-600` | `text-high-contrast-muted` |
| `text-gray-500` | `text-high-contrast-muted` |
| `text-gray-400` | `text-foreground-muted` |
| `bg-gray-50` | `bg-background-secondary` |
| `bg-gray-100` | `bg-background-secondary` |
| `bg-white` | `bg-background-secondary` |
| `text-white` | `text-foreground` |
| `text-3xl` | `text-fluid-3xl` |
| `text-sm` | `text-fluid-sm` |

---

## 📊 **Páginas Prioritárias para Correção:**

### **Alta Prioridade** (Mais usadas):
1. ✅ `patients/page.tsx` - **CORRIGIDO**
2. ❌ `dashboard/page.tsx` - Dashboard principal
3. ❌ `patients/[patientId]/page.tsx` - Detalhes do paciente
4. ❌ `dashboard/chat/page.tsx` - Chat

### **Média Prioridade**:
5. ❌ `analytics/page.tsx` - Analytics
6. ❌ `scheduled-messages/page.tsx` - Mensagens agendadas

### **Componentes Globais**:
- ❌ `Header.tsx` - Já tem dark mode, mas pode ter textos fixos
- ❌ `Sidebar.tsx` - Verificar cores
- ❌ `Card.tsx` - Componente base
- ❌ Modais diversos

---

## 🎯 **Próximos Passos:**

1. **Corrigir Dashboard Principal** (`dashboard/page.tsx`)
2. **Corrigir Detalhes do Paciente** (`patients/[patientId]/page.tsx`)
3. **Corrigir Chat** (`dashboard/chat/page.tsx`)
4. **Criar componente Card theme-aware**
5. **Atualizar todos os componentes globais**

---

## 🛠️ **Automação Sugerida:**

Criar um script para substituir automaticamente:
```bash
# Exemplo de substituições em massa
text-gray-900 → text-high-contrast
text-gray-600 → text-high-contrast-muted
text-gray-500 → text-high-contrast-muted
bg-gray-50 → bg-background-secondary
```

---

**Status**: 📍 1 de ~15 páginas corrigidas (6.7%)
