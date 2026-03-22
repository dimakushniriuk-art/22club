# 📋 STEP 3 — SQL DI FIX/MIGRAZIONE

**Data**: 2025-01-27  
**File**: `PAGE_AUDIT_STEP3_SQL_FIX.sql`

---

## 🎯 OBIETTIVO

Eseguire fix completi al database Supabase per risolvere:

1. **Permessi eccessivi** a `anon` → RIMOSSI
2. **RLS Policies permissive** (`USING(true)`) → CORRETTE con filtri `staff_id`/`org_id`
3. **CHECK constraint** `type` incompleto → ALLINEATO
4. **Indicii mancanti** per query dashboard → AGGIUNTI
5. **Funzioni helper** per evitare ricorsione RLS → CREATE

---

## ⚠️ AVVERTENZE IMPORTANTI

### PRIMA DI ESECUIRE:

1. **✅ Backup Database**: Fare backup completo prima di eseguire
2. **✅ Test su Staging**: Se possibile, testare su ambiente di staging
3. **✅ Orario di Manutenzione**: Eseguire in orario di basso traffico
4. **✅ Monitoraggio**: Monitorare errori durante esecuzione

### RISCHI:

- ❌ **Rischio Alto**: Le nuove RLS policies possono bloccare accessi legittimi se `get_current_staff_profile_id()` non funziona correttamente
- ⚠️ **Rischio Medio**: Modifica CHECK constraint può fallire se esistono dati non validi
- ⚠️ **Rischio Basso**: Rimozione permessi `anon` non dovrebbe avere impatto (anon non dovrebbe accedere)

---

## 📝 STRUTTURA SCRIPT

### PARTE 1: Funzioni Helper

**Cosa fa**: Crea funzioni helper per evitare ricorsione RLS

- `get_current_staff_profile_id()` → Restituisce `profiles.id` dello staff corrente
- `is_staff_appointments()` → Verifica se utente è staff
- `is_admin()` → Verifica se utente è admin (se non esiste)

**Sicurezza**: Funzioni `SECURITY DEFINER` che disabilitano RLS internamente

**Impact**: ✅ Nessun rischio, crea solo funzioni

---

### PARTE 2: Rimuovere Permessi eccessivi

**Cosa fa**: Rimuove tutti i permessi a `anon` su `appointments`

**Query**:

```sql
REVOKE ALL ON appointments FROM anon;
REVOKE ALL ON appointments FROM public;
```

**Impact**: ✅ Basso rischio, `anon` non dovrebbe avere accesso

---

### PARTE 3: Correggere RLS Policies

**Cosa fa**: Rimuove policies permissive e crea policies restrittive

**Policies create**:

1. **SELECT**: Staff vede solo i propri appuntamenti (`staff_id = get_current_staff_profile_id()`)
2. **INSERT**: Solo staff può inserire come proprio `staff_id`
3. **UPDATE**: Solo staff può modificare propri appuntamenti
4. **DELETE**: Solo staff può eliminare propri appuntamenti

**Admin**: Può vedere/modificare tutti gli appuntamenti della propria `org_id`

**Impact**: ⚠️ **RISCHIO MEDIO** - Verificare che funzioni helper funzionino correttamente

---

### PARTE 4: Allineare CHECK constraint

**Cosa fa**: Aggiorna CHECK constraint su `type` per includere tutti i tipi supportati

**Tipi supportati**:

- `allenamento`, `prova`, `valutazione` (esistenti)
- `cardio`, `check`, `consulenza`, `prima_visita`, `riunione`, `massaggio`, `nutrizionista` (aggiunti)

**Impact**: ⚠️ **RISCHIO MEDIO** - Può fallire se esistono dati non validi

**Se fallisce**: Prima eseguire cleanup dati (PARTE 7)

---

### PARTE 5: Indicii per Performance

**Cosa fa**: Crea indicii per ottimizzare query dashboard

**Indicii creati**:

1. `idx_appointments_dashboard_query`: `(staff_id, starts_at DESC) WHERE cancelled_at IS NULL`
2. `idx_appointments_org_id`: `(org_id) WHERE org_id IS NOT NULL`
3. `idx_appointments_status`: `(status) WHERE status IS NOT NULL`

**Impact**: ✅ Basso rischio, migliora performance

---

### PARTE 6: Verifica Integrità Dati

**Cosa fa**: Verifica violazioni constraint, orphan rows, valori NULL

**Query**: Solo verifiche, non modifica nulla (usa `RAISE WARNING`)

**Impact**: ✅ Nessun rischio, solo verifica

---

### PARTE 7: Cleanup Dati (Opzionale)

**Cosa fa**: Query di cleanup commentate (eseguire solo se necessario)

**Query**:

- Aggiorna `org_id NULL` a `'default-org'`
- Sincronizza `trainer_id = staff_id`
- Rimuovi appointments cancellati vecchi (> 1 anno)

**Impact**: ⚠️ **RISCHIO MEDIO** - Modifica dati, eseguire solo se necessario

---

### PARTE 8: Verifica Finale

**Cosa fa**: Query di verifica per confermare che fix siano applicati correttamente

**Verifica**:

- RLS attivo ✅
- Policies create correttamente ✅
- Permessi `anon` rimossi ✅
- Constraint allineato ✅

**Impact**: ✅ Nessun rischio, solo verifica

---

### PARTE 9: Rollback (Se Necessario)

**Cosa fa**: Istruzioni per rollback completo se necessario

**Impact**: ⚠️ Solo se necessario

---

## 🚀 ISTRUZIONI ESECUZIONE

### 1. Preparazione

```sql
-- 1.1 Verifica stato attuale
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'appointments';
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'appointments';
SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_name = 'appointments' AND grantee = 'anon';
```

### 2. Backup (Importante!)

```bash
# Eseguire backup completo del database prima di procedere
# Usa Supabase Dashboard → Database → Backups → Create Backup
```

### 3. Esecuzione Script

1. Apri Supabase Dashboard → SQL Editor
2. Copia il contenuto di `PAGE_AUDIT_STEP3_SQL_FIX.sql`
3. Incolla nello SQL Editor
4. Clicca **Run** (o `Ctrl+Enter`)
5. **Aspetta completamento** (può richiedere alcuni secondi)

### 4. Verifica Risultati

Controlla i risultati delle query nella **PARTE 8**:

- ✅ RLS attivo: `✅ ATTIVO`
- ✅ Policies: `✅ USA staff_id filtro` o `✅ USA admin check`
- ✅ Permessi anon: `anon` non dovrebbe apparire
- ✅ Constraint: `✅ ALLINEATO`

### 5. Test Funzionale

1. **Login come staff**: Verificare che veda solo i propri appuntamenti
2. **Login come admin**: Verificare che veda tutti gli appuntamenti della propria org
3. **Query dashboard**: Verificare che funzioni correttamente
4. **Performance**: Verificare che query usino indicii (`EXPLAIN`)

---

## 🔧 TROUBLESHOOTING

### Problema 1: RLS Policy blocca accesso legittimo

**Sintomo**: Staff non vede i propri appuntamenti

**Causa**: `get_current_staff_profile_id()` restituisce `NULL`

**Fix**:

```sql
-- Verifica che la funzione funzioni
SELECT get_current_staff_profile_id();

-- Se NULL, verifica che esista un profilo per l'utente
SELECT id, user_id, role FROM profiles WHERE user_id = auth.uid();

-- Se manca, creare profilo o aggiornare ruolo
```

---

### Problema 2: CHECK constraint fallisce

**Sintomo**: Error durante PARTE 4: `check constraint violations`

**Causa**: Esistono appointments con `type` non valido

**Fix**:

```sql
-- 1. Verifica valori non validi
SELECT DISTINCT type FROM appointments
WHERE type NOT IN ('allenamento', 'prova', 'valutazione', 'cardio', 'check', 'consulenza', 'prima_visita', 'riunione', 'massaggio', 'nutrizionista');

-- 2. Aggiorna valori non validi
UPDATE appointments
SET type = 'allenamento'  -- o altro valore valido
WHERE type NOT IN ('allenamento', 'prova', 'valutazione', 'cardio', 'check', 'consulenza', 'prima_visita', 'riunione', 'massaggio', 'nutrizionista');

-- 3. Riesegui PARTE 4
```

---

### Problema 3: Query dashboard lenta

**Sintomo**: Dashboard lenta dopo fix

**Causa**: Indici non utilizzati o query non ottimizzata

**Fix**:

```sql
-- 1. Verifica che indici esistano
SELECT indexname FROM pg_indexes WHERE tablename = 'appointments';

-- 2. Verifica uso indici
EXPLAIN ANALYZE
SELECT * FROM appointments
WHERE staff_id = '...'
  AND starts_at >= DATE_TRUNC('day', NOW())
  AND starts_at < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  AND cancelled_at IS NULL;

-- 3. Se usa Seq Scan, potrebbe servire VACUUM ANALYZE
VACUUM ANALYZE appointments;
```

---

### Problema 4: Admin non vede tutti gli appuntamenti

**Sintomo**: Admin vede solo i propri appuntamenti

**Causa**: `org_id` non corrisponde o `is_admin()` non funziona

**Fix**:

```sql
-- 1. Verifica is_admin()
SELECT is_admin();

-- 2. Verifica org_id
SELECT id, user_id, role, org_id FROM profiles WHERE user_id = auth.uid();

-- 3. Verifica appointments org_id
SELECT DISTINCT org_id FROM appointments LIMIT 10;
```

---

## ✅ CRITERI DI ACCETTAZIONE

### Fix Completato con Successo se:

- ✅ RLS è **ATTIVO** su `appointments`
- ✅ Policies hanno filtri `staff_id` o `is_admin()` (NON `USING(true)`)
- ✅ Ruolo `anon` **NON** ha permessi su `appointments`
- ✅ CHECK constraint include tutti i tipi supportati
- ✅ Indicii dashboard query esistono
- ✅ Staff vede solo i propri appuntamenti (test funzionale)
- ✅ Admin vede tutti gli appuntamenti della propria org (test funzionale)
- ✅ Dashboard funziona correttamente (test funzionale)

---

## 📊 METRICHE POST-FIX

### Prima del Fix:

- ❌ RLS: Permissivo (`USING(true)`)
- ❌ Permessi: `anon` ha accesso completo
- ⚠️ Performance: Query senza indice ottimizzato

### Dopo il Fix:

- ✅ RLS: Restrittivo (filtra per `staff_id`/`org_id`)
- ✅ Permessi: `anon` senza accesso
- ✅ Performance: Indicii ottimizzati per query dashboard

---

## 🔗 PROSSIMI STEP

**STEP 4**: Piano risoluzione problemi FE/BE  
**STEP 5**: Rianalisi dopo fix  
**STEP 6**: Implementazione finale + report completo

---

**Stato**: ✅ STEP 3 COMPLETATO (script generato)  
**Prossimo**: Eseguire script su Supabase e procedere con STEP 4
