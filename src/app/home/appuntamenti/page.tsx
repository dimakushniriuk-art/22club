'use client'

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui'
import { RefreshButton } from '@/components/common/RefreshButton'
import { CalendarView, AppointmentPopover } from '@/components/calendar'
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
import { LoadingState } from '@/components/dashboard/loading-state'
import { AppuntamentiPageHeader } from './AppuntamentiPageHeader'
import { AppuntamentiListView } from './AppuntamentiListView'

const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({ default: mod.AppointmentForm })),
)

const logger = createLogger('app:home:appuntamenti:page')

function toLocalISOString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:${s}`
}

function AppuntamentiLoadingSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="bg-background-tertiary h-12 w-56 rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background-tertiary h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
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
    supabase
      .from('profiles')
      .select('stato_cliente')
      .eq('id', profileId)
      .single()
      .then(({ data }) => {
        if (!cancelled && data)
          setStatoCliente((data as { stato_cliente?: string | null }).stato_cliente ?? 'cliente')
      })
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
    if (error) {
      logger.error('Errore nel caricamento appuntamenti', error, {
        profileId: user?.id,
        userId: user?.user_id,
      })
      // error è di tipo string | null da useAthleteAppointments
      const errorMessage =
        typeof error === 'string' ? error : 'Errore sconosciuto nel caricamento degli appuntamenti'
      notifyError('Errore nel caricamento appuntamenti', errorMessage)
    }
  }, [error, user?.id, user?.user_id])

  if (!user || !isValidUser) {
    return <AppuntamentiLoadingSkeleton />
  }

  if (isAthlete && statoCliente === null) {
    return <AppuntamentiLoadingSkeleton />
  }

  if (isAthlete && statoCliente === 'non_ancora_cliente') {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
          <AppuntamentiPageHeader subtitle="Appuntamenti" onBack={handleBack} />
          <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-6 min-[834px]:p-8 text-center">
            <p className="text-text-primary text-sm font-medium">
              Non hai accesso al calendario. Contatta l&apos;organizzazione per attivare il tuo
              profilo cliente.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const isLoading = isAthlete ? athleteCalendar.appointmentsLoading : loading
  if (isLoading && !error) {
    return <AppuntamentiLoadingSkeleton />
  }

  if (error && !loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
          <AppuntamentiPageHeader onBack={handleBack} />
          <Card className="rounded-lg border border-state-error/20 bg-state-error/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-6 min-[834px]:p-8 text-center">
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
    const handleSelectSlot = (start: Date, end: Date) => {
      formPreviousFocusRef.current = document.activeElement as HTMLElement | null
      setSelectedSlot({ start, end })
      setEditingAppointment(null)
      setShowForm(true)
    }
    const handleEdit = () => {
      if (
        selectedAppointment &&
        selectedAppointment.created_by_role === 'athlete' &&
        selectedAppointment.athlete_id
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
        <div className="min-h-0 flex-1 flex flex-col px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5">
          <AppuntamentiPageHeader
            subtitle="Calendario e appuntamenti con il trainer"
            onBack={handleBack}
          />

          <div className="min-h-[260px] rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] overflow-hidden flex flex-col">
            {athleteCalendar.appointmentsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-text-secondary text-sm">Caricamento calendario...</p>
                </div>
              </div>
            ) : (
              <CalendarView
                appointments={calendarAppointments}
                onEventClick={handleEventClick}
                onNewAppointment={trainerStaffId ? handleNewAppointment : undefined}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectSlot={handleSelectSlot}
                navigateToDate={navigateToDate}
                onNavigateComplete={() => setNavigateToDate(null)}
                isEventEditable={(apt) =>
                  !apt.is_open_booking_day && apt.created_by_role === 'athlete'
                }
                openBookingAsBackground
                slotBookingCounts={slotBookingCounts}
                openBookingSlotMax={openBookingSlotMax}
                compactToolbar
              />
            )}
          </div>

          {!athleteCalendar.appointmentsLoading && (
            <div className="mt-3 space-y-2">
              {trainerStaffId && (
                <p className="text-center text-xs text-text-secondary px-1">
                  Libera prenotazione: max {openBookingSlotMax} prenotazioni per fascia oraria.
                </p>
              )}
              {!trainerStaffId && !athleteCalendar.trainerLoading && (
                <p className="text-center text-sm text-text-secondary rounded-lg border border-white/10 bg-white/5 py-2.5 px-3">
                  Non hai ancora un trainer assegnato. Contatta l&apos;organizzazione per poter
                  prenotare.
                </p>
              )}
            </div>
          )}

          {showForm && (
            <div
              data-testid="appointment-form-overlay"
              className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overflow-x-hidden bg-black/70 backdrop-blur-sm p-3 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:p-4"
            >
              <Suspense fallback={<LoadingState message="Caricamento form..." />}>
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
                selectedAppointment.created_by_role === 'athlete'
              }
              canDelete={
                !selectedAppointment.is_open_booking_day &&
                selectedAppointment.created_by_role === 'athlete'
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
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-56 bg-background-tertiary rounded-xl" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-background-tertiary rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AppuntamentiPageContent />
    </Suspense>
  )
}
