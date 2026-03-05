// ============================================================
// Componente Statistiche Appuntamenti (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

interface AppointmentsStatsProps {
  stats: {
    total: number
    attivi: number
    completati: number
    annullati: number
    programmati: number
  }
  /** Tema colori: teal (default) per PT/dashboard, amber per massaggiatore */
  theme?: 'teal' | 'amber'
}

export function AppointmentsStats({ stats, theme = 'teal' }: AppointmentsStatsProps) {
  const totalBadge =
    theme === 'amber'
      ? 'flex items-center gap-2 rounded-lg bg-background-tertiary/50 px-3 py-2 border border-amber-500/20'
      : 'flex items-center gap-2 rounded-lg bg-background-tertiary/50 px-3 py-2 border border-teal-500/20'
  const totalDot = theme === 'amber' ? 'h-2 w-2 rounded-full bg-amber-400' : 'h-2 w-2 rounded-full bg-teal-400'
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className={totalBadge}>
        <div className={totalDot}></div>
        <span className="text-text-primary text-sm font-semibold">{stats.total}</span>
        <span className="text-text-secondary text-xs">totali</span>
      </div>
      {stats.completati > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 border border-green-500/30">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          <span className="text-green-400 text-sm font-semibold">{stats.completati}</span>
          <span className="text-text-secondary text-xs">completati</span>
        </div>
      )}
      {stats.programmati > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-background-tertiary/50 px-3 py-2 border border-white/40">
          <div className="h-2 w-2 rounded-full bg-white/60"></div>
          <span className="text-text-primary text-sm font-semibold">{stats.programmati}</span>
          <span className="text-text-secondary text-xs">programmati</span>
        </div>
      )}
      {stats.annullati > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 border border-orange-500/30">
          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
          <span className="text-orange-400 text-sm font-semibold">{stats.annullati}</span>
          <span className="text-text-secondary text-xs">annullati</span>
        </div>
      )}
    </div>
  )
}
