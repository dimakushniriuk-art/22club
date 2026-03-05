# 🔍 Audit Tecnico Refresh Automatico + Piano di Risoluzione

**Data**: 2025-01-27  
**Lead Engineer + QA Automation**  
**Progetto**: 22Club - Next.js 15 + React Query + Supabase

---

## 📋 FASE 1: AUDIT TECNICO COMPLETO

### CAUSA 1: React Query config disabilita refetch automatico

**Stato**: ✅ **CONFERMATA** - Criticità: 90/100

**Evidenze**:

```12:17:src/providers/query-provider.tsx
staleTime: 5 * 60 * 1000, // 5 minuti
// Non refetch automatico quando il componente viene montato (usa cache se fresca)
refetchOnMount: false,
// Non refetch quando la finestra riprende focus
refetchOnWindowFocus: false,
```

**Impatto**:

- Query considerate "fresche" per 5 minuti anche dopo mutation
- Nessun refetch automatico su mount/focus
- Dati obsoleti visibili all'utente

**Query Keys coinvolte**: Tutte le query React Query (poche nel progetto)

**Mutation che non invalidano**: Nessuna mutation React Query trovata (vedi CAUSA 7)

---

### CAUSA 2: Tutte le pagine sono Client Components

**Stato**: ✅ **CONFERMATA** - Criticità: 40/100

**Evidenze**:

- `src/app/home/page.tsx:1` → `'use client'`
- `src/app/home/appuntamenti/page.tsx:1` → `'use client'`
- `src/app/home/progressi/page.tsx:1` → `'use client'`
- `src/app/home/documenti/page.tsx:1` → `'use client'`
- `src/app/home/allenamenti/page.tsx:1` → `'use client'`

**Impatto**:

- Nessun beneficio di Server Components per caching Next.js
- Tutto il rendering lato client
- Non è root cause del refresh, ma limita ottimizzazioni

**Nota**: Non è root cause del refresh mancante, ma limita le opzioni di ottimizzazione.

---

### CAUSA 3: Uso di window.location.href invece di router.push

**Stato**: ✅ **CONFERMATA** - Criticità: 70/100

**Evidenze**:

```161:163:src/app/home/page.tsx
// Usa window.location.href per garantire remount completo e dati sempre aggiornati
// Questo è l'unico modo affidabile per Next.js App Router quando si naviga tra route nello stesso gruppo
window.location.href = blocco.href
```

**Altri usi trovati**:

- `src/components/athlete/home-button.tsx:12` → `window.location.href = '/home'`
- `src/app/home/progressi/foto/page.tsx:253` → `window.location.href = '/home/progressi'`
- Altri 17 usi (mailto, error boundary, notifiche - OK)

**Impatto**:

- Full page reload invece di navigazione SPA
- Perdita stato React Query cache
- UX peggiore (flash bianco, perdita scroll position)

**Root Cause**: Workaround per refresh mancante, ma crea problema maggiore.

---

### CAUSA 4: Mancanza di revalidatePath/revalidateTag

**Stato**: ⚠️ **PARZIALE** - Criticità: 30/100

**Evidenze**:

- `grep -r "revalidatePath\|revalidateTag" src/app/home/` → Nessun risultato
- Le pagine sono Client Components, quindi `revalidatePath` non applicabile direttamente

**Impatto**:

- Non root cause (pagine sono client components)
- Se si migrasse a Server Components, servirebbe

**Nota**: Non applicabile alle pagine client attuali.

---

### CAUSA 5: Realtime subscriptions assenti su pagine principali

**Stato**: ✅ **CONFERMATA** - Criticità: 60/100

**Evidenze**:

- ✅ `src/hooks/use-chat.ts` → usa `useChatRealtimeOptimized`
- ✅ `src/hooks/use-clienti.ts:1128-1150` → realtime opzionale (non usato di default)
- ❌ `src/app/home/appuntamenti/page.tsx` → NO realtime
- ❌ `src/app/home/progressi/page.tsx` → NO realtime
- ❌ `src/app/home/documenti/page.tsx` → NO realtime
- ❌ `src/app/home/allenamenti/page.tsx` → NO realtime

**Infrastruttura esistente**:

- `src/lib/realtimeClient.ts` → `subscribeToTable` disponibile
- `src/hooks/useRealtimeChannel.ts` → hook disponibile

**Impatto**:

- Dati non aggiornati in tempo reale
- Utente deve refresh manuale

---

### CAUSA 6: React Query staleTime alto (5 minuti)

**Stato**: ✅ **CONFERMATA** - Criticità: 80/100

**Evidenza**: Già documentata in CAUSA 1

**Impatto**: Dati considerati "freschi" per 5 minuti anche dopo mutation.

---

### CAUSA 7: Nessuna invalidazione query dopo mutation

**Stato**: ✅ **CONFERMATA** - Criticità: 95/100

**Evidenze**:

**Mutation trovate senza invalidazione**:

1. `src/components/dashboard/nuovo-pagamento-modal.tsx:307-380`
   - Crea pagamento → NO `invalidateQueries`
   - Solo callback `onSuccess()` che chiude modal

2. `src/components/documents/document-uploader-modal.tsx:117-143`
   - Carica documento → NO `invalidateQueries`
   - Solo callback `onSuccess?.()`

3. `src/components/dashboard/appointment-modal.tsx`
   - Crea appuntamento → NO `invalidateQueries` (verificare handleSubmit)

**Problema architetturale**:

- **Nessuna mutation usa React Query `useMutation`**
- Tutte le mutation sono fetch diretti Supabase + callback
- Gli hooks custom (`useAppointments`, `useProgressAnalytics`, `useDocuments`, `useAllenamenti`) **NON usano React Query**, ma `useState` + `useEffect`

**Impatto**:

- **ROOT CAUSE PRINCIPALE**: Le mutation non invalidano perché non c'è integrazione React Query
- Gli hooks non usano React Query, quindi `invalidateQueries` non funzionerebbe comunque

---

## 🔍 ANALISI ARCHITETTURALE APPROFONDITA

### Hooks Custom vs React Query

**Hooks che NON usano React Query**:

- `useAppointments` → `useState` + `useEffect` + fetch manuale
- `useProgressAnalytics` → `useQuery` (✅ usa React Query)
- `useDocuments` → `useState` + `useEffect` + fetch manuale
- `useAllenamenti` → `useState` + `useEffect` + fetch manuale
- `useClienti` → `useState` + `useEffect` + fetch manuale (con realtime opzionale)

**Hooks che usano React Query**:

- `useProgressAnalytics` → ✅ usa `useQuery`
- Alcuni hooks athlete-profile → ✅ usano React Query con invalidazione

**Conclusione**:

- **Mismatch architetturale**: La maggior parte degli hooks NON usa React Query
- Le mutation non possono invalidare query React Query se gli hooks non le usano
- `window.location.href` è workaround per questo problema

---

## 📊 FASE 2: STRATEGIA TARGET

### Decisione: **OPZIONE A - React Query 100% (Client)**

**Motivazione**:

1. ✅ Coerenza: alcuni hooks già usano React Query (`useProgressAnalytics`, athlete-profile)
2. ✅ Realtime: React Query + Supabase realtime = combo potente
3. ✅ Cache intelligente: React Query gestisce cache, stale, refetch automaticamente
4. ✅ Invalidazione: `invalidateQueries` standard e affidabile
5. ✅ Meno refactor: non serve migrare a Server Components

**Standard da implementare**:

#### 1. Query Keys Centralizzate

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    byUser: (userId: string) => ['appointments', userId] as const,
    byDate: (userId: string, date: string) => ['appointments', userId, date] as const,
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', athleteId] as const,
  },
  allenamenti: {
    all: ['allenamenti'] as const,
    byAthlete: (athleteId: string) => ['allenamenti', athleteId] as const,
  },
  progressi: {
    all: ['progressi'] as const,
    byAthlete: (athleteId: string) => ['progressi', athleteId] as const,
  },
  clienti: {
    all: ['clienti'] as const,
    stats: ['clienti', 'stats'] as const,
  },
}
```

#### 2. React Query Config Ottimizzata

```typescript
// src/providers/query-provider.tsx
defaultOptions: {
  queries: {
    staleTime: 30 * 1000, // 30 secondi (invece di 5 min)
    refetchOnMount: true, // Abilita refetch su mount
    refetchOnWindowFocus: true, // Abilita refetch su focus
    refetchOnReconnect: true,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minuti
  },
}
```

#### 3. Standard Mutation Pattern

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    // Supabase insert/update/delete
  },
  onSuccess: () => {
    // Invalidazione query
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
  },
})
```

#### 4. Realtime Integration

```typescript
// In ogni hook che usa React Query
useRealtimeChannel('appointments', (payload) => {
  if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
  }
})
```

---

## 🛠️ FASE 3: PIANO DI RISOLUZIONE (STEP-BY-STEP)

### STEP 1: Centralizzare Query Keys + Aggiornare React Query Config

**Scopo**: Standardizzare query keys e abilitare refetch automatico

**File da toccare** (2):

- `src/lib/query-keys.ts` (NUOVO)
- `src/providers/query-provider.tsx`

**Modifiche**:

1. Creare `src/lib/query-keys.ts` con tutte le query keys
2. Aggiornare `query-provider.tsx`:
   - `staleTime: 30 * 1000` (30 sec)
   - `refetchOnMount: true`
   - `refetchOnWindowFocus: true`

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**: Query keys esportate, config aggiornata, nessun errore TypeScript

---

### STEP 2: Migrare useAppointments a React Query

**Scopo**: Convertire hook da useState a useQuery

**File da toccare** (2):

- `src/hooks/use-appointments.ts`
- `src/app/home/appuntamenti/page.tsx` (adattare se necessario)

**Modifiche**:

1. Sostituire `useState` + `useEffect` con `useQuery`
2. Usare `queryKeys.appointments.byUser(userId)`
3. Mantenere stessa interfaccia pubblica

**Rischio**: Medio  
**Rollback**: Revert commit  
**Criterio "done"**: Hook usa React Query, pagina funziona, test passano

---

### STEP 3: Migrare useDocuments a React Query

**Scopo**: Convertire hook da useState a useQuery

**File da toccare** (2):

- `src/hooks/use-documents.ts`
- `src/app/home/documenti/page.tsx` (adattare se necessario)

**Modifiche**: Stesso pattern di STEP 2

**Rischio**: Medio  
**Rollback**: Revert commit  
**Criterio "done"**: Hook usa React Query, pagina funziona

---

### STEP 4: Migrare useAllenamenti a React Query

**Scopo**: Convertire hook da useState a useQuery

**File da toccare** (2):

- `src/hooks/use-allenamenti.ts`
- `src/app/home/allenamenti/page.tsx` (adattare se necessario)

**Modifiche**: Stesso pattern di STEP 2

**Rischio**: Medio  
**Rollback**: Revert commit  
**Criterio "done"**: Hook usa React Query, pagina funziona

---

### STEP 5: Aggiungere Invalidazione Query alle Mutation

**Scopo**: Invalidare query dopo create/update/delete

**File da toccare** (5):

- `src/components/dashboard/nuovo-pagamento-modal.tsx`
- `src/components/documents/document-uploader-modal.tsx`
- `src/components/dashboard/appointment-modal.tsx`
- `src/components/dashboard/payment-form-modal.tsx`
- Altri modali con mutation (se presenti)

**Modifiche**:

1. Importare `useQueryClient` da `@tanstack/react-query`
2. Importare `queryKeys` da `@/lib/query-keys`
3. Dopo successo mutation:
   ```typescript
   const queryClient = useQueryClient()
   // ... dopo insert/update/delete
   queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
   ```

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**: Mutation invalidano query, UI si aggiorna automaticamente

---

### STEP 6: Sostituire window.location.href con router.push

**Scopo**: Eliminare full page reload, usare navigazione SPA

**File da toccare** (3):

- `src/app/home/page.tsx` (linea 163)
- `src/components/athlete/home-button.tsx` (linea 12)
- `src/app/home/progressi/foto/page.tsx` (linea 253)

**Modifiche**:

1. Sostituire `window.location.href = url` con `router.push(url)`
2. Rimuovere commenti che giustificano window.location.href

**Rischio**: Basso  
**Rollback**: Revert commit  
**Criterio "done"**: Navigazione SPA, nessun full reload, dati si aggiornano

---

### STEP 7: Aggiungere Realtime Subscriptions (Opzionale - Fase 2)

**Scopo**: Aggiornamento real-time senza refresh

**File da toccare** (4):

- `src/hooks/use-appointments.ts` (aggiungere realtime)
- `src/hooks/use-documents.ts` (aggiungere realtime)
- `src/hooks/use-allenamenti.ts` (aggiungere realtime)
- `src/hooks/use-progress-analytics.ts` (aggiungere realtime se non presente)

**Modifiche**:

1. Usare `useRealtimeChannel` in ogni hook
2. Invalidare query React Query su eventi INSERT/UPDATE/DELETE

**Rischio**: Medio  
**Rollback**: Revert commit  
**Criterio "done"**: Realtime attivo, UI si aggiorna automaticamente

**Nota**: Questo step può essere fatto in fase 2 se si vuole validare prima i fix base.

---

## 🧪 FASE 4: PIANO TEST AUTOMATICI

### A) UNIT TEST (Vitest)

#### Test 1: Query Keys Stabilità

**File**: `tests/unit/query-keys.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { queryKeys } from '@/lib/query-keys'

describe('queryKeys', () => {
  it('should have stable references', () => {
    const keys1 = queryKeys.appointments.all
    const keys2 = queryKeys.appointments.all
    expect(keys1).toBe(keys2) // Stesso riferimento
  })

  it('should generate consistent keys for same params', () => {
    const key1 = queryKeys.appointments.byUser('user-123')
    const key2 = queryKeys.appointments.byUser('user-123')
    expect(key1).toEqual(key2)
  })
})
```

**Comando**: `npm run test:unit tests/unit/query-keys.test.ts`

---

#### Test 2: React Query Provider Config

**File**: `tests/unit/query-provider-config.test.tsx`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { QueryProvider } from '@/providers/query-provider'

describe('QueryProvider config', () => {
  it('should have correct default options', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: QueryProvider,
    })

    const defaultOptions = result.current.getDefaultOptions()
    expect(defaultOptions.queries?.staleTime).toBe(30 * 1000) // 30 sec
    expect(defaultOptions.queries?.refetchOnMount).toBe(true)
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true)
  })
})
```

**Comando**: `npm run test:unit tests/unit/query-provider-config.test.tsx`

---

#### Test 3: Mutation Invalidazione

**File**: `tests/unit/mutations-invalidation.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

// Mock mutation che invalida
function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      // Mock insert
      return { id: '123', ...data }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}

describe('Mutation invalidation', () => {
  it('should invalidate queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    queryClient.setQueryData(queryKeys.appointments.all, [{ id: '1' }])

    const { result } = renderHook(() => useCreateAppointment(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    await result.current.mutateAsync({ title: 'Test' })

    await waitFor(() => {
      const queryState = queryClient.getQueryState(queryKeys.appointments.all)
      expect(queryState?.isInvalidated).toBe(true)
    })
  })
})
```

**Comando**: `npm run test:unit tests/unit/mutations-invalidation.test.tsx`

---

### B) INTEGRATION TEST (React Testing Library + MSW)

#### Test 4: Create → List Aggiornata

**File**: `tests/integration/appointments-crud.test.tsx`

```typescript
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { AppuntamentiPage } from '@/app/home/appuntamenti/page'

const server = setupServer(
  http.get('/api/appointments', () => {
    return HttpResponse.json([{ id: '1', title: 'Appuntamento 1' }])
  }),
  http.post('/api/appointments', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '2', ...body })
  }),
)

describe('Appointments CRUD integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should refresh list after create', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AppuntamentiPage />
      </QueryClientProvider>
    )

    // Verifica lista iniziale
    await waitFor(() => {
      expect(screen.getByText('Appuntamento 1')).toBeInTheDocument()
    })

    // Crea nuovo appuntamento (simula click button + form submit)
    // ... codice interazione

    // Verifica che lista si aggiorna senza manual refresh
    await waitFor(() => {
      expect(screen.getByText('Appuntamento 2')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
```

**Comando**: `npm run test:integration tests/integration/appointments-crud.test.tsx`

**Mock**: MSW per Supabase API (o mock Supabase client)

---

#### Test 5: Navigazione SPA (No Full Reload)

**File**: `tests/integration/navigation-spa.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import HomePage from '@/app/home/page'

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Navigation SPA', () => {
  it('should use router.push instead of window.location.href', () => {
    const router = useRouter()
    render(<HomePage />)

    const button = screen.getByText('SCHEDE')
    fireEvent.click(button)

    // Verifica che router.push è chiamato, non window.location.href
    expect(router.push).toHaveBeenCalledWith('/home/allenamenti')
    expect(window.location.href).not.toHaveChanged()
  })
})
```

**Comando**: `npm run test:integration tests/integration/navigation-spa.test.tsx`

---

### C) E2E TEST (Playwright)

#### Test 6: E2E Refresh Dopo Mutation

**File**: `tests/e2e/refresh-after-mutation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Refresh after mutation', () => {
  test.beforeEach(async ({ page }) => {
    // Login o mock session
    await page.goto('/home/appuntamenti')
  })

  test('should refresh appointments list after create', async ({ page }) => {
    // Verifica lista iniziale
    await expect(page.locator('[data-testid="appointment-item"]')).toHaveCount(2)

    // Crea nuovo appuntamento
    await page.click('[data-testid="new-appointment-button"]')
    await page.fill('[name="athlete_id"]', 'athlete-123')
    await page.fill('[name="date"]', '2025-01-28')
    await page.fill('[name="start_time"]', '10:00')
    await page.click('[type="submit"]')

    // Verifica che lista si aggiorna automaticamente (senza hard reload)
    await expect(page.locator('[data-testid="appointment-item"]')).toHaveCount(3)

    // Verifica che NON c'è stato full page reload (check network tab o performance)
    const navigationEvents = await page.evaluate(() => {
      return (window as any).__navigationEvents || []
    })
    expect(navigationEvents.filter((e: string) => e === 'reload')).toHaveLength(0)
  })
})
```

**Comando**: `npm run test:e2e tests/e2e/refresh-after-mutation.spec.ts`

**Setup**: Mock Supabase o test DB isolato

---

#### Test 7: E2E Realtime Update (Se implementato)

**File**: `tests/e2e/realtime-update.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Realtime updates', () => {
  test('should update UI when data changes from another client', async ({ page, context }) => {
    await page.goto('/home/appuntamenti')

    // Simula update da "secondo client" (mock Supabase realtime o trigger manuale)
    // ... codice per triggerare evento realtime

    // Verifica che UI si aggiorna automaticamente
    await expect(page.locator('[data-testid="appointment-updated"]')).toBeVisible()
  })
})
```

**Comando**: `npm run test:e2e tests/e2e/realtime-update.spec.ts`

---

## 📝 FASE 5: IMPLEMENTAZIONE MINIMA + DIFF

### STEP 1: Query Keys + Config (PRIORITÀ ALTA)

#### File: `src/lib/query-keys.ts` (NUOVO)

```typescript
export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    byUser: (userId: string) => ['appointments', userId] as const,
    byDate: (userId: string, date: string) => ['appointments', userId, date] as const,
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', athleteId] as const,
  },
  allenamenti: {
    all: ['allenamenti'] as const,
    byAthlete: (athleteId: string) => ['allenamenti', athleteId] as const,
  },
  progressi: {
    all: ['progressi'] as const,
    byAthlete: (athleteId: string) => ['progressi', athleteId] as const,
  },
  clienti: {
    all: ['clienti'] as const,
    stats: ['clienti', 'stats'] as const,
  },
  payments: {
    all: ['payments'] as const,
    byAthlete: (athleteId: string) => ['payments', athleteId] as const,
  },
}
```

#### File: `src/providers/query-provider.tsx` (MODIFICA)

```diff
--- a/src/providers/query-provider.tsx
+++ b/src/providers/query-provider.tsx
@@ -10,10 +10,10 @@ export function QueryProvider({ children }: { children: React.ReactNode }) {
         defaultOptions: {
           queries: {
-            // Dati considerati freschi per 5 minuti (invece di 0 = sempre stale)
-            staleTime: 5 * 60 * 1000, // 5 minuti
-            // Non refetch automatico quando il componente viene montato (usa cache se fresca)
-            refetchOnMount: false,
-            // Non refetch quando la finestra riprende focus
-            refetchOnWindowFocus: false,
+            // Dati considerati freschi per 30 secondi (bilanciamento performance/aggiornamento)
+            staleTime: 30 * 1000, // 30 secondi
+            // Refetch automatico quando il componente viene montato (se dati stantii)
+            refetchOnMount: true,
+            // Refetch quando la finestra riprende focus (utente torna alla tab)
+            refetchOnWindowFocus: true,
             // Refetch solo su riconnessione di rete
             refetchOnReconnect: true,
```

---

### STEP 2: Sostituire window.location.href (PRIORITÀ ALTA)

#### File: `src/app/home/page.tsx` (MODIFICA)

```diff
--- a/src/app/home/page.tsx
+++ b/src/app/home/page.tsx
@@ -158,9 +158,7 @@ export default function HomePage() {
             <Button
               key={blocco.id}
               onClick={() => {
-                // Usa window.location.href per garantire remount completo e dati sempre aggiornati
-                // Questo è l'unico modo affidabile per Next.js App Router quando si naviga tra route nello stesso gruppo
-                window.location.href = blocco.href
+                router.push(blocco.href)
               }}
               className="group relative h-auto min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 border-2 border-teal-500/40 hover:border-teal-400/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30 hover:from-teal-500/10 hover:to-cyan-500/10"
               aria-label={`Vai a ${blocco.label}`}
```

#### File: `src/components/athlete/home-button.tsx` (MODIFICA)

```diff
--- a/src/components/athlete/home-button.tsx
+++ b/src/components/athlete/home-button.tsx
@@ -8,7 +8,7 @@ export function HomeButton() {
   return (
     <Button
       onClick={() => {
-        // Usa window.location.href per garantire remount completo e dati sempre aggiornati
-        window.location.href = '/home'
+        router.push('/home')
       }}
       variant="outline"
```

#### File: `src/app/home/progressi/foto/page.tsx` (MODIFICA)

```diff
--- a/src/app/home/progressi/foto/page.tsx
+++ b/src/app/home/progressi/foto/page.tsx
@@ -250,7 +250,7 @@ export default function ProgressiFotoPage() {
                 variant="outline"
                 onClick={() => {
-                  window.location.href = '/home/progressi'
+                  router.push('/home/progressi')
                 }}
                 className="border-teal-500/30 hover:bg-teal-500/10"
               >
```

---

## 📊 PRIORITÀ E ORDINE DI ESECUZIONE

### Sprint 1 (Impatto Alto, Rischio Basso)

1. ✅ STEP 1: Query Keys + Config
2. ✅ STEP 2: Sostituire window.location.href
3. ✅ STEP 5: Invalidazione Mutation (solo per hook già React Query)

### Sprint 2 (Impatto Alto, Rischio Medio)

4. ✅ STEP 2: Migrare useAppointments
5. ✅ STEP 3: Migrare useDocuments
6. ✅ STEP 4: Migrare useAllenamenti

### Sprint 3 (Miglioramento, Rischio Medio)

7. ✅ STEP 7: Realtime Subscriptions

---

## ✅ CHECKLIST FINALE

- [ ] Query keys centralizzate create
- [ ] React Query config aggiornata (staleTime 30s, refetchOnMount/focus true)
- [ ] window.location.href sostituito con router.push (3 file)
- [ ] useAppointments migrato a React Query
- [ ] useDocuments migrato a React Query
- [ ] useAllenamenti migrato a React Query
- [ ] Mutation invalidano query (5+ modali)
- [ ] Realtime subscriptions aggiunte (opzionale)
- [ ] Test unit passano
- [ ] Test integration passano
- [ ] Test e2e passano
- [ ] Nessun errore TypeScript
- [ ] Nessun errore lint
- [ ] Build passa

---

## 📌 NOTE FINALI

1. **Root Cause Principale**: Hooks custom non usano React Query → mutation non possono invalidare
2. **Soluzione**: Migrare hooks a React Query + invalidazione standard
3. **Benefici**:
   - Refresh automatico dopo mutation
   - Cache intelligente
   - Realtime opzionale
   - Navigazione SPA (no full reload)
4. **Rischio**: Medio (refactor hooks), ma incrementale e testabile

---

**Fine Documento**
