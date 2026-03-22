# 🔧 FIX URGENTE RLS PROFILES - Guida Esecuzione

**Data**: 2025-01-27  
**Problema**: Errore "query would be affected by row-level security policy for table 'profiles'"

---

## 🚨 PROBLEMA IDENTIFICATO

L'errore si verifica quando si cerca di creare un nuovo appuntamento. Il problema è che:

1. **Query diretta su `profiles`** in `appointment-modal.tsx` (linea 86-90) viene bloccata da RLS
2. **Anche se le policies sono permissive** (`USING (true)`), potrebbe esserci un problema di ricorsione o contesto

---

## ✅ SOLUZIONE

### Step 1: Eseguire Script SQL

Eseguire `PAGE_AUDIT_FIX_RLS_PROFILES_ESEGUIRE.sql` in Supabase SQL Editor.

**Cosa fa lo script**:

1. ✅ Crea funzione `get_current_staff_profile_id()` con `SECURITY DEFINER` (disabilita RLS internamente)
2. ✅ Verifica che policy SELECT permissiva esista su `profiles`
3. ✅ Verifica finale che tutto sia corretto

### Step 2: Verifica Codice TypeScript

Il codice in `appointment-modal.tsx` è già stato aggiornato per usare la funzione helper:

**Prima (❌)**:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('user_id', user.id)
  .single()
```

**Dopo (✅)**:

```typescript
const { data: profileId, error: profileError } = await supabase.rpc('get_current_staff_profile_id')
const profile = profileId ? { id: profileId } : null
```

---

## 📋 ISTRUZIONI ESECUZIONE

1. **Apri Supabase Dashboard** → SQL Editor
2. **Copia e incolla** il contenuto di `PAGE_AUDIT_FIX_RLS_PROFILES_ESEGUIRE.sql`
3. **Esegui lo script**
4. **Verifica i risultati**:
   - ✅ `get_current_staff_profile_id` deve essere "✅ ESISTE"
   - ✅ Policy SELECT deve essere "✅ Permissiva (OK)"

---

## 🔍 ALTRE QUERY DA VERIFICARE

Se il problema persiste, verificare anche:

1. **`nuovo-pagamento-modal.tsx`** (linea 63) - Query su `profiles` per caricare atleti
2. **`assign-workout-modal.tsx`** (linea 76) - Query su `profiles` per ottenere profilo trainer

**Nota**: Queste query dovrebbero funzionare se la policy SELECT è permissiva (`USING (true)`), ma se il problema persiste, potremmo dover creare funzioni helper anche per quelle.

---

## ✅ VERIFICA POST-FIX

Dopo aver eseguito lo script:

1. ✅ Verificare che `get_current_staff_profile_id()` esista
2. ✅ Verificare che policy SELECT sia permissiva
3. ✅ Testare creazione appuntamento → Non deve più dare errore RLS

---

**Status**: ⚠️ **DA ESEGUIRE** (script SQL pronto, codice TypeScript già aggiornato)
