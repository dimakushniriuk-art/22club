'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AthleteAllenamentiPreviewProvider } from '@/contexts/athlete-allenamenti-preview-context'
import {
  WorkoutsPaneProvider,
  type WorkoutsPaneView,
} from '@/contexts/workouts-pane-context'
import { AllenamentiHomePageContent } from '@/app/home/allenamenti/page'
import { AllenamentiOggiPageContent } from '@/app/home/allenamenti/oggi/page'
import { SchedaAllenamentoContent } from '@/app/home/allenamenti/[id]/page'
import { GiornoPreviewContent } from '@/app/home/allenamenti/[id]/giorno/[dayId]/page'
import { EsercizioDetailPageContent } from '@/app/home/allenamenti/esercizio/[exerciseId]/page'
import { RiepilogoPageContent } from '@/app/home/allenamenti/riepilogo/page'
import { isValidUUID } from '@/lib/utils/type-guards'

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

function parseView(kind: string, params: URLSearchParams, slotId: 'p1' | 'p2'): WorkoutsPaneView {
  const prefix = slotId === 'p1' ? 'p1' : 'p2'
  if (kind === 'oggi') {
    const workoutPlanId = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    const dayId = params.get(`${prefix}dayId`)?.trim() ?? ''
    const exerciseId = params.get(`${prefix}exerciseId`)?.trim() ?? ''
    return {
      kind: 'oggi',
      workoutPlanId: isValidUUID(workoutPlanId) ? workoutPlanId : undefined,
      dayId: isValidUUID(dayId) ? dayId : undefined,
      exerciseId: isValidUUID(exerciseId) ? exerciseId : undefined,
    }
  }
  if (kind === 'home') return { kind: 'home' }
  if (kind === 'scheda') {
    const id = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    return isValidUUID(id) ? { kind: 'scheda', workoutPlanId: id } : { kind: 'home' }
  }
  if (kind === 'giorno') {
    const planId = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    const dayId = params.get(`${prefix}dayId`)?.trim() ?? ''
    if (isValidUUID(planId) && isValidUUID(dayId)) return { kind: 'giorno', workoutPlanId: planId, dayId }
    return { kind: 'home' }
  }
  if (kind === 'esercizio') {
    const exerciseId = params.get(`${prefix}exerciseId`)?.trim() ?? ''
    return isValidUUID(exerciseId) ? { kind: 'esercizio', exerciseId } : { kind: 'home' }
  }
  if (kind === 'riepilogo') {
    const workoutLogId = params.get(`${prefix}workoutLogId`)?.trim() ?? ''
    return workoutLogId && isValidUUID(workoutLogId) ? { kind: 'riepilogo', workoutLogId } : { kind: 'riepilogo' }
  }
  return { kind: 'home' }
}

function viewToParams(slotId: 'p1' | 'p2', view: WorkoutsPaneView, base: URLSearchParams) {
  const prefix = slotId === 'p1' ? 'p1' : 'p2'
  base.set(`${prefix}view`, view.kind)
  base.delete(`${prefix}workoutPlanId`)
  base.delete(`${prefix}dayId`)
  base.delete(`${prefix}exerciseId`)
  base.delete(`${prefix}workoutLogId`)

  if (view.kind === 'oggi') {
    if (view.workoutPlanId) base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
    if (view.dayId) base.set(`${prefix}dayId`, view.dayId)
    if (view.exerciseId) base.set(`${prefix}exerciseId`, view.exerciseId)
  }
  if (view.kind === 'scheda') base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
  if (view.kind === 'giorno') {
    base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
    base.set(`${prefix}dayId`, view.dayId)
  }
  if (view.kind === 'esercizio') base.set(`${prefix}exerciseId`, view.exerciseId)
  if (view.kind === 'riepilogo' && view.workoutLogId) base.set(`${prefix}workoutLogId`, view.workoutLogId)
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
    return parseView(kind, new URLSearchParams(searchParams.toString()), slotId)
  }, [searchParams, slotId])

  const hrefFor = useCallback(
    (next: WorkoutsPaneView) => {
      const p = new URLSearchParams(searchParams.toString())
      viewToParams(slotId, next, p)
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
          <SchedaAllenamentoContent workoutPlanIdOverride={view.workoutPlanId} />
        ) : view.kind === 'giorno' ? (
          <GiornoPreviewContent workoutPlanIdOverride={view.workoutPlanId} dayIdOverride={view.dayId} />
        ) : view.kind === 'esercizio' ? (
          <EsercizioDetailPageContent exerciseIdOverride={view.exerciseId} />
        ) : view.kind === 'riepilogo' ? (
          <RiepilogoPageContent workoutLogIdOverride={view.workoutLogId} />
        ) : (
          <AllenamentiHomePageContent />
        )}
      </WorkoutsPaneProvider>
    </AthleteAllenamentiPreviewProvider>
  )
}

