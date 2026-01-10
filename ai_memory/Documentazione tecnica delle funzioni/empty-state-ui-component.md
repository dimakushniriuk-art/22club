# Componente: EmptyState (UI Base)

## 📋 Descrizione

Componente empty state per stati vuoti. Supporta icona, titolo, descrizione, azione opzionale, 3 varianti (trainer, athlete, default), 3 dimensioni icona e gradient overlay. Utilizzato per liste vuote, stati vuoti e messaggi informativi.

## 📁 Percorso File

`src/components/shared/ui/empty-state.tsx`

## 🔧 Props

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'trainer' | 'athlete' | 'default'
  iconSize?: 'small' | 'medium' | 'large'
  className?: string
  showGradient?: boolean
}
```

### Dettaglio Props

- **`icon`** (LucideIcon, required): Icona da mostrare (componente Lucide)
- **`title`** (string, required): Titolo stato vuoto
- **`description`** (string, optional): Descrizione opzionale
- **`action`** (ReactNode, optional): Azione opzionale (bottone o link)
- **`variant`** (string, optional): Variante card (default: 'trainer')
- **`iconSize`** (string, optional): Dimensione icona (default: 'large')
- **`className`** (string, optional): Classi CSS aggiuntive
- **`showGradient`** (boolean, optional): Mostra gradient overlay (default: true)

## 📦 Dipendenze

### Types

- `LucideIcon` da `lucide-react`

### Components

- `Card`, `CardContent` da `@/components/ui/card`

### Config

- `dk` da `@/config/dkdesign`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Icon Display**: Icona grande centrata
2. **Title/Description**: Titolo e descrizione opzionale
3. **Action Button**: Azione opzionale (bottone)
4. **3 Varianti**: trainer, athlete, default
5. **3 Icon Sizes**: small, medium, large
6. **Gradient Overlay**: Gradient overlay opzionale

### Funzionalità Avanzate

- **Design System Integration**: Integrazione con dk design system
- **Card Variant**: Utilizza Card component con varianti
- **Icon Wrapper**: Wrapper con padding per icona
- **Gradient Overlay**: Overlay gradient per profondità
- **Responsive Layout**: Layout responsive

### UI/UX

- Card con variant
- Icona grande centrata
- Titolo prominente
- Descrizione opzionale
- Azione opzionale
- Gradient overlay
- Layout centrato

## 🎨 Struttura UI

```
Card (variant)
  ├── Gradient Overlay (se showGradient)
  └── CardContent
      ├── Icon Wrapper
      │   └── Icon (LucideIcon)
      ├── Title (h3)
      ├── Description (opzionale, p)
      └── Action (opzionale, div)
```

## 💡 Esempi d'Uso

```tsx
// Empty state base
<EmptyState
  icon={Calendar}
  title="Nessun appuntamento"
  description="Non hai appuntamenti programmati per oggi."
/>

// Empty state con azione
<EmptyState
  icon={Users}
  title="Nessun atleta"
  description="Inizia aggiungendo il tuo primo atleta."
  action={
    <Button variant="primary" onClick={onAdd}>
      <Plus className="mr-2 h-4 w-4" />
      Aggiungi Atleta
    </Button>
  }
/>

// Empty state con variante
<EmptyState
  icon={FileText}
  title="Nessun documento"
  variant="athlete"
  iconSize="medium"
/>
```

## 📝 Note Tecniche

- Integrazione con dk design system
- Utilizza Card component con varianti
- 3 varianti: trainer, athlete, default
- 3 dimensioni icona: small (h-8 w-8 p-4), medium (h-10 w-10 p-5), large (h-12 w-12 p-6)
- Gradient overlay da dk.card.gradientOverlay
- Stili da dk.emptyState.\*
- Layout centrato e responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
