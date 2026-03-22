/**
 * Design colorato — Token riutilizzabili
 * Riferimento: /dashboard/statistiche
 * Uso: dashboard analytics, KPI, grafici, report.
 * @see docs/DESIGN_COLORATO.md
 */

export const designColorato = {
  /** Palette nomi per KPI/card */
  palette: {
    teal: {
      border: 'border-teal-500/40',
      gradient: 'from-teal-500/20 via-cyan-500/10 to-teal-500/20',
      shadow: 'shadow-teal-500/20',
      bg: 'bg-teal-500/20',
      text: 'text-teal-400',
    },
    yellow: {
      border: 'border-yellow-500/40',
      gradient: 'from-yellow-500/20 via-orange-500/10 to-yellow-500/20',
      shadow: 'shadow-yellow-500/20',
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
    },
    green: {
      border: 'border-green-500/40',
      gradient: 'from-green-500/20 via-emerald-500/10 to-green-500/20',
      shadow: 'shadow-green-500/20',
      bg: 'bg-green-500/20',
      text: 'text-green-400',
    },
    purple: {
      border: 'border-purple-500/40',
      gradient: 'from-purple-500/20 via-pink-500/10 to-purple-500/20',
      shadow: 'shadow-purple-500/20',
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
    },
    blue: {
      border: 'border-blue-500/40',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      shadow: 'shadow-blue-500/20',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
    },
  },

  /** Header pagina (icon + titolo gradient) */
  header: {
    iconBox:
      'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 shadow-lg shadow-teal-500/10',
    title:
      'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent',
    subtitle: 'text-text-secondary text-sm sm:text-base',
    badge:
      'px-4 py-2 rounded-lg border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 text-sm text-text-primary font-medium shadow-md shadow-teal-500/10',
  },

  /** Card KPI base */
  kpiCard:
    'relative overflow-hidden rounded-xl border-2 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
  kpiIconBox: 'p-3 rounded-xl border shadow-md',
  kpiValue: 'text-3xl font-bold text-white drop-shadow-lg',
  kpiLabel: 'text-sm text-text-secondary font-medium',

  /** Card grafici (teal/cyan) */
  chartCard:
    'relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300',
  chartCardOverlay:
    'absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5',
  chartCardIconBox:
    'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30',
  chartCardTitle:
    'text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent',

  /** Card Performance / Dettagli (blue-indigo) */
  performanceCard:
    'relative overflow-hidden rounded-xl border-2 border-blue-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300',
  performanceCardOverlay:
    'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5',
  performanceCardIconBox:
    'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30',
  performanceCardTitle:
    'text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent',
  performanceRow:
    'flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200',

  /** Colori per grafici (pie/bar) */
  chartColors: [
    '#14B8A6',
    '#F59E0B',
    '#10B981',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F97316',
  ] as const,
} as const

export type DesignColoratoPaletteKey = keyof typeof designColorato.palette
