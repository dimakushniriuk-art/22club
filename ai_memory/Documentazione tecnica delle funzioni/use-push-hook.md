# 📚 Documentazione Tecnica: usePush

**Percorso**: `src/hooks/use-push.ts`  
**Tipo Modulo**: React Hook (Push Notifications Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook semplificato per push notifications. Fornisce subscribe/unsubscribe con VAPID key da env e invio subscription al server.

---

## 🔧 Funzioni e Export

### 1. `usePush`

**Classificazione**: React Hook, Push Notifications Hook, Client Component, Async  
**Tipo**: `() => { subscribe: () => Promise<void>, unsubscribe: () => Promise<void> }`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `subscribe()`: `() => Promise<void>` - Sottoscrive push notifications
- `unsubscribe()`: `() => Promise<void>` - Disiscrive push notifications

**Descrizione**: Hook semplificato per push con:

- Usa VAPID key da `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Sottoscrive e invia subscription a `/api/push/subscribe`
- Disiscrive e notifica server via `/api/push/unsubscribe`
- Richiede utente autenticato (`useSupabase`)

---

## 🔄 Flusso Logico

### Subscribe

1. Verifica utente autenticato
2. Verifica supporto browser (serviceWorker, PushManager)
3. Ottiene service worker: `navigator.serviceWorker.ready`
4. Sottoscrive: `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`
5. Converte subscription a JSON (endpoint, keys)
6. Invia a server: POST `/api/push/subscribe` con `{ ...payload, userId }`

### Unsubscribe

1. Verifica utente autenticato
2. Ottiene subscription: `pushManager.getSubscription()`
3. Se presente → `subscription.unsubscribe()`
4. Notifica server: POST `/api/push/unsubscribe` con `{ endpoint, userId }`

---

## 📊 Dipendenze

**Dipende da**: React (`useCallback`), `useSupabase`, Service Worker API, Push API

**Utilizzato da**: Componenti impostazioni push

---

## ⚠️ Note Tecniche

- **VAPID Key**: Da env variable (non fetch da API)
- **Server Sync**: Invia subscription al server per invio push
- **Error Handling**: Lancia errori se fallisce (non ritorna boolean)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
