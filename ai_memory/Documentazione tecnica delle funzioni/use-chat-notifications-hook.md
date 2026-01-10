# 📚 Documentazione Tecnica: useChatNotifications

**Percorso**: `src/hooks/use-chat-notifications.ts`  
**Tipo Modulo**: React Hook (Notifications Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione notifiche chat. Ascolta nuovi messaggi via realtime e crea notifiche automatiche per il destinatario.

---

## 🔧 Funzioni e Export

### 1. `useChatNotifications`

**Classificazione**: React Hook, Notifications Hook, Client Component, Side-Effecting  
**Tipo**: `() => { notifyMessageSent: (receiverId, message, type) => Promise<void> }`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `notifyMessageSent(receiverId, message, type)`: `(receiverId: string, message: string, type: 'text' | 'file') => Promise<void>` - Invia notifica quando messaggio inviato

**Descrizione**: Hook per notifiche chat con:

- Sottoscrizione realtime `chat_messages` (INSERT)
- Crea notifica automatica quando nuovo messaggio per utente corrente
- Funzione per inviare notifica quando messaggio inviato
- Fetch profilo mittente/destinatario per nomi

---

## 🔄 Flusso Logico

### Realtime Subscription

1. **Sottoscrizione**:
   - Sottoscrive `postgres_changes` su `chat_messages` (event: INSERT)

2. **On New Message**:
   - Verifica `message.receiver_id === currentProfileId`
   - Fetch profilo mittente: `profiles` WHERE `id = sender_id`
   - Crea notifica:
     - Titolo: `💬 Nuovo messaggio da ${senderName}`
     - Body: messaggio (troncato a 40 caratteri) o "📎 Hai ricevuto un file"
     - Type: 'chat'
     - Link: '/home/chat' (atleta) o `/dashboard/atleti/${receiverId}/chat` (staff)
     - Action: 'Rispondi'

### Notify Message Sent

1. Fetch profilo destinatario: `profiles` WHERE `id = receiverId`
2. Crea notifica per destinatario (stesso formato di sopra)

---

## 📊 Dipendenze

**Dipende da**: React (`useEffect`, `useCallback`, `useRef`), `createClient` (Supabase), `useNotifications`

**Utilizzato da**: Componenti chat, layout

---

## ⚠️ Note Tecniche

- **Profile ID Caching**: Usa `profileIdRef` per cache profile ID (evita fetch multipli)
- **Message Truncation**: Tronca messaggio a 40 caratteri per notifica
- **File Messages**: Notifica speciale per messaggi file

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
