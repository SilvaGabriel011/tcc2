# 🌗 Guia de Dark Mode - AgroInsight

## ✅ Implementação Completa

O sistema de dark/light mode foi implementado usando **next-themes** com persistência automática em `localStorage`.

---

## 🎨 Componentes Implementados

### 1. **ThemeProvider** (`/components/providers/theme-provider.tsx`)
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"  // Respeita preferência do sistema
  enableSystem           // Detecta dark mode do OS
  disableTransitionOnChange
>
```

### 2. **ThemeToggle** (`/components/theme-toggle.tsx`)
- Toggle visual com ícones Sol/Lua animados
- Tooltip com estado atual
- Evita hydration mismatch
- Acessível (aria-label, sr-only)

---

## 🎨 Tokens CSS Semânticos

### **Light Mode** (`:root`)
```css
--background: 0 0% 100%           /* Fundo principal #ffffff */
--foreground: 222.2 84% 4.9%      /* Texto principal #000000 */
--card: 0 0% 100%                 /* Cards/modais #ffffff */
--primary: 142 76% 36%            /* Verde AgroInsight */
--muted: 210 40% 96%              /* Fundos sutis */
--border: 214.3 31.8% 91.4%       /* Bordas */
```

### **Dark Mode** (`.dark`)
```css
--background: 222.2 84% 4.9%      /* Fundo escuro #0a0d13 */
--foreground: 210 40% 98%         /* Texto claro #f9fafb */
--card: 222.2 84% 4.9%            /* Cards escuros */
--primary: 142 76% 36%            /* Verde mantém */
--muted: 217.2 32.6% 17.5%        /* Cinza escuro */
--border: 217.2 32.6% 17.5%       /* Bordas escuras */
```

---

## 📝 Padrões de Uso

### ✅ **USAR (Tokens Semânticos)**
```tsx
// Fundos
<div className="bg-background">        // Fundo principal
<div className="bg-card">              // Cards/seções
<div className="bg-muted">             // Fundos sutis

// Textos
<p className="text-foreground">        // Texto principal
<p className="text-foreground/80">     // Texto secundário
<p className="text-foreground/60">     // Texto terciário
<p className="text-muted-foreground">  // Texto esmaecido

// Cores
<span className="text-primary">       // Verde AgroInsight
<span className="text-destructive">   // Vermelho de erro

// Bordas
<div className="border">               // Borda padrão
<div className="border-border">        // Borda explícita
```

### ❌ **EVITAR (Classes Hardcoded)**
```tsx
// NÃO usar:
bg-gray-50, bg-white, bg-gray-100
text-gray-900, text-gray-700, text-gray-600
border-gray-200, border-gray-300
```

---

## 🔄 Migração de Código Legado

### Substituições Comuns

| Antes (Hardcoded) | Depois (Semântico) |
|-------------------|-------------------|
| `bg-gray-50` | `bg-background` |
| `bg-white` | `bg-card` |
| `bg-gray-100` | `bg-muted` |
| `text-gray-900` | `text-foreground` |
| `text-gray-700` | `text-foreground/80` |
| `text-gray-600` | `text-foreground/70` |
| `text-gray-500` | `text-foreground/60` |
| `border-gray-200` | `border` |
| `border-gray-300` | `border` |
| `hover:bg-gray-50` | `hover:bg-muted` |
| `text-green-600` | `text-primary` |

---

## 🧩 Adicionando Toggle em Novas Páginas

```tsx
// 1. Importar componente
import { ThemeToggle } from '@/components/theme-toggle'

// 2. Adicionar na navbar
<nav className="bg-card shadow-sm border-b">
  <div className="flex items-center space-x-4">
    <ThemeToggle />  {/* ← Adicionar aqui */}
    <span>Usuário</span>
  </div>
</nav>
```

---

## 🎯 Páginas Já Atualizadas

### ✅ Completas
- `/app/dashboard/page.tsx` - Dashboard principal
- `/app/dashboard/analise/page.tsx` - Upload de análises
- `/app/layout.tsx` - Root layout com ThemeProvider

### 🔧 Parciais (navbars atualizadas)
- `/app/dashboard/resultados/page.tsx`
- `/app/dashboard/calculadora/page.tsx`
- `/app/dashboard/referencias/page.tsx`

**Próximos Passos**: Substituir classes hardcoded nos cards e elementos internos.

---

## 🧪 Como Testar

### 1. **Teste Manual**
```bash
1. Abra o dashboard
2. Clique no ícone Sol/Lua no canto superior direito
3. Verifique se os temas alternam suavemente
4. Recarregue a página → tema persiste ✅
```

### 2. **Teste de Preferência do Sistema**
```bash
1. Sistema operacional em dark mode
2. Primeira visita ao site → deve abrir em dark mode
3. Alternar manualmente → deve sobrescrever preferência do sistema
```

### 3. **Teste de Hydration**
```bash
1. Abrir DevTools → Console
2. Procurar por erros de hydration
3. Não deve haver warnings ✅
```

---

## 🔧 Configuração Técnica

### Tailwind Config (`tailwind.config.js`)
```js
module.exports = {
  darkMode: ["class"],  // Usa classe .dark no <html>
  // ...
}
```

### HTML Attribute (`app/layout.tsx`)
```tsx
<html lang="pt-BR" suppressHydrationWarning>  // ← Essencial!
```

### CSS Variables (`app/globals.css`)
```css
@layer base {
  :root { /* light mode */ }
  .dark { /* dark mode */ }
}
```

---

## 📚 Recursos Adicionais

- [next-themes docs](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

---

## 🎨 Paleta de Cores AgroInsight

### Verde Primário (mantém em ambos os modos)
- `--primary: 142 76% 36%` → `#16a34a` (green-600)

### Esquema de Cores
```
Light Mode:
- Background: Branco puro #ffffff
- Foreground: Preto intenso #0a0d13
- Accent: Verde #16a34a

Dark Mode:
- Background: Cinza muito escuro #0a0d13
- Foreground: Branco quase puro #f9fafb
- Accent: Verde #16a34a (mantém)
```

---

## ✅ Status da Implementação

| Feature | Status | Observação |
|---------|--------|------------|
| next-themes instalado | ✅ | v0.2.x |
| ThemeProvider configurado | ✅ | Sistema + Manual |
| ThemeToggle funcional | ✅ | Sol/Lua animado |
| CSS Variables | ✅ | Light + Dark |
| Persistência localStorage | ✅ | Automático |
| Respeita OS preference | ✅ | defaultTheme="system" |
| Sem hydration mismatch | ✅ | suppressHydrationWarning |
| Dashboard principal | ✅ | 100% tokens semânticos |
| Páginas de análise | 🔧 | Navbar OK, cards pendentes |
| Todas as páginas | 🔧 | Em progresso |

---

**Última Atualização**: 30 de outubro de 2025  
**Versão**: 1.0.0  
**Responsável**: Sistema AgroInsight
