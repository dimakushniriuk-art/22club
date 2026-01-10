# 📋 Checklist Test Manuale - Sistema Calendario e Appuntamenti

**Data**: 2025-01-30  
**Versione**: Post-Fix P1-015, P1-016, P4-015, P4-016, P4-017, P4-018  
**Stato**: ✅ Tutti i problemi critici risolti

---

## 🔧 Setup Pre-Test

### Prerequisiti

- [ ] Progetto avviato: `npm run dev`
- [ ] Autenticazione completata come Personal Trainer
- [ ] Database Supabase configurato e accessibile
- [ ] Almeno 1 atleta presente nel sistema
- [ ] Browser console aperta (F12) per verificare errori

### Verifiche Iniziali

- [ ] Rota `/dashboard/calendario` accessibile
- [ ] Calendario si carica senza errori in console
- [ ] Vista mese/settimana/giorno funzionanti
- [ ] Nessun errore di TypeScript/ESLint

---

## ✅ Test 1: Creazione Appuntamento Singolo

### 1.1 Test Base - Appuntamento Tipo "allenamento"

- [ ] Cliccare su un slot temporale nel calendario (o bottone "Nuovo Appuntamento")
- [ ] Form si apre correttamente
- [ ] Compilare:
  - Atleta: selezionare un atleta esistente
  - Tipo: "allenamento"
  - Data: oggi o domani
  - Ora inizio: es. 10:00
  - Ora fine: es. 11:00 (dopo l'inizio)
  - Location: opzionale, lasciare vuoto o inserire testo
  - Note: opzionale
- [ ] Cliccare "Salva"
- [ ] **Verifica**: Appuntamento appare nel calendario senza errori
- [ ] **Verifica Console**: Nessun errore "staff_id violates not-null constraint"
- [ ] **Verifica DB**: Controllare che `staff_id` sia popolato correttamente nella tabella `appointments`

**Risultato Atteso**: ✅ Appuntamento creato con successo, `staff_id` popolato

---

### 1.2 Test Tipi Appuntamento Diversi

Ripetere per ogni tipo:

- [ ] Tipo "cardio"
- [ ] Tipo "check"
- [ ] Tipo "consulenza"
- [ ] **Verifica**: Ogni tipo viene salvato correttamente
- [ ] **Verifica**: Colori diversi nel calendario per ogni tipo

**Risultato Atteso**: ✅ Tutti i tipi supportati funzionano correttamente

---

### 1.3 Test Validazione Form

- [ ] Tentare di salvare senza selezionare atleta → **Errore atteso**
- [ ] Tentare con ora fine < ora inizio → **Errore atteso**: "La data di fine deve essere successiva alla data di inizio"
- [ ] Tentare con date nel passato → **Verificare comportamento** (dovrebbe essere consentito o bloccato)

**Risultato Atteso**: ✅ Validazione client-side funziona

---

## ✅ Test 2: Verifica Sovrapposizioni Appuntamenti

### 2.1 Test Sovrapposizione Temporale - Stesso Trainer

- [ ] Creare appuntamento 1: oggi 10:00-11:00
- [ ] Tentare di creare appuntamento 2: stesso trainer, oggi 10:30-11:30 (sovrapposto)
- [ ] **Verifica**: Sistema rileva sovrapposizione
- [ ] **Verifica**: Messaggio di errore/avviso mostrato all'utente
- [ ] **Verifica Console**: Chiamata RPC `check_appointment_overlap` effettuata correttamente

**Risultato Atteso**: ✅ Sovrapposizione rilevata correttamente

---

### 2.2 Test Appuntamenti Non Sovrapposti

- [ ] Creare appuntamento 1: oggi 10:00-11:00
- [ ] Creare appuntamento 2: stesso trainer, oggi 14:00-15:00 (non sovrapposto)
- [ ] **Verifica**: Entrambi gli appuntamenti creati con successo

**Risultato Atteso**: ✅ Appuntamenti non sovrapposti vengono accettati

---

### 2.3 Test Esclusione Appuntamento in Modifica

- [ ] Creare appuntamento: oggi 10:00-11:00
- [ ] Modificare lo stesso appuntamento cambiando orario (es. 10:30-11:30)
- [ ] **Verifica**: Non viene rilevata sovrapposizione con se stesso

**Risultato Atteso**: ✅ Esclusione funziona correttamente

---

## ✅ Test 3: Creazione Appuntamento Ricorrente

### 3.1 Test Ricorrenza Settimanale

- [ ] Aprire form nuovo appuntamento
- [ ] Compilare dati base (atleta, tipo, data, orari)
- [ ] Attivare "Ricorrenza"
- [ ] Selezionare:
  - Frequenza: "Settimanale"
  - Intervallo: 1 (ogni settimana)
  - Giorno: Lunedì (o altro giorno)
- [ ] Salvare
- [ ] **Verifica**: Appuntamenti ricorrenti creati nel calendario
- [ ] **Verifica**: `recurrence_rule` nel formato corretto: `FREQ=WEEKLY;INTERVAL=1;BYDAY=MO`
- [ ] **Verifica**: Descrizione ricorrenza mostra "Ogni lunedì" (minuscola)

**Risultato Atteso**: ✅ Ricorrenza settimanale creata correttamente, descrizione formattata

---

### 3.2 Test Ricorrenza Giornaliera

- [ ] Creare appuntamento ricorrente:
  - Frequenza: "Giornaliera"
  - Intervallo: 1 (ogni giorno)
- [ ] **Verifica**: Appuntamenti creati ogni giorno
- [ ] **Verifica**: `recurrence_rule`: `FREQ=DAILY;INTERVAL=1`
- [ ] **Verifica**: Descrizione: "Ogni giorno"

**Risultato Atteso**: ✅ Ricorrenza giornaliera funziona

---

### 3.3 Test Ricorrenza Mensile

- [ ] Creare appuntamento ricorrente:
  - Frequenza: "Mensile"
  - Intervallo: 2 (ogni 2 mesi)
- [ ] **Verifica**: `recurrence_rule`: `FREQ=MONTHLY;INTERVAL=2`
- [ ] **Verifica**: Descrizione: "Ogni 2 mesi"

**Risultato Atteso**: ✅ Ricorrenza mensile funziona

---

### 3.4 Test Ricorrenza con Intervallo Personalizzato

- [ ] Creare ricorrenza settimanale con intervallo 2 (ogni 2 settimane)
- [ ] **Verifica**: `recurrence_rule`: `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO`
- [ ] **Verifica**: Descrizione: "Ogni 2 settimane, lunedì"

**Risultato Atteso**: ✅ Intervalli personalizzati funzionano

---

## ✅ Test 4: Modifica Appuntamento

### 4.1 Modifica Appuntamento Singolo

- [ ] Cliccare su un appuntamento esistente nel calendario
- [ ] Cliccare "Modifica" (o icona edit)
- [ ] Modificare:
  - Ora inizio/fine
  - Tipo
  - Location
  - Note
- [ ] Salvare
- [ ] **Verifica**: Modifiche salvate correttamente
- [ ] **Verifica**: Calendario si aggiorna automaticamente

**Risultato Atteso**: ✅ Modifica funziona correttamente

---

### 4.2 Modifica Appuntamento Ricorrente

- [ ] Cliccare su appuntamento ricorrente
- [ ] Modificare dati
- [ ] **Verifica**: Comportamento (modifica singola vs serie)

**Risultato Atteso**: ✅ Comportamento corretto per ricorrenze

---

## ✅ Test 5: Cancellazione Appuntamento

### 5.1 Cancellazione Singola

- [ ] Cliccare su appuntamento
- [ ] Cliccare "Cancella" (o icona delete)
- [ ] Confermare cancellazione
- [ ] **Verifica**: Appuntamento rimosso dal calendario
- [ ] **Verifica DB**: `cancelled_at` popolato (soft delete)

**Risultato Atteso**: ✅ Cancellazione funziona (soft delete)

---

### 5.2 Cancellazione Serie Ricorrente

- [ ] Cancellare appuntamento ricorrente
- [ ] **Verifica**: Comportamento (singolo vs serie)

**Risultato Atteso**: ✅ Cancellazione ricorrenze gestita correttamente

---

## ✅ Test 6: Visualizzazione e UI

### 6.1 Vista Calendario

- [ ] Vista Mese: appuntamenti visibili correttamente
- [ ] Vista Settimana: appuntamenti visibili correttamente
- [ ] Vista Giorno: appuntamenti visibili correttamente
- [ ] Navigazione avanti/indietro funziona
- [ ] Colori differenziati per tipo funzionano

**Risultato Atteso**: ✅ Tutte le viste funzionano correttamente

---

### 6.2 Dettaglio Appuntamento

- [ ] Cliccare su appuntamento per vedere dettagli
- [ ] **Verifica**: Tutti i campi mostrati correttamente:
  - Atleta
  - Trainer/Staff
  - Tipo
  - Data/Ora
  - Location
  - Note
  - Ricorrenza (se presente)

**Risultato Atteso**: ✅ Dettaglio completo e corretto

---

## ✅ Test 7: Validazione Schema Zod

### 7.1 Test Location Opzionale

- [ ] Creare appuntamento senza location → **Dovrebbe funzionare**
- [ ] Creare appuntamento con location → **Dovrebbe funzionare**

**Risultato Atteso**: ✅ Location opzionale funziona

---

### 7.2 Test Tipo Enum

- [ ] Verificare che tutti i tipi (`allenamento`, `cardio`, `check`, `consulenza`) siano accettati
- [ ] Tentare tipo non valido (se possibile) → **Dovrebbe fallire validazione**

**Risultato Atteso**: ✅ Schema Zod accetta solo tipi validi

---

### 7.3 Test Regola Ricorrenza

- [ ] Creare ricorrenze con formati validi (DAILY, WEEKLY, MONTHLY)
- [ ] Verificare che regole non valide siano rifiutate

**Risultato Atteso**: ✅ Validazione ricorrenza funziona

---

## 🔍 Test 8: Verifiche Database e RPC

### 8.1 Verifica staff_id nel Database

Aprire Supabase SQL Editor e eseguire:

```sql
SELECT id, org_id, athlete_id, trainer_id, staff_id, type, starts_at, ends_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
```

- [ ] **Verifica**: Tutti i record hanno `staff_id` popolato (NOT NULL)
- [ ] **Verifica**: `trainer_id` è sincronizzato con `staff_id` (o NULL)
- [ ] **Verifica**: Trigger funziona: `trainer_id` = `staff_id` quando trainer_id è NULL

**Risultato Atteso**: ✅ `staff_id` sempre popolato, trigger funziona

---

### 8.2 Test RPC Function check_appointment_overlap

Eseguire query SQL:

```sql
-- Test sovrapposizione (dovrebbe restituire true)
SELECT check_appointment_overlap(
  p_staff_id := 'USER_ID_QUI',
  p_starts_at := '2025-01-30 10:00:00+00',
  p_ends_at := '2025-01-30 11:00:00+00',
  p_exclude_appointment_id := NULL
);
```

- [ ] **Verifica**: RPC function esiste e funziona
- [ ] **Verifica**: Restituisce `true` se c'è sovrapposizione, `false` altrimenti

**Risultato Atteso**: ✅ RPC function funziona correttamente

---

## 📊 Test 9: Performance e Errori

### 9.1 Performance

- [ ] Caricamento calendario con molti appuntamenti (100+) → **Tempi accettabili**
- [ ] Creazione/modifica appuntamento → **Tempi accettabili**
- [ ] Nessun lag visibile nell'UI

**Risultato Atteso**: ✅ Performance accettabile

---

### 9.2 Errori Console

Durante tutti i test:

- [ ] Nessun errore JavaScript in console
- [ ] Nessun errore TypeScript
- [ ] Nessun errore di rete (404, 500, ecc.)
- [ ] Nessun warning rilevante

**Risultato Atteso**: ✅ Nessun errore

---

## ✅ Test 10: Edge Cases

### 10.1 Appuntamenti al Cambio Giorno/Mese

- [ ] Creare appuntamento che inizia prima di mezzanotte e finisce dopo
- [ ] **Verifica**: Visualizzazione corretta nel calendario

---

### 10.2 Appuntamenti Stesso Orario (diversi trainer)

- [ ] Creare appuntamento trainer A: oggi 10:00-11:00
- [ ] Creare appuntamento trainer B: stesso orario
- [ ] **Verifica**: Entrambi creati (nessuna sovrapposizione perché trainer diversi)

---

### 10.3 Appuntamenti Adiacenti (senza sovrapposizione)

- [ ] Appuntamento 1: 10:00-11:00
- [ ] Appuntamento 2: 11:00-12:00 (stesso trainer)
- [ ] **Verifica**: Entrambi creati (non c'è sovrapposizione)

---

## 📝 Risultati Test

### ✅ Test Passati: **_ / _**

### ❌ Test Falliti: **_ / _**

### ⚠️ Note/Problemi:

- ***

## 🔄 Problemi Riscontrati

### Critici (Bloccano funzionalità)

1.
2.

### Importanti (Limitano funzionalità)

1.
2.

### Minori (UI/UX)

1.
2.

---

## ✅ Conclusione

- [ ] Tutti i test passati
- [ ] Sistema pronto per produzione
- [ ] Documentazione aggiornata
- [ ] Note inserite in `ai_memory/sviluppo.md`

**Firma**: **\*\***\_\_\_\_**\*\***  
**Data**: **\*\***\_\_\_\_**\*\***
