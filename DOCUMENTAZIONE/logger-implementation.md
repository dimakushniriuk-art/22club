# Logger Strutturato - Implementazione

## Overview

Sistema di logging strutturato che sostituisce `console.log/error/warn` con un sistema più robusto, configurabile e production-safe.

## Problema Risolto

- **468 occorrenze** di `console.log/error/warn` in **106 file**
- Logging in produzione (potenziale info leak)
- Nessun controllo sui log levels
- Nessuna formattazione strutturata

## Soluzione

Sistema di logging strutturato con:

- ✅ Log levels (debug, info, warn, error)
- ✅ Context-aware logging
- ✅ Production-safe (disabilitato per default)
- ✅ Formattazione con colori e timestamp
- ✅ Log rotation per evitare memory leak
- ✅ Type-safe con TypeScript

## Architettura

### File Creati

1. **`src/lib/logger/index.ts`**
   - Logger principale (singleton)
   - Gestione log levels
   - Formattazione e output

2. **`src/lib/logger/console-replacement.ts`**
   - Funzioni di sostituzione diretta
   - Per migrazione graduale

3. **`src/lib/logger/README.md`**
   - Documentazione completa
   - Esempi d'uso

4. **`src/lib/logger/migration-guide.md`**
   - Guida step-by-step
   - Esempi prima/dopo

## Utilizzo

### Logger con Contesto (Raccomandato)

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('useClienti')

logger.debug('Fetching clienti...')
logger.info('Clienti loaded', { count: 10 })
logger.warn('RPC timeout, using fallback')
logger.error('Failed to load clienti', error, { filters })
```

### Funzioni Dirette

```typescript
import { logDebug, logInfo, logWarn, logError } from '@/lib/logger'

logDebug('useClienti', 'Fetching clienti...')
logInfo('useClienti', 'Clienti loaded', { count: 10 })
logWarn('useClienti', 'RPC timeout, using fallback')
logError('useClienti', 'Failed to load clienti', error, { filters })
```

## Configurazione

### Variabili d'Ambiente

```env
# Livello di log (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=debug

# Abilita log in produzione (default: false)
NEXT_PUBLIC_ENABLE_PRODUCTION_LOGS=false
```

### Configurazione Programmatica

```typescript
import { logger } from '@/lib/logger'

logger.configure({
  level: 'info',
  enableConsole: true,
  enableProduction: false,
  maxLogs: 1000,
})
```

## Log Levels

1. **debug**: Log dettagliati per sviluppo (solo in dev)
2. **info**: Informazioni generali
3. **warn**: Avvisi e warning
4. **error**: Errori e eccezioni

## Migrazione

### Status

- ✅ **Sistema creato**: Logger strutturato implementato
- ✅ **Documentazione**: README e migration guide
- ⏳ **Migrazione**: In corso (file critici commentati)

### File Migrati (Commentati, pronti per migrazione)

1. `src/hooks/use-clienti.ts` - Tutti i console.log commentati
2. `src/lib/cache/local-storage-cache.ts` - Tutti i console.error commentati

### Prossimi Passi

1. Migrare file critici uno per uno
2. Testare in sviluppo
3. Verificare che i log siano disabilitati in produzione
4. Monitorare performance

## Best Practices

1. **Usa contesti descrittivi**:

   ```typescript
   const logger = createLogger('useClienti') // ✅
   const logger = createLogger('hook') // ❌
   ```

2. **Includi dati rilevanti**:

   ```typescript
   logger.info('Clienti loaded', { count: 10, filters }) // ✅
   logger.info('Clienti loaded') // ❌
   ```

3. **Usa error per eccezioni**:

   ```typescript
   logger.error('Failed to load', error, { context }) // ✅
   logger.error('Failed to load', { error: error.message }) // ❌
   ```

4. **Evita log in produzione**:
   - I log sono automaticamente disabilitati in produzione
   - Non serve più `if (process.env.NODE_ENV === 'development')`

## Testing

### Sviluppo

```typescript
// I log sono visibili in console
logger.debug('Test message')
// Output: [DEBUG] [useClienti] Test message
```

### Produzione

```typescript
// I log sono disabilitati per default
logger.debug('Test message')
// Nessun output
```

## Performance

- **Memory**: Log limitati a 1000 entry (configurabile)
- **Rotation**: Automatica per evitare memory leak
- **Production**: Zero overhead (log disabilitati)
- **Development**: Overhead minimo (solo console output)

## Riferimenti

- [Logger README](../src/lib/logger/README.md)
- [Migration Guide](../src/lib/logger/migration-guide.md)
- [Logger Source](../src/lib/logger/index.ts)
