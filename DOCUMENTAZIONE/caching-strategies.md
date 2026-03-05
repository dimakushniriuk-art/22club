# Strategie di Caching Avanzate - 22Club

## Overview

Sistema di caching avanzato con strategie specifiche per diversi tipi di dati, ottimizzato per performance e UX.

## Architettura

### Cache Layers

1. **Memory Cache**: Cache in-memory per accesso ultra-rapido
2. **LocalStorage Cache**: Cache persistente che sopravvive al reload
3. **React Query Cache**: Cache integrata con React Query

### Strategie di Caching

#### 1. Athlete Profile Cache

**TTL**: 30 minuti  
**Uso**: Dati profilo atleta (anagrafica, medical, fitness, etc.)  
**Caratteristiche**:

- Dati che cambiano raramente
- Stale-while-revalidate abilitato
- Invalidazione per sezione o completo

```typescript
import { athleteProfileCache } from '@/lib/cache/cache-strategies'

// Salva
athleteProfileCache.set(athleteId, data, 'anagrafica')

// Recupera
const cached = athleteProfileCache.get(athleteId, 'anagrafica')

// Invalida
athleteProfileCache.invalidate(athleteId, 'anagrafica')
```

#### 2. Frequent Query Cache

**TTL**: 5 minuti  
**Uso**: Query frequenti (clienti, appuntamenti, workout)  
**Caratteristiche**:

- Query eseguite spesso
- Stale-while-revalidate abilitato
- Invalidazione per tipo query

```typescript
import { frequentQueryCache } from '@/lib/cache/cache-strategies'

// Salva
frequentQueryCache.set('clienti-list', data, cacheKey)

// Recupera
const cached = frequentQueryCache.get('clienti-list', cacheKey)

// Invalida
frequentQueryCache.invalidate('clienti-list', cacheKey)
```

#### 3. Stats Cache

**TTL**: 2 minuti  
**Uso**: Statistiche (clienti stats, dashboard stats)  
**Caratteristiche**:

- Dati che cambiano spesso
- Stale-while-revalidate disabilitato
- Invalidazione rapida

```typescript
import { statsCache } from '@/lib/cache/cache-strategies'

// Salva
statsCache.set('clienti-stats', data)

// Recupera
const cached = statsCache.get('clienti-stats')

// Invalida
statsCache.invalidate('clienti-stats')
```

#### 4. Temporary Cache

**TTL**: 1 minuto  
**Uso**: Dati temporanei (ricerche, filtri)  
**Caratteristiche**:

- Dati molto volatili
- Cache breve
- Invalidazione automatica

## Utilizzo

### Hook per Profilo Atleta

```typescript
import { useAthleteProfileCache } from '@/hooks/athlete-profile/use-athlete-profile-cache'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  const { getCached, setCached, invalidate, prefetch } = useAthleteProfileCache(athleteId)

  // Recupera da cache
  const cachedData = getCached('anagrafica')

  // Salva in cache
  setCached(data, 'anagrafica')

  // Invalida cache
  invalidate('anagrafica')

  // Prefetch (controlla cache, fetch se necessario)
  const data = await prefetch(() => fetchAnagrafica(athleteId), 'anagrafica')
}
```

### Hook per Query Frequenti

```typescript
import { useFrequentQueryCache } from '@/hooks/use-frequent-query-cache'

function ClientiPage() {
  const { getCached, setCached, invalidate, prefetch } = useFrequentQueryCache()

  // Recupera da cache
  const cachedClienti = getCached('clienti', cacheKey)

  // Salva in cache
  setCached('clienti', data, cacheKey)

  // Invalida cache
  invalidate('clienti', cacheKey)

  // Prefetch
  const clienti = await prefetch('clienti', () => fetchClienti(), cacheKey)
}
```

## Best Practices

### 1. Usa la strategia corretta

```typescript
// ✅ Profilo atleta
athleteProfileCache.set(athleteId, data, 'anagrafica')

// ✅ Query frequenti
frequentQueryCache.set('clienti-list', data, cacheKey)

// ✅ Statistiche
statsCache.set('clienti-stats', data)
```

### 2. Invalida dopo mutazioni

```typescript
// Dopo aggiornamento profilo
await updateAthleteProfile(athleteId, data)
athleteProfileCache.invalidate(athleteId, 'anagrafica')

// Dopo creazione cliente
await createCliente(data)
frequentQueryCache.invalidate('clienti-list')
```

### 3. Prefetch per performance

```typescript
// Prefetch dati prima che servano
await prefetch('clienti', () => fetchClienti(), cacheKey)
```

### 4. Usa cache keys consistenti

```typescript
// ✅ Cache key basata su filtri
const cacheKey = JSON.stringify({ filters, sort, page })

// ❌ Cache key non consistente
const cacheKey = `${filters.search}-${page}`
```

## Performance

### Metriche Attese

- **Cache Hit Rate**: > 70% per query frequenti
- **Reduced API Calls**: ~50% riduzione chiamate API
- **Faster Load Times**: ~30% riduzione tempo caricamento
- **Better UX**: Dati disponibili immediatamente da cache

### Monitoring

```typescript
import { localStorageCache } from '@/lib/cache/local-storage-cache'

// Dimensione cache
const size = localStorageCache.getSize()

// Pulisci cache vecchia
localStorageCache.cleanup()
```

## Invalidazione

### Invalidazione Automatica

- Cache scade automaticamente dopo TTL
- Cleanup automatico all'avvio
- Versioning cache per invalidazione forzata

### Invalidazione Manuale

```typescript
// Invalida sezione specifica
athleteProfileCache.invalidate(athleteId, 'anagrafica')

// Invalida tutto il profilo
athleteProfileCache.invalidateAll(athleteId)

// Invalida tutte le stats
statsCache.invalidateAll()
```

## Testing

### Test Cache Hit

```typescript
// Verifica che i dati vengano recuperati da cache
const cached = getCached('clienti', cacheKey)
expect(cached).toBeTruthy()
```

### Test Cache Invalidation

```typescript
// Verifica che la cache venga invalidata
invalidate('clienti', cacheKey)
const cached = getCached('clienti', cacheKey)
expect(cached).toBeNull()
```

## Riferimenti

- [Cache Strategies](../src/lib/cache/cache-strategies.ts)
- [Athlete Profile Cache Hook](../src/hooks/athlete-profile/use-athlete-profile-cache.ts)
- [Frequent Query Cache Hook](../src/hooks/use-frequent-query-cache.ts)
- [LocalStorage Cache](../src/lib/cache/local-storage-cache.ts)
