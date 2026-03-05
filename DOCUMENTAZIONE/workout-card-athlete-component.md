# Componente: WorkoutCard (Athlete)

## 📋 Descrizione

Componente card per visualizzare l'allenamento del giorno per un atleta. Mostra informazioni sull'allenamento, esercizi e permette di avviare la sessione.

## 📁 Percorso File

`src/components/athlete/workout-card.tsx`

## 🔧 Props

```typescript
interface WorkoutCardProps {
  workout?: WorkoutData
  loading?: boolean
  onStartWorkout?: () => void
}

interface WorkoutData {
  title: string
  day: number
  scheduledTime?: string
  ptName: string
  exercises: string[]
  duration: string
}
```

### Dettaglio Props

- **`workout`** (WorkoutData, optional): Dati dell'allenamento
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento
- **`onStartWorkout`** (function, optional): Callback chiamato quando si avvia l'allenamento

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `DumbbellIcon` da `@/components/ui/professional-icons`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Allenamento**: Mostra informazioni dell'allenamento del giorno
2. **Loading State**: Mostra skeleton durante caricamento
3. **Empty State**: Mostra messaggio se nessun allenamento disponibile
4. **Avvio Sessione**: Permette di avviare l'allenamento

### Stati

- **Loading**: Skeleton con animazione pulse
- **Empty**: Messaggio informativo con icona
- **Loaded**: Card completa con informazioni

### UI/UX

- Card con gradiente e backdrop blur
- Design moderno con ombre e bordi colorati
- Badge per informazioni aggiuntive
- Bottone call-to-action per avviare
- Layout responsive

## 🎨 Struttura UI

```
Card (con gradiente e blur)
  ├── CardHeader
  │   └── CardTitle "Allenamento di oggi" (con gradiente testo)
  └── CardContent
      ├── Loading State
      │   └── Skeleton animato
      ├── Empty State
      │   ├── Icona Dumbbell
      │   ├── Titolo "Il tuo PT ti caricherà presto..."
      │   ├── Descrizione
      │   └── Button disabilitato
      └── Loaded State
          ├── Titolo allenamento
          ├── Info (giorno, PT, durata)
          ├── Lista esercizi
          └── Button "Inizia Allenamento"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutCard } from '@/components/athlete/workout-card'

function MyComponent() {
  const workout = {
    title: 'Allenamento Petto e Tricipiti',
    day: 1,
    scheduledTime: '10:00',
    ptName: 'Giuseppe Verdi',
    exercises: ['Panca piana', 'Dips', 'Push-up'],
    duration: '60 min',
  }

  const handleStart = () => {
    // Avvia sessione allenamento
  }

  return <WorkoutCard workout={workout} loading={false} onStartWorkout={handleStart} />
}
```

## 🔍 Note Tecniche

### Memoization

Il componente è wrappato con `memo` per ottimizzare re-render.

### Gradiente Design

- Background: `from-background-secondary via-background-secondary to-background-tertiary`
- Bordo: `border-teal-500/30`
- Ombra: `shadow-teal-500/20`
- Overlay: `from-teal-500/5 via-transparent to-cyan-500/5`

### Empty State

Quando `workout` è `undefined` o `null`, mostra:

- Messaggio informativo
- Icona Dumbbell opaca
- Bottone disabilitato

### Limitazioni

- Non gestisce errori di caricamento
- Non mostra storico allenamenti
- Non permette modifica allenamento

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
