# 📚 Documentazione Tecnica: useCommunications

**Percorso**: `src/hooks/use-communications.ts`  
**Tipo Modulo**: React Hook (Communications CRUD Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook base per gestione CRUD comunicazioni. Fornisce funzioni per fetch lista, fetch singola, create, update, delete, send, reset, e cancel comunicazioni. Supporta filtri, paginazione, e auto-refresh.

---

## 🔧 Funzioni e Export

### 1. `useCommunications`

**Classificazione**: React Hook, CRUD Hook, Client Component, Async  
**Tipo**: `(options?: UseCommunicationsOptions) => UseCommunicationsReturn`

**Parametri**:

- `options` (opzionale): `UseCommunicationsOptions`
  - `status?`: `'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'` - Filtro stato
  - `type?`: `'push' | 'email' | 'sms' | 'all'` - Filtro tipo
  - `limit?`: `number` - Limite risultati
  - `offset?`: `number` - Offset paginazione
  - `autoRefresh?`: `boolean` - Auto-refresh ogni 30s (default: false)

**Output**: Oggetto con:

- `communications`: `Communication[]` - Array comunicazioni
- `totalCount`: `number | null` - Totale comunicazioni (solo con API route)
- `loading`: `boolean` - Stato caricamento
- `error`: `Error | null` - Errore
- `fetchCommunications()`: `Promise<void>` - Ricarica lista
- `fetchCommunicationById(id)`: `Promise<Communication | null>` - Fetch singola con recipients
- `createCommunication(input)`: `Promise<Communication | null>` - Crea comunicazione
- `updateCommunication(id, input)`: `Promise<Communication | null>` - Aggiorna comunicazione
- `deleteCommunication(id)`: `Promise<boolean>` - Elimina comunicazione
- `sendCommunication(id)`: `Promise<{ success: boolean; error?: string; message?: string }>` - Invia comunicazione
- `resetCommunication(id)`: `Promise<boolean>` - Reset comunicazione bloccata
- `cancelCommunication(id)`: `Promise<boolean>` - Cancella comunicazione programmata

**Descrizione**: Hook completo per CRUD comunicazioni con:

- Fetch lista con filtri e paginazione (API route o fallback query diretta)
- Fetch singola con recipients
- CRUD completo (create, update, delete)
- Invio comunicazione (API route gestisce creazione recipients + invio)
- Reset comunicazioni bloccate
- Cancellazione comunicazioni programmate
- Auto-refresh opzionale (ogni 30s)

---

## 🔄 Flusso Logico

### Fetch Communications

1. **Tentativo API Route** (preferito):
   - GET `/api/communications/list?status=X&type=Y&limit=Z&offset=W`
   - Ritorna `{ data: Communication[], count: number }`
2. **Fallback Query Diretta** (se API fallisce):
   - Query Supabase `communications` con filtri
   - `totalCount` = null (non disponibile con fallback)

### Create Communication

1. Verifica utente autenticato
2. Costruisce `communicationData`:
   - `created_by`: `user.id`
   - `title`, `message`, `type`
   - `status`: `'scheduled'` se `scheduled_for`, altrimenti `'draft'`
   - `recipient_filter`: JSONB
   - `total_recipients`, `total_sent`, etc.: 0
3. INSERT in `communications`
4. Refresh lista automatica

### Update Communication

1. Costruisce `updateData` con solo campi definiti
2. UPDATE `communications` WHERE `id = id`
3. Refresh lista automatica

### Send Communication

1. Chiama API route POST `/api/communications/send`:
   - Body: `{ communicationId: id }`
2. API gestisce:
   - Creazione `communication_recipients` da `recipient_filter`
   - Invio effettivo (push/email/SMS) via provider esterni
   - Aggiornamento stato a 'sent' o 'failed'
3. Refresh lista automatica

### Reset Communication

1. UPDATE `communications`:
   - SET `status = 'draft'`
   - WHERE `id = id` AND `status IN ('sending', 'failed')`
2. Refresh lista automatica

### Cancel Communication

1. UPDATE `communications`:
   - SET `status = 'cancelled'`
   - WHERE `id = id` AND `status IN ('draft', 'scheduled')`
2. Refresh lista automatica

---

## 📊 Tipi

### CreateCommunicationInput

```typescript
{
  title: string
  message: string
  type: 'push' | 'email' | 'sms' | 'all'
  recipient_filter: RecipientFilter
  scheduled_for?: string | null
  metadata?: Record<string, unknown>
}
```

### UpdateCommunicationInput

```typescript
{
  title?: string
  message?: string
  type?: 'push' | 'email' | 'sms' | 'all'
  recipient_filter?: RecipientFilter
  scheduled_for?: string | null
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}
```

### RecipientFilter

```typescript
{ all_users: true } | { role: 'atleta' } | { athlete_ids: string[] }
```

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `Tables`, `RecipientFilter` (service)

**Utilizzato da**: `useCommunicationsPage`, componenti comunicazioni

---

## ⚠️ Note Tecniche

- **API Route Preferita**: Usa API route `/api/communications/list` per count totale (fallback a query diretta)
- **Auto-Refresh**: Refresh automatico ogni 30s se `autoRefresh: true`
- **Send via API**: Invio gestito da API route (creazione recipients + invio provider esterni)
- **Error Handling**: Gestisce errori con fallback graceful

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
