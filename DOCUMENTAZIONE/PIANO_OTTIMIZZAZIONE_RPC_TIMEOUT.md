# 🚀 Piano Ottimizzazione RPC Timeout

**Data**: 2025-01-31  
**Problema**: `get_clienti_stats()` timeout dopo 3s, `fetchClienti.data` timeout dopo 5-8s  
**Priorità**: 🟡 MEDIA  
**Tempo Stimato**: 5 ore

---

## 📋 Stato Attuale

### Cosa È Già Implementato ✅

1. ✅ Funzione RPC ottimizzata con `FILTER` invece di subquery
2. ✅ `SECURITY DEFINER` per bypassare RLS
3. ✅ `STABLE` attribute per ottimizzazione query planner
4. ✅ Indici esistenti su `profiles`:
   - `idx_profiles_role`
   - `idx_profiles_role_stato`
   - `idx_profiles_data_iscrizione`
   - `idx_profiles_documenti_scadenza`
5. ✅ Timeout e fallback nel codice client

### Problema Potenziale ⚠️

- Query usa `role IN ('atleta', 'athlete')` ma indici parziali usano solo `'atleta'`
- Questo potrebbe impedire l'uso ottimale degli indici parziali

---

## 🎯 Piano di Azione

### FASE 1: Analisi e Diagnosi (1 ora)

**Obiettivo**: Identificare la causa esatta del timeout

#### Step 1.1: Eseguire Query di Verifica

Eseguire lo script: `docs/SQL_VERIFICA_RPC_TIMEOUT.sql`

**Query Chiave**:

1. Verifica indici esistenti
2. Query plan analisi (`EXPLAIN ANALYZE`)
3. Test tempo esecuzione
4. Verifica statistiche database

#### Step 1.2: Analizzare Risultati

**Cosa Verificare**:

- Quale indice viene usato (se any)?
- Tempo reale di esecuzione
- Numero righe nella tabella
- Se c'è full table scan
- Se ci sono lock o query bloccanti

**Output Atteso**: Report con identificazione problema specifico

---

### FASE 2: Ottimizzazione Indici (1.5 ore)

**Obiettivo**: Assicurarsi che gli indici siano ottimali per la query

#### Step 2.1: Verificare Indici Esistenti

Se gli indici esistono ma non vengono usati:

**Opzione A: Creare Indice Migliorato**

```sql
-- Indice composito che supporta entrambi i valori role
CREATE INDEX IF NOT EXISTS idx_profiles_atleti_optimized
ON profiles(role, stato, data_iscrizione DESC, documenti_scadenza)
WHERE role IN ('atleta', 'athlete');
```

**Opzione B: Semplificare Query (se 'athlete' è alias)**

Se `'athlete'` è solo un alias di `'atleta'`, normalizzare i dati o usare solo `'atleta'` nella query.

#### Step 2.2: Verificare Uso Indice

Eseguire di nuovo `EXPLAIN ANALYZE` per verificare che l'indice venga usato.

---

### FASE 3: Ottimizzazione Query (1 ora)

**Obiettivo**: Migliorare la query stessa se necessario

#### Step 3.1: Considerare Normalizzazione Role

Se `'athlete'` e `'atleta'` sono equivalenti, possiamo:

1. Normalizzare tutti i valori a `'atleta'` nel database
2. Oppure creare vista materializzata

#### Step 3.2: Ottimizzazioni Query

**Miglioramento Possibile 1: Unificare FILTER**

```sql
-- Invece di ripetere role IN (...) in ogni FILTER,
-- usare una CTE per filtrare prima
WITH atleti AS (
  SELECT * FROM profiles WHERE role IN ('atleta', 'athlete')
)
SELECT JSON_BUILD_OBJECT(
  'totali', COUNT(*),
  'attivi', COUNT(*) FILTER (WHERE stato = 'attivo'),
  ...
) FROM atleti;
```

**Miglioramento Possibile 2: Rimuovere FILTER ridondanti**

```sql
-- Se già filtrato in WHERE, non serve ripetere
```

#### Step 3.3: Aggiornare Funzione

Creare migration con versione ottimizzata.

---

### FASE 4: Ottimizzazione fetchClienti (1 ora)

**Obiettivo**: Ottimizzare anche la query principale `fetchClienti`

#### Step 4.1: Analizzare Query fetchClienti

Verificare nel codice `src/hooks/use-clienti.ts`:

- Quali filtri vengono applicati
- Se ci sono ricerche testuali inefficienti
- Se la paginazione è ottimizzata

#### Step 4.2: Applicare Ottimizzazioni

Se necessario:

- Aggiungere indici per ricerca testuale (trigram se non esistenti)
- Ottimizzare pattern di ricerca (`term%` invece di `%term%`)
- Implementare timeout dinamico più intelligente

---

### FASE 5: Test Performance (1 ora)

**Obiettivo**: Verificare che le ottimizzazioni funzionino

#### Step 5.1: Test con Dati Reali

1. Eseguire query di verifica
2. Misurare tempo esecuzione
3. Verificare che sia < 2s per `get_clienti_stats()`
4. Verificare che sia < 4s per `fetchClienti`

#### Step 5.2: Test con Dati Voluminosi

Se possibile, testare con:

- 100+ profili
- 500+ profili
- 1000+ profili

Per verificare scalabilità.

---

### FASE 6: Documentazione (30 min)

**Obiettivo**: Documentare le ottimizzazioni

1. Aggiornare `docs/troubleshooting-rpc-timeout.md`
2. Documentare modifiche apportate
3. Aggiungere query di verifica
4. Documentare best practices per future query

---

## 📊 Success Criteria

- ✅ `get_clienti_stats()` < 2s (da 3s+)
- ✅ `fetchClienti` < 4s (da 5-8s)
- ✅ Nessun timeout in condizioni normali
- ✅ Query plan mostra uso indici appropriati
- ✅ Test passati con dati reali

---

## 🔄 Alternative se Ottimizzazioni Non Sufficienti

### Opzione A: Caching

Se le statistiche non cambiano frequentemente:

- Implementare cache lato server (Redis/Memcached)
- Cache lato client con TTL

### Opzione B: Materialized View

Creare materialized view per statistiche:

- Refresh periodico (es: ogni ora)
- Refresh on-demand quando necessario

### Opzione C: Background Job

Calcolare statistiche in background:

- Job che gira periodicamente
- Salva risultati in tabella dedicata
- Query legge da tabella invece di calcolare on-the-fly

---

## 📝 File da Creare/Modificare

1. **SQL Migration**: `supabase/migrations/20250131_optimize_clienti_stats_rpc_final.sql`
2. **Documentazione**: Aggiornare `docs/troubleshooting-rpc-timeout.md`
3. **Script Verifica**: `docs/SQL_VERIFICA_RPC_TIMEOUT.sql` (già creato)

---

## 🎯 Prossimo Step Immediato

1. **Eseguire analisi**: `docs/SQL_VERIFICA_RPC_TIMEOUT.sql`
2. **Analizzare risultati** e identificare problema specifico
3. **Procedere con FASE 2** (ottimizzazione indici) o FASE 3 (ottimizzazione query)

---

**Ultimo Aggiornamento**: 2025-01-31
