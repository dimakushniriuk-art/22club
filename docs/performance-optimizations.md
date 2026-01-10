# ⚡ Ottimizzazioni Performance 22Club

Documentazione completa delle ottimizzazioni di performance implementate.

## 📊 Overview

22Club implementa ottimizzazioni multi-layer per garantire performance ottimali:

- **Database**: Indici ottimizzati, query efficienti
- **API**: Caching, timeout intelligenti, fallback
- **Client**: Memoization, lazy loading, code splitting
- **Storage**: localStorage cache persistente

## 🗄️ Ottimizzazioni Database

### Indici Performance

**Indici creati per `profiles` table:**

```sql
-- Indice composito per role + stato
CREATE INDEX idx_profiles_role_stato
ON profiles(role, stato)
WHERE role IN ('atleta', 'athlete');

-- Indice per data_iscrizione (nuovi clienti)
CREATE INDEX idx_profiles_data_iscrizione
ON profiles(data_iscrizione DESC)
WHERE role IN ('atleta', 'athlete');

-- Indice per documenti_scadenza
CREATE INDEX idx_profiles_documenti_scadenza
ON profiles(documenti_scadenza)
WHERE documenti_scadenza = true AND role IN ('atleta', 'athlete');

-- Indice base per role
CREATE INDEX idx_profiles_role
ON profiles(role)
WHERE role IN ('atleta', 'athlete');
```

**File**: `supabase/migrations/20250201_optimize_clienti_stats_rpc.sql`

### Funzione RPC Ottimizzata

**Problema**: `get_clienti_stats()` timeout dopo 3s con dataset grandi

**Soluzione**: Query ottimizzata con singola scansione e indici

```sql
CREATE OR REPLACE FUNCTION get_clienti_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSON;
  start_of_month TIMESTAMP WITH TIME ZONE;
BEGIN
  start_of_month := DATE_TRUNC('month', CURRENT_DATE);

  -- Singola query con FILTER (più efficiente di 5 COUNT separati)
  SELECT JSON_BUILD_OBJECT(
    'totali', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete')),
    'attivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'attivo'),
    'inattivi', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND stato = 'inattivo'),
    'nuovi_mese', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND data_iscrizione >= start_of_month),
    'documenti_scadenza', COUNT(*) FILTER (WHERE role IN ('atleta', 'athlete') AND documenti_scadenza = true)
  ) INTO result
  FROM profiles
  WHERE role IN ('atleta', 'athlete'); -- Usa indice idx_profiles_role

  RETURN result;
END;
$$;
```

**Miglioramenti**:

- ✅ Singola scansione invece di 5 query separate
- ✅ Uso di indici compositi
- ✅ Funzione `STABLE` per ottimizzazione query planner
- ✅ `FILTER` clause per aggregazioni efficienti

## 💾 Caching Avanzato

### LocalStorage Cache

**File**: `src/lib/cache/local-storage-cache.ts`

**Caratteristiche**:

- Cache persistente tra reload
- TTL configurabile
- Cleanup automatico entry scadute
- Gestione quota localStorage (max 5MB)
- Versioning cache per invalidazione

**Usage**:

```typescript
import { localStorageCache } from '@/lib/cache/local-storage-cache'

// Salva in cache
localStorageCache.set('clienti-stats', stats, 2 * 60 * 1000) // TTL 2 minuti

// Recupera da cache
const cached = localStorageCache.get<ClienteStats>('clienti-stats')
```

### React Query + LocalStorage

**File**: `src/lib/cache/use-cached-query.ts`

**Hook combinato** che usa:

- React Query per cache in-memory
- localStorage per persistenza
- Automatic refetch quando stale

**Usage**:

```typescript
import { useCachedQuery } from '@/lib/cache/use-cached-query'

const { data, isLoading } = useCachedQuery({
  queryKey: ['clienti', filters],
  queryFn: () => fetchClienti(filters),
  staleTime: 5 * 60 * 1000, // 5 minuti
  localStorageKey: 'clienti-list',
  localStorageTtl: 5 * 60 * 1000,
})
```

## 🔄 Ottimizzazioni Query Clienti

### fetchClienti Ottimizzato

**File**: `src/hooks/use-clienti.ts`

**Miglioramenti**:

1. **Caching**:

   ```typescript
   // Controlla cache prima di query
   const cachedData = localStorageCache.get<ProfileSummary[]>(cacheKey)
   if (cachedData) {
     queryResult = cachedData
     // Fetch in background per aggiornare
   }
   ```

2. **Query Semplificata**:
   - Carica solo colonne necessarie
   - Filtri applicati client-side (per dataset piccoli/medi)
   - Timeout aumentato a 5s
   - Limit aumentato per migliore paginazione

3. **Fallback Intelligente**:
   - Se query fallisce, usa cache se disponibile
   - Non blocca UI con errori

### fetchStats Ottimizzato

**Miglioramenti**:

1. **Cache First**:

   ```typescript
   // Controlla cache prima
   const cachedStats = localStorageCache.get<ClienteStats>(cacheKey)
   if (cachedStats) {
     setStats(cachedStats)
     // Fetch in background
   }
   ```

2. **RPC con Timeout**:
   - Timeout 3s per RPC
   - Fallback a query separate se RPC fallisce
   - Salva risultati in cache

3. **Fallback Ottimizzato**:
   - Query parallele con `Promise.allSettled`
   - Timeout breve (2s) per ogni query
   - Usa `count: 'estimated'` per velocità

## 🚀 Lazy Loading Componenti

### Componenti Lazy Loaded

**Modali** (`src/components/dashboard/modals-wrapper.tsx`):

```typescript
const AppointmentModal = lazy(() => import('./appointment-modal'))
const PaymentFormModal = lazy(() => import('./payment-form-modal'))
const AssignWorkoutModal = lazy(() => import('./assign-workout-modal'))
const DocumentUploaderModal = lazy(() => import('@/components/documents/document-uploader-modal'))
```

**Charts** (`src/components/dashboard/lazy-stats-charts.tsx`):

```typescript
const StatsCharts = lazy(() => import('./stats-charts'))
```

**Tables** (`src/components/dashboard/lazy-stats-table.tsx`):

```typescript
const StatsTable = lazy(() => import('./stats-table'))
```

### Componenti da Lazy Load (Raccomandato)

1. **Recharts** (`src/components/charts/client-recharts.tsx`):
   - Già lazy loaded dove possibile
   - Considera lazy loading più aggressivo

2. **Athlete Profile Tabs**:
   - Tabs pesanti possono essere lazy loaded
   - Carica solo tab attiva inizialmente

3. **Workout Wizard**:
   - Componente complesso, già ottimizzato
   - Considera lazy loading step individuali

## 📦 Code Splitting

### Next.js Config

**File**: `next.config.ts`

**Ottimizzazioni**:

1. **Package Imports**:

   ```typescript
   optimizePackageImports: ['lucide-react', '@fullcalendar/react', 'recharts', 'date-fns']
   ```

2. **Webpack SplitChunks**:
   ```typescript
   splitChunks: {
     chunks: 'all',
     cacheGroups: {
       vendor: { test: /node_modules/, maxSize: 244KB },
       fullcalendar: { test: /@fullcalendar/, maxSize: 244KB },
       recharts: { test: /recharts/, maxSize: 244KB },
       lucide: { test: /lucide-react/, maxSize: 244KB },
       common: { minChunks: 2, maxSize: 244KB },
     },
   }
   ```

**Risultati**:

- Bundle iniziale ridotto
- Chunk separati per librerie pesanti
- Lazy loading automatico per route

## 🧮 Calcolo Statistiche Client-Side

### Utility Ottimizzata

**File**: `src/lib/utils/client-stats-calculator.ts`

**Caratteristiche**:

- Calcolo in singolo passaggio (O(n))
- Memoization integrata
- Supporto filtri

**Usage**:

```typescript
import { calculateClientStats } from '@/lib/utils/client-stats-calculator'

const stats = calculateClientStats(clienti)
// { totali, attivi, inattivi, nuovi_mese, documenti_scadenza }
```

## 📈 Metriche Performance

### Target

- **RPC get_clienti_stats**: < 1s (da 3s+)
- **Query fetchClienti**: < 2s (da 5-8s)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: < 244KB per chunk

### Monitoring

- **Lighthouse**: Audit regolari
- **React DevTools Profiler**: Analisi re-render
- **Network Tab**: Analisi query lente
- **Performance Tab**: Core Web Vitals

## 🔧 Best Practices

### 1. Database

- ✅ Usa indici compositi per query comuni
- ✅ Evita full table scan
- ✅ Usa `STABLE` per funzioni RPC
- ✅ Limita risultati con `LIMIT`

### 2. Caching

- ✅ Cache dati che cambiano raramente
- ✅ TTL appropriati (2-5 minuti per dati dinamici)
- ✅ Invalida cache dopo mutazioni
- ✅ Usa localStorage per persistenza

### 3. Query

- ✅ Carica solo colonne necessarie
- ✅ Usa filtri database quando possibile
- ✅ Timeout appropriati (3-5s)
- ✅ Fallback per resilienza

### 4. Componenti

- ✅ Lazy load componenti pesanti
- ✅ Memoization per calcoli costosi
- ✅ Evita re-render non necessari
- ✅ Code splitting per route

## 🔗 Riferimenti

- [Database Indexes](../supabase/migrations/20250201_optimize_clienti_stats_rpc.sql)
- [LocalStorage Cache](../src/lib/cache/local-storage-cache.ts)
- [Cached Query Hook](../src/lib/cache/use-cached-query.ts)
- [Client Stats Calculator](../src/lib/utils/client-stats-calculator.ts)
- [Next.js Config](../next.config.ts)
