# Guida Migrazione a Logger Strutturato

## Overview

Questa guida spiega come migrare da `console.log/error/warn` al nuovo sistema di logging strutturato.

## Step 1: Importa il Logger

### Opzione A: Logger con contesto (Raccomandato)

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('NomeModulo')
```

### Opzione B: Funzioni dirette

```typescript
import { logDebug, logInfo, logWarn, logError } from '@/lib/logger'
```

## Step 2: Sostituisci console.log

### Prima

```typescript
console.log('Loading data...')
console.log('Data loaded:', data)
```

### Dopo

```typescript
logger.info('Loading data...')
logger.info('Data loaded', { data })
```

## Step 3: Sostituisci console.error

### Prima

```typescript
console.error('Error:', error)
console.error('Failed to load:', error.message)
```

### Dopo

```typescript
logger.error('Failed to load', error, { context: 'additional data' })
```

## Step 4: Sostituisci console.warn

### Prima

```typescript
console.warn('Warning: timeout')
console.warn('Using fallback')
```

### Dopo

```typescript
logger.warn('Timeout occurred, using fallback', { timeout: 3000 })
```

## Step 5: Sostituisci console.debug

### Prima

```typescript
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data)
}
```

### Dopo

```typescript
logger.debug('Debug info', { data })
// Il logger gestisce automaticamente NODE_ENV
```

## Esempi Completi

### Hook con Logging

#### Prima

```typescript
export function useClienti() {
  const fetchClienti = async () => {
    console.log('Fetching clienti...')

    try {
      const data = await api.getClienti()
      console.log('Clienti loaded:', data.length)
      return data
    } catch (error) {
      console.error('Error loading clienti:', error)
      throw error
    }
  }
}
```

#### Dopo

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('useClienti')

export function useClienti() {
  const fetchClienti = async () => {
    logger.debug('Fetching clienti...')

    try {
      const data = await api.getClienti()
      logger.info('Clienti loaded', { count: data.length })
      return data
    } catch (error) {
      logger.error('Error loading clienti', error)
      throw error
    }
  }
}
```

### Component con Logging

#### Prima

```typescript
export function ClientiPage() {
  useEffect(() => {
    console.log('Page mounted')

    return () => {
      console.log('Page unmounted')
    }
  }, [])
}
```

#### Dopo

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
}
```

### API Route con Logging

#### Prima

```typescript
export async function GET(request: Request) {
  console.log('API called')

  try {
    const data = await fetchData()
    console.log('Data fetched:', data.length)
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

#### Dopo

```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/clienti')

export async function GET(request: Request) {
  logger.debug('API called', { method: 'GET' })

  try {
    const data = await fetchData()
    logger.info('Data fetched', { count: data.length })
    return Response.json(data)
  } catch (error) {
    logger.error('API error', error, { endpoint: '/api/clienti' })
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

## Best Practices

### 1. Usa contesti descrittivi

```typescript
const logger = createLogger('useClienti') // ✅
const logger = createLogger('hook') // ❌
```

### 2. Includi dati rilevanti

```typescript
logger.info('Clienti loaded', { count: 10, filters }) // ✅
logger.info('Clienti loaded') // ❌
```

### 3. Usa error per eccezioni

```typescript
logger.error('Failed to load', error, { context }) // ✅
logger.error('Failed to load', { error: error.message }) // ❌
```

### 4. Evita log in produzione

- I log sono automaticamente disabilitati in produzione
- Non serve più `if (process.env.NODE_ENV === 'development')`

## Checklist Migrazione

- [ ] Importa `createLogger` o funzioni dirette
- [ ] Sostituisci `console.log` con `logger.info`
- [ ] Sostituisci `console.error` con `logger.error`
- [ ] Sostituisci `console.warn` con `logger.warn`
- [ ] Sostituisci `console.debug` con `logger.debug`
- [ ] Rimuovi controlli `NODE_ENV` (gestiti dal logger)
- [ ] Aggiungi dati contestuali dove utile
- [ ] Testa in sviluppo e produzione

## File Prioritari per Migrazione

1. **Hooks** (`src/hooks/`)
   - `use-clienti.ts` ✅ (già commentato, da migrare)
   - `use-chat.ts`
   - `use-appointments.ts`

2. **API Routes** (`src/app/api/`)
   - `admin/users/route.ts`
   - `admin/statistics/route.ts`
   - `communications/send/route.ts`

3. **Components** (`src/components/`)
   - `dashboard/admin/admin-statistics-content.tsx`
   - `dashboard/modals-wrapper.tsx`

4. **Lib** (`src/lib/`)
   - `cache/local-storage-cache.ts` ✅ (già commentato)
   - `communications/service.ts`
   - `notifications/scheduler.ts`

## Note

- La migrazione può essere graduale
- I log esistenti continueranno a funzionare
- Il logger è retrocompatibile
- I log in produzione sono disabilitati per default
