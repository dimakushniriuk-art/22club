# 📚 Documentazione Tecnica: useAthleteSmartTracking / useUpdateAthleteSmartTracking

**Percorso**: `src/hooks/athlete-profile/use-athlete-smart-tracking.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati smart tracking atleta (wearable devices). Fornisce query per GET ultimi dati (per data_rilevazione) o per data specifica, e mutation per UPDATE/INSERT con validazione Zod.

---

## 🔧 Funzioni e Export

### 1. `athleteSmartTrackingKeys`

**Query Key Factory** con:

- `all`: `['athlete-smart-tracking']`
- `detail(athleteId)`: `['athlete-smart-tracking', athleteId]`
- `byDate(athleteId, date)`: `['athlete-smart-tracking', athleteId, 'date', date]`

---

### 2. `useAthleteSmartTracking`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteSmartTrackingData | null>`

**Descrizione**: Hook per ottenere ultimi dati smart tracking (ultimo record per `data_rilevazione` DESC).

**Configurazione**:

- `staleTime`: 2 minuti (dati più dinamici - tracking wearable)
- `gcTime`: 15 minuti (cache più breve per dati dinamici)

---

### 3. `useAthleteSmartTrackingByDate`

**Tipo**: `(athleteId: string | null, date: string | null) => UseQueryResult<AthleteSmartTrackingData | null>`

**Descrizione**: Hook per ottenere dati smart tracking per una data specifica (formato YYYY-MM-DD).

**Configurazione**:

- `staleTime`: 5 minuti (dati storici per data specifica)

---

### 4. `useUpdateAthleteSmartTracking`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteSmartTrackingData, Error, AthleteSmartTrackingDataUpdate & { data_rilevazione: string }>`

**Descrizione**: Hook per aggiornare/inserire dati smart tracking. Se esiste già un record per `data_rilevazione`, aggiorna, altrimenti crea nuovo record.

**Funzionalità**:

- `data_rilevazione` obbligatoria per upsert
- Validazione Zod completa
- Optimistic update con rollback
- Cache invalidation per `detail` e `byDate`

---

## 🔄 Flusso Logico

### UPDATE/INSERT

1. Valida `updates` (inclusa `data_rilevazione`)
2. Verifica se esiste record per `athlete_id` + `data_rilevazione`
3. Se esiste → UPDATE
4. Se non esiste → INSERT
5. Optimistic update → rollback se errore
6. Invalida cache `detail` e `byDate`

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useSmartTrackingForm`, componenti tab smart tracking

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
