# Componente: WorkoutDayCard

## 📋 Descrizione

Componente card per visualizzare un singolo giorno di allenamento con i suoi esercizi. Estratto da `workout-detail-modal.tsx` per migliorare manutenibilità.

## 📁 Percorso File

`src/components/workout/workout-day-card.tsx`

## 🔧 Props

```typescript
interface WorkoutDayCardProps {
  day: {
    id: string
    day_number: number
    title: string
    exercises: Array<{
      id: string
      exercise_name: string
      target_sets: number
      target_reps: number
      target_weight: number | null
      rest_timer_sec: number
      order_index: number
    }>
  }
}
```

### Dettaglio Props

- **`day`** (object, required): Oggetto giorno con id, numero, titolo ed esercizi

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`

### Components

- `WorkoutExerciseItem` da `./workout-exercise-item`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Giorno**: Mostra informazioni del giorno (titolo, numero)
2. **Lista Esercizi**: Mostra tutti gli esercizi del giorno
3. **Empty State**: Mostra messaggio se nessun esercizio

### UI/UX

- Card con header e content
- Titolo giorno con numero
- Lista esercizi ordinata per `order_index`
- Empty state con messaggio informativo
- Layout responsive

## 🎨 Struttura UI

```
Card
  ├── CardHeader
  │   └── CardTitle "Titolo Giorno (#numero)"
  └── CardContent
      ├── Lista Esercizi (se presenti)
      │   └── WorkoutExerciseItem (per ogni esercizio)
      └── Empty State (se nessun esercizio)
          └── Messaggio "Nessun esercizio assegnato"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutDayCard } from '@/components/workout/workout-day-card'

function MyComponent() {
  const day = {
    id: 'day-1',
    day_number: 1,
    title: 'Giorno 1 - Petto e Tricipiti',
    exercises: [
      {
        id: 'ex-1',
        exercise_name: 'Panca piana',
        target_sets: 4,
        target_reps: 10,
        target_weight: 80,
        rest_timer_sec: 90,
        order_index: 0,
      },
    ],
  }

  return <WorkoutDayCard day={day} />
}
```

## 🔍 Note Tecniche

### Formattazione Titolo

Il titolo viene formattato come:

- `{title} (#{day_number})` se `day_number > 0`
- `{title}` se `day_number === 0`

### Ordinamento Esercizi

Gli esercizi sono ordinati per `order_index` (crescente).

### Empty State

Se `exercises.length === 0`, mostra un messaggio informativo in corsivo.

### Limitazioni

- Non permette modifica (solo visualizzazione)
- Non gestisce drag & drop per riordinare
- Non mostra statistiche del giorno

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
