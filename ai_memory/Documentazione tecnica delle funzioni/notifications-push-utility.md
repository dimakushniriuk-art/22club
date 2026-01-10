# Utility: Notifications Push

## 📋 Descrizione

Utility per push notifications PWA-ready. Gestisce registrazione token push, invio notifiche, gestione token attivi, integrazione VAPID keys.

## 📁 Percorso File

`src/lib/notifications/push.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`registerPushToken(userId, token, deviceType)`**: Registra token push
2. **`unregisterPushToken(userId, token)`**: Rimuove token push
3. **`getActivePushTokens(userIds)`**: Ottiene token attivi per utenti
4. **`sendPushNotification(userId, payload)`**: Invia notifica push a singolo utente
5. **`sendBulkPushNotifications(userIds, payload)`**: Invia notifiche push a multipli utenti

### Interfacce Esportate

- `PushResult<T>`: Risultato operazione push
- `WebPushPayload`: Payload notifica (title, body, icon, badge, data)

## 🔍 Note Tecniche

- VAPID keys da env vars (NEXT_PUBLIC_VAPID_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL)
- Supporta device types: web, ios, android
- Batch processing per notifiche bulk
- Gestione token attivi/inattivi

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
