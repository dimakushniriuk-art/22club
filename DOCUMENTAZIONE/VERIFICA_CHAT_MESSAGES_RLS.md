# Verifica Chat Messages RLS

## Problema

L'atleta non vede i messaggi del trainer nella chat.

## Passi per verificare

### 1. Verifica se la migration è stata eseguita

Esegui in Supabase SQL Editor:

```sql
-- Verifica se le policies corrette esistono
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'chat_messages'
ORDER BY policyname;
```

Dovresti vedere 4 policies:

- `Users can view own messages` (SELECT)
- `Users can send messages` (INSERT)
- `Users can mark messages as read` (UPDATE)
- `No deletion allowed` (DELETE)

### 2. Verifica struttura tabella

```sql
-- Verifica a quale tabella fa riferimento sender_id e receiver_id
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_messages'
  AND tc.constraint_type = 'FOREIGN KEY';
```

Dovrebbe essere `profiles(id)`, non `auth.users(id)`.

### 3. Verifica se ci sono messaggi nel database

```sql
-- Conta messaggi totali (solo per admin/staff)
SELECT COUNT(*) as total_messages FROM chat_messages;

-- Mostra ultimi 10 messaggi
SELECT
  id,
  sender_id,
  receiver_id,
  LEFT(message, 50) as message_preview,
  created_at
FROM chat_messages
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Test RLS policies con utente specifico

Sostituisci `'YOUR_USER_ID'` con l'`auth.uid()` dell'atleta:

```sql
-- Verifica quale profile_id corrisponde all'utente
SELECT id, user_id, nome, cognome, role
FROM profiles
WHERE user_id = 'YOUR_USER_ID';

-- Test query come se fossi l'atleta
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub = 'YOUR_USER_ID';

-- Prova a leggere messaggi
SELECT
  id,
  sender_id,
  receiver_id,
  LEFT(message, 50) as message_preview,
  created_at
FROM chat_messages
LIMIT 10;
```

### 5. Verifica relazione PT-Atleta

```sql
-- Trova il PT dell'atleta
SELECT
  pa.id,
  pa.pt_id,
  pa.atleta_id,
  pt.nome || ' ' || pt.cognome as pt_name,
  pt.id as pt_profile_id,
  atleta.nome || ' ' || atleta.cognome as atleta_name,
  atleta.id as atleta_profile_id
FROM pt_atleti pa
LEFT JOIN profiles pt ON pt.id = pa.pt_id
LEFT JOIN profiles atleta ON atleta.id = pa.atleta_id
WHERE atleta.user_id = 'YOUR_USER_ID';
```

### 6. Verifica messaggi tra PT e atleta

Sostituisci `'PT_PROFILE_ID'` e `'ATLETA_PROFILE_ID'` con gli ID corretti:

```sql
SELECT
  cm.id,
  cm.sender_id,
  cm.receiver_id,
  s.nome || ' ' || s.cognome as sender_name,
  r.nome || ' ' || r.cognome as receiver_name,
  LEFT(cm.message, 50) as message_preview,
  cm.created_at
FROM chat_messages cm
LEFT JOIN profiles s ON s.id = cm.sender_id
LEFT JOIN profiles r ON r.id = cm.receiver_id
WHERE (cm.sender_id = 'PT_PROFILE_ID' AND cm.receiver_id = 'ATLETA_PROFILE_ID')
   OR (cm.sender_id = 'ATLETA_PROFILE_ID' AND cm.receiver_id = 'PT_PROFILE_ID')
ORDER BY cm.created_at DESC;
```

## Soluzione

Se le policies non sono corrette, esegui la migration:

```sql
-- Esegui il contenuto di supabase/migrations/20250202_fix_chat_messages_rls.sql
```

Se la tabella usa `auth.users(id)` invece di `profiles(id)`, devi migrare i dati:

```sql
-- ATTENZIONE: Questo script migra i dati da auth.users a profiles
-- Esegui solo se necessario e dopo aver fatto backup

-- 1. Crea colonne temporanee
ALTER TABLE chat_messages
  ADD COLUMN sender_profile_id UUID,
  ADD COLUMN receiver_profile_id UUID;

-- 2. Popola le colonne temporanee
UPDATE chat_messages cm
SET sender_profile_id = (SELECT id FROM profiles WHERE user_id = cm.sender_id LIMIT 1),
    receiver_profile_id = (SELECT id FROM profiles WHERE user_id = cm.receiver_id LIMIT 1);

-- 3. Verifica che tutti i messaggi abbiano un profile_id corrispondente
SELECT COUNT(*) as messages_without_profile
FROM chat_messages
WHERE sender_profile_id IS NULL OR receiver_profile_id IS NULL;

-- 4. Se tutti i messaggi hanno un profile_id, procedi con la migrazione
-- (rimuovi foreign keys vecchie, aggiungi nuove, rinomina colonne, etc.)
```

## Debug nel browser

Apri la console del browser e verifica:

1. Se ci sono errori nella console
2. Se la query viene eseguita (vedi log in `use-chat-messages.ts`)
3. Se `profileId` e `otherUserId` sono corretti

I log dovrebbero mostrare:

- `Query filter` con i valori di `profileId` e `otherUserId`
- `Messages fetched` con il numero di messaggi trovati
- Se non ci sono messaggi, `No messages fetched - verificando RLS e dati`
