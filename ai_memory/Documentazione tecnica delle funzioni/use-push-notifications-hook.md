# 📚 Documentazione Tecnica: usePushNotifications

**Percorso**: `src/hooks/use-push-notifications.ts`  
**Tipo Modulo**: React Hook (Push Notifications Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione push notifications browser. Gestisce permessi, sottoscrizione/unsubscription, service worker, e VAPID keys.

---

## 🔧 Funzioni e Export

### 1. `usePushNotifications`

**Classificazione**: React Hook, Push Notifications Hook, Client Component, Side-Effecting  
**Tipo**: `() => UsePushNotificationsReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Stato**:
  - `isSupported`: `boolean` - True se browser supporta push
  - `permission`: `NotificationPermission | null` - Stato permesso
  - `isSubscribed`: `boolean` - True se sottoscritto
  - `isLoading`: `boolean` - Stato operazione
  - `error`: `string | null` - Errore
- **Funzioni**:
  - `requestPermission()`: `() => Promise<boolean>` - Richiede permesso notifiche
  - `subscribe()`: `() => Promise<boolean>` - Sottoscrive push notifications
  - `unsubscribe()`: `() => Promise<boolean>` - Disiscrive push notifications
  - `enableNotifications()`: `() => Promise<boolean>` - Abilita (permission + subscribe)
  - `disableNotifications()`: `() => Promise<boolean>` - Disabilita (unsubscribe)

**Descrizione**: Hook per push notifications con:

- Verifica supporto browser (serviceWorker, PushManager)
- Gestione permessi (granted/denied/default)
- Sottoscrizione con VAPID key (da API `/api/push/vapid-key`)
- Salvataggio subscription in localStorage (TODO: database)
- Service worker registration

### 2. `registerServiceWorker`

**Classificazione**: Utility Function  
**Tipo**: `() => void`

**Descrizione**: Registra service worker (`/sw.js`) al load pagina

### 3. `setupPushNotificationHandlers`

**Classificazione**: Utility Function  
**Tipo**: `() => void`

**Descrizione**: Setup event handlers per notifiche ricevute/clicked

---

## 🔄 Flusso Logico

### Check Support

1. Verifica: `'serviceWorker' in navigator && 'PushManager' in window`
2. Legge `Notification.permission`
3. Verifica subscription esistente: `registration.pushManager.getSubscription()`

### Request Permission

1. Chiama `Notification.requestPermission()`
2. Aggiorna `permission` state
3. Ritorna `permission === 'granted'`

### Subscribe

1. Verifica supporto e permesso
2. Fetch VAPID public key: GET `/api/push/vapid-key`
3. Converte key: `urlBase64ToUint8Array(publicKey)`
4. Registra service worker: `navigator.serviceWorker.ready`
5. Sottoscrive: `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`
6. Salva subscription in localStorage (TODO: database)
7. Aggiorna `isSubscribed = true`

### Unsubscribe

1. Ottiene subscription: `pushManager.getSubscription()`
2. Chiama `subscription.unsubscribe()`
3. Rimuove da localStorage (TODO: database)
4. Aggiorna `isSubscribed = false`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase), Service Worker API, Push API

**Utilizzato da**: Componenti impostazioni, layout

---

## ⚠️ Note Tecniche

- **VAPID Key**: Fetch da API route (non hardcoded)
- **LocalStorage**: Usa localStorage per subscription (TODO: migrare a database `user_push_tokens`)
- **Service Worker**: Richiede service worker registrato (`/sw.js`)
- **Browser Support**: Funziona solo su browser con supporto Service Worker e Push API

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
