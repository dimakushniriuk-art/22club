# 📚 Documentazione Tecnica: useWorkoutStats

**Percorso**: `src/hooks/workouts/use-workout-stats.ts`  
**Tipo Modulo**: React Hook (Workout Statistics Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per statistiche workout. Calcola statistiche complete allenamenti per atleta: totali, completati, set, sessioni, durata, esercizi.

---

## 🔧 Funzioni e Export

### 1. `useWorkoutStats`

**Classificazione**: React Hook, Statistics Hook, Client Component, Async  
**Tipo**: `() => UseWorkoutStatsReturn`

**Parametri**: Nessuno (usa stato interno)

**Output**: Oggetto con:

- `stats`: `WorkoutStats | null` - Statistiche workout
- `fetchStats(userId)`: `Promise<void>` - Fetch statistiche per atleta

**Descrizione**: Hook per calcolo statistiche workout con:

- Statistiche da `workout_plans` e `workout_sets`
- Statistiche da `workout_logs` (sessioni, durata, esercizi)
- Calcolo percentuale completamento
- Conteggio esercizi unici

---

## 🔄 Flusso Logico

### Fetch Stats

1. **Query Workout Plans**:
   - Query `workout_plans` con join `workout_days` → `workout_day_exercises` → `workout_sets`
   - WHERE `athlete_id = userId`
   - Calcola:
     - `total_workouts`: Count workout plans
     - `completed_workouts`: Count con `is_active = false`
     - `total_sets`: Count totale set
     - `completed_sets`: Count set con `completed_at IS NOT NULL`

2. **Query Workout Logs** (fallback se disponibile):
   - Query `workout_logs` WHERE `atleta_id = userId` OR `athlete_id = userId`
   - WHERE `stato IN ('completato', 'completed')`
   - Calcola:
     - `total_sessions`: Count log
     - `total_duration`: Sum `durata_minuti`
     - `total_exercises`: Sum `esercizi_totali` o `esercizi_completati`

3. **Calcolo Esercizi Unici**:
   - Estrae `exercise_id` unici da `workout_plans` → `workout_day_exercises`
   - Count esercizi unici

4. **Calcolo Finale**:
   - `active_workouts`: `total_workouts - completed_workouts`
   - `average_completion_rate`: `(completed_sets / total_sets) * 100`
   - `total_exercises`: Usa `workout_logs` se disponibile, altrimenti esercizi unici
   - `last_workout_date`: `created_at` del primo workout (più recente)

---

## 📊 Struttura WorkoutStats

```typescript
{
  total_workouts: number
  completed_workouts: number
  active_workouts: number
  total_sets: number
  completed_sets: number
  average_completion_rate: number(0 - 100)
  last_workout_date: string | null
  total_sessions: number
  total_duration: number(minuti)
  total_exercises: number
}
```

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `WorkoutStats`, `Tables`

**Utilizzato da**: Componenti dashboard statistiche workout

---

## ⚠️ Note Tecniche

- **Multi-Source**: Combina dati da `workout_plans`, `workout_sets`, e `workout_logs`
- **Fallback**: Gestisce errori query `workout_logs` gracefully
- **Compatibility**: Supporta sia `atleta_id` che `athlete_id` per compatibilità

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
