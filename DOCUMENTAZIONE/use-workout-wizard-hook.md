# 📚 Documentazione Tecnica: useWorkoutWizard

**Percorso**: `src/hooks/workout/use-workout-wizard.ts`  
**Tipo Modulo**: React Hook (Wizard State Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per gestione wizard creazione workout (5 step). Gestisce stato wizard, navigazione step, validazione, e manipolazione dati workout (giorni, esercizi, target).

---

## 🔧 Funzioni e Export

### 1. `useWorkoutWizard`

**Classificazione**: React Hook, Wizard State Hook, Client Component  
**Tipo**: `(props: UseWorkoutWizardProps) => UseWorkoutWizardReturn`

**Parametri**:

- `isOpen` (boolean): Flag wizard aperto
- `initialAthleteId?` (string): ID atleta iniziale
- `initialData?` (WorkoutWizardData): Dati iniziali per edit
- `onSave` (function): `(workoutData: WorkoutWizardData) => Promise<void>` - Callback salvataggio

**Output**: Oggetto con:

- `currentStep`: `number` (1-5) - Step corrente
- `progress`: `number` (0-100) - Percentuale completamento
- `wizardData`: `WorkoutWizardData` - Dati wizard correnti
- `setWizardData`: `(data: WorkoutWizardData) => void` - Setter dati
- `isLoading`: `boolean` - Stato salvataggio
- `handleNext()`: `() => void` - Vai a step successivo
- `handlePrevious()`: `() => void` - Vai a step precedente
- `handleSave()`: `() => Promise<void>` - Salva workout
- `addDay()`: `() => void` - Aggiungi giorno
- `updateDay(index, data)`: `() => void` - Aggiorna giorno
- `addExerciseToDay(dayIndex, exercise)`: `() => void` - Aggiungi esercizio a giorno
- `updateExercise(dayIndex, exerciseIndex, data)`: `() => void` - Aggiorna esercizio
- `removeExercise(dayIndex, exerciseIndex)`: `() => void` - Rimuovi esercizio
- `canProceed()`: `() => boolean` - Verifica se può procedere
- `STEPS`: `Array<{ id, title, description }>` - Array step wizard

**Descrizione**: Hook completo per wizard creazione workout con:

- 5 step: Info generali, Giorni, Esercizi, Target, Riepilogo
- Validazione step-by-step
- Gestione giorni ed esercizi dinamica
- Reset automatico quando wizard si apre

---

## 🔄 Flusso Logico

### Step 1: Info Generali

- Validazione: `title` non vuoto, `athlete_id` selezionato
- Dati: title, notes, athlete_id, difficulty

### Step 2: Giorni

- Validazione: Almeno 1 giorno
- Operazioni: `addDay()`, `updateDay()`

### Step 3: Esercizi

- Validazione: Ogni giorno deve avere almeno 1 esercizio
- Operazioni: `addExerciseToDay()`, `removeExercise()`

### Step 4: Target

- Validazione: Nessuna (target opzionali)
- Operazioni: `updateExercise()` per target (sets, reps, weight, rest)

### Step 5: Riepilogo

- Validazione: Nessuna (tutto già validato)
- Operazioni: `handleSave()` → chiama `onSave(wizardData)`

### Navigazione

- `handleNext()`: Valida step corrente, avanza se valido
- `handlePrevious()`: Torna a step precedente
- `canProceed()`: Verifica validazione step corrente

---

## 📊 Dipendenze

**Dipende da**: Tipo `WorkoutWizardData`, `WorkoutDayData`, `WorkoutDayExerciseData`, `Exercise`

**Utilizzato da**: Componente `WorkoutWizard`

---

## ⚠️ Note Tecniche

- **Reset Automatico**: Reset quando `isOpen` cambia o `initialData` cambia
- **Validazione Step**: Validazione diversa per ogni step
- **Default Values**: Esercizi aggiunti con default (3 sets, 10 reps, 0 weight, 60s rest)

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
