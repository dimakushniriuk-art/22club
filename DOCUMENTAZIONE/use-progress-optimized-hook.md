# 📚 Documentazione Tecnica: useProgressOptimized

**Percorso**: `src/hooks/use-progress-optimized.ts`  
**Tipo Modulo**: React Hook (Data Fetching Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook ottimizzato per fetch statistiche progressi atleta. Usa RPC function `get_progress_stats` con fallback a query manuale se RPC non disponibile.

---

## 🔧 Funzioni e Export

### 1. `useProgressOptimized`

**Classificazione**: React Hook, Data Fetching Hook, Client Component, Async  
**Tipo**: `(userId: string | null) => { getProgressStats: () => Promise<ProgressStats | null> }`

**Parametri**:

- `userId`: `string | null` - ID atleta

**Output**: Oggetto con:

- `getProgressStats()`: `Promise<ProgressStats | null>` - Fetch statistiche progressi

**Descrizione**: Hook ottimizzato per statistiche progressi con:

- RPC function `get_progress_stats(athlete_uuid)` (preferito)
- Fallback a query manuale se RPC fallisce:
  - Fetch ultimi 2 `progress_logs`
  - Fetch ultima `progress_photo`
  - Calcolo peso medio, variazione peso 30gg, misure ultime
- Ritorna `ProgressStats` con totali, medie, e misure

---

## 🔄 Flusso Logico

### Fetch Progress Stats (RPC)

1. **Chiamata RPC**:
   - `supabase.rpc('get_progress_stats', { athlete_uuid: userId })`

2. **Parsing Risultato**:
   - Estrae: `total_logs`, `total_photos`, `avg_weight`, `weight_change_30d`, `latest_measurements`

3. **Fallback se RPC Fallisce**:
   - Chiama `getProgressStatsFallback(userId)`

### Fallback Query Manuale

1. **Fetch Progress Logs**:
   - SELECT `progress_logs` WHERE `athlete_id = userId`
   - ORDER BY `date DESC` LIMIT 2

2. **Fetch Progress Photos**:
   - SELECT `progress_photos` WHERE `athlete_id = userId`
   - ORDER BY `date DESC` LIMIT 1

3. **Calcolo Statistiche**:
   - `total_logs`: count logs
   - `avg_weight`: media `weight_kg` da logs
   - `total_photos`: count photos
   - `weight_change_30d`: differenza tra ultimo e penultimo log
   - `latest_measurements`: misure ultimo log (chest, waist, hips, biceps, thighs)

---

## 📊 Dipendenze

**Dipende da**: React (`useCallback`), `createClient` (Supabase), tipo `ProgressStats`

**Utilizzato da**: Componenti dashboard progressi, statistiche atleta

---

## ⚠️ Note Tecniche

- **RPC Preferito**: Usa RPC function per performance migliori (calcolo server-side)
- **Fallback Graceful**: Se RPC fallisce, usa query manuale senza bloccare UI
- **Ultimi 2 Logs**: Fallback carica solo ultimi 2 logs per calcolo variazione peso

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
