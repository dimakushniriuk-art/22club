# Utility: Fetch With Cache

## 📋 Descrizione

Utility per fetch con caching. Cache risultati fetch con TTL, supporta timeout, force refresh, gestione scadenza cache.

## 📁 Percorso File

`src/lib/fetchWithCache.ts`

## 📦 Dipendenze

- `@/lib/supabase/client` (`createClient`)
- `@/types/supabase` (`Tables`)

## ⚙️ Funzionalità

### Interfacce

- `FetchWithCacheOptions`: Opzioni (ttlMs?, timeoutMs?, forceRefresh?)

### Funzioni Principali

1. **`fetchWithCache(key, fn, options?)`**: Fetch con cache
   - Default TTL: 60 secondi
   - Verifica cache prima di eseguire fn
   - Se cache valida: ritorna dati cached
   - Se cache scaduta o forceRefresh: esegue fn e aggiorna cache
   - Supporta timeout per fn

2. **`withTimeout(promise, timeoutMs?)`**: Wrapper timeout
   - Race tra promise e timeout
   - Reject se timeout scade

## 🔍 Note Tecniche

- Cache in-memory (Map): non persistente tra riavvii
- TTL: default 60 secondi
- Timeout: opzionale, race condition con Promise.race

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
