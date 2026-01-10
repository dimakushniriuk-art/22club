# Componente: WorkoutExerciseItem

## 📋 Descrizione

Componente per visualizzare un singolo esercizio all'interno di un giorno di allenamento. Mostra nome, serie, ripetizioni, peso e tempo di recupero.

## 📁 Percorso File

`src/components/workout/workout-exercise-item.tsx`

## 🔧 Props

```typescript
interface WorkoutExerciseItemProps {
  exercise: {
    id: string
    exercise_name: string
    target_sets: number
    target_reps: number
    target_weight: number | null
    rest_timer_sec: number
    order_index: number
  }
  index: number
}
```

### Dettaglio Props

- **`exercise`** (object, required): Oggetto esercizio con tutti i dettagli
- **`index`** (number, required): Indice dell'esercizio nella lista (per numerazione)

## 📦 Dipendenze

### UI Components

- `Clock` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Esercizio**: Mostra nome e dettagli dell'esercizio
2. **Numerazione**: Mostra numero progressivo dell'esercizio
3. **Metriche**: Mostra serie, ripetizioni, peso e recupero
4. **Peso Condizionale**: Mostra peso solo se presente e > 0

### UI/UX

- Card con background semi-trasparente
- Hover effect con cambio bordo
- Grid layout per metriche (2 colonne su mobile, 4 su desktop)
- Badge numerico per ordine
- Icona clock per recupero
- Layout responsive

## 🎨 Struttura UI

```
Container (card con border)
  ├── Header
  │   ├── Badge "#{index + 1}"
  │   └── Nome esercizio (h5, bold)
  └── Grid Metriche (grid-cols-2 md:grid-cols-4)
      ├── Serie
      │   ├── Label "Serie"
      │   └── Valore (bold, large)
      ├── Ripetizioni
      │   ├── Label "Ripetizioni"
      │   └── Valore (bold, large)
      ├── Peso (se presente)
      │   ├── Label "Peso"
      │   └── Valore "X kg" (bold, large)
      └── Recupero
          ├── Label "Recupero"
          └── Valore con icona clock "Xs" (bold, large)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutExerciseItem } from '@/components/workout/workout-exercise-item'

function MyComponent() {
  const exercise = {
    id: 'ex-1',
    exercise_name: 'Panca piana',
    target_sets: 4,
    target_reps: 10,
    target_weight: 80,
    rest_timer_sec: 90,
    order_index: 0,
  }

  return <WorkoutExerciseItem exercise={exercise} index={0} />
}
```

## 🔍 Note Tecniche

### Visualizzazione Peso

Il peso viene mostrato solo se:

- `target_weight !== null`
- `target_weight > 0`

Altrimenti la colonna peso non viene renderizzata.

### Grid Responsive

- **Mobile**: `grid-cols-2` (2 colonne)
- **Desktop**: `md:grid-cols-4` (4 colonne)

### Formattazione Valori

- **Serie/Ripetizioni**: Numero intero
- **Peso**: Numero + " kg"
- **Recupero**: Numero + "s" con icona clock

### Limitazioni

- Non permette modifica (solo visualizzazione)
- Non mostra video o immagini esercizio
- Non mostra note aggiuntive

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
