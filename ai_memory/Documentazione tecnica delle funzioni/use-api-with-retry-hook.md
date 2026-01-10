# 📚 Documentazione Tecnica: useApiWithRetry

**Percorso**: `src/hooks/use-api-with-retry.ts`  
**Tipo Modulo**: React Hook (API Hook, Retry Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per chiamate API con retry logic, timeout, error handling robusto, e logging. Fornisce versione generica e versione specializzata per Supabase.

---

## 🔧 Funzioni e Export

### 1. `useApiWithRetry`

**Classificazione**: React Hook, API Hook, Retry Hook, Client Component, Async  
**Tipo**: `<T>() => UseApiWithRetryReturn<T>`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Stato**:
  - `data`: `T | null` - Dati risultato
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
  - `lastAttempt`: `number` - Tentativo corrente (1-based)
  - `totalAttempts`: `number` - Totale tentativi
  - `isRetrying`: `boolean` - True se in retry
- **Funzioni**:
  - `executeApiCall(apiCall, options)`: `(apiCall: () => Promise<T>, options?: ApiCallOptions) => Promise<T | null>` - Esegue chiamata con retry
  - `reset()`: `() => void` - Reset stato

**ApiCallOptions**:

- `retry?`: `RetryOptions` - Opzioni retry
- `context?`: `string` - Contesto per logging

**RetryOptions**:

- `maxAttempts?`: `number` - Max tentativi (default: 3)
- `delayMs?`: `number` - Delay iniziale (default: 1000ms)
- `backoffMultiplier?`: `number` - Moltiplicatore backoff (default: 2)
- `timeoutMs?`: `number` - Timeout per chiamata (default: 30000ms)

**Descrizione**: Hook per chiamate API con retry con:

- Retry automatico con exponential backoff
- Timeout per chiamata (evita hang)
- Error handling robusto (timeout, network, API errors)
- Logging automatico (call, retry, success, error)
- Mount check (non aggiorna stato se unmounted)

### 2. `useSupabaseWithRetry`

**Classificazione**: React Hook, API Hook, Retry Hook, Client Component, Async  
**Tipo**: `<T>() => UseSupabaseWithRetryReturn<T>`

**Parametri**: Nessuno

**Output**: Stesso di `useApiWithRetry` + `executeSupabaseCall`

**Descrizione**: Versione specializzata per Supabase con:

- Wrapper `executeSupabaseCall` per chiamate Supabase
- Gestione errori Supabase automatica
- Context default: 'supabase-call'

---

## 🔄 Flusso Logico

### Execute Api Call

1. **Inizializzazione**:
   - Log chiamata: `logApiCall(context)`
   - Reset stato: `loading = true`, `error = null`, `lastAttempt = 0`

2. **Loop Retry** (maxAttempts volte):
   - Aggiorna `lastAttempt` e `totalAttempts`
   - Se `attempt > 1` → log retry
   - Esegue `apiCall()` con timeout: `Promise.race([apiCall(), timeoutPromise])`
   - Se successo → log success, aggiorna `data`, ritorna risultato
   - Se errore → gestisce errore:
     - Timeout → `handleTimeoutError`
     - Network → `handleNetworkError`
     - Altro → `handleApiError`
   - Se non ultimo tentativo → calcola delay (exponential backoff), attende, riprova

3. **Fallimento Finale**:
   - Log errore: `logApiError`
   - Aggiorna `error` con messaggio
   - Ritorna `null`

### Execute Supabase Call

1. Wrapper che chiama `executeApiCall` con:
   - `apiCall`: `async () => { const { data, error } = await supabaseCall(); if (error) throw error; return data; }`
   - Context: `options.context || 'supabase-call'`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useCallback`, `useEffect`, `useRef`), `handleApiError`, `handleRetryError`, `handleTimeoutError`, `handleNetworkError`, `logApiCall`, `logApiRetry`, `logApiSuccess`, `logApiError`

**Utilizzato da**: Hooks che necessitano retry automatico (es. `useClienti`, `useAllenamenti`)

---

## ⚠️ Note Tecniche

- **Exponential Backoff**: Delay = `delayMs * (backoffMultiplier ^ (attempt - 1))`
- **Timeout**: Ogni chiamata ha timeout (default 30s) per evitare hang
- **Mount Check**: Controlla `isMountedRef` prima di aggiornare stato (evita warning React)
- **Logging**: Logging automatico per debugging e monitoring

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
