/**
 * Standard colore per grafici analytics (pagina Statistiche: vista trainer + organizzazione).
 * Serie allineate al dark theme teal/cyan; stati prenotazioni coerenti tra Recharts legacy e trainer.
 */
import type { CSSProperties } from 'react'

export const chartChrome = {
  grid: '#242A2E',
  axis: '#A5AFB4',
  tooltipBg: '#1a1f23',
  tooltipBorder: '#2d363c',
  tooltipLabel: '#e2e8f0',
  legend: '#A5AFB4',
} as const

export const chartSeries = {
  /** Serie principale (fatturato, linea KPI, “svolti”) */
  primary: '#2dd4bf',
  /** Seconda serie (ore, prenotazioni aperte) */
  secondary: '#38bdf8',
  /** Volume / aderenza / barre composte */
  tertiary: '#a78bfa',
  /** Annullati, attenzione */
  warning: '#f59e0b',
  /** Nuovi ingressi, esito positivo */
  positive: '#34d399',
  /** Uscite roster, stress */
  negative: '#fb7185',
  /** In attesa / neutro scuro */
  muted: '#64748b',
  /** Cancellati / neutro chiaro */
  mutedLight: '#94a3b8',
  /** No-show, evidenziazioni temporali */
  highlight: '#fbbf24',
} as const

/** Stessi significati del funnel appuntamenti (trainer + MultiTrend legacy). */
export const chartBookingStatus = {
  prenotati: chartSeries.muted,
  eseguiti: chartSeries.primary,
  annullati: chartSeries.warning,
  cancellati: chartSeries.mutedLight,
} as const

/** Torta e categorie generiche (ordine stabile). */
export const chartCategoricalPalette: readonly string[] = [
  chartSeries.primary,
  chartSeries.secondary,
  chartSeries.tertiary,
  chartSeries.highlight,
  chartSeries.negative,
  chartSeries.positive,
  chartSeries.mutedLight,
  chartSeries.warning,
]

export const analyticsChartTheme = {
  chrome: chartChrome,
  series: chartSeries,
  booking: chartBookingStatus,
  categorical: chartCategoricalPalette,
} as const

/** Componenti R,G,B di `chartSeries.primary` per `rgba(..., a)` (es. heatmap). */
export const chartHeatmapPrimaryRgb = '45, 212, 191' as const

export function chartTooltipContentStyle(): CSSProperties {
  return {
    backgroundColor: chartChrome.tooltipBg,
    border: `1px solid ${chartChrome.tooltipBorder}`,
    borderRadius: '8px',
    color: chartChrome.tooltipLabel,
    padding: '10px 12px',
  }
}

export function chartTooltipLabelStyle(): CSSProperties {
  return { color: chartChrome.tooltipLabel }
}
