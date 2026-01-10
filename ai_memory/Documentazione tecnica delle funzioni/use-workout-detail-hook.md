# 📚 Documentazione Tecnica: useWorkoutDetail

**Percorso**: `src/hooks/workout/use-workout-detail.ts`  
**Tipo Modulo**: React Hook (Workout Detail Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per caricamento dettaglio completo workout. Carica scheda allenamento con giorni, esercizi per giorno, e informazioni atleta/staff. Gestisce errori gracefully con fallback per tabelle non disponibili.

---

## 🔧 Funzioni e Export

### 1. `useWorkoutDetail`

**Classificazione**: React Hook, Data Loading Hook, Client Component, Async  
**Tipo**: `(workoutId: string | null, open: boolean) => UseWorkoutDetailReturn`

**Parametri**:

- `workoutId` (string | null): UUID della scheda allenamento
- `open` (boolean): Flag per indicare se modal/drawer è aperto (carica solo se aperto)

**Output**: Oggetto con:

- `workout`: `WorkoutDetail | null` - Dettaglio completo workout
- `loading`: `boolean` - Stato caricamento
- `error`: `Error | null` - Errore caricamento

**Descrizione**: Hook per fetch dettaglio workout completo con:

- Scheda base (`workout_plans`)
- Giorni allenamento (`workout_days`)
- Esercizi per giorno (`workout_day_exercises` con join `exercises`)
- Informazioni atleta e staff (`profiles`)
- Gestione errori graceful (continua senza giorni se tabella non disponibile)

---

## 🔄 Flusso Logico

### Fetch Workout Detail

1. Verifica `workoutId` e `open` (carica solo se aperto)
2. **Query Scheda Base**:
   - Query `workout_plans` WHERE `id = workoutId`
   - Estrae: id, name, description, is_active, athlete_id, created_by, dates
3. **Query Giorni** (con error handling):
   - Query `workout_days` WHERE `workout_plan_id = workoutId`
   - ORDER BY `day_number` ASC
   - Se errore (tabella non disponibile) → continua con array vuoto
4. **Query Esercizi per Giorno** (per ogni giorno):
   - Query `workout_day_exercises` con join `exercises`
   - WHERE `workout_day_id = day.id`
   - ORDER BY `order_index` ASC
   - Estrae: target_sets, target_reps, target_weight, rest_timer_sec
5. **Query Profili** (parallel):
   - Query `profiles` per atleta (WHERE `id = athlete_id`)
   - Query `profiles` per staff (WHERE `user_id = created_by`)
6. **Trasformazione Dati**:
   - Mappa a tipo `WorkoutDetail`
   - Combina nomi atleta/staff
   - Ordina esercizi per `order_index`
   - Gestisce valori null/undefined con default

---

## 📊 Struttura Dati

### WorkoutDetail

```typescript
{
  id: string
  name: string
  description: string | null
  status: 'attivo' | 'completato'
  difficulty: string | null
  created_at: string
  updated_at: string
  athlete_id: string | null
  athlete_name: string
  staff_name: string
  days: Array<{
    id: string
    day_number: number
    title: string
    exercises: Array<{
      id: string
      exercise_id: string | null
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

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `WorkoutDetail`

**Utilizzato da**: Componenti modal/drawer dettaglio workout

---

## ⚠️ Note Tecniche

- **Error Handling**: Gestisce gracefully errori tabella non disponibile (continua senza giorni)
- **Lazy Loading**: Carica solo se `open = true` (performance)
- **Join Esercizi**: Usa Supabase join per caricare nomi esercizi
- **Default Values**: Gestisce valori null/undefined con default appropriati

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
