# Componente: WorkoutWizardStep3

## 📋 Descrizione

Terzo step del wizard per la creazione di schede di allenamento. Permette di selezionare gli esercizi per ogni giorno di allenamento configurato nello step precedente, utilizzando il componente `ExerciseCatalog`.

## 📁 Percorso File

`src/components/workout/wizard-steps/workout-wizard-step-3.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardStep3Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseSelect: (dayIndex: number, exercise: Exercise) => void
}
```

### Dettaglio Props

- **`wizardData`** (WorkoutWizardData, required): Dati correnti del wizard (contiene giorni con esercizi)
- **`exercises`** (array, required): Lista completa degli esercizi disponibili
- **`onExerciseSelect`** (function, required): Callback chiamato quando un esercizio viene selezionato (dayIndex, exercise)

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge` da `@/components/ui`

### Componenti Interni

- `ExerciseCatalog` da `../exercise-catalog`

### Types

- `WorkoutWizardData`, `Exercise` da `@/types/workout`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Giorni**: Mostra tutti i giorni configurati nello step 2
2. **Selezione Esercizi**: Per ogni giorno, permette di selezionare esercizi dal catalogo
3. **Tracking Esercizi**: Mostra il numero di esercizi selezionati per ogni giorno
4. **Integrazione Catalog**: Utilizza `ExerciseCatalog` per la selezione

### Validazione

- Richiede almeno un esercizio per ogni giorno (validato dal parent tramite `canProceed`)

### UI/UX

- Card separata per ogni giorno
- Badge con numero giorno e titolo
- Contatore esercizi selezionati
- Layout responsive con spacing ottimizzato

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header (titolo + descrizione)
  └── Lista Giorni
      └── Card (per ogni giorno)
          ├── CardHeader
          │   ├── Badge "Giorno N"
          │   ├── Titolo giorno
          │   └── Badge "N esercizi"
          └── CardContent
              └── ExerciseCatalog
                  ├── Filtri
                  └── Griglia esercizi
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardStep3 } from '@/components/workout/wizard-steps/workout-wizard-step-3'

function WizardComponent() {
  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  exercise_id: exercise.id,
                  target_sets: 3,
                  target_reps: 10,
                  target_weight: 0,
                  rest_timer_sec: 60,
                },
              ],
            }
          : day,
      ),
    }))
  }

  return (
    <WorkoutWizardStep3
      wizardData={wizardData}
      exercises={exercises}
      onExerciseSelect={addExerciseToDay}
    />
  )
}
```

## 🔍 Note Tecniche

### Integrazione ExerciseCatalog

- `ExerciseCatalog` riceve la lista completa degli esercizi
- `selectedExercises` viene calcolato mappando `day.exercises` per estrarre gli `exercise_id`
- Quando un esercizio viene selezionato, viene aggiunto al giorno corrispondente con valori di default

### Valori Default Esercizi

Quando un esercizio viene aggiunto, riceve:

- `target_sets`: 3
- `target_reps`: 10
- `target_weight`: 0
- `rest_timer_sec`: 60

Questi valori possono essere modificati nello step successivo (Step 4).

### Data Flow

- Il componente è completamente controllato
- Le modifiche vengono propagate al parent tramite `onExerciseSelect`
- Il parent gestisce l'aggiornamento dello stato `wizardData`

### Limitazioni

- Non permette di rimuovere esercizi (gestito nello step 4)
- Non permette di riordinare esercizi
- La validazione è delegata al parent

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
