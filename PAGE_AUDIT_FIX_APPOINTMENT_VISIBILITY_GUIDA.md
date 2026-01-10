# 🔧 FIX APPOINTMENT VISIBILITY - Guida Diagnostica
**Data**: 2025-01-27  
**Problema**: Appuntamento di oggi esiste ma non viene visualizzato

---

## 🚨 PROBLEMA IDENTIFICATO

Dalla query SQL risulta:
- **Appuntamento esiste**: ✅ Sì (ID: `4ff9a99d-7638-412e-9607-6b9c07a629d5`)
- **Data corretta**: ✅ Sì (2026-01-09, è oggi)
- **Status**: ✅ `attivo` (non completato/cancellato)
- **Staff dell'appuntamento**: Francesco Bernotto (trainer, `staff_user_id = be43f62f-b94a-4e4d-85d0-aed6fe4e595a`)
- **Utente corrente**: `null` (quando esegui query SQL direttamente, non sei autenticato)

---

## 🔍 DIAGNOSTICA NECESSARIA

### ⚠️ IMPORTANTE
Quando esegui query SQL direttamente in Supabase SQL Editor, `auth.uid()` è `NULL` perché non sei autenticato come utente dell'applicazione. Questo è normale e non rappresenta il problema reale.

**Il problema reale si verifica quando l'applicazione esegue la query con l'utente autenticato.**

---

## 📋 ISTRUZIONI DIAGNOSTICA

### Step 1: Verifica Console Browser
1. Apri la console del browser (F12 → Console)
2. Ricarica la pagina dashboard
3. Cerca log che iniziano con:
   - **"Profile loaded successfully"** → Mostra `profileId` e `role`
   - **"Appointments query result"** → Mostra `count`, `appointmentsLength`, e lista `appointments`
   - **"Agenda candidates processed"** → Mostra `total`, `totalFromQuery`, `filteredOut`

### Step 2: Interpreta Risultati

**Se "Profile loaded successfully" mostra `profileId`**:
- ✅ Il profilo è stato trovato
- Verifica se `profileId` corrisponde a `f6fdd6cb-c602-4ced-89a7-41a347e8faa9` (staff_id dell'appuntamento)

**Se "Appointments query result" mostra `count = 0`**:
- ❌ La query non trova appuntamenti
- Possibili cause:
  - `profileId` non corrisponde a `staff_id` dell'appuntamento
  - La data non corrisponde (timezone issues)
  - Filtri SQL escludono l'appuntamento

**Se "Appointments query result" mostra `count > 0` ma `appointmentsLength = 0`**:
- ✅ La query trova appuntamenti
- ❌ Ma vengono filtrati dal codice TypeScript
- Verifica log "Agenda candidates processed" per vedere `filteredOut`

**Se "Agenda candidates processed" mostra `filteredOut > 0`**:
- ✅ Appuntamenti trovati ma filtrati
- Verifica log "Excluding" per vedere perché vengono esclusi

---

## 🔧 POSSIBILI CAUSE E SOLUZIONI

### Causa 1: Utente Corrente Non È lo Staff dell'Appuntamento
**Sintomo**: `profileId` ≠ `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`

**Soluzione**:
- Se l'utente corrente DOVREBBE essere Francesco Bernotto:
  - Verifica che stai accedendo con l'account corretto
  - Verifica che il profilo in `profiles` abbia `user_id` corretto
- Se l'utente corrente NON è Francesco Bernotto:
  - Questo è corretto: l'appuntamento non dovrebbe essere visibile
  - Accedi con l'account di Francesco Bernotto per vedere l'appuntamento

### Causa 2: Problema Timezone
**Sintomo**: `todayStart`/`todayEnd` non corrispondono alla data dell'appuntamento

**Soluzione**: Verifica che `todayStart` e `todayEnd` siano corretti nei log

### Causa 3: Filtri Client-Side Escludono Appuntamento
**Sintomo**: `count > 0` ma `appointmentsLength = 0`

**Soluzione**: Verifica log "Excluding" per vedere perché viene escluso

---

## ✅ VERIFICA RAPIDA

Esegui questa query in Supabase SQL Editor **dopo aver fatto login nell'applicazione** (non funziona se non sei autenticato):

```sql
-- Verifica profilo utente corrente (dall'applicazione)
SELECT 
  p.id as profile_id,
  p.user_id,
  p.role,
  p.nome,
  p.cognome,
  'f6fdd6cb-c602-4ced-89a7-41a347e8faa9' as appointment_staff_id,
  CASE 
    WHEN p.id = 'f6fdd6cb-c602-4ced-89a7-41a347e8faa9' THEN '✅ Match - Appuntamento dovrebbe essere visibile'
    ELSE '❌ No Match - Appuntamento NON visibile (appartiene a altro staff)'
  END as match_status
FROM profiles p
WHERE p.user_id = auth.uid()
  AND p.role IN ('admin', 'pt', 'trainer', 'staff', 'nutrizionista', 'massaggiatore');
```

**⚠️ NOTA**: Questa query funziona solo se eseguita dall'applicazione (non dal SQL Editor direttamente).

---

## 📝 PROSSIMI PASSI

1. ✅ Ricarica la pagina dashboard
2. ✅ Controlla console browser per log dettagliati
3. ✅ Condividi i log:
   - "Profile loaded successfully" → `profileId` e `role`
   - "Appointments query result" → `count`, `appointmentsLength`, `appointments`
   - "Agenda candidates processed" → `total`, `filteredOut`

Questo ci dirà esattamente dove si perde l'appuntamento nel processo.

---

**Status**: ⚠️ **IN DIAGNOSTICA** - Verificare console browser e log
