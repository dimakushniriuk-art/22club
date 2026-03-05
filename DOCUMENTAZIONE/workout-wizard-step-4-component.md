# Componente: WorkoutWizardStep4

## 📋 Descrizione

Quarto step del wizard per la creazione di schede di allenamento. Permette di configurare i parametri di ogni esercizio (serie, ripetizioni, peso, recupero) con validazione in tempo reale.

## 📁 Percorso File

`src/components/workout/wizard-steps/workout-wizard-step-4.tsx`

## 🔧 Props

```typescript
interface WorkoutWizardStep4Props {
  wizardData: WorkoutWizardData
  exercises: Exercise[]
  onExerciseUpdate: (
    dayIndex: number,
    exerciseIndex: number,
    data: Partial<WorkoutDayExerciseData>,
  ) => void
  onExerciseRemove: (dayIndex: number, exerciseIndex: number) => void
}
```

### Dettaglio Props

- **`wizardData`** (WorkoutWizardData, required): Dati correnti del wizard
- **`exercises`** (array, required): Lista completa degli esercizi (per recuperare nome e dettagli)
- **`onExerciseUpdate`** (function, required): Callback per aggiornare parametri di un esercizio
- **`onExerciseRemove`** (function, required): Callback per rimuovere un esercizio

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Target`, `X`, `AlertCircle` da `lucide-react`

### Types

- `WorkoutWizardData`, `Exercise`, `WorkoutDayExerciseData` da `@/types/workout`
- `WorkoutTarget` da `@/lib/validations/workout-target`

### Validations

- `validateWorkoutTarget` da `@/lib/validations/workout-target`

## ⚙️ Funzionalità

### Core

1. **Configurazione Parametri**: Permette di impostare serie, ripetizioni, peso e recupero per ogni esercizio
2. **Validazione Real-time**: Valida i parametri in tempo reale mostrando errori e warning
3. **Rimozione Esercizi**: Permette di rimuovere esercizi non più necessari
4. **Visualizzazione Esercizi**: Mostra tutti gli esercizi organizzati per giorno

### Validazione

Utilizza `validateWorkoutTarget` per validare:

- **Serie**: Minimo 1, massimo ragionevole
- **Ripetizioni**: Minimo 1, massimo ragionevole
- **Peso**: Opzionale, se presente deve essere >= 0
- **Recupero**: Minimo 10 secondi, massimo 600 secondi

Mostra:

- **Errori** (rosso): Bloccano il salvataggio
- **Warning** (giallo): Avvisi ma non bloccano

### UI/UX

- Card separata per ogni giorno
- Input numerici per ogni parametro
- Validazione visiva con icone e messaggi
- Pulsante rimozione per ogni esercizio
- Empty state se nessun esercizio nel giorno

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header (titolo + descrizione)
  └── Lista Giorni
      └── Card (per ogni giorno)
          ├── CardHeader
          │   ├── Badge "Giorno N"
          │   └── Titolo giorno
          └── CardContent
              └── Lista Esercizi
                  └── div (per ogni esercizio)
                      ├── Header esercizio
                      │   ├── Nome esercizio
                      │   └── Button (rimuovi)
                      ├── Grid Input (4 colonne)
                      │   ├── Input "Serie"
                      │   ├── Input "Ripetizioni"
                      │   ├── Input "Peso (kg)"
                      │   └── Input "Recupero (sec)"
                      └── Validazione
                          ├── Errori (rosso)
                          └── Warning (giallo)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { WorkoutWizardStep4 } from '@/components/workout/wizard-steps/workout-wizard-step-4'

function WizardComponent() {
  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    data: Partial<WorkoutDayExerciseData>,
  ) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) =>
                j === exerciseIndex ? { ...ex, ...data } : ex,
              ),
            }
          : day,
      ),
    }))
  }

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setWizardData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((_, j) => j !== exerciseIndex),
            }
          : day,
      ),
    }))
  }

  return (
    <WorkoutWizardStep4
      wizardData={wizardData}
      exercises={exercises}
      onExerciseUpdate={updateExercise}
      onExerciseRemove={removeExercise}
    />
  )
}
```

## 🔍 Note Tecniche

### Validazione Real-time

- Utilizza `useEffect` per validare tutti gli esercizi quando `wizardData` cambia
- Crea una mappa di validazioni keyed per `${dayIndex}-${exerciseIndex}`
- Mostra errori e warning in tempo reale sotto ogni esercizio

### Limiti Input

- **Serie**: min="1", max="20"
- **Ripetizioni**: min="1", max="100"
- **Peso**: min="0", step="0.5", placeholder="0"
- **Recupero**: min="10", max="600"

### Data Flow

- Il componente è completamente controllato
- Le modifiche vengono propagate al parent tramite callbacks
- La validazione è locale ma i risultati possono essere usati dal parent

### Performance

- La validazione viene eseguita su tutti gli esercizi ad ogni cambio
- Per schede con molti esercizi, potrebbe essere ottimizzata con debounce

### Limitazioni

- Non permette di riordinare esercizi
- La validazione non blocca la navigazione (gestita dal parent)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
