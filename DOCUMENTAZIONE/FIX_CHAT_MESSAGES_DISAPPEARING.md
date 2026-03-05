# Fix: Messaggi Chat che Scompaiono Durante il Refresh

## Problema

I messaggi della chat scomparivano quando l'utente aggiornava la pagina (F5 o refresh del browser). Il problema si verificava sia nella chat dell'atleta (`/home/chat`) che nella chat del trainer (`/dashboard/chat`).

## Causa Root

Durante il refresh della pagina, lo stato React viene completamente perso. Quando `useChat()` viene reinizializzato:

1. `currentConversation` è `null` al mount iniziale
2. `fetchConversations()` viene chiamato dal `useEffect` al mount
3. `handleConversationsSuccess` viene chiamato con `prevMessagesCount: 0` perché non c'è nulla da preservare
4. I messaggi vengono persi perché non c'è stato precedente da preservare

## Soluzione Implementata

### 1. Persistenza in localStorage

Aggiunto salvataggio automatico di `currentConversation` (inclusi i messaggi) in localStorage quando viene aggiornato:

```typescript
// Salva currentConversation in localStorage quando viene aggiornato
useEffect(() => {
  const saveToCache = async () => {
    if (!state.currentConversation || state.currentConversation.messages.length === 0) return

    try {
      const profileId = await getCurrentProfileId()
      if (!profileId) return

      const cacheKey = `chat-current-conversation:${profileId}`
      // Salva con TTL di 1 ora (sufficiente per preservare durante refresh)
      localStorageCache.set(cacheKey, state.currentConversation, 60 * 60 * 1000)
    } catch (error) {
      logger.error('Error saving conversation to cache', error)
    }
  }

  void saveToCache()
}, [state.currentConversation])
```

### 2. Ripristino al Mount

Aggiunto ripristino di `currentConversation` da localStorage al mount, **prima** che `fetchConversations` venga chiamato:

```typescript
// Ripristina currentConversation da localStorage al mount
useEffect(() => {
  const restoreFromCache = async () => {
    try {
      const profileId = await getCurrentProfileId()
      if (!profileId) return

      const cacheKey = `chat-current-conversation:${profileId}`
      const cachedConversation = localStorageCache.get<ChatConversation>(cacheKey)

      if (cachedConversation && cachedConversation.messages.length > 0) {
        setState((prev) => ({
          ...prev,
          currentConversation: cachedConversation,
        }))
      }
    } catch (error) {
      logger.error('Error restoring conversation from cache', error)
    }
  }

  void restoreFromCache()
}, []) // Esegui solo al mount
```

### 3. Preservazione durante fetchConversations

Il codice esistente in `handleConversationsSuccess` preserva già i messaggi se `currentConversation` esiste:

```typescript
const handleConversationsSuccess = useCallback((conversations: ConversationParticipant[]) => {
  setState((prev) => {
    // PRESERVA SEMPRE currentConversation quando aggiorniamo conversations
    const preservedConversation = prev.currentConversation
      ? {
          ...prev.currentConversation,
          participant: { ...prev.currentConversation.participant },
          messages:
            prev.currentConversation.messages.length > 0
              ? [...prev.currentConversation.messages] // Deep copy
              : [],
        }
      : null

    return {
      ...prev,
      conversations,
      isLoading: false,
      currentConversation: preservedConversation,
    }
  })
}, [])
```

### 4. Invalidazione Cache

Aggiunto invalidazione della cache quando si cancella la conversazione:

```typescript
const clearCurrentConversation = useCallback(async () => {
  // Invalida cache quando si cancella la conversazione
  try {
    const profileId = await getCurrentProfileId()
    if (profileId) {
      const cacheKey = `chat-current-conversation:${profileId}`
      localStorageCache.delete(cacheKey)
    }
  } catch (error) {
    logger.error('Error clearing conversation cache', error)
  }

  setState((prev) => ({
    ...prev,
    currentConversation: null,
  }))
}, [getCurrentProfileId])
```

## File Modificati

- `src/hooks/use-chat.ts`: Aggiunto salvataggio/ripristino da localStorage

## Come Funziona

1. **Durante l'uso normale**: Ogni volta che `currentConversation` viene aggiornato (con messaggi), viene salvato automaticamente in localStorage
2. **Durante il refresh**:
   - Al mount, `useChat()` ripristina `currentConversation` da localStorage
   - Se la conversazione è stata ripristinata con messaggi, `fetchConversations` non viene chiamato (o se viene chiamato, i messaggi vengono preservati)
   - I messaggi rimangono visibili durante tutto il processo

## Note Importanti

- La cache ha un TTL di 1 ora, sufficiente per preservare i messaggi durante il refresh
- La cache è specifica per ogni `profileId`, quindi ogni utente ha la sua cache
- La cache viene invalidata quando si cancella la conversazione
- Il fix funziona automaticamente per tutte le pagine che usano `useChat()` (home/chat e dashboard/chat)

## Test

Per verificare che il fix funzioni:

1. Apri la chat (`/home/chat` o `/dashboard/chat`)
2. Assicurati di vedere i messaggi
3. Premi F5 o clicca sul pulsante di refresh del browser
4. I messaggi dovrebbero rimanere visibili dopo il refresh
