# Risoluzione Problemi: Timeout Supabase

## Errori Comuni

### `[API-ERROR] useClienti.fetchStats.rpc "Timeout dopo 3000ms"`

### `[API-ERROR] useClienti.fetchClienti.data "Timeout dopo 8000ms"`

Questi errori indicano che:

- **fetchStats.rpc**: La funzione RPC `get_clienti_stats()` impiega più di 3 secondi
- **fetchClienti.data**: La query principale per caricare i clienti impiega più di 5-6 secondi

**Nota**: Entrambi gli errori hanno fallback automatici, quindi l'applicazione continua a funzionare anche in caso di timeout.

---

## Cause Comuni e Soluzioni

### 1. **Query Inefficienti nella Funzione RPC**

**Problema**: La funzione esegue 5 `COUNT(*)` separati invece di una singola query aggregata.

**Causa originale**:

```sql
-- INEFFICIENTE: 5 scansioni separate della tabella
SELECT JSON_BUILD_OBJECT(
  'totali', (SELECT COUNT(*) FROM profiles WHERE role = 'atleta'),
  'attivi', (SELECT COUNT(*) FROM profiles WHERE role = 'atleta' AND stato = 'attivo'),
  'inattivi', (SELECT COUNT(*) FROM profiles WHERE role = 'atleta' AND stato = 'inattivo'),
  ...
)
```

**Soluzione**: Usa una singola query con `FILTER`:

```sql
-- OTTIMIZZATO: Una singola scansione
SELECT JSON_BUILD_OBJECT(
  'totali', COUNT(*) FILTER (WHERE role = 'atleta'),
  'attivi', COUNT(*) FILTER (WHERE role = 'atleta' AND stato = 'attivo'),
  ...
) FROM profiles WHERE role = 'atleta'
```

**File**: `supabase/migrations/20250109_optimize_clienti_stats_rpc.sql`

---

### 2. **Indici Mancanti o Non Ottimizzati**

**Problema**: Query senza indici appropriati richiedono full table scan.

**Indici Necessari**:

- `idx_profiles_role` - Per filtrare `role = 'atleta'`
- `idx_profiles_role_stato` - Per filtri combinati `role + stato`
- `idx_profiles_data_iscrizione` - Per query su date
- `idx_profiles_documenti_scadenza` - Per filtri boolean

**Verifica**:

```sql
-- Verifica indici esistenti
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles';
```

**Soluzione**: Esegui la migrazione `20250109000002_add_performance_indexes.sql`

---

### 3. **Row Level Security (RLS) Policies Pesanti**

**Problema**: Le RLS policies possono richiedere scansioni complete per ogni riga.

**Causa**: Policy che usano subquery o join complessi:

```sql
-- ESEMPIO PESANTE
CREATE POLICY "slow_policy" ON profiles
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'pt'))
  );
```

**Soluzione**:

- Usa `SECURITY DEFINER` nella funzione RPC (già implementato)
- Semplifica le policies RLS
- Aggiungi indici sulle colonne usate nelle policies

---

### 4. **Tabella Molto Grande senza Partizionamento**

**Problema**: Tabelle con milioni di righe senza partizionamento.

**Soluzioni**:

- **Partizionamento**: Dividi la tabella `profiles` per `role` o `data_iscrizione`
- **Archiviazione**: Sposta dati vecchi in tabelle separate
- **Pulizia**: Rimuovi dati non più necessari

**Esempio Partizionamento**:

```sql
-- Partiziona per ruolo
CREATE TABLE profiles_atleti PARTITION OF profiles
  FOR VALUES IN ('atleta');
```

---

### 5. **Connessione Lenta al Database**

**Problema**: Latenza di rete tra client e Supabase.

**Soluzioni**:

- Verifica la regione Supabase (usa la più vicina)
- Controlla problemi di rete locale
- Usa connection pooling se disponibile

**Verifica**:

```sql
-- Test latenza
SELECT NOW();
```

---

### 6. **Lock del Database**

**Problema**: Altre transazioni bloccano la tabella.

**Soluzioni**:

- **Timeout brevi**: Il timeout di 3s previene attese infinite
- **Read-only queries**: Usa `STABLE` nella funzione (già implementato)
- **Monitoring**: Monitora query bloccanti

**Query per Verificare Lock**:

```sql
SELECT * FROM pg_locks
WHERE relation = 'profiles'::regclass;
```

---

### 7. **Statistiche del Database Non Aggiornate**

**Problema**: PostgreSQL usa statistiche vecchie per pianificare le query.

**Soluzione**:

```sql
-- Aggiorna statistiche
ANALYZE profiles;

-- Auto-analyze automatico (già configurato in Supabase)
```

---

## Implementazione Attuale

### Fallback Automatico

Il codice gestisce il timeout gracefully:

1. **Tentativo RPC** (3 secondi timeout)
2. **Fallback automatico** se timeout → usa `estimated` count con query separate
3. **Valori default** se anche il fallback fallisce → mostra 0

### Ottimizzazioni Implementate

✅ Funzione RPC ottimizzata con singola query aggregata  
✅ Indici compositi per performance  
✅ Timeout breve (3s) per non bloccare l'UI  
✅ Fallback automatico con `estimated` count  
✅ `STABLE` function attribute per cache query  
✅ `SECURITY DEFINER` per bypassare RLS in funzione

---

## Debugging

### 1. Verifica Performance Funzione

```sql
-- Test diretto della funzione
EXPLAIN ANALYZE
SELECT * FROM get_clienti_stats();
```

### 2. Verifica Indici Utilizzati

```sql
-- Mostra query plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT JSON_BUILD_OBJECT(...) FROM profiles WHERE role = 'atleta';
```

### 3. Monitora Query Lente

```sql
-- Query in esecuzione da più di 1 secondo
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 second'
AND state != 'idle';
```

---

## Ottimizzazioni Implementate per fetchClienti

### 1. **Timeout Dinamico**

- **Senza ricerca**: 5 secondi
- **Con ricerca**: 6 secondi (ricerca testuale è più lenta)

### 2. **Ricerca Ottimizzata**

- **Termini < 3 caratteri**: Filtraggio client-side (evita `LIKE %term%` lento)
- **Termini >= 3 caratteri**: Pattern `term%` invece di `%term%` (più veloce con indici)
- **Pattern wildcard finale**: `nome.ilike.${term}%` invece di `nome.ilike.%${term}%`

### 3. **Query Multi-Step**

1. Applica filtri con indici (role, stato, date) PRIMA
2. Poi ricerca testuale (se presente)
3. Poi sorting e paginazione

### 4. **Fallback Automatico**

- Se timeout con ricerca → query semplificata senza ricerca + filtro client-side
- Se anche il fallback fallisce → array vuoto (non blocca l'UI)

### 5. **Indici per Ricerca Testuale**

- **Indici trigram** (`pg_trgm`) per ricerche full-text veloci
- **Indice composito** `role + stato + data_iscrizione` per query comuni

**File migrazione**: `supabase/migrations/20250109_optimize_clienti_search.sql`

## Prevenzione Futura

1. **Monitoraggio**: Aggiungi alerting per query > 2s
2. **Benchmark**: Test regolari delle performance
3. **Ottimizzazione Continua**: Review periodico delle query
4. **Caching**: Considera caching lato client per stats (se accettabile)
5. **Indici**: Monitora uso indici con `EXPLAIN ANALYZE`

---

## Riferimenti

- [Supabase RPC Documentation](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Query Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [PostgreSQL Indexing](https://www.postgresql.org/docs/current/indexes.html)
