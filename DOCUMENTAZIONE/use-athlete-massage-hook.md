# 📚 Documentazione Tecnica: useAthleteMassage / useUpdateAthleteMassage

**Percorso**: `src/hooks/athlete-profile/use-athlete-massage.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati massaggi atleta. Fornisce query per GET dati massaggi e mutation per UPDATE con validazione Zod.

---

## 🔧 Funzioni e Export

### 1. `useAthleteMassage`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteMassageData | null>`

**Descrizione**: Hook per ottenere dati massaggi atleta (preferenze, zone problematiche, allergie, storico).

**Configurazione**:

- `staleTime`: 5 minuti
- `gcTime`: 30 minuti

---

### 2. `useUpdateAthleteMassage`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteMassageData, Error, AthleteMassageDataUpdate>`

**Descrizione**: Hook per aggiornare dati massaggi. Upsert: Update se esiste, Insert se non esiste.

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteMassageForm`, componenti tab massaggi

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
