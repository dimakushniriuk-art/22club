# 📚 Documentazione Tecnica: useChatRealtime

**Percorso**: `src/hooks/chat/use-chat-realtime.ts`  
**Tipo Modulo**: React Hook (Realtime Subscription Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:58:00Z

---

## 📋 Panoramica

Hook base per realtime chat. Sottoscrive a cambiamenti `chat_messages` per messaggi ricevuti dall'utente corrente. Versione semplificata rispetto a `useChatRealtimeOptimized`.

---

## 🔧 Funzioni e Export

### 1. `useChatRealtime`

**Classificazione**: React Hook, Realtime Subscription Hook, Client Component, Side-Effecting  
**Tipo**: `(onMessageReceived: () => void, onMessageUpdated: () => void) => void`

**Parametri**:

- `onMessageReceived` (function): Callback chiamato quando viene ricevuto un nuovo messaggio (INSERT)
- `onMessageUpdated` (function): Callback chiamato quando un messaggio viene aggiornato (UPDATE)

**Output**: Nessuno (hook side-effect)

**Descrizione**: Hook base per sottoscrizione realtime a messaggi chat.

---

## 🔄 Flusso Logico

### Setup Subscription

1. `useEffect` esegue al mount
2. Verifica utente autenticato
3. Crea canale Supabase Realtime:
   - Nome: `chat_realtime` (globale)
   - Eventi:
     - `INSERT` su `chat_messages` WHERE `receiver_id = user.id`
     - `UPDATE` su `chat_messages` WHERE `receiver_id = user.id`
4. Callback chiamati se `isMounted` è true

### Cleanup

1. Al unmount:
   - `isMounted = false`
   - Rimuove canale con `supabase.removeChannel()`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase)

**Utilizzato da**: Componenti chat (versione base, meno usata)

---

## ⚠️ Note Tecniche

- **Versione Base**: Versione semplificata, preferire `useChatRealtimeOptimized` per produzione
- **Canale Globale**: Usa canale globale invece di canale per utente
- **Cleanup Semplice**: Cleanup base senza gestione errori avanzata

---

**Ultimo aggiornamento**: 2025-02-01T23:58:00Z
