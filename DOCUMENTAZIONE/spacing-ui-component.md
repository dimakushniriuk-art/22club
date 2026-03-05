# Componente: Spacing (UI Base)

## 📋 Descrizione

Utility hooks e costanti per design tokens di spacing, radius, shadow, transition e zIndex. Fornisce accesso type-safe ai CSS custom properties del design system. Utilizzato per spacing consistente, radius, shadows e z-index in tutta l'applicazione.

## 📁 Percorso File

`src/components/ui/spacing.tsx`

## 🔧 Hooks e Utilities

### useSpacing Hook

```typescript
useSpacing(): {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}
```

### useRadius Hook

```typescript
useRadius(): {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}
```

### useShadow Hook

```typescript
useShadow(): {
  sm: string
  md: string
  lg: string
  xl: string
  glow: string
}
```

### designTokens Object

```typescript
designTokens: {
  spacing: {
    ;(xs, sm, md, lg, xl, '2xl')
  }
  radius: {
    ;(none, sm, md, lg, xl, full)
  }
  shadow: {
    ;(sm, md, lg, xl, glow)
  }
  transition: {
    ;(fast, normal, slow)
  }
  zIndex: {
    ;(base, dropdown, sticky, fixed, modal, popover, tooltip, toast)
  }
}
```

## 📦 Dipendenze

Nessuna dipendenza esterna (utility pura)

## ⚙️ Funzionalità

### Core

1. **Spacing Tokens**: 6 valori spacing (xs, sm, md, lg, xl, 2xl)
2. **Radius Tokens**: 6 valori radius (none, sm, md, lg, xl, full)
3. **Shadow Tokens**: 5 valori shadow (sm, md, lg, xl, glow)
4. **Transition Tokens**: 3 valori transition (fast, normal, slow)
5. **ZIndex Tokens**: 8 valori z-index (base, dropdown, sticky, fixed, modal, popover, tooltip, toast)

### Funzionalità Avanzate

- **CSS Custom Properties**: Utilizzo var(--token-name)
- **Type Safety**: TypeScript per type safety
- **Hook Pattern**: Hooks per accesso reattivo
- **Object Export**: Object export per accesso diretto
- **Consistent Values**: Valori consistenti in tutta l'app

### UI/UX

- Design tokens centralizzati
- Type-safe access
- Hooks per React components
- Object export per utility

## 🎨 Struttura

```
Spacing Utilities
  ├── useSpacing Hook
  ├── useRadius Hook
  ├── useShadow Hook
  └── designTokens Object
      ├── spacing
      ├── radius
      ├── shadow
      ├── transition
      └── zIndex
```

## 💡 Esempi d'Uso

```tsx
// useSpacing hook
const spacing = useSpacing()
<div style={{ padding: spacing.md }}>Content</div>

// useRadius hook
const radius = useRadius()
<div style={{ borderRadius: radius.lg }}>Card</div>

// useShadow hook
const shadow = useShadow()
<div style={{ boxShadow: shadow.md }}>Elevated</div>

// designTokens object
<div style={{
  padding: designTokens.spacing.md,
  borderRadius: designTokens.radius.lg,
  boxShadow: designTokens.shadow.md
}}>
  Content
</div>
```

## 📝 Note Tecniche

- Utility pura senza dipendenze
- CSS custom properties: var(--spacing-1), var(--radius-lg), etc.
- Hooks per accesso reattivo in React components
- Object export per accesso diretto
- Type-safe con TypeScript
- Valori consistenti con design system
- Utilizzo in tutta l'applicazione per coerenza

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
