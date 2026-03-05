# Componente: SwRegister

## 📋 Descrizione

Componente per registrare il Service Worker dell'applicazione. Esegue la registrazione automaticamente al mount e gestisce errori silenziosamente. Componente null (non renderizza nulla).

## 📁 Percorso File

`src/components/sw-register.tsx`

## 🔧 Props

Il componente non accetta props.

## 📦 Dipendenze

### React

- `useEffect` da `react`

### Hooks

- `registerServiceWorker` da `@/hooks/use-push-notifications`

## ⚙️ Funzionalità

### Core

1. **Registrazione SW**: Registra il service worker al mount
2. **Error Handling**: Gestisce errori di registrazione
3. **No Render**: Componente null (non renderizza nulla)

### Funzionalità Avanzate

- **Auto-registration**: Registrazione automatica al mount
- **Error Logging**: Log errori in console
- **Silent Fail**: Gestisce errori senza crashare l'app

### UI/UX

- Componente null (invisibile)
- Nessun impatto UI

## 🎨 Struttura UI

```
Componente null (non renderizza nulla)
```

## 💡 Esempi d'Uso

```tsx
// In layout principale o app root
import SwRegister from '@/components/sw-register'

export default function RootLayout() {
  return (
    <html>
      <body>
        <SwRegister />
        {/* resto dell'app */}
      </body>
    </html>
  )
}
```

## 📝 Note Tecniche

- Componente null (non renderizza nulla)
- Registrazione eseguita in `useEffect` al mount
- Error handling con try/catch
- Log errori in console per debugging
- Utilizza `registerServiceWorker` da hook push notifications
- Eseguito una sola volta al mount (dependencies vuote)
- Non interferisce con UI o rendering

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
