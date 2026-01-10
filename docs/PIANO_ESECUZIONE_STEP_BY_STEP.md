# 📋 Piano Esecuzione Step-by-Step - Sistema Comunicazioni

**Data Inizio**: 2025-01-31  
**Obiettivo**: Completare tutti i task rimanenti seguendo `docs/ANALISI_COSA_MANCA.md`

---

## 🎯 Strategia di Esecuzione

Procediamo in ordine di priorità, completando un task alla volta prima di passare al successivo.

---

## 🔴 STEP 1: Test Manuali Completi (Priorità Alta)

### Stato Attuale

- ✅ Guide di test create (`CHECKLIST_TEST_RAPIDA.md`, `GUIDA_TEST_MANUALI_DETTAGLIATA.md`)
- ✅ Analisi automatica completata (`REPORT_TEST_BROWSER_AUTOMATICO.md`)
- ✅ Pulsante "Elimina" aggiunto
- ⏳ Test manuali da eseguire

### Azioni da Fare

#### 1.1 Preparazione Ambiente (5 min)

- [ ] Verificare server Next.js in esecuzione (`npm run dev`)
- [ ] Verificare autenticazione (login come `pt1@22club.it`)
- [ ] Aprire `http://localhost:3001/dashboard/comunicazioni`
- [ ] Aprire `docs/CHECKLIST_TEST_RAPIDA.md` per riferimento

#### 1.2 Test Critici - Creazione (15 min)

- [ ] Test 1: Creazione Push
- [ ] Test 2: Creazione Email
- [ ] Test 3: Creazione SMS (con validazione 160 caratteri)
- [ ] Test 4: Creazione "All"
- [ ] Test 5: Selezione Destinatari (Tutti/Solo atleti/Atleti specifici)

**Criteri di Successo**:

- ✅ Tutti i tipi di comunicazione possono essere creati
- ✅ Conteggio destinatari corretto
- ✅ Validazione SMS funziona
- ✅ Toast notifications visibili (no alert())

#### 1.3 Test Critici - Modifica ed Eliminazione (10 min)

- [ ] Test 6: Modifica comunicazione draft
- [ ] Test 6.1: Eliminazione comunicazione (NUOVO)

**Criteri di Successo**:

- ✅ Pulsante "Modifica" apre modal con dati precompilati
- ✅ Modifiche salvate correttamente
- ✅ Pulsante "Elimina" presente e funzionante
- ✅ Conferma eliminazione funziona
- ✅ Toast success dopo eliminazione

#### 1.4 Test Critici - Invio (15 min)

- [ ] Test 7: Invio immediato push
- [ ] Verificare progress bar durante invio
- [ ] Verificare toast notifications
- [ ] Verificare aggiornamento status

**Criteri di Successo**:

- ✅ Status cambia a "Invio in corso" → "Inviata" o "Fallita"
- ✅ Progress bar visibile e aggiornata
- ✅ Toast success/error (no alert())
- ✅ Statistiche aggiornate (`total_sent`, `total_failed`)

#### 1.5 Test Critici - Navigazione (10 min)

- [ ] Test 8: Paginazione (Successiva/Precedente)
- [ ] Test 9: Filtri Tab (Tutte/Push/Email/SMS)
- [ ] Test 10: Dettagli Recipients

**Criteri di Successo**:

- ✅ Paginazione funziona correttamente
- ✅ Filtri tab funzionano
- ✅ Modal dettagli recipients si apre
- ✅ Filtri e ricerca nel modal funzionano

#### 1.6 Test Funzionali (15 min)

- [ ] Test 11: Schedulazione (programmare comunicazione)
- [ ] Test 12: Tracking/Statistiche (verificare DB dopo invio)

**Criteri di Successo**:

- ✅ Comunicazione salvata come "scheduled"
- ✅ `scheduled_for` impostato correttamente
- ✅ Statistiche aggiornate nel DB

#### 1.7 Test UX (10 min)

- [ ] Test 13: Validazione form
- [ ] Test 14: Toast notifications (no alert())
- [ ] Test 15: Progress bar

**Criteri di Successo**:

- ✅ Validazione blocca input non validi
- ✅ Solo toast, nessun alert()
- ✅ Progress bar aggiornata in tempo reale

### Report Test

Dopo ogni sezione, segnare:

- ✅ Test passati
- ❌ Test falliti (con descrizione problema)
- ⚠️ Test parziali (con note)

**Tempo Totale Stimato**: ~1.5 ore

---

## 🔴 STEP 2: Configurazione VAPID Keys (Priorità Alta)

### Stato Attuale

- ✅ Guida creata (`docs/GUIDA_CONFIGURAZIONE_VAPID_KEYS.md`)
- ⏳ Keys da generare
- ⏳ Variabili ambiente da configurare

### Azioni da Fare

#### 2.1 Generazione Keys (10 min)

- [ ] Aprire `docs/GUIDA_CONFIGURAZIONE_VAPID_KEYS.md`
- [ ] Eseguire comando per generare keys
- [ ] Copiare public key e private key

#### 2.2 Configurazione Environment (5 min)

- [ ] Aggiungere a `.env`:
  ```
  NEXT_PUBLIC_VAPID_KEY=<public_key>
  VAPID_PRIVATE_KEY=<private_key>
  VAPID_EMAIL=mailto:your-email@example.com
  ```

#### 2.3 Verifica (5 min)

- [ ] Riavviare server Next.js
- [ ] Verificare che keys siano caricate (console.log opzionale)
- [ ] Test invio push reale

**Tempo Totale Stimato**: ~20 minuti

---

## 🔴 STEP 3: Configurazione Provider Esterni (Priorità Alta)

### 3.1 Resend (Email) - 1 ora

#### Setup Account (15 min)

- [ ] Registrarsi su Resend.com
- [ ] Verificare email
- [ ] Ottenere API Key

#### Configurazione Environment (5 min)

- [ ] Aggiungere a `.env`:
  ```
  RESEND_API_KEY=<api_key>
  RESEND_FROM_EMAIL=noreply@yourdomain.com
  RESEND_FROM_NAME=22Club
  ```

#### Configurazione Webhook (20 min)

- [ ] Configurare webhook URL in dashboard Resend: `https://yourdomain.com/api/webhooks/email`
- [ ] Verificare che endpoint esista (da creare in STEP 5 se non presente)

#### Test (20 min)

- [ ] Inviare comunicazione email di test
- [ ] Verificare ricezione email
- [ ] Verificare logs

### 3.2 Twilio (SMS) - 1.5 ore

#### Setup Account (20 min)

- [ ] Registrarsi su Twilio.com
- [ ] Verificare account
- [ ] Ottenere Account SID e Auth Token
- [ ] Ottenere numero telefono

#### Configurazione Environment (5 min)

- [ ] Aggiungere a `.env`:
  ```
  TWILIO_ACCOUNT_SID=<account_sid>
  TWILIO_AUTH_TOKEN=<auth_token>
  TWILIO_PHONE_NUMBER=<phone_number>
  ```

#### Configurazione Webhook (20 min)

- [ ] Configurare webhook URL in dashboard Twilio: `https://yourdomain.com/api/webhooks/sms`

#### Test (45 min)

- [ ] Inviare comunicazione SMS di test
- [ ] Verificare ricezione SMS
- [ ] Verificare logs

**Tempo Totale Stimato**: ~2.5 ore

---

## 🔴 STEP 4: Configurazione Cron Job (Priorità Alta)

### Stato Attuale

- ✅ Endpoint `/api/cron/notifications` presente
- ✅ Funzione `processScheduledCommunications()` implementata
- ⏳ Configurazione hosting da verificare

### Azioni da Fare

#### 4.1 Verifica Hosting (15 min)

- [ ] Identificare piattaforma hosting (Vercel/AWS/altro)
- [ ] Verificare documentazione cron job per piattaforma

#### 4.2 Configurazione Vercel Cron (se applicabile) (15 min)

- [ ] Aggiungere `vercel.json` con configurazione cron:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/notifications",
        "schedule": "0 * * * *"
      }
    ]
  }
  ```

#### 4.3 Configurazione Alternativa (se necessario) (30 min)

- [ ] GitHub Actions
- [ ] AWS EventBridge
- [ ] Altro servizio cron

#### 4.4 Test (30 min)

- [ ] Programmare comunicazione test per 5 minuti nel futuro
- [ ] Attendere esecuzione
- [ ] Verificare che comunicazione sia stata inviata automaticamente
- [ ] Verificare logs

**Tempo Totale Stimato**: ~1.5 ore

---

## 🟡 STEP 5: Webhook Tracking Consegna/Apertura (Priorità Media)

### Stato Attuale

- ✅ Struttura DB pronta (`delivered_at`, `opened_at`, `total_delivered`, `total_opened`)
- ⏳ Endpoint webhook da implementare

### Azioni da Fare

#### 5.1 Webhook Email (2 ore)

- [ ] Creare `src/app/api/webhooks/email/route.ts`
- [ ] Implementare gestione eventi Resend:
  - `email.delivered` → aggiorna `delivered_at`
  - `email.opened` → aggiorna `opened_at`
  - `email.bounced` → aggiorna status failed
- [ ] Aggiornare `total_delivered` e `total_opened` in comunicazione
- [ ] Testare con webhook simulator

#### 5.2 Webhook SMS (1.5 ore)

- [ ] Creare `src/app/api/webhooks/sms/route.ts`
- [ ] Implementare gestione eventi Twilio:
  - `delivered` → aggiorna `delivered_at`
  - `failed` → aggiorna status failed
  - `read` → aggiorna `opened_at`
- [ ] Testare con webhook simulator

#### 5.3 Webhook Push Delivery (1.5 ore)

- [ ] Creare `src/app/api/webhooks/push-delivery/route.ts`
- [ ] Implementare endpoint per service worker
- [ ] Aggiornare `delivered_at` quando push confermato
- [ ] Testare con service worker

**Tempo Totale Stimato**: ~5 ore

---

## 🟡 STEP 6: Retry Automatico (Priorità Media)

### Stato Attuale

- ✅ Retry manuale implementato ("Riprova invio")
- ⏳ Retry automatico da implementare

### Azioni da Fare

#### 6.1 Implementazione Logica (2 ore)

- [ ] Creare funzione `retryFailedRecipients` in `src/lib/communications/retry.ts`
- [ ] Implementare logica retry:
  - Max 3 tentativi
  - Delay 5 minuti tra tentativi
  - Log tentativi in `metadata`
- [ ] Aggiornare `communication_recipients` con `retry_count`

#### 6.2 Integrazione Scheduler (1 ora)

- [ ] Aggiungere chiamata a `retryFailedRecipients` nel cron job
- [ ] Eseguire ogni ora
- [ ] Verificare che non ci siano loop infiniti

#### 6.3 Test (1 ora)

- [ ] Creare comunicazione con recipients che falliranno
- [ ] Attendere retry automatico
- [ ] Verificare `retry_count` e `metadata`

**Tempo Totale Stimato**: ~4 ore

---

## 🟢 STEP 7: Dashboard Statistiche Avanzate (Priorità Bassa)

### Azioni da Fare

- [ ] Creare componente `CommunicationsStatisticsDashboard`
- [ ] Implementare grafici (Chart.js o Recharts)
- [ ] Statistiche per periodo
- [ ] Tasso consegna/apertura
- [ ] Statistiche per tipo/ruolo

**Tempo Totale Stimato**: ~1-2 giorni

---

## 🟢 STEP 8: Export Dati (Priorità Bassa)

### Azioni da Fare

- [ ] Implementare export CSV
- [ ] Implementare export Excel (opzionale)
- [ ] Export comunicazioni
- [ ] Export recipients per comunicazione
- [ ] Export statistiche

**Tempo Totale Stimato**: ~3 ore

---

## 📊 Riepilogo Timeline

| Step                     | Priorità | Tempo Stimato | Status      |
| ------------------------ | -------- | ------------- | ----------- |
| STEP 1: Test Manuali     | 🔴 Alta  | 1.5 ore       | ⏳ In corso |
| STEP 2: VAPID Keys       | 🔴 Alta  | 20 min        | ⏳ Pending  |
| STEP 3: Provider Esterni | 🔴 Alta  | 2.5 ore       | ⏳ Pending  |
| STEP 4: Cron Job         | 🔴 Alta  | 1.5 ore       | ⏳ Pending  |
| STEP 5: Webhook Tracking | 🟡 Media | 5 ore         | ⏳ Pending  |
| STEP 6: Retry Automatico | 🟡 Media | 4 ore         | ⏳ Pending  |
| STEP 7: Dashboard Stats  | 🟢 Bassa | 1-2 giorni    | ⏳ Pending  |
| STEP 8: Export Dati      | 🟢 Bassa | 3 ore         | ⏳ Pending  |

**Totale Priorità Alta**: ~6 ore  
**Totale Priorità Media**: ~9 ore  
**Totale Priorità Bassa**: ~2-3 giorni

---

## 🎯 Prossimo Step

**STEP 1: Test Manuali Completi**

Iniziamo eseguendo i test manuali seguendo la checklist. Vuoi che proceda con una verifica automatica del codice prima, o preferisci iniziare direttamente con i test manuali?

---

**Ultimo Aggiornamento**: 2025-01-31
