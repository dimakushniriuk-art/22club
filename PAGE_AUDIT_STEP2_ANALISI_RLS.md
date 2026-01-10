# 📊 ANALISI RISULTATI RLS POLICIES
**Data**: 2025-01-27  
**File**: Risultati query `PAGE_AUDIT_STEP2_VERIFICA_RLS.sql`

---

## ✅ RISULTATI RACCOLTI

### 1. Stato RLS ✅
```
tablename    | rls_enabled | stato_rls
appointments | true        | ATTIVO
```
**Stato**: ✅ RLS è **ATTIVO** su `appointments`

---

## ❌ PROBLEMA CRITICO IDENTIFICATO

### **BLOCKER: Subquery Ricorsive nelle Policies RLS**

Le policies attuali usano **subquery dirette su `profiles`** che possono causare **ricorsione RLS**!

#### Policies Esistenti (PROBLEMATICHE):

1. **`authenticated_users_select_appointments`** (SELECT)
   ```sql
   USING (
     athlete_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR staff_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR trainer_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND role IN (...))
   )
   ```
   **Problema**: Subquery `SELECT profiles.id FROM profiles` → **RICORSIONE RLS** ⚠️

2. **`authenticated_users_insert_appointments`** (INSERT)
   ```sql
   WITH CHECK (
     auth.uid() IS NOT NULL
     AND (staff_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND role IN (...)))
   )
   ```
   **Problema**: Subquery `SELECT profiles.id FROM profiles` → **RICORSIONE RLS** ⚠️

3. **`authenticated_users_update_appointments`** (UPDATE)
   ```sql
   USING (
     staff_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR trainer_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND role IN (...))
   )
   WITH CHECK (...stesso problema...)
   ```
   **Problema**: Subquery `SELECT profiles.id FROM profiles` → **RICORSIONE RICORSIONE RLS** ⚠️

4. **`authenticated_users_delete_appointments`** (DELETE)
   ```sql
   USING (
     staff_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR trainer_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
     OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND role IN (...))
   )
   ```
   **Problema**: Subquery `SELECT profiles.id FROM profiles` → **RICORSIONE RLS** ⚠️

---

## 🔍 PERCHÉ È UN PROBLEMA?

### Ricorsione RLS:
1. Utente esegue query su `appointments`
2. RLS policy valida accesso usando subquery `SELECT profiles.id FROM profiles`
3. `profiles` ha RLS attivo
4. RLS policy su `profiles` valida accesso usando `auth.uid()`
5. **RISULTATO**: Query funziona, MA può causare:
   - ⚠️ Performance degradata (query nested)
   - ⚠️ Errori durante login (se `profiles` RLS è restrittivo)
   - ⚠️ Problemi di timing/race conditions

### Esempio Problema Reale:
```
Utente fa login → Supabase valida token → Query appointments →
RLS policy usa subquery profiles → RLS policy profiles valida →
Possibile errore: "permission denied for table profiles"
```

---

## ✅ SOLUZIONE: Funzioni Helper

### Pattern Corretto (già usato in altre tabelle):

Invece di:
```sql
staff_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
```

Usare:
```sql
staff_id = get_current_staff_profile_id()
```

Dove `get_current_staff_profile_id()` è una funzione `SECURITY DEFINER` che:
- Disabilita RLS internamente (`set_config('row_security', 'off', true)`)
- Esegue query su `profiles` senza RLS
- Restituisce `profiles.id` senza ricorsione

---

## 📋 FIX NECESSARIO

### File: `PAGE_AUDIT_STEP3_SQL_FIX_V2.sql`

#### Cosa fa:
1. ✅ **Verifica/crea funzioni helper**:
   - `get_current_staff_profile_id()` → Restituisce `profiles.id` staff corrente
   - `get_current_athlete_profile_id()` → Restituisce `profiles.id` atleta corrente
   - `is_admin()` → Verifica se utente è admin
   - `is_staff_appointments()` → Verifica se utente è staff

2. ✅ **Rimuove policies esistenti** (con subquery ricorsive)

3. ✅ **Crea nuove policies** (con funzioni helper):
   - `Athletes can view own appointments` → `athlete_id = get_current_athlete_profile_id()`
   - `Staff can view own appointments` → `staff_id = get_current_staff_profile_id()`
   - `Admins can view all org appointments` → `is_admin() AND org_id = ...`
   - `Staff can insert own appointments` → `staff_id = get_current_staff_profile_id()`
   - `Staff can update own appointments` → `staff_id = get_current_staff_profile_id()`
   - `Staff can delete own appointments` → `staff_id = get_current_staff_profile_id()`

4. ✅ **Rimuove permessi `anon`**

5. ✅ **Aggiunge indicii per performance**

---

## 🚀 ISTRUZIONI ESECUZIONE

### 1. Backup (Importante!)
```sql
-- Fare backup completo del database prima di procedere
```

### 2. Eseguire Script Fix
```sql
-- Copiare ed eseguire: PAGE_AUDIT_STEP3_SQL_FIX_V2.sql
```

### 3. Verificare Risultati
Dopo l'esecuzione, verificare che:
- ✅ Policies NON abbiano subquery `SELECT profiles` (PARTE 7.2)
- ✅ Policies usino funzioni helper (`get_current_staff_profile_id`, `is_admin`)
- ✅ Ruolo `anon` NON abbia permessi (PARTE 7.3)
- ✅ Funzioni helper esistano (PARTE 7.4)

### 4. Test Funzionale
- ✅ Testare login staff → dovrebbe vedere solo propri appuntamenti
- ✅ Testare login admin → dovrebbe vedere tutti gli appuntamenti della propria org
- ✅ Testare login atleta → dovrebbe vedere solo propri appuntamenti
- ✅ Verificare che nessun errore RLS in console

---

## ✅ CRITERI DI ACCETTAZIONE

### Fix Completato con Successo se:
- ✅ Policies NON hanno subquery `SELECT profiles` dirette
- ✅ Policies usano funzioni helper (`get_current_staff_profile_id()`, `is_admin()`, ecc.)
- ✅ Verifica PARTE 7.2 mostra: `✅ USA funzione helper` (NON `❌ SUBQUERY RICORSIVA`)
- ✅ Nessun errore RLS durante login
- ✅ Dashboard funziona correttamente
- ✅ Staff vede solo i propri appuntamenti (test funzionale)
- ✅ Admin vede tutti gli appuntamenti della propria org (test funzionale)

---

## 🔗 PROSSIMI STEP

**STEP 3**: Eseguire `PAGE_AUDIT_STEP3_SQL_FIX_V2.sql`  
**STEP 4**: Piano risoluzione (già completato)  
**STEP 5**: Rianalisi dopo fix  
**STEP 6**: Implementazione finale + report

---

**Stato**: ✅ ANALISI RLS COMPLETATA  
**Problema**: ❌ **CRITICO** - Subquery ricorsive nelle policies  
**Fix**: ✅ Pronto in `PAGE_AUDIT_STEP3_SQL_FIX_V2.sql`  
**Prossimo**: Eseguire script fix e verificare risultati
