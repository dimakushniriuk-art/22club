# 🔍 Verifica Profili Supabase

## Script di Verifica

Lo script `scripts/verify-profiles.ts` verifica lo stato dei profili nel database Supabase.

### Esecuzione

```bash
npm run db:verify-profiles
```

Oppure direttamente:

```bash
tsx scripts/verify-profiles.ts
```

### Cosa Verifica

1. **Conteggio profili totali**
   - Numero totale di profili nel database

2. **Dettagli profili**
   - Lista dei primi 100 profili con:
     - ID
     - User ID
     - Email
     - Nome e Cognome
     - Ruolo
     - Stato
     - Organizzazione
     - Data creazione

3. **Statistiche per ruolo**
   - Distribuzione dei profili per ruolo (admin, trainer, athlete, ecc.)

4. **Statistiche per stato**
   - Distribuzione dei profili per stato (attivo, inattivo, sospeso)

5. **Verifica utente corrente**
   - Se c'è una sessione attiva, verifica se l'utente ha un profilo
   - Mostra dettagli del profilo se esiste
   - Avvisa se il profilo manca

6. **Profili senza user_id**
   - Identifica profili orfani (senza user_id)

7. **Profili duplicati**
   - Identifica profili con lo stesso user_id (dovrebbe essere unico)

## Query SQL Alternative

Se preferisci eseguire query direttamente nel dashboard Supabase:

### 1. Conta tutti i profili

```sql
SELECT COUNT(*) as total_profiles FROM profiles;
```

### 2. Lista profili con dettagli

```sql
SELECT
  id,
  user_id,
  email,
  nome,
  cognome,
  role,
  stato,
  org_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 100;
```

### 3. Utenti senza profilo

```sql
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
```

### 4. Profili per ruolo

```sql
SELECT
  role,
  COUNT(*) as count
FROM profiles
WHERE role IS NOT NULL
GROUP BY role
ORDER BY count DESC;
```

### 5. Profili per stato

```sql
SELECT
  stato,
  COUNT(*) as count
FROM profiles
WHERE stato IS NOT NULL
GROUP BY stato
ORDER BY count DESC;
```

### 6. Profili senza user_id

```sql
SELECT
  id,
  email,
  nome,
  cognome,
  created_at
FROM profiles
WHERE user_id IS NULL;
```

### 7. Profili duplicati (stesso user_id)

```sql
SELECT
  user_id,
  COUNT(*) as count
FROM profiles
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### 8. Verifica profilo per utente specifico

```sql
SELECT
  p.*
FROM profiles p
WHERE p.user_id = 'USER_ID_DA_VERIFICARE';
```

### 9. Verifica trigger handle_new_user

```sql
-- Verifica che il trigger esista
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verifica che la funzione esista
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

## Risoluzione Problemi

### Profilo Non Trovato

Se lo script mostra che un utente non ha profilo:

1. **Verifica che il trigger sia attivo** (query sopra)
2. **Crea manualmente il profilo** se necessario:

```sql
INSERT INTO profiles (
  user_id,
  email,
  nome,
  cognome,
  role,
  org_id,
  stato
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nome', ''),
  COALESCE(u.raw_user_meta_data->>'cognome', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'athlete'),
  COALESCE(u.raw_user_meta_data->>'org_id', 'default-org'),
  'attivo'
FROM auth.users u
WHERE u.id = 'USER_ID_DA_CREARE'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
  );
```

### Profili Duplicati

Se ci sono profili duplicati per lo stesso user_id:

```sql
-- Trova i duplicati
WITH duplicates AS (
  SELECT user_id
  FROM profiles
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
SELECT p.*
FROM profiles p
INNER JOIN duplicates d ON p.user_id = d.user_id
ORDER BY p.user_id, p.created_at;
```

Poi elimina i duplicati mantenendo solo il più recente:

```sql
DELETE FROM profiles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM profiles
    WHERE user_id IS NOT NULL
  ) t
  WHERE rn > 1
);
```

## Note

- Lo script usa le credenziali da `.env.local`
- Assicurati di avere `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurati
- Per query più complesse, usa direttamente il dashboard Supabase
