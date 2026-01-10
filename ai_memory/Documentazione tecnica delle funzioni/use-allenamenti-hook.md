# 📚 Documentazione Tecnica: useAllenamenti

**Percorso**: `src/hooks/use-allenamenti.ts`  
**Tipo Modulo**: React Hook (Data Fetching Hook, CRUD Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook principale per gestione allenamenti (workout logs). Fornisce fetch lista con filtri, statistiche, CRUD (update/delete), realtime subscriptions, e mapping da `workout_logs` a `Allenamento`.

---

## 🔧 Funzioni e Export

### 1. `useAllenamenti`

**Classificazione**: React Hook, Data Fetching Hook, CRUD Hook, Client Component, Async  
**Tipo**: `(filters?: Partial<AllenamentoFilters>, sort?: AllenamentoSort) => UseAllenamentiReturn`

**Parametri**:

- `filters?`: `Partial<AllenamentoFilters>` - Filtri (stato, atleta_id, periodo, data_da, data_a, search)
- `sort?`: `AllenamentoSort` - Ordinamento ('data_desc' | 'data_asc' | 'atleta_asc' | 'durata_desc')

**Output**: Oggetto con:

- **Dati**:
  - `allenamenti`: `Allenamento[]` - Array allenamenti (mappati da workout_logs)
  - `stats`: `AllenamentoStats` - Statistiche (oggi, completati, in_corso, programmati, saltati, questa_settimana, questo_mese)
  - `loading`: `boolean` - Stato caricamento
  - `error`: `Error | null` - Errore
- **Funzioni**:
  - `refresh()`: `() => Promise<void>` - Ricarica lista
  - `deleteAllenamento(id)`: `(id: string) => Promise<void>` - Elimina allenamento
  - `updateAllenamento(id, updates)`: `(id: string, updates: Partial<Allenamento>) => Promise<void>` - Aggiorna allenamento

**Descrizione**: Hook completo per allenamenti con:

- Fetch da `workout_logs` con join `profiles` (atleta) e `workout_plans` (scheda)
- Filtri: stato, atleta_id, periodo (oggi/settimana/mese), date range, search (client-side)
- Sorting: data, atleta, durata
- Mapping da `WorkoutLogRow` a `Allenamento` con normalizzazione stato
- Statistiche calcolate client-side
- Realtime subscriptions (postgres_changes su workout_logs)
- CRUD operations (update/delete con retry)
- Mock data per sviluppo (se Supabase non configurato)

### 2. `useAllenamentoDettaglio`

**Classificazione**: React Hook, Data Fetching Hook, Client Component, Async  
**Tipo**: `(id: string) => { dettaglio: AllenamentoDettaglio | null, loading: boolean, error: Error | null }`

**Parametri**:

- `id`: `string` - ID allenamento

**Output**: Oggetto con:

- `dettaglio`: `AllenamentoDettaglio | null` - Dettaglio con allenamento e esercizi (TODO: esercizi)
- `loading`: `boolean` - Stato caricamento
- `error`: `Error | null` - Errore

**Descrizione**: Hook per dettaglio singolo allenamento (TODO: esercizi non implementati)

---

## 🔄 Flusso Logico

### Fetch Allenamenti

1. **Verifica Configurazione**:
   - Se Supabase non configurato → usa mock data (2 allenamenti)

2. **Query Base**:
   - SELECT `workout_logs` con join:
     - `atleta:profiles!workout_logs_atleta_id_fkey(id, nome, cognome)`
     - `scheda:workout_plans!workout_logs_scheda_id_fkey(id, name)`

3. **Applica Filtri**:
   - Stato: WHERE `stato = filters.stato`
   - Atleta: WHERE `atleta_id = filters.atleta_id`
   - Periodo: WHERE `data >= periodoStart`
   - Date range: WHERE `data >= data_da AND data <= data_a`

4. **Mapping**:
   - Mappa `WorkoutLogWithRelations` → `Allenamento`:
     - Normalizza stato: `mapAllenamentoStatus(item.stato)`
     - Costruisce `atleta_nome`: `${atleta.nome} ${atleta.cognome}`
     - Costruisce `scheda_nome`: `scheda.name`

5. **Filtro Search Client-Side**:
   - Filtra per `atleta_nome` o `scheda_nome` (case-insensitive)

6. **Sorting Client-Side**:
   - Ordina per campo e direzione specificati

7. **Calcolo Statistiche**:
   - `oggi`: count con `data === oggi`
   - `completati`: count con `stato === 'completato'`
   - `in_corso`: count con `stato === 'in_corso'`
   - `programmati`: count con `stato === 'programmato'`
   - `saltati`: count con `stato === 'saltato'`
   - `questa_settimana`: count con `data >= settimanaFa`
   - `questo_mese`: count con `data >= meseFa`

8. **Realtime Subscription**:
   - Sottoscrive `postgres_changes` su `workout_logs`
   - On change → `fetchAllenamenti()`

### Update Allenamento

1. Costruisce payload: `stato`, `esercizi_completati`, `volume_totale`, `note`, `durata_minuti`, `updated_at`
2. UPDATE `workout_logs` WHERE `id = id`
3. Refetch lista

### Delete Allenamento

1. DELETE `workout_logs` WHERE `id = id`
2. Refetch lista

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`, `useRef`), `useSupabase`, `useSupabaseWithRetry`, `handleApiError`, tipo `Allenamento`, `AllenamentoFilters`, `AllenamentoSort`, `AllenamentoStats`

**Utilizzato da**: Pagina allenamenti, componenti gestione allenamenti

---

## ⚠️ Note Tecniche

- **Status Mapping**: Normalizza vari formati stato (completato, in corso, programmato, saltato)
- **Join Supabase**: Usa sintassi `profiles!workout_logs_atleta_id_fkey` per join automatico
- **Client-Side Filtering**: Search e sorting client-side (per performance)
- **Mock Data**: Mock data per sviluppo se Supabase non configurato

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
