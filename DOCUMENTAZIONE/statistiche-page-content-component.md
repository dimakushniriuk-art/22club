# Componente: StatistichePageContent

## 📋 Descrizione

Componente pagina completa per statistiche. Include header con titolo e periodo, export button, e tutti i grafici statistiche organizzati in layout responsive. Versione completa di StatisticheContent con header.

## 📁 Percorso File

`src/components/dashboard/statistiche-page-content.tsx`

## 🔧 Props

```typescript
interface StatistichePageContentProps {
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

1. **Layout Pagina Completo**: Header, contenuto, grafici
2. **Header Informazioni**: Titolo, descrizione, periodo, export
3. **Orchestrazione Grafici**: Stesso layout di StatisticheContent
4. **Responsive Design**: Layout adattivo per mobile/tablet/desktop

### Sezioni Visualizzate

1. **Header**:
   - Titolo "Statistiche"
   - Descrizione
   - Badge periodo ("Ultimo mese")
   - Export button
2. **KPI Metrics**: 4 metriche principali
3. **Trend Charts**: 2 grafici trend
4. **Distribution Charts**: 3 grafici distribuzione
5. **Performance Metrics**: Top performers e dettagli

### Funzionalità Avanzate

- **Layout Container**: Max-width 1800px, centrato
- **Spacing Responsive**: Padding e gap adattivi
- **Header Flex**: Header con flex responsive
- **Suspense Boundaries**: Lazy loading per ottimizzazione

### UI/UX

- Layout full-page responsive
- Header prominente con informazioni
- Spacing coerente tra sezioni
- Skeleton loading durante caricamento

## 🎨 Struttura UI

```
div (min-h-screen, flex flex-col)
  └── div (container, max-w-1800px, mx-auto)
      ├── Header
      │   ├── Titolo + Descrizione
      │   └── Badge Periodo + Export Button
      ├── Suspense (KPI Metrics)
      ├── div (grid 2 colonne - Trend Charts)
      ├── div (grid 3 colonne - Distribution Charts)
      └── div (grid 2 colonne - Performance)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { StatistichePageContent } from '@/components/dashboard/statistiche-page-content'

export default function StatisticsPage() {
  const analyticsData = await getAnalyticsData()
  const growth = await getGrowthData()

  return <StatistichePageContent data={analyticsData} growth={growth} />
}
```

## 🔍 Note Tecniche

### Layout Container

- Max-width: 1800px
- Centrato: mx-auto
- Padding responsive: px-4 sm:px-6, py-4 sm:py-6
- Spacing: space-y-4 sm:space-y-6

### Header Responsive

- Flex column su mobile
- Flex row su desktop
- Gap adattivo

### Limitazioni

- Periodo hardcoded ("Ultimo mese")
- Layout fisso (non configurabile)
- Stesso contenuto di StatisticheContent (duplicazione)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
