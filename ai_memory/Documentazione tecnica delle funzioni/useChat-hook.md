# useChat Hook - Documentazione Tecnica

**File**: `src/hooks/use-chat.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 634  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Chat / Messaggistica
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client, React Query (implicito)
- **Utilizzato da**: Componenti chat (`message-list.tsx`, `conversation-list.tsx`, `message-input.tsx`)

---

## 🎯 Obiettivo

Gestire completamente il sistema di chat in tempo reale tra utenti (PT, Atleti, Admin), inclusa:

- Lista conversazioni
- Messaggi per conversazione
- Invio messaggi (testo e file)
- Notifiche chat
- Realtime subscriptions
- Gestione stato lettura

---

## 📥 Parametri

```typescript
// Nessun parametro esplicito
// Il hook usa internamente:
// - createClient() per Supabase
// - useChatNotifications() per notifiche
```

---

## 📤 Output / Return Value

```typescript
{
  state: ChatState {
    conversations: ConversationParticipantExtended[]
    currentConversation: ConversationParticipantExtended | null
    isLoading: boolean
    error: string | null
  }
  fetchConversations: () => Promise<void>
  fetchMessages: (otherUserId: string, limit?: number, offset?: number) => Promise<ChatMessage[]>
  sendMessage: (payload: NewMessagePayload) => Promise<ChatMessage | null>
  markAsRead: (messageId: string) => Promise<void>
  markConversationAsRead: (otherUserId: string) => Promise<void>
  uploadFile: (file: File, receiverId: string) => Promise<string | null>
  subscribeToMessages: (otherUserId: string, callback: (message: ChatMessage) => void) => () => void
  unsubscribeFromMessages: () => void
}
```

---

## 🔄 Flusso Logico

### 1. Inizializzazione

- Ottiene `currentProfileId` da Supabase Auth
- Inizializza stato con `conversations: []`, `currentConversation: null`

### 2. Fetch Conversazioni

- Usa RPC `get_conversation_participants` (ottimizzata)
- Fallback su query diretta `chat_messages` se RPC non disponibile
- Per staff (PT/Admin): aggiunge tutti gli atleti anche senza messaggi
- Ordina per `last_message_at` (più recenti prima)

### 3. Fetch Messaggi

- Query `chat_messages` con filtri `sender_id` e `receiver_id`
- Supporta paginazione (`limit`, `offset`)
- Ordina per `created_at` (più vecchi prima)

### 4. Invio Messaggio

- Inserisce in `chat_messages` con `type: 'text' | 'file' | 'system'`
- Aggiorna stato locale
- Triggera notifica via `useChatNotifications`
- Aggiorna `last_message_at` nella conversazione

### 5. Upload File

- Upload a Supabase Storage (bucket non specificato nel codice)
- Crea messaggio con `type: 'file'`, `file_url`, `file_name`, `file_size`

### 6. Realtime Subscriptions

- Sottoscrive a `chat_messages` per nuove entrate
- Filtra per `sender_id` o `receiver_id` = current user
- Aggiorna stato locale quando arrivano nuovi messaggi

### 7. Marca Come Letto

- Aggiorna `read_at` in `chat_messages`
- Aggiorna contatore `unread_count` nelle conversazioni

---

## 🗄️ Database

### Tabelle Utilizzate

**`chat_messages`**:

- `id` (uuid, PK)
- `sender_id` (uuid, FK → profiles.id)
- `receiver_id` (uuid, FK → profiles.id)
- `message` (text)
- `type` (text: 'text' | 'file' | 'system')
- `file_url` (text, nullable)
- `file_name` (text, nullable)
- `file_size` (integer, nullable)
- `read_at` (timestamp, nullable)
- `created_at` (timestamp)

**`profiles`**:

- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `nome`, `cognome` (text)
- `role` (text)
- `avatar` (text, nullable)

### RPC Functions

**`get_conversation_participants(user_uuid: uuid)`**:

- Restituisce lista partecipanti con `other_user_id`, `other_user_name`, `other_user_role`, `last_message_at`, `unread_count`
- Ottimizzata per performance

### Storage Buckets

- Bucket per file chat (non specificato nel codice, da verificare)

---

## ⚠️ Errori Possibili

1. **Utente non autenticato**: `Error('Utente non autenticato')`
2. **Profilo non trovato**: `Error('Profilo non trovato')`
3. **Errore Supabase**: Errori da query/insert/update Supabase
4. **Errore upload file**: Errori da Supabase Storage

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase/client`
- **useChatNotifications**: Hook per notifiche chat
- **Database**: `chat_messages`, `profiles` tables
- **Storage**: Bucket file chat (da verificare esistenza)
- **Realtime**: Supabase Realtime subscriptions

---

## 📝 Esempio Utilizzo

```typescript
import { useChat } from '@/hooks/use-chat'

function ChatPage() {
  const { state, fetchConversations, fetchMessages, sendMessage } = useChat()

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleSend = async (text: string, receiverId: string) => {
    await sendMessage({
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: text,
      type: 'text'
    })
  }

  return (
    <div>
      {state.conversations.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-001**: RLS su `chat_messages` - 0 righe visibili (13 reali) - già identificato ma non specifico
2. **⚠️ Storage bucket chat**: Non specificato nel codice, da verificare esistenza
3. **⚠️ Performance**: Query conversazioni può essere lenta con molti messaggi (fallback non ottimizzato)
4. **⚠️ Realtime subscriptions**: Possibile memory leak se non unsubscribe correttamente

---

## 📊 Metriche

- **Complessità Ciclomatica**: Alta (~15-20)
- **Dipendenze Esterne**: 2 (Supabase, useChatNotifications)
- **Side Effects**: Sì (database, storage, realtime)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e storage
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
