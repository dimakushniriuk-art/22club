# 📚 Documentazione Tecnica: useWorkoutSession

**Percorso**: `src/hooks/workouts/use-workout-session.ts`  
**Tipo Modulo**: React Hook (Current Workout Session Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per sessione workout corrente. Carica scheda allenamento attiva per atleta con primo giorno, esercizi, set completati, e calcolo progresso.

---

## 🔧 Funzioni e Export

### 1. `useWorkoutSession`

**Classificazione**: React Hook, Data Loading Hook, Client Component, Async  
**Tipo**: `() => UseWorkoutSessionReturn`

**Parametri**: Nessuno (usa stato interno)

**Output**: Oggetto con:

- `currentWorkout`: `WorkoutSession | null` - Sessione workout corrente
- `fetchCurrentWorkout(userId)`: `Promise<void>` - Fetch sessione per atleta

**Descrizione**: Hook per fetch sessione workout corrente con:

- Query scheda attiva (`is_active = true`) per atleta
- Carica primo giorno con esercizi e set
- Calcola progresso (esercizi completati / totali)
- Fallback se join non disponibili

---

## 🔄 Flusso Logico

### Fetch Current Workout

1. **Query Workout Plan**:
   - Query `workout_plans` con join:
     - `workout_days` → `workout_day_exercises` → `exercises` e `workout_sets`
   - WHERE `athlete_id = userId` AND `is_active = true`
   - ORDER BY `created_at` DESC LIMIT 1

2. **Fallback** (se join falliscono):
   - Query base `workout_plans` senza join
   - Crea `WorkoutSession` minimale con esercizi vuoti

3. **Trasformazione**:
   - Estrae primo giorno (`workout_days[0]`)
   - Mappa esercizi con set completati
   - Normalizza difficoltà (`difficultyMap`)
   - Calcola:
     - `total_exercises`: Count esercizi
     - `completed_exercises`: Count esercizi completati (tutti set completati)
     - `progress_percentage`: `(completed_exercises / total_exercises) * 100`

---

## 📊 Struttura WorkoutSession

```typescript
{
  id: string
  workout_id: string
  workout_day_id: string
  day_title: string
  date: string
  total_exercises: number
  completed_exercises: number
  progress_percentage: number(0 - 100)
  exercises: Array<{
    id: string
    exercise: Exercise | null
    target_sets: number
    target_reps: number
    target_weight: number | null
    rest_timer_sec: number
    order_index: number
    sets: Array<{
      id: string
      set_number: number
      reps: number
      weight_kg: number | null
      completed_at: string | null
      is_completed: boolean
    }>
    is_completed: boolean
  }>
}
```

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `WorkoutSession`, `Exercise`, `Tables`, `difficultyMap`

**Utilizzato da**: Componenti dashboard atleta per scheda corrente

---

## ⚠️ Note Tecniche

- **Primo Giorno**: Carica solo primo giorno della scheda attiva
- **Fallback**: Gestisce gracefully errori join con query base
- **Normalizzazione Difficoltà**: Mappa difficoltà database a tipo standard ('bassa' | 'media' | 'alta')
- **Compatibilità Colonne**: Supporta sia `reps` che `reps_completed`, `weight_kg` che `weight_used`

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
