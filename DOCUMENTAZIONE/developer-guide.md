# 👨‍💻 Guida Sviluppatori - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## 🎯 Overview

Questa guida fornisce best practices, esempi avanzati e pattern comuni per sviluppare con il modulo Profilo Atleta.

---

## 🏗️ Architettura Pattern

### Pattern Hook

Tutti gli hook seguono questo pattern standardizzato:

```typescript
// 1. Query key factory
export const athleteXxxKeys = {
  all: ['athlete-xxx'] as const,
  detail: (athleteId: string) => [...athleteXxxKeys.all, athleteId] as const,
}

// 2. GET hook
export function useAthleteXxx(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteXxxKeys.detail(athleteId || ''),
    queryFn: async () => {
      // Fetch logic
    },
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  })
}

// 3. UPDATE hook con optimistic updates
export function useUpdateAthleteXxx(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      // Update logic
    },
    onMutate: async (newData) => {
      // Optimistic update
    },
    onError: (err, newData, context) => {
      // Rollback
    },
    onSuccess: () => {
      // Invalidate cache
    },
  })
}
```

---

## 📝 Best Practices

### 1. Validazione Dati

**Sempre validare con Zod** prima di salvare:

```typescript
import { updateAthleteXxxSchema } from '@/types/athlete-profile.schema'

const handleSave = async () => {
  try {
    // Valida input
    const validated = updateAthleteXxxSchema.parse(formData)

    // Salva
    await updateMutation.mutateAsync(validated)
  } catch (error) {
    if (error instanceof ZodError) {
      // Mostra errori validazione
      setErrors(error.errors)
    }
  }
}
```

### 2. Gestione Errori

**Utilizzare `handleApiError`** per errori consistenti:

```typescript
import { handleApiError } from '@/lib/error-handler'

try {
  // Operazione
} catch (error) {
  const apiError = handleApiError(error, 'componentName')
  toast.error(apiError.message)
  console.error('Errore:', apiError)
}
```

### 3. Optimistic Updates

**Sempre implementare optimistic updates** per UX migliore:

```typescript
onMutate: async (newData) => {
  // Cancella query in corso
  await queryClient.cancelQueries({ queryKey })

  // Snapshot precedente
  const previousData = queryClient.getQueryData(queryKey)

  // Aggiorna ottimisticamente
  queryClient.setQueryData(queryKey, (old) => ({
    ...old,
    ...newData,
  }))

  return { previousData }
},
onError: (err, newData, context) => {
  // Rollback in caso di errore
  queryClient.setQueryData(queryKey, context.previousData)
},
```

### 4. Memoization

**Utilizzare `useMemo` e `useCallback`** per performance:

```typescript
// Calcoli costosi
const computedValue = useMemo(() => {
  return expensiveCalculation(data)
}, [data])

// Funzioni stabili
const handleSave = useCallback(async () => {
  await updateMutation.mutateAsync(formData)
}, [formData, updateMutation])
```

### 5. Array Operations

**Pattern per gestire array dinamici**:

```typescript
const [items, setItems] = useState<string[]>([])

// Aggiungi
const addItem = useCallback((item: string) => {
  setItems((prev) => [...prev, item])
}, [])

// Rimuovi
const removeItem = useCallback((index: number) => {
  setItems((prev) => prev.filter((_, i) => i !== index))
}, [])

// Aggiorna
const updateItem = useCallback((index: number, newItem: string) => {
  setItems((prev) => prev.map((item, i) => (i === index ? newItem : item)))
}, [])
```

---

## 🔄 Esempi Avanzati

### Upload File con Progress

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data, error } = await supabase.storage
    .from('athlete-certificates')
    .upload(`${athleteId}/certificati/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Aggiorna database
  await updateMutation.mutateAsync({
    certificato_medico_url: data.path,
  })
}
```

### Paginazione Storico

```typescript
const [page, setPage] = useState(0)
const pageSize = 10

const { data, isLoading } = useAthleteSmartTrackingHistory(athleteId, page, pageSize)

const handleNextPage = () => {
  setPage((prev) => prev + 1)
}

const handlePrevPage = () => {
  setPage((prev) => Math.max(0, prev - 1))
}
```

### Debounce Input

```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSave = useDebouncedCallback(
  async (value: string) => {
    await updateMutation.mutateAsync({ field: value })
  },
  500, // 500ms delay
)

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData((prev) => ({ ...prev, field: e.target.value }))
  debouncedSave(e.target.value)
}
```

### Gestione Loading States

```typescript
const { data, isLoading, isFetching, isRefetching } = useAthleteXxx(athleteId)

// isLoading: prima chiamata
// isFetching: qualsiasi chiamata in corso
// isRefetching: refetch in corso

if (isLoading) {
  return <Skeleton />
}

if (isFetching && !isLoading) {
  return (
    <>
      <Content data={data} />
      <Spinner />
    </>
  )
}
```

---

## 🧪 Testing

### Test Unitari Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAthleteXxx } from '../use-athlete-xxx'

describe('useAthleteXxx', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useAthleteXxx('athlete-id'))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

### Test Componenti

```typescript
import { render, screen } from '@testing-library/react'
import { AthleteXxxTab } from '../athlete-xxx-tab'

describe('AthleteXxxTab', () => {
  it('should render loading state', () => {
    render(<AthleteXxxTab athleteId="athlete-id" />)
    expect(screen.getByText('Caricamento...')).toBeInTheDocument()
  })
})
```

---

## 🐛 Debugging

### React Query DevTools

Abilita React Query DevTools per debugging:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

### Logging Queries

```typescript
// In sviluppo
if (process.env.NODE_ENV === 'development') {
  queryClient.setQueryDefaults(['athlete-xxx'], {
    onSuccess: (data) => {
      console.log('Query success:', data)
    },
    onError: (error) => {
      console.error('Query error:', error)
    },
  })
}
```

---

## ⚡ Performance Tips

### 1. Lazy Loading Componenti

```typescript
import { lazy, Suspense } from 'react'

const AthleteXxxTab = lazy(() => import('./athlete-xxx-tab'))

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <AthleteXxxTab athleteId={id} />
    </Suspense>
  )
}
```

### 2. Prefetch Intelligente

```typescript
const queryClient = useQueryClient()

const handleTabHover = (tabName: string) => {
  queryClient.prefetchQuery({
    queryKey: athleteXxxKeys.detail(athleteId),
    queryFn: () => fetchAthleteXxx(athleteId),
  })
}
```

### 3. Virtual Scrolling (se necessario)

Per liste molto lunghe (>100 items):

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
})
```

---

## 🔐 Sicurezza

### Sanitizzazione Input

```typescript
import { sanitizeString } from '@/lib/sanitize'

const handleInput = (value: string) => {
  const sanitized = sanitizeString(value)
  setFormData((prev) => ({ ...prev, field: sanitized }))
}
```

### Validazione Path File

```typescript
import { sanitizePath } from '@/lib/sanitize'

const uploadFile = async (file: File) => {
  const sanitizedPath = sanitizePath(`${athleteId}/${file.name}`)

  await supabase.storage.from('bucket').upload(sanitizedPath, file)
}
```

---

## 📚 Risorse Aggiuntive

- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Ultimo aggiornamento**: 2025-01-29
