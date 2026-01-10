# Componente: ErrorDisplay (UI Base)

## 📋 Descrizione

Componente per visualizzare errori API in modo user-friendly. Supporta errori generici, network, timeout, validazione e info, con retry, dismiss, dettagli espandibili e varianti specializzate. Utilizzato per gestione errori, feedback utente e debugging.

## 📁 Percorso File

`src/components/ui/error-display.tsx`

## 🔧 Props

### ErrorDisplay Props

```typescript
interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
  context?: string
  showDetails?: boolean
  className?: string
}
```

### Sub-components

- `NetworkErrorDisplay` - Errore di rete
- `TimeoutErrorDisplay` - Errore timeout
- `ValidationErrorDisplay` - Errori di validazione
- `InfoErrorDisplay` - Errore informativo

## 📦 Dipendenze

### React

- `useState` da `react`
- `AlertCircle`, `RefreshCw`, `X`, `Info` da `lucide-react`

### Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Error Display**: Visualizzazione errore user-friendly
2. **Retry Button**: Bottone riprova opzionale
3. **Dismiss Button**: Bottone chiudi opzionale
4. **Context Display**: Contesto errore opzionale
5. **Details Toggle**: Dettagli espandibili per debugging
6. **Specialized Variants**: Varianti per tipi errore specifici

### Funzionalità Avanzate

- **Details JSON**: Dettagli JSON formattati per debugging
- **Network Error**: Variante specifica per errori di rete
- **Timeout Error**: Variante specifica per timeout
- **Validation Error**: Variante per errori validazione array
- **Info Error**: Variante informativa (non errore)

### UI/UX

- Card con border e background colorati
- Icona AlertCircle per errori
- Titolo con contesto
- Messaggio errore
- Dettagli espandibili
- Bottoni azione (retry, dismiss)
- Layout responsive

## 🎨 Struttura UI

```
Card (border-red, bg-red-50)
  └── CardContent
      └── Flex Container
          ├── Icon (AlertCircle)
          ├── Content
          │   ├── Title (con contesto)
          │   ├── Error Message
          │   ├── Details Toggle (se showDetails)
          │   └── Details JSON (se espanso)
          ├── Dismiss Button (se onDismiss)
          └── Retry Button (se onRetry)
```

## 💡 Esempi d'Uso

```tsx
// ErrorDisplay base
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  context="caricamento dati"
/>

// ErrorDisplay con dettagli
<ErrorDisplay
  error={error}
  showDetails={true}
  context="API call"
/>

// NetworkErrorDisplay
<NetworkErrorDisplay
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>

// TimeoutErrorDisplay
<TimeoutErrorDisplay
  timeoutMs={5000}
  onRetry={handleRetry}
/>

// ValidationErrorDisplay
<ValidationErrorDisplay
  errors={['Campo obbligatorio', 'Email non valida']}
  onRetry={handleRetry}
/>
```

## 📝 Note Tecniche

- Gestione stato showFullDetails con useState
- Dettagli JSON formattati con JSON.stringify
- Varianti specializzate per tipi errore
- NetworkErrorDisplay: messaggio connessione
- TimeoutErrorDisplay: messaggio timeout con durata
- ValidationErrorDisplay: array errori validazione
- InfoErrorDisplay: variante informativa (blue)
- Stili colorati per tipo errore (red, blue)
- Layout flessibile con flex
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
