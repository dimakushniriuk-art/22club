// ============================================================
// Componente Statistiche Rapide Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Calendar, TrendingUp, Activity } from 'lucide-react'

interface AthleteStatsCardsProps {
  stats: {
    allenamenti_mese: number
    progress_score: number
    allenamenti_totali: number
    lezioni_rimanenti: number
  }
  /** Se true, nasconde le icon box decorative in angolo (solo pagina profilo). */
  hideIcons?: boolean
  /** Se true, mostra “—” al posto dei numeri (niente skeleton). */
  loading?: boolean
}

const CARD_DS =
  'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors duration-200 hover:border-white/15 active:scale-[0.98] touch-manipulation'
const ICON_BOX =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-10 sm:w-10'

export function AthleteStatsCards({
  stats,
  hideIcons = false,
  loading = false,
}: AthleteStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 min-[834px]:gap-4">
      <Card variant="default" className={CARD_DS}>
        <CardContent className="relative p-3 text-center sm:p-4">
          {!hideIcons && (
            <div className={`absolute right-1.5 top-1.5 ${ICON_BOX}`}>
              <Calendar className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
            </div>
          )}
          <div className="relative z-10 text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
            {loading ? '—' : stats.allenamenti_mese}
          </div>
          <div className="relative z-10 mt-0.5 text-[11px] font-medium leading-tight text-text-secondary sm:text-xs">
            Allenamenti mese
          </div>
        </CardContent>
      </Card>
      <Card variant="default" className={CARD_DS}>
        <CardContent className="relative p-3 text-center sm:p-4">
          {!hideIcons && (
            <div className={`absolute right-1.5 top-1.5 ${ICON_BOX}`}>
              <TrendingUp className="h-4 w-4 text-state-valid sm:h-5 sm:w-5" />
            </div>
          )}
          <div className="relative z-10 text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
            {loading ? '—' : stats.lezioni_rimanenti}
          </div>
          <div className="relative z-10 mt-0.5 text-[11px] font-medium leading-tight text-text-secondary sm:text-xs">
            Lezioni rimanenti
          </div>
        </CardContent>
      </Card>
      <Card variant="default" className={CARD_DS}>
        <CardContent className="relative p-3 text-center sm:p-4">
          {!hideIcons && (
            <div className={`absolute right-1.5 top-1.5 ${ICON_BOX}`}>
              <Activity className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
            </div>
          )}
          <div className="relative z-10 text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
            {loading ? '—' : stats.allenamenti_totali}
          </div>
          <div className="relative z-10 mt-0.5 text-[11px] font-medium leading-tight text-text-secondary sm:text-xs">
            Totale sessioni
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
