# 🔧 FIX POLICIES PROBLEMATICHE - Guida Esecuzione
**Data**: 2025-01-27  
**Problema**: Policies "Staff can view all profiles" e "Trainers can view assigned athletes" hanno condizioni problematiche

---

## 🚨 PROBLEMA IDENTIFICATO

Dopo aver eseguito `PAGE_AUDIT_FIX_RLS_PROFILES_ESEGUIRE.sql`, la verifica mostra che 2 policies hanno "⚠️ Verificare":

1. **"Staff can view all profiles"** - Potrebbe avere subquery ricorsive
2. **"Trainers can view assigned athletes"** - Potrebbe avere subquery ricorsive

Queste policies potrebbero causare problemi RLS quando si fanno query su `profiles`.

---

## ✅ SOLUZIONE

### Step 1: Eseguire Script SQL
Eseguire `PAGE_AUDIT_FIX_RLS_PROFILES_POLICIES_ESEGUIRE.sql` in Supabase SQL Editor.

**Cosa fa lo script**:
1. ✅ Verifica che funzioni helper esistano (`is_staff()`, `get_current_trainer_profile_id()`, `is_athlete_assigned_to_current_trainer()`)
2. ✅ Crea le funzioni helper se non esistono
3. ✅ Rimuove le policies problematiche
4. ✅ Ricrea le policies usando funzioni helper (NON subquery dirette)
5. ✅ Verifica finale che tutto sia corretto

---

## 📋 ISTRUZIONI ESECUZIONE

1. **Apri Supabase Dashboard** → SQL Editor
2. **Copia e incolla** il contenuto di `PAGE_AUDIT_FIX_RLS_PROFILES_POLICIES_ESEGUIRE.sql`
3. **Esegui lo script**
4. **Verifica i risultati**:
   - ✅ Tutte le policies devono avere "✅ Usa funzione helper (OK)" o "✅ Permissiva (OK)"
   - ❌ Nessuna policy deve avere "⚠️ Potrebbe avere subquery"

---

## 🔍 COSA CAMBIA

### Prima (❌ - Potrebbe avere subquery ricorsive):
```sql
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'pt', 'trainer')
    )
  );
```

### Dopo (✅ - Usa funzione helper):
```sql
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_staff());
```

**Vantaggi**:
- ✅ Nessuna subquery ricorsiva (la funzione helper disabilita RLS internamente)
- ✅ Performance migliore
- ✅ Nessun problema di ricorsione RLS

---

## ✅ VERIFICA POST-FIX

Dopo aver eseguito lo script, tutte le policies su `profiles` devono avere:
- ✅ "✅ Usa funzione helper (OK)" per policies che usano funzioni helper
- ✅ "✅ Permissiva (OK)" per policies permissive
- ✅ "✅ Usa auth.uid() (OK)" per policies che usano auth.uid()

**Nessuna policy deve avere**:
- ❌ "⚠️ Potrebbe avere subquery"
- ❌ "⚠️ Verificare"

---

## 📝 NOTE

1. **Policy "Trainers can view assigned athletes"** è ridondante perché "Authenticated users can view all profiles" già permette a tutti di vedere tutti i profili. La manteniamo per chiarezza ma potrebbe essere rimossa se non serve isolamento trainer-atleti.

2. **Funzioni helper** usano `SECURITY DEFINER` e disabilitano RLS internamente (`set_config('row_security', 'off', true)`), evitando problemi di ricorsione.

---

**Status**: ⚠️ **DA ESEGUIRE** (script SQL pronto)
