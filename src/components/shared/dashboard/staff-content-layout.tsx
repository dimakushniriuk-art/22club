'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'

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
  /**
   * Mostra una freccia "Indietro" a sinistra del titolo.
   * Se omesso, viene mostrata automaticamente nelle pagine `/dashboard/*` (escluso `/dashboard`).
   */
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
  /** ClassName sul wrapper diretto dei children (es. flex-1 min-h-0 per contenuti full-height) */
  contentClassName?: string
  /** Se true, non renderizza la riga titolo/descrizione/azioni */
  hideHeader?: boolean
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
  icon,
  theme = 'teal',
  children,
  actions,
  className,
  contentClassName,
  hideHeader = false,
}: StaffContentLayoutProps) {
  const _t = THEME_HEADER[theme]
  const router = useRouter()
  const pathname = usePathname()

  const shouldAutoBack =
    pathname != null && pathname.startsWith('/dashboard/') && pathname !== '/dashboard'
  const handleAutoBack =
    onBack ??
    (shouldAutoBack
      ? () => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
            return
          }
          router.push('/dashboard')
        }
      : undefined)
  return (
    <div className="relative min-h-dvh flex flex-col bg-transparent">
      <div
        className={cn(
          'flex-1 flex flex-col space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-[1800px] mx-auto w-full relative bg-transparent',
          'pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {hideHeader ? (
          <h1 className="sr-only">{title}</h1>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-x-2 sm:gap-x-2.5">
              {handleAutoBack != null && <StaffHeaderBackButton onClick={handleAutoBack} />}
              {icon != null ? (
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    _t.iconBox,
                  )}
                  aria-hidden="true"
                >
                  <div className={cn('text-[18px] leading-none', _t.iconColor)}>{icon}</div>
                </div>
              ) : null}
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <h1 className="line-clamp-1 min-w-0 text-sm font-bold leading-tight tracking-tight text-white sm:text-base md:text-xl lg:text-2xl">
                  {title}
                </h1>
                {description != null && description !== '' ? (
                  <p className="line-clamp-1 min-w-0 text-xs leading-snug text-text-secondary sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            {actions != null && (
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto sm:justify-end [&_button]:min-h-[44px] [&_button]:touch-manipulation [&_a]:min-h-[44px] [&_a]:touch-manipulation">
                {actions}
              </div>
            )}
          </div>
        )}
        <div className={cn('flex flex-col gap-4 sm:gap-6 md:gap-8', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
