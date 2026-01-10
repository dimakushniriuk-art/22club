# 📚 Documentazione Tecnica: useRealtimeChannel

**Percorso**: `src/hooks/useRealtimeChannel.ts`  
**Tipo Modulo**: React Hook (Realtime Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per sottoscrizioni realtime Supabase. Fornisce hooks per sottoscriversi a tabelle (postgres_changes) e canali custom, con cleanup automatico.

---

## 🔧 Funzioni e Export

### 1. `useRealtimeChannel`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `<TableName>(table: TableName, onEvent: (payload) => void, eventType?: TableEvent) => void`

**Parametri**:

- `table`: `TableName` - Nome tabella (keyof Database['public']['Tables'])
- `onEvent`: `(payload: RealtimePostgresChangesPayload) => void` - Handler eventi
- `eventType`: `'INSERT' | 'UPDATE' | 'DELETE' | '*'` - Tipo eventi (default: '\*')

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook per sottoscrizione realtime tabella con:

- Sottoscrizione `postgres_changes` su tabella specifica
- Filtro per tipo evento (INSERT/UPDATE/DELETE/\*)
- Cleanup automatico al unmount
- Mantiene riferimento `onEvent` aggiornato (usa `useRef`)

### 2. `useCustomChannel`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `<T>(channelName: string | null, eventName: string, onEvent: (payload: T) => void) => void`

**Parametri**:

- `channelName`: `string | null` - Nome canale (null = no subscription)
- `eventName`: `string` - Nome evento
- `onEvent`: `(payload: T) => void` - Handler eventi

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook per sottoscrizione canale custom con:

- Sottoscrizione canale custom Supabase
- Skip se `channelName` null
- Cleanup automatico

### 3. `useRealtimeNotifications`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `(userId?: string) => void`

**Parametri**:

- `userId?`: `string` - ID utente

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook specializzato per notifiche realtime (INSERT su `notifications` per `userId`)

### 4. `useAppointmentsRealtime`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `(orgId?: string) => void`

**Parametri**:

- `orgId?`: `string` - ID organizzazione

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook specializzato per appuntamenti realtime (tutti eventi su `appointments` per `orgId`)

### 5. `useDocumentsRealtime`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `(orgId?: string) => void`

**Parametri**:

- `orgId?`: `string` - ID organizzazione

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook specializzato per documenti realtime (tutti eventi su `documents` per `orgId`)

### 6. `useChatRealtime`

**Classificazione**: React Hook, Realtime Hook, Client Component, Side-Effecting  
**Tipo**: `(chatId?: string) => void`

**Parametri**:

- `chatId?`: `string` - ID chat

**Output**: Nessuno (side-effect hook)

**Descrizione**: Hook specializzato per chat realtime (canale custom `chat:${chatId}`)

---

## 🔄 Flusso Logico

### useRealtimeChannel

1. Mantiene `onEventRef.current = onEvent` (aggiornato quando cambia)
2. Sottoscrive: `subscribeToTable(table, (payload) => onEventRef.current(payload), eventType)`
3. Cleanup: unsubscribe al unmount

### useCustomChannel

1. Se `channelName` null → return (no subscription)
2. Mantiene `onEventRef.current = onEvent`
3. Sottoscrive: `subscribeToChannel(channelName, eventName, (payload) => onEventRef.current(payload))`
4. Cleanup: unsubscribe al unmount

---

## 📊 Dipendenze

**Dipende da**: React (`useEffect`, `useRef`), `subscribeToTable`, `subscribeToChannel` (realtimeClient), tipo `Database`

**Utilizzato da**: Componenti che necessitano realtime updates

---

## ⚠️ Note Tecniche

- **Ref Pattern**: Usa `useRef` per mantenere handler aggiornato senza ri-sottoscrivere
- **Cleanup**: Cleanup automatico al unmount per evitare memory leaks
- **Type Safety**: Type-safe con Database types

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
