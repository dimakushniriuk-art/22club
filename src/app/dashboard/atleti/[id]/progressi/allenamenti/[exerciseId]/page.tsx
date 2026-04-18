'use client'

import { Suspense, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Dumbbell, Lock, Unlock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { WorkoutExerciseStoricoContent } from '@/components/progressi/workout-exercise-storico-content'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

function StoricoBody() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null
  const rawExerciseId = typeof params?.exerciseId === 'string' ? params.exerciseId : ''
  const exerciseId = useMemo(() => {
    try {
      return decodeURIComponent(rawExerciseId)
    } catch {
      return rawExerciseId
    }
  }, [rawExerciseId])

  const { athlete, athleteUserId, loading, error, loadAthleteData } = useAthleteProfileData(
    id ?? '',
  )
  const { data: statsData } = useWorkoutExerciseStats(athleteUserId)
  const [editUnlocked, setEditUnlocked] = useState(false)

  const exerciseTitle = useMemo(() => {
    if (!exerciseId) return 'Esercizio'
    return (
      statsData?.exercises.find((e) => e.exercise_id === exerciseId)?.exercise_name?.trim() ||
      'Esercizio'
    )
  }, [exerciseId, statsData?.exercises])

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState
          message="ID atleta mancante"
          onRetry={() => router.push('/dashboard/clienti')}
        />
      </div>
    )
  }

  if (loading && !athlete) {
    return <StaffAthleteSegmentSkeleton />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const backHref = `/dashboard/atleti/${id}/progressi/allenamenti`
  const name = [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <StaffAthleteSubpageHeader
        backHref={backHref}
        backAriaLabel="Torna alle statistiche allenamenti"
        title={`${exerciseTitle} — ${name || 'Atleta'}`}
        description="Valori registrati per sessione"
      />

      <Card className={`relative overflow-hidden ${CARD_DS}`}>
        <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-base font-bold text-text-primary md:text-lg flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                Storico allenamenti
              </CardTitle>
              <p className="text-text-tertiary text-xs max-w-[72ch]">
                Dal più recente. Valori da serie su workout_sets collegate al log; massimo per
                giorno.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-text-secondary hover:text-primary"
              aria-pressed={editUnlocked}
              aria-label={
                editUnlocked
                  ? 'Blocca modifica ed eliminazione voci'
                  : 'Sblocca modifica ed eliminazione voci'
              }
              onClick={() => setEditUnlocked((v) => !v)}
            >
              {editUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 p-4 pt-3 sm:p-6 sm:pt-4 space-y-6">
          {!exerciseId ? (
            <p className="text-text-secondary text-sm py-6 text-center">
              Parametro esercizio mancante.
            </p>
          ) : (
            <WorkoutExerciseStoricoContent
              exerciseId={exerciseId}
              athleteUserId={athleteUserId}
              actionsUnlocked={editUnlocked}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffAtletaProgressiAllenamentiEsercizioPage() {
  return (
    <Suspense fallback={<StaffAthleteSegmentSkeleton />}>
      <StoricoBody />
    </Suspense>
  )
}
