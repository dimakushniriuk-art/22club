# 📚 Documentazione Tecnica: useProgressAnalytics

**Percorso**: `src/hooks/use-progress-analytics.ts`  
**Tipo Modulo**: React Hook (Analytics Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per calcolo KPI e analytics progressi atleta. Usa React Query per caching e fetch automatico. Calcola peso attuale, variazione 7gg, forza massima, percentuale completamento, streak, e dataset per grafici.

---

## 🔧 Funzioni e Export

### 1. `useProgressAnalytics`

**Classificazione**: React Hook, Analytics Hook, Client Component, React Query  
**Tipo**: `(athleteId: string | null) => UseQueryResult<ProgressKPI>`

**Parametri**:

- `athleteId`: `string | null` - ID atleta

**Output**: React Query result con:

- `data`: `ProgressKPI` - KPI e dataset analytics
- `loading`: `boolean` - Stato caricamento
- `error`: `Error | null` - Errore
- `refetch()`: `() => void` - Ricarica dati

**ProgressKPI**:

- `pesoAttuale`: `number | null` - Peso ultimo log
- `variazionePeso7gg`: `number | null` - Differenza peso ultimi 7 giorni
- `forzaMassima`: `number | null` - Max tra bench/squat/deadlift ultimo log
- `percentualeCompletamento`: `number` - % workout completati ultimi 30gg
- `streak`: `number` - Giorni consecutivi con workout completati
- `datasetPeso`: `Array<{ date: string; peso: number }>` - Dataset peso per grafico
- `datasetForza`: `Array<{ date: string; forza: number }>` - Dataset forza per grafico
- `datasetCompletamento`: `Array<{ date: string; percentuale: number }>` - Dataset completamento per settimana
- `ultimiProgressi`: `Array<ProgressLog>` - Ultimi 10 progress logs

**Descrizione**: Hook completo per analytics progressi con:

- Fetch `progress_logs` ultimi 60 giorni
- Fetch `workout_plans` ultimi 30 giorni (per completamento)
- Calcolo KPI: peso, variazione, forza, completamento, streak
- Preparazione dataset per grafici (peso, forza, completamento settimanale)
- React Query caching (staleTime: 5 minuti)

---

## 🔄 Flusso Logico

### Fetch Progress Data

1. **Fetch Progress Logs**:
   - SELECT `progress_logs` WHERE `athlete_id = athleteId`
   - WHERE `date >= 60 giorni fa`
   - ORDER BY `date ASC`

2. **Fetch Workouts**:
   - SELECT `workout_plans` con join `workout_days` e `workout_sets`
   - WHERE `athlete_id = athleteId` AND `created_at >= 30 giorni fa`
   - Per calcolo completamento (non bloccante se fallisce)

3. **Calcolo KPI**:
   - **Peso Attuale**: `progressLogs[last].weight_kg`
   - **Variazione 7gg**: differenza tra ultimo e log 7 giorni fa
   - **Forza Massima**: `Math.max(bench, squat, deadlift)` ultimo log
   - **Completamento**: `(completedWorkouts / totalWorkouts) * 100`
   - **Streak**: giorni consecutivi con workout completati (max 30 giorni)

4. **Preparazione Dataset**:
   - **Dataset Peso**: filtra logs con `weight_kg !== null`, mappa `{ date, peso }`
   - **Dataset Forza**: filtra logs con forza, mappa `{ date, forza: max(bench, squat, deadlift) }`
   - **Dataset Completamento**: calcola % completamento per settimana (ultime 4 settimane)
   - **Ultimi Progressi**: ultimi 10 logs con peso e forze

5. **React Query**:
   - Query key: `['progress-analytics', athleteId]`
   - Stale time: 5 minuti
   - Enabled solo se `athleteId` presente

---

## 📊 Dipendenze

**Dipende da**: React (`useCallback`), React Query (`useQuery`), `createClient` (Supabase), tipo `ProgressKPI`

**Utilizzato da**: Dashboard analytics, componenti KPI progressi

---

## ⚠️ Note Tecniche

- **React Query**: Usa React Query per caching e refetch automatico
- **Non Bloccante**: Fetch workouts non bloccante (usa array vuoto se fallisce)
- **Streak Calculation**: Calcola streak guardando indietro fino a 30 giorni
- **Dataset Settimanale**: Completamento calcolato per settimana (ultime 4 settimane)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
