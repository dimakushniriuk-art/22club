# Componente: Button (UI Base)

## 📋 Descrizione

Componente bottone principale del design system. Supporta 10 varianti, 7 dimensioni, loading state, asChild pattern e integrazione con design tokens. Utilizzato in tutta l'applicazione per azioni e interazioni.

## 📁 Percorso File

`src/components/ui/button.tsx`

## 🔧 Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'link'
    | 'default'
    | 'trainer'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
  loading?: boolean
  asChild?: boolean
}
```

### Dettaglio Props

- **`variant`** (string, optional): Variante stile bottone (default: 'primary')
- **`size`** (string, optional): Dimensione bottone (default: 'md')
- **`loading`** (boolean, optional): Mostra spinner loading (default: false)
- **`asChild`** (boolean, optional): Renderizza come span invece di button (default: false)
- **`disabled`** (boolean, optional): Disabilita bottone
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per button

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Config

- `designSystem` da `@/config/design-system`
- `masterAnimations` da `@/config/master-design.config`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **10 Varianti**: primary, secondary, ghost, outline, destructive, success, warning, link, default, trainer
2. **7 Dimensioni**: sm, md, lg, xl, icon, icon-sm, icon-lg
3. **Loading State**: Spinner animato durante loading
4. **Disabled State**: Disabilitazione con opacity e pointer-events
5. **AsChild Pattern**: Render come span per composizione

### Funzionalità Avanzate

- **Design Tokens**: Integrazione con design system e master animations
- **Active Scale**: Scale animation su click (scale-[0.98])
- **Focus Ring**: Focus visible con shadow teal
- **Gradient Variants**: Gradient per default, secondary, trainer
- **Hover Effects**: Hover con shadow e colori
- **Transitions**: Transizioni smooth da master animations

### UI/UX

- Bottone con rounded-full
- Font medium con whitespace-nowrap
- Loading spinner con animate-spin
- Focus visible con shadow teal
- Active scale per feedback tattile
- Disabled con opacity e pointer-events-none

## 🎨 Struttura UI

```
Button/Span (inline-flex items-center justify-center)
  ├── Se loading
  │   └── Spinner SVG (animate-spin)
  └── Children (contenuto bottone)
```

## 💡 Esempi d'Uso

```tsx
// Bottone base
<Button variant="primary" size="md">
  Clicca qui
</Button>

// Bottone con loading
<Button variant="primary" loading>
  Caricamento...
</Button>

// Bottone icona
<Button variant="ghost" size="icon">
  <Icon />
</Button>

// Bottone asChild
<Button asChild variant="link">
  <a href="/">Link</a>
</Button>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Integrazione con design tokens e master animations
- 10 varianti con colori e stili predefiniti
- Dimensioni: sm (h-9), md (h-11), lg (h-12), xl (h-14), icon (h-10 w-10), icon-sm (h-8 w-8), icon-lg (h-12 w-12)
- Loading state con SVG spinner animato
- AsChild pattern per composizione flessibile
- Active scale animation per feedback
- Focus visible con shadow teal-500/30
- Disabled state con opacity-50 e pointer-events-none
- Gradient per alcune varianti (default, secondary, trainer)
- Transizioni da master animations
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
