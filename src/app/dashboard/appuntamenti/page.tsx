'use client'

import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'
import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'
import { useAppointments } from '@/hooks/appointments/use-appointments'
import { useLessonCounters } from '@/hooks/use-lesson-counters'
import { useLessonStatsBulk } from '@/hooks/use-lesson-stats-bulk'
import { AppointmentsHeader, AppointmentsStats, AppointmentsList } from '@/components/appointments'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { useAuth } from '@/providers/auth-provider'

const logger = createLogger('app:dashboard:appuntamenti:page')

// Lazy load dei modali per migliorare performance iniziale
const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({
    default: mod.AppointmentForm,
  })),
)
const AppointmentDetail = lazy(() =>
  import('@/components/calendar').then((mod) => ({
    default: mod.AppointmentDetail,
  })),
)

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return { time, dateStr }
}

function getStatusColorClasses(status: string) {
  switch (status) {
    case 'completato':
      return 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15 hover:border-green-500/40'
    case 'attivo':
      return 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30'
    case 'annullato':
      return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/15 hover:border-orange-500/40'
    default:
      return 'bg-background-tertiary/50 border border-border/30 hover:bg-background-tertiary/60 hover:border-blue-500/30'
  }
}

function getAppointmentType(apt: AppointmentTable) {
  if (apt.type === 'allenamento') return 'Allenamento'
  if (apt.type === 'prova') return 'Prova'
  if (apt.type === 'valutazione') return 'Valutazione'
  return 'Appuntamento'
}

function toEditData(apt: AppointmentTable): EditAppointmentData {
  return {
    id: apt.id,
    org_id: apt.org_id ?? undefined,
    athlete_id: apt.athlete_id ?? undefined,
    staff_id: apt.staff_id ?? undefined,
    starts_at: apt.starts_at,
    ends_at: apt.ends_at,
    location: apt.location ?? undefined,
    notes: apt.notes ?? undefined,
    status: apt.status,
    type: apt.type,
  }
}

export default function AppuntamentiPage() {
  const { org_id } = useAuth()
  // const { user } = useAuth() // Non utilizzato in questo componente
  const {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    // Nota: staffId potrebbe essere usato in futuro per filtri
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    staffId,
    handleFormSubmit: handleFormSubmitHook,
    handleDelete: handleDeleteHook,
    handleComplete: handleCompleteHook,
    handleCancel: handleCancelHook,
  } = useAppointments() // Hook non accetta parametri - usa userId e role internamente

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentTable | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<EditAppointmentData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  >('tutti')
  const [confirmState, setConfirmState] = useState<{
    appointment: AppointmentTable
    action: 'delete' | 'cancel'
    fromDetail: boolean
  } | null>(null)
  const [lessonRefetchKey, setLessonRefetchKey] = useState(0)

  const athleteIds = useMemo(
    () =>
      [...new Set(appointments.map((a) => a.athlete_id).filter(Boolean))] as string[],
    [appointments],
  )
  const rimastiMap = useLessonCounters(athleteIds, lessonRefetchKey)
  const lessonStatsMap = useLessonStatsBulk(athleteIds, lessonRefetchKey)
  const lessonsRemainingMap = useMemo(() => {
    const m = new Map<string, number>()
    athleteIds.forEach((id) => {
      const fromCounter = rimastiMap.get(id)
      const stats = lessonStatsMap.get(id)
      const computed = stats != null ? stats.acquired - stats.used : undefined
      const value = fromCounter !== undefined ? fromCounter : computed
      if (value !== undefined) m.set(id, value)
    })
    return m
  }, [athleteIds, rimastiMap, lessonStatsMap])

  // Filtra appuntamenti
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Filtro ricerca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          apt.athlete_name?.toLowerCase().includes(searchLower) ||
          apt.notes?.toLowerCase().includes(searchLower) ||
          false
        if (!matchesSearch) return false
      }

      // Filtro stato
      if (statusFilter !== 'tutti') {
        if (statusFilter === 'programmato') {
          return apt.status === 'attivo' && new Date(apt.starts_at) > new Date()
        }
        return apt.status === statusFilter
      }

      return true
    })
  }, [appointments, searchTerm, statusFilter])

  const handleEdit = useCallback((appointment: AppointmentTable) => {
    setEditingAppointment(toEditData(appointment))
    setShowForm(true)
  }, [])

  const handleDelete = useCallback((appointment: AppointmentTable) => {
    setConfirmState({ appointment, action: 'delete', fromDetail: false })
  }, [])

  const handleComplete = useCallback(
    async (appointment: AppointmentTable) => {
      setLoading(true)
      try {
        await handleCompleteHook(appointment.id)
        setLessonRefetchKey((k) => k + 1)
      } finally {
        setLoading(false)
      }
    },
    [handleCompleteHook],
  )

  const handleCancel = useCallback((appointment: AppointmentTable) => {
    setConfirmState({ appointment, action: 'cancel', fromDetail: false })
  }, [])

  const handleView = useCallback((appointment: AppointmentTable) => {
    setSelectedAppointment(appointment)
    setShowDetail(true)
  }, [])

  const handleNewAppointment = useCallback(() => {
    setEditingAppointment(null)
    setShowForm(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: CreateAppointmentData) => {
      setLoading(true)
      try {
        const appointmentData: CreateAppointmentData = {
          ...data,
          org_id: org_id || data.org_id || 'default-org',
        }
        await handleFormSubmitHook(appointmentData, editingAppointment, athletes)
        setShowForm(false)
        setEditingAppointment(null)
      } catch (err) {
        const errorDetails: Record<string, unknown> = {
          appointmentId: editingAppointment?.id,
          hasOrgId: !!org_id,
          orgId: org_id,
          hasData: !!data,
        }
        if (err && typeof err === 'object' && 'message' in err) {
          errorDetails.errorMessage = (err as { message?: string }).message
          errorDetails.errorCode = (err as { code?: string }).code
          errorDetails.errorDetails = (err as { details?: unknown }).details
          errorDetails.errorHint = (err as { hint?: string }).hint
        }
        logger.error('Errore salvataggio appuntamento', err, errorDetails)
      } finally {
        setLoading(false)
      }
    },
    [org_id, handleFormSubmitHook, editingAppointment, athletes],
  )

  const handleEditFromDetail = useCallback(() => {
    if (selectedAppointment) setEditingAppointment(toEditData(selectedAppointment))
    setShowDetail(false)
    setShowForm(true)
  }, [selectedAppointment])

  const handleCancelFromDetail = useCallback(() => {
    if (selectedAppointment)
      setConfirmState({ appointment: selectedAppointment, action: 'cancel', fromDetail: true })
  }, [selectedAppointment])

  const handleDeleteFromDetail = useCallback(() => {
    if (selectedAppointment)
      setConfirmState({ appointment: selectedAppointment, action: 'delete', fromDetail: true })
  }, [selectedAppointment])

  const handleConfirmDialogConfirm = useCallback(async () => {
    if (!confirmState) return
    setLoading(true)
    try {
      if (confirmState.action === 'delete') {
        await handleDeleteHook(confirmState.appointment.id)
      } else {
        await handleCancelHook(confirmState.appointment.id)
      }
      setLessonRefetchKey((k) => k + 1)
      if (confirmState.fromDetail) {
        setShowDetail(false)
        setSelectedAppointment(null)
      }
    } finally {
      setLoading(false)
      setConfirmState(null)
    }
  }, [confirmState, handleDeleteHook, handleCancelHook])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingAppointment(null)
    setLoading(false)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setSelectedAppointment(null)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('tutti')
  }, [])

  // Calcola le statistiche
  const stats = useMemo(() => {
    return {
      total: filteredAppointments.length,
      attivi: filteredAppointments.filter((a) => a.status === 'attivo').length,
      completati: filteredAppointments.filter((a) => a.status === 'completato').length,
      annullati: filteredAppointments.filter((a) => a.status === 'annullato').length,
      programmati: filteredAppointments.filter(
        (a) => a.status === 'attivo' && new Date(a.starts_at) > new Date(),
      ).length,
    }
  }, [filteredAppointments])

  return (
    <div className="h-full">
      <div className="space-y-6 p-6">
        <AppointmentsHeader
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onNewAppointment={handleNewAppointment}
        />

        {/* Container principale con stile agenda */}
        <div className="relative p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Appuntamenti
              </h1>
              <p className="text-text-secondary text-sm sm:text-base">
                Tutti i tuoi appuntamenti e sessioni ({filteredAppointments.length})
              </p>
            </div>

            <AppointmentsStats stats={stats} />
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {filteredAppointments.length}{' '}
            {filteredAppointments.length === 1 ? 'appuntamento' : 'appuntamenti'}
          </div>

          {/* Events List */}
          <AppointmentsList
            appointments={filteredAppointments}
            appointmentsLoading={appointmentsLoading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onNewAppointment={handleNewAppointment}
            onSearchClear={handleSearchClear}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
            onCancel={handleCancel}
            formatDateTime={formatDateTime}
            getStatusColorClasses={getStatusColorClasses}
            getAppointmentType={getAppointmentType}
            lessonsRemainingMap={lessonsRemainingMap}
          />
        </div>

        {/* Modals/Drawers - Lazy loaded solo quando aperti */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <Suspense fallback={<LoadingState message="Caricamento form appuntamento..." />}>
                <AppointmentForm
                  appointment={editingAppointment || undefined}
                  athletes={athletes}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCloseForm}
                  loading={loading || athletesLoading}
                />
              </Suspense>
            </div>
          </div>
        )}

        {showDetail && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md">
              <Suspense fallback={<LoadingState message="Caricamento dettagli appuntamento..." />}>
                <AppointmentDetail
                  appointment={selectedAppointment}
                  onEdit={handleEditFromDetail}
                  onCancel={handleCancelFromDetail}
                  onDelete={handleDeleteFromDetail}
                  onClose={handleCloseDetail}
                  loading={loading}
                />
              </Suspense>
            </div>
          </div>
        )}

        {confirmState && (
          <ConfirmDialog
            open={!!confirmState}
            onOpenChange={(open) => !open && setConfirmState(null)}
            title={confirmState.action === 'delete' ? 'Elimina appuntamento' : 'Annulla appuntamento'}
            description={
              confirmState.action === 'delete'
                ? `Sei sicuro di voler eliminare l'appuntamento con ${confirmState.appointment.athlete_name || 'questo atleta'}? Questa azione non può essere annullata.`
                : `Sei sicuro di voler annullare questo appuntamento? Lo stato passerà ad "Annullato".`
            }
            confirmText={confirmState.action === 'delete' ? 'Elimina' : 'Annulla'}
            cancelText="Indietro"
            variant={confirmState.action === 'delete' ? 'destructive' : 'default'}
            loading={loading}
            onConfirm={handleConfirmDialogConfirm}
          />
        )}
      </div>
    </div>
  )
}
