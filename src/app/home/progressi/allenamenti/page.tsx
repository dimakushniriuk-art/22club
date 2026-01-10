'use client'

import { Suspense, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import dynamic from 'next/dynamic'

// Dynamic import per componenti grafici
const WorkoutExerciseCharts = dynamic(
  () =>
    import('@/components/dashboard/workout-exercise-charts').then((mod) => ({
      default: mod.WorkoutExerciseCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <Card
        variant="default"
        className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="relative z-10 p-4">
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

  // Redirect se non autenticato (solo dopo che loading è finito)
  useEffect(() => {
    if (!loading && (!isValidUser || !user || !isValidProfile(user))) {
      router.push('/login')
    }
  }, [isValidUser, user, loading, router])

  // Mostra loading durante il caricamento
  if (loading) {
    return null
  }

  if (!isValidUser || !user || !isValidProfile(user)) {
    return null
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/home/progressi">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              Statistiche Allenamenti
            </h1>
            <p className="text-text-secondary text-xs line-clamp-1">
              Analizza l&apos;andamento dei pesi utilizzati, tempi di esecuzione e progressi per
              ogni esercizio
            </p>
          </div>
        </div>
      </div>

      {/* Statistiche riepilogative - Design Moderno e Uniforme */}
      {data && data.total_exercises > 0 && (
        <div className="grid grid-cols-1 gap-2.5">
          <Card
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative z-10 p-3">
              <div className="text-text-secondary text-[10px] uppercase tracking-wide mb-1">
                Esercizi Eseguiti
              </div>
              <div className="text-teal-300 text-lg font-bold">{data.total_exercises}</div>
            </CardContent>
          </Card>
          <Card
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative z-10 p-3">
              <div className="text-text-secondary text-[10px] uppercase tracking-wide mb-1">
                Sessioni Totali
              </div>
              <div className="text-teal-300 text-lg font-bold">{data.total_sessions}</div>
            </CardContent>
          </Card>
          <Card
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative z-10 p-3">
              <div className="text-text-secondary text-[10px] uppercase tracking-wide mb-1">
                Periodo
              </div>
              <div className="text-white text-xs font-medium line-clamp-2">
                {data.date_range.from && data.date_range.to
                  ? `${new Date(data.date_range.from).toLocaleDateString('it-IT')} - ${new Date(data.date_range.to).toLocaleDateString('it-IT')}`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grafici esercizi */}
      {isLoading ? (
        <Card
          variant="default"
          className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="relative z-10 p-4">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card
          variant="default"
          className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="relative z-10 flex items-center justify-center py-8">
            <div className="text-center px-2">
              <div className="mb-3 text-4xl opacity-50">❌</div>
              <p className="text-text-secondary text-sm font-medium">Errore nel caricamento</p>
              <p className="text-text-tertiary text-xs mt-1.5">Riprova più tardi</p>
            </div>
          </CardContent>
        </Card>
      ) : !data || data.total_exercises === 0 ? (
        <Card
          variant="default"
          className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="relative z-10 flex items-center justify-center py-8">
            <div className="text-center px-2">
              <div className="mb-3 text-4xl opacity-50">📊</div>
              <p className="text-text-secondary text-sm font-medium">
                Nessun esercizio completato ancora
              </p>
              <p className="text-text-tertiary text-xs mt-1.5 line-clamp-2">
                Completa alcuni allenamenti per vedere le statistiche dei pesi utilizzati.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WorkoutExerciseCharts data={data} />
      )}
    </div>
  )
}

export default function StatisticheAllenamentiPage() {
  return (
    <Suspense
      fallback={
        <div
          className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
          style={{ overflow: 'auto' }}
        >
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10 flex items-center gap-2">
              <div className="bg-background-secondary h-8 w-8 animate-pulse rounded flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="bg-background-secondary h-5 w-40 animate-pulse rounded" />
                <div className="bg-background-secondary h-3 w-56 animate-pulse rounded" />
              </div>
            </div>
          </div>
          {/* Content Skeleton */}
          <Card
            variant="default"
            className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <CardContent className="relative z-10 p-4">
              <Skeleton className="mb-3 h-4 w-28" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <StatisticheAllenamentiContent />
    </Suspense>
  )
}
