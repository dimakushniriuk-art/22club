'use client'

import type { ComponentType } from 'react'
import { memo, Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Apple, ArrowLeft, Salad, Utensils } from 'lucide-react'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'

const logger = createLogger('app:home:nutrizionista:page')

const _STAT_ICON_KEYS = ['utensils', 'apple'] as const
type StatIconKey = (typeof _STAT_ICON_KEYS)[number]

const STAT_ICONS: Record<StatIconKey, ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  apple: Apple,
}

const StatCard = memo(function StatCard({
  iconKey,
  label,
  value,
  valueSubtext,
}: {
  iconKey: StatIconKey
  label: string
  value: string | number
  valueSubtext?: string
}) {
  const Icon = STAT_ICONS[iconKey]
  const isZero = value === 0 || value === '0'
  return (
    <Card
      className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
      style={CARD_STATS_STYLE}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
      <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
          <Icon className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {label}
          </p>
          <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
            {value}
          </p>
          {isZero && valueSubtext && (
            <p className="mt-0.5 truncate text-[10px] text-text-tertiary">{valueSubtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

const PAGE_WRAPPER_CLASS =
  'flex min-h-0 flex-1 flex-col overflow-auto bg-background px-4 py-5 pb-24 safe-area-inset-bottom'

const HEADER_STYLE = {
  border: '1px solid rgba(2, 179, 191, 0.4)',
  background: 'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.1) inset',
} as const
const HEADER_OVERLAY_STYLE = {
  background: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
} as const
const HEADER_ICON_STYLE = {
  backgroundColor: 'rgba(2, 179, 191, 0.2)',
  border: '1px solid rgba(2, 179, 191, 0.35)',
} as const
const CARD_STATS_STYLE = {
  background: 'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
} as const
const CARD_MAIN_STYLE = {
  borderColor: 'rgba(2, 179, 191, 0.35)',
  background: 'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(2,179,191,0.08) inset',
} as const
const CARD_MAIN_OVERLAY_STYLE = {
  background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(2,179,191,0.1) 0%, transparent 60%)',
} as const
const CARD_HEADER_BORDER_STYLE = { borderColor: 'rgba(2, 179, 191, 0.2)' } as const

const AthleteNutritionTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteNutritionTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento nutrizione..." size="md" />,
  },
)

function NutrizionistaPageContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const isValidUser = user && isValidProfile(user)

  const athleteUserId = useMemo(() => {
    if (!isValidUser || !user?.user_id) return null
    return isValidUUID(user.user_id) ? user.user_id : null
  }, [user?.user_id, isValidUser])

  useEffect(() => {
    if (!authLoading && !isValidUser) {
      logger.warn('Utente non autenticato, redirect a /login')
      router.push('/login')
    }
  }, [authLoading, isValidUser, router])

  const handleBack = useCallback(() => router.back(), [router])
  const handleGoHome = useCallback(() => router.push('/home'), [router])

  // TODO: sostituire con useAthleteNutritionStats(athleteUserId) quando disponibile
  const pianiAttivi = 0
  const consigli = 0

  if (authLoading) {
    return (
      <div className={PAGE_WRAPPER_CLASS}>
        <LoadingState message="Caricamento..." size="md" />
      </div>
    )
  }

  if (!isValidUser || !athleteUserId) {
    return (
      <div className={PAGE_WRAPPER_CLASS}>
        <ErrorState
          title="Errore di autenticazione"
          message="Non hai i permessi per accedere a questa pagina."
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={handleGoHome} variant="outline" className="min-h-[44px] text-sm md:text-base">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Torna alla Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-6">
        {/* Header - glass + accento teal */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
          style={HEADER_STYLE}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-70"
            style={HEADER_OVERLAY_STYLE}
            aria-hidden
          />
          <div className="relative z-10 flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary transition-colors duration-200 hover:bg-primary/15 hover:text-primary"
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl min-[834px]:h-14 min-[834px]:w-14"
                style={HEADER_ICON_STYLE}
              >
                <Salad className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Nutrizionista
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  Consigli alimentari personalizzati
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - card compatte con sfondo colorato trasparente */}
        <div className="grid grid-cols-2 gap-3 min-[834px]:gap-4">
          <StatCard
            iconKey="utensils"
            label="Piani Attivi"
            value={pianiAttivi}
            valueSubtext="Nessun piano attivo"
          />
          <StatCard
            iconKey="apple"
            label="Consigli"
            value={consigli}
            valueSubtext="Nessun consiglio ancora"
          />
        </div>

        {/* Main Content - Piano Nutrizionale, contenuto esteso senza scroll interno */}
        <Card
          className="relative overflow-hidden rounded-xl border backdrop-blur-md"
          style={CARD_MAIN_STYLE}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-60"
            style={CARD_MAIN_OVERLAY_STYLE}
            aria-hidden
          />
          <CardHeader
            className="relative z-10 border-b px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4"
            style={CARD_HEADER_BORDER_STYLE}
          >
            <CardTitle className="text-base font-bold text-text-primary md:text-lg">
              Piano Nutrizionale
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4">
            <Suspense fallback={<LoadingState message="Caricamento dati nutrizione..." size="sm" />}>
              <AthleteNutritionTab athleteId={athleteUserId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NutrizionistaPage() {
  return (
    <Suspense fallback={<LoadingState message="Caricamento pagina nutrizionista..." size="md" />}>
      <NutrizionistaPageContent />
    </Suspense>
  )
}
