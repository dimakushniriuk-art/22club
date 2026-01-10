# Utility: Communications Scheduler

## 📋 Descrizione

Utility per scheduler comunicazioni programmate. Processa comunicazioni programmate che devono essere inviate, crea recipients se non esistono, invia in base al tipo (push/email/sms/all).

## 📁 Percorso File

`src/lib/communications/scheduler.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database)
- `./push` (sendCommunicationPush)
- `./email` (sendCommunicationEmail)
- `./sms` (sendCommunicationSMS)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`processScheduledCommunications()`**: Processa comunicazioni programmate
   - Ottiene comunicazioni con status 'scheduled' e scheduled_for <= now
   - Crea recipients se non esistono ancora
   - Invia in base al tipo (push, email, sms, all)
   - Aggrega risultati (processed, sent, failed)

### Interfacce Esportate

- `ProcessScheduledCommunicationsResult`: Risultato processamento (success, processed, sent, failed, errors)

## 🔍 Note Tecniche

- Query comunicazioni programmate con filtro datetime
- Supporta tutti i tipi comunicazione (push, email, sms, all)
- Gestione errori per ogni comunicazione

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
