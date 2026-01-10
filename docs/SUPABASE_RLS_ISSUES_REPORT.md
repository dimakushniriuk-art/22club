# 🔒 Report Problemi RLS (Row Level Security)

**Data Analisi**: 2025-12-07  
**Progetto**: icibqnmtacibgnhaidlz

---

## 🚨 Problema Critico Identificato

### RLS Policies Troppo Restrittive

Le **Row Level Security (RLS) policies** sono configurate in modo troppo restrittivo, impedendo all'applicazione (che usa la **anon key**) di accedere ai dati che esistono effettivamente nel database.

### Dati Reali vs Dati Visibili

| Tabella           | Dati Reali (Service Key) | Dati Visibili (Anon Key) | Differenza  |
| ----------------- | ------------------------ | ------------------------ | ----------- |
| **profiles**      | 17                       | 0                        | ❌ -17      |
| **exercises**     | 9                        | 0                        | ❌ -9       |
| **payments**      | 4                        | 0                        | ❌ -4       |
| **notifications** | 3                        | 0                        | ❌ -3       |
| **chat_messages** | 13                       | 0                        | ❌ -13      |
| **inviti_atleti** | 1                        | 0                        | ❌ -1       |
| **pt_atleti**     | 1                        | 0                        | ❌ -1       |
| **appointments**  | 0                        | ❌ Error 42501           | ❌ Bloccato |

---

## 📊 Dati Reali nel Database

### Profili (17 totali)

- **Atleti**: 12
- **Personal Trainer**: 4
- **Admin**: 1

**Esempi**:

- Alessandro Ferrari (atleta) - alessandro.ferrari@22club.it
- Admin Sistema (admin) - admin@22club.it
- Giulia Bianchi (atleta) - giulia.bianchi@22club.it
- Dmytro Kushniriuk (atleta) - dima.kushniriuk@gmail.com
- Francesco Bernotto (atleta) - francescobernotto09@gmail.com

### Esercizi (9 totali)

- Squat
- Panca Piana
- Stacco da Terra
- Piegamenti
- Military Press
- ... (altri 4)

### Altri Dati

- **Pagamenti**: 4
- **Notifiche**: 3
- **Messaggi Chat**: 13
- **Inviti**: 1
- **Relazioni PT-Atleti**: 1

---

## 🔍 Cause del Problema

### 1. RLS Policies Mancanti o Errate

Le policies RLS potrebbero:

- Non essere state create per alcune tabelle
- Essere configurate in modo troppo restrittivo
- Non permettere l'accesso agli utenti autenticati
- Non distinguere correttamente tra ruoli (admin, trainer, athlete)

### 2. Tabella `appointments` - Errore 42501

La tabella `appointments` restituisce errore `42501` (permission denied) anche con anon key, indicando che:

- RLS è attivo ma non ci sono policies che permettono l'accesso
- Le policies esistenti sono configurate male

---

## ✅ Soluzioni

### Soluzione 1: Verificare e Correggere RLS Policies

#### Per Tabella `profiles`

```sql
-- Verifica policies esistenti
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di vedere profili di atleti (per trainer)
CREATE POLICY "Trainers can view athlete profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pt_atleti
    WHERE pt_atleti.pt_id = auth.uid()
    AND pt_atleti.atleta_id = profiles.user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'pt', 'trainer')
  )
);
```

#### Per Tabella `exercises`

```sql
-- Policy per permettere a tutti gli utenti autenticati di vedere gli esercizi
CREATE POLICY "Authenticated users can view exercises"
ON exercises
FOR SELECT
TO authenticated
USING (true);

-- Policy per permettere solo a trainer/admin di modificare
CREATE POLICY "Trainers can modify exercises"
ON exercises
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'pt', 'trainer')
  )
);
```

#### Per Tabella `appointments`

```sql
-- Verifica se RLS è attivo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'appointments';

-- Se RLS è attivo ma non ci sono policies, creale:
CREATE POLICY "Users can view own appointments"
ON appointments
FOR SELECT
USING (
  athlete_id = auth.uid()
  OR
  trainer_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Per Tabella `payments`

```sql
CREATE POLICY "Users can view own payments"
ON payments
FOR SELECT
USING (
  athlete_id = auth.uid()
  OR
  trainer_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Per Tabella `notifications`

```sql
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());
```

#### Per Tabella `chat_messages`

```sql
CREATE POLICY "Users can view own messages"
ON chat_messages
FOR SELECT
USING (
  sender_id = auth.uid()
  OR
  receiver_id = auth.uid()
);
```

#### Per Tabella `inviti_atleti`

```sql
CREATE POLICY "Trainers can view own invitations"
ON inviti_atleti
FOR SELECT
USING (
  trainer_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Per Tabella `pt_atleti`

```sql
CREATE POLICY "Users can view own relationships"
ON pt_atleti
FOR SELECT
USING (
  pt_id = auth.uid()
  OR
  atleta_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Soluzione 2: Script di Verifica e Fix Automatico

Creare uno script che:

1. Verifica tutte le policies RLS
2. Identifica tabelle con RLS attivo ma senza policies
3. Crea policies di base se mancanti

### Soluzione 3: Disabilitare Temporaneamente RLS (SOLO PER TEST)

⚠️ **ATTENZIONE**: Solo per test, non per produzione!

```sql
-- Disabilita RLS temporaneamente per test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
-- ... altre tabelle

-- Dopo i test, riabilita e crea policies corrette
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 Istruzioni Immediate

### Step 1: Verifica Policies Esistenti

Esegui nel SQL Editor di Supabase:

```sql
-- Lista tutte le policies RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
ORDER BY tablename, policyname;
```

### Step 2: Identifica Tabelle con RLS Attivo ma Senza Policies

```sql
-- Tabelle con RLS attivo
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Confronta con policies esistenti
SELECT
  t.tablename,
  CASE WHEN p.policyname IS NULL THEN 'NO POLICIES' ELSE 'HAS POLICIES' END as policy_status,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.tablename, p.policyname
ORDER BY t.tablename;
```

### Step 3: Crea Policies Mancanti

Usa le query SQL fornite sopra per creare le policies necessarie.

---

## 📋 Checklist Fix RLS

- [ ] Verificare policies esistenti su `profiles`
- [ ] Creare policy per `profiles` (utenti vedono proprio profilo)
- [ ] Creare policy per `profiles` (trainer vedono atleti)
- [ ] Verificare e creare policies per `exercises`
- [ ] Verificare e creare policies per `appointments`
- [ ] Verificare e creare policies per `payments`
- [ ] Verificare e creare policies per `notifications`
- [ ] Verificare e creare policies per `chat_messages`
- [ ] Verificare e creare policies per `inviti_atleti`
- [ ] Verificare e creare policies per `pt_atleti`
- [ ] Testare accesso con anon key dopo fix
- [ ] Verificare che i dati siano visibili nell'applicazione

---

## 🧪 Test Post-Fix

Dopo aver applicato le correzioni, esegui:

```bash
npm run db:verify-data-deep
```

Verifica che:

- ✅ `profiles`: ANON Key mostra 17 (non 0)
- ✅ `exercises`: ANON Key mostra 9 (non 0)
- ✅ `payments`: ANON Key mostra 4 (non 0)
- ✅ `notifications`: ANON Key mostra 3 (non 0)
- ✅ `chat_messages`: ANON Key mostra 13 (non 0)
- ✅ `appointments`: ANON Key non restituisce errore 42501

---

## 🔗 Link Utili

- **SQL Editor**: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new
- **Database Tables**: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/editor
- **Authentication**: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/auth/users

---

**Report generato da**: `scripts/verify-supabase-data-deep.ts`
