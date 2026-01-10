# 🔧 Applicazione Migrazione Trigger Profilo

## ⚠️ Problema Identificato

Il comando `npx supabase db push` ha fallito perché ci sono migrazioni remote che non esistono localmente. Questo è normale se le migrazioni sono state applicate direttamente nel dashboard Supabase.

## ✅ Soluzione: Applicare Manualmente nel Dashboard

Poiché c'è un disallineamento tra migrazioni remote e locali, la soluzione più sicura è applicare la migrazione del trigger **direttamente nel dashboard Supabase**.

### Step 1: Apri SQL Editor nel Dashboard

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new
2. Oppure: Dashboard → SQL Editor → New Query

### Step 2: Copia e Incolla la Migrazione

Copia il contenuto del file `supabase/migrations/20250127_create_profile_trigger.sql` e incollalo nell'editor SQL.

### Step 3: Esegui la Query

Clicca su **Run** o premi `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac).

### Step 4: Verifica che il Trigger sia Attivo

Esegui questa query per verificare:

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

Dovresti vedere:

- ✅ `on_auth_user_created` nella tabella triggers
- ✅ `handle_new_user` nella tabella routines

## 🔄 Alternativa: Sincronizzare Migrazioni

Se preferisci sincronizzare le migrazioni prima di applicare quella nuova:

### Opzione A: Riparare Migrazioni Remote

```powershell
# Ripara le migrazioni remote che non esistono localmente
npx supabase migration repair --status reverted 20250111 20250112 20250113 20250114 20250115 20250115120000 20250115130000 20250116 20250116120000 20250116130000 20250116140000 20250116150000 20250116160000 20250117 20250118 20250119 20250120 20250120120000 20250120130000 20250121 20250121120000 20250121130000 20250121140000 20250122 20250123 20250124 20250125 20250126 20250127120000 20250127130000 20250127140000 20250127150000 20250128 20250129 20250130 20250131 20250201 20250202 20250203 20250204 20250205 20250206 20250207 20250208 20250209 20250210 20250211 20250212 20250213 20250214 20250215 20250216 20250217 20250218 20250219 20250301 20250302 20250303 20250304 20250305 20250306 20250307 20250308 20250309 20250310 20250311 20250312 20250313 20250314 20250315 20251010 20251012 20251013 20251014 20251112 20251115 20251116 20251117 20251118 20251120120000 20251120130000 20251120140000 20251121 20251122 20251123 20251130001839 20251130001840 20251130002000
```

### Opzione B: Pull Migrazioni Remote

```powershell
# Sincronizza le migrazioni locali con quelle remote
npx supabase db pull
```

**⚠️ ATTENZIONE**: Questo sovrascriverà le migrazioni locali con quelle remote. Fai un backup prima!

## 📋 Contenuto Migrazione da Applicare

```sql
-- ============================================================================
-- TRIGGER: Creazione automatica profilo quando viene creato un utente
-- Data: 2025-01-27
-- Descrizione: Crea automaticamente un profilo quando viene creato un utente
--              in auth.users, evitando il problema "profilo non trovato"
-- ============================================================================

-- Funzione per creare automaticamente il profilo quando viene creato un utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crea il profilo solo se non esiste già (evita duplicati)
  INSERT INTO public.profiles (
    user_id,
    email,
    nome,
    cognome,
    role,
    org_id,
    stato,
    created_at
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
  ON CONFLICT (user_id) DO NOTHING; -- Evita errori se il profilo esiste già

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che si attiva quando viene creato un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Commento per documentazione
COMMENT ON FUNCTION public.handle_new_user() IS
  'Crea automaticamente un profilo quando viene creato un nuovo utente in auth.users';
```

## ✅ Dopo l'Applicazione

1. **Verifica il trigger** con la query sopra
2. **Testa la registrazione** di un nuovo utente
3. **Verifica che il profilo venga creato automaticamente**

## 🔍 Troubleshooting

### Errore: "function already exists"

✅ **Non è un problema!** La funzione viene sostituita con `CREATE OR REPLACE`.

### Errore: "trigger already exists"

✅ **Non è un problema!** Il trigger viene eliminato e ricreato con `DROP TRIGGER IF EXISTS`.

### Errore: "permission denied"

⚠️ Assicurati di essere loggato come amministratore nel dashboard Supabase.
