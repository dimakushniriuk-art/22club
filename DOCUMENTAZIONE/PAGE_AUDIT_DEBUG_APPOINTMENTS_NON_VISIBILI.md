# 🔍 DEBUG: Appuntamenti Non Visibili - Analisi Completa

**Data**: 2025-01-27  
**Problema**: Appuntamenti non visibili nella dashboard ("0 totali")

---

## ✅ MODIFICHE APPLICATE

### 1. Cache Disabilitata Temporaneamente

- ✅ Rimossa `unstable_cache` per vedere risultati in tempo reale
- ✅ Chiamata diretta a `getTodayAppointments()` senza cache

### 2. Logging Dettagliato Aggiunto

- ✅ Log calcolo date (`todayStart`, `todayEnd`)
- ✅ Log risultati query con dettagli errori (`errorCode`, `errorDetails`)
- ✅ Log appuntamenti con tutti i campi (`starts_at`, `ends_at`, `status`, `type`, `staff_id`, `athlete_id`)

---

## 🔍 PUNTI DA VERIFICARE

### 1. Console Browser

Apri la console del browser (F12) e cerca questi log:

```
[INFO] Date range calculation
  → todayStart, todayEnd, currentDate

[INFO] Profile loaded successfully
  → profileId, matches (deve essere "✅ Match")

[INFO] Executing getTodayAppointments (NO CACHE)
  → profileId, todayStart, todayEnd

[INFO] Appointments query completed
  → count, appointmentsLength, firstAppointment

[INFO] Appointments query result
  → count, appointmentsLength, appointments (array completo)
```

### 2. Verifica Database

Esegui questa query SQL per verificare se ci sono appuntamenti per oggi:

```sql
SELECT
  id,
  staff_id,
  athlete_id,
  starts_at,
  ends_at,
  type,
  status,
  cancelled_at
FROM appointments
WHERE staff_id = 'f6fdd6cb-c602-4ced-89a7-41a347e8faa9'
  AND starts_at >= CURRENT_DATE
  AND starts_at < CURRENT_DATE + INTERVAL '1 day'
  AND cancelled_at IS NULL
ORDER BY starts_at;
```

### 3. Possibili Cause

#### A. profileId Non Corrisponde

- **Sintomo**: Log mostra "❌ No Match"
- **Fix**: Verifica quale `profileId` viene trovato e perché non corrisponde

#### B. Query Non Trova Appuntamenti

- **Sintomo**: `count = 0` o `appointmentsLength = 0`
- **Fix**: Verifica:
  - `staff_id` nell'appuntamento corrisponde a `profileId`
  - `starts_at` è compreso tra `todayStart` e `todayEnd`
  - `cancelled_at IS NULL`

#### C. Appuntamenti Filtrati

- **Sintomo**: `count > 0` ma `appointmentsLength = 0` dopo filtri
- **Fix**: Verifica filtri client-side (status completato/cancellato)

#### D. Data Range Errato

- **Sintomo**: `todayStart` o `todayEnd` non corretti
- **Fix**: Verifica calcolo date (timezone, ore 0:00:00)

---

## 📋 CHECKLIST DEBUG

- [ ] Console browser mostra log "Date range calculation"
- [ ] Console browser mostra log "Profile loaded successfully" con "✅ Match"
- [ ] Console browser mostra log "Appointments query completed" con `count > 0`
- [ ] Console browser mostra log "Appointments query result" con `appointmentsLength > 0`
- [ ] Query SQL diretta trova appuntamenti per oggi
- [ ] `profileId` corrisponde a `staff_id` dell'appuntamento
- [ ] `starts_at` è compreso tra `todayStart` e `todayEnd`
- [ ] `cancelled_at IS NULL`
- [ ] `status` non è "completato" o "cancelled"

---

## 🚀 PROSSIMI STEP

1. **Ricarica la pagina** (hard refresh: Ctrl+Shift+R)
2. **Apri console browser** (F12)
3. **Cerca i log** sopra menzionati
4. **Condividi i log** per analisi approfondita

---

**Status**: ⚠️ **IN DEBUG** - Cache disabilitata, logging attivo
