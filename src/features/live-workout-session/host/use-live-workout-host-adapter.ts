import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ClassValue } from 'clsx'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import { useMyTrainerProfile } from '@/hooks/use-my-trainer-profile'
import { useStaffWorkoutsEmbedPostMessage } from '@/hooks/use-staff-workouts-embed-post-message'
import {
  workoutsPaneEmbedBodyClass,
  workoutsPaneEmbedRootClass,
} from '@/lib/embed/workouts-pane-body-layout'
import {
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
} from '@/lib/embed/staff-workouts-embed-events'

type EmbedSaveEvent =
  | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_START; scope: 'block' | 'workout' }
  | { type: typeof STAFF_WORKOUTS_EMBED_SAVE_OK; scope: 'block' | 'workout' }
  | {
      type: typeof STAFF_WORKOUTS_EMBED_SAVE_ERROR
      scope: 'block' | 'workout'
      message: string
    }

type UseLiveWorkoutHostAdapterArgs = {
  athleteProfileId: string | null
  authLoading: boolean
  isAuthenticated: boolean
  push: (href: string) => void
}

export function useLiveWorkoutHostAdapter({
  athleteProfileId,
  authLoading,
  isAuthenticated,
  push,
}: UseLiveWorkoutHostAdapterArgs) {
  const searchParams = useSearchParams()
  const { pathBase, isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  /** Due colonne /dashboard/workouts: niente scroll interno — altezza naturale, scroll sul layout staff. */
  const workoutsPaneNaturalFlow = Boolean(workoutsPane)
  const trainerProfileQueryEnabled = Boolean(
    !authLoading && !isPreview && workoutsPane?.countCompletionAsCoached,
  )
  const { data: trainerProfileForCoached } = useMyTrainerProfile(trainerProfileQueryEnabled)
  const mode: 'athlete' | 'embed' | 'staff-pane' = workoutsPane
    ? 'staff-pane'
    : isPreview
      ? 'embed'
      : 'athlete'

  const { postEmbedDirty: postEmbedDirtyLazy, postEmbedAuthRequired } =
    useStaffWorkoutsEmbedPostMessage()
  const embedDirtyRef = useRef(false)

  const postEmbedDirty = useCallback(
    (dirty: boolean) => {
      if (!isPreview) return
      if (workoutsPane?.setDirty) {
        workoutsPane.setDirty(dirty)
        return
      }
      if (typeof window === 'undefined') return
      if (window.parent === window) return
      if (!athleteProfileId) return
      void postEmbedDirtyLazy(athleteProfileId, dirty).catch(() => {
        /* ignore */
      })
    },
    [athleteProfileId, isPreview, postEmbedDirtyLazy, workoutsPane],
  )

  const postEmbedSaveEvent = useCallback(
    (event: EmbedSaveEvent) => {
      if (!isPreview) return
      if (typeof window === 'undefined') return
      if (window.parent === window) return
      if (!athleteProfileId) return
      try {
        window.parent.postMessage({ ...event, athleteProfileId }, window.location.origin)
      } catch {
        /* ignore */
      }
    },
    [athleteProfileId, isPreview],
  )

  const requestAuthFromParent = useCallback(() => {
    if (!isPreview) return false
    if (typeof window === 'undefined') return false
    if (window.parent === window) return false
    if (!athleteProfileId) return false
    void postEmbedAuthRequired(athleteProfileId).catch(() => {
      /* ignore */
    })
    return true
  }, [athleteProfileId, isPreview, postEmbedAuthRequired])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated) return
    void requestAuthFromParent()
  }, [authLoading, isAuthenticated, requestAuthFromParent])

  const markEmbedDirty = useCallback(() => {
    if (embedDirtyRef.current) return
    embedDirtyRef.current = true
    postEmbedDirty(true)
  }, [postEmbedDirty])

  const clearEmbedDirty = useCallback(() => {
    if (!embedDirtyRef.current) return
    embedDirtyRef.current = false
    postEmbedDirty(false)
  }, [postEmbedDirty])

  const panePrefix = workoutsPane?.slotId ?? null
  const workoutPlanId = panePrefix
    ? searchParams?.get(`${panePrefix}workoutPlanId`)
    : searchParams?.get('workout_plan_id')
  const workoutDayId = panePrefix
    ? searchParams?.get(`${panePrefix}dayId`)
    : searchParams?.get('workout_day_id')
  const exerciseId = panePrefix
    ? searchParams?.get(`${panePrefix}exerciseId`)
    : searchParams?.get('exercise_id')

  const allenamentiHeaderBackHref = useMemo(() => {
    if (workoutPlanId && workoutDayId) {
      return `${pathBase}/${workoutPlanId}/giorno/${workoutDayId}`
    }
    if (workoutPlanId) {
      return `${pathBase}/${workoutPlanId}`
    }
    return pathBase
  }, [pathBase, workoutDayId, workoutPlanId])

  const resolveWithTrainer = useCallback(
    () =>
      workoutsPane != null ? Boolean(workoutsPane.countCompletionAsCoached) : Boolean(isPreview),
    [isPreview, workoutsPane],
  )

  const goToRiepilogo = useCallback(
    (workoutLogId?: string) => {
      if (workoutsPane) {
        workoutsPane.navigateTo({ kind: 'riepilogo', workoutLogId: workoutLogId ?? undefined })
        return
      }
      if (workoutLogId) {
        push(`${pathBase}/riepilogo?workout_id=${workoutLogId}`)
      } else {
        push(`${pathBase}/riepilogo`)
      }
    },
    [pathBase, push, workoutsPane],
  )

  const embedRootClass = useCallback(
    (...rest: ClassValue[]) =>
      cn(
        workoutsPaneEmbedRootClass(workoutsPaneNaturalFlow),
        workoutsPane && 'relative isolate',
        ...rest,
      ),
    [workoutsPane, workoutsPaneNaturalFlow],
  )

  const embedBodyClass = useCallback(
    (opts: Parameters<typeof workoutsPaneEmbedBodyClass>[1], ...rest: ClassValue[]) =>
      workoutsPaneEmbedBodyClass(workoutsPaneNaturalFlow, opts, ...rest),
    [workoutsPaneNaturalFlow],
  )

  return {
    mode,
    pathBase,
    isPreview,
    workoutsPane,
    workoutsPaneNaturalFlow,
    trainerProfileQueryEnabled,
    trainerProfileForCoached,
    workoutPlanId,
    workoutDayId,
    exerciseId,
    allenamentiHeaderBackHref,
    markEmbedDirty,
    clearEmbedDirty,
    postEmbedSaveEvent,
    requestAuthFromParent,
    resolveWithTrainer,
    goToRiepilogo,
    embedRootClass,
    embedBodyClass,
  }
}
