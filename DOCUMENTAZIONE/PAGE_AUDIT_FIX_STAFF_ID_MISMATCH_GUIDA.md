# 🔧 FIX STAFF_ID MISMATCH - Guida Diagnostica

**Data**: 2025-01-27  
**Problema**: `current_staff_id` è NULL, quindi appuntamenti non vengono trovati

---

## 🚨 PROBLEMA IDENTIFICATO

Dalla query SQL risulta:

- `current_staff_id` = `NULL` → `get_current_staff_profile_id()` restituisce NULL
- `staff_id` appuntamento = `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`
- `staff_match` = "❌ No Match" → L'appuntamento non corrisponde al profilo corrente

---

## 🔍 POSSIBILI CAUSE

### 1. Utente Corrente Non È Staff

- L'utente corrente non ha un ruolo staff (admin/pt/trainer/staff)
- `get_current_staff_profile_id()` restituisce NULL perché il ruolo non è valido

### 2. Utente Corrente Non È lo Staff dell'Appuntamento

- L'appuntamento appartiene a un altro staff (`f6fdd6cb-c602-4ced-89a7-41a347e8faa9`)
- L'utente corrente è un altro staff
- Questo è corretto se l'utente non è lo staff dell'appuntamento

### 3. Problema con get_current_staff_profile_id()

- La funzione non funziona correttamente
- Restituisce NULL anche se l'utente è staff

---

## ✅ SOLUZIONI IMPLEMENTATE

### 1. Query Diretta come Metodo Principale

- Il codice ora usa query diretta su `profiles` come metodo principale
- Questo dovrebbe funzionare anche se `get_current_staff_profile_id()` restituisce NULL

### 2. Logging Migliorato

- Log quando si carica il profilo
- Log quando si eseguono query appointments
- Log quando si processano appuntamenti

---

## 📋 ISTRUZIONI DIAGNOSTICA

### Step 1: Esegui Script SQL

Esegui `PAGE_AUDIT_FIX_STAFF_ID_MISMATCH.sql` in Supabase SQL Editor.

**Query Importanti**:

1. **PARTE 1**: Verifica se l'utente corrente ha un profilo staff
2. **PARTE 2**: Verifica se l'appuntamento corrisponde al profilo corrente
3. **PARTE 3**: Verifica se l'utente corrente è lo staff dell'appuntamento
4. **PARTE 4**: Simula query diretta (dovrebbe funzionare)
5. **PARTE 5**: Verifica se l'appuntamento è per "oggi"

### Step 2: Verifica Console Browser

1. Apri la console del browser (F12)
2. Cerca log che iniziano con "Profile loaded successfully"
3. Cerca log che iniziano con "Appointments query result"
4. Verifica:
   - `profileId` è presente?
   - `count` è > 0?
   - `appointmentsLength` è > 0?

### Step 3: Interpreta Risultati

**Se PARTE 1 mostra "❌ NON È Staff"**:

- L'utente corrente non ha un ruolo staff
- Soluzione: Verifica il ruolo dell'utente in `profiles`

**Se PARTE 3 mostra "❌ L'utente corrente NON è lo staff dell'appuntamento"**:

- L'appuntamento appartiene a un altro staff
- Questo è corretto se l'utente non è lo staff dell'appuntamento
- Soluzione: Verifica che l'utente corrente sia lo staff dell'appuntamento

**Se PARTE 4 mostra "✅ Match - Dovrebbe essere visibile"**:

- La query diretta funziona
- L'appuntamento dovrebbe essere visibile
- Se non è visibile, potrebbe essere un problema di cache o di filtri client-side

**Se PARTE 5 mostra "🔵 È futuro" o "❌ È passato"**:

- L'appuntamento non è per "oggi"
- Verifica la data dell'appuntamento vs data corrente

---

## 🔧 FIX TEMPORANEO

Se l'utente corrente non è lo staff dell'appuntamento ma vuoi vedere tutti gli appuntamenti, puoi modificare la query per non filtrare per `staff_id`:

```typescript
// RIMUOVI questa riga:
.eq('staff_id', profileId)

// OPPURE cambia in:
.in('staff_id', [profileId, /* altri staff_id se necessario */])
```

**⚠️ ATTENZIONE**: Questo mostrerebbe appuntamenti di altri staff, che potrebbe non essere desiderato.

---

## ✅ VERIFICA FINALE

Dopo aver eseguito lo script SQL e verificato la console:

1. ✅ Verifica che `profileId` sia presente nei log
2. ✅ Verifica che `count` sia > 0
3. ✅ Verifica che `appointmentsLength` sia > 0
4. ✅ Verifica che l'appuntamento sia per "oggi"
5. ✅ Verifica che l'utente corrente sia lo staff dell'appuntamento

---

**Status**: ⚠️ **IN DIAGNOSTICA** - Eseguire script SQL e verificare console browser
