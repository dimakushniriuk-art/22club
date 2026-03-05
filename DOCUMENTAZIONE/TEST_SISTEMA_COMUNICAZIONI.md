# 🧪 Test Sistema Comunicazioni

**Data Inizio**: 2025-01-31  
**Obiettivo**: Verificare che tutti i fix implementati funzionino correttamente

---

## ✅ Checklist Test Completi

### 🔴 Test Critici (Priorità Alta)

#### Test 1: Creazione Comunicazione

- [ ] **Test 1.1**: Creare comunicazione Push
  - Cliccare "Nuova comunicazione"
  - Selezionare tipo "Push"
  - Inserire titolo e messaggio
  - Verificare che il conteggio destinatari sia corretto
  - Salvare come bozza
  - **Risultato atteso**: Comunicazione creata con status "draft"

- [ ] **Test 1.2**: Creare comunicazione Email
  - Stessi passi di 1.1, tipo "Email"
  - **Risultato atteso**: Comunicazione creata

- [ ] **Test 1.3**: Creare comunicazione SMS
  - Stessi passi di 1.1, tipo "SMS"
  - Inserire messaggio > 160 caratteri
  - **Risultato atteso**: Errore validazione, pulsanti disabilitati
  - Ridurre messaggio a < 160 caratteri
  - **Risultato atteso**: Validazione OK

- [ ] **Test 1.4**: Creare comunicazione con "Tutti gli utenti"
  - Selezionare filtro "Tutti gli utenti"
  - **Risultato atteso**: Conteggio mostra solo utenti attivi

- [ ] **Test 1.5**: Creare comunicazione con "Solo atleti"
  - Selezionare filtro "Solo atleti"
  - **Risultato atteso**: Conteggio mostra solo atleti attivi

- [ ] **Test 1.6**: Creare comunicazione con "Atleti specifici"
  - Selezionare filtro "Atleti specifici"
  - Selezionare alcuni atleti dalla lista
  - **Risultato atteso**: Conteggio mostra numero atleti selezionati

#### Test 2: Modifica Comunicazione

- [ ] **Test 2.1**: Modificare comunicazione draft
  - Cliccare "Modifica" su una comunicazione draft
  - Modificare titolo/messaggio
  - Salvare
  - **Risultato atteso**: Modifiche salvate correttamente

- [ ] **Test 2.2**: Cambiare recipient_filter in draft
  - Modificare una comunicazione draft
  - Cambiare filtro destinatari (es: da "Tutti" a "Solo atleti")
  - Salvare
  - **Risultato atteso**: `total_recipients` resettato a 0
  - Verificare nel DB che i recipients esistenti siano stati eliminati

#### Test 3: Invio Comunicazione

- [ ] **Test 3.1**: Invio immediato push
  - Creare comunicazione push
  - Selezionare destinatari
  - Cliccare "Invia ora"
  - **Risultato atteso**:
    - Status cambia a "sending"
    - Progress bar appare
    - Toast success/error
    - Completamento: status "sent"

- [ ] **Test 3.2**: Verificare che non rimanga bloccato
  - Creare comunicazione e inviare
  - Attendere completamento
  - **Risultato atteso**: Status non rimane in "sending" indefinitamente
  - Se bloccato, verificare che check-stuck lo rilevi entro 10 minuti

- [ ] **Test 3.3**: Test timeout dinamico
  - Creare comunicazione con molti destinatari (100+)
  - Inviare
  - **Risultato atteso**: Timeout calcolato dinamicamente (1min/100, min 2min, max 10min)

#### Test 4: Paginazione

- [ ] **Test 4.1**: Navigazione pagine
  - Assicurarsi di avere > 10 comunicazioni
  - Cliccare "Successiva"
  - **Risultato atteso**: Carica pagina successiva
  - Cliccare "Precedente"
  - **Risultato atteso**: Torna alla pagina precedente

- [ ] **Test 4.2**: Filtro con paginazione
  - Cambiare tab (es: da "Tutte" a "Push")
  - **Risultato atteso**: Reset a pagina 1, mostra solo push

#### Test 5: Dettaglio Recipients

- [ ] **Test 5.1**: Visualizzare dettaglio recipients
  - Aprire una comunicazione inviata (status "sent")
  - Cliccare "Dettagli"
  - **Risultato atteso**: Modal si apre con lista recipients
  - Verificare che mostri nome, email, telefono, stato

- [ ] **Test 5.2**: Filtri nel modal
  - Nel modal dettaglio, cliccare filtri (es: "Consegnati")
  - **Risultato atteso**: Lista filtrata correttamente

- [ ] **Test 5.3**: Ricerca nel modal
  - Nel modal, cercare per nome/email
  - **Risultato atteso**: Lista filtrata in tempo reale

### 🟡 Test Funzionali (Priorità Media)

#### Test 6: Schedulazione

- [ ] **Test 6.1**: Programmare comunicazione
  - Creare comunicazione
  - Attivare checkbox "Programma invio"
  - Selezionare data/ora futura
  - Salvare
  - **Risultato atteso**: Status "scheduled", `scheduled_for` impostato

- [ ] **Test 6.2**: Verificare cron job
  - Programmare comunicazione per 1-2 minuti nel futuro
  - Attendere
  - **Risultato atteso**: Comunicazione inviata automaticamente allo scadere

#### Test 7: Tracking e Statistiche

- [ ] **Test 7.1**: Verificare aggiornamento `total_sent`
  - Inviare comunicazione
  - Verificare nel DB che `total_sent` sia aggiornato

- [ ] **Test 7.2**: Verificare aggiornamento `total_delivered`
  - Inviare push notification
  - Simulare/confermare consegna
  - **Risultato atteso**: `total_delivered` incrementato

- [ ] **Test 7.3**: Verificare aggiornamento `total_opened`
  - Inviare comunicazione
  - Simulare/confermare apertura
  - **Risultato atteso**: `total_opened` incrementato

### 🟢 Test UX (Priorità Bassa)

#### Test 8: Validazione Form

- [ ] **Test 8.1**: Validazione campi obbligatori
  - Tentare di salvare comunicazione senza titolo
  - **Risultato atteso**: Toast errore, non salva

- [ ] **Test 8.2**: Validazione SMS
  - Tipo SMS, messaggio > 160 caratteri
  - **Risultato atteso**: Errore visibile, pulsanti disabilitati

#### Test 9: Toast Notifications

- [ ] **Test 9.1**: Verificare che non ci siano più `alert()`
  - Eseguire tutte le azioni principali
  - **Risultato atteso**: Solo toast, nessun alert browser

- [ ] **Test 9.2**: Verificare varianti toast
  - Success (creazione/invio OK)
  - Error (errore validazione/invio)
  - Warning (reset comunicazione bloccata)

#### Test 10: Progress Bar

- [ ] **Test 10.1**: Visualizzazione durante invio
  - Inviare comunicazione
  - **Risultato atteso**: Progress bar visibile durante "sending"
  - Progress aggiornato in base a `total_sent / total_recipients`

---

## 🔧 Test Database

### Verifiche SQL

```sql
-- 1. Verificare che solo utenti attivi siano conteggiati
SELECT COUNT(*) FROM profiles
WHERE role IN ('atleta', 'athlete') AND stato = 'attivo';

-- 2. Verificare recipients creati
SELECT COUNT(*) FROM communication_recipients
WHERE communication_id = 'ID_COMUNICAZIONE';

-- 3. Verificare aggiornamento stati
SELECT status, COUNT(*)
FROM communication_recipients
GROUP BY status;

-- 4. Verificare comunicazioni bloccate
SELECT id, title, status, updated_at
FROM communications
WHERE status = 'sending'
AND updated_at < NOW() - INTERVAL '10 minutes';
```

---

## 📊 Risultati Test

### Test Passati: **_ / _**

### Test Falliti: **_ / _**

### Test Non Eseguiti: **_ / _**

### Note:

---

**Ultimo Aggiornamento**: 2025-01-31
