# 🔍 Verifica Completa Supabase - Modulo Comunicazioni

**Data**: 2025-01-31  
**Obiettivo**: Verificare che Supabase sia configurato correttamente per il modulo comunicazioni al 100%

---

## 📋 Checklist Verifica

### ✅ FASE 1: Verifica Struttura Database

#### 1.1 Verificare Esistenza Tabelle

```sql
-- Verifica tabelle principali
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('communications', 'communication_recipients')
ORDER BY table_name;
```

**Risultato Atteso**: 2 righe (communications, communication_recipients)

#### 1.2 Verificare Schema Tabella `communications`

```sql
-- Verifica colonne tabella communications
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'communications'
ORDER BY ordinal_position;
```

**Risultato Atteso**: Colonne principali:

- `id` (uuid, NOT NULL)
- `title` (text)
- `message` (text)
- `type` (text, CHECK: push/email/sms/all)
- `status` (text, CHECK: draft/scheduled/sending/sent/failed/cancelled)
- `recipient_filter` (jsonb)
- `total_recipients` (integer)
- `total_sent` (integer)
- `total_delivered` (integer)
- `total_opened` (integer)
- `total_failed` (integer)
- `scheduled_for` (timestamp with time zone)
- `sent_at` (timestamp with time zone)
- `created_by` (uuid)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

#### 1.3 Verificare Schema Tabella `communication_recipients`

```sql
-- Verifica colonne tabella communication_recipients
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'communication_recipients'
ORDER BY ordinal_position;
```

**Risultato Atteso**: Colonne principali:

- `id` (uuid, NOT NULL)
- `communication_id` (uuid, FK → communications)
- `user_id` (uuid, FK → auth.users)
- `recipient_type` (text, CHECK: push/email/sms)
- `status` (text, CHECK: pending/sent/delivered/opened/failed/bounced)
- `sent_at` (timestamp with time zone)
- `delivered_at` (timestamp with time zone)
- `opened_at` (timestamp with time zone)
- `failed_at` (timestamp with time zone)
- `error_message` (text)
- `metadata` (jsonb)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

---

### ✅ FASE 2: Verifica RLS (Row Level Security)

#### 2.1 Verificare RLS Attivo

```sql
-- Verifica RLS attivo sulle tabelle
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('communications', 'communication_recipients');
```

**Risultato Atteso**: `rowsecurity = true` per entrambe le tabelle

#### 2.2 Verificare Policies su `communications`

```sql
-- Verifica policies RLS per communications
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100) || '...'
    ELSE 'null'
  END as qual_preview,
  CASE
    WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 100) || '...'
    ELSE 'null'
  END as with_check_preview
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'communications'
ORDER BY policyname;
```

**Risultato Atteso**: Policies presenti:

- `Staff can view all communications` (SELECT, authenticated)
- `Staff can create communications` (INSERT, authenticated)
- `Staff can update communications` (UPDATE, authenticated)
- `Staff can delete communications` (DELETE, authenticated)

#### 2.3 Verificare Policies su `communication_recipients`

```sql
-- Verifica policies RLS per communication_recipients
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100) || '...'
    ELSE 'null'
  END as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'communication_recipients'
ORDER BY policyname;
```

**Risultato Atteso**: Policies presenti:

- `Staff can view all communication recipients` (SELECT, authenticated)
- `Users can view own communication recipients` (SELECT, authenticated, user_id = auth.uid())
- `Staff can manage communication recipients` (ALL, authenticated)

---

### ✅ FASE 3: Verifica Indici

#### 3.1 Verificare Indici su `communications`

```sql
-- Verifica indici su communications
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'communications'
ORDER BY indexname;
```

**Risultato Atteso**: Indici presenti:

- `communications_pkey` (PRIMARY KEY su id)
- `idx_communications_created_by`
- `idx_communications_status`
- `idx_communications_type`
- `idx_communications_scheduled_for`
- `idx_communications_sent_at`
- `idx_communications_created_at`

#### 3.2 Verificare Indici su `communication_recipients`

```sql
-- Verifica indici su communication_recipients
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'communication_recipients'
ORDER BY indexname;
```

**Risultato Atteso**: Indici presenti:

- `communication_recipients_pkey` (PRIMARY KEY su id)
- `idx_communication_recipients_communication_id`
- `idx_communication_recipients_user_id`
- `idx_communication_recipients_status`
- `idx_communication_recipients_recipient_type`
- `idx_communication_recipients_pending`
- `idx_communication_recipients_sent_at`
- `idx_communication_recipients_comm_user_type` (composito)

---

### ✅ FASE 4: Verifica Foreign Keys

#### 4.1 Verificare Foreign Keys

```sql
-- Verifica foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('communications', 'communication_recipients')
ORDER BY tc.table_name, kcu.column_name;
```

**Risultato Atteso**:

- `communication_recipients.communication_id` → `communications.id` (ON DELETE CASCADE)
- `communication_recipients.user_id` → `auth.users.id` (ON DELETE CASCADE)
- `communications.created_by` → `auth.users.id` (se presente)

---

### ✅ FASE 5: Verifica Trigger

#### 5.1 Verificare Trigger `updated_at`

```sql
-- Verifica trigger updated_at
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('communications', 'communication_recipients')
ORDER BY event_object_table, trigger_name;
```

**Risultato Atteso**: Trigger presenti:

- `update_communications_updated_at` (BEFORE UPDATE)
- `update_communication_recipients_updated_at` (BEFORE UPDATE)

#### 5.2 Test Trigger `updated_at`

```sql
-- Test trigger: verifica che updated_at si aggiorni
-- NOTA: Eseguire questo test solo su una comunicazione di test

-- 1. Seleziona una comunicazione di test (sostituisci ID)
SELECT id, title, updated_at
FROM communications
WHERE id = 'ID_COMUNICAZIONE_TEST'
LIMIT 1;

-- 2. Aggiorna (es: cambia title)
UPDATE communications
SET title = 'Test Trigger Updated At'
WHERE id = 'ID_COMUNICAZIONE_TEST';

-- 3. Verifica che updated_at sia stato aggiornato
SELECT id, title, updated_at
FROM communications
WHERE id = 'ID_COMUNICAZIONE_TEST';
-- updated_at dovrebbe essere > del valore precedente
```

---

### ✅ FASE 6: Verifica Constraints e Check

#### 6.1 Verificare Check Constraints

```sql
-- Verifica check constraints su communications
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.communications'::regclass
  AND contype = 'c'
ORDER BY conname;

-- Verifica check constraints su communication_recipients
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.communication_recipients'::regclass
  AND contype = 'c'
ORDER BY conname;
```

**Risultato Atteso**:

- `communications.type` CHECK IN ('push', 'email', 'sms', 'all')
- `communications.status` CHECK IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')
- `communication_recipients.recipient_type` CHECK IN ('push', 'email', 'sms')
- `communication_recipients.status` CHECK IN ('pending', 'sent', 'delivered', 'opened', 'failed', 'bounced')

---

### ✅ FASE 7: Test Operazioni CRUD (con autenticazione)

#### 7.1 Test SELECT (lettura)

```sql
-- Verifica lettura (deve funzionare se autenticato come staff)
SELECT COUNT(*) as total_communications
FROM communications;

SELECT COUNT(*) as total_recipients
FROM communication_recipients;
```

**Risultato Atteso**: Query eseguita senza errori (se autenticato come staff)

#### 7.2 Test INSERT (creazione)

```sql
-- Test creazione comunicazione (sostituisci user_id con il tuo)
INSERT INTO communications (
  title,
  message,
  type,
  status,
  recipient_filter,
  created_by
) VALUES (
  'Test Verifica Supabase',
  'Questo è un test per verificare il funzionamento',
  'push',
  'draft',
  '{"all_users": true}'::jsonb,
  'TUO_USER_ID_QUI'::uuid
) RETURNING id, title, created_at;
```

**Risultato Atteso**: Inserimento riuscito, ritorna id e dati

#### 7.3 Test UPDATE (aggiornamento)

```sql
-- Test aggiornamento (usa ID dalla creazione precedente)
UPDATE communications
SET
  title = 'Test Verifica Supabase - Aggiornato',
  updated_at = NOW()
WHERE id = 'ID_COMUNICAZIONE_CREATA'::uuid
RETURNING id, title, updated_at;
```

**Risultato Atteso**: Aggiornamento riuscito, `updated_at` aggiornato

#### 7.4 Test DELETE (eliminazione)

```sql
-- Test eliminazione (usa ID dalla creazione precedente)
DELETE FROM communications
WHERE id = 'ID_COMUNICAZIONE_CREATA'::uuid
RETURNING id, title;
```

**Risultato Atteso**: Eliminazione riuscita (o fallita se RLS impedisce)

---

### ✅ FASE 8: Test RLS Policies (Permessi)

#### 8.1 Test Permessi Staff

**Prerequisito**: Autenticarsi come utente con ruolo `admin`, `pt`, `trainer` o `staff`

```sql
-- Verifica ruolo utente corrente
SELECT p.role, p.user_id, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.user_id = auth.uid();

-- Test lettura (deve funzionare per staff)
SELECT COUNT(*) FROM communications;
SELECT COUNT(*) FROM communication_recipients;

-- Test creazione (deve funzionare per staff)
-- (Vedi test 7.2)
```

**Risultato Atteso**: Tutte le operazioni consentite per staff

#### 8.2 Test Permessi Non-Staff

**Prerequisito**: Autenticarsi come utente con ruolo `atleta` o `athlete`

```sql
-- Test lettura communications (non dovrebbe funzionare)
SELECT COUNT(*) FROM communications;
-- Atteso: Errore o 0 risultati (a seconda della policy)

-- Test lettura propri recipients (dovrebbe funzionare)
SELECT COUNT(*)
FROM communication_recipients
WHERE user_id = auth.uid();
-- Atteso: Mostra solo i recipients dell'utente corrente
```

**Risultato Atteso**:

- Staff può vedere tutto
- Utenti non-staff vedono solo i propri recipients

---

### ✅ FASE 9: Verifica Dati Esistenti

#### 9.1 Verificare Dati Corretti

```sql
-- Verifica integrità dati communications
SELECT
  status,
  type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE total_recipients < 0) as negative_recipients,
  COUNT(*) FILTER (WHERE total_sent > total_recipients) as sent_more_than_total
FROM communications
GROUP BY status, type
ORDER BY status, type;

-- Verifica integrità dati communication_recipients
SELECT
  status,
  recipient_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE communication_id IS NULL) as null_comm_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_user_id
FROM communication_recipients
GROUP BY status, recipient_type
ORDER BY status, recipient_type;
```

**Risultato Atteso**: Nessun dato inconsistente (negative_recipients = 0, null_comm_id = 0, ecc.)

#### 9.2 Verificare Relazioni Corrette

```sql
-- Verifica recipients orfani (senza communication esistente)
SELECT COUNT(*) as orphaned_recipients
FROM communication_recipients cr
LEFT JOIN communications c ON c.id = cr.communication_id
WHERE c.id IS NULL;

-- Verifica comunicazioni con recipients
SELECT
  c.id,
  c.title,
  c.status,
  COUNT(cr.id) as recipients_count,
  c.total_recipients as total_in_comm
FROM communications c
LEFT JOIN communication_recipients cr ON cr.communication_id = c.id
GROUP BY c.id, c.title, c.status, c.total_recipients
HAVING COUNT(cr.id) != c.total_recipients
LIMIT 10;
```

**Risultato Atteso**:

- `orphaned_recipients` = 0 (nessun recipient orfano)
- La query delle comunicazioni con recipients dovrebbe restituire 0 righe (o spiegare eventuali discrepanze)

---

### ✅ FASE 10: Test Performance (Opzionale)

#### 10.1 Verificare Uso Indici

```sql
-- Analisi query plan per SELECT tipica
EXPLAIN ANALYZE
SELECT *
FROM communications
WHERE status = 'draft'
ORDER BY created_at DESC
LIMIT 10;
```

**Risultato Atteso**: Query usa indice (Index Scan su `idx_communications_status` o `idx_communications_created_at`)

#### 10.2 Verificare Statistiche Tabelle

```sql
-- Statistiche tabelle
SELECT
  schemaname,
  relname as tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE relname IN ('communications', 'communication_recipients');
```

**Risultato Atteso**: Statistiche aggiornate, `dead_rows` basso (se alto, eseguire VACUUM)

---

## 📊 Report Verifica

### Risultati Verifica

#### FASE 1: Struttura Database

- [ ] Tabelle esistenti: ✅ / ❌
- [ ] Schema `communications`: ✅ / ❌
- [ ] Schema `communication_recipients`: ✅ / ❌

#### FASE 2: RLS

- [ ] RLS attivo: ✅ / ❌
- [ ] Policies `communications`: ✅ / ❌
- [ ] Policies `communication_recipients`: ✅ / ❌

#### FASE 3: Indici

- [ ] Indici `communications`: ✅ / ❌
- [ ] Indici `communication_recipients`: ✅ / ❌

#### FASE 4: Foreign Keys

- [ ] FK verificate: ✅ / ❌

#### FASE 5: Trigger

- [ ] Trigger `updated_at`: ✅ / ❌
- [ ] Test trigger funzionante: ✅ / ❌

#### FASE 6: Constraints

- [ ] Check constraints: ✅ / ❌

#### FASE 7: CRUD

- [ ] SELECT: ✅ / ❌
- [ ] INSERT: ✅ / ❌
- [ ] UPDATE: ✅ / ❌
- [ ] DELETE: ✅ / ❌

#### FASE 8: Permessi

- [ ] Permessi staff: ✅ / ❌
- [ ] Permessi non-staff: ✅ / ❌

#### FASE 9: Integrità Dati

- [ ] Dati consistenti: ✅ / ❌
- [ ] Relazioni corrette: ✅ / ❌

#### FASE 10: Performance

- [ ] Query ottimizzate: ✅ / ❌
- [ ] Statistiche aggiornate: ✅ / ❌

---

## 🔧 Script SQL Completo di Verifica

Esegui questo script completo per una verifica rapida:

```sql
-- ============================================================
-- SCRIPT VERIFICA COMPLETA SUPABASE COMUNICAZIONI
-- ============================================================

-- 1. Verifica tabelle
SELECT '=== 1. Tabelle ===' as section;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('communications', 'communication_recipients');

-- 2. Verifica RLS
SELECT '=== 2. RLS Attivo ===' as section;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('communications', 'communication_recipients');

-- 3. Verifica Policies
SELECT '=== 3. Policies Communications ===' as section;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'communications';

SELECT '=== 3. Policies Communication Recipients ===' as section;
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'communication_recipients';

-- 4. Verifica Indici
SELECT '=== 4. Indici Communications ===' as section;
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'communications';

SELECT '=== 4. Indici Communication Recipients ===' as section;
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'communication_recipients';

-- 5. Verifica Trigger
SELECT '=== 5. Trigger ===' as section;
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('communications', 'communication_recipients');

-- 6. Conteggio Records
SELECT '=== 6. Conteggio Records ===' as section;
SELECT 'communications' as table_name, COUNT(*) as count FROM communications
UNION ALL
SELECT 'communication_recipients', COUNT(*) FROM communication_recipients;

-- 7. Statistiche per Status
SELECT '=== 7. Statistiche Communications (per Status) ===' as section;
SELECT status, COUNT(*) as count FROM communications GROUP BY status ORDER BY status;

SELECT '=== 7. Statistiche Recipients (per Status) ===' as section;
SELECT status, COUNT(*) as count FROM communication_recipients GROUP BY status ORDER BY status;
```

---

## ⚠️ Problemi Comuni e Soluzioni

### Problema: Tabelle non esistono

**Soluzione**: Applicare la migration:

```sql
-- Copiare e eseguire il contenuto di:
-- supabase/migrations/20250130_create_communications_tables.sql
```

### Problema: RLS non attivo

**Soluzione**:

```sql
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_recipients ENABLE ROW LEVEL SECURITY;
```

### Problema: Policies mancanti

**Soluzione**: Applicare le policies dalla migration o da:

```sql
-- supabase/migrations/20250131_fix_rls_policies_complete.sql
```

### Problema: Indici mancanti

**Soluzione**: Gli indici dovrebbero essere creati dalla migration. Se mancanti:

```sql
-- Verificare migration 20250130_create_communications_tables.sql
-- per i CREATE INDEX mancanti
```

### Problema: Trigger non funzionano

**Soluzione**:

```sql
-- Verifica che la funzione esista
SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column';

-- Se non esiste, crearla dalla migration
```

---

**Ultimo Aggiornamento**: 2025-01-31
