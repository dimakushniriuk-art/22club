# 📚 Documentazione Tecnica: useAthleteNutrition / useUpdateAthleteNutrition

**Percorso**: `src/hooks/athlete-profile/use-athlete-nutrition.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati nutrizionali atleta. Fornisce query per GET dati nutrizionali e mutation per UPDATE con validazione Zod.

---

## 🔧 Funzioni e Export

### 1. `useAthleteNutrition`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteNutritionData | null>`

**Descrizione**: Hook per ottenere dati nutrizionali atleta (obiettivi, calorie, macronutrienti, dieta, intolleranze, allergie, preferenze orari pasti).

**Configurazione**:

- `staleTime`: 5 minuti
- `gcTime`: 30 minuti

---

### 2. `useUpdateAthleteNutrition`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteNutritionData, Error, AthleteNutritionDataUpdate>`

**Descrizione**: Hook per aggiornare dati nutrizionali. Upsert: Update se esiste, Insert se non esiste.

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteNutritionForm`, componenti tab nutrizione

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
