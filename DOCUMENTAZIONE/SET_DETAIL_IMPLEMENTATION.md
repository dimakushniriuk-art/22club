# Implementazione Set Individuali per Workout

## Data: 2025-01-30

## Riepilogo

È stata implementata la funzionalità per aggiungere serie individuali configurate per ogni esercizio nel wizard di creazione/modifica workout.

## Schema Database

**Nessuna modifica necessaria.** La tabella `workout_sets` esiste già e supporta questa funzionalità:

```sql
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY,
  workout_day_exercise_id UUID REFERENCES workout_day_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(5, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Modifiche al Codice

### 1. Tipo TypeScript (`src/types/workout.ts`)

- Aggiunto tipo `WorkoutSetDetail` per rappresentare una singola serie
- Aggiunto campo opzionale `sets_detail?: WorkoutSetDetail[]` a `WorkoutDayExerciseData`

### 2. Componente Step 4 (`src/components/workout/wizard-steps/workout-wizard-step-4.tsx`)

- Convertita sezione target in tabella HTML strutturata
- Aggiunto pulsante "Aggiungi serie" per aggiungere serie individuali
- Implementata visualizzazione serie aggiunte con possibilità di modifica e rimozione
- Ogni serie mostra numero serie, ripetizioni e peso configurabili

### 3. Hook Workout Plans (`src/hooks/workout-plans/use-workout-plans.ts`)

- Aggiornato `handleCreateWorkout` per salvare set individuali in `workout_sets`
- Aggiornato `handleUpdateWorkout` per salvare set individuali in `workout_sets`
- I set vengono inseriti dopo la creazione di ogni `workout_day_exercise` utilizzando l'ID restituito

## Flusso Dati

1. **Creazione**: Quando l'utente aggiunge serie nel wizard, vengono salvate in `exercise.sets_detail[]`
2. **Salvataggio**: Al salvataggio della scheda:
   - Viene creato `workout_day_exercises`
   - Se `sets_detail` è presente, ogni set viene inserito in `workout_sets` con `workout_day_exercise_id`
3. **Eliminazione**: I set vengono eliminati automaticamente via CASCADE quando si elimina l'esercizio

## Note

- La funzionalità è opzionale: se `sets_detail` non è presente, l'esercizio viene salvato normalmente con i valori target standard
- I set vengono salvati solo se l'utente li aggiunge esplicitamente nel wizard
- Per il caricamento dei set esistenti durante la modifica, sarà necessario implementare la logica di caricamento da `workout_sets` (non ancora implementata)
