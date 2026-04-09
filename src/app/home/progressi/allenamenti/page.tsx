'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { BarChart3 } from 'lucide-react'
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
    loading: () => null,
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
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24">
          <PageHeaderFixed
            variant="chat"
            title="Statistiche Allenamenti"
            subtitle="Pesi, tempi e progressi per esercizio"
            onBack={handleBack}
          />
        </div>
      </div>
    )
  }

  if (!isValidUser || !user || !isValidProfile(user)) {
    return null
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24">
        <PageHeaderFixed
          variant="chat"
          title="Statistiche Allenamenti"
          subtitle="Pesi, tempi e progressi per esercizio"
          onBack={handleBack}
        />

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
            {isLoading ? null : error ? (
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
              <WorkoutExerciseCharts data={data} detailBasePath="/home/progressi/allenamenti" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StatisticheAllenamentiPage() {
  return (
    <Suspense fallback={null}>
      <StatisticheAllenamentiContent />
    </Suspense>
  )
}
