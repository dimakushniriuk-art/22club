# Componente: LoadingState

## 📋 Descrizione

Componente riusabile per visualizzare stato di caricamento. Mostra spinner centrato con messaggio opzionale. Supporta diverse dimensioni spinner e classi personalizzate.

## 📁 Percorso File

`src/components/dashboard/loading-state.tsx`

## 🔧 Props

```typescript
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
```

### Dettaglio Props

- **`message`** (string, optional): Messaggio da mostrare (default: "Caricamento in corso...")
- **`size`** ('sm' | 'md' | 'lg' | 'xl', optional): Dimensione spinner (default: 'lg')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Spinner` da `@/components/ui/spinner`

### Utils

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Spinner Centrato**: Spinner con dimensioni configurabili
2. **Messaggio Opzionale**: Testo sotto lo spinner
3. **Accessibilità**: ARIA attributes (role="status", aria-live="polite")

### Funzionalità Avanzate

- **4 Dimensioni**: sm, md, lg, xl
- **Layout Centrato**: Flex column, items-center, justify-center
- **Padding Verticale**: py-12 per spazio verticale
- **Classi Personalizzate**: Supporto per className aggiuntive

### UI/UX

- Layout centrato verticale e orizzontale
- Spinner con gap rispetto al messaggio
- Messaggio con testo secondario
- Accessibile per screen readers

## 🎨 Struttura UI

```
div (flex flex-col items-center justify-center gap-4 py-12)
  ├── Spinner (size configurabile)
  └── p (text-sm, text-secondary)
      └── Messaggio
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { LoadingState } from '@/components/dashboard/loading-state'

function DashboardPage() {
  return <LoadingState />
}
```

### Esempio con Messaggio Personalizzato

```tsx
<LoadingState message="Caricamento dati atleti..." size="xl" className="min-h-[400px]" />
```

## 🔍 Note Tecniche

### Dimensioni Spinner

- **sm**: Piccolo
- **md**: Medio
- **lg**: Grande (default)
- **xl**: Extra grande

### Accessibilità

- `role="status"`: Indica stato dinamico
- `aria-live="polite"`: Annuncia cambiamenti senza interrompere

### Limitazioni

- Messaggio solo testo (non HTML)
- Spinner component deve supportare prop `size`
- Layout fisso (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
