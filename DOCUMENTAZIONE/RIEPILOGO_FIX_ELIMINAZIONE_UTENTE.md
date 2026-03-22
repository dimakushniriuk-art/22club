# 🔧 Riepilogo Fix Eliminazione Utente - Problemi Policy RLS

**Data**: 2026-01-09  
**Problema**: Admin non riesce a eliminare atleti - "Database error deleting user"  
**Causa Root**: Policy DELETE su `profiles` usa `is_admin()` che NON funziona con service role key

---

## 🔴 Problemi Identificati

### 1. Policy DELETE Problematica

- **Policy**: "Only admins can delete profiles"
- **Espressione**: `is_admin()`
- **Problema**: `is_admin()` usa `auth.uid()` che è NULL con service role key
- **Risultato**: Policy blocca sempre l'eliminazione anche con service role key

### 2. Constraint FOREIGN KEY su role

- **Constraint**: `profiles_role_fkey` (role -> roles.name)
- **Regola**: `ON DELETE RESTRICT`
- **Problema**: Può bloccare eliminazione se ruolo è referenziato
- **Soluzione**: Rimuovere constraint (role è solo testo, non serve FK)

### 3. Dipendenze Multiple

- **29+ tabelle** che referenziano `profiles` o `auth.users`
- Alcune hanno `ON DELETE RESTRICT` (es. `payments.created_by_staff_id`)
- Deve essere eliminato manualmente PRIMA di eliminare l'utente

---

## ✅ Soluzioni Implementate

### 1. Funzione SQL per Bypass RLS

**File**: `supabase/migrations/20260109_fix_delete_profile_bypass_rls.sql`

```sql
CREATE FUNCTION delete_profile_bypass_rls(profile_id_to_delete UUID)
RETURNS BOOLEAN
SECURITY DEFINER
-- Disabilita temporaneamente RLS, elimina profilo, riabilita RLS
```

### 2. Rimozione Constraint FOREIGN KEY

**File**: `supabase/migrations/20260109_fix_delete_policy_service_role.sql`

- Rimuove `profiles_role_fkey` se esiste
- Verifica policy DELETE dopo fix

### 3. Eliminazione Manuale Dipendenze

**File**: `src/app/api/admin/users/route.ts` (DELETE handler)

Elimina manualmente (in ordine):

1. `pt_atleti` (relazioni trainer-atleti)
2. Tabelle `athlete_*` (8 tabelle dati atleta)
3. `payments` (CRITICO - ha RESTRICT)
4. `appointments`, `workouts`, `workout_logs`, `workout_plans`
5. `documents`, `inviti_atleti`, `lesson_counters`, `profiles_tags`, `progress_photos`, `chat_messages`

### 4. Query di Verifica

- `docs/VERIFICA_TABELLE_DIPENDENTI.sql` - Verifica foreign key
- `docs/VERIFICA_TUTTE_POLICY_RLS.sql` - Verifica policy RLS
- `docs/VERIFICA_DIPENDENZE_AUTH_USERS.sql` - Verifica dipendenze auth.users

---

## 🚀 Azioni da Eseguire

### 1. Eseguire Migrazioni (ORDINE IMPORTANTE!)

```sql
-- PRIMA: Aggiungi funzione bypass RLS
supabase/migrations/20260109_fix_delete_profile_bypass_rls.sql

-- SECONDO: Rimuovi constraint e verifica policy
supabase/migrations/20260109_fix_delete_policy_service_role.sql

-- OPPURE: Script completo (include entrambi)
docs/FIX_COMPLETO_ELIMINAZIONE_UTENTE.sql
```

### 2. Verificare Policy DELETE

```sql
-- Esegui questo per vedere tutte le policy DELETE
SELECT
    policyname,
    permissive,
    roles,
    qual AS using_expression
FROM pg_policies
WHERE tablename = 'profiles'
    AND schemaname = 'public'
    AND cmd = 'DELETE';
```

### 3. Verificare Funzione

```sql
-- Verifica che la funzione esista
SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'delete_profile_bypass_rls'
) AS function_exists;

-- Testa la funzione (con un ID valido)
-- SELECT delete_profile_bypass_rls('PROFILE_ID_DA_TESTARE'::UUID);
```

### 4. Verificare Constraint

```sql
-- Verifica che il constraint sia stato rimosso
SELECT
    constraint_name,
    constraint_type,
    delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'profiles'
    AND tc.table_schema = 'public'
    AND tc.constraint_name = 'profiles_role_fkey';
-- Dovrebbe restituire 0 righe (constraint rimosso)
```

---

## 🧪 Test

### Dopo aver eseguito le migrazioni:

1. **Test eliminazione atleta da admin**:
   - Login come admin
   - Vai a "Gestione Utenti"
   - Elimina un atleta
   - Dovrebbe funzionare senza errori

2. **Verifica log**:
   - Controlla log server per vedere se ci sono errori
   - Verifica che tutte le dipendenze siano eliminate
   - Verifica che la funzione `delete_profile_bypass_rls()` venga chiamata

---

## 📋 File Creati/Modificati

### Migrazioni SQL:

- ✅ `supabase/migrations/20260109_fix_delete_profile_bypass_rls.sql` (NUOVO)
- ✅ `supabase/migrations/20260109_fix_delete_policy_service_role.sql` (NUOVO)

### Query di Verifica:

- ✅ `docs/VERIFICA_TABELLE_DIPENDENTI.sql`
- ✅ `docs/VERIFICA_TUTTE_POLICY_RLS.sql`
- ✅ `docs/VERIFICA_DIPENDENZE_AUTH_USERS.sql`

### Script Completo:

- ✅ `docs/FIX_COMPLETO_ELIMINAZIONE_UTENTE.sql` (include tutto)

### Codice:

- ✅ `src/app/api/admin/users/route.ts` (DELETE handler - MODIFICATO)

---

## ⚠️ Note Importanti

1. **Service Role Key**: Dovrebbe bypassare automaticamente RLS, ma la policy `is_admin()` può ancora causare problemi
2. **Funzione SQL**: Usa `SECURITY DEFINER` per garantire che funzioni anche con service role key
3. **Ordine Eliminazione**: IMPORTANTE - eliminare prima tutte le dipendenze, poi l'utente
4. **payments RESTRICT**: CRITICO - deve essere eliminato PRIMA, altrimenti blocca tutto
5. **profiles.role FK**: Rimuovere constraint - role è solo testo, non serve foreign key

---

## 🔍 Debug

Se il problema persiste dopo aver eseguito le migrazioni:

1. Verifica errori nel log server
2. Esegui `docs/VERIFICA_TUTTE_POLICY_RLS.sql` per vedere tutte le policy
3. Esegui `docs/VERIFICA_DIPENDENZE_AUTH_USERS.sql` per vedere tutte le dipendenze
4. Verifica che la funzione `delete_profile_bypass_rls()` esista e funzioni
5. Verifica che il constraint `profiles_role_fkey` sia stato rimosso

---

## 📝 Prossimi Passi

1. ✅ Eseguire migrazioni SQL
2. ✅ Testare eliminazione atleta
3. ✅ Verificare log per errori
4. ✅ Se problema persiste, analizzare errori specifici nei log
