# 📚 Documentazione Tecnica: useAthleteFitness / useUpdateAthleteFitness

**Percorso**: `src/hooks/athlete-profile/use-athlete-fitness.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati fitness atleta. Fornisce query per GET dati fitness e mutation per UPDATE con validazione Zod.

---

## 🔧 Funzioni e Export

### 1. `useAthleteFitness`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteFitnessData | null>`

**Descrizione**: Hook per ottenere dati fitness atleta (livello esperienza, obiettivi, preferenze allenamento, attività precedenti, infortuni pregressi).

**Configurazione**:

- `staleTime`: 5 minuti
- `gcTime`: 30 minuti

---

### 2. `useUpdateAthleteFitness`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteFitnessData, Error, AthleteFitnessDataUpdate>`

**Descrizione**: Hook per aggiornare dati fitness. Upsert: Update se esiste, Insert se non esiste.

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteFitnessForm`, componenti tab fitness

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
