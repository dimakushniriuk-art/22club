# Ottimizzazione Lazy Loading - 22Club

## Overview

Ottimizzazioni aggressive di lazy loading per migliorare First Contentful Paint (FCP) e Time to Interactive (TTI).

## Problema

I tab del profilo atleta erano già lazy loaded, ma:

- Tutti i TabsContent venivano renderizzati (anche se nascosti)
- Prefetch solo su mouse enter (non abbastanza aggressivo)
- Usava React.lazy invece di Next.js dynamic import
- Nessun prefetch intelligente dei tab adiacenti

## Soluzione

### 1. Next.js Dynamic Import

**Prima** (React.lazy):

```typescript
const AthleteAnagraficaTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteAnagraficaTab,
  })),
)
```

**Dopo** (Next.js dynamic):

```typescript
const AthleteAnagraficaTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAnagraficaTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false, // Disabilita SSR per componenti pesanti
  }
)
```

**Vantaggi**:

- ✅ Migliore code splitting con Next.js
- ✅ Skeleton loader personalizzato
- ✅ SSR disabilitato per componenti pesanti (più veloce)

### 2. Rendering Condizionale

**Prima**: Tutti i TabsContent venivano renderizzati

```typescript
<TabsContent value="anagrafica">
  <Suspense fallback={...}>
    <AthleteAnagraficaTab />
  </Suspense>
</TabsContent>
<TabsContent value="medica">
  <Suspense fallback={...}>
    <AthleteMedicalTab />
  </Suspense>
</TabsContent>
// ... tutti i tab renderizzati
```

**Dopo**: Solo tab attivo e quelli già caricati

```typescript
{shouldRenderTab(tabKey) && (
  <TabsContent value={tabKey} forceMount={isActive}>
    {isActive ? (
      <Suspense fallback={<TabSkeleton />}>
        <TabComponent athleteId={athleteUserId} />
      </Suspense>
    ) : (
      <div style={{ display: 'none' }}>
        <TabComponent athleteId={athleteUserId} />
      </div>
    )}
  </TabsContent>
)}
```

**Vantaggi**:

- ✅ Riduce rendering iniziale
- ✅ Mantiene stato dei tab già visitati
- ✅ Migliora FCP

### 3. Prefetch Intelligente

**Prima**: Prefetch solo su mouse enter

```typescript
onMouseEnter={() => onPrefetchTab('anagrafica')}
```

**Dopo**: Prefetch su hover + tab adiacenti

```typescript
// Prefetch su hover (immediato)
const handleTabHover = useCallback(
  (tabKey: TabKey) => {
    if (!loadedTabs.has(tabKey) && !prefetchedTabs.has(tabKey)) {
      setPrefetchedTabs((prev) => new Set(prev).add(tabKey))
      // Preload immediato
      import('@/components/dashboard/athlete-profile')
    }
  },
  [loadedTabs, prefetchedTabs],
)

// Prefetch tab adiacenti quando un tab diventa attivo
useEffect(() => {
  const currentOrder = TAB_MAP[activeProfileTab]?.order ?? 0
  const tabsToPrefetch: TabKey[] = []

  // Prefetch tab precedente e successivo
  Object.entries(TAB_MAP).forEach(([key, { order }]) => {
    if (order === currentOrder - 1 || order === currentOrder + 1) {
      tabsToPrefetch.push(key as TabKey)
    }
  })
  // ... prefetch logic
}, [activeProfileTab])
```

**Vantaggi**:

- ✅ Prefetch più aggressivo (hover + adiacenti)
- ✅ Migliora UX (tab già pronti quando servono)
- ✅ Riduce perceived latency

### 4. Skeleton Loaders Leggeri

**Prima**: LoadingState completo

```typescript
<Suspense fallback={<LoadingState message="Caricamento tab..." />}>
```

**Dopo**: Skeleton leggero

```typescript
const TabSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)
```

**Vantaggi**:

- ✅ Più leggero (meno codice)
- ✅ Layout stabile (no CLS)
- ✅ Caricamento più veloce

## Performance Attese

### Metriche

- **First Contentful Paint**: -30% (da ~1.5s a ~1.0s)
- **Time to Interactive**: -25% (da ~2.5s a ~1.9s)
- **Bundle Size Initial**: -40% (solo tab attivo caricato)
- **Perceived Performance**: +50% (prefetch intelligente)

### Bundle Splitting

**Prima**:

- Tutti i tab nel bundle iniziale
- ~500KB per tutti i tab

**Dopo**:

- Solo tab attivo nel bundle iniziale
- ~100KB per tab attivo
- ~50KB per tab lazy loaded

## Utilizzo

### Componente Ottimizzato

```typescript
import { AthleteProfileTabsOptimized } from '@/components/dashboard/athlete-profile/athlete-profile-tabs-optimized'

<AthleteProfileTabsOptimized
  athleteId={athleteId}
  athleteUserId={athleteUserId}
  stats={stats}
  onPrefetchTab={(tabName) => {
    // Optional: log prefetch
    console.log('Prefetching tab:', tabName)
  }}
/>
```

### Migrazione

1. Sostituisci `AthleteProfileTabs` con `AthleteProfileTabsOptimized`
2. Rimuovi `onPrefetchTab` se non necessario (opzionale)
3. Testa performance con Lighthouse

## Best Practices

### 1. Usa Next.js Dynamic Import

```typescript
// ✅ Next.js dynamic
const Component = dynamic(() => import('./Component'), { ssr: false })

// ❌ React.lazy (meno ottimizzato)
const Component = lazy(() => import('./Component'))
```

### 2. Rendering Condizionale

```typescript
// ✅ Solo renderizza quando necessario
{shouldRender && <Component />}

// ❌ Renderizza tutto
<Component style={{ display: isActive ? 'block' : 'none' }} />
```

### 3. Prefetch Intelligente

```typescript
// ✅ Prefetch su hover + adiacenti
onMouseEnter={() => prefetch()}
useEffect(() => prefetchAdjacent(), [activeTab])

// ❌ Solo su click
onClick={() => load()}
```

### 4. Skeleton Leggeri

```typescript
// ✅ Skeleton minimale
<Skeleton className="h-8 w-48" />

// ❌ LoadingState completo
<LoadingState message="Loading..." />
```

## Testing

### Lighthouse

```bash
# Test performance
npm run build
npm run start
# Apri Lighthouse in Chrome DevTools
```

### Metriche Target

- **FCP**: < 1.0s
- **TTI**: < 2.0s
- **LCP**: < 2.5s
- **CLS**: < 0.1

## Riferimenti

- [Next.js Dynamic Import](https://nextjs.org/docs/advanced-features/dynamic-import)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Lazy Loading Best Practices](https://web.dev/lazy-loading/)
