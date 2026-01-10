# Componente: ErrorBoundary (UI Base)

## 📋 Descrizione

Componente error boundary React per catturare errori JavaScript nei componenti figli. Supporta fallback custom, UI di errore predefinita, bottone ricarica e hook useErrorHandler. Utilizzato per gestione errori globali e prevenzione crash applicazione.

## 📁 Percorso File

`src/components/ui/error-boundary.tsx`

## 🔧 Props

```typescript
interface Props {
  children: ReactNode
  fallback?: ReactNode
}
```

### Dettaglio Props

- **`children`** (ReactNode, required): Componenti figli da proteggere
- **`fallback`** (ReactNode, optional): UI fallback custom

## 📦 Dipendenze

### React

- `Component`, `ErrorInfo`, `ReactNode` da `react`
- `AlertTriangle`, `RefreshCw` da `lucide-react`

### Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Error Catching**: Cattura errori JavaScript nei figli
2. **Fallback UI**: UI di errore predefinita o custom
3. **Error Logging**: Log errori in console
4. **Reload Button**: Bottone per ricaricare pagina
5. **Hook Helper**: useErrorHandler hook per gestione errori

### Funzionalità Avanzate

- **getDerivedStateFromError**: Aggiorna stato quando errore catturato
- **componentDidCatch**: Logging errori con errorInfo
- **Custom Fallback**: Supporto fallback custom
- **Error Handler Hook**: Hook per gestione errori programmatica

### UI/UX

- Card con border red
- Icona AlertTriangle
- Titolo errore
- Messaggio user-friendly
- Bottone ricarica
- Layout responsive

## 🎨 Struttura UI

```
ErrorBoundary (Class Component)
  ├── Se hasError
  │   ├── Se fallback custom
  │   │   └── Fallback Custom
  │   └── Se !fallback
  │       └── Card Error
  │           ├── CardHeader
  │           │   └── CardTitle (AlertTriangle icon + "Qualcosa è andato storto")
  │           └── CardContent
  │               ├── Messaggio errore
  │               └── Button Ricarica
  └── Se !hasError
      └── Children
```

## 💡 Esempi d'Uso

```tsx
// ErrorBoundary base
<ErrorBoundary>
  <App />
</ErrorBoundary>

// ErrorBoundary con fallback custom
<ErrorBoundary
  fallback={
    <div>
      <h2>Errore!</h2>
      <button onClick={() => window.location.reload()}>Ricarica</button>
    </div>
  }
>
  <App />
</ErrorBoundary>

// useErrorHandler hook
const { handleError } = useErrorHandler()

try {
  // codice che può generare errore
} catch (error) {
  handleError(error, 'contexto')
}
```

## 📝 Note Tecniche

- Class Component per error boundary (React richiede class component)
- getDerivedStateFromError: aggiorna stato quando errore catturato
- componentDidCatch: logging errori con errorInfo
- Fallback custom opzionale
- UI predefinita con Card e Button
- Bottone ricarica con window.location.reload()
- Hook useErrorHandler per gestione errori programmatica
- Logging errori in console
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
