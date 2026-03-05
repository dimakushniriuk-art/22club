# 📚 Documentazione Tecnica: useAthleteStats

**Percorso**: `src/hooks/home-profile/use-athlete-stats.ts`  
**Tipo Modulo**: React Hook (Stats Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per statistiche atleta home. Calcola allenamenti totali/mese, streak, peso, lezioni rimanenti, e progress score usando RPC functions e dati profilo.

---

## 🔧 Funzioni e Export

### 1. `useAthleteStats`

**Classificazione**: React Hook, Stats Hook, Client Component, Async  
**Tipo**: `(props: UseAthleteStatsProps) => UseAthleteStatsReturn`

**Parametri**:

- `props`: `UseAthleteStatsProps`
  - `athleteUserId`: `string | null` - ID utente atleta
  - `authLoading`: `boolean` - Stato caricamento auth
  - `anagrafica`: `{ peso_iniziale_kg: number | null } | null` - Dati anagrafica
  - `fitness`: `{ peso_attuale_kg: number | null; obiettivo_peso_kg: number | null } | null` - Dati fitness
  - `smartTracking`: `{ peso_kg: number | null } | null` - Dati smart tracking
  - `administrative`: `{ lezioni_rimanenti: number | null } | null` - Dati amministrativi

**Output**: Oggetto con:

- **Stato**:
  - `stats`: `AthleteStats` - Statistiche complete
    - `allenamenti_totali`: `number` - Totale workout logs
    - `allenamenti_mese`: `number` - Workout logs mese corrente
    - `streak_giorni`: `number` - Giorni consecutivi con workout completati
    - `peso_attuale`: `number | null` - Peso attuale (da fitness o smartTracking)
    - `peso_iniziale`: `number | null` - Peso iniziale (da anagrafica)
    - `obiettivo_peso`: `number | null` - Obiettivo peso (da fitness)
    - `lezioni_rimanenti`: `number` - Lezioni rimanenti (da administrative)
    - `progress_score`: `number` - Score progresso (da RPC)
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
- **Funzioni**:
  - `calculateProgress()`: `() => number` - Calcola percentuale progresso peso (0-100)

**Descrizione**: Hook per statistiche atleta con:

- Fetch profilo completo via RPC `get_athlete_profile_complete`
- Calcolo progress score via RPC `calculate_athlete_progress_score`
- Count workout logs totali e mese corrente
- Calcolo streak giorni (via `calculateStreakFromLogs` utility)
- Estrazione peso da multiple fonti (fitness, smartTracking, anagrafica)
- Calcolo percentuale progresso peso

---

## 🔄 Flusso Logico

### Load Stats

1. **Verifica Prerequisiti**:
   - Se `athleteUserId` null o `authLoading` → return

2. **Fetch Profilo Completo**:
   - RPC `get_athlete_profile_complete(athlete_uuid)` (non bloccante se fallisce)

3. **Fetch Progress Score**:
   - RPC `calculate_athlete_progress_score(athlete_uuid)` (non bloccante se fallisce)

4. **Count Workout Logs Totali**:
   - SELECT COUNT `workout_logs` WHERE `athlete_id = userId` (fallback a `atleta_id`)

5. **Count Workout Logs Mese**:
   - SELECT COUNT `workout_logs` WHERE `athlete_id = userId` AND `data >= startOfMonth`

6. **Calcolo Streak**:
   - Usa `calculateStreakFromLogs(supabase, athleteUserId)` utility
   - Fallback a query diretta se utility fallisce

7. **Estrazione Peso**:
   - `peso_iniziale`: `anagrafica?.peso_iniziale_kg`
   - `peso_attuale`: `fitness?.peso_attuale_kg || smartTracking?.peso_kg`
   - `obiettivo_peso`: `fitness?.obiettivo_peso_kg`

8. **Estrazione Lezioni**:
   - `lezioni_rimanenti`: `administrative?.lezioni_rimanenti || 0`

9. **Estrazione Progress Score**:
   - Da RPC result: `progressScore.score_totale || 0`

10. **Aggiorna Stato**:
    - Aggiorna `stats` con tutti i dati

### Calculate Progress

1. Se `peso_iniziale`, `obiettivo_peso`, `peso_attuale` presenti:
   - `total = Math.abs(peso_iniziale - obiettivo_peso)`
   - `current = Math.abs(peso_attuale - peso_iniziale)`
   - `percentuale = (current / total) * 100`
2. Ritorna percentuale (0-100)

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`, `useMemo`), `createClient` (Supabase), `calculateStreakFromLogs` (utility)

**Utilizzato da**: Pagina home profilo atleta

---

## ⚠️ Note Tecniche

- **RPC Non Bloccanti**: RPC functions non bloccanti (usa 0 se falliscono)
- **Fallback Column Names**: Supporta sia `athlete_id` che `atleta_id` per workout_logs
- **Multiple Data Sources**: Peso da multiple fonti (fitness, smartTracking)
- **Streak Utility**: Usa utility esterna per calcolo streak (fallback a query diretta)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
