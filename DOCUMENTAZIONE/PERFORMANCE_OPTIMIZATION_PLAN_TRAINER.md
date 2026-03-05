# 🚀 Piano Ottimizzazione Performance - Pagine Trainer Dashboard

**Data**: 2025-01-27  
**Obiettivo**: Ottimizzare velocità di caricamento e aggiornamento di tutte le pagine principali e secondarie del profilo trainer

---

## 📊 Analisi Pattern Profili Atleta (Riferimento)

### Pattern Implementato per Profili Atleta

**File**: `src/components/dashboard/athlete-profile/athlete-profile-tabs.tsx`

**Tecniche Utilizzate**:
1. ✅ **Lazy Loading Componenti Tab** con `React.lazy()`
2. ✅ **Suspense Boundaries** con fallback appropriati
3. ✅ **Prefetching on Hover** (`onMouseEnter`) per caricamento anticipato
4. ✅ **Componenti Non Critici Caricati Solo Quando Necessari**

**Esempio**:
```typescript
const AthleteAnagraficaTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteAnagraficaTab,
  })),
)

<TabsContent value="anagrafica">
  <Suspense fallback={<LoadingState message="Caricamento tab anagrafica..." />}>
    <AthleteAnagraficaTab athleteId={athleteUserId} />
  </Suspense>
</TabsContent>
```

---

## 🎯 Pagine da Ottimizzare

### Pagine Principali (Alta Priorità)

#### 1. `/dashboard` (page.tsx)
**Status**: ⚠️ Parzialmente Ottimizzato
- ✅ Cache implementata (5s revalidate)
- ⚠️ Componenti non lazy loaded
- ⚠️ Query potrebbe essere ottimizzata

**Ottimizzazioni Necessarie**:
- [ ] Lazy load `AgendaTimeline` (componente pesante)
- [ ] Lazy load `NewAppointmentButton`
- [ ] Ottimizzare query appointments con limiti più stringenti

#### 2. `/dashboard/clienti` (page.tsx)
**Status**: ⚠️ Non Ottimizzato
- ❌ Nessun lazy loading
- ❌ Componenti pesanti caricati immediatamente
- ⚠️ Query già ottimizzate con paginazione

**Ottimizzazioni Necessarie**:
- [ ] Lazy load `ClientiFiltriAvanzati` (solo quando aperto)
- [ ] Lazy load `CreaAtletaModal` (solo quando aperto)
- [ ] Lazy load `ClientiBulkActions` (solo quando ci sono selezioni)
- [ ] Lazy load `ModernKPICard` (componente con calcoli pesanti)
- [ ] Aggiungere Suspense boundaries

#### 3. `/dashboard/appuntamenti` (page.tsx)
**Status**: ⚠️ Non Ottimizzato
- ❌ Modali caricati immediatamente
- ❌ Form caricato anche quando non aperto

**Ottimizzazioni Necessarie**:
- [ ] Lazy load `AppointmentForm` (solo quando `showForm === true`)
- [ ] Lazy load `AppointmentDetail` (solo quando `showDetail === true`)
- [ ] Lazy load `AppointmentsStats` (componente con calcoli)
- [ ] Aggiungere Suspense boundaries

#### 4. `/dashboard/calendario` (page.tsx)
**Status**: ⚠️ Da Verificare
- ⚠️ Probabilmente usa FullCalendar (già lazy loaded?)
- ⚠️ Modali da verificare

**Ottimizzazioni Necessarie**:
- [ ] Verificare lazy loading FullCalendar
- [ ] Lazy load modali calendario
- [ ] Ottimizzare query appointments

#### 5. `/dashboard/schede` (page.tsx)
**Status**: ⚠️ Non Ottimizzato
- ❌ `WorkoutDetailModal` caricato sempre
- ❌ Componenti filtri caricati sempre

**Ottimizzazioni Necessarie**:
- [ ] Lazy load `WorkoutDetailModal` (solo quando aperto)
- [ ] Lazy load `WorkoutPlansFilters` (solo quando `showFilters === true`)
- [ ] Aggiungere Suspense boundaries

#### 6. `/dashboard/statistiche` (page.tsx)
**Status**: ✅ Già Ottimizzato
- ✅ `LazyStatsCharts` già implementato
- ✅ Server Component con caching

**Ottimizzazioni Aggiuntive**:
- [ ] Verificare caching query analytics
- [ ] Ottimizzare calcoli `calculateGrowthMetrics`

#### 7. `/dashboard/profilo` (page.tsx)
**Status**: ⚠️ Non Ottimizzato
- ❌ Tabs caricati immediatamente
- ❌ Componenti profilo caricati sempre

**Ottimizzazioni Necessarie**:
- [ ] Lazy load tabs (`PTProfileTab`, `PTNotificationsTab`, `PTSettingsTab`)
- [ ] Lazy load solo tab attivo
- [ ] Prefetching on hover (come profili atleta)
- [ ] Aggiungere Suspense boundaries

### Pagine Secondarie (Media Priorità)

#### 8. `/dashboard/allenamenti` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load componenti pesanti
- [ ] Ottimizzare query allenamenti

#### 9. `/dashboard/esercizi` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load modali creazione/modifica
- [ ] Lazy load componenti lista pesanti

#### 10. `/dashboard/abbonamenti` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load modali
- [ ] Ottimizzare query abbonamenti

#### 11. `/dashboard/pagamenti` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load `NuovoPagamentoModal`
- [ ] Ottimizzare query pagamenti

#### 12. `/dashboard/chat` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load componenti chat pesanti
- [ ] Ottimizzare realtime subscriptions

#### 13. `/dashboard/comunicazioni` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load modali
- [ ] Ottimizzare query comunicazioni

#### 14. `/dashboard/documenti` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load modali upload
- [ ] Ottimizzare query documenti

#### 15. `/dashboard/impostazioni` (page.tsx)
**Ottimizzazioni Necessarie**:
- [ ] Lazy load sezioni impostazioni
- [ ] Ottimizzare query impostazioni

---

## 🛠️ Strategia di Implementazione

### Fase 1: Componenti Pesanti (Alta Priorità)
1. Identificare componenti > 50KB
2. Applicare lazy loading con `React.lazy()`
3. Aggiungere Suspense boundaries
4. Implementare prefetching on hover dove appropriato

### Fase 2: Modali e Form (Alta Priorità)
1. Lazy load modali solo quando aperti
2. Lazy load form solo quando necessari
3. Aggiungere skeleton loaders

### Fase 3: Query e Caching (Media Priorità)
1. Ottimizzare query con limiti appropriati
2. Implementare caching strategico con `unstable_cache`
3. Aggiungere paginazione dove mancante

### Fase 4: Bundle Optimization (Bassa Priorità)
1. Analizzare bundle size
2. Code splitting per route
3. Tree shaking ottimizzato

---

## 📋 Checklist Implementazione

### Pattern Standard per Lazy Loading

```typescript
// 1. Import lazy
const ComponentPesante = lazy(() =>
  import('@/components/path').then((mod) => ({
    default: mod.ComponentPesante,
  })),
)

// 2. Wrapper con Suspense
<Suspense fallback={<LoadingState message="Caricamento..." />}>
  <ComponentPesante {...props} />
</Suspense>
```

### Pattern per Modali

```typescript
// Lazy load solo quando aperto
{showModal && (
  <Suspense fallback={<div>Caricamento...</div>}>
    <ModalComponent open={showModal} />
  </Suspense>
)}
```

### Pattern per Tabs

```typescript
// Lazy load tab attivo + prefetching on hover
<TabsTrigger
  value="tab1"
  onMouseEnter={() => prefetchTab('tab1')}
>
  Tab 1
</TabsTrigger>

<TabsContent value="tab1">
  <Suspense fallback={<LoadingState />}>
    <Tab1Component />
  </Suspense>
</TabsContent>
```

---

## 🎯 Metriche di Successo

### Performance Target
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Bundle Size**: < 200KB (initial load)

### Metriche da Monitorare
- Tempo caricamento pagina iniziale
- Tempo caricamento componenti lazy
- Bundle size per route
- Query database performance

---

## 📝 Note Implementazione

1. **Priorità**: Iniziare con pagine più utilizzate (dashboard, clienti, appuntamenti)
2. **Testing**: Verificare che lazy loading non rompa funzionalità esistenti
3. **Fallback**: Sempre fornire skeleton loaders appropriati
4. **Prefetching**: Usare on hover per migliorare UX senza impattare performance iniziale

---

**Status**: 📋 **PIANO CREATO** - Pronto per implementazione
