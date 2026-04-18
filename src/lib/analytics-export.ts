// 📊 Analytics Export Utilities — 22Club

import type { TrendData, PerformanceData, AnalyticsData } from '@/lib/analytics'
import type { TrainerAnalyticsReport } from '@/lib/trainer-analytics'
import { exportToCSV, type ExportData } from '@/lib/export-utils'
import { buildStandardPdfBlob } from '@/lib/pdf'

/**
 * PDF unificato (sezioni: riepilogo, trend, distribuzione, performance).
 */
export async function buildAnalyticsReportPdfBlob(data: AnalyticsData): Promise<Blob> {
  return buildStandardPdfBlob({
    orientation: 'landscape',
    render: ({ doc, margin, autoTable, headStyles, docWithAuto }) => {
      let y = margin
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Statistiche 22Club', margin, y)
      y += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
      y += 10

      const base = {
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' as const },
        headStyles,
        margin: { left: margin, right: margin },
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Riepilogo', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Metrica', 'Valore']],
        body: [
          ['Totale allenamenti', String(data.summary.total_workouts)],
          ['Totale documenti', String(data.summary.total_documents)],
          ['Ore totali', data.summary.total_hours.toFixed(1)],
          ['Atleti attivi', String(data.summary.active_athletes)],
        ],
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      doc.setFont('helvetica', 'bold')
      doc.text('Trend giornaliero', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [
          [
            'Data',
            'Allenamenti',
            'Documenti',
            'Ore totali',
            'Prenotati',
            'Eseguiti',
            'Annullati',
            'Cancellati',
          ],
        ],
        body: data.trend.map((d) => [
          d.day,
          String(d.allenamenti),
          String(d.documenti),
          d.ore_totali.toFixed(1),
          String(d.prenotati),
          String(d.eseguiti),
          String(d.annullati),
          String(d.cancellati),
        ]),
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      doc.setFont('helvetica', 'bold')
      doc.text('Distribuzione per tipo', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Tipo', 'Quantità', 'Percentuale']],
        body: data.distribution.map((d) => [d.type, String(d.count), `${d.percentage}%`]),
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      doc.setFont('helvetica', 'bold')
      doc.text('Performance atleti', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Atleta', 'Allenamenti', 'Durata media (min)', 'Completamento %']],
        body: data.performance.map((p) => [
          p.athlete_name,
          String(p.total_workouts),
          String(p.avg_duration),
          `${p.completion_rate}%`,
        ]),
        ...base,
      })
    },
  })
}

/**
 * PDF analytics trainer (KPI, trend incassi/ore, atleti, alert).
 */
export async function buildTrainerAnalyticsReportPdfBlob(
  report: TrainerAnalyticsReport,
): Promise<Blob> {
  return buildStandardPdfBlob({
    orientation: 'landscape',
    render: ({ doc, margin, autoTable, headStyles, docWithAuto }) => {
      let y = margin
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Statistiche trainer — 22Club', margin, y)
      y += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Periodo: ${report.startDay} — ${report.endDay}`, margin, y)
      y += 5
      doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
      y += 10

      const base = {
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' as const },
        headStyles,
        margin: { left: margin, right: margin },
      }

      const k = report.kpis
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('KPI', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Metrica', 'Valore']],
        body: [
          ['Incasso training (€)', String(k.revenueTotal)],
          ['Ore da log', k.hoursWorked.toFixed(1)],
          ['Revenue / ora (€)', String(k.revenuePerHour)],
          ['ARPC (€)', String(k.revenuePerActiveClient)],
          ['Clienti attivi (roster)', String(k.activeClients)],
          ['Nuovi / persi (periodo)', `${k.clientsNewInPeriod} / ${k.clientsLostInPeriod}`],
          ['Churn proxy (%)', k.churnRatePct.toFixed(1)],
          ['Aderenza app. (%)', k.adherencePct.toFixed(1)],
          ['No-show (app. univoci)', String(k.noShowCount)],
          ['Score sintetico', String(k.compositeScore)],
        ],
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      if (report.progressDistribution.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Distribuzione variazione peso', margin, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        autoTable(doc, {
          startY: y,
          head: [['Fascia', 'N', '%']],
          body: report.progressDistribution.map((b) => [
            b.band,
            String(b.count),
            `${b.percentage}%`,
          ]),
          ...base,
        })
        y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10
      }

      if (report.paymentMix.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Mix pagamenti', margin, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        autoTable(doc, {
          startY: y,
          head: [['Tipo', '€', '%']],
          body: report.paymentMix.map((m) => [m.key, m.amount.toFixed(0), `${m.percentage}%`]),
          ...base,
        })
        y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10
      }

      if (report.insights.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Insight', margin, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        autoTable(doc, {
          startY: y,
          head: [['Nota']],
          body: report.insights.map((t) => [t]),
          ...base,
        })
        y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.text('Trend giornaliero', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [
          [
            'Data',
            'Incasso €',
            'Ore',
            'Allen.',
            'Pren.',
            'Eseg.',
            'Ann.',
            'Canc.',
            'No-show',
            'Nuovi',
            'Persi',
          ],
        ],
        body: report.daily.map((d) => [
          d.day,
          d.revenue.toFixed(2),
          d.hours.toFixed(1),
          String(d.allenamenti),
          String(d.prenotati),
          String(d.eseguiti),
          String(d.annullati),
          String(d.cancellati),
          String(d.noShow),
          String(d.clientsNew),
          String(d.clientsLost),
        ]),
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      doc.setFont('helvetica', 'bold')
      doc.text('Top atleti (revenue)', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Atleta', '€', 'Allenamenti', 'Var. peso %']],
        body: report.athletes
          .slice(0, 30)
          .map((a) => [
            a.displayName,
            a.revenue.toFixed(0),
            String(a.workoutCount),
            a.weightChangePct != null ? a.weightChangePct.toFixed(1) : '—',
          ]),
        ...base,
      })
      y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

      doc.setFont('helvetica', 'bold')
      doc.text('Alert', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: y,
        head: [['Voce', 'Livello', 'Nota']],
        body: report.alerts.map((a) => [a.label, a.level, a.hint]),
        ...base,
      })
    },
  })
}

/**
 * @deprecated Solo per script/template legacy; UI usa `buildAnalyticsReportPdfBlob`.
 */
export function exportAnalyticsToCSV(data: AnalyticsData, filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilename = `22club-statistiche-${timestamp}.csv`

  const exportData: ExportData = []

  exportData.push({
    Sezione: 'RIEPILOGO',
    'Totale Allenamenti': data.summary.total_workouts,
    'Totale Documenti': data.summary.total_documents,
    'Ore Totali': data.summary.total_hours.toFixed(1),
    'Atleti Attivi': data.summary.active_athletes,
  } as Record<string, string | number | boolean | null>)

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
      Prenotati: day.prenotati,
      Eseguiti: day.eseguiti,
      Annullati: day.annullati,
      Cancellati: day.cancellati,
    } as Record<string, string | number | boolean | null>)
  })

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
 * @deprecated UI unificata su PDF; mantenuto per eventuali script.
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
        Prenotati: day.prenotati,
        Eseguiti: day.eseguiti,
        Annullati: day.annullati,
        Cancellati: day.cancellati,
      }) as Record<string, string | number | boolean | null>,
  )

  exportToCSV(exportData, filename || defaultFilename)
}

/**
 * @deprecated UI unificata su PDF; mantenuto per eventuali script.
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
