'use client'

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import { RefreshButton } from '@/components/common/RefreshButton'
import {
  CalendarView,
  AppointmentPopover,
  CALENDAR_FAB_BUTTON_CLASS,
  type CalendarViewHandle,
} from '@/components/calendar'
import type { AppointmentUI, CreateAppointmentData, EditAppointmentData } from '@/types/appointment'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useNormalizedRole, toLegacyRole } from '@/lib/utils/role-normalizer-client'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAuth } from '@/providers/auth-provider'
import { useAthleteAppointments } from '@/hooks/useAthleteAppointments'
import { useAthleteCalendarPage } from '@/hooks/calendar/use-athlete-calendar-page'
import {
  isAthleteAppointmentFutureLike,
  isAthleteAppointmentPastLike,
} from '@/lib/appointments/athlete-query-params'
import { supabase } from '@/lib/supabase/client'
import { isLikelyNetworkFetchFailure } from '@/lib/is-network-fetch-error'
import { AppuntamentiPageHeader } from './AppuntamentiPageHeader'
import { AppuntamentiListView } from './AppuntamentiListView'

const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({ default: mod.AppointmentForm })),
)

const logger = createLogger('app:home:appuntamenti:page')

/** [start, end) vs [openStart, openEnd) */
function intervalsOverlap(start: Date, end: Date, openStart: Date, openEnd: Date): boolean {
  return start.getTime() < openEnd.getTime() && end.getTime() > openStart.getTime()
}

function toLocalISOString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:${s}`
}

function AppuntamentiPageContent() {
  const router = useRouter()
  const { user } = useAuth()

  const isValidUser = user && isValidProfile(user)
  const profileId = useMemo(() => {
    if (!isValidUser || !user?.id) return null
    return isValidUUID(user.id) ? user.id : null
  }, [user?.id, isValidUser])

  const normalizedRoleRaw = useNormalizedRole(user?.role)
  const normalizedRole = useMemo(() => toLegacyRole(normalizedRoleRaw), [normalizedRoleRaw])

  // Calendario atleta (solo per role athlete)
  const isAthlete = normalizedRole === 'athlete'
  const [statoCliente, setStatoCliente] = useState<string | null>(null)
  useEffect(() => {
    if (!profileId || !isAthlete) return
    let cancelled = false
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('stato_cliente')
          .eq('id', profileId)
          .single()
        if (cancelled) return
        if (error || !data) {
          setStatoCliente('cliente')
          return
        }
        setStatoCliente((data as { stato_cliente?: string | null }).stato_cliente ?? 'cliente')
      } catch {
        if (!cancelled) setStatoCliente('cliente')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [profileId, isAthlete])
  const canAccessCalendar =
    !isAthlete || (statoCliente != null && statoCliente !== 'non_ancora_cliente')
  const athleteCalendar = useAthleteCalendarPage(isAthlete && canAccessCalendar ? profileId : null)

  // Lista appuntamenti (per non-atleta o fallback)
  const {
    appointments,
    loading,
    error,
    refetch,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
  } = useAthleteAppointments({
    userId: profileId ?? undefined,
    role: normalizedRole ?? undefined,
  })

  // Stato calendario atleta
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<EditAppointmentData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [navigateToDate, setNavigateToDate] = useState<Date | null>(null)
  const formPreviousFocusRef = useRef<HTMLElement | null>(null)
  const calendarRef = useRef<CalendarViewHandle | null>(null)

  const futureAppointments = useMemo(() => {
    const now = new Date()
    return appointments.filter((apt) => isAthleteAppointmentFutureLike(apt, now))
  }, [appointments])

  const pastAppointments = useMemo(() => {
    const now = new Date()
    return appointments.filter((apt) => isAthleteAppointmentPastLike(apt, now))
  }, [appointments])

  const handleBack = useCallback(() => router.push('/home'), [router])

  const handleListCardClick = useCallback(
    (appointment: AppointmentUI, event: React.MouseEvent<HTMLDivElement>) => {
      setSelectedAppointment(appointment)
      const rect = event.currentTarget.getBoundingClientRect()
      setPopoverPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 8 })
      setShowPopover(true)
    },
    [],
  )

  const handleListCardKeyDown = useCallback(
    (appointment: AppointmentUI, event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setSelectedAppointment(appointment)
        const rect = (event.target as HTMLDivElement).getBoundingClientRect()
        setPopoverPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 8 })
        setShowPopover(true)
      }
    },
    [],
  )

  const handleListEdit = useCallback(() => {
    if (!selectedAppointment || !selectedAppointment.athlete_id) return
    formPreviousFocusRef.current = document.activeElement as HTMLElement | null
    setEditingAppointment({
      id: selectedAppointment.id,
      org_id: selectedAppointment.org_id ?? undefined,
      athlete_id: selectedAppointment.athlete_id,
      staff_id: selectedAppointment.staff_id,
      starts_at: selectedAppointment.starts_at,
      ends_at: selectedAppointment.ends_at,
      status: selectedAppointment.status,
      type: selectedAppointment.type,
      color: selectedAppointment.color ?? undefined,
      location: selectedAppointment.location ?? undefined,
      notes: selectedAppointment.notes ?? undefined,
    })
    setShowPopover(false)
    setShowForm(true)
  }, [selectedAppointment])

  const handleListCancel = useCallback(() => {
    if (!selectedAppointment) return
    cancelAppointment(selectedAppointment.id)
      .then(() => {
        setShowPopover(false)
        setSelectedAppointment(null)
        refetch()
      })
      .catch(() => {})
  }, [selectedAppointment, cancelAppointment, refetch])

  const handleListDelete = useCallback(() => {
    if (!selectedAppointment) return
    deleteAppointment(selectedAppointment.id)
      .then(() => {
        setShowPopover(false)
        setSelectedAppointment(null)
        refetch()
      })
      .catch(() => {})
  }, [selectedAppointment, deleteAppointment, refetch])

  const handleListFormSubmit = useCallback(
    async (data: CreateAppointmentData) => {
      if (!editingAppointment?.id) return
      const payload = {
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: new Date(data.ends_at).toISOString(),
        type: data.type || 'allenamento',
        status: data.status || 'attivo',
        color: data.color ?? undefined,
        notes: data.notes ?? undefined,
        location: data.location ?? undefined,
      }
      await updateAppointment(editingAppointment.id, payload)
      formPreviousFocusRef.current?.focus()
      formPreviousFocusRef.current = null
      setShowForm(false)
      setEditingAppointment(null)
      await refetch()
    },
    [editingAppointment, updateAppointment, refetch],
  )

  const handleCloseListForm = useCallback(() => {
    formPreviousFocusRef.current?.focus()
    formPreviousFocusRef.current = null
    setShowForm(false)
    setEditingAppointment(null)
  }, [])

  useEffect(() => {
    if (!error) return
    const errorMessage =
      typeof error === 'string' ? error : 'Errore sconosciuto nel caricamento degli appuntamenti'
    if (isLikelyNetworkFetchFailure(errorMessage)) {
      logger.warn('Caricamento appuntamenti: problema di rete', {
        profileId: user?.id,
        userId: user?.user_id,
        message: errorMessage,
      })
      notifyError('Connessione', 'Impossibile raggiungere il server. Controlla la rete e riprova.')
      return
    }
    logger.error('Errore nel caricamento appuntamenti', error, {
      profileId: user?.id,
      userId: user?.user_id,
    })
    notifyError('Errore nel caricamento appuntamenti', errorMessage)
  }, [error, user?.id, user?.user_id])

  if (!user || !isValidUser) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 md:px-6">
          <AppuntamentiPageHeader subtitle="Appuntamenti" onBack={handleBack} />
        </div>
      </div>
    )
  }

  if (isAthlete && statoCliente === 'non_ancora_cliente') {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 md:px-6 space-y-4">
          <AppuntamentiPageHeader subtitle="Appuntamenti" onBack={handleBack} />
          <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-6 md:p-8 text-center">
            <p className="text-text-primary text-sm font-medium">
              Non hai accesso al calendario. Contatta l&apos;organizzazione per attivare il tuo
              profilo cliente.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 md:px-6 space-y-4">
          <AppuntamentiPageHeader onBack={handleBack} />
          <Card className="rounded-lg border border-state-error/20 bg-state-error/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-6 md:p-8 text-center">
            <div className="mb-3 text-4xl opacity-50">❌</div>
            <p className="text-text-primary mb-4 text-sm font-medium line-clamp-3">
              {typeof error === 'string'
                ? error
                : 'Errore sconosciuto nel caricamento degli appuntamenti'}
            </p>
            <RefreshButton
              onRefresh={() => refetch()}
              isLoading={loading}
              ariaLabel="Riprova caricamento appuntamenti"
              className="rounded-lg border border-white/10 hover:bg-white/5 min-h-[44px] text-text-primary"
            />
          </Card>
        </div>
      </div>
    )
  }

  // Vista calendario atleta (smartphone)
  if (isAthlete && profileId) {
    const {
      appointments: calendarAppointments,
      slotBookingCounts,
      openBookingSlotMax,
      staffId: trainerStaffId,
      trainerLoading,
      loading: submitLoading,
      handleFormSubmit,
      handleCancel,
      handleDelete,
      handleEventDrop,
      handleEventResize,
    } = athleteCalendar

    const openBookingWindows = calendarAppointments.filter(
      (a) => a.is_open_booking_day === true && a.starts_at && a.ends_at,
    )
    const slotOverlapsOpenBooking = (start: Date, end: Date) =>
      openBookingWindows.some((slot) =>
        intervalsOverlap(start, end, new Date(slot.starts_at), new Date(slot.ends_at)),
      )
    const handleSelectSlot = (start: Date, end: Date) => {
      if (!trainerStaffId || !slotOverlapsOpenBooking(start, end)) return
      formPreviousFocusRef.current = document.activeElement as HTMLElement | null
      setSelectedSlot({ start, end })
      setEditingAppointment(null)
      setShowForm(true)
    }

    const closeFormAndRestoreFocus = () => {
      formPreviousFocusRef.current?.focus()
      formPreviousFocusRef.current = null
      setShowForm(false)
      setEditingAppointment(null)
      setSelectedSlot(null)
    }
    const handleCloseForm = () => closeFormAndRestoreFocus()
    const handleEventClick = (appointment: AppointmentUI, position: { x: number; y: number }) => {
      if (appointment.is_open_booking_day) {
        formPreviousFocusRef.current = document.activeElement as HTMLElement | null
        setSelectedSlot({
          start: new Date(appointment.starts_at),
          end: new Date(appointment.ends_at),
        })
        setEditingAppointment(null)
        setShowForm(true)
        return
      }
      setSelectedAppointment(appointment)
      setPopoverPosition(position)
      setShowPopover(true)
    }
    const handleNewAppointment = () => {
      if (!trainerStaffId) return
      formPreviousFocusRef.current = document.activeElement as HTMLElement | null
      setEditingAppointment(null)
      setSelectedSlot(null)
      setShowForm(true)
    }
    const handleEdit = () => {
      if (
        selectedAppointment &&
        selectedAppointment.athlete_id === profileId &&
        selectedAppointment.created_by_role === 'athlete'
      ) {
        setEditingAppointment({
          id: selectedAppointment.id,
          org_id: selectedAppointment.org_id ?? undefined,
          athlete_id: selectedAppointment.athlete_id,
          staff_id: selectedAppointment.staff_id,
          starts_at: selectedAppointment.starts_at,
          ends_at: selectedAppointment.ends_at,
          status: selectedAppointment.status,
          type: selectedAppointment.type,
          color: selectedAppointment.color ?? undefined,
          location: selectedAppointment.location ?? undefined,
          notes: selectedAppointment.notes ?? undefined,
        })
      }
      formPreviousFocusRef.current = document.activeElement as HTMLElement | null
      setShowPopover(false)
      setShowForm(true)
    }
    const athletesForForm = profileId
      ? [{ id: profileId, name: 'Tu', email: user?.email ?? '' }]
      : []

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 pb-[max(1.25rem,calc(0.85rem+env(safe-area-inset-bottom)))] pt-0 safe-area-inset-bottom touch-manipulation sm:px-4 md:px-6 md:pb-[max(1.75rem,calc(1rem+env(safe-area-inset-bottom)))]">
          <AppuntamentiPageHeader
            subtitle="Calendario e appuntamenti con il trainer"
            onBack={handleBack}
          />

          <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:rounded-lg">
            <CalendarView
              ref={calendarRef}
              appointments={calendarAppointments}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              onSelectSlot={trainerStaffId ? handleSelectSlot : undefined}
              selectAllow={trainerStaffId ? slotOverlapsOpenBooking : undefined}
              navigateToDate={navigateToDate}
              onNavigateComplete={() => setNavigateToDate(null)}
              peerReadonlyProfileId={profileId}
              isEventEditable={(apt) =>
                !apt.is_open_booking_day &&
                apt.created_by_role === 'athlete' &&
                apt.athlete_id === profileId
              }
              openBookingAsBackground
              slotBookingCounts={slotBookingCounts}
              openBookingSlotMax={openBookingSlotMax}
              compactToolbar
            />
          </div>

          {trainerStaffId && (
            <div
              className="mt-2 flex shrink-0 flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-3 sm:gap-x-8"
              role="toolbar"
              aria-label="Calendario: navigazione periodo e nuovo appuntamento"
            >
              <button
                type="button"
                onClick={() => calendarRef.current?.goPrev()}
                className={CALENDAR_FAB_BUTTON_CLASS}
                aria-label="Periodo precedente"
              >
                <ChevronLeft className="h-7 w-7 shrink-0 stroke-[2.5] text-white" />
              </button>
              <button
                type="button"
                onClick={handleNewAppointment}
                className={CALENDAR_FAB_BUTTON_CLASS}
                aria-label="Nuovo appuntamento"
              >
                <Plus className="h-7 w-7 shrink-0 stroke-[2.5] text-white" />
              </button>
              <button
                type="button"
                onClick={() => calendarRef.current?.goNext()}
                className={CALENDAR_FAB_BUTTON_CLASS}
                aria-label="Periodo successivo"
              >
                <ChevronRight className="h-7 w-7 shrink-0 stroke-[2.5] text-white" />
              </button>
            </div>
          )}

          <div className="mt-2 space-y-2 sm:mt-3">
            {trainerStaffId && (
              <p className="mx-auto max-w-md px-1 text-center text-[11px] leading-snug text-text-secondary sm:text-xs">
                Libera prenotazione: max {openBookingSlotMax} prenotazioni per ogni fascia da 15
                minuti (griglia oraria).
              </p>
            )}
            {!trainerStaffId && !athleteCalendar.trainerLoading && (
              <p className="text-center text-sm text-text-secondary rounded-lg border border-white/10 bg-white/5 py-2.5 px-3">
                Non hai ancora un trainer assegnato. Contatta l&apos;organizzazione per poter
                prenotare.
              </p>
            )}
          </div>

          {showForm && (
            <div
              data-testid="appointment-form-overlay"
              className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overflow-x-hidden bg-black/70 backdrop-blur-sm p-3 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:p-4"
            >
              <Suspense fallback={null}>
                <AppointmentForm
                  appointment={
                    editingAppointment ||
                    (selectedSlot && trainerStaffId
                      ? {
                          athlete_id: profileId,
                          staff_id: trainerStaffId,
                          starts_at: toLocalISOString(selectedSlot.start),
                          ends_at: toLocalISOString(selectedSlot.end),
                          type: 'allenamento',
                          status: 'attivo',
                        }
                      : undefined)
                  }
                  athletes={athletesForForm}
                  onSubmit={(data) =>
                    handleFormSubmit(data, editingAppointment).then(() => handleCloseForm())
                  }
                  onCancel={handleCloseForm}
                  loading={submitLoading || trainerLoading}
                  athleteMode
                />
              </Suspense>
            </div>
          )}

          {showPopover && selectedAppointment && (
            <AppointmentPopover
              appointment={selectedAppointment}
              position={popoverPosition}
              onEdit={handleEdit}
              onCancel={() =>
                handleCancel(selectedAppointment.id).then(() => {
                  setShowPopover(false)
                  setSelectedAppointment(null)
                })
              }
              onDelete={() =>
                handleDelete(selectedAppointment.id).then(() => {
                  setShowPopover(false)
                  setSelectedAppointment(null)
                })
              }
              onClose={() => {
                setShowPopover(false)
                setSelectedAppointment(null)
              }}
              loading={submitLoading}
              canEdit={
                !selectedAppointment.is_open_booking_day &&
                selectedAppointment.created_by_role === 'athlete' &&
                selectedAppointment.athlete_id === profileId
              }
              canDelete={
                !selectedAppointment.is_open_booking_day &&
                selectedAppointment.created_by_role === 'athlete' &&
                selectedAppointment.athlete_id === profileId
              }
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <AppuntamentiListView
      futureAppointments={futureAppointments as AppointmentUI[]}
      pastAppointments={pastAppointments as AppointmentUI[]}
      normalizedRole={normalizedRole ?? ''}
      loading={loading}
      refetch={refetch}
      selectedAppointment={selectedAppointment}
      popoverPosition={popoverPosition}
      showPopover={showPopover}
      editingAppointment={editingAppointment}
      showForm={showForm}
      appointments={appointments as AppointmentUI[]}
      onBack={handleBack}
      onCardClick={handleListCardClick}
      onCardKeyDown={handleListCardKeyDown}
      onEdit={handleListEdit}
      onCancel={handleListCancel}
      onDelete={handleListDelete}
      onFormSubmit={handleListFormSubmit}
      onClosePopover={() => {
        setShowPopover(false)
        setSelectedAppointment(null)
      }}
      onCloseForm={handleCloseListForm}
      formPreviousFocusRef={formPreviousFocusRef}
    />
  )
}

export default function AppuntamentiPage() {
  return (
    <Suspense fallback={null}>
      <AppuntamentiPageContent />
    </Suspense>
  )
}
