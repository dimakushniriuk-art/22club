# 📚 Documentazione Tecnica: useWorkoutMutations

**Percorso**: `src/hooks/workouts/use-workout-mutations.ts`  
**Tipo Modulo**: React Hook (Workout Mutations Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per mutazioni workout. Fornisce funzioni per creare workout, aggiornare set workout, e completare esercizi.

---

## 🔧 Funzioni e Export

### 1. `useWorkoutMutations`

**Classificazione**: React Hook, Mutation Hook, Client Component, Async  
**Tipo**: `() => UseWorkoutMutationsReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `createWorkout(workoutData)`: `Promise<WorkoutPlanRow>` - Crea nuova scheda workout
- `updateWorkoutSet(workoutDayExerciseId, setData)`: `Promise<WorkoutSetRow>` - Aggiorna/crea set workout
- `completeExercise(workoutDayExerciseId)`: `Promise<boolean>` - Marca esercizio come completato

**Descrizione**: Hook per operazioni mutazione workout con:

- Creazione workout plan
- Upsert set workout (INSERT o UPDATE)
- Completamento esercizio (UPDATE `completed_at`)

---

## 🔄 Flusso Logico

### Create Workout

1. INSERT in `workout_plans` con `workoutData`
2. SELECT e ritorna record creato

### Update Workout Set

1. UPSERT in `workout_sets` con `setData`
2. Se esiste → UPDATE, se non esiste → INSERT
3. SELECT e ritorna record aggiornato/creato

### Complete Exercise

1. UPDATE `workout_sets`:
   - SET `completed_at = NOW()`
   - WHERE `workout_day_exercise_id = workoutDayExerciseId` AND `completed_at IS NULL`
2. Ritorna `true` se successo

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `Tables`, `TablesInsert`, `TablesUpdate`

**Utilizzato da**: Componenti workout per operazioni CRUD

---

## ⚠️ Note Tecniche

- **Upsert**: `updateWorkoutSet` usa UPSERT per gestire INSERT/UPDATE automaticamente
- **Completamento**: `completeExercise` aggiorna solo set non ancora completati (`completed_at IS NULL`)

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
