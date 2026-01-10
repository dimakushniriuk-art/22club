# 📚 Documentazione Tecnica: useChatConversations

**Percorso**: `src/hooks/chat/use-chat-conversations.ts`  
**Tipo Modulo**: React Hook (Chat Conversations Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:58:00Z

---

## 📋 Panoramica

Hook per gestione conversazioni chat. Fornisce funzione per fetch conversazioni usando RPC ottimizzata o fallback query diretta. Include logica speciale per staff (mostra tutti gli atleti anche senza messaggi).

---

## 🔧 Funzioni e Export

### 1. `useChatConversations`

**Classificazione**: React Hook, Chat Management Hook, Client Component, Async  
**Tipo**: `(getCurrentProfileId, onSuccess, onError) => { fetchConversations: () => Promise<void> }`

**Parametri**:

- `getCurrentProfileId` (function): `() => Promise<string>` - Funzione per ottenere profile ID corrente
- `onSuccess` (function): `(conversations: ConversationParticipantExtended[]) => void` - Callback successo
- `onError` (function): `(error: string) => void` - Callback errori

**Output**: Oggetto con:

- `fetchConversations()`: `Promise<void>` - Fetch conversazioni

**Descrizione**: Hook per fetch conversazioni con:

- RPC ottimizzata `get_conversation_participants` (preferita)
- Fallback query diretta se RPC non disponibile
- Logica speciale per staff: mostra tutti gli atleti anche senza messaggi
- Ordinamento per `last_message_at` DESC

---

## 🔄 Flusso Logico

### Fetch Conversations

1. Verifica utente autenticato
2. Ottiene `profileId` corrente
3. **Tentativo RPC**:
   - Chiama `supabase.rpc('get_conversation_participants', { user_uuid: user.id })`
   - Se successo → mappa risultati a `ConversationParticipantExtended[]`
   - Parsing nome completo in `nome` e `cognome`
4. **Fallback Query Diretta** (se RPC fallisce):
   - Query `chat_messages` per trovare partecipanti
   - Estrae `other_user_id` unici
   - Query `profiles` per dettagli partecipanti
   - Mappa a `ConversationParticipantExtended[]`
5. **Logica Staff** (se role è staff/admin/pt/trainer):
   - Query tutti gli atleti dell'organizzazione
   - Aggiunge atleti senza conversazioni esistenti
   - Merge con conversazioni esistenti
6. **Ordinamento**:
   - Ordina per `last_message_at` DESC
   - Gestisce date invalide (default: 1970-01-01)
7. Chiama `onSuccess(conversationsList)`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), tipo `ConversationParticipant`, `ConversationParticipantExtended`

**Utilizzato da**: Componenti chat per lista conversazioni

---

## ⚠️ Note Tecniche

- **RPC Ottimizzata**: Usa RPC `get_conversation_participants` se disponibile (performance migliore)
- **Fallback**: Query diretta se RPC non disponibile (compatibilità)
- **Staff Logic**: Staff vede tutti gli atleti anche senza messaggi (UX migliore)
- **Parsing Nome**: Parsing intelligente nome completo in `nome` e `cognome`
- **Ordinamento**: Ordina per ultimo messaggio, gestisce date invalide

---

**Ultimo aggiornamento**: 2025-02-01T23:58:00Z
