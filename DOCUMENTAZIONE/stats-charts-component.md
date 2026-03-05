# Componente: StatsCharts

## 📋 Descrizione

Componente per visualizzare grafici statistiche dashboard. Include grafici entrate mensili, allenamenti per atleta, trend progressi e distribuzione. Utilizza Recharts con lazy loading per ottimizzazione bundle.

## 📁 Percorso File

`src/components/dashboard/stats-charts.tsx`

## 🔧 Props

```typescript
interface StatsChartsProps {
  data: ChartData
}

export interface ChartData {
  monthlyRevenue: Array<{
    mese: string
    entrate: number
    lezioni: number
  }>
  workoutsPerAthlete: Array<{
    atleta: string
    schede: number
    staff: string
  }>
  progressTrend: Array<{
    mese: string
    peso_medio: number
    atleti: number
  }>
}
```

### Dettaglio Props

- **`data`** (ChartData, required): Dati per i grafici (entrate mensili, allenamenti per atleta, trend progressi)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent` da `@/components/ui`

### Charts

- `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`, `BarChart`, `Bar`, `AreaChart`, `Area`, `PieChart`, `Pie`, `Cell` da `@/components/charts/client-recharts`

### Icons

- `TrendingUp`, `BarChart3`, `Users` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **4 Grafici Principali**: Entrate mensili, allenamenti per atleta, trend progressi, distribuzione
2. **Error Boundary**: Gestione dati mancanti con messaggio errore
3. **Custom Tooltip**: Tooltip personalizzato per grafici
4. **Colori Tematici**: Palette colori coerente per tutti i grafici

### Grafici Visualizzati

1. **Entrate Mensili**: Line chart con entrate e lezioni per mese
2. **Allenamenti per Atleta**: Bar chart orizzontale con schede per atleta
3. **Trend Progressi**: Area chart con peso medio e numero atleti
4. **Distribuzione**: Pie chart (se dati disponibili)

### Funzionalità Avanzate

- **Error Boundary**: Mostra messaggio errore se dati mancanti
- **Custom Tooltip**: Tooltip formattato con valori e colori
- **Responsive**: Grafici responsive con ResponsiveContainer
- **Colori Palette**: 7 colori predefiniti per grafici

### UI/UX

- Grid layout responsive (1 colonna mobile, 2 desktop)
- Card per ogni grafico
- Icone per ogni tipo di grafico
- Tooltip interattivi
- Legend per identificare serie

## 🎨 Struttura UI

```
div (grid 1/2 colonne)
  └── Card (per ogni grafico)
      ├── CardContent
      │   ├── Header (icona + titolo)
      │   └── ResponsiveContainer
      │       └── Chart Component
      │           ├── XAxis/YAxis
      │           ├── Tooltip
      │           ├── Legend
      │           └── Data Series (Line/Bar/Area/Pie)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { StatsCharts } from '@/components/dashboard/stats-charts'

function StatisticsPage() {
  const chartData = {
    monthlyRevenue: [
      { mese: 'Gennaio', entrate: 5000, lezioni: 120 },
      // ...
    ],
    workoutsPerAthlete: [
      { atleta: 'Mario Rossi', schede: 15, staff: 'PT1' },
      // ...
    ],
    progressTrend: [
      { mese: 'Gennaio', peso_medio: 75.5, atleti: 25 },
      // ...
    ],
  }

  return <StatsCharts data={chartData} />
}
```

## 🔍 Note Tecniche

### Error Boundary

```typescript
if (!data || !data.monthlyRevenue || !data.workoutsPerAthlete || !data.progressTrend) {
  return <ErrorCard message="I dati per i grafici non sono disponibili" />
}
```

### Colori Palette

```typescript
const COLORS = {
  brand: '#0FB5BA',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',
  purple: '#A78BFA',
  pink: '#F472B6',
}
```

### Custom Tooltip

- Formattazione valori numerici
- Colori per ogni serie
- Label formattato

### Limitazioni

- Dati devono essere nel formato ChartData esatto
- Error boundary generico (non specifico per tipo errore)
- Grafici statici (non interattivi oltre tooltip)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
