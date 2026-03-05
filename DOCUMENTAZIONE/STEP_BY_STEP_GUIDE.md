# 📋 Guida Step-by-Step - Fix Completo Supabase

**Data**: 2025-12-07  
**Progetto**: icibqnmtacibgnhaidlz

---

## 🎯 Obiettivo

Raggiungere **100% di score** risolvendo tutti i problemi identificati nell'analisi Supabase.

---

## 📋 STEP 1: Fix RLS Policies su appointments

### ⚠️ Problema

- **Tabella**: `appointments`
- **Errore**: 42501 (permission denied)
- **Causa**: Policies RLS troppo restrittive o duplicate

### ✅ Soluzione

1. **Apri SQL Editor**:
   👉 https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

2. **Copia e incolla** tutto il contenuto di:

   ```
   docs/FIX_RLS_POLICIES_COMPLETE.sql
   ```

3. **Esegui** lo script (Run o Ctrl+Enter)

4. **Verifica**:
   ```bash
   npm run db:verify-data-deep
   ```

### ✅ Risultato Atteso

- `appointments` accessibile (no più errore 42501)
- RLS funzionante su 19/19 tabelle

---

## 📋 STEP 2: Creare Trigger handle_new_user

### ⚠️ Problema

- **Trigger**: `handle_new_user` mancante
- **Impatto**: Nuovi utenti non creano automaticamente il profilo

### ✅ Soluzione

1. **Apri SQL Editor**:
   👉 https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

2. **Copia e incolla** tutto il contenuto di:

   ```
   docs/QUICK_APPLY_TRIGGER.sql
   ```

3. **Esegui** lo script

4. **Verifica** con le query incluse nello script:
   - Trigger `on_auth_user_created` esiste
   - Funzione `handle_new_user()` esiste
   - Utenti senza profilo = 0

### ✅ Risultato Atteso

- Nuovi utenti creano automaticamente il profilo

---

## 📋 STEP 3: Creare Trigger update_updated_at_column

### ⚠️ Problema

- **Trigger**: `update_updated_at_column` mancante
- **Impatto**: Campo `updated_at` non aggiornato automaticamente

### ✅ Soluzione

1. **Apri SQL Editor**:
   👉 https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

2. **Copia e incolla** tutto il contenuto di:

   ```
   docs/CREATE_UPDATE_TRIGGER.sql
   ```

3. **Esegui** lo script

4. **Verifica**:
   ```sql
   SELECT trigger_name, event_object_table
   FROM information_schema.triggers
   WHERE trigger_name = 'update_profiles_updated_at';
   ```

### ✅ Risultato Atteso

- Campo `updated_at` aggiornato automaticamente su `profiles`

---

## 📋 STEP 4: Creare Storage Buckets

### ⚠️ Problema

- **4 Storage buckets mancanti**: documents, exercise-videos, progress-photos, avatars
- **Impatto**: Impossibile caricare file

### ✅ Soluzione

#### 4.1 Creare Buckets (Dashboard)

1. **Apri Storage**:
   👉 https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/storage/buckets

2. **Crea i seguenti buckets**:

   **Bucket 1: documents**
   - Nome: `documents`
   - Pubblico: ❌ NO
   - File size limit: 10MB
   - Allowed MIME types: `application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

   **Bucket 2: exercise-videos**
   - Nome: `exercise-videos`
   - Pubblico: ❌ NO
   - File size limit: 50MB
   - Allowed MIME types: `video/*`

   **Bucket 3: progress-photos**
   - Nome: `progress-photos`
   - Pubblico: ❌ NO
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

   **Bucket 4: avatars**
   - Nome: `avatars`
   - Pubblico: ✅ YES
   - File size limit: 2MB
   - Allowed MIME types: `image/*`

#### 4.2 Configurare RLS Policies (SQL)

1. **Apri SQL Editor**

2. **Copia e incolla** tutto il contenuto di:

   ```
   docs/CREATE_STORAGE_BUCKETS.sql
   ```

3. **Esegui** lo script (crea le policies RLS)

4. **Verifica**:
   ```bash
   npm run db:analyze-complete
   ```

### ✅ Risultato Atteso

- 4/4 buckets esistenti
- Possibilità di caricare file

---

## 📋 STEP 5: Verifica Finale Completa

### ✅ Azione

1. **Esegui analisi completa**:

   ```bash
   npm run db:analyze-complete
   npm run db:verify-data-deep
   ```

2. **Verifica risultati**:
   - ✅ RLS: 19/19 tabelle funzionanti
   - ✅ Trigger: 2/2 trigger esistenti
   - ✅ Storage: 4/4 buckets esistenti
   - ✅ Dati: Tutti accessibili con anon key

### ✅ Risultato Atteso

- **Score Totale**: 100% ✅

---

## 📊 Checklist Completa

- [ ] STEP 1: Fix RLS su appointments
- [ ] STEP 1: Verifica RLS fix
- [ ] STEP 2: Creare trigger handle_new_user
- [ ] STEP 2: Verifica trigger handle_new_user
- [ ] STEP 3: Creare trigger update_updated_at_column
- [ ] STEP 3: Verifica trigger update_updated_at_column
- [ ] STEP 4: Creare 4 storage buckets
- [ ] STEP 4: Configurare RLS policies per storage
- [ ] STEP 4: Verifica storage buckets
- [ ] STEP 5: Verifica finale completa

---

## 🎯 Risultati Finali Attesi

- **Tabelle**: 100% ✅
- **Funzioni**: 100% ✅
- **RLS**: 100% ✅ (19/19 tabelle)
- **Trigger**: 100% ✅ (2/2 trigger)
- **Storage**: 100% ✅ (4/4 buckets)

**Score Totale**: 100% ✅

---

## 📝 Note

- Eseguire gli step in ordine sequenziale
- Verificare dopo ogni step prima di procedere
- Se un step fallisce, risolvere prima di continuare
- Tutti gli script SQL sono pronti e testati
