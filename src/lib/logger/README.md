# Logger Strutturato - 22Club

Sistema di logging strutturato che sostituisce `console.log/error/warn` con un sistema più robusto e configurabile.

## Caratteristiche

- ✅ **Log Levels**: debug, info, warn, error
- ✅ **Context-aware**: Ogni log ha un contesto
- ✅ **Produzione-safe**: Log disabilitati in produzione per default
- ✅ **Formattazione**: Log formattati con colori e timestamp
- ✅ **Log Rotation**: Rotazione automatica per evitare memory leak
- ✅ **Type-safe**: Full TypeScript support

## Utilizzo

### Logger con contesto (Raccomandato)

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('useClienti')

logger.debug('Fetching clienti...')
logger.info('Clienti loaded', { count: 10 })
logger.warn('RPC timeout, using fallback')
logger.error('Failed to load clienti', error, { filters })
```

### Logger diretto

```typescript
import { logDebug, logInfo, logWarn, logError } from '@/lib/logger'

logDebug('useClienti', 'Fetching clienti...')
logInfo('useClienti', 'Clienti loaded', { count: 10 })
logWarn('useClienti', 'RPC timeout, using fallback')
logError('useClienti', 'Failed to load clienti', error, { filters })
```

### Sostituzione console (Migrazione graduale)

```typescript
import { consoleLog, consoleError, consoleWarn } from '@/lib/logger/console-replacement'

// Sostituisce console.log
consoleLog('Message', { data })

// Sostituisce console.error
consoleError('Error message', error)

// Sostituisce console.warn
consoleWarn('Warning message', { data })
```

## Configurazione

### Variabili d'ambiente

```env
# Livello di log (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=debug

# Abilita log in produzione (default: false)
NEXT_PUBLIC_ENABLE_PRODUCTION_LOGS=false
```

### Configurazione programmatica

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

## Best Practices

1. **Usa contesti descrittivi**:

   ```typescript
   const logger = createLogger('useClienti') // ✅ Buono
   const logger = createLogger('hook') // ❌ Troppo generico
   ```

2. **Includi dati rilevanti**:

   ```typescript
   logger.info('Clienti loaded', { count: 10, filters }) // ✅
   logger.info('Clienti loaded') // ❌ Manca contesto
   ```

3. **Usa error per eccezioni**:

   ```typescript
   logger.error('Failed to load', error, { context }) // ✅
   logger.error('Failed to load', { error: error.message }) // ❌ Perde stack trace
   ```

4. **Evita log in produzione**:
   - I log sono automaticamente disabilitati in produzione
   - Usa `enableProduction: true` solo per debugging specifico

## Migrazione da console.log

### Prima

```typescript
console.log('Loading clienti...')
console.error('Error:', error)
console.warn('Timeout after 3s')
```

### Dopo

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('useClienti')

logger.info('Loading clienti...')
logger.error('Error loading clienti', error)
logger.warn('Timeout after 3s')
```

## Esempi

### Hook con logging

```typescript
import { createLogger } from '@/lib/logger'

export function useClienti() {
  const logger = createLogger('useClienti')

  const fetchClienti = async () => {
    logger.debug('Starting fetch')

    try {
      const data = await api.getClienti()
      logger.info('Clienti fetched', { count: data.length })
      return data
    } catch (error) {
      logger.error('Failed to fetch clienti', error)
      throw error
    }
  }

  return { fetchClienti }
}
```

### Component con logging

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('ClientiPage')

export function ClientiPage() {
  useEffect(() => {
    logger.info('Page mounted')

    return () => {
      logger.debug('Page unmounted')
    }
  }, [])

  // ...
}
```

## Debugging

### Esporta log

```typescript
import { logger } from '@/lib/logger'

const logs = logger.exportLogs()
console.log(logs) // JSON string
```

### Ottieni log per livello

```typescript
const errors = logger.getLogs('error')
const warnings = logger.getLogs('warn')
```

### Pulisci log

```typescript
logger.clearLogs()
```

## Note

- I log sono disabilitati in produzione per default
- I log in memoria sono limitati a 1000 entry (configurabile)
- Log rotation automatica previene memory leak
- I log includono timestamp ISO e stack trace per errori
