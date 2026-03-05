# Componente: AdminStatisticsContent

## 📋 Descrizione

Componente per statistiche avanzate amministratore. Carica dati da API `/api/admin/statistics` e visualizza KPI, grafici (line, bar, pie) per utenti, pagamenti, appuntamenti, documenti e comunicazioni. Utilizza Recharts con lazy loading.

## 📁 Percorso File

`src/components/dashboard/admin/admin-statistics-content.tsx`

## 🔧 Props

```typescript
// Nessuna prop - componente senza props
```

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui/card`
- `Skeleton` da `@/components/shared/ui/skeleton`

### Charts

- `LineChart`, `Line`, `BarChart`, `Bar`, `PieChart`, `Pie`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer` da `@/components/charts/client-recharts`

### Icons

- `Users`, `Euro`, `Calendar`, `FileText`, `Send`, `TrendingUp`, `TrendingDown` da `lucide-react`

### Utils

- `notifyError` da `@/lib/notifications`

## ⚙️ Funzionalità

### Core

1. **Statistiche Avanzate**: Carica dati da API admin/statistics
2. **KPI Cards**: 6+ card KPI con trend
3. **Grafici Multipli**: Line, bar, pie charts per diverse metriche
4. **Formattazione**: Formatta valuta e percentuali

### Dati Visualizzati

- **Utenti**: Totali, attivi, questo mese, crescita, distribuzione per ruolo, trend mensile
- **Pagamenti**: Entrate totali, questo mese, crescita, distribuzione metodo, trend mensile
- **Appuntamenti**: Totali, questo mese, distribuzione stato
- **Documenti**: Totali, distribuzione stato, scaduti
- **Comunicazioni**: Totali, inviate, consegnate, aperte, fallite, delivery rate, open rate

### Funzionalità Avanzate

- **API Integration**: Chiama `/api/admin/statistics`
- **Error Handling**: Gestisce errori con notifyError
- **Loading State**: Skeleton loading durante caricamento
- **Empty State**: Messaggio se nessun dato
- **Formattazione Valuta**: EUR formato italiano
- **Formattazione Percentuali**: Formato con segno +/-

### UI/UX

- Container con header
- Grid KPI cards responsive
- Grafici organizzati in sezioni
- Tooltip interattivi
- Legend per identificare serie

## 🎨 Struttura UI

```
div (container, space-y-6)
  ├── Header
  ├── Grid KPI Cards (1/2/4 colonne)
  ├── Sezione Grafici Utenti
  │   ├── Line Chart (trend mensile)
  │   └── Pie Chart (distribuzione ruolo)
  ├── Sezione Grafici Pagamenti
  │   ├── Line Chart (trend entrate)
  │   └── Bar Chart (metodi pagamento)
  └── Altre sezioni grafici...
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AdminStatisticsContent } from '@/components/dashboard/admin/admin-statistics-content'

export default function AdminStatisticsPage() {
  return <AdminStatisticsContent />
}
```

## 🔍 Note Tecniche

### API Call

```typescript
const response = await fetch('/api/admin/statistics')
const data = await response.json()
```

### Formattazione Valuta

```typescript
new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
```

### Formattazione Percentuali

```typescript
;`${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
```

### Limitazioni

- Dati da API (richiede endpoint funzionante)
- Grafici statici (non interattivi oltre tooltip)
- Colori grafici hardcoded

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
