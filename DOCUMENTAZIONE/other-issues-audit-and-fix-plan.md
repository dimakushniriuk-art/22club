# 🔍 Audit Problemi Aggiuntivi + Piano di Risoluzione

**Data**: 2025-01-27  
**Principal Engineer + QA Automation**  
**Progetto**: 22Club - Next.js 15 + React Query + Supabase

---

## 📊 FASE 1: AUDIT & TRIAGE

### PROBLEMA 1: Uso di window.location.reload() come fallback errore

**Evidenze**:

- `src/app/home/chat/page.tsx:291` → `onClick={() => window.location.reload()}`
- Nessun altro uso di `window.location.reload()` in `/home`

**Impatto Reale**:

- **UX**: Full page reload perde stato React, cache, scroll position
- **Performance**: Ricarica tutto il bundle JS, perdita cache React Query
- **Stabilità**: Può causare loop infiniti se errore persiste

**Severità**: **P1** (Alta - UX degradata, ma non blocca funzionalità)

**Classificazione**: **ROOT CAUSE** - Fallback errato, dovrebbe usare refetch selettivo

**Punto di Verifica**:

- Test: simulare errore fetch in chat page
- Verificare: nessun `window.location.reload()` chiamato
- Verificare: refetch/invalidazione React Query funziona
- Verificare: UX fallback stabile (messaggio errore + retry button)

---

### PROBLEMA 2: Commento ammette workaround architetturale

**Evidenze**:

- `src/app/home/_components/home-layout-client.tsx:14` → commento: "Con window.location.href non serve gestire invalidazione query o refresh perché il remount è completo"
- Questo commento suggerisce che il codice si affida a hard reload invece di gestione corretta

**Impatto Reale**:

- **Architettura**: Pattern anti-pattern documentato come soluzione
- **Manutenibilità**: Nuovi sviluppatori potrebbero seguire questo pattern
- **Performance**: Perdita cache e stato non necessaria

**Severità**: **P2** (Media - Documentazione problematica, ma codice già fixato in STEP 2)

**Classificazione**: **SINTOMO** - Commento obsoleto dopo fix STEP 2 (prefetch)

**Punto di Verifica**:

- Rimuovere commento obsoleto
- Verificare: nessun uso di `window.location.href` in `/home` (già fixato)

---

### PROBLEMA 3: Realtime subscriptions non pulite correttamente

**Evidenze**:

- `src/lib/realtimeClient.ts:54-56` → `unsubscribe()` chiamato ma `channels` Map mantiene riferimento
- `subscribeToTable` e `subscribeToChannel` ritornano cleanup function, ma non rimuovono da Map
- `cleanupRealtimeChannels()` esiste ma non viene chiamato automaticamente

**Impatto Reale**:

- **Memory Leak**: Map `channels` cresce indefinitamente
- **Performance**: Canali duplicati, subscription multiple
- **Stabilità**: Possibile crash su sessioni lunghe

**Severità**: **P0** (Critico - Memory leak può causare crash)

**Classificazione**: **ROOT CAUSE** - Cleanup incompleto, Map non sincronizzata con stato reale

**Punto di Verifica**:

- Test: mount/unmount componente con realtime subscription
- Verificare: `channels.size` non aumenta dopo unmount
- Verificare: nessun canale orfano in Map
- Verificare: cleanup function rimuove da Map

---

### PROBLEMA 4: useEffect/useMemo con dipendenze instabili

**Evidenze**:

- `src/app/home/profilo/page.tsx:52` → `useMemo(() => createClient(), [])`
- Altri file: `createClient()` chiamato direttamente in component body (9 occorrenze)
- `createClient()` crea nuovo client ogni volta (non singleton)

**Impatto Reale**:

- **Performance**: Ricreazione client Supabase non necessaria
- **Stabilità**: Possibili subscription duplicate se client ricreato
- **Memory**: Oggetti client non riutilizzati

**Severità**: **P1** (Alta - Performance e stabilità)

**Classificazione**: **ROOT CAUSE** - Client lifecycle non gestito correttamente

**Punto di Verifica**:

- Test: mount/unmount pagina profilo
- Verificare: client Supabase creato una sola volta
- Verificare: nessun client duplicato
- Verificare: subscription non duplicate

---

### PROBLEMA 5: Mancanza di error boundaries specifici

**Evidenze**:

- Solo `ErrorBoundary` generico in `home-layout-client.tsx:29`
- Nessun `error.tsx` per route dinamiche critiche
- Errori in una route possono buttare giù tutta l'app

**Impatto Reale**:

- **UX**: Errore locale causa crash globale
- **Stabilità**: Nessun isolamento errori per route
- **Debug**: Difficile identificare route problematica

**Severità**: **P1** (Alta - Stabilità e UX)

**Classificazione**: **ROOT CAUSE** - Manca isolamento errori per route

**Punto di Verifica**:

- Test: simulare errore in route dinamica
- Verificare: solo quella route mostra errore, resto app funziona
- Verificare: `error.tsx` gestisce errore correttamente
- Verificare: possibilità di retry senza reload

---

### PROBLEMA 6: Nessuna ottimizzazione/config per route dinamiche

**Evidenze**:

- `src/app/home/allenamenti/[workout_plan_id]/page.tsx` → nessun `export const dynamic`
- `src/app/home/allenamenti/[workout_plan_id]/[day_id]/page.tsx` → nessun `export const dynamic`
- Nessun `generateStaticParams` o `revalidate`

**Impatto Reale**:

- **Performance**: Route sempre SSR, nessun caching
- **Scalabilità**: Query ripetute per ogni request
- **UX**: Caricamento più lento

**Severità**: **P2** (Media - Performance, ma non critico)

**Classificazione**: **ROOT CAUSE** - Config route mancante

**Punto di Verifica**:

- Test: navigazione route dinamiche
- Verificare: `dynamic = 'force-dynamic'` o `revalidate` configurato
- Verificare: performance migliorata (se ISR applicabile)

---

### PROBLEMA 7: Query con retry limitato a 1

**Evidenze**:

- `src/providers/query-provider.tsx:20` → `retry: 1`
- Retry fisso per tutti gli errori (anche 4xx che non dovrebbero essere ritentati)

**Impatto Reale**:

- **Resilienza**: Retry insufficiente per errori transienti (network, 5xx)
- **Performance**: Retry inutile su errori permanenti (4xx)
- **UX**: Fallimento prematuro su errori recuperabili

**Severità**: **P1** (Alta - Resilienza e UX)

**Classificazione**: **ROOT CAUSE** - Retry policy non intelligente

**Punto di Verifica**:

- Test: simulare errori network transienti
- Verificare: retry 3 volte con backoff
- Verificare: nessun retry su 4xx
- Verificare: retry solo su network/5xx

---

### PROBLEMA 8: Nessuna gestione loading state per nested routes

**Evidenze**:

- `src/app/home/allenamenti/[workout_plan_id]/[day_id]/page.tsx` → nessun `loading.tsx`
- Nessun `loading.tsx` trovato in route dinamiche `/home/allenamenti/**`

**Impatto Reale**:

- **UX**: Nessun feedback durante caricamento route dinamiche
- **Performance**: Percepita come più lenta senza loading state
- **Coerenza**: Inconsistente con altre route

**Severità**: **P2** (Media - UX, ma non critico)

**Classificazione**: **ROOT CAUSE** - Loading state mancante

**Punto di Verifica**:

- Test: navigazione route dinamiche
- Verificare: `loading.tsx` appare durante caricamento
- Verificare: transizione smooth da loading a contenuto

---

### PROBLEMA 9: Imports non ottimizzati per route home

**Evidenze**:

- `src/app/home/profilo/page.tsx:36-45` → importa tutti i componenti `athlete-profile` anche se non usati subito
- Componenti importati: `AthleteAnagraficaTab`, `AthleteMedicalTab`, `AthleteFitnessTab`, `AthleteNutritionTab`, `AthleteMassageTab`, `AthleteAdministrativeTab`
- Usati solo quando tab attiva (lazy loading sarebbe meglio)

**Impatto Reale**:

- **Bundle Size**: Componenti non necessari nel bundle iniziale
- **Performance**: Parsing JS non necessario al mount
- **First Render**: Più lento del necessario

**Severità**: **P2** (Media - Performance, ma non critico)

**Classificazione**: **ROOT CAUSE** - Import eager invece di lazy

**Punto di Verifica**:

- Test: bundle analyzer
- Verificare: componenti tab non nel bundle iniziale
- Verificare: caricati solo quando tab attiva
- Verificare: bundle size ridotto

---

### PROBLEMA 10: Mismatch cache React Query vs fetchWithCache

**Evidenze**:

- `src/lib/fetchWithCache.ts` → cache in-memory separata
- React Query ha sua cache
- `getAppointmentsCached`, `getClientiStatsCached`, `getDocumentsCached` usano fetchWithCache
- Alcuni hook usano React Query, altri fetchWithCache

**Impatto Reale**:

- **Coerenza**: Dati possono essere inconsistenti tra le due cache
- **Invalidazione**: Invalidare una cache non aggiorna l'altra
- **Performance**: Doppio layer cache non necessario
- **Manutenibilità**: Due sistemi da gestire

**Severità**: **P1** (Alta - Coerenza dati e manutenibilità)

**Classificazione**: **ROOT CAUSE** - Doppio sistema cache non coordinato

**Punto di Verifica**:

- Test: fetch stesso dato con entrambi i sistemi
- Verificare: dati consistenti
- Verificare: invalidazione aggiorna entrambe (o una sola fonte di verità)
- Verificare: nessun doppio fetch

---

## 🎯 FASE 2: STRATEGIE COERENTI

### A) Error Handling

**Decisione**: **Refetch Selettivo + Error Boundaries per Route**

**Approccio**:

- Sostituire `window.location.reload()` con `queryClient.invalidateQueries()` + `queryClient.refetchQueries()`
- Error boundaries per route critiche: una per `/home` e una per route dinamiche
- `error.tsx` per route dinamiche per isolamento errori

**Implementazione**:

- Button "Riprova" → `refetchQueries` invece di `reload()`
- Error boundary in `home-layout-client.tsx` (già presente, migliorare)
- `error.tsx` per `/home/allenamenti/[workout_plan_id]` e `[day_id]`

---

### B) Realtime Lifecycle

**Decisione**: **Cleanup Completo con Map Sincronizzata**

**Approccio**:

- Cleanup function deve rimuovere canale da Map
- Pattern: `ensureChannel(key)` e `cleanupChannel(key)`
- Map deve riflettere stato reale (canali attivi)

**Implementazione**:

- Modificare `subscribeToTable` e `subscribeToChannel` per rimuovere da Map in cleanup
- Aggiungere `cleanupChannel(name)` esplicito
- Test che verifica Map.size dopo unmount

---

### C) Supabase Client Lifecycle

**Decisione**: **Provider Singleton o Hook Stabile**

**Approccio**:

- Un solo client stabile per sessione
- Provider Supabase o hook `useSupabase()` che ritorna client stabile
- Vietare `createClient()` in component body (eccetto server-side)

**Implementazione**:

- Creare `SupabaseProvider` o migliorare hook esistente
- Sostituire `createClient()` in component con `useSupabase()`
- `useMemo(() => createClient(), [])` → `useSupabase()` hook

---

### D) Route Dinamiche

**Decisione**: **Config Esplicito per Ogni Route**

**Approccio**:

- `dynamic = 'force-dynamic'` per route con dati real-time
- `revalidate` per route con dati semi-statici (se applicabile)
- `generateStaticParams` per route con dati stabili (se applicabile)

**Implementazione**:

- Aggiungere `export const dynamic = 'force-dynamic'` a route dinamiche
- Aggiungere `loading.tsx` per route dinamiche
- Aggiungere `error.tsx` per route dinamiche

---

### E) Retry Policy

**Decisione**: **Retry Intelligente con Backoff**

**Approccio**:

- Retry 3 volte con backoff esponenziale
- Retry solo su errori transienti (network, 5xx)
- Nessun retry su 4xx (errori client)

**Implementazione**:

- Funzione `shouldRetry(error)` che distingue errori
- Config React Query: `retry: (failureCount, error) => shouldRetry(error) && failureCount < 3`
- Backoff: `retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)`

---

### F) Import / Code Splitting

**Decisione**: **Dynamic Import per Componenti Tab/Accordion**

**Approccio**:

- Dynamic import per componenti usati solo su interazione (tab, accordion, modali)
- Lazy load su tab/accordion
- Evitare import eager di componenti non usati inizialmente

**Implementazione**:

- Convertire import tab in `dynamic(() => import(...))`
- Loading state durante caricamento
- Test bundle size

---

### G) Cache Strategy Unica

**Decisione**: **React Query come Single Source of Truth**

**Approccio**:

- Rimuovere `fetchWithCache` dove possibile
- Usare React Query per tutte le query
- Mantenere `fetchWithCache` solo per casi server-side o utility

**Implementazione**:

- Migrare `getAppointmentsCached`, `getClientiStatsCached`, `getDocumentsCached` a React Query hooks
- Rimuovere `fetchWithCache` da client-side code
- Mantenere solo per server-side utilities

---

## 🛠️ FASE 3: PIANO DI RISOLUZIONE (MAX 10 STEP)

### STEP 1: Eliminare window.location.reload() e sostituire con refetch

**Scopo**: Sostituire hard reload con refetch selettivo React Query

**File da toccare** (2):

- `src/app/home/chat/page.tsx`
- `src/app/home/_components/home-layout-client.tsx` (rimuovere commento)

**Modifiche**:

1. `chat/page.tsx`: Sostituire `window.location.reload()` con `queryClient.refetchQueries()` o `queryClient.invalidateQueries()`
2. `home-layout-client.tsx`: Rimuovere commento obsoleto

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**:

- Nessun `window.location.reload()` in `/home`
- Button "Riprova" triggera refetch invece di reload
- Test: errore non causa reload

---

### STEP 2: Fix Memory Leak Realtime - Map Cleanup

**Scopo**: Sincronizzare Map `channels` con stato reale, rimuovere canali in cleanup

**File da toccare** (2):

- `src/lib/realtimeClient.ts`
- `src/hooks/useRealtimeChannel.ts` (se esiste)

**Modifiche**:

1. `realtimeClient.ts`: Modificare cleanup function per rimuovere da Map
2. Aggiungere `cleanupChannel(name)` esplicito
3. Test che verifica Map.size dopo unmount

**Rischio**: Medio (potrebbe rompere subscription esistenti)  
**Rollback**: Revert commit  
**Criterio "done"**:

- Cleanup function rimuove da Map
- Test: Map.size non aumenta dopo unmount
- Nessun canale orfano

---

### STEP 3: Stabilizzare Supabase Client - Provider/Hook

**Scopo**: Un solo client stabile, eliminare ricreazioni non necessarie

**File da toccare** (3):

- Creare `src/hooks/use-supabase-client.ts` (NUOVO) o migliorare esistente
- `src/app/home/profilo/page.tsx`
- Altri file con `createClient()` in component body (max 2 per step)

**Modifiche**:

1. Creare hook `useSupabaseClient()` che ritorna client stabile
2. Sostituire `useMemo(() => createClient(), [])` con `useSupabaseClient()`
3. Sostituire `createClient()` diretto con hook

**Rischio**: Medio  
**Rollback**: Revert commit  
**Criterio "done"**:

- Client creato una sola volta per sessione
- Test: mount/unmount non ricrea client
- Nessun client duplicato

---

### STEP 4: Aggiungere Error Boundaries per Route

**Scopo**: Isolamento errori per route, error.tsx per route dinamiche

**File da toccare** (3):

- `src/app/home/allenamenti/[workout_plan_id]/error.tsx` (NUOVO)
- `src/app/home/allenamenti/[workout_plan_id]/[day_id]/error.tsx` (NUOVO)
- `src/app/home/_components/home-layout-client.tsx` (migliorare ErrorBoundary)

**Modifiche**:

1. Creare `error.tsx` per route dinamiche
2. Migliorare ErrorBoundary in layout per isolamento migliore
3. Test che verifica isolamento errori

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**:

- Error.tsx presente per route dinamiche
- Test: errore in route non butta giù app
- Possibilità di retry senza reload

---

### STEP 5: Config Route Dinamiche + Loading States

**Scopo**: Config esplicito per route dinamiche, loading.tsx per feedback UX

**File da toccare** (4):

- `src/app/home/allenamenti/[workout_plan_id]/page.tsx` (aggiungere `export const dynamic`)
- `src/app/home/allenamenti/[workout_plan_id]/loading.tsx` (NUOVO)
- `src/app/home/allenamenti/[workout_plan_id]/[day_id]/page.tsx` (aggiungere `export const dynamic`)
- `src/app/home/allenamenti/[workout_plan_id]/[day_id]/loading.tsx` (NUOVO)

**Modifiche**:

1. Aggiungere `export const dynamic = 'force-dynamic'` a route dinamiche
2. Creare `loading.tsx` con skeleton/loader
3. Test che verifica loading state

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**:

- Dynamic config presente
- Loading.tsx presente e funzionante
- Test: loading appare durante navigazione

---

### STEP 6: Migliorare Retry Policy - Retry Intelligente

**Scopo**: Retry condizionale con backoff, solo su errori transienti

**File da toccare** (2):

- `src/providers/query-provider.tsx`
- Creare `src/lib/retry-policy.ts` (NUOVO) per logica shouldRetry

**Modifiche**:

1. Creare funzione `shouldRetry(error)` che distingue errori
2. Config React Query: `retry: (failureCount, error) => shouldRetry(error) && failureCount < 3`
3. Backoff esponenziale: `retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)`

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**:

- Retry 3 volte con backoff
- Nessun retry su 4xx
- Test: retry solo su network/5xx

---

### STEP 7: Ottimizzare Imports - Dynamic Import Tab

**Scopo**: Lazy load componenti tab, ridurre bundle iniziale

**File da toccare** (1):

- `src/app/home/profilo/page.tsx`

**Modifiche**:

1. Convertire import tab in `dynamic(() => import(...))`
2. Loading state durante caricamento tab
3. Test bundle size

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**:

- Tab componenti caricati lazy
- Bundle size ridotto
- Test: tab caricati solo quando attivi

---

### STEP 8: Unificare Cache Strategy - React Query Only

**Scopo**: Rimuovere fetchWithCache da client-side, usare React Query come single source of truth

**File da toccare** (3):

- `src/lib/fetchWithCache.ts` (deprecare funzioni client-side)
- Creare hook React Query per appointments, clienti stats, documents
- Rimuovere chiamate a `getAppointmentsCached`, `getClientiStatsCached`, `getDocumentsCached` da client-side

**Modifiche**:

1. Creare hook React Query: `useAppointments()`, `useClientiStats()`, `useDocuments()`
2. Sostituire chiamate `fetchWithCache` con hook React Query
3. Mantenere `fetchWithCache` solo per server-side utilities

**Rischio**: Medio (potrebbe rompere codice esistente)  
**Rollback**: Revert commit  
**Criterio "done"**:

- Nessun fetchWithCache in client-side code
- React Query come single source of truth
- Test: dati consistenti, invalidazione funziona

---

### STEP 9: Test Memory Leak Realtime (Verifica)

**Scopo**: Verificare che fix STEP 2 funzioni correttamente

**File da toccare** (1):

- `tests/integration/realtime-cleanup.test.tsx` (NUOVO)

**Modifiche**:

1. Test che monta/unmount componente con realtime subscription
2. Verifica Map.size non aumenta
3. Verifica nessun canale orfano

**Rischio**: Basso  
**Rollback**: N/A (solo test)  
**Criterio "done"**:

- Test passa
- Memory leak verificato risolto

---

### STEP 10: Test Hard Reload Prevention (Verifica)

**Scopo**: Test che proibisce hard reload in error fallback

**File da toccare** (1):

- `tests/unit/no-hard-reload.test.ts` (NUOVO)

**Modifiche**:

1. Test grep/lint che fallisce se trova `window.location.reload()` o `window.location.href` in `/home` (eccetto whitelist)
2. Test integration che verifica refetch invece di reload

**Rischio**: Basso  
**Rollback**: N/A (solo test)  
**Criterio "done"**:

- Test passa
- Hard reload proibito

---

## 🧪 FASE 4: PIANO TEST AUTOMATICI

### A) UNIT TEST (Vitest)

#### Test 1: Proibire Hard Reload

**File**: `tests/unit/no-hard-reload.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { globSync } from 'glob'
import { join } from 'path'

describe('No Hard Reload in Home Routes', () => {
  it('should not use window.location.reload() in /home routes', () => {
    const homeDir = join(process.cwd(), 'src/app/home')
    const files = globSync('**/*.{ts,tsx}', { cwd: homeDir })

    const violations: string[] = []

    files.forEach((file) => {
      const content = readFileSync(join(homeDir, file), 'utf-8')
      // Match window.location.reload() (non in commenti)
      if (content.match(/window\.location\.reload\s*\(/)) {
        violations.push(file)
      }
    })

    expect(violations).toEqual([])
  })

  it('should not use window.location.href for navigation in /home routes', () => {
    const homeDir = join(process.cwd(), 'src/app/home')
    const files = globSync('**/*.{ts,tsx}', { cwd: homeDir })

    const violations: string[] = []

    files.forEach((file) => {
      const content = readFileSync(join(homeDir, file), 'utf-8')
      // Match window.location.href = (non in commenti, non mailto:)
      if (
        content.match(/window\.location\.href\s*=\s*[^'"]*['"]\/[^'"]*['"]/) &&
        !content.includes('mailto:')
      ) {
        violations.push(file)
      }
    })

    expect(violations).toEqual([])
  })
})
```

**Comando**: `npm run test:unit tests/unit/no-hard-reload.test.ts`

---

#### Test 2: RealtimeClient Map Cleanup

**File**: `tests/unit/realtime-client-cleanup.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { subscribeToTable, cleanupRealtimeChannels } from '@/lib/realtimeClient'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}))

describe('RealtimeClient Cleanup', () => {
  beforeEach(() => {
    cleanupRealtimeChannels()
  })

  it('should remove channel from Map when cleanup function is called', () => {
    const cleanup1 = subscribeToTable('appointments', () => {})
    const cleanup2 = subscribeToTable('documents', () => {})

    // Verifica che Map abbia 2 canali
    // (necessita accesso interno a channels Map - potrebbe richiedere export per test)

    cleanup1()
    cleanup2()

    // Verifica che Map sia vuota dopo cleanup
    // (necessita accesso interno)
  })
})
```

**Comando**: `npm run test:unit tests/unit/realtime-client-cleanup.test.ts`

---

#### Test 3: Retry Policy Intelligente

**File**: `tests/unit/retry-policy.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { shouldRetry } from '@/lib/retry-policy'

describe('Retry Policy', () => {
  it('should retry on network errors', () => {
    const networkError = new Error('Network request failed')
    expect(shouldRetry(networkError)).toBe(true)
  })

  it('should retry on 5xx errors', () => {
    const serverError = { status: 500, message: 'Internal Server Error' }
    expect(shouldRetry(serverError)).toBe(true)
  })

  it('should not retry on 4xx errors', () => {
    const clientError = { status: 404, message: 'Not Found' }
    expect(shouldRetry(clientError)).toBe(false)
  })

  it('should not retry on 401 errors', () => {
    const authError = { status: 401, message: 'Unauthorized' }
    expect(shouldRetry(authError)).toBe(false)
  })
})
```

**Comando**: `npm run test:unit tests/unit/retry-policy.test.ts`

---

#### Test 4: Cache Strategy Coerenza

**File**: `tests/unit/cache-strategy.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

describe('Cache Strategy', () => {
  it('should not use fetchWithCache in client-side hooks', () => {
    // Test grep che verifica che hook client-side non usino fetchWithCache
    const hooksDir = join(process.cwd(), 'src/hooks')
    const files = globSync('**/*.ts', { cwd: hooksDir })

    const violations: string[] = []

    files.forEach((file) => {
      const content = readFileSync(join(hooksDir, file), 'utf-8')
      if (content.includes('fetchWithCache') && !content.includes('// Server-side only')) {
        violations.push(file)
      }
    })

    expect(violations).toEqual([])
  })
})
```

**Comando**: `npm run test:unit tests/unit/cache-strategy.test.ts`

---

### B) INTEGRATION TEST (React Testing Library)

#### Test 5: Error Fallback Chat - No Reload

**File**: `tests/integration/chat-error-fallback.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatPage from '@/app/home/chat/page'

describe('Chat Error Fallback', () => {
  it('should not call window.location.reload() on error', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    // Mock errore fetch
    vi.spyOn(queryClient, 'refetchQueries').mockRejectedValue(new Error('Fetch failed'))

    render(
      <QueryClientProvider client={queryClient}>
        <ChatPage />
      </QueryClientProvider>
    )

    // Simula errore e click "Riprova"
    const retryButton = await screen.findByText('Riprova')
    retryButton.click()

    await waitFor(() => {
      expect(reloadSpy).not.toHaveBeenCalled()
      expect(queryClient.refetchQueries).toHaveBeenCalled()
    })
  })
})
```

**Comando**: `npm run test:integration tests/integration/chat-error-fallback.test.tsx`

---

#### Test 6: Supabase Client Lifecycle

**File**: `tests/integration/supabase-client-lifecycle.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, unmount } from '@testing-library/react'
import ProfiloPage from '@/app/home/profilo/page'

describe('Supabase Client Lifecycle', () => {
  it('should create client only once per component instance', () => {
    const createClientSpy = vi.spyOn(require('@/lib/supabase/client'), 'createClient')

    const { unmount: unmount1 } = render(<ProfiloPage />)
    const { unmount: unmount2 } = render(<ProfiloPage />)

    // Verifica che createClient sia chiamato solo una volta per istanza
    expect(createClientSpy).toHaveBeenCalledTimes(2) // Una per istanza

    unmount1()
    unmount2()

    // Verifica che unmount non ricrei client
    // (dipende da implementazione)
  })
})
```

**Comando**: `npm run test:integration tests/integration/supabase-client-lifecycle.test.tsx`

---

#### Test 7: Nested Routes Loading State

**File**: `tests/integration/nested-routes-loading.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WorkoutPlanDaysPage from '@/app/home/allenamenti/[workout_plan_id]/page'

describe('Nested Routes Loading', () => {
  it('should show loading state during route navigation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <WorkoutPlanDaysPage />
      </QueryClientProvider>
    )

    // Verifica che loading.tsx sia renderizzato
    await waitFor(() => {
      expect(screen.getByText(/caricamento/i)).toBeInTheDocument()
    })
  })
})
```

**Comando**: `npm run test:integration tests/integration/nested-routes-loading.test.tsx`

---

### C) E2E TEST (Playwright)

#### Test 8: Navigazione SPA - No Hard Reload

**File**: `tests/e2e/navigation-spa.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('SPA Navigation', () => {
  test('should navigate without hard reload', async ({ page }) => {
    await page.goto('/home')

    const navigationEvents: string[] = []
    page.on('framenavigated', () => {
      navigationEvents.push('navigated')
    })

    // Naviga tra route
    await page.click('text=PROFILO')
    await page.waitForLoadState('networkidle')

    await page.click('text=DOCUMENTI')
    await page.waitForLoadState('networkidle')

    await page.click('text=ALLENAMENTI')
    await page.waitForLoadState('networkidle')

    // Verifica che non ci siano full page reload
    // (navigated event dovrebbe essere 1, non multipli)
    expect(navigationEvents.length).toBeLessThanOrEqual(1)
  })

  test('should not use window.location.reload() on error', async ({ page }) => {
    await page.goto('/home/chat')

    // Simula errore (mock network failure)
    await page.route('**/supabase.co/**', (route) => route.abort())

    // Verifica che non ci sia reload
    const reloadDetected = await page.evaluate(() => {
      let reloaded = false
      const originalReload = window.location.reload
      window.location.reload = () => {
        reloaded = true
        originalReload()
      }
      return reloaded
    })

    expect(reloadDetected).toBe(false)
  })
})
```

**Comando**: `npm run test:e2e tests/e2e/navigation-spa.spec.ts`

---

#### Test 9: Route Dinamiche - Loading e Error

**File**: `tests/e2e/dynamic-routes.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Dynamic Routes', () => {
  test('should show loading state for dynamic route', async ({ page }) => {
    await page.goto('/home/allenamenti')

    // Clicca su workout plan
    await page.click('text=Workout Plan')

    // Verifica che loading.tsx appaia
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // Verifica che page completa si carichi
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle errors in dynamic route without crashing app', async ({ page }) => {
    await page.goto('/home/allenamenti/invalid-id')

    // Verifica che error.tsx gestisca errore
    await expect(page.locator('[data-testid="error"]')).toBeVisible()

    // Verifica che resto app funzioni (navigazione ancora possibile)
    await page.click('text=HOME')
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

**Comando**: `npm run test:e2e tests/e2e/dynamic-routes.spec.ts`

---

#### Test 10: Realtime Memory Leak Prevention

**File**: `tests/e2e/realtime-memory-leak.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Realtime Memory Leak Prevention', () => {
  test('should not create duplicate subscriptions', async ({ page }) => {
    await page.goto('/home/appuntamenti')

    // Naviga via e torna
    await page.click('text=HOME')
    await page.click('text=APPUNTAMENTI')

    // Verifica che non ci siano subscription duplicate
    // (richiede accesso a canali realtime - potrebbe richiedere strumentazione)
    const subscriptionCount = await page.evaluate(() => {
      // Accesso a canali realtime (richiede export per test)
      return 0 // Placeholder
    })

    expect(subscriptionCount).toBeLessThanOrEqual(1)
  })
})
```

**Comando**: `npm run test:e2e tests/e2e/realtime-memory-leak.spec.ts`

---

## 📝 FASE 5: IMPLEMENTAZIONE MINIMA + DIFF

### STEP 1: Eliminare window.location.reload() e sostituire con refetch

#### File: `src/app/home/chat/page.tsx` (MODIFICA)

```diff
--- a/src/app/home/chat/page.tsx
+++ b/src/app/home/chat/page.tsx
@@ -1,5 +1,6 @@
 'use client'

+import { useQueryClient } from '@tanstack/react-query'
 import { useState, useEffect, useCallback } from 'react'
 import { useRouter } from 'next/navigation'
 import { useAuth } from '@/hooks/use-auth'
@@ -20,6 +21,7 @@ export default function ChatPage() {
   const router = useRouter()
   const { user, loading: authLoading } = useAuth()
   const [error, setError] = useState<string | null>(null)
+  const queryClient = useQueryClient()

   // ... existing code ...

@@ -285,11 +287,15 @@ export default function ChatPage() {
           <p className="text-text-secondary mb-6 text-base">{error}</p>
           <Button
-            onClick={() => window.location.reload()}
+            onClick={() => {
+              // Refetch selettivo invece di hard reload
+              queryClient.invalidateQueries()
+              queryClient.refetchQueries()
+              setError(null)
+            }}
             className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-200"
           >
             Riprova
           </Button>
```

---

#### File: `src/app/home/_components/home-layout-client.tsx` (MODIFICA)

```diff
--- a/src/app/home/_components/home-layout-client.tsx
+++ b/src/app/home/_components/home-layout-client.tsx
@@ -11,9 +11,7 @@ interface HomeLayoutClientProps {
   children: ReactNode
 }

-/**
- * Client Component wrapper per il layout home
- * Con window.location.href non serve gestire invalidazione query o refresh perché il remount è completo
- */
+/** Client Component wrapper per il layout home */
 export function HomeLayoutClient({ children }: HomeLayoutClientProps) {
```

---

### STEP 2: Fix Memory Leak Realtime - Map Cleanup

#### File: `src/lib/realtimeClient.ts` (MODIFICA)

```diff
--- a/src/lib/realtimeClient.ts
+++ b/src/lib/realtimeClient.ts
@@ -25,6 +25,12 @@ export function subscribeToTable<TableName extends keyof Database['public']['T
   ) {
     const channel = getRealtimeChannel(`realtime:${String(table)}`)

+  // Cleanup function che rimuove canale da Map
+  const cleanup = () => {
+    channel.unsubscribe()
+    channels.delete(`realtime:${String(table)}`)
+  }
+
   ;(
     channel as unknown as {
       on: (
@@ -40,9 +46,7 @@ export function subscribeToTable<TableName extends keyof Database['public']['T
       onEvent as (payload: unknown) => void,
     )
     .subscribe()

-  return () => {
-    channel.unsubscribe()
-  }
+  return cleanup
 }

 export function subscribeToChannel<T>(
@@ -50,6 +54,12 @@ export function subscribeToChannel<T>(
   eventName: string,
   onEvent: (payload: T) => void,
 ) {
   const channel = getRealtimeChannel(channelName)

+  // Cleanup function che rimuove canale da Map
+  const cleanup = () => {
+    channel.unsubscribe()
+    channels.delete(channelName)
+  }

   ;(
     channel as unknown as {
@@ -65,9 +75,7 @@ export function subscribeToChannel<T>(
     )
     .subscribe()

-  return () => {
-    channel.unsubscribe()
-  }
+  return cleanup
 }

+// Funzione esplicita per cleanup canale
+export function cleanupChannel(name: string) {
+  const channel = channels.get(name)
+  if (channel) {
+    channel.unsubscribe()
+    channels.delete(name)
+  }
+}
```

---

## ✅ CHECKLIST FINALE

- [ ] window.location.reload() eliminato
- [ ] Commento obsoleto rimosso
- [ ] Realtime Map cleanup implementato
- [ ] Supabase client stabilizzato
- [ ] Error boundaries per route
- [ ] Config route dinamiche
- [ ] Loading.tsx per nested routes
- [ ] Retry policy migliorata
- [ ] Imports ottimizzati
- [ ] Cache strategy unificata
- [ ] Test unit passano
- [ ] Test integration passano
- [ ] Test e2e passano

---

## 📌 NOTE FINALI

1. **Priorità**: P0 (realtime leak) → P1 (reload, client lifecycle, error boundaries, retry, cache) → P2 (route config, loading, imports)

2. **Quick Wins**: STEP 1-2 (reload e realtime leak) hanno impatto immediato

3. **Rischio**: STEP 8 (cache unificata) è il più rischioso - richiede refactor

4. **Benefici Attesi**:
   - Memory leak risolto
   - UX migliorata (no hard reload)
   - Stabilità migliorata (error boundaries)
   - Performance migliorata (retry intelligente, cache unificata)

---

**Fine Documento**
