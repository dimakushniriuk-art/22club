# Componente: LazyStatsCharts

## 📋 Descrizione

Componente wrapper che carica lazy il componente `StatsCharts` per ridurre il bundle size iniziale. Utilizza React Suspense per mostrare un fallback durante il caricamento.

## 📁 Percorso File

`src/components/dashboard/lazy-stats-charts.tsx`

## 🔧 Props

```typescript
interface LazyStatsChartsProps {
  data: ChartData
}
```

### Dettaglio Props

- **`data`** (ChartData, required): Dati per i grafici statistiche

## 📦 Dipendenze

### React

- `lazy`, `Suspense` da `react`

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `BarChart3` da `lucide-react`

### Types

- `ChartData` da `./stats-charts`

### Components

- `StatsCharts` (lazy loaded) da `./stats-charts`

## ⚙️ Funzionalità

### Core

1. **Lazy Loading**: Carica `StatsCharts` solo quando necessario
2. **Suspense Fallback**: Mostra skeleton durante il caricamento
3. **Performance**: Riduce il bundle size iniziale

### Funzionalità Avanzate

- **Code Splitting**: Separa il codice dei grafici dal bundle principale
- **Skeleton Fallback**: Mostra 4 card skeleton durante il caricamento
- **Lazy Import**: Utilizza dynamic import per il componente

### UI/UX

- Skeleton con animazione pulse
- Layout grid responsive (1 colonna mobile, 2 desktop)
- Stili consistenti con il tema teal-cyan
- Icone e placeholder durante il loading

## 🎨 Struttura UI

```
Suspense
  ├── Fallback (durante loading)
  │   └── Grid (2 colonne)
  │       └── Card[] (4 cards skeleton)
  │           ├── Header con icona
  │           └── Skeleton chart (h-80)
  └── StatsCharts (lazy loaded)
      └── Grafici statistiche
```

## 💡 Esempi d'Uso

```tsx
<LazyStatsCharts data={chartData} />
```

## 📝 Note Tecniche

- Utilizza React `lazy()` per il code splitting
- `Suspense` per gestire il loading state
- Fallback skeleton per migliorare UX
- Riduce il bundle size iniziale spostando il codice dei grafici
- Layout grid responsive con Tailwind CSS
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
