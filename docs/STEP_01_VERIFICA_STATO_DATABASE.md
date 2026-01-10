# STEP 1: Verifica Stato Database

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 5 minuti

---

## 📋 Obiettivo

Verificare che FIX_23 sia stato applicato correttamente al database:

- ✅ Colonna `uploaded_by_profile_id` esiste
- ✅ Colonna `uploaded_by_user_id` NON esiste più
- ✅ FK `documents_uploaded_by_profile_id_fkey` esiste e referenzia `profiles.id`

---

## 🚀 Istruzioni Esecuzione

### 1. Apri Supabase SQL Editor

Vai al dashboard Supabase:

```
https://supabase.com/dashboard/project/[your-project-id]/sql/new
```

### 2. Esegui Script di Verifica

Copia e incolla l'intero contenuto di:

```
docs/FIX_23_VERIFICA_FINALE.sql
```

Esegui lo script.

---

## ✅ Risultati Attesi

### Query 1: Verifica Colonna

**Risultato atteso:**

```
sezione              | column_name            | data_type | is_nullable | column_default
---------------------|------------------------|-----------|-------------|---------------
=== VERIFICA COLONNA === | uploaded_by_profile_id | uuid      | NO          | null
```

**❌ NON deve apparire:**

- `uploaded_by_user_id` (deve essere rimosso)

---

### Query 2: Verifica FK

**Risultato atteso:**

```
sezione      | constraint_name                        | column_name            | referenzia          | delete_rule
-------------|----------------------------------------|------------------------|---------------------|------------
=== VERIFICA FK === | documents_uploaded_by_profile_id_fkey | uploaded_by_profile_id | public.profiles.id  | SET NULL
```

**Caratteristiche FK:**

- ✅ Nome: `documents_uploaded_by_profile_id_fkey` (o simile)
- ✅ Colonna: `uploaded_by_profile_id`
- ✅ Referenzia: `public.profiles.id`
- ✅ Delete rule: `SET NULL` (o `CASCADE`)

---

### Query 3: Verifica Indici

**Risultato atteso:**

- ✅ Indici che contengono `uploaded_by_profile_id` (se presenti)
- ❌ Nessun indice con `uploaded_by_user_id`

**Nota:** Potrebbero non esserci indici specifici su questa colonna, è normale.

---

### Query 4: Riepilogo

**Risultato atteso:**

```
sezione        | stato_colonna                          | stato_fk
---------------|----------------------------------------|--------------------------
=== RIEPILOGO === | ✅ Colonna rinominata correttamente | ✅ FK ricreata correttamente
```

---

## 🔍 Interpretazione Risultati

### ✅ Scenario 1: Tutto Corretto

Se vedi:

- ✅ Solo `uploaded_by_profile_id` nella verifica colonna
- ✅ FK presente e corretta
- ✅ Riepilogo con entrambi ✅

**Azione:** ✅ **PROCEDI con STEP 2** (Backup codice applicativo)

---

### ⚠️ Scenario 2: Problemi Rilevati

#### Problema A: Colonna `uploaded_by_user_id` ancora presente

**Sintomo:**

```
column_name: uploaded_by_user_id
```

**Azione:**

1. Verificare che FIX_23 sia stato eseguito
2. Eseguire: `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`
3. Rieseguire questa verifica

---

#### Problema B: FK mancante o errata

**Sintomo:**

```
stato_fk: ⚠️ FK non trovata
```

**Azione:**

1. Verificare che FIX_23 sia stato eseguito completamente
2. Eseguire: `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`
3. Rieseguire questa verifica

---

#### Problema C: Colonna `uploaded_by_profile_id` non esiste

**Sintomo:**

```
Nessun risultato nella query colonna
```

**Azione:**

1. FIX_23 non è stato eseguito
2. Eseguire: `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`
3. Rieseguire questa verifica

---

## 📝 Note

- Se FIX_23 non è stato ancora eseguito, eseguirlo prima di procedere
- Tutti i risultati devono essere ✅ prima di passare allo STEP 2
- In caso di dubbi, consultare `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`

---

## ✅ Checklist

- [ ] Script `FIX_23_VERIFICA_FINALE.sql` eseguito
- [ ] Verifica colonna: Solo `uploaded_by_profile_id` presente
- [ ] Verifica FK: FK presente e corretta
- [ ] Riepilogo: Entrambi i campi con ✅
- [ ] Nessun problema rilevato

---

## 🎯 Prossimo Step

Se tutto è corretto:
👉 **STEP 2:** Backup codice applicativo

---

**Data creazione:** 2025-02-01  
**File correlato:** `docs/FIX_23_VERIFICA_FINALE.sql`
