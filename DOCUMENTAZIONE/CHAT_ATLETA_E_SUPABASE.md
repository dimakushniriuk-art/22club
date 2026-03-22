# Chat atleta e Supabase – Documentazione completa

Riferimento unico per la **pagina chat atleta** (home) e per la **configurazione Supabase** (tabelle, RLS, RPC) usata dalla chat.

---

## 1. Pagina chat atleta

### 1.1 Route e scopo

- **Route**: `src/app/home/chat/page.tsx` → `/home/chat`
- **Utente**: atleta (profilo con role atleta/athlete)
- **Scopo**: conversazione con il **Personal Trainer (PT)** assegnato; possibilità di scrivere per primo e di eliminare i propri messaggi.

### 1.2 Flusso dati

1. **Profilo corrente**: `useAuth()` → `user` (profiles.id usato come `currentUserId`).
2. **PT assegnato**:
   - Lettura da `pt_atleti` (`.eq('atleta_id', user.id)`) per ottenere `pt_id`.
   - Dati nome/avatar: RPC **`get_my_trainer_profile()`** (SECURITY DEFINER). Se la RPC fallisce, fallback: nome "Personal Trainer", nessun avatar.
3. **Lista conversazioni**: hook `useChat()` → RPC **`get_conversation_participants(user.id)`** (filtrata per stesso `org_id`).
4. **Conversazione attiva**:
   - Se esiste una conversazione con il PT (per `other_user_id === pt_id`), si usa quella.
   - Se non c’è ancora nessun messaggio ma c’è un PT, si usa una **effectiveConversation** sintetica (participant = PT, `messages: []`, `isLoading: true`) così l’atleta vede subito header + input e può scrivere per primo.
5. **Auto-selezione**: useEffect seleziona automaticamente la conversazione con il PT (per id o per ruolo pt/trainer) o la prima disponibile; se non ci sono conversazioni ma c’è il PT, chiama `setCurrentConversation(personalTrainer.id)` per avviare il caricamento messaggi.

### 1.3 Header

- Nome e ruolo mostrati: se la conversazione è con il PT assegnato (`effectiveConversation.participant.other_user_id === personalTrainer.id`) si usano sempre **personalTrainer.nome/cognome** e label **"Personal Trainer"** (e avatar da PT). Altrimenti si usano i dati dalla conversazione (other_user_name, other_user_role, avatar).
- Indietro: `router.back()`.

### 1.4 Invio messaggi

- **handleSendMessage**: usa `otherUserId = currentConversation?.participant?.other_user_id ?? personalTrainer?.id`, poi `sendMessage(otherUserId, text, type, file?)`.
- L’hook `useChat` → `useChatMessages` esegue **INSERT** su `chat_messages` con `sender_id = getCurrentProfileId()`, `receiver_id = otherUserId`. La policy INSERT (stesso org o PT assegnato) autorizza l’atleta a inviare al PT.

### 1.5 Eliminazione messaggi

- **Delete senza fetch preliminare**: l’app **non** fa più una SELECT sul messaggio prima di eliminarlo (quella SELECT poteva fallire per RLS “stesso org” quando l’atleta non può leggere il profilo del PT).
- Flusso: **DELETE** diretto su `chat_messages` con `.eq('id', messageId).eq('sender_id', profileId).select('id')`. Se la policy DELETE consente (solo mittente), la riga viene eliminata; se non c’è riga o non si ha permesso, si considera “Messaggio non trovato o non eliminabile”.

### 1.6 Stati UI

- Auth in caricamento: skeleton.
- Errore da `useChat`: card con messaggio e pulsante “Riprova” (`fetchConversations()`).
- Nessuna conversazione:
  - Se sta ancora caricando il PT: header + “Caricamento…”
  - Se non c’è PT assegnato: “Nessuna conversazione”.
  - Se c’è PT ma nessuna conversazione: si mostra la chat con effectiveConversation sintetica (header PT + “Caricamento messaggi…” + input abilitato).
- Nessuna effectiveConversation: “Caricamento…” generico.
- Chat piena: header + MessageList + MessageInput (e delete sui propri messaggi).

### 1.7 File coinvolti (app)

| File                                        | Ruolo                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/app/home/chat/page.tsx`                | Pagina chat atleta (PT, effectiveConversation, header, invio, stati)                           |
| `src/hooks/use-chat.ts`                     | useChat: conversazioni, corrente, sendMessage, deleteMessage, uploadFile, …                    |
| `src/hooks/chat/use-chat-messages.ts`       | Fetch messaggi, sendMessage, markAsRead, **deleteMessage** (DELETE diretto, senza fetch prima) |
| `src/hooks/chat/use-chat-conversations.ts`  | Lista conversazioni (RPC get_conversation_participants)                                        |
| `src/components/chat/message-list.tsx`      | Lista messaggi, delete con conferma                                                            |
| `src/components/chat/message-input.tsx`     | Input testo/file, invio                                                                        |
| `src/components/chat/conversation-list.tsx` | Lista conversazioni (icona pt/trainer)                                                         |

---

## 2. Supabase – Struttura e policy

### 2.1 Tabelle principali

| Tabella           | Ruolo                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **profiles**      | id, user_id, nome, cognome, role, avatar_url, org_id (usati da chat e RPC)                                                |
| **chat_messages** | id, sender_id, receiver_id → profiles(id), message, type, file_url, file_name, file_size, read_at, created_at, updated_at |
| **pt_atleti**     | pt_id, atleta_id → profiles(id); relazione PT–atleta (lista chat, PT assegnato, policy INSERT)                            |

### 2.2 chat_messages – Colonne e indici

- **Colonne**: id (uuid), sender_id, receiver_id, message (text), type (default 'text'), file_url, file_name, file_size, read_at (timestamptz), created_at, updated_at.
- **Indici**: pkey(id), idx_chat_messages_conversation_optimized (sender_id, receiver_id, created_at DESC), idx_chat_messages_sender_created, idx_chat_messages_receiver_created, idx_chat_messages_unread (receiver_id, read_at) WHERE read_at IS NULL.

### 2.3 RLS chat_messages (stato attuale)

| Policy                                | Operazione | Comportamento                                                                                                                                                                                                                                                            |
| ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **chat_messages_select_conversation** | SELECT     | Utente è sender o receiver; può essere richiesto stesso org (subquery su profiles). Nota: se la policy usa lettura profilo dell’altro utente, l’atleta senza permesso di leggere il PT può non vedere righe; con RLS disabilitato o policy rilassate la SELECT funziona. |
| **chat_messages_insert_same_org**     | INSERT     | Utente è sender **e** (stesso org **oppure** receiver è il PT assegnato). Vedi funzioni sotto.                                                                                                                                                                           |
| **chat_messages_receiver_mark_read**  | UPDATE     | Destinatario può aggiornare (es. read_at).                                                                                                                                                                                                                               |
| **chat_messages_update_own**          | UPDATE     | Mittente può aggiornare.                                                                                                                                                                                                                                                 |
| **chat_messages_delete_own**          | DELETE     | Solo mittente (sender_id = profilo corrente).                                                                                                                                                                                                                            |

### 2.4 Funzioni helper per RLS chat (INSERT)

- **chat_profiles_same_org(profile_id_a, profile_id_b)**  
  SECURITY DEFINER, STABLE. Restituisce true se i due profili hanno lo stesso `org_id` non null. Usata nella policy INSERT per evitare che l’atleta debba leggere il profilo del PT (che non ha permesso SELECT).

- **chat_receiver_is_assigned_pt(sender_id, receiver_id)**  
  SECURITY DEFINER, STABLE. Restituisce true se in `pt_atleti` esiste la riga con `atleta_id = sender_id` e `pt_id = receiver_id`. Consente all’atleta di inviare messaggi al proprio PT anche con org_id null o diversi.

Policy INSERT (dopo le migration 20260223):

```text
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND (
    public.chat_profiles_same_org(sender_id, receiver_id)
    OR public.chat_receiver_is_assigned_pt(sender_id, receiver_id)
  )
)
```

### 2.5 RPC

- **get_conversation_participants(user_uuid UUID)**  
  SECURITY DEFINER. Restituisce: other_user_id, other_user_name, other_user_role, last_message_at, unread_count, avatar. Solo partecipanti nella **stessa org** dell’utente (WHERE p.org_id = my_profile.org_id). Usata per la lista conversazioni.

- **get_my_trainer_profile()**  
  SECURITY DEFINER. Restituisce pt_nome, pt_cognome, pt_email, pt_telefono, pt_avatar_url per l’atleta corrente (riga in pt_atleti dove atleta_id = profilo corrente). Usata dalla pagina atleta per nome/avatar del PT senza dover leggere la riga profiles del PT (policy “Athletes can view assigned trainer profile” è stata rimossa perché causava problemi al login).

### 2.6 pt_atleti – RLS

- La policy **SELECT** (es. “Trainers can view own pt_atleti”) deve permettere all’**atleta** di vedere la propria riga: condizione tipo `atleta_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`. Così l’app può leggere `pt_id` per caricare il PT e costruire la conversazione/header.

---

## 3. Fix applicati (riepilogo)

1. **INSERT atleta → PT bloccato (42501)**
   - Causa: policy INSERT verificava “stesso org” leggendo da `profiles` il receiver; l’atleta non può leggere il profilo del PT.
   - Soluzione: funzioni SECURITY DEFINER `chat_profiles_same_org` e `chat_receiver_is_assigned_pt`; policy INSERT riscritta per usare quelle funzioni (stesso org **oppure** receiver = PT assegnato). Migration: `20260223_chat_messages_insert_same_org_rpc.sql`, `20260223_chat_messages_insert_allow_pt_athlete.sql`.

2. **Delete messaggio: “Error fetching message before delete” / “Messaggio non trovato”**
   - Causa: il codice faceva una SELECT sul messaggio prima del DELETE; la SELECT era bloccata dalla policy (stesso org / lettura profilo PT).
   - Soluzione: eliminato il fetch preliminare; si esegue solo **DELETE** con `.eq('id', messageId).eq('sender_id', profileId).select('id')`. La policy DELETE (solo mittente) è l’unica verifica. File: `src/hooks/chat/use-chat-messages.ts`.

3. **Profilo PT non leggibile dall’atleta**
   - La policy “Athletes can view assigned trainer profile” su `profiles` è stata rimossa (rollback) perché causava “Profilo non trovato” al login. La chat non legge più il profilo del PT da `profiles`; usa `get_my_trainer_profile()` e, per l’header, i dati della conversazione o del PT caricato da pt_atleti + RPC.

4. **Test RLS disabilitato**
   - Migration `20260223_chat_messages_disable_rls_test.sql`: disabilita RLS su `chat_messages` per test. Rollback: `20260223_chat_messages_enable_rls_rollback.sql`. In produzione si può lasciare RLS attivo e usare le policy con le due funzioni sopra.

---

## 4. Migration e script (riferimento)

| File                                                 | Descrizione                                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `20260208_chat_messages_rls_receiver_mark_read.sql`  | Policy UPDATE receiver (segna come letto).                                                |
| `20260208_rpc_chat_conversations_same_org.sql`       | RPC get_conversation_participants filtrata per org_id.                                    |
| `20260213_fix_profiles_recursion_use_rpc.sql`        | Rimozione policy atleta-view-trainer su profiles; creazione get_my_trainer_profile().     |
| `20260222_rollback_athlete_view_trainer_policy.sql`  | DROP policy “Athletes can view assigned trainer profile” (se ancora presente).            |
| `20260223_chat_messages_insert_same_org_rpc.sql`     | Funzione chat_profiles_same_org; policy INSERT con stessa funzione.                       |
| `20260223_chat_messages_insert_allow_pt_athlete.sql` | Funzione chat_receiver_is_assigned_pt; policy INSERT estesa (stesso org OR PT assegnato). |
| `20260223_chat_messages_disable_rls_test.sql`        | Disabilita RLS su chat_messages (solo test).                                              |
| `20260223_chat_messages_enable_rls_rollback.sql`     | Riabilita RLS su chat_messages.                                                           |
| `verify_chat_supabase.sql`                           | Verifica struttura chat_messages, policy, RPC, pt_atleti (eseguire in SQL Editor).        |
| `verify_chat_dima.sql`                               | Verifica profilo atleta, pt_atleti, messaggi, org_id (esempio email).                     |

---

## 5. Verifica rapida Supabase

In SQL Editor:

1. **Policy chat_messages**:  
   `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'chat_messages';`  
   Attese: SELECT, INSERT, 2× UPDATE, DELETE.

2. **Funzioni chat**:  
   `SELECT proname FROM pg_proc WHERE proname IN ('chat_profiles_same_org', 'chat_receiver_is_assigned_pt', 'get_conversation_participants', 'get_my_trainer_profile');`

3. **RLS**:  
   `SELECT rowsecurity FROM pg_tables WHERE tablename = 'chat_messages';`  
   Se si usa RLS: `true`; se si è in test con RLS disabilitato: `false`.

Documentazione schema/RLS generica chat: `supabase/migrations/20260208_chat_documentation.md`.
