# 📋 Guida Completa FIX_18 - Standardizzazione Colonne Duplicate

**Data:** 2025-02-01  
**Stato:** ✅ Script pronti per l'esecuzione

---

## 🎯 Obiettivo

Standardizzare le colonne duplicate nel database, mantenendo solo le colonne standard e rimuovendo quelle deprecate.

---

## ⚠️ ATTENZIONE

Questo processo **modifica lo schema del database**. Assicurati di:

1. ✅ Fare backup del database
2. ✅ Testare in ambiente di sviluppo
3. ✅ Verificare che il codice applicativo usi le colonne standardizzate
4. ✅ Eseguire gli script nell'ordine corretto

---

## 📝 Sequenza di Esecuzione

### STEP 1: Verifica Pre-Esecuzione (OPZIONALE ma CONSIGLIATO)

```sql
-- Eseguire questo script per vedere lo stato attuale
FIX_18_VERIFICA_PRE_ESECUZIONE.sql
```

**Cosa verifica:**

- Colonne duplicate esistenti
- Funzione `check_invite_expiry()` attuale
- Trigger `trigger_check_invite_expiry` attuale
- RLS policies che potrebbero dipendere da colonne duplicate
- Indici su colonne duplicate
- Conteggio record con colonne duplicate

---

### STEP 2: Aggiorna Funzione check_invite_expiry

```sql
-- Eseguire questo PRIMA di FIX_18_STANDARDIZZAZIONE_COLONNE.sql
FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql
```

**Cosa fa:**

- Aggiorna la funzione `check_invite_expiry()` per usare `status` invece di `stato`
- Aggiorna il trigger `trigger_check_invite_expiry` per usare `status`
- Aggiunge commento alla funzione

**Perché separato:**

- Non possiamo creare/aggiornare funzioni dentro un blocco `DO $$` usando `EXECUTE` in modo affidabile
- Separare questa operazione evita problemi di sintassi

---

### STEP 2B: Aggiorna Funzione update_expired_invites (OPZIONALE)

```sql
-- Eseguire questo se la funzione update_expired_invites esiste
FIX_18_AGGIORNA_FUNZIONE_UPDATE_EXPIRED_INVITES.sql
```

**Cosa fa:**

- Verifica se la funzione `update_expired_invites()` esiste e usa `stato`
- Se esiste e usa `stato`, la aggiorna per usare `status`
- Aggiunge commento alla funzione

**Nota:** Questo script è idempotente e può essere eseguito anche se la funzione non esiste o è già aggiornata.

---

### STEP 3: Standardizza Colonne Duplicate

```sql
-- Eseguire questo DOPO FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql
FIX_18_STANDARDIZZAZIONE_COLONNE.sql
```

**Cosa fa:**

- **STEP 1:** `workout_logs` - Rimuove `athlete_id`, mantiene `atleta_id`
- **STEP 2:** `inviti_atleti` - Rimuove `stato` e `trainer_id`, mantiene `status` e `pt_id`
- **STEP 3:** `notifications` - Rimuove `body` e `read`, mantiene `message` e `is_read`
- **STEP 4:** `payments` - Rimuove `method_text` e `trainer_id`, mantiene `payment_method` e `created_by_staff_id`
- **STEP 5:** `user_settings` - Rimuove `notifications`, `privacy`, `account`, mantiene `notification_settings`, `privacy_settings`, `account_settings`
- **STEP 6:** `cliente_tags` - Nessuna modifica (colonne multilingua)

**Operazioni per ogni tabella:**

1. Copia dati dalla colonna deprecata alla colonna standard
2. Aggiorna RLS policies (se necessario)
3. Rimuove indici sulla colonna deprecata
4. Rimuove la colonna deprecata (con CASCADE se necessario)

---

## 🔍 Dettagli Standardizzazione

### 1. workout_logs

| Colonna Deprecata | Colonna Standard | Azione                                             |
| ----------------- | ---------------- | -------------------------------------------------- |
| `athlete_id`      | `atleta_id`      | Copia dati, aggiorna RLS policies, rimuovi colonna |

**RLS Policies aggiornate:**

- `Athletes can view own workout logs`
- `Trainers can view workout logs`
- `Users can insert workout logs`
- `Users can update workout logs`
- `Users can delete workout logs`

---

### 2. inviti_atleti

| Colonna Deprecata | Colonna Standard | Azione                                                          |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `stato`           | `status`         | Copia dati, rimuovi colonna (funzione già aggiornata in STEP 2) |
| `trainer_id`      | `pt_id`          | Copia dati, rimuovi colonna                                     |

**Nota:** La funzione `check_invite_expiry()` deve essere aggiornata PRIMA di rimuovere `stato`.

---

### 3. notifications

| Colonna Deprecata | Colonna Standard | Azione                      |
| ----------------- | ---------------- | --------------------------- |
| `body`            | `message`        | Copia dati, rimuovi colonna |
| `read`            | `is_read`        | Copia dati, rimuovi colonna |

---

### 4. payments

| Colonna Deprecata | Colonna Standard      | Azione                      |
| ----------------- | --------------------- | --------------------------- |
| `method_text`     | `payment_method`      | Copia dati, rimuovi colonna |
| `trainer_id`      | `created_by_staff_id` | Copia dati, rimuovi colonna |

---

### 5. user_settings

| Colonna Deprecata | Colonna Standard        | Azione                      |
| ----------------- | ----------------------- | --------------------------- |
| `notifications`   | `notification_settings` | Copia dati, rimuovi colonna |
| `privacy`         | `privacy_settings`      | Copia dati, rimuovi colonna |
| `account`         | `account_settings`      | Copia dati, rimuovi colonna |

---

### 6. cliente_tags

**Nessuna modifica** - Colonne multilingua (`nome`/`name`, `colore`/`color`, `descrizione`/`description`) vengono mantenute entrambe.

---

## ⚠️ Problemi Potenziali e Soluzioni

### Problema 1: RLS Policies che usano colonne deprecate

**Sintomo:** Errore quando si tenta di rimuovere una colonna perché una policy la usa.

**Soluzione:** Lo script aggiorna automaticamente le RLS policies per `workout_logs`. Per `inviti_atleti`, le policies dovrebbero usare `pt_id` o `invited_by`, non `trainer_id` o `stato`.

**Verifica:**

```sql
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'inviti_atleti'
  AND (qual LIKE '%trainer_id%' OR qual LIKE '%stato%'
       OR with_check LIKE '%trainer_id%' OR with_check LIKE '%stato%');
```

Se ci sono policies che usano `trainer_id` o `stato`, aggiornarle manualmente prima di eseguire FIX_18.

---

### Problema 2: Funzione update_expired_invites() usa stato

**Sintomo:** Potrebbe esserci un'altra funzione che usa `stato`.

**Verifica:**

```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%stato%'
  AND routine_schema = 'public';
```

**Soluzione:** Se esiste, aggiornarla per usare `status` prima di eseguire FIX_18.

---

### Problema 3: Trigger che dipende da stato

**Sintomo:** Errore quando si tenta di rimuovere `stato` perché un trigger la usa.

**Soluzione:** Lo script `FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql` aggiorna il trigger. Se ci sono altri trigger, aggiornarli manualmente.

**Verifica:**

```sql
SELECT trigger_name, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'inviti_atleti'
  AND action_statement LIKE '%stato%';
```

---

## ✅ Verifica Post-Esecuzione

Dopo aver eseguito tutti gli script, verifica:

```sql
-- Verifica che le colonne deprecate siano state rimosse
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'workout_logs' AND column_name = 'athlete_id')
    OR (table_name = 'inviti_atleti' AND column_name IN ('stato', 'trainer_id'))
    OR (table_name = 'notifications' AND column_name IN ('body', 'read'))
    OR (table_name = 'payments' AND column_name IN ('method_text', 'trainer_id'))
    OR (table_name = 'user_settings' AND column_name IN ('notifications', 'privacy', 'account'))
  );
-- Dovrebbe restituire 0 righe

-- Verifica che le colonne standard esistano
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'workout_logs' AND column_name = 'atleta_id')
    OR (table_name = 'inviti_atleti' AND column_name IN ('status', 'pt_id'))
    OR (table_name = 'notifications' AND column_name IN ('message', 'is_read'))
    OR (table_name = 'payments' AND column_name IN ('payment_method', 'created_by_staff_id'))
    OR (table_name = 'user_settings' AND column_name IN ('notification_settings', 'privacy_settings', 'account_settings'))
  );
-- Dovrebbe restituire tutte le colonne standard
```

---

## 📚 File Correlati

- `FIX_17_ANALISI_USO_COLONNE_CODICE.sql` - Analisi uso colonne duplicate
- `FIX_18_VERIFICA_PRE_ESECUZIONE.sql` - Verifica stato pre-esecuzione
- `FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql` - Aggiorna funzione (STEP 2)
- `FIX_18_STANDARDIZZAZIONE_COLONNE.sql` - Standardizzazione colonne (STEP 3)
- `ANALISI_FIX_18_PROBLEMA.md` - Analisi problema tecnico

---

## 🎯 Risultato Atteso

Dopo l'esecuzione completa:

- ✅ Tutte le colonne duplicate rimosse
- ✅ Tutte le colonne standard mantenute e popolate
- ✅ RLS policies aggiornate
- ✅ Funzioni e trigger aggiornati
- ✅ Schema database standardizzato e coerente

---

**Ultimo aggiornamento:** 2025-02-01
