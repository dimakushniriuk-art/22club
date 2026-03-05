# 🚀 Applicazione Rapida Trigger Profilo

## ⚡ Metodo Veloce: Dashboard Supabase

### Step 1: Apri SQL Editor

Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

### Step 2: Copia questo SQL

```sql
-- Funzione per creare automaticamente il profilo quando viene creato un utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che si attiva quando viene creato un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Esegui (Ctrl+Enter)

### Step 4: Verifica

```sql
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```
