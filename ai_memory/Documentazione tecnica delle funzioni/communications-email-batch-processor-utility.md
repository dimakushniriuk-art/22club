# Utility: Communications Email Batch Processor

## 📋 Descrizione

Utility per processamento batch email. Processa recipients in batch per invio email, gestisce errori, aggiorna status.

## 📁 Percorso File

`src/lib/communications/email-batch-processor.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables)
- `./service` (updateRecipientStatus)
- `./email-resend-client` (sendEmailViaResend)
- `./email-template` (generateEmailHTML)

## ⚙️ Funzionalità

### Costanti

- `EMAIL_BATCH_SIZE = 100`: Numero email per batch
- `EMAIL_BATCH_DELAY_MS = 2000`: Delay tra batch (2 secondi)

### Funzioni Principali

1. **`processEmailBatch(batch, communication, emailHTML)`**: Processa batch di recipients
   - Ottiene email dai profili
   - Invia email tramite Resend
   - Aggiorna status recipients (sent/failed)
   - Ritorna statistiche (sent, failed, errors)

2. **`processEmailBatches(recipients, communication, emailHTML)`**: Processa tutti i batch
   - Divide recipients in batch
   - Processa batch sequenzialmente con delay
   - Aggrega risultati

## 🔍 Note Tecniche

- Batch size: 100 email per batch
- Delay: 2 secondi tra batch
- Gestione errori per ogni recipient
- Aggiornamento status automatico

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
