# Chat – Documentazione schema, RLS, RPC e fix (2026-02-08)

## 1. Panoramica

La chat usa tre tabelle principali:

| Tabella          | Ruolo                                                                 |
|------------------|-----------------------------------------------------------------------|
| **profiles**     | Utenti (id, user_id, nome, cognome, role, avatar, avatar_url, org_id) |
| **chat_messages**| Messaggi: sender_id, receiver_id → profiles(id); message, type, read_at, file_* |
| **pt_atleti**    | Relazione PT–atleta (pt_id, atleta_id); usata da check_pt_athlete_relationship |

L’app (dashboard chat e home chat) chiama la RPC `get_conversation_participants(user_uuid)` per la lista conversazioni e fa SELECT/INSERT/UPDATE diretti su `chat_messages` per messaggi, invio e “segna come letto”.

---

## 2. Tabelle e constraint (riferimento)

### chat_messages
- **Colonne**: id, sender_id, receiver_id, message, type (default 'text'), file_url, file_name, file_size, read_at, created_at, updated_at
- **FK**: sender_id → profiles(id), receiver_id → profiles(id)
- **Indici**: pkey(id), idx_chat_messages_conversation_optimized (sender_id, receiver_id, created_at DESC), idx_chat_messages_sender_created, idx_chat_messages_receiver_created, idx_chat_messages_unread (receiver_id, read_at) WHERE read_at IS NULL

### profiles (campi usati dalla chat)
- id, user_id (→ auth.users), nome, cognome, first_name, last_name, email, role, avatar, avatar_url, org_id

### pt_atleti
- id, pt_id → profiles(id), atleta_id → profiles(id), UNIQUE(pt_id, atleta_id)

---

## 3. RLS chat_messages (stato dopo i fix)

| Policy                         | Operazione | Chi può |
|--------------------------------|------------|--------|
| chat_messages_select_conversation | SELECT | Utente è sender o receiver **e** sender e receiver hanno lo **stesso org_id** (e utente in quell’org) |
| chat_messages_insert_same_org     | INSERT | Utente è sender **e** receiver nella **stessa org** |
| chat_messages_update_own          | UPDATE | Solo **mittente** (es. modificare messaggio) |
| **chat_messages_receiver_mark_read** | UPDATE | Solo **destinatario** (es. segnare come letto) – *aggiunta 2026-02-08* |
| chat_messages_delete_own          | DELETE | Solo mittente |

Regola di fatto: **chat consentita solo tra profili con lo stesso org_id**.

---

## 4. RPC

### get_conversation_participants(user_uuid UUID)
- **Tipo**: SECURITY DEFINER
- **Ritorno**: other_user_id, other_user_name, other_user_role, last_message_at, unread_count, avatar
- **Logica (dopo fix 2026-02-08)**: restituisce solo partecipanti nella **stessa org** dell’utente (WHERE p.org_id = (SELECT org_id FROM my_profile)), ordinati per last_message_at DESC.
- **Scopo**: allineare la lista conversazioni alle policy RLS (stesso org per SELECT/INSERT).

### check_pt_athlete_relationship(sender_uuid, receiver_uuid UUID)
- **Tipo**: SECURITY DEFINER
- **Ritorno**: boolean
- **Logica**: true se i due user_id sono in relazione PT–atleta in pt_atleti (in un verso o nell’altro). Non usata dalle policy attuali; disponibile per eventuali restrizioni “solo PT–atleta”.

---

## 5. Problemi individuati e fix applicati

### Fix 1 – Segna come letto (migration 20260208_chat_messages_rls_receiver_mark_read.sql)
- **Problema**: la policy UPDATE consentiva solo al **mittente** di aggiornare; l’app segna come letti come **destinatario** → 0 righe aggiornate, unread non si azzerava.
- **Soluzione**: policy **chat_messages_receiver_mark_read** che consente al **receiver** di fare UPDATE sulle righe dove è receiver_id.

### Fix 2 – Lista conversazioni vs RLS (migration 20260208_rpc_chat_conversations_same_org.sql)
- **Problema**: la RPC restituiva tutte le conversazioni; SELECT/INSERT su chat_messages richiedono stesso org → in lista potevano comparire chat non utilizzabili (messaggi vuoti o invio bloccato).
- **Soluzione**: RPC riscritta con filtro **stesso org_id** (CTE my_profile + WHERE p.org_id = (SELECT org_id FROM my_profile)).

---

## 6. Punti lasciati volutamente così

- **Verifica org_id**: se due profili (es. stesso nome, admin vs atleta) hanno org_id diversi, la chat tra loro non funziona (RLS). In caso di dubbi, verificare con una query su `profiles` (id, org_id, nome, cognome, role).
- **Gestione errore markAsRead in UI**: in caso di fallimento dell’UPDATE (rete/RLS), l’errore è solo loggato; nessun toast o retry. Opzionale per il futuro.

---

## 7. Query SQL utili (riferimento)

### Lista conversazioni (equivalente RPC, con auth.uid())
```sql
WITH my_profile AS (
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1
),
conversations AS (
  SELECT 
    CASE WHEN cm.sender_id = (SELECT id FROM my_profile) THEN cm.receiver_id ELSE cm.sender_id END AS other_user_id,
    MAX(cm.created_at) AS last_message_at,
    COUNT(CASE WHEN cm.receiver_id = (SELECT id FROM my_profile) AND cm.read_at IS NULL THEN 1 END) AS unread_count
  FROM chat_messages cm
  WHERE cm.sender_id = (SELECT id FROM my_profile) OR cm.receiver_id = (SELECT id FROM my_profile)
  GROUP BY other_user_id
)
SELECT p.id AS other_user_id,
  COALESCE(p.nome || ' ' || p.cognome, p.first_name || ' ' || p.last_name, 'Utente') AS other_user_name,
  p.role AS other_user_role, c.last_message_at, c.unread_count::INTEGER,
  COALESCE(p.avatar_url, p.avatar) AS avatar
FROM conversations c
JOIN profiles p ON p.id = c.other_user_id
ORDER BY c.last_message_at DESC;
```

### Messaggi tra due profili (sostituire gli UUID)
```sql
SELECT id, sender_id, receiver_id, message, type, file_url, file_name, file_size, read_at, created_at, updated_at
FROM chat_messages
WHERE (sender_id = 'PROFILE_A' AND receiver_id = 'PROFILE_B')
   OR (sender_id = 'PROFILE_B' AND receiver_id = 'PROFILE_A')
ORDER BY created_at ASC;
```

### Profilo corrente
```sql
SELECT id, user_id, role, org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
```

---

## 8. Codice app (riferimento)

- **Lista conversazioni**: `src/hooks/chat/use-chat-conversations.ts` → RPC `get_conversation_participants(user.id)` + merge atleti (stesso org) / PT se atleta.
- **Messaggi**: `src/hooks/chat/use-chat-messages.ts` → due SELECT su chat_messages (sender/receiver), merge e sort; markAsRead con UPDATE dove receiver_id = getCurrentProfileId(); sendMessage con INSERT.
- **Profilo**: `src/hooks/chat/use-chat-profile.ts` → getCurrentProfileId() da profiles dove user_id = auth.
- **Realtime**: `src/hooks/chat/use-chat-realtime-optimized.ts` → canale su chat_messages con filter receiver_id=eq.{profileId} (e sender_id per DELETE).

---

## 9. Migrazioni coinvolte (ordine)

1. `20260208_chat_messages_rls_receiver_mark_read.sql` – policy UPDATE per receiver (segna come letto)
2. `20260208_rpc_chat_conversations_same_org.sql` – RPC get_conversation_participants filtrata per stesso org_id

Eseguire in questo ordine sul database.

---

## 10. UI e layout (viewport 1200×800)

La pagina chat dashboard è adattata per viewport minimo **1200×800 px**: nessuno scroll dell’intera pagina, scroll solo nelle aree dedicate.

### 10.1 Layout generale
- **Pagina** (`src/app/dashboard/chat/page.tsx`): root `h-full min-h-0 flex flex-col overflow-hidden`; contenuto interno con header (shrink-0), riga a due colonne (flex-1 min-h-0 overflow-hidden).
- **Layout dashboard** (`src/components/shared/dashboard/role-layout.tsx`): FadeInWrapper con `flex-1 flex flex-col min-h-0`; div contenuto `flex-1 min-h-0 flex flex-col overflow-auto` così l’altezza si propaga e la chat può usare `h-full` senza scroll di pagina.

### 10.2 Breakpoint
- Breakpoint unico: **min-[1200px]** (sostituisce il precedente 1280px).
- Sotto 1200px: lista conversazioni 280px, padding e font più compatti.
- Da 1200px: lista 320px (w-80), padding e titoli maggiori.

### 10.3 Lista conversazioni (`ConversationList`)
- **Avatar**: uso del componente `Avatar` con `conversation.avatar` (da RPC); fallback iniziali da `other_user_name`.
- **Scroll**: contenitore lista con `flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain max-h-[852px]` (~14 righe visibili: 56px×14 + gap + padding). Colonna lista con `overflow-hidden` per vincolare l’altezza.
- **Card**: `min-h-[56px]`, padding e gap responsive.

### 10.4 Area messaggi (`MessageList`)
- Root MessageList: `max-h-full overflow-hidden`; unica area scrollabile è il div messaggi con `flex-1 min-h-0 overflow-y-auto`.
- Colonna chat e wrapper messaggi con `overflow-hidden` così lo scroll avviene solo nella lista messaggi.

---

## 11. Corrispondenza conversazione selezionata / messaggi mostrati

I messaggi in Supabase sono sempre per coppia (sender_id, receiver_id). Per evitare di mostrare messaggi di un atleta quando ne è selezionato un altro (ritardo fetch o stato incoerente), in pagina sono stati introdotti:

### 11.1 Condizione di visualizzazione
- Messaggi e input si mostrano **solo** se  
  `currentConversation?.participant.other_user_id === selectedConversationId`.  
  Altrimenti non si usa più la conversazione “vecchia” mentre si carica quella nuova.

### 11.2 Stati UI
- **Conversazione selezionata e caricata** (id coincidono): si mostrano MessageList e MessageInput.
- **Conversazione selezionata ma non ancora caricata** (es. fetch in corso): si mostra card “Caricamento conversazione…” con spinner.
- **Nessuna conversazione selezionata**: si mostra “Seleziona una conversazione”.

### 11.3 Filtro di sicurezza sui messaggi
- `messagesForSelected`: `useMemo` che da `currentConversation.messages` tiene solo i messaggi in cui  
  `sender_id === selectedConversationId || receiver_id === selectedConversationId`.  
  A `MessageList` si passano questi messaggi filtrati.
- Garantisce che, anche in caso di stato o cache incoerenti, non vengano mai mostrati messaggi di un atleta diverso da quello selezionato.

---

## 12. Riepilogo file modificati (chat)

| File | Modifiche |
|------|-----------|
| `supabase/migrations/20260208_chat_messages_rls_receiver_mark_read.sql` | Policy UPDATE per receiver (segna come letto) |
| `supabase/migrations/20260208_rpc_chat_conversations_same_org.sql` | RPC lista conversazioni filtrata per org_id |
| `supabase/migrations/20260208_chat_documentation.md` | Questa documentazione |
| `src/app/dashboard/chat/page.tsx` | Layout 1200×800, overflow-hidden, condizione id conversazione, stato Caricamento, `messagesForSelected` |
| `src/components/chat/conversation-list.tsx` | Avatar, scroll, max-h 14 righe, breakpoint 1200px |
| `src/components/chat/message-list.tsx` | Root overflow-hidden, scroll solo area messaggi |
| `src/components/shared/dashboard/role-layout.tsx` | Catena flex (FadeInWrapper + div) per h-full e scroll interno |
