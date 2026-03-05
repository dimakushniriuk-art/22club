# 📚 Documentazione Tecnica: useFrequentQueryCache

**Percorso**: `src/hooks/use-frequent-query-cache.ts`  
**Tipo Modulo**: React Hook (Cache Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione cache query frequenti. Fornisce funzioni per get/set/invalidate cache e prefetch con integrazione React Query.

---

## 🔧 Funzioni e Export

### 1. `useFrequentQueryCache`

**Classificazione**: React Hook, Cache Hook, Client Component, Pure  
**Tipo**: `() => UseFrequentQueryCacheReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `getCached<T>(queryType, key?)`: `(queryType: FrequentQueryType, key?: string) => T | null` - Ottiene dati dalla cache
- `setCached<T>(queryType, data, key?)`: `(queryType: FrequentQueryType, data: T, key?: string) => void` - Salva dati nella cache
- `invalidate(queryType, key?)`: `(queryType: FrequentQueryType, key?: string) => void` - Invalida cache e React Query
- `prefetch<T>(queryType, queryFn, key?)`: `(queryType, queryFn, key?) => Promise<T | null>` - Prefetch e cache dati

**FrequentQueryType**: `'clienti' | 'clienti-stats' | 'appointments' | 'workouts' | 'workout-plans' | 'documents' | 'payments' | 'notifications'`

**Descrizione**: Hook per gestione cache query frequenti con:

- Integrazione con `frequentQueryCache` (strategia cache)
- Integrazione con React Query (`invalidateQueries`)
- Prefetch automatico (controlla cache prima, fetch se mancante)
- Key composita: `${queryType}:${key}` (se key fornita)

---

## 🔄 Flusso Logico

### Get Cached

1. Costruisce cache key: `key ? ${queryType}:${key} : queryType`
2. Ritorna `frequentQueryCache.get<T>(cacheKey)`

### Set Cached

1. Costruisce cache key
2. Salva in `frequentQueryCache.set(cacheKey, data)`

### Invalidate

1. Invalida cache locale: `frequentQueryCache.invalidate(cacheKey)`
2. Invalida React Query: `queryClient.invalidateQueries({ queryKey: [queryType, key] })`

### Prefetch

1. Controlla cache: se presente → ritorna immediatamente
2. Se mancante → esegue `queryFn()`
3. Salva risultato in cache
4. Ritorna dati o null se errore

---

## 📊 Dipendenze

**Dipende da**: React (`useCallback`), React Query (`useQueryClient`), `frequentQueryCache`

**Utilizzato da**: Hooks che necessitano cache query frequenti

---

## ⚠️ Note Tecniche

- **Cache Strategy**: Usa `frequentQueryCache` (TTL 5 minuti per query frequenti)
- **React Query Sync**: Invalida anche React Query cache per coerenza
- **Error Handling**: Prefetch ritorna `null` se errore (non blocca UI)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
