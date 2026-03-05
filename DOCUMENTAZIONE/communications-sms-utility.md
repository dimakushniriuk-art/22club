# Utility: Communications SMS

## 📋 Descrizione

Utility per invio SMS comunicazioni. Integra provider Twilio, gestisce batch processing, aggiorna status recipients.

## 📁 Percorso File

`src/lib/communications/sms.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables)
- `./service` (updateRecipientStatus, updateCommunicationStats)
- `twilio` (opzionale, solo in produzione)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`sendCommunicationSMS(communicationId)`**: Invia comunicazione SMS
   - Ottiene comunicazione e recipients pendenti
   - Ottiene numeri telefono dai profili
   - Processa batch di SMS (SMS_BATCH_SIZE = 50, SMS_BATCH_DELAY_MS = 3000)
   - Aggiorna status recipients e comunicazione

### Funzioni Helper

- **`isTwilioConfigured()`**: Verifica se Twilio è configurato
- **`sendSMSViaTwilio(to, message, recipientId)`**: Invia SMS tramite Twilio API

### Interfacce Esportate

- `SendCommunicationSMSResult`: Risultato invio (success, sent, failed, total, errors)

## 🔍 Note Tecniche

- Batch processing: 50 SMS per batch, 3 secondi delay (rate limits)
- Simulazione in sviluppo se Twilio non configurato
- Callback URL per status updates (opzionale)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
