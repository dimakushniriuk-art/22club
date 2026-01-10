# 📚 Documentazione Tecnica: useAthleteMotivational / useUpdateAthleteMotivational

**Percorso**: `src/hooks/athlete-profile/use-athlete-motivational.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati motivazionali atleta. Fornisce query per GET dati motivazionali e mutation per UPDATE con validazione Zod.

---

## 🔧 Funzioni e Export

### 1. `useAthleteMotivational`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteMotivationalData | null>`

**Descrizione**: Hook per ottenere dati motivazionali atleta (motivazioni, ostacoli, preferenze, livello motivazione, storico abbandoni).

**Configurazione**:

- `staleTime`: 5 minuti
- `gcTime`: 30 minuti

---

### 2. `useUpdateAthleteMotivational`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteMotivationalData, Error, AthleteMotivationalDataUpdate>`

**Descrizione**: Hook per aggiornare dati motivazionali. Upsert: Update se esiste, Insert se non esiste.

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteMotivationalForm`, componenti tab motivazionale

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
