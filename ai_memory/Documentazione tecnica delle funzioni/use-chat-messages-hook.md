# 📚 Documentazione Tecnica: useChatMessages

**Percorso**: `src/hooks/chat/use-chat-messages.ts`  
**Tipo Modulo**: React Hook (Chat Messages Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:58:00Z

---

## 📋 Panoramica

Hook per gestione messaggi chat. Fornisce funzioni per fetch messaggi (con paginazione), invio messaggi (testo e file), e marcatura messaggi come letti.

---

## 🔧 Funzioni e Export

### 1. `useChatMessages`

**Classificazione**: React Hook, Chat Management Hook, Client Component, Async  
**Tipo**: `(getCurrentProfileId, conversations, onMessageUpdate, onError) => UseChatMessagesReturn`

**Parametri**:

- `getCurrentProfileId` (function): `() => Promise<string>` - Funzione per ottenere profile ID corrente
- `conversations` (array): `ConversationParticipant[]` - Lista conversazioni
- `onMessageUpdate` (function): `(otherUserId, messages, hasMore, isLoading) => void` - Callback aggiornamento messaggi
- `onError` (function): `(error: string) => void` - Callback errori

**Output**: Oggetto con:

- `fetchMessages(otherUserId, limit?, offset?, existingMessages?)`: `Promise<void>` - Fetch messaggi con paginazione
- `sendMessage(receiverId, message, type?, fileUrl?, fileName?, fileSize?, onSuccess?)`: `Promise<ChatMessage>` - Invia messaggio
- `markAsRead(otherUserId, onUpdate, currentMessages)`: `Promise<void>` - Marca messaggi come letti

**Descrizione**: Hook completo per gestione messaggi chat con paginazione, invio, e gestione lettura.

---

## 🔄 Flusso Logico

### Fetch Messages

1. Chiama `onMessageUpdate(otherUserId, existingMessages, false, true)` (loading)
2. Ottiene `profileId` corrente
3. Query Supabase:
   - Tabella: `chat_messages`
   - WHERE: `(sender_id = profileId AND receiver_id = otherUserId) OR (sender_id = otherUserId AND receiver_id = profileId)`
   - ORDER BY: `created_at DESC`
   - LIMIT/OFFSET: Paginazione
4. Normalizza tipo messaggio (`text`, `file`, `system`)
5. Combina con messaggi esistenti se offset > 0
6. Chiama `onMessageUpdate(otherUserId, combinedMessages, hasMore, false)`

### Send Message

1. Ottiene `senderProfileId` corrente
2. Crea payload messaggio:
   - `sender_id`: Profile ID corrente
   - `receiver_id`: ID destinatario
   - `message`: Testo messaggio
   - `type`: `'text' | 'file' | 'system'`
   - `file_url`, `file_name`, `file_size`: Opzionali per file
3. INSERT in `chat_messages`
4. Normalizza e formatta messaggio
5. Chiama `onSuccess` callback se fornito
6. Ritorna messaggio creato

### Mark As Read

1. Ottiene `receiverProfileId` corrente
2. UPDATE `chat_messages`:
   - SET `read_at = NOW()`
   - WHERE `receiver_id = receiverProfileId` AND `sender_id = otherUserId` AND `read_at IS NULL`
3. Aggiorna messaggi locali con `read_at` timestamp
4. Chiama `onUpdate(updatedMessages)`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `ChatMessage`, `ConversationParticipant`

**Utilizzato da**: Componenti chat per gestione messaggi

---

## ⚠️ Note Tecniche

- **Paginazione**: Supporta paginazione con `limit` e `offset`, combina messaggi esistenti
- **Normalizzazione Tipo**: Normalizza tipo messaggio a `'text' | 'file' | 'system'`
- **Bidirectional Query**: Query messaggi in entrambe le direzioni (sender/receiver)
- **Error Handling**: Gestisce errori con callback `onError`

---

**Ultimo aggiornamento**: 2025-02-01T23:58:00Z
