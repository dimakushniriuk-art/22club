# Componente: WorkoutDetailModal

## 📋 Descrizione

Modal per visualizzare i dettagli completi di una scheda di allenamento. Mostra informazioni generali, giorni di allenamento, esercizi e statistiche.

## 📁 Percorso File

`src/components/workout/workout-detail-modal.tsx`

## 🔧 Props

```typescript
interface WorkoutDetailModalProps {
  workoutId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### Dettaglio Props

- **`workoutId`** (string | null, required): ID della scheda da visualizzare
- **`open`** (boolean, required): Controlla la visibilità del modal
- **`onOpenChange`** (function, required): Callback chiamato quando cambia lo stato di apertura

## 📦 Dipendenze

### Hooks

- `useWorkoutDetail` da `@/hooks/workout/use-workout-detail`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` da `@/components/ui/dialog`
- `Spinner` da `@/components/ui`
- `ErrorState` da `@/components/dashboard/error-state`

### Components

- `WorkoutDetailHeader` da `./workout-detail-header`
- `WorkoutDaysList` da `./workout-days-list`

## ⚙️ Funzionalità

### Core

1. **Caricamento Dati**: Carica i dettagli della scheda tramite hook
2. **Visualizzazione Dettagli**: Mostra tutte le informazioni della scheda
3. **Gestione Stati**: Gestisce loading, error e success states

### Funzionalità Avanzate

- **Formattazione Date**: Formatta le date in italiano
- **Gestione Status**: Mostra badge con stato scheda (attiva, completata, archiviata, scaduta)
- **Statistiche**: Calcola e mostra statistiche (totale esercizi, giorni, etc.)
- **Empty States**: Gestisce stati vuoti (nessun giorno, nessun esercizio)

### UI/UX

- Modal responsive (max-w-[900px])
- Scroll verticale per contenuti lunghi
- Header con titolo e descrizione
- Sezioni organizzate con card
- Loading spinner durante caricamento
- Error state in caso di errore

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   ├── DialogTitle "Riepilogo Completo Scheda"
      │   └── DialogDescription
      └── Content
          ├── Loading State (Spinner)
          ├── Error State (ErrorState)
          └── Success State
              ├── WorkoutDetailHeader
              │   ├── Nome scheda
              │   ├── Descrizione
              │   ├── Badge status
              │   ├── Info atleta/PT
              │   └── Data creazione
              └── WorkoutDaysList
                  └── WorkoutDayCard (per ogni giorno)
                      └── WorkoutExerciseItem (per ogni esercizio)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutDetailModal } from '@/components/workout/workout-detail-modal'

function MyComponent() {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)

  return (
    <WorkoutDetailModal
      workoutId={selectedWorkoutId}
      open={selectedWorkoutId !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedWorkoutId(null)
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Hook useWorkoutDetail

Il componente utilizza `useWorkoutDetail` che:

- Carica i dati solo quando `open` è true
- Gestisce loading state
- Gestisce error state
- Ritorna dati formattati

### Formattazione Status

- **Attivo/Active**: Badge success (verde)
- **Completato/Completed**: Badge info (blu)
- **Archiviato/Archived**: Badge default (grigio)
- **Scaduto/Expired**: Badge error (rosso)

### Formattazione Date

Le date sono formattate in italiano con:

- Giorno numerico
- Mese per esteso
- Anno
- Ora e minuti

### Calcolo Statistiche

- **Totale Esercizi**: Somma di tutti gli esercizi di tutti i giorni
- **Totale Giorni**: Numero di giorni configurati

### Limitazioni

- Non permette modifica (solo visualizzazione)
- Non gestisce eliminazione
- Non mostra storico modifiche

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
