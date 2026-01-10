# 🔗 Link Pagine Sistema Comunicazioni

**Data Creazione**: 2025-01-30  
**Sistema**: Comunicazioni di Massa (Push, Email, SMS)

---

## 📱 **Pagine Frontend**

### **Pagina Principale Comunicazioni**

```
/dashboard/comunicazioni
```

**URL Completo** (sviluppo):

```
http://localhost:3001/dashboard/comunicazioni
```

**URL Completo** (produzione):

```
https://yourdomain.com/dashboard/comunicazioni
```

**Descrizione**:

- Lista tutte le comunicazioni
- Statistiche in tempo reale
- Filtri per tipo (push, email, SMS)
- Form creazione nuova comunicazione
- Gestione bozze e invio

---

## 🔌 **API Routes**

### **1. Tracking Email Open (Pixel Tracking)**

```
GET /api/track/email-open/[id]
```

**URL Completo** (sviluppo):

```
http://localhost:3001/api/track/email-open/[recipient_id]
```

**URL Completo** (produzione):

```
https://yourdomain.com/api/track/email-open/[recipient_id]
```

**Esempio**:

```
https://yourdomain.com/api/track/email-open/550e8400-e29b-41d4-a716-446655440000
```

**Descrizione**:

- Endpoint per pixel tracking apertura email
- Restituisce immagine PNG trasparente 1x1
- Aggiorna automaticamente `communication_recipients.opened_at`
- Usato nelle email HTML come `<img src="...">`

---

### **2. Webhook Email (Resend)**

```
POST /api/webhooks/email
```

**URL Completo** (sviluppo):

```
http://localhost:3001/api/webhooks/email
```

**URL Completo** (produzione):

```
https://yourdomain.com/api/webhooks/email
```

**Descrizione**:

- Webhook handler per eventi Resend
- Eventi supportati: `email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`
- Configurare in Resend Dashboard → Webhooks

**Configurazione Resend**:

1. Vai su [Resend Dashboard](https://resend.com/webhooks)
2. Crea nuovo webhook
3. URL: `https://yourdomain.com/api/webhooks/email`
4. Eventi: seleziona tutti gli eventi email
5. (Opzionale) Aggiungi `RESEND_WEBHOOK_SECRET` in `.env.local`

---

### **3. Webhook SMS (Twilio)**

```
POST /api/webhooks/sms
```

**URL Completo** (sviluppo):

```
http://localhost:3001/api/webhooks/sms
```

**URL Completo** (produzione):

```
https://yourdomain.com/api/webhooks/sms?recipient_id=[id]
```

**Esempio con recipient_id**:

```
https://yourdomain.com/api/webhooks/sms?recipient_id=550e8400-e29b-41d4-a716-446655440000
```

**Descrizione**:

- Webhook handler per eventi Twilio
- Eventi supportati: `queued`, `sent`, `delivered`, `failed`, `undelivered`
- Configurare in Twilio Dashboard → Messaging → Status Callback

**Configurazione Twilio**:

1. Vai su [Twilio Console](https://console.twilio.com/)
2. Messaging → Settings → Status Callback URL
3. URL: `https://yourdomain.com/api/webhooks/sms`
4. (Opzionale) Aggiungi `TWILIO_WEBHOOK_SECRET` in `.env.local`

---

### **4. Cron Job Notifiche (Modificato)**

```
GET /api/cron/notifications
POST /api/cron/notifications
```

**URL Completo** (sviluppo):

```
http://localhost:3001/api/cron/notifications
```

**URL Completo** (produzione):

```
https://yourdomain.com/api/cron/notifications
```

**Query Params** (GET):

- `?test=true` - Esegue test notifications

**Headers Richiesti**:

```
Authorization: Bearer [CRON_SECRET]
```

**Descrizione**:

- Processa notifiche giornaliere esistenti
- **NUOVO**: Processa anche comunicazioni programmate
- Esegue automaticamente quando chiamato dal cron job

**Configurazione Cron Job** (es. Vercel Cron):

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 📊 **Database Tables**

### **Tabella `communications`**

```sql
SELECT * FROM communications;
```

**Colonne principali**:

- `id` - UUID
- `created_by` - UUID (user_id)
- `title` - TEXT
- `message` - TEXT
- `type` - 'push' | 'email' | 'sms' | 'all'
- `status` - 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
- `scheduled_for` - TIMESTAMP
- `sent_at` - TIMESTAMP
- `total_recipients`, `total_sent`, `total_delivered`, `total_opened`, `total_failed` - INTEGER
- `recipient_filter` - JSONB
- `metadata` - JSONB

---

### **Tabella `communication_recipients`**

```sql
SELECT * FROM communication_recipients;
```

**Colonne principali**:

- `id` - UUID
- `communication_id` - UUID (FK)
- `user_id` - UUID (FK)
- `recipient_type` - 'push' | 'email' | 'sms'
- `status` - 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
- `sent_at`, `delivered_at`, `opened_at`, `failed_at` - TIMESTAMP
- `error_message` - TEXT
- `metadata` - JSONB

---

## 🔧 **File Backend Creati**

### **Servizi**

- `src/lib/communications/service.ts` - CRUD operations
- `src/lib/communications/recipients.ts` - Selezione destinatari
- `src/lib/communications/push.ts` - Invio push
- `src/lib/communications/email.ts` - Invio email
- `src/lib/communications/sms.ts` - Invio SMS
- `src/lib/communications/scheduler.ts` - Schedulazione

### **Hooks**

- `src/hooks/use-communications.ts` - Hook React per frontend

### **API Routes**

- `src/app/api/track/email-open/[id]/route.ts` - Pixel tracking
- `src/app/api/webhooks/email/route.ts` - Webhook Resend
- `src/app/api/webhooks/sms/route.ts` - Webhook Twilio

### **Migrations**

- `supabase/migrations/20250130_create_communications_tables.sql` - Schema database

---

## 🧪 **Test Manuali**

### **1. Test Creazione Comunicazione**

1. Vai su `/dashboard/comunicazioni`
2. Clicca "Nuova Comunicazione"
3. Compila form e salva bozza
4. Verifica che appaia nella lista con status "Bozza"

### **2. Test Invio Push**

1. Crea comunicazione tipo "Push"
2. Seleziona destinatari
3. Clicca "Invia ora"
4. Verifica che status cambi a "Inviato"

### **3. Test Schedulazione**

1. Crea comunicazione
2. Attiva "Programma invio"
3. Seleziona data/ora futura
4. Salva
5. Verifica che status sia "Programmato"
6. Attendi che cron job processi (o chiama manualmente `/api/cron/notifications`)

### **4. Test Tracking Email**

1. Crea comunicazione tipo "Email"
2. Invia
3. Apri email ricevuta
4. Verifica che pixel tracking carichi (controlla network tab)
5. Verifica che `opened_at` sia aggiornato in database

---

## 📝 **Note Importanti**

1. **Variabili Ambiente Richieste**:

   ```env
   # Supabase (già configurato)
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=

   # Email (opzionale per produzione)
   RESEND_API_KEY=
   RESEND_FROM_EMAIL=
   RESEND_FROM_NAME=
   RESEND_WEBHOOK_SECRET= (opzionale)

   # SMS (opzionale per produzione)
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   TWILIO_WEBHOOK_SECRET= (opzionale)

   # Cron Job
   CRON_SECRET=
   ```

2. **In Sviluppo**:
   - Email e SMS sono simulati (console.log)
   - Push usa sistema esistente
   - Tutto funziona senza provider esterni

3. **In Produzione**:
   - Configurare Resend per email
   - Configurare Twilio per SMS
   - Configurare webhook in provider dashboard
   - Installare pacchetti: `npm install resend twilio`

---

## 🚀 **Quick Start**

1. **Apri pagina comunicazioni**:

   ```
   http://localhost:3001/dashboard/comunicazioni
   ```

2. **Crea prima comunicazione**:
   - Clicca "Nuova Comunicazione"
   - Seleziona tipo
   - Compila titolo e messaggio
   - Salva bozza o invia

3. **Verifica database**:
   ```sql
   SELECT * FROM communications ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM communication_recipients ORDER BY created_at DESC LIMIT 10;
   ```

---

**Sistema Completato al 100%** ✅
