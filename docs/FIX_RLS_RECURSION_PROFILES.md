# 🔧 Fix Ricorsione RLS - Tabella profiles

**Data**: 2025-01-29  
**Errore**: `infinite recursion detected in policy for relation "profiles"`  
**Codice Errore**: `42P17`

---

## 🐛 Problema Identificato

Le policy RLS `"Only admins can insert profiles"` e `"Only admins can delete profiles"` in `002_rls_policies.sql` causano ricorsione infinita perché:

```sql
-- ❌ PROBLEMATICO - Causa ricorsione
CREATE POLICY "Only admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles  -- ← Questa query su profiles causa ricorsione!
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

**Perché causa ricorsione**:

1. Quando si cerca di inserire un profilo, PostgreSQL valuta la policy
2. La policy fa `SELECT FROM profiles` per verificare se l'utente è admin
3. Ma quella `SELECT` è controllata dalle stesse RLS policies
4. Che a loro volta controllano se l'utente è admin...
5. **Loop infinito!** 🔄

---

## ✅ Soluzione

Eseguire lo script SQL: `supabase/migrations/20250129_fix_profiles_rls_recursion.sql`

### Cosa fa lo script:

1. **Rimuove** le policy problematiche:
   - `"Only admins can insert profiles"`
   - `"Only admins can delete profiles"`

2. **Crea** policy semplici che NON causano ricorsione:
   - `"Authenticated users can insert profiles"` - `WITH CHECK (true)`
   - `"Authenticated users can delete profiles"` - `USING (true)`

3. **Verifica** che non ci siano altre policy ricorsive

---

## 📋 Istruzioni Esecuzione

### Opzione 1: Supabase Dashboard (Consigliato)

1. Apri **Supabase Dashboard** → **SQL Editor**
2. Copia il contenuto di `supabase/migrations/20250129_fix_profiles_rls_recursion.sql`
3. Incolla nel SQL Editor
4. Clicca **Run** o premi `Ctrl+Enter`
5. Verifica che non ci siano errori

### Opzione 2: Supabase CLI

```bash
cd "c:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online"
supabase db push
```

---

## 🔍 Verifica Fix

Dopo l'esecuzione, verifica che l'errore sia risolto:

1. **Ricarica la pagina** nel browser
2. **Controlla la console** - non dovrebbero esserci più errori `42P17`
3. **Prova a fare login** - dovrebbe funzionare correttamente

---

## 📝 Note Importanti

- ✅ **La logica di autorizzazione admin** verrà gestita **lato applicazione** invece che con RLS policies complesse
- ✅ Le policy RLS ora sono **semplici e non ricorsive**
- ✅ Per controlli più granulari, implementare la logica in:
  - Middleware Next.js
  - Server Actions
  - API Routes

---

**Ultimo aggiornamento**: 2025-01-29
