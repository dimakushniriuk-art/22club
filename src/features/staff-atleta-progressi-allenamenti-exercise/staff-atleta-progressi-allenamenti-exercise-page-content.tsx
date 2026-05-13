'use client'

import { useMemo, useState } from 'react'
import { Dumbbell, Lock, Unlock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { WorkoutExerciseStoricoContent } from '@/components/progressi/workout-exercise-storico-content'
import {
  StaffAthleteProgressBootstrap,
  StaffAthleteProgressSubpageFrame,
  StaffAthleteProgressSuspensePage,
  type StaffAthleteProgressReadyContext,
} from '@/features/staff-athlete-progress'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import { useResolvedParams } from '@/lib/next/use-resolved-params'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

function EsercizioContent({
  profileId,
  athleteUserId,
  displayName,
  exerciseId,
}: StaffAthleteProgressReadyContext & { exerciseId: string }) {
  const { data: statsData } = useWorkoutExerciseStats(athleteUserId, { profileId })
  const [editUnlocked, setEditUnlocked] = useState(false)

  const exerciseTitle = useMemo(() => {
    if (!exerciseId) return 'Esercizio'
    return (
      statsData?.exercises.find((e) => e.exercise_id === exerciseId)?.exercise_name?.trim() ||
      'Esercizio'
    )
  }, [exerciseId, statsData?.exercises])

  const backHref = `/dashboard/atleti/${profileId}/progressi/allenamenti`

  return (
    <StaffAthleteProgressSubpageFrame
      header={{
        backHref,
        backAriaLabel: 'Torna alle statistiche allenamenti',
        title: `${exerciseTitle} — ${displayName || 'Atleta'}`,
        description: 'Valori registrati per sessione',
      }}
    >
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
              profileId={profileId}
              actionsUnlocked={editUnlocked}
            />
          )}
        </CardContent>
      </Card>
    </StaffAthleteProgressSubpageFrame>
  )
}

function EsercizioBody({
  routeParams,
}: {
  routeParams: Promise<{ id: string; exerciseId: string }>
}) {
  const resolved = useResolvedParams(routeParams)
  const rawExerciseId = typeof resolved.exerciseId === 'string' ? resolved.exerciseId : ''
  const exerciseId = useMemo(() => {
    try {
      return decodeURIComponent(rawExerciseId)
    } catch {
      return rawExerciseId
    }
  }, [rawExerciseId])

  return (
    <StaffAthleteProgressBootstrap routeParams={routeParams}>
      {(context) => <EsercizioContent {...context} exerciseId={exerciseId} />}
    </StaffAthleteProgressBootstrap>
  )
}

export function StaffAtletaProgressiAllenamentiEsercizioPageContent({
  params,
}: {
  params: Promise<{ id: string; exerciseId: string }>
}) {
  return (
    <StaffAthleteProgressSuspensePage params={params}>
      {({ routeParams }) => <EsercizioBody routeParams={routeParams} />}
    </StaffAthleteProgressSuspensePage>
  )
}
