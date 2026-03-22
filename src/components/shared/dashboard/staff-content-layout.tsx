'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

export type StaffContentTheme = 'teal' | 'amber' | 'default'

const THEME_HEADER = {
  default: {
    iconBox: 'border border-white/10 bg-white/[0.04]',
    iconColor: 'text-primary',
    titleGradient: 'from-text-primary to-text-primary',
    badgeBorder: 'border-white/10',
    badgeBg: 'from-white/[0.04] to-white/[0.04]',
    badgeAccent: 'text-text-primary',
  },
  teal: {
    iconBox:
      'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 shadow-lg shadow-teal-500/10',
    iconColor: 'text-teal-400',
    titleGradient: 'from-teal-400 via-cyan-400 to-blue-400',
    badgeBorder: 'border-teal-500/40',
    badgeBg: 'from-teal-500/10 to-cyan-500/10',
    badgeAccent: 'text-teal-400',
  },
  amber: {
    iconBox:
      'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10',
    iconColor: 'text-amber-400',
    titleGradient: 'from-amber-400 via-orange-400 to-yellow-400',
    badgeBorder: 'border-amber-500/40',
    badgeBg: 'from-amber-500/10 to-orange-500/10',
    badgeAccent: 'text-amber-400',
  },
} as const

export type StaffContentLayoutProps = {
  /** Titolo principale (header) */
  title: string
  /** Mostra una freccia "Indietro" a sinistra del titolo */
  onBack?: () => void
  /** Sottotitolo/descrizione sotto il titolo */
  description?: string
  /** Icona React (es. <Users />) mostrata nel box accanto al titolo */
  icon?: ReactNode
  /** Tema: teal per nutrizionista, amber per massaggiatore */
  theme?: StaffContentTheme
  /** Contenuto della pagina */
  children: ReactNode
  /** Azioni (pulsanti/link) da mettere a destra nell'header */
  actions?: ReactNode
  /** ClassName sul contenitore interno (dopo header) */
  className?: string
}

/**
 * Layout condiviso per pagine staff (nutrizionista, massaggiatore):
 * wrapper full-height, contenitore max-w-[1800px], header con icona + titolo gradient + descrizione.
 * Stile allineato alla pagina Statistiche trainer.
 */
export function StaffContentLayout({
  title,
  onBack,
  description,
  icon: _icon,
  theme = 'teal',
  children,
  actions,
  className,
}: StaffContentLayoutProps) {
  const _t = THEME_HEADER[theme]
  return (
    <div className="relative min-h-dvh flex flex-col bg-transparent">
      <div
        className={cn(
          'flex-1 flex flex-col space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-[1800px] mx-auto w-full relative bg-transparent',
          'pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]',
          className,
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              {onBack != null && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Indietro"
                  className={cn(
                    'inline-flex items-center justify-center h-9 w-9 rounded-lg',
                    'border border-white/10 bg-white/[0.04]',
                    'hover:bg-white/5 transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-background focus:outline-none',
                  )}
                >
                  <ChevronLeft className={cn('h-4 w-4', _t.iconColor)} aria-hidden="true" />
                </button>
              )}
              <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-white break-words">
                {title}
              </h1>
            </div>
            {description != null && description !== '' && (
              <p className="text-white/90 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-0">
                {description}
              </p>
            )}
          </div>
          {actions != null && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto [&_button]:min-h-[44px] [&_button]:touch-manipulation [&_a]:min-h-[44px] [&_a]:touch-manipulation">
              {actions}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">{children}</div>
      </div>
    </div>
  )
}
