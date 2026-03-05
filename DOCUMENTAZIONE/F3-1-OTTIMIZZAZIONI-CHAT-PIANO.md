# Piano Implementazione F3.1 - Ottimizzazioni Chat (0% → 100%)

**Obiettivo**: Completare tutte le ottimizzazioni previste per il modulo Chat  
**Priorità**: 🟢 BASSA  
**Tempo stimato**: 2-3 ore  
**Stato attuale**: 0% (paginazione già implementata)

---

## 📋 Analisi Stato Attuale

### ✅ Già Implementato

1. **Paginazione messaggi** - ✅ Funziona con `.range(offset, limit)` in `use-chat-messages.ts`
2. **Hook real-time ottimizzato** - ✅ Esiste `use-chat-realtime-optimized.ts` con cleanup corretto
3. **Indici database** - ✅ Presenti nelle migrazioni:
   - `idx_chat_messages_sender`
   - `idx_chat_messages_receiver`
   - `idx_chat_messages_created_at`
   - `idx_chat_messages_receiver_created`
   - `idx_chat_messages_sender_created`
   - `idx_chat_messages_conversation_optimized` (migration 20250201)

### ⏳ Da Implementare

1. **Caching conversazioni** (TTL 5 min, strategia `frequent-query`)
2. **Caching messaggi** (ultimi 50 per conversazione, TTL 2 min)
3. **Invalidazione cache** quando si riceve nuovo messaggio
4. **Ottimizzazione subscription** (limitare a max 5 conversazioni attive, gestione cleanup)

---

## 🔧 Implementazione Dettagliata

### 1. Aggiungere Caching Conversazioni

**File**: `src/hooks/chat/use-chat-conversations.ts`

**Modifiche necessarie**:

```typescript
// Import aggiuntivo
import { frequentQueryCache } from '@/lib/cache/cache-strategies'

// Nel fetchConversations, aggiungere prima del try:
const cacheKey = `chat-conversations:${profileId}`
const cachedConversations = frequentQueryCache.get<ConversationParticipantExtended[]>(cacheKey)
if (cachedConversations) {
  onSuccess(cachedConversations)
  // Fetch in background per aggiornare cache (opzionale)
}

// Dopo onSuccess(conversationsList), aggiungere:
frequentQueryCache.set(cacheKey, conversationsList)
```

**Posizione**: Dopo riga 214, prima del catch

---

### 2. Aggiungere Caching Messaggi

**File**: `src/hooks/chat/use-chat-messages.ts`

**Modifiche necessarie**:

```typescript
// Import aggiuntivo
import { frequentQueryCache } from '@/lib/cache/cache-strategies'

// Nel fetchMessages, aggiungere dopo riga 48 (dopo getCurrentProfileId):
const cacheKey = `chat-messages:${profileId}:${otherUserId}:${limit}:${offset}`
if (offset === 0) {
  // Solo per la prima pagina, controlla cache
  const cachedMessages = frequentQueryCache.get<ChatMessage[]>(
    `chat-messages:${profileId}:${otherUserId}:50:0`,
  )
  if (cachedMessages && cachedMessages.length > 0) {
    onMessageUpdate(otherUserId, cachedMessages, false, false)
    // Fetch in background per aggiornare (opzionale)
  }
}

// Dopo onMessageUpdate (riga 75), aggiungere:
if (offset === 0 && combinedMessages.length <= 50) {
  // Cache solo i primi 50 messaggi
  frequentQueryCache.set(
    `chat-messages:${profileId}:${otherUserId}:50:0`,
    combinedMessages.slice(0, 50),
  )
}
```

**Nota**: Usare strategia `frequent-query` che ha TTL 5 minuti. Per TTL 2 minuti, potresti creare una strategia specifica o usare `localStorageCache.set()` con TTL custom.

---

### 3. Invalidazione Cache Quando Si Riceve Nuovo Messaggio

**File**: `src/hooks/use-chat.ts`

**Modifiche necessarie**:

```typescript
// Import aggiuntivo
import { frequentQueryCache } from '@/lib/cache/cache-strategies'

// Nel callback di sendMessage (dopo riga 150), aggiungere:
// Invalidare cache conversazioni e messaggi quando si invia un messaggio
const profileId = await getCurrentProfileId()
frequentQueryCache.invalidate(`chat-conversations:${profileId}`)
frequentQueryCache.invalidate(`chat-messages:${profileId}:${receiverId}:50:0`)

// Nel real-time subscription (useChatRealtime callback), aggiungere invalidazione:
// Invece di chiamare solo fetchConversations(), invalidare cache prima:
frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
// Poi chiamare fetchConversations()
```

**Alternativa più pulita**: Creare funzione helper `invalidateChatCache(profileId: string, otherUserId?: string)`

---

### 4. Ottimizzare Subscription Real-time

**File**: `src/hooks/use-chat.ts`

**Problema attuale**: `useChatRealtime` non ha limiti e può creare molte subscription.

**Modifiche necessarie**:

1. Sostituire `useChatRealtime` con `useChatRealtimeOptimized` (già esiste!)
2. Gestire subscription per conversazioni specifiche invece di tutte
3. Limitare a max 5 conversazioni attive simultaneamente

**Implementazione**:

```typescript
// In use-chat.ts, sostituire:
import { useChatRealtime } from './chat/use-chat-realtime'
// Con:
import { useChatRealtimeOptimized } from './chat/use-chat-realtime-optimized'

// Sostituire chiamata (riga 257-264):
useChatRealtimeOptimized(
  () => {
    // Invalidare cache prima di refetch
    if (currentProfileId) {
      frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
    }
    void fetchConversations()
  },
  () => {
    if (currentProfileId) {
      frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
    }
    void fetchConversations()
  },
)
```

**Ottimizzazione avanzata (opzionale)**: Creare hook `use-chat-conversation-subscription.ts` che:

- Gestisce subscription solo per conversazione corrente
- Disconnette subscription quando si cambia conversazione
- Mantiene max 5 subscription attive per conversazioni "recenti"

---

### 5. Verificare Indici Database

**File**: Migrazioni Supabase

**Verifica**:

- ✅ `idx_chat_messages_sender` - presente in `20250110_016_chat_messages.sql`
- ✅ `idx_chat_messages_receiver` - presente
- ✅ `idx_chat_messages_created_at` - presente
- ✅ `idx_chat_messages_receiver_created` - presente
- ✅ `idx_chat_messages_sender_created` - presente
- ✅ `idx_chat_messages_conversation_optimized` - presente in `20250201_optimize_chat_conversations.sql`

**Azione**: Nessuna azione necessaria, indici già presenti ✅

---

## 📝 Passi Implementazione (Ordine Consigliato)

### Step 1: Aggiungere Cache Conversazioni (30 min)

1. Modificare `use-chat-conversations.ts`
2. Aggiungere check cache prima del fetch
3. Salvare in cache dopo fetch
4. Testare: verificare che conversazioni siano cachate

### Step 2: Aggiungere Cache Messaggi (30 min)

1. Modificare `use-chat-messages.ts`
2. Aggiungere check cache per prima pagina (offset 0)
3. Salvare primi 50 messaggi in cache
4. Testare: verificare che messaggi siano cachate

### Step 3: Invalidazione Cache (20 min)

1. Creare helper `invalidateChatCache()` in `use-chat.ts`
2. Chiamare invalidazione dopo `sendMessage`
3. Chiamare invalidazione nel real-time callback
4. Testare: verificare che cache si aggiorni quando arrivano nuovi messaggi

### Step 4: Ottimizzare Subscription (30 min)

1. Sostituire `useChatRealtime` con `useChatRealtimeOptimized` in `use-chat.ts`
2. Aggiungere invalidazione cache nei callback
3. Testare: verificare che subscription funzioni correttamente
4. (Opzionale) Implementare gestione subscription per conversazioni specifiche

### Step 5: Verifica e Test (20 min)

1. Testare cache conversazioni (dovrebbe essere istantanea al secondo caricamento)
2. Testare cache messaggi (primi 50 messaggi istantanei)
3. Testare invalidazione (nuovi messaggi aggiornano cache)
4. Verificare performance: dovrebbe essere più veloce

---

## 🎯 Risultato Atteso

Dopo l'implementazione:

- ✅ Conversazioni cachate con TTL 5 minuti (strategia `frequent-query`)
- ✅ Messaggi cachati (primi 50) con TTL 2 minuti (o 5 minuti se usi `frequent-query`)
- ✅ Cache invalidata automaticamente quando si riceve/invia messaggio
- ✅ Subscription real-time ottimizzate (cleanup corretto, uso di `useChatRealtimeOptimized`)
- ✅ Performance migliorata: meno query al DB, caricamento più veloce
- ✅ Indici database verificati e presenti

---

## 📊 Metriche di Successo

- **Cache hit rate**: > 70% per conversazioni e messaggi
- **Tempo di caricamento**: Ridotto del 50-80% per dati in cache
- **Query al DB**: Ridotte del 60-70% grazie al caching
- **Subscription attive**: Massimo 1-2 invece di potenzialmente molte

---

## ⚠️ Note Importanti

1. **TTL Cache Messaggi**: Se vuoi TTL 2 minuti invece di 5, usa `localStorageCache.set()` direttamente con TTL custom invece di `frequentQueryCache`
2. **Invalidazione Granulare**: Considerare invalidazione per singola conversazione invece di tutte le conversazioni
3. **Stale-While-Revalidate**: La strategia `frequent-query` supporta stale-while-revalidate, quindi possiamo servire dati cached mentre si aggiornano in background
4. **Memory Usage**: Monitorare uso memoria se ci sono molte conversazioni/messaggi in cache
