# Componente: LazyStatsTable

## 📋 Descrizione

Componente wrapper che carica lazy il componente `StatsTable` per ridurre il bundle size iniziale. Utilizza React Suspense per mostrare un fallback durante il caricamento.

## 📁 Percorso File

`src/components/dashboard/lazy-stats-table.tsx`

## 🔧 Props

```typescript
interface LazyStatsTableProps {
  data: AthleteStats[]
  onExport: () => void
}
```

### Dettaglio Props

- **`data`** (AthleteStats[], required): Array delle statistiche degli atleti
- **`onExport`** (function, required): Callback chiamato quando si esporta la tabella

## 📦 Dipendenze

### React

- `lazy`, `Suspense` da `react`

### UI Components

- `Card`, `CardContent` da `@/components/ui`

### Types

- `AthleteStats` da `./stats-table`

### Components

- `StatsTable` (lazy loaded) da `./stats-table`

## ⚙️ Funzionalità

### Core

1. **Lazy Loading**: Carica `StatsTable` solo quando necessario
2. **Suspense Fallback**: Mostra skeleton durante il caricamento
3. **Performance**: Riduce il bundle size iniziale

### Funzionalità Avanzate

- **Code Splitting**: Separa il codice della tabella dal bundle principale
- **Skeleton Fallback**: Mostra skeleton durante il caricamento
- **Lazy Import**: Utilizza dynamic import per il componente

### UI/UX

- Skeleton con animazione pulse
- Layout card con skeleton per header e righe
- Stili consistenti con il tema
- Placeholder durante il loading

## 🎨 Struttura UI

```
Suspense
  ├── Fallback (durante loading)
  │   └── Card
  │       └── CardContent
  │           └── Skeleton
  │               ├── Header (h-6 w-48)
  │               ├── Search bar (h-10)
  │               └── Rows[] (3 righe h-16)
  └── StatsTable (lazy loaded)
      └── Tabella statistiche completa
```

## 💡 Esempi d'Uso

```tsx
<LazyStatsTable data={athleteStats} onExport={handleExport} />
```

## 📝 Note Tecniche

- Utilizza React `lazy()` per il code splitting
- `Suspense` per gestire il loading state
- Fallback skeleton per migliorare UX
- Riduce il bundle size iniziale spostando il codice della tabella
- Layout card con skeleton per header e righe
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
