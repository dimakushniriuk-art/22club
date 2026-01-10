# 🔄 Guida: Rigenerare Tipi Supabase per Risolvere Errori TypeScript

## 📋 Problema

Molti errori TypeScript (`Property 'X' does not exist on type 'never'`) sono causati da:

- Tipi Supabase non allineati allo schema del database
- Colonne aggiunte/modificate senza rigenerare i tipi
- Disallineamento tra `src/types/supabase.ts` e `src/lib/supabase/types.ts`

## ✅ Soluzione: Rigenerare i Tipi

### Opzione 1: Da Database Locale (Consigliato per sviluppo)

```powershell
# 1. Assicurati che Supabase locale sia attivo
npx supabase status

# 2. Rigenera i tipi dal database locale
npx supabase gen types typescript --local > src/lib/supabase/types.ts

# 3. Verifica che i tipi siano stati aggiornati
npm run typecheck
```

### Opzione 2: Da Database Remoto (Produzione)

```powershell
# 1. Assicurati di essere loggato e linkato
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Rigenera i tipi dal database remoto
npx supabase gen types typescript --linked > src/lib/supabase/types.ts

# 3. Verifica che i tipi siano stati aggiornati
npm run typecheck
```

### Opzione 3: Usando lo Script NPM

```powershell
npm run supabase:gen:types
```

## 🔍 Verifica Allineamento Schema

Dopo aver rigenerato i tipi, verifica che:

1. **Tutte le colonne esistano nei tipi**:

   ```typescript
   // Verifica che colonne come 'org_id', 'updated_at', 'role' esistano
   type ProfileRow = Tables<'profiles'>
   // ProfileRow dovrebbe avere tutte le colonne del database
   ```

2. **I tipi nullabili corrispondano**:
   ```sql
   -- Nel database
   ALTER TABLE profiles ALTER COLUMN org_id DROP NOT NULL;
   ```
   Dovrebbe riflettersi in:
   ```typescript
   org_id?: string | null
   ```

## 🛠️ Modifiche SQL che Possono Risolvere Errori

### 1. Aggiungere Colonne Mancanti

Se vedi errori come `Property 'org_id' does not exist`, crea una migration:

```sql
-- supabase/migrations/YYYYMMDD_add_missing_columns.sql
DO $$
BEGIN
  -- Aggiungi colonna se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN org_id UUID REFERENCES organizations(id);
  END IF;

  -- Aggiungi colonna updated_at se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Crea trigger per auto-aggiornare
    CREATE TRIGGER update_updated_at_column
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
```

### 2. Allineare Tipi NULL

Se vedi errori `Type 'null' is not assignable to type 'undefined'`:

```sql
-- Assicurati che le colonne siano NULLABLE (non NOT NULL)
ALTER TABLE profiles
  ALTER COLUMN nome DROP NOT NULL,
  ALTER COLUMN cognome DROP NOT NULL,
  ALTER COLUMN org_id DROP NOT NULL;
```

### 3. Aggiungere Indici per Performance

```sql
-- Migliora performance query e aiuta TypeScript a inferire meglio
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

## 📝 Checklist Post-Rigenerazione

- [ ] Eseguito `npm run supabase:gen:types`
- [ ] Verificato che `src/lib/supabase/types.ts` sia aggiornato
- [ ] Eseguito `npm run typecheck` - nessun errore nuovo
- [ ] Eseguito `npm run build` - build riuscita
- [ ] Verificato che i type assertions `as any` siano ridotti

## ⚠️ Note Importanti

1. **Non tutti gli errori sono risolvibili con modifiche Supabase**:
   - Errori di inferenza TypeScript con query complesse richiedono type assertions
   - Query con join multipli possono richiedere type casting esplicito

2. **I workaround `as any` sono accettabili** quando:
   - La query funziona correttamente a runtime
   - Il problema è solo di inferenza TypeScript
   - È documentato con commenti `// Workaround necessario per inferenza tipo Supabase`

3. **Priorità**:
   - Prima: Rigenera i tipi
   - Poi: Aggiungi colonne mancanti
   - Infine: Usa type assertions solo se necessario
