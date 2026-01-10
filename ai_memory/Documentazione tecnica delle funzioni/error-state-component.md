# Componente: ErrorState

## 📋 Descrizione

Componente riusabile per visualizzare stato di errore. Mostra icona errore, titolo, messaggio e bottone retry opzionale. Accessibile con ARIA attributes.

## 📁 Percorso File

`src/components/dashboard/error-state.tsx`

## 🔧 Props

```typescript
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}
```

### Dettaglio Props

- **`title`** (string, optional): Titolo errore (default: "Errore nel caricamento")
- **`message`** (string, required): Messaggio errore
- **`onRetry`** (function, optional): Callback retry
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Button` da `@/components/ui`
- `AlertCircle` da `lucide-react`

### Utils

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Errore**: Icona, titolo, messaggio
2. **Retry Button**: Bottone opzionale per riprovare
3. **Accessibilità**: ARIA attributes (role="alert", aria-live="assertive")

### Funzionalità Avanzate

- **Icona Errore**: AlertCircle grande (h-12 w-12) in rosso
- **Layout Centrato**: Flex column, items-center, justify-center
- **Testo Centrato**: Titolo e messaggio centrati
- **Bottone Retry**: Solo se `onRetry` fornito

### UI/UX

- Layout centrato verticale e orizzontale
- Icona grande e prominente
- Titolo e messaggio ben spaziati
- Bottone retry con stile brand
- Padding verticale per spazio

## 🎨 Struttura UI

```
div (flex flex-col items-center justify-center gap-4 py-12 text-center)
  ├── AlertCircle (h-12 w-12, text-state-error)
  ├── div
  │   ├── h3 (title, text-lg, font-medium)
  │   └── p (message, text-sm, text-secondary)
  └── Button (se onRetry presente)
      └── "Riprova"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ErrorState } from '@/components/dashboard/error-state'

function DashboardPage() {
  return (
    <ErrorState
      message="Impossibile caricare i dati. Riprova più tardi."
      onRetry={() => window.location.reload()}
    />
  )
}
```

### Esempio con Titolo Personalizzato

```tsx
<ErrorState
  title="Errore di connessione"
  message="Non è stato possibile connettersi al server."
  onRetry={handleRetry}
  className="min-h-[400px]"
/>
```

## 🔍 Note Tecniche

### Accessibilità

- `role="alert"`: Indica errore critico
- `aria-live="assertive"`: Annuncia immediatamente
- `aria-hidden="true"` su icona (decorativa)

### Colori

- **Icona**: `text-state-error` (rosso)
- **Titolo**: `text-text-primary` (bianco)
- **Messaggio**: `text-text-secondary` (grigio)
- **Bottone**: `bg-brand` (teal)

### Limitazioni

- Messaggio solo testo (non HTML)
- Solo un bottone retry (non configurabile)
- Layout fisso (non responsive personalizzabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
