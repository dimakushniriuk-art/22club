# 📚 Documentazione Tecnica: useWorkoutPlansList

**Percorso**: `src/hooks/workouts/use-workout-plans-list.ts`  
**Tipo Modulo**: React Hook (Workout Plans List Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per lista workout plans. Carica lista schede allenamento con filtri basati su ruolo utente (atleta vede solo proprie schede, PT/admin vede schede create da loro).

---

## 🔧 Funzioni e Export

### 1. `useWorkoutPlansList`

**Classificazione**: React Hook, Data Loading Hook, Client Component, Async  
**Tipo**: `() => UseWorkoutPlansListReturn`

**Parametri**: Nessuno (usa stato interno)

**Output**: Oggetto con:

- `workouts`: `Workout[]` - Array schede workout
- `loading`: `boolean` - Stato caricamento
- `error`: `string | null` - Errore caricamento
- `fetchWorkouts(userId, role)`: `Promise<void>` - Fetch lista workout

**Descrizione**: Hook per fetch lista workout plans con:

- Filtri basati su ruolo:
  - `'atleta'`: WHERE `athlete_id = userId`
  - `'pt'` o `'admin'`: WHERE `created_by = userId`
- Join con profili atleta e staff
- Trasformazione dati a tipo `Workout`
- Ordinamento per `created_at` DESC

---

## 🔄 Flusso Logico

### Fetch Workouts

1. Verifica `userId` (se null, esce)
2. Query `workout_plans` con join:
   - Join `profiles` per atleta (`athlete_id_fkey`)
   - Join `profiles` per staff (`created_by_fkey`)
3. Applica filtro basato su `role`:
   - Atleta: `athlete_id = userId`
   - PT/Admin: `created_by = userId`
4. ORDER BY `created_at` DESC
5. Trasforma dati:
   - Mappa a tipo `Workout`
   - Combina nomi atleta/staff
   - Trasforma `difficulty` con `getDifficultyFromDb()`
   - Mappa `is_active` a `status` ('attivo' | 'completato')

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `Workout`, `Tables`, `getDifficultyFromDb` (transformer)

**Utilizzato da**: Componenti lista workout

---

## ⚠️ Note Tecniche

- **Role-Based Filtering**: Filtri diversi per atleta vs PT/admin
- **Join Profili**: Join automatici per nomi atleta e staff
- **Trasformazione**: Trasforma dati database a tipo `Workout` con valori default

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
