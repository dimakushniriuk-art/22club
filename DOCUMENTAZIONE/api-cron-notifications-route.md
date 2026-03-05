# 📚 Documentazione Tecnica: API Cron Notifications

**Percorso**: `src/app/api/cron/notifications/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route, Cronjob)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per cronjob notifiche giornaliere. Gestisce GET per eseguire notifiche giornaliere/test e POST per notifiche manuali. Include anche processamento comunicazioni programmate e aggiornamento scadenze documenti/inviti.

---

## 🔧 Endpoints

### 1. `GET /api/cron/notifications`

**Classificazione**: API Route, GET Handler, Cronjob (Bearer Auth)  
**Autenticazione**: Richiesta (Bearer token con `CRON_SECRET`)  
**Autorizzazione**: Verifica `Authorization: Bearer ${CRON_SECRET}`

**Query Parameters**:

- `test?`: `string` - Se `'true'`, esegue test notifications invece di notifiche giornaliere

**Request Headers**:

- `Authorization`: `Bearer ${CRON_SECRET}` - Token cron secret (obbligatorio)

**Response Success** (200):

```typescript
// Se test=true
{
  success: boolean
  message: string
  error?: string
  timestamp: string
}

// Se test non fornito (notifiche giornaliere)
{
  success: boolean
  message: string
  notifications: {
    success: boolean
    totalNotifications: number
    results: Array<...>
  }
  communications: {
    success: boolean
    processed: number
    sent: number
    failed: number
    errors?: string[]
  }
  timestamp: string
}
```

**Response Error**:

- `401`: Unauthorized (token mancante o non valido)
- `500`: Cron secret non configurato o errore server

**Descrizione**: Endpoint cronjob notifiche con:

- **Test Mode**: Se `test=true`, esegue solo `testNotifications()`
- **Daily Mode**: Esegue:
  1. `runDailyNotifications()` - Notifiche giornaliere
  2. `processScheduledCommunications()` - Comunicazioni programmate
  3. `update_document_statuses()` RPC - Aggiorna stati documenti scaduti
  4. `update_expired_invites()` RPC - Aggiorna inviti scaduti
- **Authorization**: Verifica Bearer token con `CRON_SECRET` env var

### 2. `POST /api/cron/notifications`

**Classificazione**: API Route, POST Handler, Cronjob (Bearer Auth)  
**Autenticazione**: Richiesta (Bearer token con `CRON_SECRET`)  
**Autorizzazione**: Verifica `Authorization: Bearer ${CRON_SECRET}`

**Request Body**:

```typescript
{
  action: 'send_manual' | 'test'
  // Per send_manual:
  userId: string
  title: string
  message: string
  type: string
  link?: string
  actionText?: string
}
```

**Response Success** (200):

```typescript
// Per send_manual
{
  success: true
  message: string
  notification: Notification
  timestamp: string
}

// Per test
{
  success: boolean
  message: string
  error?: string
  timestamp: string
}
```

**Response Error**:

- `400`: Action non valida o campi mancanti
- `401`: Unauthorized
- `500`: Errore server

**Descrizione**: Endpoint notifiche manuali con:

- **Actions**:
  - `send_manual`: Crea notifica manuale per utente specifico
  - `test`: Esegue test notifications
- **Send Manual**: Inserisce notifica in `notifications` table con service role key

---

## 🔄 Flusso Logico

### GET /api/cron/notifications

1. **Authorization**:
   - Verifica `Authorization: Bearer ${CRON_SECRET}` header

2. **Test Mode**:
   - Se `test=true` → esegue `testNotifications()`, ritorna risultato

3. **Daily Mode**:
   - Esegue `runDailyNotifications()`
   - Esegue `processScheduledCommunications()`
   - Chiama RPC `update_document_statuses()`
   - Chiama RPC `update_expired_invites()`
   - Ritorna risultati aggregati

### POST /api/cron/notifications

1. **Authorization**:
   - Verifica Bearer token

2. **Action Switch**:
   - `send_manual`: Valida campi, crea notifica con service role key
   - `test`: Esegue `testNotifications()`

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Notifications Scheduler (`runDailyNotifications`, `testNotifications`), Communications Scheduler (`processScheduledCommunications`), Supabase Server Client

**Utilizzato da**: Cronjob esterno (es. Vercel Cron, cron service)

---

## ⚠️ Note Tecniche

- **CRON_SECRET**: Environment variable per autenticazione cronjob
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per creare notifiche manuali
- **RPC Calls**: Chiama RPC functions per aggiornare scadenze documenti/inviti
- **Error Handling**: Log errori ma continua esecuzione (non blocca altri task)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
