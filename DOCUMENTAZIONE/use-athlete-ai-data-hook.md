# 📚 Documentazione Tecnica: useAthleteAIData / useUpdateAthleteAIData

**Percorso**: `src/hooks/athlete-profile/use-athlete-ai-data.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati AI atleta. Fornisce query per GET ultimi dati AI (per data_analisi) e mutation per UPDATE con validazione Zod, optimistic updates, e gestione errori robusta.

---

## 🔧 Funzioni e Export

### 1. `athleteAIDataKeys`

**Classificazione**: Query Key Factory (Pure Object)  
**Tipo**: `{ all: readonly ['athlete-ai-data'], detail: (athleteId: string) => readonly ['athlete-ai-data', string] }`

**Descrizione**: Factory per creare query keys consistenti per React Query.

---

### 2. `useAthleteAIData`

**Classificazione**: React Hook, React Query Hook, Client Component, Async  
**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteAIData | null>`

**Parametri**:

- `athleteId` (string | null): UUID dell'atleta (user_id)

**Output**: React Query `UseQueryResult` con:

- `data`: `AthleteAIData | null` - Ultimo record per data_analisi
- `isLoading`, `isError`, `error`, `refetch`

**Descrizione**: Hook per ottenere ultimi dati AI atleta. Restituisce l'ultimo record ordinato per `data_analisi` DESC.

**Configurazione React Query**:

- `staleTime`: 10 minuti (dati AI meno dinamici - calcoli pesanti)
- `gcTime`: 60 minuti (cache lunga per dati costosi da calcolare)
- `refetchOnWindowFocus`: false
- `refetchOnMount`: false
- `retry`: 1

---

### 3. `useUpdateAthleteAIData`

**Classificazione**: React Hook, React Query Mutation, Client Component, Async  
**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteAIData, Error, AthleteAIDataUpdate>`

**Parametri**:

- `athleteId` (string | null): UUID dell'atleta (user_id)

**Output**: React Query `UseMutationResult` con:

- `mutateAsync`: `(updates: AthleteAIDataUpdate) => Promise<AthleteAIData>`
- `isPending`, `isError`, `error`, `isSuccess`, `data`

**Descrizione**: Hook per aggiornare dati AI atleta. Se esiste già un record, aggiorna l'ultimo (per data_analisi), altrimenti crea nuovo record.

**Funzionalità**:

- Validazione Zod con `updateAthleteAIDataSchema`
- Upsert: Update se esiste, Insert se non esiste
- Optimistic update con rollback automatico
- Cache invalidation dopo successo

---

## 🔄 Flusso Logico

### GET Dati AI

1. Query Supabase: `athlete_ai_data` WHERE `athlete_id = X` ORDER BY `data_analisi` DESC LIMIT 1
2. Se non esiste record → ritorna `null` (non è errore)
3. Valida con `createAthleteAIDataSchema` (Zod)
4. Ritorna dati validati

### UPDATE Dati AI

1. Valida `updates` con `updateAthleteAIDataSchema`
2. Verifica se esiste record per `athlete_id`
3. Se esiste → UPDATE ultimo record
4. Se non esiste → INSERT nuovo record (con `data_analisi` corrente se non specificata)
5. Valida risultato con `createAthleteAIDataSchema`
6. Optimistic update → rollback se errore
7. Invalida cache React Query

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteAIDataForm`, componenti tab AI data

---

## ⚠️ Note Tecniche

- **data_analisi**: Omessa da `updateAthleteAIDataSchema`, quindi non viene aggiornata manualmente (solo lettura)
- **Ultimo Record**: Sempre restituisce/aggiorna l'ultimo record per `data_analisi`
- **Cache Strategy**: Cache lunga (60 min) perché dati AI sono costosi da calcolare

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
