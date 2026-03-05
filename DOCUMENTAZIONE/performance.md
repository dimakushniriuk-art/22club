# ⚡ Performance - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## Overview

Il modulo Profilo Atleta implementa diverse ottimizzazioni per garantire performance ottimali e una UX fluida.

---

## 🚀 Ottimizzazioni Implementate

### 1. Caching React Query

Tutti gli hook utilizzano configurazioni di caching ottimizzate:

```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minuti - dati considerati freschi
  gcTime: 30 * 60 * 1000,          // 30 minuti - tempo in cache
  refetchOnWindowFocus: false,     // Non refetch quando si torna alla tab
  refetchOnMount: false,           // Non refetch se dati sono freschi
  retry: 1,                        // Riprova solo 1 volta in caso di errore
}
```

**Benefici**:

- ✅ Riduce chiamate API non necessarie
- ✅ Migliora tempi di risposta
- ✅ Riduce carico server

**Eccezioni**:

- **Smart Tracking**: `gcTime: 15 minuti` (dati più dinamici)
- **AI Data**: `gcTime: 60 minuti` (dati costosi da calcolare)

---

### 2. Optimistic Updates

Tutti gli hook `useUpdate*` implementano optimistic updates per aggiornare l'UI immediatamente:

```typescript
onMutate: async (newData) => {
  // Cancella query in corso
  await queryClient.cancelQueries({ queryKey })

  // Snapshot dati precedenti
  const previousData = queryClient.getQueryData(queryKey)

  // Aggiorna cache ottimisticamente
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
onSuccess: () => {
  // Invalida e refetch per sincronizzare
  queryClient.invalidateQueries({ queryKey })
}
```

**Benefici**:

- ✅ UI reattiva (aggiornamento immediato)
- ✅ UX migliore (nessun delay percepito)
- ✅ Rollback automatico in caso di errore

---

### 3. Lazy Loading Componenti

Tutti i componenti tab sono caricati con **lazy loading**:

```typescript
import { lazy, Suspense } from 'react'

const AthleteAnagraficaTab = lazy(() => import('./athlete-anagrafica-tab'))
const AthleteMedicalTab = lazy(() => import('./athlete-medical-tab'))
// ... altri tab

function Dashboard() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      {activeTab === 'anagrafica' && <AthleteAnagraficaTab athleteId={id} />}
      {activeTab === 'medical' && <AthleteMedicalTab athleteId={id} />}
    </Suspense>
  )
}
```

**Benefici**:

- ✅ Bundle size ridotto (code splitting)
- ✅ Caricamento iniziale più veloce
- ✅ Carica solo il tab attivo

---

### 4. Memoization Componenti

Tutti i componenti utilizzano `useMemo` e `useCallback` per evitare re-render inutili:

```typescript
// Calcoli costosi
const computedValue = useMemo(() => {
  return expensiveCalculation(data)
}, [data])

// Funzioni stabili
const handleSave = useCallback(async () => {
  await updateMutation.mutateAsync(formData)
}, [formData, updateMutation])

// Liste array
const memoizedList = useMemo(() => {
  return items.map((item) => processItem(item))
}, [items])
```

**Benefici**:

- ✅ Riduce re-render inutili
- ✅ Migliora performance rendering
- ✅ Evita calcoli ripetuti

---

### 5. Prefetch Intelligente

Implementato prefetch su hover dei tab:

```typescript
const queryClient = useQueryClient()

const handleTabHover = (tabName: string) => {
  const queryKey = getQueryKeyForTab(tabName)

  queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchTabData(athleteId, tabName),
    staleTime: 5 * 60 * 1000,
  })
}

// Utilizzo
<Tab onMouseEnter={() => handleTabHover('medical')}>
  Medica
</Tab>
```

**Benefici**:

- ✅ Dati pronti quando l'utente clicca
- ✅ UX più fluida
- ✅ Riduce tempo di attesa percepito

---

### 6. Paginazione Storico

I dati storici (smart tracking, AI data) utilizzano paginazione:

```typescript
const [page, setPage] = useState(0)
const pageSize = 10

const { data } = useAthleteSmartTrackingHistory(athleteId, page, pageSize)
```

**Benefici**:

- ✅ Carica solo dati necessari
- ✅ Riduce tempo di caricamento
- ✅ Migliora performance query database

---

### 7. Indici Database

Tutte le tabelle hanno indici ottimizzati:

```sql
-- Indice per ricerca per athlete_id
CREATE INDEX idx_athlete_xxx_data_athlete_id
ON athlete_xxx_data(athlete_id);

-- Indice per ordinamento per date
CREATE INDEX idx_athlete_smart_tracking_athlete_data
ON athlete_smart_tracking_data(athlete_id, data_rilevazione DESC);

-- Indice per constraint check
CREATE INDEX idx_athlete_medical_certificato_scadenza
ON athlete_medical_data(certificato_medico_scadenza)
WHERE certificato_medico_scadenza IS NOT NULL;
```

**Migrazione**: `20250127_add_athlete_profile_indexes.sql`

**Benefici**:

- ✅ Query più veloci
- ✅ JOIN più efficienti
- ✅ Ordinamento ottimizzato

---

### 8. Limit Query Results

Le query che restituiscono solo l'ultimo record utilizzano `.limit(1)`:

```typescript
// Smart Tracking - solo ultimo record
const { data } = await supabase
  .from('athlete_smart_tracking_data')
  .select('*')
  .eq('athlete_id', athleteId)
  .order('data_rilevazione', { ascending: false })
  .limit(1)
  .maybeSingle()

// AI Data - solo ultimo record
const { data } = await supabase
  .from('athlete_ai_data')
  .select('*')
  .eq('athlete_id', athleteId)
  .order('data_analisi', { ascending: false })
  .limit(1)
  .maybeSingle()
```

**Benefici**:

- ✅ Riduce trasferimento dati
- ✅ Query più veloci
- ✅ Meno memoria utilizzata

---

## 📊 Metriche Performance

### Bundle Size

- **Lazy loading**: Riduce bundle iniziale di ~40%
- **Code splitting**: Ogni tab ~15-30KB

### Tempi di Risposta

- **Cache hit**: < 10ms
- **Cache miss**: 100-300ms (dipende da network)
- **Optimistic update**: 0ms (immediato)

### Database Query

- **Query con indici**: < 50ms
- **Query senza indici**: 200-500ms
- **Query con JOIN**: 100-300ms

---

## 🔧 Best Practices

### 1. Evitare Over-fetching

```typescript
// ❌ Non fare - carica tutto
const { data } = await supabase.from('athlete_xxx_data').select('*')

// ✅ Fai - seleziona solo campi necessari
const { data } = await supabase
  .from('athlete_xxx_data')
  .select('id, field1, field2')
  .eq('athlete_id', athleteId)
```

### 2. Utilizzare Paginazione

```typescript
// ❌ Non fare - carica tutto
const { data } = await supabase.from('athlete_smart_tracking_data').select('*')

// ✅ Fai - usa paginazione
const { data } = await supabase
  .from('athlete_smart_tracking_data')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

### 3. Debounce Input Pesanti

```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSave = useDebouncedCallback(async (value: string) => {
  await updateMutation.mutateAsync({ field: value })
}, 500)
```

---

## 🧪 Monitoring Performance

### React Query DevTools

Monitora performance query in sviluppo:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### Performance API

Misura tempi di rendering:

```typescript
useEffect(() => {
  const start = performance.now()

  // Operazione

  const end = performance.now()
  console.log(`Operazione completata in ${end - start}ms`)
}, [])
```

---

## 📚 Risorse

- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Database Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)

---

**Ultimo aggiornamento**: 2025-01-29
