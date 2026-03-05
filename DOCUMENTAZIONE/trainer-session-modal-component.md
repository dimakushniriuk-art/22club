# Componente: TrainerSessionModal

## 📋 Descrizione

Modal per selezionare come è stato completato un allenamento: con personal trainer o da solo. Utilizzato per tracciare le sessioni di allenamento e distinguere tra allenamenti guidati e autonomi.

## 📁 Percorso File

`src/components/workout/trainer-session-modal.tsx`

## 🔧 Props

```typescript
interface TrainerSessionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (withTrainer: boolean) => Promise<void>
  loading?: boolean
}
```

### Dettaglio Props

- **`open`** (boolean, required): Controlla la visibilità del modal
- **`onClose`** (function, required): Callback chiamato quando il modal viene chiuso
- **`onConfirm`** (function, required): Callback chiamato quando l'utente seleziona un'opzione. Riceve `true` se con PT, `false` se da solo
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento durante l'elaborazione

## 📦 Dipendenze

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` da `@/components/ui`
- `Button` da `@/components/ui`
- `UserCheck`, `User`, `Loader2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Selezione Modalità**: Permette di scegliere tra "Con Personal Trainer" o "Da Solo"
2. **Gestione Loading**: Mostra stato di caricamento durante l'elaborazione
3. **Chiusura**: Permette di annullare la selezione

### Opzioni

- **Con Personal Trainer**: Indica che l'allenamento è stato completato con assistenza PT
- **Da Solo**: Indica che l'allenamento è stato completato autonomamente

### UI/UX

- Modal centrato con max-width medio
- Due pulsanti grandi e chiari
- Gradiente blu/indigo per opzione PT
- Outline per opzione autonoma
- Loading state con spinner
- Pulsante annulla nel footer

## 🎨 Struttura UI

```
Dialog
  └── DialogContent (max-w-md)
      ├── DialogHeader
      │   ├── DialogTitle "Completamento Allenamento"
      │   └── DialogDescription
      ├── Opzioni (flex-col gap-3)
      │   ├── Button "Con Personal Trainer" (gradiente blu)
      │   └── Button "Da Solo" (outline)
      └── DialogFooter
          └── Button "Annulla" (outline)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { TrainerSessionModal } from '@/components/workout/trainer-session-modal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async (withTrainer: boolean) => {
    setLoading(true)
    try {
      await saveWorkoutSession({ withTrainer })
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TrainerSessionModal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleConfirm}
      loading={loading}
    />
  )
}
```

## 🔍 Note Tecniche

### Gestione Loading

- Il loading viene gestito dal parent component
- Durante il loading, tutti i pulsanti sono disabilitati
- Mostra spinner e testo "Elaborazione..." durante il loading

### Callback onConfirm

- È una funzione `async` che può essere await
- Riceve `true` se selezionato "Con Personal Trainer"
- Riceve `false` se selezionato "Da Solo"

### Stili

- Gradiente blu/indigo per opzione PT (più prominente)
- Outline per opzione autonoma (meno prominente)
- Entrambi i pulsanti hanno dimensioni grandi (py-6, text-lg) per facilità d'uso

### Limitazioni

- Non gestisce errori (deve essere gestito dal parent)
- Non permette di modificare la selezione dopo la conferma
- Non mostra informazioni aggiuntive sulla sessione

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
