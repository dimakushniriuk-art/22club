'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AgendaSelectedAthleteSummary,
  AgendaTimelineCompact,
} from '@/components/dashboard/agenda-timeline-compact'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'
import { completeStaffAppointmentById } from '@/lib/appointments/complete-staff-appointment-client'
import { createClient } from '@/lib/supabase/client'
import { isValidUUID } from '@/lib/utils/type-guards'
import type { AgendaEvent } from '@/types/agenda-event'
import { useToast } from '@/components/ui/toast'
import {
  isRestorableStaffWorkoutsQuery,
  mergeMissingWorkoutsPaneParamsFromSaved,
  persistStaffWorkoutSlots,
  persistStaffWorkoutsFullQuery,
  readStaffWorkoutSlotsFromSession,
  readStaffWorkoutsFullQuery,
} from '@/lib/embed/staff-workouts-slots-session'
import { WorkoutsShellCallbacksProvider } from '@/contexts/workouts-shell-context'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

const PANE_FRAME =
  'rounded-lg border border-white/10 bg-background shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-2 ring-cyan-500/60 ring-offset-2 ring-offset-black/80'

const PANE_URL_KEYS = ['view', 'workoutPlanId', 'dayId', 'exerciseId', 'workoutLogId'] as const

function deleteWorkoutsSlotParams(p: URLSearchParams, slotId: 'p1' | 'p2') {
  p.delete(slotId)
  for (const k of PANE_URL_KEYS) {
    p.delete(`${slotId}${k}`)
  }
}

type Props = {
  slot1: ReactNode
  slot2: ReactNode
}

export function WorkoutsShell({ slot1, slot2 }: Props) {
  const { events, loading, loadError, reload } = useStaffTodayAgenda()
  const { addToast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const eventsRef = useRef(events)
  eventsRef.current = events
  const reloadRef = useRef(reload)
  reloadRef.current = reload

  const [dirtySlots, setDirtySlots] = useState<{ p1: boolean; p2: boolean }>({
    p1: false,
    p2: false,
  })

  const p1 = searchParams.get('p1')?.trim() ?? ''
  const p2 = searchParams.get('p2')?.trim() ?? ''

  const setSlots = useCallback(
    (nextP1: string, nextP2: string) => {
      const p = new URLSearchParams(searchParams.toString())
      if (nextP1 && isValidUUID(nextP1)) p.set('p1', nextP1)
      else p.delete('p1')
      if (nextP2 && isValidUUID(nextP2)) p.set('p2', nextP2)
      else p.delete('p2')
      const q = p.toString()
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
      const out1 = nextP1 && isValidUUID(nextP1) ? nextP1.trim() : ''
      const out2 = nextP2 && isValidUUID(nextP2) ? nextP2.trim() : ''
      persistStaffWorkoutSlots(out1, out2)
    },
    [pathname, router, searchParams],
  )

  const confirmDiscardSlot = useCallback((_slotId: 'p1' | 'p2') => {
    const message =
      'Ci sono modifiche non salvate in questa colonna. Vuoi scartarle e continuare?'
    return window.confirm(message)
  }, [])

  useEffect(() => {
    if (pathname !== '/dashboard/workouts') return
    const q1 = searchParams.get('p1')?.trim() ?? ''
    const q2 = searchParams.get('p2')?.trim() ?? ''

    if (!q1 && !q2) {
      const full = readStaffWorkoutsFullQuery()
      if (full && isRestorableStaffWorkoutsQuery(full)) {
        router.replace(`${pathname}?${full}`, { scroll: false })
        return
      }
      const s = readStaffWorkoutSlotsFromSession()
      if (s.p1 || s.p2) {
        const p = new URLSearchParams(searchParams.toString())
        if (s.p1) p.set('p1', s.p1)
        if (s.p2) p.set('p2', s.p2)
        const merged = mergeMissingWorkoutsPaneParamsFromSaved(p)
        const nextQ = merged ?? p.toString()
        router.replace(nextQ ? `${pathname}?${nextQ}` : pathname, { scroll: false })
      }
      return
    }

    const u1 = isValidUUID(q1) ? q1 : ''
    const u2 = isValidUUID(q2) ? q2 : ''
    persistStaffWorkoutSlots(u1, u2)

    const merged = mergeMissingWorkoutsPaneParamsFromSaved(
      new URLSearchParams(searchParams.toString()),
    )
    if (merged !== null) {
      router.replace(`${pathname}?${merged}`, { scroll: false })
      return
    }

    persistStaffWorkoutsFullQuery(searchParams.toString())
  }, [pathname, router, searchParams])

  const onSelectEvent = useCallback(
    (event: AgendaEvent) => {
      const id = event.athlete_id?.trim()
      if (!id || !isValidUUID(id)) return
      if (p1 === id) {
        if (dirtySlots.p1 && !confirmDiscardSlot('p1')) return
        setSlots('', p2)
        return
      }
      if (p2 === id) {
        if (dirtySlots.p2 && !confirmDiscardSlot('p2')) return
        setSlots(p1, '')
        return
      }
      if (!p1) {
        setSlots(id, p2)
        return
      }
      if (!p2) {
        setSlots(p1, id)
        return
      }
      if (dirtySlots.p2 && !confirmDiscardSlot('p2')) return
      setSlots(p1, id)
    },
    [p1, p2, setSlots, dirtySlots.p1, dirtySlots.p2, confirmDiscardSlot],
  )

  const selectedAthleteIds = useMemo(() => [p1, p2].filter(Boolean), [p1, p2])

  const eventForSlot1 = useMemo(
    () => (p1 ? events.find((e) => e.athlete_id?.trim() === p1) : undefined),
    [events, p1],
  )
  const eventForSlot2 = useMemo(
    () => (p2 ? events.find((e) => e.athlete_id?.trim() === p2) : undefined),
    [events, p2],
  )

  const handleWorkoutCompleted = useCallback(
    async (args: {
      athleteProfileId: string
      withTrainer: boolean
      workoutLogId?: string
      finalizeAgendaAppointment?: boolean
    }): Promise<boolean> => {
      const match = eventsRef.current.find((ev) => ev.athlete_id?.trim() === args.athleteProfileId)
      const finalizeAgenda =
        Boolean(args.withTrainer) || args.finalizeAgendaAppointment === true

      if (!match) {
        addToast({
          title: 'Allenamento completato',
          message: 'Aggiornamento completato. (Nessun appuntamento trovato in agenda.)',
          variant: 'success',
        })
        await reloadRef.current()
        return true
      }

      if (!finalizeAgenda) {
        addToast({
          title: 'Allenamento completato',
          message: 'Aggiornamento completato.',
          variant: 'success',
        })
        await reloadRef.current()
        return true
      }

      const result = await completeStaffAppointmentById(supabase, match.id)
      if (result.ok) {
        addToast({
          title: 'Appuntamento aggiornato',
          message: 'Sessione in sala segnata come completata.',
          variant: 'success',
        })
        await reloadRef.current()
        return true
      }
      addToast({
        title: 'Appuntamento',
        message: result.error,
        variant: 'error',
      })
      return false
    },
    [addToast, supabase],
  )

  const setSlotDirty = useCallback((slotId: 'p1' | 'p2', dirty: boolean) => {
    setDirtySlots((prev) => (prev[slotId] === dirty ? prev : { ...prev, [slotId]: dirty }))
  }, [])

  /** Dopo “Salva e chiudi”: smonta colonna senza dialog dirty (salvataggio già avvenuto). */
  const dismissWorkoutsSlot = useCallback(
    (slotId: 'p1' | 'p2') => {
      const hasAthlete = slotId === 'p1' ? Boolean(p1) : Boolean(p2)
      if (!hasAthlete) return

      const p = new URLSearchParams(searchParams.toString())
      deleteWorkoutsSlotParams(p, slotId)
      const q = p.toString()
      const nextP1Raw = p.get('p1')?.trim() ?? ''
      const nextP2Raw = p.get('p2')?.trim() ?? ''
      const nextP1 = isValidUUID(nextP1Raw) ? nextP1Raw : ''
      const nextP2 = isValidUUID(nextP2Raw) ? nextP2Raw : ''

      setDirtySlots((prev) => ({ ...prev, [slotId]: false }))
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
      persistStaffWorkoutSlots(nextP1, nextP2)
      if (nextP1 || nextP2) {
        persistStaffWorkoutsFullQuery(q)
      }
    },
    [pathname, router, searchParams, p1, p2],
  )

  /** Chiude lo slot: rimuove atleta e stato pannello dall’URL, senza salvare (smonta il pane). */
  const forceCloseSlot = useCallback(
    (slotId: 'p1' | 'p2') => {
      const hasAthlete = slotId === 'p1' ? Boolean(p1) : Boolean(p2)
      if (!hasAthlete) return

      const dirty = slotId === 'p1' ? dirtySlots.p1 : dirtySlots.p2
      if (
        dirty &&
        !window.confirm(
          'Chiudere questa colonna senza salvare? Le modifiche all’allenamento aperto verranno scartate.',
        )
      ) {
        return
      }

      const p = new URLSearchParams(searchParams.toString())
      deleteWorkoutsSlotParams(p, slotId)
      const q = p.toString()
      const nextP1Raw = p.get('p1')?.trim() ?? ''
      const nextP2Raw = p.get('p2')?.trim() ?? ''
      const nextP1 = isValidUUID(nextP1Raw) ? nextP1Raw : ''
      const nextP2 = isValidUUID(nextP2Raw) ? nextP2Raw : ''

      setDirtySlots((prev) => ({ ...prev, [slotId]: false }))
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
      persistStaffWorkoutSlots(nextP1, nextP2)
      if (nextP1 || nextP2) {
        persistStaffWorkoutsFullQuery(q)
      }
    },
    [pathname, router, searchParams, p1, p2, dirtySlots.p1, dirtySlots.p2],
  )

  const shellValue = useMemo(
    () => ({
      p1,
      p2,
      eventForSlot1,
      eventForSlot2,
      dirtySlots,
      setSlotDirty,
      dismissWorkoutsSlot,
      handleWorkoutCompleted,
    }),
    [
      p1,
      p2,
      eventForSlot1,
      eventForSlot2,
      dirtySlots,
      setSlotDirty,
      dismissWorkoutsSlot,
      handleWorkoutCompleted,
    ],
  )

  return (
    <WorkoutsShellCallbacksProvider value={shellValue}>
      <StaffContentLayout
        title="Workouts"
        description="Due colonne per scheda e sessione; sotto, agenda odierna per apertura rapida atleta."
        theme="teal"
        className="overflow-y-auto min-h-0"
      >
        {loadError ? (
          <div className="flex min-h-[min(45vh,560px)] min-w-0 flex-col items-center justify-center gap-4 px-2 py-8 text-center sm:px-4">
            <p className="text-sm leading-relaxed text-text-secondary">{loadError}</p>
            <Button variant="primary" size="sm" onClick={() => void reload()}>
              Riprova
            </Button>
          </div>
        ) : (
          <>
            <div className="grid min-h-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch md:gap-6">
              <div className={`flex min-h-[min(45vh,560px)] min-w-0 flex-col md:min-h-0 ${PANE_FRAME}`}>
                <div className="flex shrink-0 justify-end px-2 pt-2">
                  <button
                    type="button"
                    disabled={!p1}
                    title={p1 ? 'Chiudi colonna senza salvare' : 'Nessun atleta in questa colonna'}
                    aria-label="Chiudi colonna senza salvare"
                    onClick={() => forceCloseSlot('p1')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 transition-colors hover:border-red-400/70 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
                {eventForSlot1 ? <AgendaSelectedAthleteSummary event={eventForSlot1} /> : null}
                {dirtySlots.p1 ? (
                  <p className="px-3 pt-2 text-xs font-medium text-amber-300/90">
                    Modifiche non salvate
                  </p>
                ) : null}
                {slot1}
              </div>
              <div className={`flex min-h-[min(45vh,560px)] min-w-0 flex-col md:min-h-0 ${PANE_FRAME}`}>
                <div className="flex shrink-0 justify-end px-2 pt-2">
                  <button
                    type="button"
                    disabled={!p2}
                    title={p2 ? 'Chiudi colonna senza salvare' : 'Nessun atleta in questa colonna'}
                    aria-label="Chiudi colonna senza salvare"
                    onClick={() => forceCloseSlot('p2')}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 transition-colors hover:border-red-400/70 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
                {eventForSlot2 ? <AgendaSelectedAthleteSummary event={eventForSlot2} /> : null}
                {dirtySlots.p2 ? (
                  <p className="px-3 pt-2 text-xs font-medium text-amber-300/90">
                    Modifiche non salvate
                  </p>
                ) : null}
                {slot2}
              </div>
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-col space-y-3 sm:space-y-4">
              <p className="w-full shrink-0 text-center text-base font-semibold leading-tight text-white md:text-lg">
                Seleziona Atleta
              </p>
              <div className="min-w-0 w-full">
                <AgendaTimelineCompact
                  events={events}
                  loading={loading}
                  layout="horizontalStrip"
                  onSelectEvent={onSelectEvent}
                  selectedAthleteIds={selectedAthleteIds}
                />
              </div>
            </div>
          </>
        )}
      </StaffContentLayout>
    </WorkoutsShellCallbacksProvider>
  )
}
