# 📧 STEP 3: Configurazione Provider Esterni

**Data Inizio**: 2025-01-31  
**Status**: ⏸️ **RIMANDATO** - Da fare prima del deploy in produzione  
**Tempo Stimato**: 2-3 ore

---

## 📋 Obiettivo

Configurare Resend (Email) e Twilio (SMS) per abilitare l'invio reale di email e SMS nel sistema comunicazioni.

---

## ⏸️ Status: RIMANDATO

**Nota**: Questa configurazione è stata rimandata alla fine del progetto, prima del deploy in produzione. Il sistema funziona correttamente in modalità simulazione durante lo sviluppo.

**Quando configurarla**:

- Prima del deploy in produzione
- Quando serve testare invii reali

---

## ✅ Checklist Configurazione

### Parte A: Resend (Email)

#### Fase A1: Creazione Account Resend

- [ ] **Registrazione**
  - [ ] Visitare: https://resend.com/
  - [ ] Registrarsi con email (es: `admin@22club.it`)
  - [ ] Verificare email

- [ ] **Creazione API Key**
  - [ ] Accedere al dashboard Resend
  - [ ] Andare su "API Keys" (o "Settings" > "API Keys")
  - [ ] Cliccare "Create API Key"
  - [ ] Inserire nome: `22Club Production` (o `22Club Development`)
  - [ ] Selezionare permessi: `Sending access` (o `Full access`)
  - [ ] **IMPORTANTE**: Copiare l'API key immediatamente (non sarà più visibile!)

- [ ] **Configurazione Domain (Produzione)**
  - [ ] Andare su "Domains" nel dashboard Resend
  - [ ] Cliccare "Add Domain"
  - [ ] Inserire dominio: `22club.it` (o il tuo dominio)
  - [ ] Seguire istruzioni per verificare dominio (DNS records)
  - [ ] **NOTA**: Per sviluppo locale puoi usare il dominio di test di Resend

---

#### Fase A2: Configurazione Variabili Ambiente

- [ ] **Aprire file `.env.local`**

- [ ] **Aggiungere variabili Resend**
  - [ ] Cercare sezione email o aggiungere nuova sezione:

```env
# =====================================================
# 📧 Email Configuration (Resend)
# =====================================================

# API Key da dashboard Resend > API Keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email mittente (dev'essere verificata in Resend)
RESEND_FROM_EMAIL=noreply@22club.it

# Nome mittente (opzionale, default: "22Club")
RESEND_FROM_NAME=22Club

# Webhook secret per verificare chiamate webhook (opzionale ma consigliato)
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- [ ] **Sostituire valori**:
  - [ ] `RESEND_API_KEY` → API key copiata da Resend dashboard
  - [ ] `RESEND_FROM_EMAIL` → Email verificata (o dominio verificato, es: `noreply@22club.it`)
  - [ ] `RESEND_FROM_NAME` → Nome mittente (opzionale)
  - [ ] `RESEND_WEBHOOK_SECRET` → Ottenere da webhook settings (vedi Fase A3)

---

#### Fase A3: Configurazione Webhook (Opzionale ma Consigliato)

- [ ] **Creare Webhook in Resend**
  - [ ] Nel dashboard Resend, andare su "Webhooks"
  - [ ] Cliccare "Create Webhook"
  - [ ] Inserire URL: `https://yourdomain.com/api/webhooks/email` (sostituire `yourdomain.com` con il tuo dominio)
  - [ ] Selezionare eventi:
    - [x] `email.sent`
    - [x] `email.delivered`
    - [x] `email.delivery_delayed`
    - [x] `email.complained`
    - [x] `email.bounced`
    - [x] `email.opened`
    - [x] `email.clicked`
  - [ ] Copiare "Signing Secret" (webhook secret)

- [ ] **Aggiungere webhook secret a `.env.local`**
  - [ ] Aggiungere `RESEND_WEBHOOK_SECRET` con il valore copiato

- [ ] **NOTA per Sviluppo Locale**:
  - Per testare webhook in locale, puoi usare strumenti come:
    - [ngrok](https://ngrok.com/) per esporre localhost
    - [webhook.site](https://webhook.site/) per test
  - Oppure saltare i webhook per ora e configurarli solo in produzione

---

#### Fase A4: Verifica Configurazione Resend

- [ ] **Riavviare server Next.js**
  - [ ] Fermare server (se in esecuzione): `Ctrl+C`
  - [ ] Riavviare: `npm run dev`

- [ ] **Test invio email (Opzionale)**
  - [ ] Aprire: `http://localhost:3001/dashboard/comunicazioni`
  - [ ] Creare nuova comunicazione tipo "Email"
  - [ ] Inviare comunicazione
  - [ ] Verificare che venga inviata (controllare inbox destinatario o log Resend)

---

### Parte B: Twilio (SMS)

#### Fase B1: Creazione Account Twilio

- [ ] **Registrazione**
  - [ ] Visitare: https://www.twilio.com/
  - [ ] Registrarsi con email
  - [ ] Verificare email e numero di telefono

- [ ] **Ottieni credenziali**
  - [ ] Accedere al dashboard Twilio
  - [ ] Vai su "Account" > "Account Info" (o "Settings" > "General")
  - [ ] Copiare:
    - [ ] **Account SID**: Inizia con `AC...`
    - [ ] **Auth Token**: Cliccare "View" per vedere (o creare nuovo token se necessario)

- [ ] **Ottieni numero telefono**
  - [ ] Nel dashboard Twilio, andare su "Phone Numbers" > "Manage" > "Buy a number"
  - [ ] Selezionare paese (es: Italia)
  - [ ] Selezionare numero disponibile
  - [ ] Completare acquisto (costo mensile basso per numeri base)
  - [ ] Copiare numero telefono (formato: `+39XXXXXXXXXX`)

---

#### Fase B2: Configurazione Variabili Ambiente

- [ ] **Aprire file `.env.local`**

- [ ] **Aggiungere variabili Twilio**
  - [ ] Cercare sezione SMS o aggiungere nuova sezione:

```env
# =====================================================
# 📱 SMS Configuration (Twilio)
# =====================================================

# Account SID da Twilio Dashboard > Account Info
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Auth Token da Twilio Dashboard > Account Info (cliccare "View")
TWILIO_AUTH_TOKEN=your_auth_token_here

# Numero telefono Twilio (formato: +39XXXXXXXXXX)
TWILIO_PHONE_NUMBER=+39XXXXXXXXXX

# Webhook secret per verificare chiamate webhook (opzionale ma consigliato)
TWILIO_WEBHOOK_SECRET=your_webhook_secret_here
```

- [ ] **Sostituire valori**:
  - [ ] `TWILIO_ACCOUNT_SID` → Account SID copiato
  - [ ] `TWILIO_AUTH_TOKEN` → Auth Token copiato
  - [ ] `TWILIO_PHONE_NUMBER` → Numero telefono acquistato
  - [ ] `TWILIO_WEBHOOK_SECRET` → Creare secret personalizzato (vedi Fase B3)

---

#### Fase B3: Configurazione Webhook (Opzionale ma Consigliato)

- [ ] **Configurare Webhook in Twilio**
  - [ ] Nel dashboard Twilio, andare su "Phone Numbers" > "Manage" > "Active numbers"
  - [ ] Cliccare sul numero telefono configurato
  - [ ] Scorrere fino a "Messaging"
  - [ ] In "A MESSAGE COMES IN", inserire:
    - [ ] URL: `https://yourdomain.com/api/webhooks/sms`
    - [ ] Metodo: `HTTP POST`
  - [ ] Salvare

- [ ] **Creare Webhook Secret**
  - [ ] Generare una stringa casuale sicura (es: usando `openssl rand -hex 32`)
  - [ ] Aggiungere a `.env.local` come `TWILIO_WEBHOOK_SECRET`

- [ ] **NOTA per Sviluppo Locale**:
  - Per testare webhook in locale, usare ngrok o saltare per ora

---

#### Fase B4: Verifica Configurazione Twilio

- [ ] **Riavviare server Next.js**
  - [ ] Fermare server (se in esecuzione): `Ctrl+C`
  - [ ] Riavviare: `npm run dev`

- [ ] **Test invio SMS (Opzionale)**
  - [ ] Aprire: `http://localhost:3001/dashboard/comunicazioni`
  - [ ] Creare nuova comunicazione tipo "SMS"
  - [ ] **IMPORTANTE**: SMS deve essere < 160 caratteri
  - [ ] Inviare comunicazione
  - [ ] Verificare che SMS venga ricevuto

---

## ⚠️ Note Importanti

### Sicurezza

- ⚠️ **Mai committare** le API keys nel repository
- ✅ Verifica che `.env.local` sia in `.gitignore`
- ✅ In produzione, configura le variabili ambiente nella piattaforma di hosting (Vercel, ecc.)

### Costi

- **Resend**: Piano gratuito include 3,000 email/mese, poi a pagamento
- **Twilio**: Pay-as-you-go, circa €0.01-0.02 per SMS in Italia

### Produzione

- ⚠️ Per produzione, configura i webhook URL con il dominio reale
- ⚠️ Verifica dominio email in Resend per migliori deliverability
- ⚠️ Usa numeri telefonici verificati in Twilio

---

## ✅ Verifica Finale

Dopo aver completato tutte le fasi:

- [ ] Resend configurato e testato
- [ ] Twilio configurato e testato
- [ ] Variabili ambiente presenti in `.env.local`
- [ ] Server Next.js riavviato
- [ ] Test invio email completato (opzionale)
- [ ] Test invio SMS completato (opzionale)
- [ ] Webhook configurati (opzionale ma consigliato)

---

## 🎯 Prossimo Step

Dopo aver completato STEP 3, procedere con:

- **STEP 4**: Configurazione Cron Job

---

**Ultimo Aggiornamento**: 2025-01-31
