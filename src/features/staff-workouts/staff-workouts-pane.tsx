'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AthleteAllenamentiPreviewProvider } from '@/contexts/athlete-allenamenti-preview-context'
import { WorkoutsPaneProvider, type WorkoutsPaneView } from '@/contexts/workouts-pane-context'
import { AllenamentiHomePageContent } from '@/features/athlete-allenamenti'
import { AllenamentiOggiPageContent } from '@/features/live-workout-session'
import { SchedaAllenamentoContent } from '@/features/athlete-allenamenti'
import { GiornoPreviewContent } from '@/features/athlete-allenamenti'
import { EsercizioDetailPageContent } from '@/features/athlete-allenamenti'
import { RiepilogoPageContent } from '@/features/athlete-allenamenti'
import {
  applyWorkoutsPaneViewToSearchParams,
  parseWorkoutsPaneView,
} from '@/features/staff-workouts/lib/workouts-pane-params'

type Props = {
  slotId: 'p1' | 'p2'
  athleteProfileId: string
  /** Da evento agenda dello slot: se false, completamento non forza flusso coachato. */
  countCompletionAsCoached?: boolean
  onDirtyChange?: (dirty: boolean) => void
  onDismissSlot?: () => void
  onWorkoutCompleted?: (args: {
    athleteProfileId: string
    withTrainer: boolean
    workoutLogId?: string
    finalizeAgendaAppointment?: boolean
  }) => void | boolean | Promise<void | boolean>
}

export function WorkoutsPane({
  slotId,
  athleteProfileId,
  countCompletionAsCoached = false,
  onDirtyChange,
  onDismissSlot,
  onWorkoutCompleted,
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const view = useMemo(() => {
    const prefix = slotId === 'p1' ? 'p1' : 'p2'
    const kind = searchParams.get(`${prefix}view`)?.trim() ?? 'home'
    return parseWorkoutsPaneView(kind, new URLSearchParams(searchParams.toString()), slotId)
  }, [searchParams, slotId])

  const hrefFor = useCallback(
    (next: WorkoutsPaneView) => {
      const p = new URLSearchParams(searchParams.toString())
      applyWorkoutsPaneViewToSearchParams(slotId, next, p)
      const q = p.toString()
      return q ? `${pathname}?${q}` : pathname
    },
    [pathname, searchParams, slotId],
  )

  const navigateTo = useCallback(
    (next: WorkoutsPaneView) => {
      router.replace(hrefFor(next), { scroll: false })
    },
    [hrefFor, router],
  )

  const ctx = useMemo(
    () => ({
      slotId,
      athleteProfileId,
      view,
      hrefFor,
      navigateTo,
      dismissSlot: onDismissSlot,
      setDirty: onDirtyChange,
      onWorkoutCompleted,
      countCompletionAsCoached,
    }),
    [
      slotId,
      athleteProfileId,
      view,
      hrefFor,
      navigateTo,
      onDismissSlot,
      onDirtyChange,
      onWorkoutCompleted,
      countCompletionAsCoached,
    ],
  )

  // pathBase rimane consistente ma non viene più usato per la navigazione in Workouts:
  // le pagine allenamenti useranno il WorkoutsPaneContext quando presente.
  const pathBase = '/home/allenamenti'

  return (
    <AthleteAllenamentiPreviewProvider value={{ subjectProfileId: athleteProfileId, pathBase }}>
      <WorkoutsPaneProvider value={ctx}>
        {view.kind === 'oggi' ? (
          <AllenamentiOggiPageContent />
        ) : view.kind === 'scheda' ? (
          <SchedaAllenamentoContent
            workoutPlanIdOverride={view.workoutPlanId}
            routeParams={Promise.resolve({ id: view.workoutPlanId })}
          />
        ) : view.kind === 'giorno' ? (
          <GiornoPreviewContent
            workoutPlanIdOverride={view.workoutPlanId}
            dayIdOverride={view.dayId}
            routeParams={Promise.resolve({ id: view.workoutPlanId, dayId: view.dayId })}
          />
        ) : view.kind === 'esercizio' ? (
          <EsercizioDetailPageContent
            exerciseIdOverride={view.exerciseId}
            routeParams={Promise.resolve({ exerciseId: view.exerciseId })}
          />
        ) : view.kind === 'riepilogo' ? (
          <RiepilogoPageContent workoutLogIdOverride={view.workoutLogId} />
        ) : (
          <AllenamentiHomePageContent />
        )}
      </WorkoutsPaneProvider>
    </AthleteAllenamentiPreviewProvider>
  )
}
