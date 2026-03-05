# 📚 Documentazione Tecnica: useAthleteProfileCache

**Percorso**: `src/hooks/athlete-profile/use-athlete-profile-cache.ts`  
**Tipo Modulo**: React Hook (Cache Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook per cache intelligente profilo atleta con invalidazione automatica. Gestisce cache per sezioni profilo (anagrafica, medical, fitness, nutrition, etc.) e integrazione con React Query cache.

---

## 🔧 Funzioni e Export

### 1. `AthleteProfileSection`

**Tipo**: `'anagrafica' | 'medical' | 'fitness' | 'nutrition' | 'motivational' | 'administrative' | 'massage' | 'smart-tracking' | 'ai-data' | 'full'`

**Descrizione**: Tipo per sezioni profilo atleta.

---

### 2. `useAthleteProfileCache`

**Classificazione**: React Hook, Cache Management Hook, Client Component  
**Tipo**: `(athleteId: string) => UseAthleteProfileCacheReturn`

**Parametri**:

- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `getCached<T>(section?)`: `T | null` - Ottiene dati dalla cache
- `setCached<T>(data, section?)`: `void` - Salva dati nella cache
- `invalidate(section?)`: `void` - Invalida cache per sezione
- `invalidateAll()`: `void` - Invalida tutta la cache profilo
- `prefetch<T>(queryFn, section?)`: `Promise<T | null>` - Prefetch dati con caching

**Descrizione**: Hook per gestione cache profilo atleta con:

- Cache per sezioni specifiche o cache completa
- Integrazione con React Query (invalida anche React Query cache)
- Prefetch intelligente (controlla cache prima di fetch)

---

## 🔄 Flusso Logico

### Get Cached

1. Chiama `athleteProfileCache.get<T>(athleteId, section)`
2. Ritorna dati cached o `null`

### Set Cached

1. Chiama `athleteProfileCache.set(athleteId, data, section)`
2. Salva dati nella cache

### Invalidate

1. Invalida cache locale con `athleteProfileCache.invalidate(athleteId, section)`
2. Invalida React Query cache con `queryClient.invalidateQueries()`

### Prefetch

1. Controlla cache locale con `getCached<T>(section)`
2. Se cached → ritorna dati cached
3. Se non cached → esegue `queryFn()`, salva in cache, ritorna dati

---

## 📊 Dipendenze

**Dipende da**: `athleteProfileCache` (lib cache), `useQueryClient` (React Query)

**Utilizzato da**: Componenti profilo atleta per ottimizzazione performance

---

## ⚠️ Note Tecniche

- **Cache Strategy**: Cache locale + React Query cache per doppia layer
- **Invalidation**: Automatica quando dati cambiano
- **Prefetch**: Intelligente - evita fetch se dati già cached

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
