'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'
import { useAuth } from '@/providers/auth-provider'
import { getDefaultAppPathForRole } from '@/lib/utils/role-redirect-paths'

type StaffContentTheme = 'teal' | 'amber' | 'default'

/** Classi titolo (h1) per tema: `teal` e `default` allineati al look attuale; `amber` accento documentato staff massaggiatore. */
const STAFF_CONTENT_THEME_TITLE_CLASS: Record<StaffContentTheme, string> = {
  teal: 'text-white',
  default: 'text-white',
  amber:
    'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent',
}

type StaffContentLayoutProps = {
  /** Titolo principale (header) */
  title: string
  /**
   * Mostra una freccia "Indietro" a sinistra del titolo.
   * Se omesso, viene mostrata automaticamente nelle pagine `/dashboard/*` (escluso `/dashboard`).
   * Il controllo usa `StaffHeaderBackButton` in variante **solo `onClick`** (mai `href` da questo layout).
   */
  onBack?: () => void
  /** Sottotitolo/descrizione sotto il titolo */
  description?: string
  /** Tema titolo header: `teal`/`default` = bianco attuale; `amber` = gradiente leggero su h1. */
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
 * Shell canonica della dashboard **staff**: wrapper full-height, contenitore a max-width,
 * header integrato (titolo, descrizione, azioni, indietro opzionale via `StaffHeaderBackButton` solo `onClick`).
 *
 * **Contratto confine header (staff vs atleta / view speciali):** questo componente è la shell
 * **e** l’header principale delle route staff dentro il layout dashboard. Per viste atleta, home,
 * embed e altre fuori dalla shell staff usare `PageHeaderFixed` (`@/components/layout/page-header-fixed`).
 * `StaffAthleteSubpageHeader` non sostituisce `PageHeaderFixed`: è la riga header **sottopagina**
 * da comporre **dentro** questa shell (drill-down staff→atleta), non l’header chrome delle route atleta.
 */
export function StaffContentLayout({
  title,
  onBack,
  description,
  theme = 'teal',
  children,
  actions,
  className,
  contentClassName,
  hideHeader = false,
}: StaffContentLayoutProps) {
  const titleThemeClass = STAFF_CONTENT_THEME_TITLE_CLASS[theme]
  const router = useRouter()
  const pathname = usePathname()
  const { role } = useAuth()

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
          router.push(getDefaultAppPathForRole(role) ?? '/dashboard')
        }
      : undefined)
  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col bg-transparent">
      <div
        className={cn(
          'relative mx-auto flex w-full min-w-0 flex-1 flex-col space-y-4 bg-transparent max-w-[min(100%,2160px)] sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6',
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
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <h1
                  className={cn(
                    'line-clamp-2 min-w-0 text-fluid-shell-title font-bold tracking-tight sm:line-clamp-1',
                    titleThemeClass,
                  )}
                >
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
        <div
          className={cn(
            'flex min-h-0 flex-col space-y-4 sm:space-y-6 md:space-y-8',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
