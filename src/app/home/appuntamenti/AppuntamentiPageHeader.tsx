'use client'

import { Button } from '@/components/ui'
import { Calendar, ArrowLeft } from 'lucide-react'

interface AppuntamentiPageHeaderProps {
  title?: string
  subtitle?: string
  onBack: () => void
  /** Se true aggiunge mb-4 (per vista atleta con contenuto sotto). Default false. */
  withBottomMargin?: boolean
}

const DEFAULT_TITLE = 'I miei Appuntamenti'
const DEFAULT_SUBTITLE = 'Visualizza i tuoi appuntamenti programmati'

export function AppuntamentiPageHeader({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onBack,
  withBottomMargin = false,
}: AppuntamentiPageHeaderProps) {
  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]' +
        (withBottomMargin ? ' mb-4' : '')
      }
    >
      <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
      <div className="relative z-10 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
          onClick={onBack}
          aria-label="Indietro"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
          <Calendar className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">{title}</h1>
          <p className="text-xs text-text-tertiary line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </header>
  )
}
