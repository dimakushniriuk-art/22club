# 🔧 Fix: Problema Profilo Non Trovato

## 📋 Riepilogo Problema

Quando un utente si autentica, può verificarsi l'errore "Errore caricamento utente: {}" o "Profilo non trovato" (PGRST116). Questo accade quando:

1. Un utente viene creato in `auth.users` ma il profilo corrispondente non esiste in `profiles`
2. Il logging degli errori non mostra dettagli completi
3. Non c'è un meccanismo automatico per creare il profilo

## ✅ Soluzioni Implementate

### 1. Trigger Automatico per Creazione Profilo

**File**: `supabase/migrations/20250127_create_profile_trigger.sql`

Questo trigger crea automaticamente un profilo quando viene creato un nuovo utente in `auth.users`.

**Per applicare la migrazione**:

```bash
npx supabase db push
```

Oppure eseguire manualmente il file SQL nel dashboard Supabase.

### 2. Miglioramento Logging Errori

**File**: `src/providers/auth-provider.tsx`

- ✅ Serializzazione completa degli errori (message, code, details, hint)
- ✅ Gestione specifica per errore PGRST116
- ✅ Logging dettagliato per debugging

### 3. Miglioramento Processo Registrazione

**File**: `src/app/registrati/page.tsx`

- ✅ Aggiunti metadata durante signUp per il trigger
- ✅ Fallback manuale se il trigger non funziona
- ✅ Logging dettagliato degli errori

### 4. Script di Verifica Connessione

**File**: `src/lib/supabase/verify-connection.ts`

Funzione di utilità per verificare lo stato della connessione Supabase e l'esistenza del profilo.

**Utilizzo**:

```typescript
import { logConnectionStatus } from '@/lib/supabase/verify-connection'

// In un componente o hook
await logConnectionStatus()
```

## 🔍 Verifiche da Eseguire

### 1. Verificare che il Trigger sia Attivo

Eseguire questa query nel dashboard Supabase:

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

### 2. Verificare RLS Policies

Le RLS policies devono permettere l'inserimento di profili per utenti autenticati:

```sql
-- Verifica policy INSERT
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'INSERT';
```

Dovrebbe esistere una policy come:

- `"Authenticated users can insert profiles"` con `WITH CHECK (true)`

### 3. Test Registrazione

1. Registrare un nuovo utente
2. Verificare nei log del browser che non ci siano errori
3. Verificare nel database che il profilo sia stato creato:

```sql
SELECT
  p.id,
  p.user_id,
  p.email,
  p.nome,
  p.cognome,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'email_di_test@example.com';
```

### 4. Verificare Utenti Esistenti Senza Profilo

Se ci sono utenti esistenti senza profilo, creare i profili mancanti:

```sql
-- Trova utenti senza profilo
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- Crea profili mancanti (esempio per un utente specifico)
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
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL
  AND u.id = 'USER_ID_DA_CREARE'; -- Sostituisci con l'ID reale
```

## 🐛 Debugging

### Se il Problema Persiste

1. **Verifica Logging**: Controlla la console del browser per errori dettagliati
2. **Verifica Trigger**: Esegui le query di verifica sopra
3. **Verifica RLS**: Controlla che le policy permettano l'inserimento
4. **Usa Script Verifica**: Chiama `logConnectionStatus()` per diagnostica

### Log da Monitorare

Nel browser, cerca questi log:

- ✅ `⚠️ Profilo non trovato per utente:` - Indica che il profilo manca
- ✅ `Errore caricamento profilo:` - Altri errori (RLS, network, ecc.)
- ✅ `Errore recupero sessione:` - Problemi con la sessione

## 📝 Note Importanti

1. **Trigger Automatico**: Il trigger crea il profilo automaticamente, ma se fallisce, c'è un fallback manuale nel codice
2. **RLS Policies**: Le policy sono semplificate per performance - l'autorizzazione è gestita lato applicazione
3. **Metadata**: Durante la registrazione, i metadata (nome, cognome, role) vengono passati per permettere al trigger di creare un profilo completo

## 🔄 Prossimi Passi

1. Applicare la migrazione SQL
2. Verificare che il trigger sia attivo
3. Testare la registrazione di un nuovo utente
4. Monitorare i log per eventuali problemi residui
