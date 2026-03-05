# Componente: WorkoutDaysList

## 📋 Descrizione

Componente per visualizzare la lista di tutti i giorni di allenamento di una scheda. Gestisce anche lo stato vuoto quando non ci sono giorni configurati.

## 📁 Percorso File

`src/components/workout/workout-days-list.tsx`

## 🔧 Props

```typescript
interface WorkoutDaysListProps {
  days: Array<{
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
  }>
}
```

### Dettaglio Props

- **`days`** (array, required): Array di giorni da visualizzare

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `FileText` da `lucide-react`

### Components

- `WorkoutDayCard` da `./workout-day-card`

## ⚙️ Funzionalità

### Core

1. **Lista Giorni**: Visualizza tutti i giorni della scheda
2. **Empty State**: Mostra messaggio se nessun giorno configurato
3. **Titolo Sezione**: Mostra titolo "Giorni di allenamento"

### UI/UX

- Layout verticale con spacing
- Titolo sezione visibile
- Card per ogni giorno
- Empty state con icona e messaggio
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Titolo "Giorni di allenamento" (se giorni presenti)
  ├── Lista Giorni (se giorni presenti)
  │   └── WorkoutDayCard (per ogni giorno)
  └── Empty State (se nessun giorno)
      └── Card
          └── CardContent
              ├── Icona FileText
              └── Messaggio "Nessun giorno configurato"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutDaysList } from '@/components/workout/workout-days-list'

function MyComponent() {
  const days = [
    {
      id: 'day-1',
      day_number: 1,
      title: 'Giorno 1 - Petto',
      exercises: [],
    },
    {
      id: 'day-2',
      day_number: 2,
      title: 'Giorno 2 - Schiena',
      exercises: [],
    },
  ]

  return <WorkoutDaysList days={days} />
}
```

## 🔍 Note Tecniche

### Empty State

Se `days.length === 0`, mostra:

- Card con icona `FileText`
- Messaggio "Nessun giorno di allenamento configurato per questa scheda"
- Stile centrato con padding verticale

### Ordinamento

I giorni sono visualizzati nell'ordine dell'array fornito. Non c'è ordinamento automatico per `day_number`.

### Limitazioni

- Non permette modifica (solo visualizzazione)
- Non gestisce drag & drop per riordinare
- Non mostra statistiche aggregate

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
