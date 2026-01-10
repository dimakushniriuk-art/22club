# 📚 Documentazione Tecnica: useClienti

**Percorso**: `src/hooks/use-clienti.ts`  
**Tipo Modulo**: React Hook (Data Fetching Hook, CRUD Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook principale per gestione completa clienti. Fornisce fetch lista con filtri/paginazione, statistiche aggregate, CRUD (update/delete), realtime subscriptions, cache strategica, fallback per performance, e gestione timeout.

---

## 🔧 Funzioni e Export

### 1. `useClienti`

**Classificazione**: React Hook, Data Fetching Hook, CRUD Hook, Client Component, Async, Side-Effecting  
**Tipo**: `(options?: UseClientiOptions) => UseClientiReturn`

**Parametri**:

- `options` (opzionale): `UseClientiOptions`
  - `filters?`: `Partial<ClienteFilters>` - Filtri ricerca, stato, date, allenamenti, documenti, tags
  - `sort?`: `ClienteSort` - `{ field: string, direction: 'asc' | 'desc' }` (default: `{ field: 'data_iscrizione', direction: 'desc' }`)
  - `page?`: `number` - Pagina corrente (default: 1)
  - `pageSize?`: `number` - Items per pagina (default: 20)
  - `realtime?`: `boolean` - Abilita realtime subscriptions (default: false)

**Output**: Oggetto con:

- **Dati**:
  - `clienti`: `Cliente[]` - Array clienti filtrati e paginati
  - `stats`: `ClienteStats` - Statistiche aggregate (totali, attivi, inattivi, nuovi_mese, documenti_scadenza)
  - `total`: `number` - Totale clienti (con filtri applicati)
  - `totalPages`: `number` - Totale pagine
- **Stato**:
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
- **Operazioni**:
  - `refetch()`: `Promise<void>` - Ricarica dati
  - `updateCliente(id, updates)`: `Promise<void>` - Aggiorna cliente
  - `deleteCliente(id)`: `Promise<void>` - Elimina cliente

**Descrizione**: Hook completo per gestione clienti con:

- Fetch lista con filtri complessi (ricerca, stato, date, allenamenti, documenti, tags)
- Paginazione client-side (carica 5x pageSize, filtra e pagina in memoria)
- Statistiche aggregate (RPC `get_clienti_stats` con fallback a query multiple)
- Cache strategica (localStorage per stats, frequent-query cache per lista)
- Timeout management (3s per RPC, 2s per query fallback, 4s per query principale)
- Mock data per sviluppo (se Supabase non configurato)
- Realtime subscriptions opzionali (postgres_changes su profiles)
- CRUD operations (update/delete con retry automatico)

---

## 🔄 Flusso Logico

### Fetch Clienti

1. **Verifica Configurazione Supabase**:
   - Se non configurato → usa mock data (2 clienti di esempio)
   - Applica filtri ai mock data
   - Ritorna immediatamente

2. **Query Principale** (se Supabase configurato):
   - Carica `pageSize * 5` profili da `profiles` (role = 'atleta' | 'athlete')
   - Timeout: 4s
   - Ordina per `sort.field` e `sort.direction`

3. **Filtraggio Client-Side**:
   - Filtro stato (se `filters.stato !== 'tutti'`)
   - Filtro ricerca (nome, cognome, email)
   - Filtro documenti scadenza (se `filters.solo_documenti_scadenza`)
   - Filtro date iscrizione (da/a)
   - Sorting client-side (se `sort.field !== 'data_iscrizione'`)
   - Paginazione client-side (slice `(page - 1) * pageSize` a `page * pageSize`)

4. **Count Totale**:
   - Stima immediata: se `data.length === pageSize` → `count = data.length * 5`, altrimenti `count = data.length`
   - Count preciso in background (solo pagina 1):
     - Query `estimated count` con filtri essenziali
     - Timeout: 3s
     - Aggiorna `total` quando disponibile

5. **Mapping a Cliente**:
   - Mappa `ProfileSummary` → `Cliente`
   - Normalizza `nome`/`cognome` da `first_name`/`last_name`
   - Filtra per `allenamenti_min` e `tags` (se specificati)

6. **Cache**:
   - Salva lista filtrata in `frequentQueryCache` (TTL 5 minuti)
   - Key basata su filtri/sort/page

### Fetch Statistiche

1. **Check Cache**:
   - Controlla `statsCache.get('clienti-stats')` (TTL 2 minuti)
   - Se presente → usa cache e fetch in background

2. **RPC `get_clienti_stats`** (preferito):
   - Timeout: 3s
   - Se successo → salva in cache e ritorna
   - Se fallisce → passa a fallback

3. **Fallback Query Multiple**:
   - Esegue 5 query in parallelo con timeout 2s ciascuna:
     - Totale: `count estimated` WHERE `role IN ('atleta', 'athlete')`
     - Attivi: `count estimated` WHERE `role IN (...) AND stato = 'attivo'`
     - Inattivi: `count estimated` WHERE `role IN (...) AND stato = 'inattivo'`
     - Nuovi mese: `count estimated` WHERE `role IN (...) AND data_iscrizione >= firstDayOfMonth`
     - Documenti scadenza: `count estimated` WHERE `role IN (...) AND documenti_scadenza = true`
   - Se una query fallisce/timeout → usa 0 come fallback
   - Salva in cache

4. **Error Handling**:
   - Se tutto fallisce → mantiene valori default (0 per tutte le stats)
   - Non blocca UI (stats sono secondarie)

### Update Cliente

1. Mappa `Cliente` fields → `profiles` fields:
   - `nome` → `nome`
   - `cognome` → `cognome`
   - `email` → `email`
   - `phone` → `phone`
   - `avatar_url` → `avatar`
   - `note` → `note`

2. UPDATE `profiles` WHERE `id = id` (con retry automatico)

3. Refetch lista automatica

### Delete Cliente

1. DELETE `profiles` WHERE `id = id` (con retry automatico)

2. Refetch lista automatica

### Realtime Subscriptions

1. Se `realtime === true`:
   - Sottoscrive `postgres_changes` su `profiles`
   - Filtro: `role IN ('atleta', 'athlete')`
   - Eventi: `INSERT`, `UPDATE`, `DELETE`
   - On change → `fetchClienti()`

2. Cleanup: unsubscribe al unmount

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`), `useSupabase`, `useSupabaseWithRetry`, `handleApiError`, `localStorageCache`, `statsCache`, `frequentQueryCache`, tipo `Cliente`, `ClienteFilters`, `ClienteSort`, `ClienteStats`

**Utilizzato da**: Pagina clienti, componenti che necessitano lista clienti

---

## ⚠️ Note Tecniche

- **Performance**:
  - Carica 5x pageSize per permettere filtraggio/paginazione client-side (evita query complesse DB)
  - Timeout brevi (2-4s) per evitare UI bloccata
  - Cache strategica (stats: 2 min, lista: 5 min)
  - Estimated count per velocità (accettabile per UI)

- **Fallback Strategy**:
  - RPC timeout → fallback query multiple
  - Query timeout → usa 0 o stima conservativa
  - Supabase non configurato → mock data

- **Client-Side Filtering**:
  - Funziona bene per dataset piccoli/medi (< 1000 clienti)
  - Per dataset grandi, considerare filtraggio server-side

- **Debounce**:
  - Filtri cambiano → debounce 100ms prima di refetch (evita chiamate multiple)

- **Mock Data**:
  - 2 clienti di esempio (Mario Rossi, Giulia Bianchi)
  - Applica filtri anche ai mock data

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
