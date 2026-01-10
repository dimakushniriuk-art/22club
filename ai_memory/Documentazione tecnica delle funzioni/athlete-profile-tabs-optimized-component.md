# 📚 Documentazione Tecnica: AthleteProfileTabsOptimized

**Percorso**: `src/components/dashboard/athlete-profile/athlete-profile-tabs-optimized.tsx`  
**Tipo Modulo**: React Component (Tabs Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente tabs profilo atleta ottimizzato. Sistema tabs a 2 livelli con lazy loading aggressivo, prefetch intelligente, e rendering condizionale per performance.

---

## 🔧 Props e Export

### 1. `AthleteProfileTabsOptimized`

**Classificazione**: React Component, Tabs Component, Client Component, Lazy Loading  
**Tipo**: `(props: AthleteProfileTabsProps) => JSX.Element`

**Props**:

- `athleteId`: `string` - ID profilo atleta
- `athleteUserId`: `string | null` - ID utente atleta
- `stats`: `AthleteStats` - Statistiche atleta
  - `allenamenti_totali`, `allenamenti_mese`, `schede_attive`, `documenti_scadenza`, `peso_attuale`
- `onPrefetchTab?`: `(tabName: string) => void` - Callback prefetch tab (opzionale)

**Output**: JSX Element (sistema tabs)

**Descrizione**: Componente tabs profilo atleta ottimizzato con:

- **Tabs Livello 1** (4 tab principali):
  - Profilo (con sub-tabs)
  - Allenamenti
  - Progressi
  - Documenti
- **Tabs Livello 2** (9 sub-tabs profilo):
  - Anagrafica, Medica, Fitness, Motivazionale, Nutrizione, Massaggio, Amministrativo, Smart Tracking, AI Data
- **Lazy Loading**:
  - Tutti i sub-tabs caricati dinamicamente con `dynamic()` (Next.js)
  - `ssr: false` per tutti i componenti pesanti
  - Skeleton loader durante caricamento
- **Prefetch Intelligente**:
  - Prefetch tab adiacenti quando un tab diventa attivo
  - Prefetch su hover tab
  - Preload primo tab (anagrafica) al mount
- **Rendering Condizionale**:
  - Renderizza solo tab attivo e quelli già caricati (mantiene stato)
  - `forceMount` per tab già caricati (preserva stato form)

---

## 🔄 Flusso Logico

### Inizializzazione

1. **State**:
   - `activeTab`: 'profilo' (default)
   - `activeProfileTab`: 'anagrafica' (default)
   - `loadedTabs`: Set con 'anagrafica' (preload)
   - `prefetchedTabs`: Set vuoto

2. **Preload Primo Tab**:
   - 'anagrafica' caricato immediatamente

### Prefetch Tab Adiacenti

1. **On Active Tab Change**:
   - Calcola `currentOrder` del tab attivo
   - Prefetch tab con `order === currentOrder - 1` o `currentOrder + 1`
   - Aggiunge a `prefetchedTabs` Set

### Prefetch su Hover

1. **On Tab Hover**:
   - Se tab non caricato e non prefetched → aggiunge a `prefetchedTabs`
   - Chiama `onPrefetchTab?.(tabKey)`
   - Preload immediato componente

### Rendering Tab

1. **Should Render**:
   - Renderizza se `activeProfileTab === tabKey` o `loadedTabs.has(tabKey)`

2. **Force Mount**:
   - `forceMount={loadedTabs.has(tabKey)}` per preservare stato

### Tab Change

1. **On Tab Change**:
   - Aggiorna `activeProfileTab`
   - Aggiunge tab a `loadedTabs` Set

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`, `useMemo`, `lazy`, `Suspense`), Next.js (`dynamic`), UI Components (`Tabs`, `Skeleton`), Lucide icons, `AthleteWorkoutsTab`, `AthleteProgressTab`, `AthleteDocumentsTab`, `LoadingState`

**Utilizzato da**: Pagina profilo atleta dashboard

---

## ⚠️ Note Tecniche

- **Lazy Loading Aggressivo**: Tutti i sub-tabs caricati dinamicamente per ridurre bundle size
- **Prefetch Strategy**: Prefetch tab adiacenti + hover per UX fluida
- **State Preservation**: `forceMount` mantiene stato form quando tab già caricato
- **Responsive Icons**: Icone responsive (h-3 w-3 mobile, h-4 w-4 desktop)
- **Grid Responsive**: TabsList con grid responsive (3 colonne mobile, 5 tablet, 9 desktop)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
