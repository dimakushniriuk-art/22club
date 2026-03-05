# 🎯 Piano Ottimizzazione 12 Indici Rimanenti

**Data**: 2025-01-31  
**Obiettivo**: Ottimizzare ulteriormente i 12 indici rimanenti  
**Approccio**: Analisi approfondita utilizzo e ridondanze

---

## 📊 Strategia di Analisi

### Fase 1: Analisi Utilizzo Indici

1. **Eseguire `SQL_ANALISI_OTTIMIZZAZIONE_12_INDICI.sql`**
   - Query 1: Lista completa 12 indici
   - Query 2: Analisi ridondanze
   - Query 3: Verifica utilizzo (pg_stat_user_indexes)
   - Query 4: Riepilogo per categoria
   - Query 5: Suggerimenti specifici

### Fase 2: Valutazione Indici Standard

**Indici da valutare attentamente** (non constraint, non parziali):

1. `idx_profiles_user_id`
   - **Possibile ridondanza**: Se esiste `profiles_user_id_key` (UNIQUE)
   - **Decisione**: RIMUOVI se UNIQUE esiste

2. `idx_profiles_citta`
   - **Possibile ridondanza**: Se esiste `idx_profiles_citta_provincia`
   - **Decisione**: RIMUOVI se composito esiste (PostgreSQL può usare composito per sola citta)

3. `idx_profiles_org_id`
   - **Valutazione**: Verificare utilizzo nelle query
   - **Decisione**: RIMUOVI se mai usato o poco usato (< 5 scansioni)

4. `idx_profiles_created_at`
   - **Valutazione**: Verificare utilizzo nelle query
   - **Decisione**: RIMUOVI se mai usato o poco usato (< 5 scansioni)

5. `idx_profiles_data_nascita`
   - **Valutazione**: Verificare utilizzo nelle query
   - **Decisione**: RIMUOVI se mai usato o poco usato (< 5 scansioni)

### Fase 3: Valutazione Indici Trigram (GIN)

**Indici full-text**:

1. `idx_profiles_nome_trgm` (se esiste)
   - **Valutazione**: Verificare se ricerca full-text è usata
   - **Decisione**: RIMUOVI se ricerca full-text non è usata

2. `idx_profiles_cognome_trgm` (se esiste)
   - **Valutazione**: Verificare se ricerca full-text è usata
   - **Decisione**: RIMUOVI se ricerca full-text non è usata

---

## ✅ Indici da MANTENERE (presumibilmente)

1. **CONSTRAINT (necessari)**:
   - `profiles_pkey` (PRIMARY KEY)
   - `profiles_email_unique` (UNIQUE)
   - `profiles_user_id_key` (UNIQUE)
   - `idx_profiles_codice_fiscale_unique` (UNIQUE)

2. **Indici parziali ottimizzati**:
   - `idx_profiles_role_stato` (parziale WHERE role = 'atleta')
   - `idx_profiles_data_iscrizione` (parziale WHERE role IN ('atleta', 'athlete'))

3. **Indici compositi utili**:
   - `idx_profiles_citta_provincia` (se esiste, copre anche citta)

---

## ⚠️ Criteri per Rimozione

### Indici da RIMUOVERE se:

1. **Ridondanza accertata**:
   - Coperto da UNIQUE constraint equivalente
   - Coperto da indice composito (prima colonna)

2. **Mai usato o poco usato**:
   - `idx_scan = 0` (mai usato)
   - `idx_scan < 5` (molto poco usato) E dimensione > 8 kB

3. **Indici trigram non necessari**:
   - Se ricerca full-text non è implementata o usata

---

## 📋 Piano di Azione

### STEP 1: Eseguire Analisi

```sql
-- Eseguire: docs/SQL_ANALISI_OTTIMIZZAZIONE_12_INDICI.sql
```

### STEP 2: Interpretare Risultati

- **Query 1**: Vedere lista completa 12 indici
- **Query 2**: Identificare ridondanze suggerite
- **Query 3**: Verificare utilizzo (scansioni)
- **Query 4**: Riepilogo per categoria
- **Query 5**: Suggerimenti specifici

### STEP 3: Creare Migration per Rimozioni Sicure

Per ogni indice da rimuovere:

1. Verificare ridondanza/assenza utilizzo
2. Creare `DROP INDEX IF EXISTS`
3. Aggiungere `ANALYZE profiles;`
4. Aggiungere verifica post-rimozione

### STEP 4: Test Post-Rimozione

1. Verificare numero indici finali
2. Verificare dimensioni finali
3. Testare query critiche
4. Verificare performance RPC

---

## 🎯 Obiettivi

- **Ridurre numero indici**: Da 12 a ~8-10 (target: solo indici necessari)
- **Ridurre dimensioni**: Ulteriore 10-20% di riduzione
- **Mantenere performance**: Nessun impatto negativo su query critiche
- **Pulizia database**: Solo indici realmente utilizzati

---

## ⚠️ Precauzioni

1. **Mai rimuovere CONSTRAINT** (PRIMARY KEY, UNIQUE)
2. **Mai rimuovere indici parziali ottimizzati** (role_stato, data_iscrizione)
3. **Verificare sempre utilizzo** prima di rimuovere
4. **Eseguire ANALYZE** dopo ogni rimozione
5. **Testare query critiche** dopo rimozioni

---

**Prossimo Step**: Eseguire `SQL_ANALISI_OTTIMIZZAZIONE_12_INDICI.sql` e condividere risultati
