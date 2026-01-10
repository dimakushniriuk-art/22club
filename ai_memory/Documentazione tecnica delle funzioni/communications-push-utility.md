# Utility: Communications Push

## 📋 Descrizione

Utility per invio push comunicazioni. Integra sistema push esistente, gestisce batch processing, aggiorna status recipients.

## 📁 Percorso File

`src/lib/communications/push.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables)
- `@/lib/notifications/push` (sendPushNotification, getActivePushTokens)
- `./service` (updateRecipientStatus, updateCommunicationStats)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`sendCommunicationPush(communicationId)`**: Invia comunicazione push
   - Ottiene comunicazione e recipients pendenti
   - Ottiene token push attivi per recipients
   - Processa batch di push (BATCH_SIZE = 50, BATCH_DELAY_MS = 1000)
   - Aggiorna status recipients e comunicazione

### Interfacce Esportate

- `SendCommunicationPushResult`: Risultato invio (success, sent, failed, total, errors)

## 🔍 Note Tecniche

- Batch processing: 50 push per batch, 1 secondo delay
- Filtra solo recipients con token push attivi
- Aggiornamento automatico statistiche

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
