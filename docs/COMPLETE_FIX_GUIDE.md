# 🔧 Guida Completa: Fix Problemi Comunicazione e Migrazioni

## 📋 Problemi Identificati

1. **Disallineamento Migrazioni**: Migrazioni remote non esistono localmente
2. **Trigger Profilo Mancante**: Il trigger `handle_new_user()` non è applicato
3. **Errore Caricamento Profilo**: Utenti autenticati senza profilo corrispondente

## ✅ Soluzione Completa (2 Metodi)

### 🚀 Metodo 1: Rapido (Consigliato)

Applica solo il trigger manualmente nel dashboard - questo risolve il problema principale senza toccare le migrazioni.

#### Step 1: Apri SQL Editor

Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

#### Step 2: Copia e Incolla

Apri `docs/QUICK_APPLY_TRIGGER.sql` e copia tutto il contenuto (dalla riga 16 alla riga 56, escludendo i commenti di verifica).

Oppure copia direttamente questo:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, email, nome, cognome, role, org_id, stato, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cognome', NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    COALESCE(NEW.raw_user_meta_data->>'org_id', 'default-org'),
    'attivo',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### Step 3: Esegui (Ctrl+Enter)

#### Step 4: Verifica

```sql
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

Dovresti vedere 1 riga con `on_auth_user_created`.

### 🔧 Metodo 2: Riparazione Completa Migrazioni

Se vuoi sincronizzare completamente le migrazioni:

#### Step 1: Esegui Script di Riparazione

```powershell
npm run db:repair-migrations
```

Oppure:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\repair-migrations-auto.ps1
```

#### Step 2: Verifica

```powershell
npx supabase db push
```

Dovrebbe funzionare senza errori.

#### Step 3: Applica Trigger

Vedi Metodo 1, Step 2-4.

## 🔍 Verifiche Post-Fix

### 1. Verifica Trigger

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Verifica Funzione

```sql
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

### 3. Verifica Utenti Senza Profilo

```sql
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
```

Se ci sono utenti senza profilo, creali manualmente o verifica perché il trigger non ha funzionato.

### 4. Test Registrazione

Registra un nuovo utente e verifica che il profilo venga creato automaticamente.

## 📊 Stato Attuale

- ✅ **API Keys**: Configurate e funzionanti
- ⚠️ **Migrazioni**: Disallineate (remote vs locali)
- ⚠️ **Trigger**: Non applicato (da applicare manualmente)
- ⚠️ **Profili**: Alcuni utenti potrebbero non avere profilo

## 🎯 Priorità Azioni

1. **ALTA**: Applica trigger manualmente (Metodo 1) - risolve il problema principale
2. **MEDIA**: Ripara migrazioni (Metodo 2) - solo se necessario per future migrazioni
3. **BASSA**: Verifica utenti senza profilo e creali se necessario

## 📝 File di Riferimento

- `docs/QUICK_APPLY_TRIGGER.sql` - SQL pronto per il trigger
- `scripts/repair-migrations-auto.ps1` - Script riparazione migrazioni
- `docs/FIX_MIGRATIONS_ISSUE.md` - Dettagli tecnici sul problema
- `docs/SUPABASE_VERIFICATION_REPORT.md` - Report completo verifica

## ⚠️ Note Importanti

1. **Non cancellare migrazioni remote**: Sono state applicate al database
2. **Backup prima di riparare**: Fai sempre un backup prima di modificare migrazioni
3. **Trigger è idempotente**: Puoi eseguirlo più volte senza problemi
4. **Verifica dopo ogni step**: Controlla che tutto funzioni prima di procedere
