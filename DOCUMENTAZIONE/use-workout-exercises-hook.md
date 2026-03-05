# 📚 Documentazione Tecnica: useWorkoutExercises

**Percorso**: `src/hooks/workouts/use-workout-exercises.ts`  
**Tipo Modulo**: React Hook (Exercises Catalog Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:59:00Z

---

## 📋 Panoramica

Hook per caricamento catalogo esercizi. Carica tutti gli esercizi dal database per selezione in wizard workout.

---

## 🔧 Funzioni e Export

### 1. `useWorkoutExercises`

**Classificazione**: React Hook, Data Loading Hook, Client Component, Async  
**Tipo**: `() => UseWorkoutExercisesReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `exercises`: `Exercise[]` - Array esercizi
- `loading`: `boolean` - Stato caricamento
- `error`: `string | null` - Errore caricamento
- `fetchExercises()`: `Promise<void>` - Ricarica esercizi

**Descrizione**: Hook per fetch catalogo esercizi con:

- Query tutti gli esercizi da `exercises`
- Ordinamento per nome ASC
- Trasformazione con `transformExercises()`
- Auto-fetch al mount

---

## 🔄 Flusso Logico

### Fetch Exercises

1. Query `exercises` SELECT `*`
2. ORDER BY `name` ASC
3. Trasforma con `transformExercises()` (normalizza dati)
4. Salva in stato `exercises`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `Exercise`, `Tables`, `transformExercises` (transformer)

**Utilizzato da**: Componenti wizard workout, catalogo esercizi

---

## ⚠️ Note Tecniche

- **Auto-Fetch**: Esegue fetch automaticamente al mount (`useEffect`)
- **Trasformazione**: Usa `transformExercises()` per normalizzare dati database a tipo `Exercise`

---

**Ultimo aggiornamento**: 2025-02-01T23:59:00Z
