'use client'

import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import Link from 'next/link'
import { createLogger } from '@/lib/logger'
import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'
import { useStaffAppointmentsTable } from '@/hooks/appointments/useStaffAppointmentsTable'
import { useLessonUsageByAthleteIds } from '@/hooks/use-lesson-usage-by-athlete-ids'
import { AppointmentsHeader, AppointmentsStats, AppointmentsList } from '@/components/appointments'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { useAuth } from '@/providers/auth-provider'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { DASHBOARD_COLUMN_PANEL_CLASS } from '@/app/dashboard/_components/dashboard-widget-columns'

const logger = createLogger('app:dashboard:massaggiatore:appuntamenti')

const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({ default: mod.AppointmentForm })),
)
const AppointmentDetail = lazy(() =>
  import('@/components/calendar').then((mod) => ({ default: mod.AppointmentDetail })),
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
      return 'bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/30'
    case 'annullato':
      return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/15 hover:border-orange-500/40'
    default:
      return 'bg-background-tertiary/50 border border-border/30 hover:bg-background-tertiary/60 hover:border-cyan-500/25'
  }
}

function getAppointmentType(apt: AppointmentTable) {
  if (apt.type === 'massaggio') return 'Massaggio'
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

export default function MassaggiatoreAppuntamentiPage() {
  const { showLoader: showGuardLoader } = useStaffDashboardGuard('massaggiatore')
  const { org_id } = useAuth()
  const {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    handleFormSubmit: handleFormSubmitHook,
    handleDelete: handleDeleteHook,
    handleComplete: handleCompleteHook,
    handleCancel: handleCancelHook,
  } = useStaffAppointmentsTable()

  const massaggiOnly = useMemo(
    () => appointments.filter((a) => a.type === 'massaggio'),
    [appointments],
  )
  const athleteIds = useMemo(
    () => [...new Set(massaggiOnly.map((a) => a.athlete_id).filter(Boolean))] as string[],
    [massaggiOnly],
  )
  const lessonUsageMap = useLessonUsageByAthleteIds(athleteIds, 'massage')
  const lessonsRemainingMap = useMemo(() => {
    const m = new Map<string, number>()
    lessonUsageMap.forEach((row, id) => m.set(id, row.totalRemaining))
    return m
  }, [lessonUsageMap])

  const athleteEmailMap = useMemo(() => new Map(athletes.map((a) => [a.id, a.email])), [athletes])

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

  const filteredAppointments = useMemo(() => {
    return massaggiOnly.filter((apt) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          apt.athlete_name?.toLowerCase().includes(searchLower) ||
          apt.notes?.toLowerCase().includes(searchLower) ||
          false
        if (!matchesSearch) return false
      }
      if (statusFilter !== 'tutti') {
        if (statusFilter === 'programmato') {
          return apt.status === 'attivo' && new Date(apt.starts_at) > new Date()
        }
        return apt.status === statusFilter
      }
      return true
    })
  }, [massaggiOnly, searchTerm, statusFilter])

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
          type: 'massaggio',
          org_id: org_id || data.org_id || 'default-org',
        }
        await handleFormSubmitHook(appointmentData, editingAppointment, athletes)
        setShowForm(false)
        setEditingAppointment(null)
      } catch (err) {
        logger.error('Errore salvataggio appuntamento', err)
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

  const stats = useMemo(
    () => ({
      total: filteredAppointments.length,
      attivi: filteredAppointments.filter((a) => a.status === 'attivo').length,
      completati: filteredAppointments.filter((a) => a.status === 'completato').length,
      annullati: filteredAppointments.filter((a) => a.status === 'annullato').length,
      programmati: filteredAppointments.filter(
        (a) => a.status === 'attivo' && new Date(a.starts_at) > new Date(),
      ).length,
    }),
    [filteredAppointments],
  )

  if (showGuardLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Appuntamenti"
      description="Elenco trattamenti; creazione e modifica dal calendario."
      theme="teal"
      actions={
        <Link href="/dashboard/massaggiatore/calendario">
          <Button variant="primary" size="sm" className="min-h-[44px]">
            <Calendar className="mr-1.5 h-4 w-4" />
            Calendario
          </Button>
        </Link>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <AppointmentsHeader
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onNewAppointment={handleNewAppointment}
          theme="teal"
        />
        <div className={`${DASHBOARD_COLUMN_PANEL_CLASS} space-y-4`}>
          <AppointmentsStats stats={stats} theme="teal" />
          <div role="status" aria-live="polite" className="sr-only">
            {filteredAppointments.length} appuntamenti
          </div>
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
            theme="teal"
            lessonsRemainingMap={lessonsRemainingMap}
            athleteEmailMap={athleteEmailMap}
          />
        </div>
      </div>

      {showForm && (
        <div
          data-testid="appointment-form-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <Suspense fallback={null}>
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
        <div
          data-testid="appointment-detail-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        >
          <div className="w-full max-w-md">
            <Suspense fallback={null}>
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
              ? `Eliminare l'appuntamento con ${confirmState.appointment.athlete_name || 'questo cliente'}?`
              : 'Annullare questo appuntamento?'
          }
          confirmText={confirmState.action === 'delete' ? 'Elimina' : 'Annulla'}
          cancelText="Indietro"
          variant={confirmState.action === 'delete' ? 'destructive' : 'default'}
          loading={loading}
          onConfirm={handleConfirmDialogConfirm}
          confirmTestId="appointment-confirm-dialog-confirm"
          cancelTestId="appointment-confirm-dialog-cancel"
        />
      )}
    </StaffContentLayout>
  )
}
