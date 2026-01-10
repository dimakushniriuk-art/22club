# 🎯 Istruzioni: Priorità Alta - Analisi RPC Timeout

**Data**: 2025-01-31  
**File SQL**: `docs/SQL_PRIORITA_ALTA_RPC_TIMEOUT.sql`

---

## 📋 Ordine di Esecuzione

Esegui le query nell'ordine seguente per una diagnosi completa:

---

## 1️⃣ Query 1: Verificare Numero Righe

**Query**: Prima query nel file SQL

**Cosa Aspettarsi**:

- Se `total_profiles` < 50 → conferma che sono pochi dati
- Se `total_atleti` < 30 → il timeout è anomalo

**Interpretazione**:

- ✅ Se pochi dati (< 50): Il problema NON è il volume
- ⚠️ Se molti dati (> 500): Potrebbe essere un problema di volume (ma improbabile con 16 kB)

---

## 2️⃣ Query 2: Listare Tutti gli Indici

**Query**: Seconda query nel file SQL

**Cosa Cercare**:

- Indici molto grandi (> 50 kB)
- Indici con nomi simili
- Indici duplicati (stesse colonne, diverse WHERE clause)

**Interpretazione**:

- ✅ 5-10 indici normali per una tabella
- ⚠️ > 15 indici → potrebbero essere troppi
- 🔴 Indici duplicati → rimuovere i ridondanti

**Output Atteso**: Lista di tutti gli indici con dimensioni e tipo

---

## 3️⃣ Query 3: Query Plan - Query Diretta

**Query**: Terza query nel file SQL

**Cosa Cercare nell'Output**:

1. **Execution Time**: Quanto tempo impiega realmente
2. **Index Scan**: Quale indice viene usato (se any)
3. **Seq Scan**: Se fa full table scan (dovrebbe essere veloce con pochi dati)
4. **Planning Time**: Tempo di pianificazione

**Interpretazione**:

- ✅ Execution Time < 10 ms → Query veloce (timeout è problema di rete)
- ⚠️ Execution Time 100-1000 ms → Query lenta (problema query plan)
- 🔴 Execution Time > 2000 ms → Problema serio

---

## 4️⃣ Query 4: Query Plan - Funzione RPC

**Query**: Quarta query nel file SQL

**Cosa Cercare**:

- Confrontare con Query 3
- Se il tempo è molto diverso, potrebbe essere overhead della funzione

**Interpretazione**:

- Se simile a Query 3 → Funzione non aggiunge overhead significativo
- Se molto diverso → Problema nella funzione stessa

---

## 5️⃣ Query 5: Test Tempo di Esecuzione

**Query**: Quinta query (DO block)

**Cosa Vedrai**:

- Messaggi NOTICE con:
  - Tempo di esecuzione in millisecondi
  - Risultato della funzione
  - Warning se > 1s o 2s

**Interpretazione**:

- ✅ < 100 ms → Query veloce (timeout è latenza rete/Supabase)
- ⚠️ 100-1000 ms → Query lenta ma accettabile
- 🔴 > 2000 ms → Problema confermato nella query

---

## 6️⃣ Query 6: Indici Ridondanti

**Query**: Sesta query nel file SQL

**Cosa Cercare**:

- Pattern con `numero_indici > 1` → potrebbero essere duplicati
- Pattern `role+stato` con più indici → potrebbero essere ridondanti

**Interpretazione**:

- ✅ Ogni pattern ha 1-2 indici → OK
- ⚠️ Pattern con 3+ indici → Potrebbero essere ridondanti
- 🔴 Stesso pattern, stesse colonne → Duplicati da rimuovere

---

## 📊 Dopo Aver Eseguito le Query

### Cosa Fare con i Risultati:

1. **Salvare i risultati** delle query 1, 2, 5, 6 (sono i più importanti)
2. **Analizzare i query plan** (query 3 e 4) per vedere quale indice viene usato
3. **Confrontare** i tempi di esecuzione tra query diretta e funzione RPC

### Prossimo Step in Base ai Risultati:

**Se Execution Time < 100 ms**:

- Il problema è latenza di rete/Supabase
- ✅ Non serve ottimizzare query
- Considerare caching o aumentare timeout client

**Se Execution Time > 1000 ms**:

- Il problema è nella query stessa
- Procedere con ottimizzazioni (FASE 2 del piano)

**Se Trovati Indici Ridondanti**:

- Preparare migration per rimuovere indici duplicati
- Mantenere solo gli indici più efficienti

---

## 🔍 Output Atteso

Dopo aver eseguito tutte le query, dovresti avere:

1. ✅ Numero esatto di righe nella tabella
2. ✅ Lista completa di tutti gli indici con dimensioni
3. ✅ Query plan della query diretta
4. ✅ Query plan della funzione RPC
5. ✅ Tempo reale di esecuzione (in millisecondi)
6. ✅ Analisi pattern indici (per identificare duplicati)

Con questi dati potremo identificare la causa esatta e procedere con l'ottimizzazione mirata.

---

**Vuoi procedere?** Esegui le query nell'ordine indicato e condividi i risultati.
