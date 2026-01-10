# 📚 Documentazione Tecnica: useChatRealtimeOptimized

**Percorso**: `src/hooks/chat/use-chat-realtime-optimized.ts`  
**Tipo Modulo**: React Hook (Realtime Subscription Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:58:00Z

---

## 📋 Panoramica

Hook ottimizzato per realtime chat con gestione corretta cleanup delle subscriptions per evitare memory leak. Sottoscrive a cambiamenti `chat_messages` per messaggi ricevuti dall'utente corrente.

---

## 🔧 Funzioni e Export

### 1. `useChatRealtimeOptimized`

**Classificazione**: React Hook, Realtime Subscription Hook, Client Component, Side-Effecting  
**Tipo**: `(onMessageReceived: () => void, onMessageUpdated: () => void) => void`

**Parametri**:

- `onMessageReceived` (function): Callback chiamato quando viene ricevuto un nuovo messaggio (INSERT)
- `onMessageUpdated` (function): Callback chiamato quando un messaggio viene aggiornato (UPDATE)

**Output**: Nessuno (hook side-effect)

**Descrizione**: Hook per sottoscrizione realtime a messaggi chat con:

- Cleanup corretto delle subscriptions (evita memory leak)
- Gestione mounted state per evitare callback su componenti unmounted
- Rimozione subscription precedente prima di crearne una nuova
- Canale dedicato per utente (`chat_realtime_${user.id}`)

---

## 🔄 Flusso Logico

### Setup Subscription

1. `useEffect` esegue al mount o quando dipendenze cambiano
2. Verifica utente autenticato con `supabase.auth.getUser()`
3. Se subscription precedente esiste → rimuove con `supabase.removeChannel()`
4. Crea nuovo canale Supabase Realtime:
   - Nome: `chat_realtime_${user.id}`
   - Eventi:
     - `INSERT` su `chat_messages` WHERE `receiver_id = user.id`
     - `UPDATE` su `chat_messages` WHERE `receiver_id = user.id`
5. Callback chiamati solo se componente è ancora mounted (`isMountedRef.current`)

### Cleanup

1. Al unmount o cambio dipendenze:
   - `isMountedRef.current = false`
   - Rimuove canale con `supabase.removeChannel()`
   - `channelRef.current = null`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), `@supabase/supabase-js` (RealtimeChannel)

**Utilizzato da**: Componenti chat per realtime updates

---

## ⚠️ Note Tecniche

- **Memory Leak Prevention**: Cleanup corretto con `useRef` per tracciare canale e mounted state
- **Error Handling**: Errori di cleanup ignorati silenziosamente (non critici)
- **Debug Logging**: Log in development mode per status subscription
- **Mounted Check**: Callback chiamati solo se componente è ancora mounted

---

## 🔍 Differenze con `useChatRealtime`

- **Versione Ottimizzata**: Cleanup più robusto, gestione mounted state migliore
- **Canale Dedicato**: Canale per utente invece di canale globale
- **Error Handling**: Gestione errori cleanup migliorata

---

**Ultimo aggiornamento**: 2025-02-01T23:58:00Z
