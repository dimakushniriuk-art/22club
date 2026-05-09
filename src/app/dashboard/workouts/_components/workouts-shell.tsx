'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AgendaSelectedAthleteSummary,
  AgendaTimelineCompact,
  AgendaWorkoutsPaneAthleteSummary,
} from '@/components/dashboard/agenda-timeline-compact'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Button } from '@/components/ui'
import { useStaffTodayAgenda } from '@/hooks/use-staff-today-agenda'
import { completeStaffAppointmentById } from '@/lib/appointments/complete-staff-appointment-client'
import { createClient } from '@/lib/supabase/client'
import { isValidUUID } from '@/lib/utils/type-guards'
import type { AgendaEvent } from '@/types/agenda-event'
import type { Cliente } from '@/types/cliente'
import { cn } from '@/lib/utils'
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
import { useClienti } from '@/hooks/use-clienti'
import { WorkoutsPageSettingsDialog } from './workouts-page-settings-dialog'
import { WorkoutsRegisteredAthletesStrip } from './workouts-registered-athletes-strip'
import { useAuth } from '@/providers/auth-provider'
import {
  loadProfileLocalStorageJson,
  saveProfileLocalStorageJson,
} from '@/lib/prefs/profile-local-storage'

/**
 * Cornice ciano: `border-2` sul contenitore (box model) così non viene coperta da footer/nav assoluti;
 * `ring-inset` invece resta sotto al paint dei figli.
 */
const PANE_BASE =
  'relative z-10 isolate overflow-hidden rounded-lg border-2 border-cyan-500/65 bg-gradient-to-b from-zinc-900 to-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'

const PANE_URL_KEYS = ['view', 'workoutPlanId', 'dayId', 'exerciseId', 'workoutLogId'] as const

function deleteWorkoutsSlotParams(p: URLSearchParams, slotId: 'p1' | 'p2') {
  p.delete(slotId)
  for (const k of PANE_URL_KEYS) {
    p.delete(`${slotId}${k}`)
  }
}

const PANE_CLOSE_BTN_CLASS =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 transition-colors hover:border-red-400/70 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30'

function workoutsSlotClienteDisplayName(c: Cliente): string {
  const name = `${c.nome ?? c.first_name ?? ''} ${c.cognome ?? c.last_name ?? ''}`.trim()
  if (name) return name
  return c.email?.trim() || 'Atleta'
}

function workoutsResolveAthleteFallbackLabel(
  athleteId: string,
  athletes: Cliente[],
  athletesLoading: boolean,
): string {
  const id = athleteId.trim()
  const hit = athletes.find((a) => a.id.trim() === id)
  if (hit) return workoutsSlotClienteDisplayName(hit)
  if (athletesLoading) return 'Caricamento profilo…'
  return `Atleta (${id.slice(0, 8)}…)`
}

type WorkoutsSlotColumnProps = {
  athleteId: string
  event: AgendaEvent | undefined
  /** Nome da rubrica quando non c’è slot agenda per questo atleta. */
  athleteFallbackLabel: string
  athleteAvatarUrl?: string | null
  dirty: boolean
  onClose: () => void
  children: ReactNode
}

/** Colonna scheda/sessione: altezza dal contenuto; scroll unico sul layout `StaffContentLayout`. */
function WorkoutsSlotColumn({
  athleteId,
  event,
  athleteFallbackLabel,
  athleteAvatarUrl,
  dirty,
  onClose,
  children,
}: WorkoutsSlotColumnProps) {
  const showAthleteFallback = Boolean(!event && athleteId && isValidUUID(athleteId))

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col',
        'min-h-[min(42dvh,480px)] md:min-h-0',
        PANE_BASE,
      )}
    >
      <div className="shrink-0 border-b border-white/[0.08] px-3 pb-2 pt-2.5 sm:px-4 sm:pb-2.5 sm:pt-3">
        <div className="relative min-h-[44px]">
          <button
            type="button"
            disabled={!athleteId}
            title={athleteId ? 'Chiudi colonna senza salvare' : 'Nessun atleta in questa colonna'}
            aria-label="Chiudi colonna senza salvare"
            onClick={onClose}
            className={cn(PANE_CLOSE_BTN_CLASS, 'absolute right-0 top-0 z-20')}
          >
            <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </button>
          {event ? (
            <div className="min-w-0 pr-11 sm:pr-12 [&>div.relative]:mb-0">
              <AgendaSelectedAthleteSummary event={event} />
            </div>
          ) : showAthleteFallback ? (
            <div className="min-w-0 pr-11 sm:pr-12 [&>div.relative]:mb-0">
              <AgendaWorkoutsPaneAthleteSummary
                athleteName={athleteFallbackLabel}
                avatarUrl={athleteAvatarUrl}
              />
            </div>
          ) : null}
        </div>
      </div>
      {dirty ? (
        <p className="shrink-0 border-b border-white/[0.06] bg-amber-500/[0.06] px-3 py-2 text-xs font-medium text-amber-300/90 sm:px-4">
          Modifiche non salvate
        </p>
      ) : null}
      <div className="flex min-w-0 flex-none flex-col">{children}</div>
    </div>
  )
}

type Props = {
  slot1: ReactNode
  slot2: ReactNode
}

export function WorkoutsShell({ slot1, slot2 }: Props) {
  const { user } = useAuth()
  const profileId = user?.id ?? null
  const { events, loading, loadError, reload } = useStaffTodayAgenda()
  const {
    clienti: registeredAthletes,
    loading: registeredAthletesLoading,
    total: registeredAthletesTotal,
  } = useClienti({
    pageSize: 300,
    page: 1,
    sort: { field: 'cognome', direction: 'asc' },
  })
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
  /** Evita mismatch SSR/hydration sullo slot `actions` (stesso schema della dashboard con `hydrated`). */
  const [headerActionsReady, setHeaderActionsReady] = useState(false)
  useLayoutEffect(() => {
    setHeaderActionsReady(true)
  }, [])

  const [anagraficaStripVisible, setAnagraficaStripVisible] = useState(true)
  const [columnsMode, setColumnsMode] = useState<1 | 2>(2)
  const toggleAnagraficaStrip = useCallback(() => {
    setAnagraficaStripVisible((v) => !v)
  }, [])

  useEffect(() => {
    const stored = loadProfileLocalStorageJson<{
      anagraficaStripVisible: boolean
      columnsMode?: unknown
    }>(
      '22club_staff_workouts_layout_v1',
      profileId,
      (raw) => {
        if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
          return { anagraficaStripVisible: true, columnsMode: 2 }
        }
        const o = raw as Record<string, unknown>
        const rawColumns = o.columnsMode
        const columnsMode = rawColumns === 1 || rawColumns === 2 ? rawColumns : 2
        return {
          anagraficaStripVisible:
            typeof o.anagraficaStripVisible === 'boolean' ? o.anagraficaStripVisible : true,
          columnsMode,
        }
      },
      {
        legacyKeys: ['22club_staff_workouts_layout_v1'],
        defaultValue: { anagraficaStripVisible: true, columnsMode: 2 },
      },
    )
    setAnagraficaStripVisible(stored.value.anagraficaStripVisible)
    setColumnsMode(stored.value.columnsMode === 1 ? 1 : 2)
  }, [profileId])

  useEffect(() => {
    saveProfileLocalStorageJson('22club_staff_workouts_layout_v1', profileId, {
      anagraficaStripVisible,
      columnsMode,
    })
  }, [anagraficaStripVisible, columnsMode, profileId])

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

  // Se l'utente imposta 1 colonna, chiudi la seconda per mantenere stato coerente.
  useEffect(() => {
    if (columnsMode !== 1) return
    if (!p2) return
    setSlots(p1, '')
  }, [columnsMode, p1, p2, setSlots])

  const confirmDiscardSlot = useCallback((_slotId: 'p1' | 'p2') => {
    const message = 'Ci sono modifiche non salvate in questa colonna. Vuoi scartarle e continuare?'
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

  const selectAthleteInSlots = useCallback(
    (rawId: string | null | undefined) => {
      const id = rawId?.trim()
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

  const onSelectEvent = useCallback(
    (event: AgendaEvent) => {
      selectAthleteInSlots(event.athlete_id)
    },
    [selectAthleteInSlots],
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

  const slot1Cliente = useMemo(
    () => (p1 ? registeredAthletes.find((a) => a.id.trim() === p1.trim()) : undefined),
    [p1, registeredAthletes],
  )
  const slot2Cliente = useMemo(
    () => (p2 ? registeredAthletes.find((a) => a.id.trim() === p2.trim()) : undefined),
    [p2, registeredAthletes],
  )
  const slot1AthleteFallbackLabel = useMemo(
    () =>
      p1
        ? workoutsResolveAthleteFallbackLabel(p1, registeredAthletes, registeredAthletesLoading)
        : '',
    [p1, registeredAthletes, registeredAthletesLoading],
  )
  const slot2AthleteFallbackLabel = useMemo(
    () =>
      p2
        ? workoutsResolveAthleteFallbackLabel(p2, registeredAthletes, registeredAthletesLoading)
        : '',
    [p2, registeredAthletes, registeredAthletesLoading],
  )

  const handleWorkoutCompleted = useCallback(
    async (args: {
      athleteProfileId: string
      withTrainer: boolean
      workoutLogId?: string
      finalizeAgendaAppointment?: boolean
    }): Promise<boolean> => {
      const match = eventsRef.current.find((ev) => ev.athlete_id?.trim() === args.athleteProfileId)
      const finalizeAgenda = Boolean(args.withTrainer) || args.finalizeAgendaAppointment === true

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

  const clearLocalWorkoutsState = useCallback(() => {
    persistStaffWorkoutSlots('', '')
    setDirtySlots({ p1: false, p2: false })
    router.replace('/dashboard/workouts', { scroll: false })
  }, [router])

  const workoutsHeaderActions = useMemo(() => {
    if (!headerActionsReady) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden>
          <span className="h-9 w-9 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      )
    }
    return (
      <WorkoutsPageSettingsDialog
        hasDirtySlots={dirtySlots.p1 || dirtySlots.p2}
        onClearLocalState={clearLocalWorkoutsState}
        anagraficaStripVisible={anagraficaStripVisible}
        onToggleAnagraficaStrip={toggleAnagraficaStrip}
        columnsMode={columnsMode}
        onSetColumnsMode={setColumnsMode}
      />
    )
  }, [
    anagraficaStripVisible,
    columnsMode,
    clearLocalWorkoutsState,
    dirtySlots.p1,
    dirtySlots.p2,
    headerActionsReady,
    toggleAnagraficaStrip,
  ])

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
        className="min-h-0 overflow-y-auto"
        contentClassName="flex min-h-0 flex-col gap-6 space-y-0 sm:space-y-0 md:space-y-0"
        actions={workoutsHeaderActions}
      >
        {loadError ? (
          <div className="flex min-h-[min(45dvh,560px)] min-w-0 flex-col items-center justify-center gap-4 px-2 py-8 text-center sm:px-4">
            <p className="text-sm leading-relaxed text-text-secondary">{loadError}</p>
            <Button variant="primary" size="sm" onClick={() => void reload()}>
              Riprova
            </Button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'grid w-full grid-cols-1 gap-5 md:items-start md:gap-5 lg:gap-6',
                columnsMode === 2 && 'md:grid-cols-2',
              )}
            >
              <WorkoutsSlotColumn
                athleteId={p1}
                event={eventForSlot1}
                athleteFallbackLabel={slot1AthleteFallbackLabel}
                athleteAvatarUrl={slot1Cliente?.avatar_url ?? null}
                dirty={dirtySlots.p1}
                onClose={() => forceCloseSlot('p1')}
              >
                {slot1}
              </WorkoutsSlotColumn>
              {columnsMode === 2 ? (
                <WorkoutsSlotColumn
                  athleteId={p2}
                  event={eventForSlot2}
                  athleteFallbackLabel={slot2AthleteFallbackLabel}
                  athleteAvatarUrl={slot2Cliente?.avatar_url ?? null}
                  dirty={dirtySlots.p2}
                  onClose={() => forceCloseSlot('p2')}
                >
                  {slot2}
                </WorkoutsSlotColumn>
              ) : null}
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-col space-y-3 sm:space-y-4">
              <p className="w-full shrink-0 text-center text-base font-semibold leading-tight text-white md:text-lg">
                Seleziona Atleta
              </p>
              <div className="min-w-0 w-full space-y-1">
                <AgendaTimelineCompact
                  events={events}
                  loading={loading}
                  layout="horizontalStrip"
                  onSelectEvent={onSelectEvent}
                  selectedAthleteIds={selectedAthleteIds}
                />
                {anagraficaStripVisible ? (
                  <div className="min-w-0 w-full border-t border-white/[0.06] pt-3 sm:pt-4">
                    <p className="mb-2 px-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/90 sm:text-left">
                      Atleti in anagrafica
                      {!registeredAthletesLoading && registeredAthletesTotal > 0
                        ? ` (${registeredAthletesTotal})`
                        : null}
                    </p>
                    <WorkoutsRegisteredAthletesStrip
                      athletes={registeredAthletes}
                      loading={registeredAthletesLoading}
                      totalInAnagrafica={registeredAthletesTotal}
                      selectedAthleteIds={selectedAthleteIds}
                      onSelectAthlete={selectAthleteInSlots}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </StaffContentLayout>
    </WorkoutsShellCallbacksProvider>
  )
}
