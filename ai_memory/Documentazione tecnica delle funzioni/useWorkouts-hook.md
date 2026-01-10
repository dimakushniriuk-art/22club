# 📋 useWorkouts Hook - Documentazione Tecnica

**File**: `src/hooks/use-workouts.ts`  
**Classificazione**: React Hook, Client Component, Side-Effecting, Async  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:15:00Z

---

## 📋 Panoramica

Hook React personalizzato per gestire operazioni CRUD su schede allenamento (workouts). Fornisce funzionalità complete per creare, leggere, aggiornare schede multi-giorno, gestire esercizi per giorno, tracking set completati, e statistiche allenamenti. Supporta filtri basati sul ruolo utente (atleta, PT, admin).

---

## 🔧 Parametri

### Input

```typescript
interface UseWorkoutsProps {
  userId?: string | null // ID utente (profile.id)
  role?: string | null // Ruolo utente: 'atleta' | 'pt' | 'admin'
}
```

**Parametri**:

- `userId` (opzionale): ID dell'utente corrente. Se non fornito, il hook non caricherà dati.
- `role` (opzionale): Ruolo dell'utente per filtrare le schede:
  - `'atleta'`: Vede solo le proprie schede attive
  - `'pt'` o `'admin'`: Vede tutte le schede create da loro

---

## 📤 Output

```typescript
{
  workouts: Workout[]                    // Array di schede allenamento
  exercises: Exercise[]                  // Array di esercizi dal catalogo
  currentWorkout: WorkoutSession | null // Scheda corrente per atleta
  stats: WorkoutStats | null            // Statistiche allenamenti
  loading: boolean                       // Stato caricamento
  error: string | null                   // Errore eventuale
  fetchWorkouts: () => Promise<void>     // Ricarica schede
  fetchCurrentWorkout: () => Promise<void>  // Ricarica scheda corrente
  fetchExercises: () => Promise<void>   // Ricarica esercizi
  createWorkout: (data) => Promise<WorkoutPlanRow>
  updateWorkoutSet: (id, data) => Promise<WorkoutSetRow>
  completeExercise: (id) => Promise<boolean>
  refetch: () => Promise<void>          // Alias di fetchWorkouts
}
```

**Proprietà**:

- `workouts`: Array di schede allenamento caricate, trasformate con nomi atleta/staff
- `exercises`: Array di esercizi dal catalogo (per selezione in wizard)
- `currentWorkout`: Scheda attiva corrente per atleta (con esercizi e set)
- `stats`: Statistiche allenamenti (totale schede, set completati, etc.)
- `loading`: `true` durante il caricamento iniziale o refetch
- `error`: Messaggio di errore se presente, `null` altrimenti
- `fetchWorkouts`: Ricarica manualmente le schede
- `fetchCurrentWorkout`: Ricarica la scheda corrente (solo per atleta)
- `fetchExercises`: Ricarica il catalogo esercizi
- `createWorkout`: Crea una nuova scheda
- `updateWorkoutSet`: Aggiorna un set di allenamento
- `completeExercise`: Completa tutti i set di un esercizio
- `refetch`: Alias di `fetchWorkouts`

---

## 🔄 Flusso Logico

### 1. Caricamento Esercizi (`fetchExercises`)

```typescript
const fetchExercises = useCallback(async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })
    .returns<ExerciseRow[]>()

  const safeData: Exercise[] = (data ?? []).map((exercise) => ({
    id: exercise.id ?? '',
    name: exercise.name ?? '',
    category: exercise.category ?? 'Generale',
    muscle_group: exercise.muscle_group ?? '',
    difficulty: difficultyMap[exercise.difficulty ?? ''] ?? 'media',
    // ... altri campi
  }))
  setExercises(safeData)
}, [supabase])
```

**Comportamento**:

- Carica tutti gli esercizi dal catalogo
- Ordina per nome
- Normalizza difficoltà (easy/medium/hard → bassa/media/alta)
- Trasforma in formato `Exercise` type-safe

### 2. Caricamento Schede (`fetchWorkouts`)

```typescript
let query = supabase.from('workout_plans').select(`
  *,
  athlete:profiles!workout_plans_athlete_id_fkey(nome, cognome, user_id),
  created_by:profiles!workout_plans_created_by_fkey(nome, cognome, user_id)
`)

if (role === 'atleta') {
  query = query.eq('athlete_id', userId)
} else if (role === 'pt' || role === 'admin') {
  query = query.eq('created_by', userId)
}
```

**Filtri per Ruolo**:

- **Atleta**: Solo proprie schede (`athlete_id = userId`)
- **PT/Admin**: Solo schede create da loro (`created_by = userId`)

**Trasformazione Dati**:

- Combina `nome` e `cognome` in `athlete_name` e `staff_name`
- Normalizza difficoltà
- Mappa status (attivo/completato/archiviato)

**Nota**: ⚠️ Usa tabella `workout_plans` (vedi P1-008 per duplicazione con `workouts`)

### 3. Caricamento Scheda Corrente (`fetchCurrentWorkout`)

```typescript
const { data, error } = await supabase
  .from('workout_plans')
  .select(
    `
    *,
    workout_days(
      id,
      day_number,
      title,
      workout_day_exercises(
        id,
        exercise_id,
        target_sets,
        target_reps,
        target_weight,
        rest_timer_sec,
        order_index,
        exercises(id, name, muscle_group, difficulty),
        workout_sets(id, set_number, reps, weight_kg, completed_at)
      )
    )
  `,
  )
  .eq('athlete_id', userId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(1)
  .single()
```

**Comportamento**:

- Carica scheda attiva più recente per atleta
- Include giorni, esercizi per giorno, e set completati
- Trasforma in formato `WorkoutSession` con progresso

**Fallback**: Se query con relazioni fallisce, prova query base senza relazioni

### 4. Calcolo Statistiche (`fetchStats`)

```typescript
const totalWorkouts = data?.length || 0
const completedWorkouts = data?.filter((w) => w.is_active === false).length || 0
const totalSets =
  data?.reduce(
    (total, workout) =>
      total +
      (workout.workout_days ?? []).reduce(
        (dayTotal, day) =>
          dayTotal +
          (day.workout_day_exercises ?? []).reduce(
            (exTotal, ex) => exTotal + (ex.workout_sets?.length ?? 0),
            0,
          ),
        0,
      ),
    0,
  ) || 0
const completedSets =
  data?.reduce(
    (total, workout) =>
      total +
      (workout.workout_days ?? []).reduce(
        (dayTotal, day) =>
          dayTotal +
          (day.workout_day_exercises ?? []).reduce(
            (exTotal, ex) =>
              exTotal + (ex.workout_sets ?? []).filter((set) => Boolean(set.completed_at)).length,
            0,
          ),
        0,
      ),
    0,
  ) || 0

const stats: WorkoutStats = {
  total_workouts: totalWorkouts,
  completed_workouts: completedWorkouts,
  total_sets: totalSets,
  completed_sets: completedSets,
  average_completion_rate: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
  last_workout_date: data?.[0]?.created_at,
}
```

**Statistiche Calcolate**:

- `total_workouts`: Numero totale schede
- `completed_workouts`: Schede completate (`is_active = false`)
- `total_sets`: Numero totale set in tutte le schede
- `completed_sets`: Set completati (con `completed_at`)
- `average_completion_rate`: Percentuale completamento (0-100)
- `last_workout_date`: Data ultima scheda

**Nota**: ⚠️ **Manca calcolo volume totale** (vedi P4-010)

### 5. Creazione Scheda (`createWorkout`)

```typescript
const createWorkout = async (workoutData: TablesInsert<'workout_plans'>) => {
  const { data, error } = await supabase.from('workout_plans').insert(workoutData).select().single()

  if (error) throw error

  await fetchWorkouts()
  return data
}
```

**Comportamento**:

- Inserisce nuova scheda in `workout_plans`
- Ricarica automaticamente la lista
- Ritorna scheda creata

### 6. Aggiornamento Set (`updateWorkoutSet`)

```typescript
const updateWorkoutSet = async (
  workoutDayExerciseId: string,
  setData: TablesInsert<'workout_sets'> | TablesUpdate<'workout_sets'>,
) => {
  const { data, error } = await supabase.from('workout_sets').upsert(setData).select().single()

  if (error) throw error

  await fetchCurrentWorkout()
  return data
}
```

**Comportamento**:

- Upsert set (INSERT se non esiste, UPDATE se esiste)
- Ricarica scheda corrente dopo aggiornamento
- Ritorna set aggiornato

### 7. Completamento Esercizio (`completeExercise`)

```typescript
const completeExercise = async (workoutDayExerciseId: string) => {
  const { error } = await supabase
    .from('workout_sets')
    .update({ completed_at: new Date().toISOString() })
    .eq('workout_day_exercise_id', workoutDayExerciseId)
    .is('completed_at', null)

  if (error) throw error

  await fetchCurrentWorkout()
  return true
}
```

**Comportamento**:

- Marca tutti i set non completati come completati
- Imposta `completed_at` a timestamp corrente
- Ricarica scheda corrente

---

## ⚠️ Errori Possibili

### Errori Database

- **RLS Policy Error**: Se RLS policies bloccano accesso
  - Sintomo: `0 righe visibili` o `permission denied`
  - Fix: Verificare RLS policies (vedi P1-001)

- **Foreign Key Error**: Se `athlete_id` o `exercise_id` non esistono
  - Sintomo: `Foreign key constraint violation`
  - Fix: Verificare che profili/esercizi esistano

- **Relationship Error**: Se relazioni nested non disponibili
  - Sintomo: `PGRST116` o warning in console
  - Fix: Fallback a query base senza relazioni (già implementato)

### Errori Network

- **Timeout**: Query troppo lente con relazioni nested
  - Sintomo: Timeout o errore network
  - Fix: Ottimizzare query, aggiungere indici

### Errori Trasformazione

- **Missing Data**: Se dati nested mancanti
  - Sintomo: `undefined` o `null` in dati trasformati
  - Fix: Gestito con fallback e nullish coalescing

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Supabase Client** (`@/lib/supabase`)
   - Richiesto per tutte le operazioni database

2. **React Hooks** (`useState`, `useEffect`, `useCallback`)
   - Gestione stato e side-effects

3. **Database Schema** (4 tabelle):
   - `workout_plans` (schede) - ⚠️ DUPLICATO con `workouts`
   - `workout_days` (giorni)
   - `workout_day_exercises` (esercizi per giorno)
   - `workout_sets` (set completati)

### Dipendenze Interne

- **Profiles Table**: Per join con nomi atleta/staff
- **Exercises Table**: Per catalogo esercizi
- **Types** (`@/types/workout`, `@/types/supabase`): Type safety

---

## 📝 Esempi d'Uso

### Esempio 1: Caricare Schede PT

```typescript
import { useWorkouts } from '@/hooks/use-workouts'
import { useAuth } from '@/hooks/use-auth'

function SchedePage() {
  const { user } = useAuth()
  const { workouts, loading, error } = useWorkouts({
    userId: user?.id,
    role: 'pt'
  })

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>

  return (
    <div>
      {workouts.map(workout => (
        <div key={workout.id}>
          {workout.name} - {workout.athlete_name}
        </div>
      ))}
    </div>
  )
}
```

### Esempio 2: Scheda Corrente Atleta

```typescript
const { currentWorkout, stats } = useWorkouts({
  userId: athleteId,
  role: 'atleta',
})

if (currentWorkout) {
  console.log('Esercizi:', currentWorkout.exercises)
  console.log('Progresso:', currentWorkout.progress_percentage)
}

if (stats) {
  console.log('Set completati:', stats.completed_sets)
  console.log('Tasso completamento:', stats.average_completion_rate)
}
```

### Esempio 3: Creare Scheda

```typescript
const { createWorkout } = useWorkouts({ userId, role: 'pt' })

const handleCreate = async () => {
  try {
    const newWorkout = await createWorkout({
      athlete_id: athleteId,
      name: 'Scheda Forza - Settimana 1',
      description: 'Focus su forza massimale',
      is_active: true,
      start_date: '2025-02-01',
      end_date: '2025-02-28',
    })
    console.log('Scheda creata:', newWorkout)
  } catch (err) {
    console.error('Errore:', err)
  }
}
```

### Esempio 4: Aggiornare Set

```typescript
const { updateWorkoutSet } = useWorkouts({ userId, role: 'atleta' })

const handleSetComplete = async (exerciseId: string, setNumber: number) => {
  try {
    await updateWorkoutSet(exerciseId, {
      workout_day_exercise_id: exerciseId,
      set_number: setNumber,
      reps: 10,
      weight_kg: 80,
      completed_at: new Date().toISOString(),
    })
    // Scheda corrente ricaricata automaticamente
  } catch (err) {
    console.error('Errore:', err)
  }
}
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Query Database**: Tutte le operazioni eseguono query Supabase
2. **State Updates**: Aggiorna `workouts`, `exercises`, `currentWorkout`, `stats`, `loading`, `error`
3. **Auto-Refetch**: Dopo create/update, ricarica automaticamente dati
4. **Console Logging**: Log errori per debugging

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Memoization**: Funzioni fetch memoizzate con `useCallback`
- **Query Nested**: Usa relazioni Supabase per ridurre chiamate multiple
- **Fallback**: Se relazioni non disponibili, usa query base

### Limitazioni

- **Nessuna Paginazione**: Carica tutte le schede in una volta
- **Nessuna Cache**: Ogni refetch ricarica tutto dal database
- **Nessun Optimistic Update**: Le operazioni attendono risposta server
- **Duplicazione Tabelle**: Usa `workout_plans` ma esiste anche `workouts` (vedi P1-008)

### Miglioramenti Futuri

- Integrare React Query per caching e optimistic updates
- Aggiungere paginazione per grandi volumi
- Unificare tabelle `workouts` e `workout_plans`
- Aggiungere calcolo volume totale nelle statistiche (vedi P4-010)

---

## 📚 Changelog

### 2025-01-29T17:15:00Z - Documentazione Iniziale

- ✅ Documentazione completa hook `useWorkouts`
- ✅ Descrizione funzioni CRUD e statistiche
- ✅ Esempi d'uso
- ✅ Gestione errori
- ⚠️ Identificato problema P1-008 (duplicazione tabelle)
- ⚠️ Identificato problema P4-010 (volume totale mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `WorkoutWizard` component
