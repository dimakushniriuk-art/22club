'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { ArrowLeft, Activity, BarChart3, Calendar } from 'lucide-react'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import dynamic from 'next/dynamic'

const CARD_CHART_STYLE = {
  borderColor: 'rgba(2, 179, 191, 0.35)',
  background: 'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(2,179,191,0.08) inset',
} as const
const HEADER_STYLE = {
  border: '1px solid rgba(2, 179, 191, 0.4)',
  background:
    'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.1) inset',
} as const
const HEADER_OVERLAY_STYLE = {
  background:
    'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
} as const
const HEADER_ICON_STYLE = {
  backgroundColor: 'rgba(2, 179, 191, 0.2)',
  border: '1px solid rgba(2, 179, 191, 0.35)',
} as const

const WorkoutExerciseCharts = dynamic(
  () =>
    import('@/components/dashboard/workout-exercise-charts').then((mod) => ({
      default: mod.WorkoutExerciseCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <Card className="relative overflow-hidden rounded-xl border backdrop-blur-md" style={CARD_CHART_STYLE}>
        <CardContent className="relative z-10 p-4 min-[834px]:p-6">
          <Skeleton className="mb-3 h-4 w-28" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    ),
  },
)

function StatisticheAllenamentiContent() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Type guard per user - isValidUser non esiste nel context, usiamo user && isValidProfile(user)
  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  // Calcola athleteUserId (user_id)
  const athleteUserId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) {
      return null
    }
    return isValidUUID(user.user_id) ? user.user_id : null
  }, [user?.user_id, isValidUserProfile])

  const { data, isLoading, error } = useWorkoutExerciseStats(athleteUserId)
  const handleBack = useCallback(() => router.back(), [router])

  // Redirect se non autenticato (solo dopo che loading è finito)
  useEffect(() => {
    if (!loading && (!isValidUser || !user || !isValidProfile(user))) {
      router.push('/login')
    }
  }, [isValidUser, user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <Card className="relative overflow-hidden rounded-xl border backdrop-blur-md" style={CARD_CHART_STYLE}>
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-4 w-28" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidUser || !user || !isValidProfile(user)) {
    return null
  }

  const showStats = data && data.total_exercises > 0

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-6">
        {/* Header — stile Nutrizionista: glass + accento teal/cyan */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
          style={HEADER_STYLE}
        >
          <div className="absolute inset-0 rounded-2xl opacity-70" style={HEADER_OVERLAY_STYLE} aria-hidden />
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
                <Activity className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Statistiche Allenamenti
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  Pesi, tempi e progressi per esercizio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats — card compatte come Nutrizionista (solo se ci sono dati) */}
        {showStats && (
          <div className="grid grid-cols-1 min-[834px]:grid-cols-3 gap-3 min-[834px]:gap-4">
            <Card
              className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
              style={{
                background:
                  'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
              }}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Esercizi in scheda
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                    {data.total_exercises}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
              style={{
                background:
                  'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
              }}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Sessioni totali
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                    {data.total_sessions}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
              style={{
                background:
                  'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
              }}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Periodo
                  </p>
                  <p className="text-text-primary line-clamp-2 text-sm font-medium min-[834px]:text-base">
                    {data.date_range.from && data.date_range.to
                      ? `${new Date(data.date_range.from).toLocaleDateString('it-IT')} - ${new Date(data.date_range.to).toLocaleDateString('it-IT')}`
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content — stile Nutrizionista */}
        <Card
          className="relative overflow-hidden rounded-xl border backdrop-blur-md"
          style={{
            borderColor: 'rgba(2, 179, 191, 0.35)',
            background:
              'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(2,179,191,0.08) inset',
          }}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(2,179,191,0.1) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <CardHeader
            className="relative z-10 border-b px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4"
            style={{ borderColor: 'rgba(2, 179, 191, 0.2)' }}
          >
            <CardTitle className="text-base font-bold text-text-primary md:text-lg">
              Grafici per esercizio
            </CardTitle>
            <p className="text-text-tertiary mt-0.5 text-xs">
              Andamento pesi e progressi negli allenamenti completati
            </p>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4">
            {isLoading ? (
              <>
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="h-48 w-full" />
              </>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                <div className="mb-3 text-4xl opacity-50">❌</div>
                <p className="text-text-primary text-sm font-medium min-[834px]:text-base">
                  Errore nel caricamento
                </p>
                <p className="text-text-tertiary text-xs min-[834px]:text-sm mt-1.5">
                  Riprova più tardi
                </p>
              </div>
            ) : !data || data.total_exercises === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 min-[834px]:h-16 min-[834px]:w-16">
                  <BarChart3 className="h-7 w-7 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8" />
                </div>
                <p className="text-text-primary text-sm font-semibold min-[834px]:text-base">
                  Nessun esercizio completato ancora
                </p>
                <p className="text-text-tertiary mt-1 text-xs min-[834px]:text-sm">
                  Completa alcuni allenamenti per vedere le statistiche dei pesi utilizzati.
                </p>
              </div>
            ) : (
              <WorkoutExerciseCharts data={data} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StatisticheAllenamentiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
          <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
            <div
              className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
              style={{
                border: '1px solid rgba(2, 179, 191, 0.4)',
                background:
                  'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)',
              }}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 animate-pulse rounded-xl bg-background-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-40 animate-pulse rounded bg-background-secondary" />
                  <div className="h-3 w-32 animate-pulse rounded bg-background-secondary" />
                </div>
              </div>
            </div>
            <Card
              className="relative overflow-hidden rounded-xl border backdrop-blur-md"
              style={{
                borderColor: 'rgba(2, 179, 191, 0.35)',
                background: 'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
              }}
            >
              <CardContent className="p-4 min-[834px]:p-6">
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <StatisticheAllenamentiContent />
    </Suspense>
  )
}
