# 🔧 FIX APPOINTMENT VISIBILITY - Guida Finale
**Data**: 2025-01-27  
**Problema**: Trainer ha inserito appuntamento ma non lo vede nella dashboard

---

## 🎯 REQUISITI

**Appuntamento deve essere visibile a**:
1. ✅ **Staff che ha inserito l'appuntamento** (`staff_id` = profileId dello staff)
2. ✅ **Atleta interessato** (`athlete_id` = profileId dell'atleta)

**Staff =** admin, pt, trainer, staff, nutrizionista, massaggiatore  
**Atleti =** tutti gli altri profili

---

## 🔍 PROBLEMA IDENTIFICATO

Dalla query SQL:
- **Appuntamento esiste**: ✅ Sì (ID: `4ff9a99d-7638-412e-9607-6b9c07a629d5`)
- **Data corretta**: ✅ Sì (2026-01-09, è oggi)
- **Status**: ✅ `attivo` (non completato/cancellato)
- **Staff dell'appuntamento**: Francesco Bernotto (trainer, `staff_id = f6fdd6cb-c602-4ced-89a7-41a347e8faa9`)

**Problema**: Il `profileId` trovato dalla query diretta potrebbe non corrispondere a `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`.

---

## ✅ SOLUZIONI IMPLEMENTATE

### 1. Logging Dettagliato
- ✅ Log `profileId` quando viene caricato il profilo
- ✅ Log `staff_id` e `athlete_id` per ogni appuntamento trovato
- ✅ Log `count` e `appointmentsLength` per verificare se la query trova appuntamenti

### 2. Script SQL di Debug
- ✅ `PAGE_AUDIT_DEBUG_STAFF_ID_MATCH.sql` - Verifica staff_id mismatch

---

## 📋 ISTRUZIONI DIAGNOSTICA

### Step 1: Verifica Console Browser
1. Apri la console del browser (F12 → Console)
2. Ricarica la pagina dashboard
3. Cerca log che iniziano con:
   - **"Profile loaded successfully"** → Mostra `profileId` e `role`
   - **"Appointments query result"** → Mostra `count`, `appointmentsLength`, e lista `appointments` con `staff_id`

### Step 2: Verifica Match
**Se "Profile loaded successfully" mostra `profileId`**:
- Verifica se `profileId` = `f6fdd6cb-c602-4ced-89a7-41a347e8faa9` (staff_id dell'appuntamento)
- Se **NO** → Il problema è che la query diretta trova un profilo diverso
- Se **SÌ** → Il problema è altrove (verifica `count` e `appointmentsLength`)

**Se "Appointments query result" mostra `count = 0`**:
- ❌ La query non trova appuntamenti
- Verifica che `profileId` corrisponda a `staff_id` dell'appuntamento
- Verifica che la data corrisponda (timezone issues)

**Se "Appointments query result" mostra `count > 0` ma `appointmentsLength = 0`**:
- ✅ La query trova appuntamenti
- ❌ Ma vengono filtrati dal codice TypeScript
- Verifica log "Agenda candidates processed" per vedere `filteredOut`

### Step 3: Esegui Script SQL
Esegui `PAGE_AUDIT_DEBUG_STAFF_ID_MATCH.sql` in Supabase SQL Editor.

**Query Importanti**:
- **PARTE 2**: Mostra tutti i profili staff disponibili
- **PARTE 4**: Mostra per ogni staff se l'appuntamento è visibile
- **PARTE 5**: Simula query esatta dashboard per un staff specifico

---

## 🔧 POSSIBILI CAUSE

### Causa 1: profileId Non Corrisponde a staff_id
**Sintomo**: `profileId` ≠ `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`

**Possibili ragioni**:
- L'utente corrente ha più profili (uno staff e uno atleta?)
- La query diretta trova il profilo sbagliato
- Il profilo staff non esiste o ha ruolo diverso

**Soluzione**: Verifica che la query diretta trovi il profilo corretto

### Causa 2: Problema Timezone
**Sintomo**: Data non corrisponde

**Soluzione**: Verifica che `todayStart` e `todayEnd` siano corretti

### Causa 3: Filtri Client-Side
**Sintomo**: `count > 0` ma `appointmentsLength = 0`

**Soluzione**: Verifica log "Excluding" per vedere perché viene escluso

---

## ✅ VERIFICA RAPIDA

**Query per verificare se l'utente corrente è lo staff dell'appuntamento**:

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
   - "Appointments query result" → `count`, `appointmentsLength`, `appointments` (con `staff_id`)
   - "Agenda candidates processed" → `total`, `filteredOut`

Questo ci dirà esattamente dove si perde l'appuntamento nel processo.

---

**Status**: ⚠️ **IN DIAGNOSTICA** - Verificare console browser e log
