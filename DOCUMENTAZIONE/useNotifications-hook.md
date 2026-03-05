# useNotifications Hook - Documentazione Tecnica

**File**: `src/hooks/use-notifications.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 242  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Notifiche / Sistema Notifiche
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: Componenti notifiche, sistema notifiche globale

---

## 🎯 Obiettivo

Gestire CRUD notifiche per utenti, inclusa:

- Fetch notifiche (filtrate per user_id)
- Marca come letto (singola o tutte)
- Creazione notifica
- Eliminazione notifica
- Filtri per tipo e stato lettura
- Contatore notifiche non lette

---

## 📥 Parametri

```typescript
interface UseNotificationsProps {
  userId?: string | null
}
```

**Parametri**:

- `userId` (string | null): ID profilo utente

---

## 📤 Output / Return Value

```typescript
{
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  hasUnread: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  createNotification: (title: string, body: string, type: Notification['type'], link?: string, actionText?: string) => Promise<Notification | null>
  deleteNotification: (notificationId: string) => Promise<void>
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (type: Notification['type']) => Notification[]
}
```

**Tipo `Notification`**:

```typescript
{
  id: string
  user_id: string
  title: string
  body: string
  link?: string | null
  type: string
  sent_at: string | null
  read_at?: string | null
  action_text?: string | null
  is_push_sent: boolean
  created_at: string
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Notifiche

- Query `notifications` filtrata per `user_id = userId`
- Ordina per `created_at` (desc)
- Calcola `unreadCount`: conta notifiche con `read_at IS NULL`

### 2. Marca Come Letto

- Update `read_at = NOW()` per notifica specifica
- Aggiorna stato locale
- Decrementa `unreadCount`

### 3. Marca Tutte Come Lette

- Update batch: `read_at = NOW()` per tutte le notifiche non lette
- Aggiorna stato locale
- Reset `unreadCount = 0`

### 4. Creazione Notifica

- Insert in `notifications` con:
  - `user_id`: userId
  - `title`, `body`, `type`, `link`, `action_text`
  - `is_push_sent: false` (da aggiornare da sistema push)
- Aggiorna stato locale (prepend alla lista)
- Incrementa `unreadCount`

### 5. Eliminazione Notifica

- Delete da `notifications` per `id` e `user_id`
- Aggiorna stato locale
- Decrementa `unreadCount` se notifica non letta

### 6. Utility Filtri

- `getUnreadNotifications()`: Filtra notifiche con `read_at IS NULL`
- `getNotificationsByType()`: Filtra per `type`

---

## 🗄️ Database

### Tabelle Utilizzate

**`notifications`**:

- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles.id)
- `title` (text)
- `body` (text)
- `link` (text, nullable) - URL per azione
- `type` (text) - tipo notifica
- `sent_at` (timestamp, nullable) - quando inviata
- `read_at` (timestamp, nullable) - quando letta
- `action_text` (text, nullable) - testo azione
- `is_push_sent` (boolean) - se push inviata
- `created_at` (timestamp)

**`push_subscriptions`**:

- Tabella per gestione push notifications (non usata direttamente in questo hook)

---

## ⚠️ Errori Possibili

1. **User ID mancante**: `Error('User ID is required')` (per markAsRead, markAllAsRead, createNotification, deleteNotification)
2. **Errore Supabase**: Errori da query/insert/update/delete Supabase

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `notifications` table
- **RLS Policies**: Deve permettere lettura per utenti (solo propri)

---

## 📝 Esempio Utilizzo

```typescript
import { useNotifications } from '@/hooks/use-notifications'

function NotificationsBell() {
  const { user } = useAuth()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications({
    userId: user?.id
  })

  return (
    <div>
      <Bell icon={unreadCount > 0 ? '🔔' : '🔕'} />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onRead={() => markAsRead(notif.id)}
        />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-001**: RLS su `notifications` - 0 righe visibili (3 reali) - già identificato ma non specifico
2. **⚠️ VAPID key management**: Gestione chiavi VAPID per push non nel hook (vedi `use-push.ts`)
3. **⚠️ Cron notifications**: Scheduling notifiche non nel hook (vedi `notifications/scheduler.ts`)
4. **⚠️ Push subscriptions cleanup**: Cleanup subscription non gestito nel hook

---

## 📊 Metriche

- **Complessità Ciclomatica**: Media (~10-12)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e push
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
