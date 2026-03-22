# 📋 STEP 4 — PIANO RISOLUZIONE COMPLETO

**Data**: 2025-01-27  
**Basato su**: Audit STEP 1 + STEP 2 + STEP 3

---

## 🎯 OBIETTIVO

Roadmap ordinata per priorità con:

- Check-list completa (DB, FE, BE, RLS, test)
- Stima complessità per task (S/M/L)
- Stima rischio (Basso/Medio/Alto)
- Criteri di accettazione per ogni task

---

## 📊 PRIORITÀ TASK

### 🔴 PRIORITÀ ALTA (BLOCKER) - Risolvere immediatamente

- **P1**: Fix RLS Policies (DB)
- **P2**: Rimuovere permessi `anon` (DB)
- **P3**: Sostituire alert() nativi con Dialog accessibile (FE)

### 🟠 PRIORITÀ MEDIA (HIGH) - Risolvere presto

- **P4**: Aggiungere paginazione query dashboard (BE)
- **P5**: Spostare fetch agent log in client-side (FE)
- **P6**: Aggiungere gestione errori visibile (FE)
- **P7**: Allineare CHECK constraint type (DB)

### 🟡 PRIORITÀ BASSA (MED/LOW) - Miglioramenti

- **P8**: Aggiungere aria-label a bottoni icon-only (FE)
- **P9**: Migliorare empty state dashboard (FE)
- **P10**: Ottimizzare indicii query (DB)
- **P11**: Aggiungere caching query (BE)

---

## ✅ CHECK-LIST COMPLETA

### 🔴 P1: FIX RLS POLICIES (DB) - BLOCKER

**File**: `PAGE_AUDIT_STEP3_SQL_FIX.sql` (PARTE 3)  
**Complessità**: **M** (Media)  
**Rischio**: **Alto** (può bloccare accessi legittimi se non testato)

#### Task List:

- [ ] ✅ Creare funzioni helper (`get_current_staff_profile_id()`, `is_staff_appointments()`, `is_admin()`) - **FATTO in STEP 3**
- [ ] ✅ Rimuovere policies permissive esistenti - **FATTO in STEP 3**
- [ ] ✅ Creare policy SELECT restrittiva (`staff_id = get_current_staff_profile_id()`) - **FATTO in STEP 3**
- [ ] ✅ Creare policy INSERT restrittiva (solo staff può inserire come proprio `staff_id`) - **FATTO in STEP 3**
- [ ] ✅ Creare policy UPDATE restrittiva (solo staff può modificare propri appuntamenti) - **FATTO in STEP 3**
- [ ] ✅ Creare policy DELETE restrittiva (solo staff può eliminare propri appuntamenti) - **FATTO in STEP 3**
- [ ] ⏳ **ESEGUIRE** script `PAGE_AUDIT_STEP3_SQL_FIX.sql` su Supabase
- [ ] ⏳ **TESTARE** che staff veda solo i propri appuntamenti
- [ ] ⏳ **TESTARE** che admin veda tutti gli appuntamenti della propria org
- [ ] ⏳ **VERIFICARE** che query dashboard funzioni correttamente

#### Criteri di Accettazione:

- ✅ RLS è **ATTIVO** su `appointments`
- ✅ Policies hanno filtri `staff_id` o `is_admin()` (NON `USING(true)`)
- ✅ Staff vede solo i propri appuntamenti (test funzionale)
- ✅ Admin vede tutti gli appuntamenti della propria org (test funzionale)
- ✅ Nessun errore RLS in console browser
- ✅ Dashboard funziona correttamente

#### Rollback Plan:

- Eseguire PARTE 9 di `PAGE_AUDIT_STEP3_SQL_FIX.sql` (rollback completo)
- Ripristinare policy permissiva temporanea per testing

---

### 🔴 P2: RIMUOVERE PERMESSI 'anon' (DB) - BLOCKER

**File**: `PAGE_AUDIT_STEP3_SQL_FIX.sql` (PARTE 2)  
**Complessità**: **S** (Piccola)  
**Rischio**: **Basso** (anon non dovrebbe avere accesso)

#### Task List:

- [ ] ✅ Creare query REVOKE per `anon` - **FATTO in STEP 3**
- [ ] ⏳ **ESEGUIRE** PARTE 2 di `PAGE_AUDIT_STEP3_SQL_FIX.sql`
- [ ] ⏳ **VERIFICARE** che `anon` non abbia più permessi (PARTE 8 verifica)

#### Criteri di Accettazione:

- ✅ Ruolo `anon` **NON** ha permessi su `appointments`
- ✅ Verifica PARTE 8 mostra: `anon` non appare nei risultati

#### Rollback Plan:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO anon;
```

---

### 🔴 P3: SOSTITUIRE alert() NATIVI (FE) - BLOCKER

**File**: `src/app/dashboard/_components/agenda-client.tsx`  
**Complessità**: **M** (Media)  
**Rischio**: **Medio** (modifica UX, richiede testing)

#### Task List:

- [ ] ⏳ Installare/verificare componente Dialog accessibile (shadcn/ui `Dialog`)
- [ ] ⏳ Creare componente `ConfirmDialog` riusabile
- [ ] ⏳ Sostituire `alert()` in `handleDeleteAppointment` (linea 89)
- [ ] ⏳ Sostituire `confirm()` in `handleDeleteAppointment` (linea 95)
- [ ] ⏳ Sostituire `alert()` in `handleCompleteAppointment` (linea 120)
- [ ] ⏳ Sostituire `confirm()` in `AgendaTimeline` (linea 95, 133)
- [ ] ⏳ **TESTARE** che dialog sia accessibile (screen reader, keyboard navigation)
- [ ] ⏳ **TESTARE** che UX sia migliorata (feedback visivo, cancellazione, ecc.)

#### Criteri di Accettazione:

- ✅ Nessun `alert()` o `confirm()` nativo rimasto
- ✅ Dialog accessibile (WCAG AA):
  - ✅ Focus management corretto
  - ✅ `aria-label` e `aria-describedby` presenti
  - ✅ Keyboard navigation funzionante (ESC per chiudere, Tab per navigare)
  - ✅ Screen reader friendly
- ✅ UX migliorata (design coerente, feedback visivo)
- ✅ Test manuale con screen reader (opzionale ma consigliato)

#### File da Modificare:

1. `src/app/dashboard/_components/agenda-client.tsx` (linee 82-101, 103-136)
2. `src/components/dashboard/agenda-timeline.tsx` (linee 93-99, 131-137)
3. Creare `src/components/shared/ui/confirm-dialog.tsx` (nuovo componente)

#### Codice Esempio:

```tsx
// Nuovo componente ConfirmDialog
<ConfirmDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  title="Elimina appuntamento"
  description="Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata."
  onConfirm={() => handleDeleteAppointment(eventId)}
  confirmText="Elimina"
  cancelText="Annulla"
  variant="destructive"
/>
```

---

### 🟠 P4: AGGIUNGERE PAGINAZIONE QUERY (BE)

**File**: `src/app/dashboard/page.tsx`  
**Complessità**: **M** (Media)  
**Rischio**: **Medio** (modifica query, richiede testing)

#### Task List:

- [ ] ⏳ Aggiungere `.limit(50)` alla query appointments (linea 109-126)
- [ ] ⏳ Aggiungere `.range(0, 49)` per paginazione Supabase (opzionale)
- [ ] ⏳ Gestire caso > 50 appuntamenti oggi (mostrare warning o "mostra tutti")
- [ ] ⏳ **TESTARE** con 0, 10, 50, 100+ appuntamenti oggi
- [ ] ⏳ **MONITORARE** performance query (EXPLAIN)

#### Criteri di Accettazione:

- ✅ Query limitata a 50 risultati (o configurabile)
- ✅ Nessun errore con molti appuntamenti
- ✅ Performance migliorata (tempo query < 500ms)
- ✅ UX: Mostrare messaggio se > 50 appuntamenti ("Mostrando i primi 50 di X")

#### Codice Esempio:

```typescript
const { data: todayAppointments, error } = await supabase
  .from('appointments')
  .select(...)
  .eq('staff_id', profileData.id)
  .gte('starts_at', todayStart)
  .lt('starts_at', todayEnd)
  .is('cancelled_at', null)
  .order('starts_at', { ascending: true })
  .limit(50);  // AGGIUNTO
```

---

### 🟠 P5: SPOSTARE FETCH AGENT LOG (FE)

**File**: `src/app/dashboard/page.tsx`  
**Complessità**: **S** (Piccola)  
**Rischio**: **Basso** (solo rimozione log, non funzionale)

#### Task List:

- [ ] ⏳ Spostare fetch agent log (linee 57-71) in client-side (`useEffect`)
- [ ] ⏳ Oppure: Rimuovere completamente se non necessario
- [ ] ⏳ **VERIFICARE** che non blocchi render server-side
- [ ] ⏳ **TESTARE** che dashboard funzioni correttamente

#### Criteri di Accettazione:

- ✅ Nessun fetch in Server Component (o in client-side async)
- ✅ Render server-side non bloccato
- ✅ TTFB migliorato (< 200ms)

#### Codice Esempio:

```typescript
// Opzione 1: Rimuovere (se non necessario)
// Opzione 2: Spostare in client-side
'use client'
useEffect(() => {
  fetch('http://127.0.0.1:7242/ingest/...', { method: 'POST', ... })
    .catch(() => {})
}, []);
```

---

### 🟠 P6: AGGIUNGERE GESTIONE ERRORI VISIBILE (FE)

**File**: `src/app/dashboard/page.tsx`  
**Complessità**: **M** (Media)  
**Rischio**: **Medio** (modifica UX, richiede componente toast)

#### Task List:

- [ ] ⏳ Installare/verificare componente Toast (shadcn/ui `Toast` o esistente)
- [ ] ⏳ Sostituire `logger.error()` silenzioso con toast visibile (linea 269)
- [ ] ⏳ Gestire caso `profileData` null (mostrare errore)
- [ ] ⏳ Gestire caso query error (mostrare errore)
- [ ] ⏳ **TESTARE** con errori simulati
- [ ] ⏳ **TESTARE** che utente veda feedback chiaro

#### Criteri di Accettazione:

- ✅ Errori critici mostrano toast visibile
- ✅ Utente capisce cosa è andato storto
- ✅ Nessun errore silenzioso (`logger.error()` senza feedback utente)

#### Codice Esempio:

```typescript
catch (error) {
  logger.error('Error loading today appointments', error)
  toast.error('Errore nel caricamento appuntamenti', {
    description: error instanceof Error ? error.message : 'Errore sconosciuto'
  })
  // agendaData rimane vuoto
}
```

---

### 🟠 P7: ALLINEARE CHECK CONSTRAINT TYPE (DB)

**File**: `PAGE_AUDIT_STEP3_SQL_FIX.sql` (PARTE 4)  
**Complessità**: **S** (Piccola)  
**Rischio**: **Medio** (può fallire se dati non validi)

#### Task List:

- [ ] ⏳ **ESEGUIRE** PARTE 4 di `PAGE_AUDIT_STEP3_SQL_FIX.sql`
- [ ] ⏳ **VERIFICARE** che constraint sia allineato (PARTE 8 verifica)
- [ ] ⏳ Se fallisce: Eseguire cleanup dati (PARTE 7)
- [ ] ⏳ **TESTARE** inserimento appuntamento con tutti i tipi supportati

#### Criteri di Accettazione:

- ✅ CHECK constraint include tutti i tipi: `('allenamento', 'prova', 'valutazione', 'cardio', 'check', 'consulenza', 'prima_visita', 'riunione', 'massaggio', 'nutrizionista')`
- ✅ Inserimento con tutti i tipi funziona
- ✅ Verifica PARTE 8 mostra: `✅ ALLINEATO`

#### Rollback Plan:

```sql
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_type_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_type_check
CHECK (type IN ('allenamento', 'prova', 'valutazione'));
```

---

### 🟡 P8: AGGIUNGERE aria-label A BOTTONI (FE)

**File**: `src/components/dashboard/agenda-timeline.tsx`  
**Complessità**: **S** (Piccola)  
**Rischio**: **Basso** (solo aggiunta attributi)

#### Task List:

- [ ] ⏳ Verificare bottoni senza `aria-label` (linee 496-588)
- [ ] ⏳ Aggiungere `aria-label` a tutti i bottoni icon-only
- [ ] ⏳ **TESTARE** con screen reader (opzionale)

#### Criteri di Accettazione:

- ✅ Tutti i bottoni icon-only hanno `aria-label` descrittivo
- ✅ `aria-label` è chiaro e descrittivo (es: "Elimina appuntamento con Mario Rossi")

---

### 🟡 P9: MIGLIORARE EMPTY STATE (FE)

**File**: `src/components/dashboard/agenda-timeline.tsx`  
**Complessità**: **S** (Piccola)  
**Rischio**: **Basso** (solo UI, non funzionale)

#### Task List:

- [ ] ⏳ Aggiungere link "Visualizza calendario completo" (linea 320-345)
- [ ] ⏳ Aggiungere suggerimenti ("Crea primo appuntamento", "Cerca appuntamenti passati")
- [ ] ⏳ **TESTARE** UX empty state migliorata

#### Criteri di Accettazione:

- ✅ Empty state ha CTA chiari (link a calendario, crea appuntamento)
- ✅ UX migliorata (utente sa cosa fare)

---

### 🟡 P10: OTTIMIZZARE INDICII (DB)

**File**: `PAGE_AUDIT_STEP3_SQL_FIX.sql` (PARTE 5)  
**Complessità**: **S** (Piccola)  
**Rischio**: **Basso** (solo aggiunta indicii)

#### Task List:

- [ ] ✅ Creare indicii ottimizzati - **FATTO in STEP 3**
- [ ] ⏳ **ESEGUIRE** PARTE 5 di `PAGE_AUDIT_STEP3_SQL_FIX.sql`
- [ ] ⏳ **VERIFICARE** che indicii esistano (PARTE 8 verifica)
- [ ] ⏳ **MONITORARE** performance query (EXPLAIN)

#### Criteri di Accettazione:

- ✅ Indicii creati: `idx_appointments_dashboard_query`, `idx_appointments_org_id`, `idx_appointments_status`
- ✅ Query usa `Index Scan` invece di `Seq Scan` (EXPLAIN)
- ✅ Performance migliorata (tempo query < 200ms)

---

### 🟡 P11: AGGIUNGERE CACHING (BE)

**File**: `src/app/dashboard/page.tsx`  
**Complessità**: **M** (Media)  
**Rischio**: **Medio** (cache può causare dati stale)

#### Task List:

- [ ] ⏳ Aggiungere Next.js `revalidate` per cache (opzionale)
- [ ] ⏳ Oppure: Usare React Query o SWR per cache client-side
- [ ] ⏳ **TESTARE** che cache funzioni correttamente
- [ ] ⏳ **TESTARE** che dati siano aggiornati (invalidate cache)

#### Criteri di Accettazione:

- ✅ Cache riduce query ripetute al DB
- ✅ Dati sono aggiornati (cache invalidata correttamente)
- ✅ Performance migliorata (meno query DB)

---

## 📊 SUMMARY TABELLA TASK

| Priorità | Task                       | Tipo | Complessità | Rischio | Status         |
| -------- | -------------------------- | ---- | ----------- | ------- | -------------- |
| P1       | Fix RLS Policies           | DB   | M           | Alto    | ⏳ Da eseguire |
| P2       | Rimuovere permessi anon    | DB   | S           | Basso   | ⏳ Da eseguire |
| P3       | Sostituire alert()         | FE   | M           | Medio   | ⏳ Da fare     |
| P4       | Aggiungere paginazione     | BE   | M           | Medio   | ⏳ Da fare     |
| P5       | Spostare fetch log         | FE   | S           | Basso   | ⏳ Da fare     |
| P6       | Gestione errori visibile   | FE   | M           | Medio   | ⏳ Da fare     |
| P7       | Allineare CHECK constraint | DB   | S           | Medio   | ⏳ Da eseguire |
| P8       | Aggiungere aria-label      | FE   | S           | Basso   | ⏳ Da fare     |
| P9       | Migliorare empty state     | FE   | S           | Basso   | ⏳ Da fare     |
| P10      | Ottimizzare indicii        | DB   | S           | Basso   | ⏳ Da eseguire |
| P11      | Aggiungere caching         | BE   | M           | Medio   | ⏳ Da fare     |

**Legenda**:

- ✅ = Completato
- ⏳ = Da fare/da eseguire
- ❌ = Bloccato/errore

---

## 🚀 ORDINE DI ESECUZIONE CONSIGLIATO

### Fase 1: Database (Critico) - **ESEGUIRE PRIMA**

1. **P2**: Rimuovere permessi `anon` (5 min, basso rischio)
2. **P1**: Fix RLS Policies (10 min, alto rischio - testare subito dopo)
3. **P7**: Allineare CHECK constraint (5 min, medio rischio)
4. **P10**: Ottimizzare indicii (5 min, basso rischio)

**Totale Fase 1**: ~25 minuti

### Fase 2: Frontend Critico - **ESEGUIRE DOPO FASE 1**

5. **P3**: Sostituire alert() (30 min, medio rischio)
6. **P6**: Gestione errori visibile (20 min, medio rischio)

**Totale Fase 2**: ~50 minuti

### Fase 3: Backend/Performance - **ESEGUIRE DOPO FASE 2**

7. **P4**: Aggiungere paginazione (30 min, medio rischio)
8. **P5**: Spostare fetch log (10 min, basso rischio)
9. **P11**: Aggiungere caching (opzionale, 30 min, medio rischio)

**Totale Fase 3**: ~70 minuti

### Fase 4: Miglioramenti UX/Accessibilità - **OPZIONALE**

10. **P8**: Aggiungere aria-label (15 min, basso rischio)
11. **P9**: Migliorare empty state (15 min, basso rischio)

**Totale Fase 4**: ~30 minuti

**TOTALE COMPLESSIVO**: ~175 minuti (~3 ore) per completare tutto

---

## ✅ CRITERI DI ACCETTAZIONE GLOBALI

### Fix Completato con Successo se:

- ✅ Tutti i task P1-P7 completati (fasi 1-2)
- ✅ Nessun errore RLS in console browser
- ✅ Dashboard funziona correttamente (test funzionale)
- ✅ Staff vede solo i propri appuntamenti (test funzionale)
- ✅ Admin vede tutti gli appuntamenti della propria org (test funzionale)
- ✅ Nessun `alert()` o `confirm()` nativo rimasto (test accessibilità)
- ✅ Performance query migliorata (EXPLAIN mostra Index Scan)
- ✅ Test manuale completato senza errori critici

---

## 🔗 PROSSIMI STEP

**STEP 5**: Rianalisi profonda dopo fix  
**STEP 6**: Implementazione finale + report completo `PAGE_AUDIT_REPORT.md`

---

**Stato**: ✅ STEP 4 COMPLETATO  
**Prossimo**: Eseguire Fase 1 (Database) e procedere con STEP 5
