'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StaffContentTheme = 'teal' | 'amber'

const THEME_HEADER = {
  teal: {
    iconBox: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 shadow-lg shadow-teal-500/10',
    iconColor: 'text-teal-400',
    titleGradient: 'from-teal-400 via-cyan-400 to-blue-400',
    badgeBorder: 'border-teal-500/40',
    badgeBg: 'from-teal-500/10 to-cyan-500/10',
    badgeAccent: 'text-teal-400',
  },
  amber: {
    iconBox: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10',
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
  description,
  icon: _icon,
  theme = 'teal',
  children,
  actions,
  className,
}: StaffContentLayoutProps) {
  const t = THEME_HEADER[theme]
  return (
    <div className="relative min-h-dvh flex flex-col">
      <div
        className={cn(
          'flex-1 flex flex-col space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-[1800px] mx-auto w-full relative',
          'pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]',
          className,
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <h1
                className={cn(
                  'text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent break-words',
                  t.titleGradient,
                )}
              >
                {title}
              </h1>
            </div>
            {description != null && description !== '' && (
              <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-0.5 sm:mt-0">
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
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}
