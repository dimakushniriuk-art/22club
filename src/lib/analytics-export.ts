// 📊 Analytics Export Utilities — 22Club

import type { TrendData, PerformanceData, AnalyticsData } from '@/lib/analytics'
import { exportToCSV, type ExportData } from '@/lib/export-utils'

/**
 * Esporta dati analytics in formato CSV
 */
export function exportAnalyticsToCSV(data: AnalyticsData, filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `22club-statistiche-${timestamp}.csv`

  // Prepara dati per export
  const exportData: ExportData = []

  // 1. Summary
  exportData.push({
    Sezione: 'RIEPILOGO',
    'Totale Allenamenti': data.summary.total_workouts,
    'Totale Documenti': data.summary.total_documents,
    'Ore Totali': data.summary.total_hours.toFixed(1),
    'Atleti Attivi': data.summary.active_athletes,
  } as Record<string, string | number | boolean | null>)

  // 2. Trend (ultimi 14 giorni)
  exportData.push({ Sezione: 'TREND GIORNALIERO' } as Record<
    string,
    string | number | boolean | null
  >)
  data.trend.forEach((day) => {
    exportData.push({
      Data: day.day,
      Allenamenti: day.allenamenti,
      Documenti: day.documenti,
      'Ore Totali': day.ore_totali.toFixed(1),
    } as Record<string, string | number | boolean | null>)
  })

  // 3. Distribuzione
  exportData.push({ Sezione: 'DISTRIBUZIONE PER TIPO' } as Record<
    string,
    string | number | boolean | null
  >)
  data.distribution.forEach((dist) => {
    exportData.push({
      Tipo: dist.type,
      Quantità: dist.count,
      Percentuale: `${dist.percentage}%`,
    } as Record<string, string | number | boolean | null>)
  })

  // 4. Performance Atleti
  exportData.push({ Sezione: 'PERFORMANCE ATLETI' } as Record<
    string,
    string | number | boolean | null
  >)
  data.performance.forEach((perf) => {
    exportData.push({
      'Nome Atleta': perf.athlete_name,
      'Totale Allenamenti': perf.total_workouts,
      'Durata Media (min)': perf.avg_duration,
      'Tasso Completamento': `${perf.completion_rate}%`,
    } as Record<string, string | number | boolean | null>)
  })

  exportToCSV(exportData, filename || defaultFilename)
}

/**
 * Esporta solo trend data in CSV
 */
export function exportTrendToCSV(trend: TrendData[], filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `22club-trend-${timestamp}.csv`

  const exportData: ExportData = trend.map(
    (day) =>
      ({
        Data: day.day,
        Allenamenti: day.allenamenti,
        Documenti: day.documenti,
        'Ore Totali': day.ore_totali.toFixed(1),
      }) as Record<string, string | number | boolean | null>,
  )

  exportToCSV(exportData, filename || defaultFilename)
}

/**
 * Esporta solo performance data in CSV
 */
export function exportPerformanceToCSV(performance: PerformanceData[], filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `22club-performance-${timestamp}.csv`

  const exportData: ExportData = performance.map(
    (perf) =>
      ({
        'Nome Atleta': perf.athlete_name,
        'Totale Allenamenti': perf.total_workouts,
        'Durata Media (min)': perf.avg_duration,
        'Tasso Completamento': `${perf.completion_rate}%`,
      }) as Record<string, string | number | boolean | null>,
  )

  exportToCSV(exportData, filename || defaultFilename)
}
