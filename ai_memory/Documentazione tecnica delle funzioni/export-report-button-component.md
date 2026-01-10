# Componente: ExportReportButton

## 📋 Descrizione

Bottone per esportare report analytics in formato CSV. Utilizza utility `exportAnalyticsToCSV` per generare e scaricare file CSV con dati analytics.

## 📁 Percorso File

`src/components/dashboard/export-report-button.tsx`

## 🔧 Props

```typescript
interface ExportReportButtonProps {
  analyticsData: AnalyticsData
}
```

### Dettaglio Props

- **`analyticsData`** (AnalyticsData, required): Dati analytics da esportare

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Button` da `@/components/ui`

### Icons

- `Download` da `lucide-react`

### Utils

- `exportAnalyticsToCSV` da `@/lib/analytics-export`

### Types

- `AnalyticsData` da `@/lib/analytics`

## ⚙️ Funzionalità

### Core

1. **Export CSV**: Genera e scarica file CSV con dati analytics
2. **Error Handling**: Gestisce errori con console.error e alert
3. **UI Button**: Bottone con icona Download e stile gradiente

### Funzionalità Avanzate

- **Gradient Button**: Stile gradiente teal-cyan
- **Shadow Effects**: Shadow con colore teal
- **Hover Effects**: Hover con scale e shadow enhancement
- **Error Feedback**: Alert per errori utente

### UI/UX

- Bottone prominente con icona
- Stile gradiente attraente
- Hover effects
- Feedback errori

## 🎨 Struttura UI

```
Button
  ├── Download icon
  └── "Esporta Report"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ExportReportButton } from '@/components/dashboard/export-report-button'

function StatisticsPage() {
  const analyticsData = {
    summary: {...},
    trend: [...],
    distribution: [...],
    performance: [...],
  }

  return <ExportReportButton analyticsData={analyticsData} />
}
```

## 🔍 Note Tecniche

### Export Function

```typescript
const handleExport = () => {
  try {
    exportAnalyticsToCSV(analyticsData)
  } catch (error) {
    console.error('Errore durante esportazione report:', error)
    alert("Errore durante l'esportazione del report. Controlla la console per dettagli.")
  }
}
```

### Error Handling

- Try-catch per gestire errori
- Console.error per logging
- Alert per feedback utente

### Limitazioni

- Solo formato CSV (non supporta altri formati)
- Alert nativo (non toast notification)
- Nessun loading state durante export

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
