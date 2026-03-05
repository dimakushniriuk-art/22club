# Utility: Notifications Athlete Registration

## 📋 Descrizione

Utility per notifiche registrazione atleta. Invia notifica al PT quando atleta completa registrazione, supporta notifica in-app, email e push.

## 📁 Percorso File

`src/lib/notifications/athlete-registration.ts`

## 📦 Dipendenze

- `@/lib/supabase` (`createClient`)
- `@/lib/notifications/push` (sendPushNotification)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`sendAthleteRegistrationNotification(data)`**: Invia notifica registrazione atleta
   - Crea notifica in-app per PT
   - Invia email di conferma al PT (opzionale)
   - Invia notifica push al PT (opzionale)
   - Gestisce errori senza bloccare processo

### Interfacce

- `AthleteRegistrationNotificationData`: Dati notifica (athleteId, athleteName, athleteEmail, ptId, ptName, ptEmail)

## 🔍 Note Tecniche

- Notifica in-app: inserisce record in tabella notifications
- Email e push: opzionali, errori non bloccanti
- Link notifica: `/dashboard/clienti/${athleteId}`

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
