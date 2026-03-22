# 🚨 FIX URGENTE: Policies con Subquery Ricorsive

**Data**: 2025-01-27  
**Problema**: Le policies attuali hanno ancora subquery ricorsive!  
**File**: `PAGE_AUDIT_STEP3_FIX_FORZATO_POLICIES.sql`

---

## ❌ PROBLEMA CRITICO IDENTIFICATO

### Risultati Verifica Policies:

```
VERIFICA SUBQUERY RICORSIVE:
- subquery_ricorsive_qual: 3
- subquery_ricorsive_with_check: 2
- risultato: ❌ TROVATE SUBQUERY RICORSIVE!
```

### Policies Problematiche:

1. ❌ **`authenticated_users_select_appointments`** (SELECT)
   - `qual`: Subquery ricorsiva su `profiles`

2. ❌ **`authenticated_users_insert_appointments`** (INSERT)
   - `with_check`: Subquery ricorsiva su `profiles`

3. ❌ **`authenticated_users_update_appointments`** (UPDATE)
   - `qual`: Subquery ricorsiva su `profiles`
   - `with_check`: Subquery ricorsiva su `profiles`

4. ❌ **`authenticated_users_delete_appointments`** (DELETE)
   - `qual`: Subquery ricorsiva su `profiles`

---

## 🔍 CAUSA DEL PROBLEMA

Le policies vecchie (`authenticated_users_*`) **NON sono state rimosse** prima di creare le nuove policies nello script `PAGE_AUDIT_STEP3_SQL_FIX_V2.sql`.

**Risultato**: Le policies vecchie con subquery ricorsive sono ancora attive!

---

## ✅ SOLUZIONE: Fix Forzato

### Script: `PAGE_AUDIT_STEP3_FIX_FORZATO_POLICIES.sql`

**Cosa fa**:

1. ✅ **Verifica funzioni helper** (devono esistere)
2. ✅ **Rimuove FORZATAMENTE** tutte le policies esistenti su `appointments`
3. ✅ **Ricrea policies nuove** usando funzioni helper (senza subquery ricorsive)
4. ✅ **Verifica finale** che non ci siano subquery ricorsive

---

## 🚀 ISTRUZIONI ESECUZIONE

### 1. Backup (Importante!)

```sql
-- Fare backup completo del database prima di procedere
-- Usa Supabase Dashboard → Database → Backups → Create Backup
```

### 2. Verificare Funzioni Helper (Devono Esistere)

```sql
-- Eseguire PARTE 1 dello script
-- Se manca qualche funzione, CREARLA prima (PAGE_AUDIT_STEP3_SQL_FIX_V2.sql PARTE 1)
```

### 3. Eseguire Fix Forzato

```sql
-- Copiare ed eseguire: PAGE_AUDIT_STEP3_FIX_FORZATO_POLICIES.sql
-- Questo rimuoverà TUTTE le policies esistenti e ricreerà quelle nuove
```

### 4. Verificare Risultati

Dopo l'esecuzione, verificare che:

- ✅ Query "VERIFICA SUBQUERY RICORSIVE" mostri: `✅ NESSUNA SUBQUERY RICORSIVA`
- ✅ Policies usino funzioni helper (`get_current_staff_profile_id()`, `is_admin()`, ecc.)
- ✅ Policies NON abbiano subquery `SELECT profiles` o `FROM profiles`
- ✅ Policies per SELECT, INSERT, UPDATE, DELETE esistano

---

## ✅ CRITERI DI ACCETTAZIONE

### Fix Completato con Successo se:

- ✅ Verifica "SUBQUERY RICORSIVE" mostra: `✅ NESSUNA SUBQUERY RICORSIVA`
- ✅ Policies usano funzioni helper (`get_current_staff_profile_id()`, `is_admin()`, ecc.)
- ✅ Policies NON hanno subquery `SELECT profiles` o `FROM profiles`
- ✅ Policies per SELECT, INSERT, UPDATE, DELETE esistano
- ✅ Staff vede solo i propri appuntamenti (test funzionale)
- ✅ Admin vede tutti gli appuntamenti della propria org (test funzionale)
- ✅ Nessun errore RLS in console browser

---

## 🔧 TROUBLESHOOTING

### Problema 1: Funzioni Helper Mancanti

**Sintomo**: Query PARTE 1 mostra `❌ MANCANTE`

**Fix**:

```sql
-- Eseguire PARTE 1 di PAGE_AUDIT_STEP3_SQL_FIX_V2.sql per creare funzioni helper
```

---

### Problema 2: Policies Ancora Presenti Dopo Rimozione

**Sintomo**: Query PARTE 2 mostra `⚠️ ALCUNE POLICIES SONO ANCORA PRESENTI`

**Fix**:

```sql
-- Rimuovere manualmente:
DROP POLICY IF EXISTS "authenticated_users_select_appointments" ON appointments;
DROP POLICY IF EXISTS "authenticated_users_insert_appointments" ON appointments;
DROP POLICY IF EXISTS "authenticated_users_update_appointments" ON appointments;
DROP POLICY IF EXISTS "authenticated_users_delete_appointments" ON appointments;
-- Poi rieseguire PARTE 3 dello script
```

---

### Problema 3: Subquery Ricorsive Ancora Presenti

**Sintomo**: Query PARTE 4 mostra ancora `❌ TROVATE SUBQUERY RICORSIVE!`

**Causa**: Policies vecchie non sono state rimosse correttamente

**Fix**:

```sql
-- Rimuovere TUTTE le policies manualmente:
DO $$
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON appointments', policy_name);
  END LOOP;
END $$;

-- Poi rieseguire PARTE 3 dello script per ricreare policies corrette
```

---

## 📋 POLICIES CHE VERRANNO CREATE

### SELECT Policies (3):

1. `Athletes can view own appointments` → `athlete_id = get_current_athlete_profile_id()`
2. `Staff can view own appointments` → `staff_id = get_current_staff_profile_id()`
3. `Admins can view all org appointments` → `is_admin() AND org_id = ...`

### INSERT Policies (2):

1. `Staff can insert own appointments` → `staff_id = get_current_staff_profile_id()`
2. `Admins can insert org appointments` → `is_admin() AND org_id = ...`

### UPDATE Policies (2):

1. `Staff can update own appointments` → `staff_id = get_current_staff_profile_id()`
2. `Admins can update org appointments` → `is_admin() AND org_id = ...`

### DELETE Policies (2):

1. `Staff can delete own appointments` → `staff_id = get_current_staff_profile_id()`
2. `Admins can delete org appointments` → `is_admin() AND org_id = ...`

**Totale**: 9 policies (3 SELECT + 2 INSERT + 2 UPDATE + 2 DELETE)

---

## ⚠️ IMPATTO POST-FIX

### Dopo il Fix:

- ✅ Staff vedrà solo i propri appuntamenti (filtro per `staff_id`)
- ✅ Admin vedrà tutti gli appuntamenti della propria org (filtro per `org_id`)
- ✅ Atleta vedrà solo i propri appuntamenti (filtro per `athlete_id`)
- ✅ Nessuna subquery ricorsiva → Performance migliorata
- ✅ Nessun errore RLS durante login

---

## 🔗 PROSSIMI STEP

1. ⏳ **ESEGUIRE** `PAGE_AUDIT_STEP3_FIX_FORZATO_POLICIES.sql`
2. ⏳ **VERIFICARE** risultati query PARTE 4
3. ⏳ **TESTARE** dashboard (staff vede solo propri appuntamenti)
4. ⏳ **PROCEDERE** con fix FE/BE rimanenti (STEP 6)

---

**Stato**: ❌ **PROBLEMA CRITICO** - Policies con subquery ricorsive  
**Fix**: ✅ **PRONTO** - `PAGE_AUDIT_STEP3_FIX_FORZATO_POLICIES.sql`  
**Priorità**: 🔴 **URGENTE** - Eseguire immediatamente  
**Prossimo**: Eseguire script fix e verificare risultati
