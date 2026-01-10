# Guida Sequenza Esecuzione Fix - Completa

## 📋 Riepilogo Stato Completo

### ✅ FASE 1: Sicurezza Critica - COMPLETATA (4/4)

- ✅ FIX_01_RLS_ROLES.sql
- ✅ FIX_02_RLS_WEB_VITALS.sql
- ✅ FIX_03_RLS_WORKOUT_SETS.sql
- ✅ FIX_04_STORAGE_DOCUMENTS_POLICIES.sql

### ✅ FASE 2: Integrità Dati - COMPLETATA (3/3)

- ✅ FIX_05_FK_CHAT_MESSAGES.sql
- ✅ FIX_06_FK_NOTIFICATIONS.sql
- ✅ FIX_07_FK_PAYMENTS.sql

### ✅ FASE 3: Coerenza Schema - COMPLETATA (3/3)

- ✅ FIX_08_COMMENT_ATHLETE_ID.sql
- ✅ FIX_09_TRIGGER_DUPLICATI.sql
- ✅ FIX_10_FK_DUPLICATA.sql

### ⏳ FASE 4: Storage - DISPONIBILE (2 fix)

- ⏳ FIX_11_STORAGE_PROGRESS_PHOTOS_POLICIES.sql
- ⏳ FIX_12_STORAGE_ATHLETE_DOCUMENTS_POLICIES.sql

### ⏳ FASE 5: Performance - DISPONIBILE (1 analisi)

- ⏳ FIX_13_ANALISI_INDICI_PERFORMANCE.sql

### ⏳ FASE 6: Refactoring - DISPONIBILE (2 analisi)

- ⏳ FIX_14_ANALISI_COLONNE_DUPLICATE.sql
- ⏳ FIX_15_ANALISI_STORAGE_LEGACY.sql

---

## 🔄 SEQUENZA DI ESECUZIONE (FASE 4, 5, 6)

### FASE 4: Storage Policies

#### STEP 1: Policies per trainer su progress-photos

**Eseguire:**

```sql
docs/FIX_11_STORAGE_PROGRESS_PHOTOS_POLICIES.sql
```

**Cosa fa:**

- Aggiunge 4 policies per permettere ai trainer di vedere/caricare/aggiornare/eliminare foto progressi dei propri atleti
- Bucket: `progress-photos` e `athlete-progress-photos`
- Verifica relazione tramite `pt_atleti`

**Risultato atteso:**

- Success. No rows returned
- 4 policies aggiunte per trainer

---

#### STEP 2: Policies per bucket athlete-documents

**Eseguire:**

```sql
docs/FIX_12_STORAGE_ATHLETE_DOCUMENTS_POLICIES.sql
```

**Cosa fa:**

- Aggiunge 8 policies (4 per utenti + 4 per trainer) per bucket `athlete-documents`
- Modello simile a `athlete-certificates` con verifica `pt_atleti`

**Risultato atteso:**

- Success. No rows returned
- 8 policies aggiunte

---

### FASE 5: Performance (Analisi)

#### STEP 3: Analisi indici performance

**Eseguire:**

```sql
docs/FIX_13_ANALISI_INDICI_PERFORMANCE.sql
```

**Cosa fa:**

- Analizza indici con bassa efficienza (<50%)
- Identifica indici con 0% efficienza
- Mostra indici non utilizzati (0 scansioni)
- Fornisce raccomandazioni per ottimizzazione

**Risultato atteso:**

- Report dettagliato con analisi e raccomandazioni
- **NON modifica** gli indici (richiede valutazione caso per caso)

**Nota:** Dopo l'analisi, valutare se applicare le raccomandazioni suggerite.

---

### FASE 6: Refactoring (Analisi)

#### STEP 4: Analisi colonne duplicate

**Eseguire:**

```sql
docs/FIX_14_ANALISI_COLONNE_DUPLICATE.sql
```

**Cosa fa:**

- Analizza colonne duplicate in 6 tabelle:
  - `workout_logs`: athlete_id / atleta_id
  - `inviti_atleti`: stato / status, pt_id / trainer_id
  - `notifications`: body / message, read / is_read
  - `payments`: payment_method / method_text, created_by_staff_id / trainer_id
  - `user_settings`: notification_settings / notifications, ecc.
  - `cliente_tags`: nome / name, colore / color, descrizione / description
- Fornisce raccomandazioni per standardizzazione

**Risultato atteso:**

- Report dettagliato con analisi e raccomandazioni
- **NON modifica** le colonne (richiede analisi codice applicativo)

---

#### STEP 5: Analisi storage legacy

**Eseguire:**

```sql
docs/FIX_15_ANALISI_STORAGE_LEGACY.sql
```

**Cosa fa:**

- Identifica bucket duplicati/legacy:
  - `documents` vs `athlete-documents`
  - `progress-photos` vs `athlete-progress-photos`
- Conta file orfani (senza record in tabella)
- Identifica file mancanti per `exercises.video_url`
- Fornisce raccomandazioni per migrazione

**Risultato atteso:**

- Report dettagliato con analisi e raccomandazioni
- **NON modifica** i bucket o i file (richiede decisioni manuali)

---

## 📝 Checklist Esecuzione Completa

### Fase 4: Storage

- [ ] STEP 1: Eseguire `FIX_11_STORAGE_PROGRESS_PHOTOS_POLICIES.sql`
- [ ] STEP 2: Eseguire `FIX_12_STORAGE_ATHLETE_DOCUMENTS_POLICIES.sql`

### Fase 5: Performance

- [ ] STEP 3: Eseguire `FIX_13_ANALISI_INDICI_PERFORMANCE.sql`
- [ ] Valutare raccomandazioni e applicare ottimizzazioni se necessario

### Fase 6: Refactoring

- [ ] STEP 4: Eseguire `FIX_14_ANALISI_COLONNE_DUPLICATE.sql`
- [ ] STEP 5: Eseguire `FIX_15_ANALISI_STORAGE_LEGACY.sql`
- [ ] Valutare raccomandazioni e pianificare migrazioni

---

## 🎯 Ordine Rapido (Fase 4)

Se vuoi procedere velocemente con solo le policies storage:

1. `FIX_11_STORAGE_PROGRESS_PHOTOS_POLICIES.sql`
2. `FIX_12_STORAGE_ATHLETE_DOCUMENTS_POLICIES.sql`

Le analisi (Fase 5 e 6) possono essere eseguite successivamente quando necessario.

---

## ⚠️ Note Importanti

1. **Fase 4 (Storage)**: Script esecutivi che modificano le policies
2. **Fase 5 (Performance)**: Script di analisi, non modifica direttamente
3. **Fase 6 (Refactoring)**: Script di analisi, richiede decisioni manuali
4. **Verificare sempre**: Controllare i risultati prima di procedere
5. **Backup**: Considerare un backup prima di modifiche importanti

---

## 📊 Riepilogo Totale Fix

- ✅ **Completati:** 10 fix (Fase 1, 2, 3)
- ⏳ **Disponibili:** 5 script (Fase 4, 5, 6)
  - 2 fix esecutivi (Fase 4)
  - 3 analisi (Fase 5, 6)

---

## 🔍 Script di Supporto Disponibili

### Diagnostica

- `FIX_05_DIAGNOSTIC_ORPHAN_CHAT_MESSAGES.sql`
- `FIX_06_DIAGNOSTIC_ORPHAN_NOTIFICATIONS.sql`
- `FIX_07_RESOLVE_ORPHANS.sql`

### Cleanup

- `FIX_05_CLEANUP_EXECUTE_V2.sql`
- `FIX_06_CLEANUP_EXECUTE.sql`
- `FIX_07_CLEANUP_EXECUTE.sql`

### Risoluzione

- `FIX_05_RESOLVE_ORPHANS.sql`
- `FIX_06_RESOLVE_ORPHANS.sql`

---

**Ultimo aggiornamento:** 2025-02-01
