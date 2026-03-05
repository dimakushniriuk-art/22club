# Componente: StatisticheContent

## 📋 Descrizione

Componente contenuto principale per pagina statistiche. Orchestra visualizzazione di KPI metrics, trend charts, distribution charts e performance metrics con Suspense boundaries per lazy loading.

## 📁 Percorso File

`src/components/dashboard/statistiche-content.tsx`

## 🔧 Props

```typescript
interface StatisticheContentProps {
  data: AnalyticsData
  growth: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}
```

### Dettaglio Props

- **`data`** (AnalyticsData, required): Dati analytics completi
- **`growth`** (object, required): Percentuali crescita (workouts, documents, hours)

## 📦 Dipendenze

### React

- `Suspense` da `react`

### Components

- `TrendChart`, `MultiTrendChart` da `@/components/shared/analytics/trend-chart`
- `DistributionChart`, `HorizontalBarChart`, `VerticalBarChart` da `@/components/shared/analytics/distribution-chart`
- `KPIMetrics`, `PerformanceMetrics` da `@/components/shared/analytics/kpi-metrics`
- `Skeleton` da `@/components/shared/ui/skeleton`
- `ExportReportButton` da `@/components/dashboard/export-report-button`

### Types

- `AnalyticsData` da `@/lib/analytics`

## ⚙️ Funzionalità

### Core

1. **Orchestrazione Grafici**: Organizza tutti i grafici statistiche
2. **Lazy Loading**: Suspense boundaries per ottimizzazione
3. **KPI Metrics**: Mostra metriche principali con trend
4. **Multiple Charts**: Trend, distribution, performance charts

### Sezioni Visualizzate

1. **Export Button**: Bottone export report in alto
2. **KPI Metrics**: 4 metriche principali con trend
3. **Trend Charts**: 2 grafici trend (line e multi-line)
4. **Distribution Charts**: 3 grafici distribuzione (pie, horizontal bar, vertical bar)
5. **Performance Metrics**: Top performers e dettagli performance

### Funzionalità Avanzate

- **Suspense Boundaries**: Lazy loading per ogni sezione
- **Skeleton Fallbacks**: Loading states per ogni grafico
- **Grid Layout**: Layout responsive per grafici
- **Export Integration**: ExportReportButton integrato

### UI/UX

- Layout organizzato in sezioni
- Grid responsive per grafici
- Skeleton loading durante caricamento
- Export button prominente

## 🎨 Struttura UI

```
div
  ├── ExportReportButton
  ├── Suspense (KPI Metrics)
  │   ├── Skeleton fallback
  │   └── KPIMetrics
  ├── div (grid 2 colonne - Trend Charts)
  │   ├── Suspense (TrendChart)
  │   └── Suspense (MultiTrendChart)
  ├── div (grid 3 colonne - Distribution Charts)
  │   ├── Suspense (DistributionChart)
  │   ├── Suspense (HorizontalBarChart)
  │   └── Suspense (VerticalBarChart)
  └── div (grid 2 colonne - Performance)
      ├── Suspense (PerformanceMetrics)
      └── Dettagli Performance (statico)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { StatisticheContent } from '@/components/dashboard/statistiche-content'

function StatisticsPage() {
  const analyticsData = {
    summary: {
      total_workouts: 156,
      total_documents: 42,
      total_hours: 1240.5,
      active_athletes: 28,
    },
    trend: [...],
    distribution: [...],
    performance: [...],
  }

  const growth = {
    workouts_growth: 12.5,
    documents_growth: 8.3,
    hours_growth: 15.2,
  }

  return <StatisticheContent data={analyticsData} growth={growth} />
}
```

## 🔍 Note Tecniche

### Suspense Boundaries

Ogni sezione ha Suspense con Skeleton fallback:

- KPI Metrics: 4 skeleton cards
- Trend Charts: Skeleton height 320px
- Distribution Charts: Skeleton height 280px
- Performance: Skeleton height 400px

### Dettagli Performance

Sezione statica (non lazy) con valori da `data.summary`:

- Allenamenti completati
- Ore totali
- Documenti caricati
- Atleti attivi

### Limitazioni

- Dati devono essere nel formato AnalyticsData completo
- Skeleton generici (non personalizzati per tipo grafico)
- Dettagli performance hardcoded (non configurabili)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
