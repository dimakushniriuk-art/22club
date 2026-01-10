# Utility: Communications Email

## 📋 Descrizione

Utility per invio email comunicazioni. Integra provider Resend, gestisce batch processing, aggiorna status recipients, genera HTML email da template.

## 📁 Percorso File

`src/lib/communications/email.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables)
- `./service` (updateCommunicationStats)
- `./email-template` (generateEmailHTML)
- `./email-batch-processor` (processEmailBatches)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`sendCommunicationEmail(communicationId)`**: Invia comunicazione email
   - Ottiene comunicazione e recipients pendenti
   - Genera HTML da template
   - Processa batch di email
   - Aggiorna status recipients e comunicazione

### Interfacce Esportate

- `SendCommunicationEmailResult`: Risultato invio (success, sent, failed, total, errors)

## 🔍 Note Tecniche

- Batch processing per performance
- Integrazione Resend API
- Tracking pixel per email opens
- Aggiornamento automatico statistiche

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
