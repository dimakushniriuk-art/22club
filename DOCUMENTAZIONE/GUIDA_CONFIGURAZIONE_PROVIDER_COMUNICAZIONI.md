# 📧📱 Guida Configurazione Provider Comunicazioni (Resend & Twilio)

**Data Creazione**: 2025-02-17  
**Status**: ✅ Guida Completa  
**Tempo Stimato**: 1-2 ore

---

## 📋 Obiettivo

Configurare i provider esterni **Resend** (email) e **Twilio** (SMS) per abilitare l'invio reale di email e SMS nel sistema comunicazioni. Il sistema è già funzionale al 98% in modalità simulazione, questa guida completa la configurazione per produzione.

---

## ✅ Prerequisiti

- [x] Pacchetti `resend` e `twilio` installati (✅ Completato)
- [x] Sistema comunicazioni implementato (✅ Completato)
- [x] Webhook routes implementate (✅ Completato)
- [ ] Account Resend creato
- [ ] Account Twilio creato
- [ ] Accesso ai dashboard provider

---

## 📧 PARTE A: Configurazione Resend (Email)

### STEP A1: Creazione Account e API Key

1. **Registrazione Account Resend**
   - Visitare: https://resend.com/
   - Cliccare "Get Started" o "Sign Up"
   - Registrarsi con email (es: `admin@22club.it`)
   - Verificare email di conferma

2. **Creazione API Key**
   - Accedere al dashboard Resend: https://resend.com/api-keys
   - Cliccare "Create API Key"
   - Inserire nome: `22Club Production` (o `22Club Development`)
   - Selezionare permessi: `Sending access` (sufficiente) o `Full access`
   -
   - **⚠️ IMPORTANTE**: Copiare l'API key immediatamente (formato: re_exufsYGV_PTh7fuxornCSDRtcNs7UKJHD)
   - - Non sarà più visibile dopo la chiusura del dialog!
     - Salvare in un posto sicuro temporaneamente

3. **Configurazione Domain (Solo Produzione)**
   - Andare su "Domains": https://resend.com/domains
   - Cliccare "Add Domain"
   - Inserire dominio: `22club.it` (o il tuo dominio)
   - Seguire istruzioni per verificare dominio (aggiungere DNS records)
   - **Nota**: Per sviluppo locale, puoi usare il dominio di test di Resend (`onboarding@resend.dev`)

---

### STEP A2: Configurazione Variabili Ambiente

1. **Aprire file `.env.local`** (creare se non esiste copiando da `env.example`)

2. **Aggiungere sezione Resend**:

```env
# =====================================================
# 📧 Email Configuration (Resend)
# =====================================================

# API Key da dashboard Resend > API Keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email mittente (dev'essere verificata in Resend)
# Sviluppo: onboarding@resend.dev (dominio di test)
# Produzione: noreply@22club.it (dominio verificato)
RESEND_FROM_EMAIL=noreply@22club.it

# Nome mittente (opzionale, default: "22Club")
RESEND_FROM_NAME=22Club

# Webhook secret per verificare chiamate webhook (opzionale ma consigliato)
# Ottieni da: Resend Dashboard > Webhooks > [Your Webhook] > Signing Secret
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Sostituire valori**:
   - `RESEND_API_KEY` → API key copiata al STEP A1.2
   - `RESEND_FROM_EMAIL` → Email verificata (o dominio verificato)
   - `RESEND_FROM_NAME` → Nome mittente (opzionale)
   - `RESEND_WEBHOOK_SECRET` → Ottenere al STEP A3 (per ora lasciare vuoto)

---

### STEP A3: Configurazione Webhook (Opzionale ma Consigliato)

I webhook permettono di ricevere aggiornamenti su delivery status, bounce, opens, etc.

1. **Preparare URL Webhook**
   - **Sviluppo Locale**: Usare [ngrok](https://ngrok.com/) per esporre localhost:
     ```bash
     ngrok http 3001
     # Copiare URL HTTPS (es: https://abc123.ngrok.io)
     ```
   - **Produzione**: Usare il tuo dominio (es: `https://22club.it`)

2. **Creare Webhook in Resend**
   - Nel dashboard Resend, andare su "Webhooks": https://resend.com/webhooks
   - Cliccare "Create Webhook"
   - Inserire URL: `https://yourdomain.com/api/webhooks/email` whsec_U3qCucTP6IkqkEDR3hjlTkZ889t8ugp3
     - Sviluppo: `https://abc123.ngrok.io/api/webhooks/email` whsec_WfpB1Fs+FSYil0htsV4DtF5iO7TGYkxz
     - Produzione: `https://22club.it/api/webhooks/email` whsec_tDTqGTnYWnZZbo2SmJgGFKph6L8ag+zw
   - Selezionare eventi (tutti consigliati):
     - [x] `email.sent`
     - [x] `email.delivered`
     - [x] `email.delivery_delayed`
     - [x] `email.complained`
     - [x] `email.bounced`
     - [x] `email.opened`
     - [x] `email.clicked`
   - Cliccare "Create"
   - **Copiare "Signing Secret"** (formato: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

3. **Aggiungere Webhook Secret a `.env.local`**
   - Aggiungere `RESEND_WEBHOOK_SECRET` con il valore copiato

---

### STEP A4: Verifica Configurazione Resend

1. **Riavviare server Next.js**

   ```bash
   # Fermare server (se in esecuzione): Ctrl+C
   npm run dev
   ```

2. **Eseguire script di verifica**

   ```bash
   npm run verify:communications
   ```

   Oppure direttamente:

   ```bash
   npx tsx scripts/verify-communications-providers.ts
   ```

3. **Test invio email (Opzionale)**
   - Aprire: `http://localhost:3001/dashboard/comunicazioni`
   - Creare nuova comunicazione tipo "Email"
   - Inserire destinatario (email tua per test)
   - Inviare comunicazione
   - Verificare che email venga ricevuta
   - Controllare log Resend dashboard per conferma invio

---

## 📱 PARTE B: Configurazione Twilio (SMS)

### STEP B1: Creazione Account e Credenziali

1. **Registrazione Account Twilio**
   - Visitare: https://www.twilio.com/
   - Cliccare "Sign Up" o "Get Started"
   - Registrarsi con email
   - Verificare email e numero di telefono

2. **Ottieni Credenziali**
   - Accedere al dashboard Twilio: https://console.twilio.com/
   - Andare su "Account" > "Account Info" (o "Settings" > "General")
   - Copiare:
     - **Account SID**: Inizia con `AC...` (formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - **Auth Token**: Cliccare "View" per vedere (⚠️ Non sarà più visibile dopo!)
       - Se necessario, creare nuovo token: "Auth Tokens" > "Create"

3. **Ottieni Numero Telefono**
   - Nel dashboard Twilio, andare su "Phone Numbers" > "Manage" > "Buy a number"
   - Selezionare paese (es: Italia)
   - Selezionare numero disponibile
   - Completare acquisto (costo mensile basso per numeri base)
   - Copiare numero telefono (formato: `+39XXXXXXXXXX`)

---

### STEP B2: Configurazione Variabili Ambiente

1. **Aprire file `.env.local`**

2. **Aggiungere sezione Twilio**:

```env
# =====================================================
# 📱 SMS Configuration (Twilio)
# =====================================================

# Account SID da Twilio Dashboard > Account Info
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Auth Token da Twilio Dashboard > Account Info (cliccare "View")
# ⚠️ IMPORTANTE: Non condividere mai questo token!
TWILIO_AUTH_TOKEN=your_auth_token_here

# Numero telefono Twilio (formato: +39XXXXXXXXXX)
TWILIO_PHONE_NUMBER=+39XXXXXXXXXX

# Webhook secret per verificare chiamate webhook (opzionale ma consigliato)
# Genera una stringa casuale sicura (es: openssl rand -hex 32)
TWILIO_WEBHOOK_SECRET=your_twilio_webhook_secret_here
```

3. **Sostituire valori**:
   - `TWILIO_ACCOUNT_SID` → Account SID copiato al STEP B1.2 (vedi console Twilio)
   - `TWILIO_AUTH_TOKEN` → Auth Token copiato al STEP B1.2 (vedi console Twilio)
   - `TWILIO_PHONE_NUMBER` → Numero telefono acquistato al STEP B1.3 (vedi console Twilio)
   - `TWILIO_WEBHOOK_SECRET` → Generare al STEP B3 (per ora lasciare vuoto)

---

### STEP B3: Configurazione Webhook (Opzionale ma Consigliato)

1. **Preparare URL Webhook**
   - Stesso URL base usato per Resend
   - URL completo: `https://yourdomain.com/api/webhooks/sms`

2. **Configurare Webhook in Twilio**
   - Nel dashboard Twilio, andare su "Phone Numbers" > "Manage" > "Active numbers"
   - Cliccare sul numero telefono configurato
   - Scorrere fino a sezione "Messaging"
   - In "A MESSAGE COMES IN", inserire:
     - URL: `https://yourdomain.com/api/webhooks/sms`
     - Metodo: `HTTP POST`
   - In "STATUS CALLBACK URL" (opzionale), inserire stesso URL
   - Cliccare "Save"

3. **Generare Webhook Secret**
   - Generare una stringa casuale sicura:

     ```bash
     # Windows PowerShell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

     # Linux/Mac
     openssl rand -hex 32
     ```

   - Aggiungere a `.env.local` come `TWILIO_WEBHOOK_SECRET`

---

### STEP B4: Verifica Configurazione Twilio

1. **Riavviare server Next.js**

   ```bash
   npm run dev
   ```

2. **Eseguire script di verifica**

   ```bash
   npm run verify:communications
   ```

3. **Test invio SMS (Opzionale)**
   - Aprire: `http://localhost:3001/dashboard/comunicazioni`
   - Creare nuova comunicazione tipo "SMS"
   - **IMPORTANTE**: SMS deve essere < 160 caratteri
   - Inserire destinatario (numero tuo per test)
   - Inviare comunicazione
   - Verificare che SMS venga ricevuto
   - Controllare log Twilio dashboard per conferma invio

---

## 🧪 PARTE C: Test Integrazione Completa

### STEP C1: Test Invio Email

1. **Preparazione**
   - Assicurarsi che Resend sia configurato (STEP A1-A4)
   - Server Next.js in esecuzione

2. **Test dalla UI**
   - Navigare a: `http://localhost:3001/dashboard/comunicazioni`
   - Cliccare "Nuova Comunicazione"
   - Selezionare tipo: "Email"
   - Inserire:
     - Titolo: "Test Configurazione Resend"
     - Messaggio: "Questo è un test di configurazione"
     - Destinatari: Selezionare almeno un atleta con email
   - Cliccare "Crea e Invia"

3. **Verifica**
   - Controllare inbox email destinatario
   - Verificare dashboard Resend per log invio
   - Verificare che status recipient sia aggiornato a "sent" o "delivered"

---

### STEP C2: Test Invio SMS

1. **Preparazione**
   - Assicurarsi che Twilio sia configurato (STEP B1-B4)
   - Server Next.js in esecuzione

2. **Test dalla UI**
   - Navigare a: `http://localhost:3001/dashboard/comunicazioni`
   - Cliccare "Nuova Comunicazione"
   - Selezionare tipo: "SMS"
   - Inserire:
     - Titolo: "Test Configurazione Twilio"
     - Messaggio: "Test SMS 22Club" (max 160 caratteri)
     - Destinatari: Selezionare almeno un atleta con numero telefono
   - Cliccare "Crea e Invia"

3. **Verifica**
   - Controllare telefono destinatario per SMS
   - Verificare dashboard Twilio per log invio
   - Verificare che status recipient sia aggiornato a "sent" o "delivered"

---

### STEP C3: Test Webhook (Opzionale)

1. **Test Webhook Resend**
   - Inviare email di test (STEP C1)
   - Aprire email e cliccare link (se presente)
   - Verificare che webhook riceva evento `email.opened` o `email.clicked`
   - Controllare log database: `communication_recipients` status aggiornato

2. **Test Webhook Twilio**
   - Inviare SMS di test (STEP C2)
   - Verificare che webhook riceva evento `delivered`
   - Controllare log database: `communication_recipients` status aggiornato

---

## ⚠️ Note Importanti

### Sicurezza

- ⚠️ **Mai committare** le API keys nel repository
- ✅ Verifica che `.env.local` sia in `.gitignore`
- ✅ In produzione, configura le variabili ambiente nella piattaforma di hosting (Vercel, Netlify, ecc.)
- ✅ Usa webhook secrets per verificare autenticità chiamate webhook

### Costi

- **Resend**:
  - Piano gratuito: 3,000 email/mese
  - Piani a pagamento: da $20/mese per 50,000 email
- **Twilio**:
  - Pay-as-you-go
  - SMS Italia: circa €0.01-0.02 per SMS
  - Numero telefono: circa €1-2/mese

### Produzione

- ⚠️ Per produzione, configura i webhook URL con il dominio reale
- ⚠️ Verifica dominio email in Resend per migliori deliverability
- ⚠️ Usa numeri telefonici verificati in Twilio
- ⚠️ Configura `NEXT_PUBLIC_APP_URL` con dominio produzione

---

## ✅ Checklist Completamento

### Resend (Email)

- [ ] Account Resend creato
- [ ] API Key creata e copiata
- [ ] Dominio verificato (produzione) o dominio test usato (sviluppo)
- [ ] Variabili ambiente configurate in `.env.local`
- [ ] Webhook creato e URL configurato
- [ ] Webhook secret aggiunto a `.env.local`
- [ ] Server riavviato
- [ ] Script verifica eseguito con successo
- [ ] Test invio email completato

### Twilio (SMS)

- [ ] Account Twilio creato
- [ ] Account SID e Auth Token copiati
- [ ] Numero telefono acquistato
- [ ] Variabili ambiente configurate in `.env.local`
- [ ] Webhook configurato nel numero telefono
- [ ] Webhook secret generato e aggiunto a `.env.local`
- [ ] Server riavviato
- [ ] Script verifica eseguito con successo
- [ ] Test invio SMS completato

### Integrazione

- [ ] Test invio email funzionante
- [ ] Test invio SMS funzionante
- [ ] Webhook email ricevono eventi (opzionale)
- [ ] Webhook SMS ricevono eventi (opzionale)
- [ ] Status recipients aggiornati correttamente

---

## 🔧 Script di Verifica

È disponibile uno script automatico per verificare la configurazione:

```bash
npm run verify:communications
```

Lo script verifica:

- ✅ Presenza variabili ambiente
- ✅ Formato variabili (se applicabile)
- ✅ Connessione API Resend
- ✅ Connessione API Twilio
- ✅ Configurazione webhook URLs

---

## 📚 Risorse Utili

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/dashboard)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Console](https://console.twilio.com/)
- [ngrok (per webhook locali)](https://ngrok.com/)

---

## 🎯 Prossimi Passi

Dopo aver completato la configurazione:

1. ✅ Testare invio email/SMS dalla pagina comunicazioni
2. ✅ Verificare che i webhook ricevano gli eventi
3. ✅ Monitorare costi e utilizzo nei dashboard provider
4. ✅ Configurare alert per errori/limiti nei provider

---

**Ultimo Aggiornamento**: 2025-02-17
