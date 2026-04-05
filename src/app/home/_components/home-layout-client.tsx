'use client'

import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AthleteTopBarProvider,
  HomeAthleteStackHeadersProvider,
  useAthleteTopBarConfig,
} from '@/components/athlete'
import { useAuth } from '@/providers/auth-provider'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { LogoRefresh } from '@/components/athlete/logo-refresh'
import { NotificationToast } from '@/components/shared/ui/notification-toast'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'

interface HomeLayoutClientProps {
  children: ReactNode
}

const CYAN_LINE_STYLE = {
  background: 'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
} as const

/** Barra unificata: titolo/back a sinistra (da contesto pagina), logo a destra */
const HomeAthleteTopChrome = forwardRef<HTMLElement>(function HomeAthleteTopChrome(_, ref) {
  const config = useAthleteTopBarConfig()
  const hasBack = Boolean(config && (config.backHref != null || config.onBack != null))

  const backEl =
    config && hasBack ? (
      config.backHref != null && config.onBack == null ? (
        <StaffHeaderBackButton href={config.backHref} />
      ) : (
        <StaffHeaderBackButton onClick={config.onBack!} />
      )
    ) : null

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-white/10 bg-black safe-area-inset-top"
    >
      <div className="relative z-10 flex items-center gap-3 px-3 sm:px-4 min-[834px]:px-6 py-2.5 sm:py-3 min-[834px]:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {backEl}
          {config != null ? (
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-text-primary md:text-xl">
                {config.title}
              </h1>
              {config.subtitle != null && (
                <p className="line-clamp-1 text-[11px] text-text-tertiary">{config.subtitle}</p>
              )}
            </div>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}
        </div>
        <div className="shrink-0">
          <LogoRefresh />
        </div>
      </div>
      {config?.secondaryRow != null ? (
        <div className="relative z-10 border-t border-white/10 px-3 pb-2 pt-1.5 sm:px-4 min-[834px]:px-6 min-[834px]:pb-2.5 min-[834px]:pt-2">
          {config.secondaryRow}
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px"
        style={CYAN_LINE_STYLE}
      />
    </header>
  )
})

/** Altezza barra unificata (safe-area + riga titolo + logo) — per elementi fixed sotto (chat, ecc.) */
const HOME_UNIFIED_TOP_CSS = 'calc(env(safe-area-inset-top, 0px) + 4.75rem)'

/** Banner periodo di prova per atleti con stato trial */
function TrialBanner() {
  const { user, role } = useAuth()
  if (role !== 'athlete' || user?.stato !== 'trial') return null
  return (
    <div
      className="shrink-0 border-b border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-text-primary"
      role="status"
    >
      <span className="font-medium">Periodo di prova</span>
      {' — '}
      <Link href="/home/profilo" className="underline hover:no-underline">
        Completa il profilo
      </Link>
    </div>
  )
}

function HomeLayoutShell({ children }: HomeLayoutClientProps) {
  const pathname = usePathname()

  const shellRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<HTMLElement>(null)

  const shellStyle = useMemo(
    (): CSSProperties => ({
      ['--home-athlete-brand-top' as string]: HOME_UNIFIED_TOP_CSS,
    }),
    [],
  )

  useLayoutEffect(() => {
    const shellEl = shellRef.current
    const headerEl = chromeRef.current
    if (!shellEl || !headerEl) return
    const apply = () => {
      const h = Math.ceil(headerEl.getBoundingClientRect().height)
      shellEl.style.setProperty('--home-athlete-brand-top', `${h}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(headerEl)
    return () => ro.disconnect()
  }, [pathname])

  return (
    <div
      ref={shellRef}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-background"
      style={shellStyle}
    >
      <HomeAthleteTopChrome ref={chromeRef} />
      {/* Riserva altezza barra fissa (sincrona con --home-athlete-brand-top misurata sotto) */}
      <div
        className="shrink-0"
        style={{ height: 'var(--home-athlete-brand-top)' }}
        aria-hidden
      />

      <TrialBanner />

      <main
        className={
          pathname === '/home' || pathname === '/home/'
            ? 'relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto bg-background pt-4 sm:pt-6'
            : 'relative z-10 flex min-h-0 flex-1 flex-col bg-background pt-4 sm:pt-6'
        }
      >
        <HomeAthleteStackHeadersProvider value>
          <ErrorBoundary>{children}</ErrorBoundary>
        </HomeAthleteStackHeadersProvider>
      </main>

      <NotificationToast />
    </div>
  )
}

export function HomeLayoutClient({ children }: HomeLayoutClientProps) {
  return (
    <AthleteTopBarProvider>
      <HomeLayoutShell>{children}</HomeLayoutShell>
    </AthleteTopBarProvider>
  )
}
