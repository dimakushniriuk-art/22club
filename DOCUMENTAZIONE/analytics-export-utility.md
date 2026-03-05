# Utility: Analytics Export

## 📋 Descrizione

Utility per export dati analytics in CSV. Formatta dati analytics (summary, trend, distribution, performance) per export.

## 📁 Percorso File

`src/lib/analytics-export.ts`

## 📦 Dipendenze

- `@/lib/analytics` (`TrendData`, `DistributionData`, `PerformanceData`, `AnalyticsData`)
- `@/lib/export-utils` (`exportToCSV`, `ExportData`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`exportAnalyticsToCSV(data, filename?)`**: Esporta analytics in CSV
   - Default filename: `22club-statistiche-YYYY-MM-DD.csv`
   - Sezioni: RIEPILOGO, TREND GIORNALIERO, DISTRIBUZIONE PER TIPO, PERFORMANCE ATLETI
   - Formattazione numeri: toFixed per decimali
   - Formattazione percentuali: X%

## 🔍 Note Tecniche

- Organizza dati in sezioni con header
- Formattazione numeri: toFixed per decimali
- Formattazione percentuali: X%

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
