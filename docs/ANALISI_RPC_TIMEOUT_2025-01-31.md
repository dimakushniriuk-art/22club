# 🔍 Analisi Problema RPC Timeout - get_clienti_stats()

**Data Analisi**: 2025-01-31  
**Problema**: `get_clienti_stats()` timeout dopo 3s, `fetchClienti.data` timeout dopo 5-8s

---

## 📊 Stato Attuale

### Funzione RPC Implementata

**File**: `supabase/migrations/20250110_030_rpc_clienti_stats.sql`

**Query Attuale**:

```sql
SELECT JSON_BUILD_OBJECT(
  'totali', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')),
  'attivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo'),
  'inattivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'inattivo'),
  'nuovi_mese', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND data_iscrizione >= start_of_month),
  'documenti_scadenza', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND documenti_scadenza = true)
) INTO result
FROM profiles
WHERE role IN ('atleta', 'athlete');
```

**Caratteristiche**:

- ✅ Usa `FILTER` invece di subquery (ottimizzato)
- ✅ `SECURITY DEFINER` (bypassa RLS)
- ✅ `STABLE` (ottimizzazione query planner)
- ⚠️ `WHERE role IN ('atleta', 'athlete')` - potrebbe non usare indice ottimale

---

### Indici Esistenti

Da analisi migrations, esistono questi indici:

1. ✅ `idx_profiles_role` - Indice base per `role`
2. ✅ `idx_profiles_role_stato` - Indice composito `(role, stato) WHERE role IN ('atleta', 'athlete')`
3. ✅ `idx_profiles_data_iscrizione` - Indice per `data_iscrizione DESC WHERE role IN ('atleta', 'athlete')`
4. ✅ `idx_profiles_documenti_scadenza` - Indice per `documenti_scadenza WHERE documenti_scadenza = true AND role = 'atleta'`
5. ✅ `idx_profiles_role_stato_data` - Indice composito `(role, stato, data_iscrizione DESC) WHERE role = 'atleta'`

**Problema Potenziale**:

- L'indice `idx_profiles_role_stato` usa `WHERE role = 'atleta'` ma la query usa `role IN ('atleta', 'athlete')`
- Questo potrebbe impedire l'uso dell'indice parziale

---

## 🔍 Possibili Cause del Timeout

### 1. Indice Non Usato Correttamente

**Problema**: Query usa `role IN ('atleta', 'athlete')` ma indici parziali usano solo `'atleta'`

**Soluzione**:

- Verificare query plan con `EXPLAIN ANALYZE`
- Possibile soluzione: Usare indice che supporta entrambi i valori o modificare query

### 2. Indice Mancante per `documenti_scadenza`

**Problema**: L'indice `idx_profiles_documenti_scadenza` usa `WHERE role = 'atleta'` ma query usa `role IN (...)`

**Soluzione**:

- Creare indice più generico o modificare query

### 3. RLS Policy Ancora Applicata (Nonostante SECURITY DEFINER)

**Problema**: Anche con `SECURITY DEFINER`, se ci sono trigger o altre complicazioni, potrebbe essere lento

**Verifica**: Testare funzione con `EXPLAIN ANALYZE`

### 4. Statistiche Database Non Aggiornate

**Problema**: Query planner usa statistiche vecchie

**Soluzione**: Eseguire `ANALYZE profiles;`

---

## ✅ Azioni Consigliate

### Fase 1: Analisi Query Plan (30 min)

1. **Eseguire EXPLAIN ANALYZE**:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM get_clienti_stats();
```

2. **Eseguire EXPLAIN sulla query diretta**:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT JSON_BUILD_OBJECT(
  'totali', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')),
  'attivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo'),
  'inattivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'inattivo'),
  'nuovi_mese', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND data_iscrizione >= DATE_TRUNC('month', CURRENT_DATE)),
  'documenti_scadenza', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND documenti_scadenza = true)
)
FROM profiles
WHERE role IN ('atleta', 'athlete');
```

3. **Verificare quali indici vengono usati**

### Fase 2: Ottimizzazione Indici (1h)

**Opzione A: Creare Indice Migliore**

```sql
-- Indice composito che supporta entrambi i valori role
CREATE INDEX IF NOT EXISTS idx_profiles_role_atleti_composite
ON profiles(role, stato, data_iscrizione DESC, documenti_scadenza)
WHERE role IN ('atleta', 'athlete');
```

**Opzione B: Semplificare Query**

```sql
-- Se 'athlete' è un alias di 'atleta', normalizzare prima
-- Oppure usare solo 'atleta' se sono equivalenti
```

### Fase 3: Ottimizzare Query (1h)

**Miglioramento Possibile**:

- Usare un'unica scansione con CTE se necessario
- Considerare materialized view per stats se dati cambiano raramente
- Aggiungere `COALESCE` per valori NULL

### Fase 4: Test Performance (1h)

1. Testare con dati reali
2. Verificare tempo di esecuzione < 2s
3. Confrontare prima/dopo

### Fase 5: Documentare (30 min)

---

## 📋 Query SQL per Verifica

### 1. Verifica Indici Esistenti

```sql
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
AND indexname LIKE '%role%' OR indexname LIKE '%stato%' OR indexname LIKE '%data_iscrizione%'
ORDER BY indexname;
```

### 2. Verifica Query Plan

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT JSON_BUILD_OBJECT(
  'totali', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')),
  'attivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo'),
  'inattivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'inattivo'),
  'nuovi_mese', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND data_iscrizione >= DATE_TRUNC('month', CURRENT_DATE)),
  'documenti_scadenza', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND documenti_scadenza = true)
)
FROM profiles
WHERE role IN ('atleta', 'athlete');
```

### 3. Verifica Numero Righe

```sql
SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')) as total_atleti,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo') as attivi
FROM profiles;
```

### 4. Aggiornare Statistiche

```sql
ANALYZE profiles;
```

---

## 🎯 Success Criteria

- ✅ `get_clienti_stats()` < 2s (da 3s+)
- ✅ `fetchClienti` < 4s (da 5-8s)
- ✅ Nessun timeout in condizioni normali
- ✅ Query plan mostra uso indici appropriati

---

**File Riferimento**:

- `docs/troubleshooting-rpc-timeout.md` - Documentazione esistente
- `supabase/migrations/20250110_030_rpc_clienti_stats.sql` - Funzione attuale
- `src/hooks/use-clienti.ts` - Hook con timeout e fallback
