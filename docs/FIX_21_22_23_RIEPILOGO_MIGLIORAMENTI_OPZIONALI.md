# 📋 Riepilogo Miglioramenti Opzionali (FIX_21, FIX_22, FIX_23)

**Data creazione:** 2025-02-01  
**Stato:** Script creati, pronti per esecuzione

---

## 🎯 Obiettivo

Completare i miglioramenti opzionali identificati nella documentazione:

1. Aggiungere FK mancanti su `workout_plans`
2. Rinominare `documents.uploaded_by_user_id` per chiarezza

---

## 📝 Script Creati

### FIX_21: Verifica struttura workout_plans

**File:** `docs/FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql`

**Scopo:** Verifica la struttura attuale di `workout_plans` per determinare:

- Colonne esistenti (`created_by`, `trainer_id`)
- Foreign Keys esistenti
- Utilizzo delle colonne (valori non null)
- Corrispondenza con `profiles` o `auth.users`

**Quando eseguire:** Prima di FIX_22

---

### FIX_22: Aggiunge/corregge Foreign Keys su workout_plans

**File:** `docs/FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql`

**Scopo:** Aggiunge le FK mancanti su `workout_plans`:

- `created_by` → `auth.users.id` (se non esiste o è errata)
- `trainer_id` → `profiles.id` (se la colonna esiste)

**Azioni:**

1. Verifica FK esistenti
2. Verifica dati orfani
3. Rimuove FK errate (se presenti)
4. Aggiunge FK corrette

**Quando eseguire:** Dopo FIX_21

**Note:**

- Se ci sono dati orfani, lo script avvisa ma non procede
- Richiede cleanup manuale se ci sono dati orfani

---

### FIX_23: Rinomina uploaded_by_user_id

**File:** `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`

**Scopo:** Rinomina `documents.uploaded_by_user_id` in `uploaded_by_profile_id` per chiarezza

**Azioni:**

1. Verifica esistenza colonna
2. Rimuove FK temporaneamente
3. Rinomina colonna
4. Ricrea FK con nuovo nome
5. Aggiorna indici

**Quando eseguire:** Dopo aver verificato che il codice applicativo può essere aggiornato

**⚠️ IMPORTANTE:**

- Aggiornare il codice applicativo per usare `uploaded_by_profile_id`
- Testare in ambiente di sviluppo prima di produzione

---

## 🔄 Sequenza di Esecuzione

### Opzione 1: Solo FK workout_plans (consigliato)

```sql
-- 1. Verifica struttura
-- Eseguire: FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql

-- 2. Aggiungi FK
-- Eseguire: FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql
```

### Opzione 2: Completo (FK + rinomina)

```sql
-- 1. Verifica struttura
-- Eseguire: FIX_21_VERIFICA_WORKOUT_PLANS_STRUCTURE.sql

-- 2. Aggiungi FK
-- Eseguire: FIX_22_AGGIORNA_FK_WORKOUT_PLANS.sql

-- 3. Rinomina colonna (OPZIONALE - richiede aggiornamento codice)
-- Eseguire: FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql
```

---

## ⚠️ Note Importanti

### FIX_22 (FK workout_plans)

- Verifica automaticamente dati orfani
- Non procede se ci sono dati orfani (richiede cleanup manuale)
- Gestisce sia `created_by` che `trainer_id` (se esiste)

### FIX_23 (Rinomina colonna)

- **Richiede aggiornamento codice applicativo**
- Testare in ambiente di sviluppo prima
- La FK viene ricreata automaticamente

---

## 📊 Risultati Attesi

Dopo l'esecuzione:

### workout_plans

- ✅ `created_by` ha FK verso `auth.users.id`
- ✅ `trainer_id` ha FK verso `profiles.id` (se esiste)
- ✅ Integrità referenziale garantita

### documents

- ✅ Colonna rinominata in `uploaded_by_profile_id` (se eseguito FIX_23)
- ✅ FK aggiornata con nuovo nome
- ✅ Naming più chiaro e coerente

---

## 🔍 Verifica Post-Esecuzione

Dopo aver eseguito gli script, verificare:

```sql
-- Verifica FK su workout_plans
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name || '.' || ccu.column_name AS referenzia
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'workout_plans';

-- Verifica colonna documents (se eseguito FIX_23)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'documents'
  AND column_name LIKE '%uploaded_by%';
```

---

## 📚 Documentazione Correlata

- `docs/DOCUMENTAZIONE_COMPLETA_TRAINER_ATLETA.md` - Sezione 6.8 (Problemi Conosciuti)
- `docs/FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql` - Migrazione storage (opzionale)
- `docs/FIX_20_AGGIORNAMENTO_URL_STORAGE.sql` - Aggiornamento URL storage (opzionale)
