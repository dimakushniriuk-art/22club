# 🔄 Processo Completo Ottimizzazione RPC Timeout

**Data**: 2025-01-31  
**Obiettivo**: Completare analisi → Eseguire ottimizzazioni → Verificare risultati

---

## 📋 Stato Attuale

### ✅ Completato

1. ✅ Analisi dimensioni tabella e indici
2. ✅ Identificazione indici ridondanti (Query 6)
3. ✅ Preparazione migration per rimozione indici

### ⏳ Da Completare

1. ⏳ Query 1: Verificare numero righe
2. ⏳ Query 5: Test tempo di esecuzione reale
3. ⏳ Opzionale: Query 3 e 4 (query plan analysis)

---

## 🎯 STEP 1: Completare Verifiche Rimanenti

### Query 1: Numero Righe

Eseguire questa query per confermare il volume dati:

```sql
SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')) as total_atleti,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo') as atleti_attivi,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'inattivo') as atleti_inattivi,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND data_iscrizione >= DATE_TRUNC('month', CURRENT_DATE)) as nuovi_mese,
  COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND documenti_scadenza = true) as documenti_scadenza
FROM profiles;
```

**Cosa Aspettarsi**:

- Se `total_atleti` < 50 → conferma dataset piccolo
- Se `total_atleti` > 500 → potrebbe essere problema di volume (improbabile con 16 kB)

---

### Query 5: Test Tempo di Esecuzione

Eseguire questa query per misurare il tempo reale di esecuzione:

```sql
DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  end_time TIMESTAMP WITH TIME ZONE;
  execution_time_ms NUMERIC;
  result JSON;
BEGIN
  start_time := clock_timestamp();

  SELECT get_clienti_stats() INTO result;

  end_time := clock_timestamp();
  execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'RISULTATO TEST TEMPO ESECUZIONE';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'Tempo esecuzione: % ms', execution_time_ms::NUMERIC(10,2);
  RAISE NOTICE 'Risultato: %', result;
  RAISE NOTICE '═══════════════════════════════════════════════════';

  IF execution_time_ms > 2000 THEN
    RAISE WARNING '⚠️ Esecuzione > 2 secondi - PROBLEMA CONFERMATO';
  ELSIF execution_time_ms > 1000 THEN
    RAISE WARNING '⚠️ Esecuzione > 1 secondo - potenziale problema';
  ELSE
    RAISE NOTICE '✅ Esecuzione < 1 secondo - OK';
  END IF;
END $$;
```

**Cosa Aspettarsi**:

- ✅ < 100 ms → Query veloce (timeout è latenza rete)
- ⚠️ 100-1000 ms → Query lenta ma accettabile
- 🔴 > 2000 ms → Problema confermato nella query

---

## 🎯 STEP 2: Analizzare Risultati Completi

### Interpretazione Combinata

**Scenario A: Query Veloce (< 100 ms) ma Timeout Client**

- **Causa**: Latenza di rete o timeout troppo breve
- **Soluzione**: Aumentare timeout client o implementare caching
- **Ottimizzazioni Indici**: Utili ma non critiche

**Scenario B: Query Lenta (> 1000 ms)**

- **Causa**: Query plan inefficiente o indici non usati
- **Soluzione**: Rimuovere indici ridondanti + ottimizzare query plan
- **Ottimizzazioni Indici**: **CRITICHE**

**Scenario C: Query Media (100-1000 ms)**

- **Causa**: Indici confusi o query plan sub-ottimale
- **Soluzione**: Rimuovere indici ridondanti (migliora query planner)
- **Ottimizzazioni Indici**: **CONSIGLIATE**

---

## 🎯 STEP 3: Eseguire Ottimizzazioni

### 3.1: Eseguire Migration Rimozione Indici

Una volta confermati i risultati delle query, eseguire:

```bash
# In Supabase Dashboard SQL Editor
# Eseguire il file: supabase/migrations/20250131_remove_redundant_indexes_profiles.sql
```

**Oppure manualmente**:

```sql
-- Rimuovere indici ridondanti
DROP INDEX IF EXISTS idx_profiles_stato;
DROP INDEX IF EXISTS idx_profiles_email;

-- Verificare risultato
DO $$
DECLARE
  total_indexes INTEGER;
  total_size BIGINT;
BEGIN
  SELECT COUNT(*), SUM(pg_relation_size(indexname::regclass))
  INTO total_indexes, total_size
  FROM pg_indexes
  WHERE tablename = 'profiles';

  RAISE NOTICE 'Indici rimanenti: %, Dimensione: % kB', total_indexes, (total_size / 1024)::INTEGER;
END $$;
```

---

### 3.2: Aggiornare Statistiche Database

```sql
ANALYZE profiles;
```

Questo assicura che il query planner abbia statistiche aggiornate.

---

### 3.3: (Opzionale) Ottimizzare Funzione RPC

Se la query è ancora lenta dopo la rimozione degli indici, possiamo ottimizzare la funzione stessa.

Vedi: `docs/PIANO_OTTIMIZZAZIONE_RPC_TIMEOUT.md` - FASE 3

---

## 🎯 STEP 4: Verificare Risultati

### Test Post-Ottimizzazione

Eseguire di nuovo Query 5 per verificare il miglioramento:

```sql
-- Stesso test di Query 5
DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  end_time TIMESTAMP WITH TIME ZONE;
  execution_time_ms NUMERIC;
  result JSON;
BEGIN
  start_time := clock_timestamp();
  SELECT get_clienti_stats() INTO result;
  end_time := clock_timestamp();
  execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

  RAISE NOTICE 'Tempo esecuzione POST-OTTIMIZZAZIONE: % ms', execution_time_ms::NUMERIC(10,2);

  IF execution_time_ms < 100 THEN
    RAISE NOTICE '✅ OTTIMO: Esecuzione < 100 ms';
  ELSIF execution_time_ms < 500 THEN
    RAISE NOTICE '✅ BUONO: Esecuzione < 500 ms';
  ELSIF execution_time_ms < 1000 THEN
    RAISE NOTICE '⚠️ ACCETTABILE: Esecuzione < 1 s';
  ELSE
    RAISE WARNING '⚠️ ANCORA LENTO: Esecuzione > 1 s - Considera ulteriori ottimizzazioni';
  END IF;
END $$;
```

---

## 📊 Tabella Risultati

Compila questa tabella con i risultati:

| Metrica                    | Prima   | Dopo | Miglioramento |
| -------------------------- | ------- | ---- | ------------- |
| **Numero Righe**           | ?       | -    | -             |
| **Tempo Esecuzione (ms)**  | ?       | ?    | ?             |
| **Numero Indici**          | 15      | ?    | ?             |
| **Dimensione Indici (kB)** | 240     | ?    | ?             |
| **Timeout Client**         | Sì (3s) | ?    | ?             |

---

## ✅ Checklist Finale

- [ ] Query 1: Numero righe eseguita
- [ ] Query 5: Tempo esecuzione misurato
- [ ] Risultati analizzati e interpretati
- [ ] Migration rimozione indici eseguita
- [ ] `ANALYZE profiles` eseguito
- [ ] Query 5 ripetuta (post-ottimizzazione)
- [ ] Risultati verificati e documentati
- [ ] Test client: timeout risolto?

---

## 📝 File di Riferimento

1. `docs/SQL_PRIORITA_ALTA_RPC_TIMEOUT.sql` - Query di analisi
2. `docs/ANALISI_RISULTATI_INDICI.md` - Analisi indici
3. `supabase/migrations/20250131_remove_redundant_indexes_profiles.sql` - Migration
4. `docs/PIANO_OTTIMIZZAZIONE_RPC_TIMEOUT.md` - Piano completo

---

**Prossimo Step**: Eseguire Query 1 e Query 5, condividere risultati, poi procediamo con tutto insieme!
