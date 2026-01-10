# Componente: ErrorBoundary (Dashboard)

## 📋 Descrizione

Error boundary React per catturare errori JavaScript nei componenti figli. Mostra UI di fallback con messaggio errore, dettagli (solo in dev), bottone riprova e link dashboard. Supporta fallback custom.

## 📁 Percorso File

`src/components/dashboard/error-boundary.tsx`

## 🔧 Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}
```

### Dettaglio Props

- **`children`** (ReactNode, required): Componenti figli da proteggere
- **`fallback`** (function, optional): Funzione custom per render fallback

## 📦 Dipendenze

### React

- `Component`, `ReactNode` da `react`

### UI Components

- `Button` da `@/components/ui`

### Icons

- `AlertCircle` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Cattura Errori**: Cattura errori JavaScript nei componenti figli
2. **UI Fallback**: Mostra UI di fallback con messaggio errore
3. **Reset**: Bottone per resettare stato e riprovare
4. **Dettagli Dev**: Mostra dettagli errore solo in development

### Funzionalità Avanzate

- **Fallback Custom**: Supporta fallback function personalizzata
- **Error Logging**: Log errori in console (preparato per monitoring service)
- **Dettagli Dev**: Stack trace solo in development mode
- **Navigazione**: Link per tornare alla dashboard

### UI/UX

- Icona AlertCircle
- Messaggio errore chiaro
- Dettagli errore (solo dev)
- Bottoni riprova e dashboard

## 🎨 Struttura UI

```
div (flex flex-col items-center justify-center)
  ├── AlertCircle icon
  ├── h2 "Qualcosa è andato storto"
  ├── p Messaggio
  ├── (se dev) details con stack trace
  └── div Bottoni
      ├── Button "Riprova"
      └── Button "Torna alla Dashboard"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ErrorBoundary } from '@/components/dashboard/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### Esempio con Fallback Custom

```tsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Errore: {error.message}</p>
      <button onClick={reset}>Riprova</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## 🔍 Note Tecniche

### Lifecycle Methods

- `getDerivedStateFromError`: Aggiorna stato quando errore catturato
- `componentDidCatch`: Log errore (preparato per monitoring)

### Limitazioni

- Solo errori JavaScript (non errori async, event handlers, SSR)
- Class component (non hook-based)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
