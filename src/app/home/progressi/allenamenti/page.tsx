'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { Activity, BarChart3, Calendar } from 'lucide-react'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import dynamic from 'next/dynamic'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

const WorkoutExerciseCharts = dynamic(
  () =>
    import('@/components/dashboard/workout-exercise-charts').then((mod) => ({
      default: mod.WorkoutExerciseCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <Card className={`relative overflow-hidden ${CARD_DS}`}>
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
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-24">
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
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
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-24">
        <PageHeaderFixed
          title="Statistiche Allenamenti"
          subtitle="Pesi, tempi e progressi per esercizio"
          onBack={handleBack}
          icon={<Activity className="h-5 w-5 text-cyan-400" />}
        />

        {showStats && (
          <div className="grid grid-cols-1 min-[834px]:grid-cols-3 gap-3 min-[834px]:gap-4">
            <Card className={`relative overflow-hidden ${CARD_DS}`}>
              <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-l-lg" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Esercizi in scheda
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-text-primary min-[834px]:text-2xl">
                    {data.total_exercises}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`relative overflow-hidden ${CARD_DS}`}>
              <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-l-lg" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Sessioni totali
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-text-primary min-[834px]:text-2xl">
                    {data.total_sessions}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`relative overflow-hidden ${CARD_DS}`}>
              <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-l-lg" aria-hidden />
              <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
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

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
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
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-16 min-[834px]:w-16">
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
          <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-24 sm:px-5 min-[834px]:px-6 min-[834px]:pt-24">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 animate-pulse rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
              </div>
            </div>
            <Card className={`relative overflow-hidden ${CARD_DS}`}>
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
