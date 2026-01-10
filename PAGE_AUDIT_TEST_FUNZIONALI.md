# 🧪 TEST FUNZIONALI - Dashboard Audit
**Data**: 2025-01-27  
**Status**: 📋 **GUIDA TEST MANUALE**

---

## 📋 OVERVIEW

Questa guida fornisce una checklist completa per testare manualmente tutti i fix implementati durante l'audit della dashboard.

**Obiettivo**: Verificare che tutti i problemi critici, alti e medi siano stati risolti correttamente.

---

## ✅ TEST DATABASE (RLS, Permessi, Indicii)

### Test 1: Verifica RLS Policies ✅
**Obiettivo**: Verificare che ogni utente veda solo i propri appuntamenti

**Setup**:
1. Crea 3 utenti di test:
   - Staff A (staff_id: `staff-a-id`)
   - Staff B (staff_id: `staff-b-id`)
   - Admin (role: `admin`, org_id: `org-1`)

2. Crea appuntamenti:
   - 2 appuntamenti per Staff A
   - 2 appuntamenti per Staff B
   - 1 appuntamento per Admin (org_id: `org-1`)

**Test**:
- [ ] Login come Staff A → Deve vedere solo i 2 appuntamenti di Staff A
- [ ] Login come Staff B → Deve vedere solo i 2 appuntamenti di Staff B
- [ ] Login come Admin → Deve vedere tutti gli appuntamenti della propria org (org_id: `org-1`)

**Risultato Atteso**: ✅ Ogni utente vede solo i propri appuntamenti

---

### Test 2: Verifica Permessi `anon` ✅
**Obiettivo**: Verificare che ruolo `anon` NON abbia permessi

**Test**:
- [ ] Esegui query SQL come `anon`:
  ```sql
  SET ROLE anon;
  SELECT * FROM appointments;
  ```
- [ ] Verifica che la query fallisca con errore di permesso

**Risultato Atteso**: ✅ `anon` NON può accedere a `appointments`

---

### Test 3: Verifica Indicii ✅
**Obiettivo**: Verificare che gli indicii siano creati e utilizzati

**Test**:
- [ ] Esegui `EXPLAIN ANALYZE` sulla query dashboard:
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM appointments
  WHERE staff_id = '...' 
    AND starts_at >= '...' 
    AND starts_at < '...'
    AND cancelled_at IS NULL
  ORDER BY starts_at ASC
  LIMIT 50;
  ```
- [ ] Verifica che usi `idx_appointments_dashboard_query`

**Risultato Atteso**: ✅ Query usa indicii (Index Scan o Index Only Scan)

---

## ✅ TEST FRONTEND/BACKEND

### Test 4: Verifica Dialog Accessibile ✅
**Obiettivo**: Verificare che `alert()` e `confirm()` siano sostituiti con Dialog accessibile

**Test**:
- [ ] Elimina un appuntamento → Deve apparire `ConfirmDialog` (non `confirm()` nativo)
- [ ] Completa un appuntamento → Deve apparire `ConfirmDialog` (non `confirm()` nativo)
- [ ] Verifica errori → Deve apparire toast (non `alert()` nativo)

**Risultato Atteso**: ✅ Nessun `alert()` o `confirm()` nativo, solo Dialog e toast

---

### Test 5: Verifica Keyboard Navigation (Dialog) ✅
**Obiettivo**: Verificare che Dialog sia navigabile con tastiera

**Test**:
- [ ] Apri `ConfirmDialog` (elimina appuntamento)
- [ ] Verifica che focus sia sul bottone "Annulla" (primo elemento)
- [ ] Premi `Tab` → Focus va a "Elimina"
- [ ] Premi `Shift+Tab` → Focus torna a "Annulla" (focus trap)
- [ ] Premi `ESC` → Dialog si chiude
- [ ] Premi `Enter` su "Annulla" → Dialog si chiude
- [ ] Premi `Enter` su "Elimina" → Conferma eliminazione

**Risultato Atteso**: ✅ Focus trap funzionante, ESC chiude, Tab naviga correttamente

---

### Test 6: Verifica Screen Reader (Dialog) ✅
**Obiettivo**: Verificare che Dialog sia accessibile con screen reader

**Test**:
- [ ] Attiva screen reader (NVDA/JAWS su Windows, VoiceOver su Mac)
- [ ] Apri `ConfirmDialog`
- [ ] Verifica che screen reader annunci:
  - Titolo: "Elimina appuntamento"
  - Descrizione: "Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata."
  - Bottoni: "Annulla", "Elimina"

**Risultato Atteso**: ✅ Screen reader annuncia correttamente titolo, descrizione e bottoni

---

### Test 7: Verifica Paginazione Query ✅
**Obiettivo**: Verificare che query sia limitata a 50 risultati

**Test**:
- [ ] Crea 60+ appuntamenti per oggi
- [ ] Login come staff
- [ ] Verifica che dashboard mostri:
  - Warning: "⚠️ Mostrando i primi 50 appuntamenti di 60 totali oggi"
  - Solo 50 appuntamenti visibili

**Risultato Atteso**: ✅ Warning visibile, solo 50 appuntamenti mostrati

---

### Test 8: Verifica Fetch Non Bloccante ✅
**Obiettivo**: Verificare che fetch log non blocchi render

**Test**:
- [ ] Apri DevTools → Network tab
- [ ] Ricarica dashboard
- [ ] Verifica che:
  - TTFB (Time To First Byte) < 200ms
  - Fetch agent log (`http://127.0.0.1:7242/...`) non blocca render
  - Fetch ha timeout 2s

**Risultato Atteso**: ✅ TTFB < 200ms, fetch non blocca render

---

### Test 9: Verifica Gestione Errori Visibile ✅
**Obiettivo**: Verificare che errori critici mostrino toast visibile

**Test**:
- [ ] Simula errore (es. disconnetti database temporaneamente)
- [ ] Ricarica dashboard
- [ ] Verifica che appaia toast errore:
  - Titolo: "Errore caricamento appuntamenti"
  - Messaggio descrittivo
  - Variante: `error` (rosso)

**Risultato Atteso**: ✅ Toast errore visibile con messaggio chiaro

---

### Test 10: Verifica Empty State ✅
**Obiettivo**: Verificare che empty state abbia CTA chiari

**Test**:
- [ ] Login come staff senza appuntamenti oggi
- [ ] Verifica che empty state mostri:
  - Messaggio: "Nessun appuntamento oggi"
  - Bottone: "Nuovo Appuntamento"
  - Bottone: "Calendario Completo"
- [ ] Clicca "Calendario Completo" → Deve navigare a `/dashboard/appuntamenti`

**Risultato Atteso**: ✅ Empty state ha 2 CTA funzionanti

---

### Test 11: Verifica aria-label Bottoni ✅
**Obiettivo**: Verificare che tutti i bottoni icon-only abbiano `aria-label`

**Test**:
- [ ] Apri DevTools → Elements
- [ ] Verifica che bottoni icon-only abbiano `aria-label`:
  - Bottone elimina: `aria-label="Elimina appuntamento con [nome]"`
  - Bottone modifica: `aria-label="Modifica appuntamento con [nome]"`
  - Bottone profilo: `aria-label="Visualizza profilo di [nome]"`
  - Bottone schede: `aria-label="Visualizza schede di allenamento di [nome]"`

**Risultato Atteso**: ✅ Tutti i bottoni icon-only hanno `aria-label` descrittivi

---

## ✅ TEST PERFORMANCE

### Test 12: Verifica Performance Query ✅
**Obiettivo**: Verificare che query con limit funzioni correttamente

**Test**:
- [ ] Apri DevTools → Network tab
- [ ] Ricarica dashboard
- [ ] Verifica che:
  - Query appointments abbia tempo < 500ms
  - Query usi indicii (verifica con `EXPLAIN ANALYZE`)

**Risultato Atteso**: ✅ Query < 500ms, usa indicii

---

### Test 13: Verifica Caching Query ✅
**Obiettivo**: Verificare che caching funzioni correttamente

**Test**:
- [ ] Ricarica dashboard (prima richiesta)
- [ ] Nota tempo query (es. 200ms)
- [ ] Ricarica dashboard entro 30s (seconda richiesta)
- [ ] Verifica che tempo query sia < 50ms (cache hit)

**Risultato Atteso**: ✅ Cache hit dopo prima richiesta (tempo < 50ms)

---

## ✅ TEST ACCESSIBILITÀ COMPLETA

### Test 14: Verifica Keyboard Navigation Completa ✅
**Obiettivo**: Verificare che tutta la dashboard sia navigabile con tastiera

**Test**:
- [ ] Naviga dashboard usando solo `Tab` e `Shift+Tab`
- [ ] Verifica che:
  - Focus sia visibile (outline/border)
  - Tutti i bottoni siano raggiungibili
  - `Enter` attivi bottoni
  - `ESC` chiuda modali/dialog

**Risultato Atteso**: ✅ Tutta la dashboard navigabile con tastiera

---

### Test 15: Verifica Screen Reader Completo ✅
**Obiettivo**: Verificare che tutta la dashboard sia accessibile con screen reader

**Test**:
- [ ] Attiva screen reader
- [ ] Naviga dashboard
- [ ] Verifica che:
  - Tutti i bottoni siano annunciati correttamente
  - Tutti i link abbiano testo descrittivo
  - Tutti i form abbiano label associati
  - Tutti i dialog abbiano titolo e descrizione

**Risultato Atteso**: ✅ Dashboard completamente accessibile con screen reader

---

## ✅ TEST INTEGRAZIONE

### Test 16: Verifica Login Staff/Admin/Atleta ✅
**Obiettivo**: Verificare che ogni ruolo veda solo i propri dati

**Test**:
- [ ] Login come Staff → Verifica dashboard mostra solo appuntamenti staff
- [ ] Login come Admin → Verifica dashboard mostra tutti gli appuntamenti org
- [ ] Login come Atleta → Verifica dashboard mostra solo appuntamenti atleta

**Risultato Atteso**: ✅ Ogni ruolo vede solo i propri dati (RLS funzionante)

---

## 📊 CHECKLIST COMPLETA

### Database:
- [ ] Test 1: RLS Policies corrette
- [ ] Test 2: Permessi `anon` rimossi
- [ ] Test 3: Indicii creati e utilizzati

### Frontend/Backend:
- [ ] Test 4: Dialog accessibile (no alert/confirm nativi)
- [ ] Test 5: Keyboard navigation (Dialog)
- [ ] Test 6: Screen reader (Dialog)
- [ ] Test 7: Paginazione query
- [ ] Test 8: Fetch non bloccante
- [ ] Test 9: Gestione errori visibile
- [ ] Test 10: Empty state con CTA
- [ ] Test 11: aria-label bottoni

### Performance:
- [ ] Test 12: Performance query
- [ ] Test 13: Caching query

### Accessibilità:
- [ ] Test 14: Keyboard navigation completa
- [ ] Test 15: Screen reader completo

### Integrazione:
- [ ] Test 16: Login Staff/Admin/Atleta

---

## 🎯 CRITERI DI ACCETTAZIONE

### Tutti i test devono passare:
- ✅ **Database**: RLS corretto, permessi corretti, indicii funzionanti
- ✅ **Frontend**: Dialog accessibile, keyboard navigation, screen reader
- ✅ **Performance**: Query < 500ms, caching funzionante
- ✅ **UX**: Errori visibili, empty state con CTA, aria-label presenti

---

## 📝 NOTE

### Test Manuali vs Automatizzati:
- Questa guida è per **test manuali**
- Per test automatizzati, considera:
  - Playwright per E2E tests
  - Jest + React Testing Library per unit tests
  - Lighthouse CI per accessibilità

### Ambiente di Test:
- Usa ambiente di sviluppo/staging
- Crea utenti di test dedicati
- Non testare su produzione

---

**Fine Guida Test Funzionali**
