'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'

const logger = createLogger('app:dashboard:appuntamenti:page')
import type {
  AppointmentTable,
  CreateAppointmentData,
  EditAppointmentData,
} from '@/types/appointment'
import { useAppointments } from '@/hooks/appointments/use-appointments'
import { AppointmentsHeader, AppointmentsStats, AppointmentsList } from '@/components/appointments'
import { LoadingState } from '@/components/dashboard/loading-state'

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

  const handleEdit = (appointment: AppointmentTable) => {
    const editData: EditAppointmentData = {
      id: appointment.id,
      org_id: appointment.org_id ?? undefined,
      athlete_id: appointment.athlete_id,
      staff_id: appointment.staff_id,
      starts_at: appointment.starts_at,
      ends_at: appointment.ends_at,
      location: appointment.location ?? undefined,
      notes: appointment.notes ?? undefined,
      status: appointment.status,
      type: appointment.type,
    }
    setEditingAppointment(editData)
    setShowForm(true)
  }

  const handleDelete = async (appointment: AppointmentTable) => {
    setLoading(true)
    try {
      await handleDeleteHook(appointment.id)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (appointment: AppointmentTable) => {
    setLoading(true)
    try {
      await handleCompleteHook(appointment.id)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointment: AppointmentTable) => {
    setLoading(true)
    try {
      await handleCancelHook(appointment.id)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (appointment: AppointmentTable) => {
    setSelectedAppointment(appointment)
    setShowDetail(true)
  }

  const handleNewAppointment = () => {
    setEditingAppointment(null)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: CreateAppointmentData) => {
    setLoading(true)
    try {
      // Usa org_id dal contesto invece di 'default-org'
      const appointmentData: CreateAppointmentData = {
        ...data,
        org_id: org_id || data.org_id || 'default-org',
      }

      await handleFormSubmitHook(appointmentData, editingAppointment, athletes)
      setShowForm(false)
      setEditingAppointment(null)
    } catch (err) {
      // Estrai dettagli dell'errore per logging migliore
      const errorDetails: Record<string, unknown> = {
        appointmentId: editingAppointment?.id,
        hasOrgId: !!org_id,
        orgId: org_id,
        hasData: !!data,
      }

      // Se è un errore Supabase, estrai dettagli specifici
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
  }

  const handleEditFromDetail = () => {
    if (selectedAppointment) {
      const editData: EditAppointmentData = {
        id: selectedAppointment.id,
        org_id: selectedAppointment.org_id ?? undefined,
        athlete_id: selectedAppointment.athlete_id,
        staff_id: selectedAppointment.staff_id,
        starts_at: selectedAppointment.starts_at,
        ends_at: selectedAppointment.ends_at,
        status: selectedAppointment.status,
        type: selectedAppointment.type,
        location: selectedAppointment.location ?? undefined,
        notes: selectedAppointment.notes ?? undefined,
      }
      setEditingAppointment(editData)
    }
    setShowDetail(false)
    setShowForm(true)
  }

  const handleCancelFromDetail = async () => {
    if (!selectedAppointment) return

    setLoading(true)
    try {
      await handleCancelHook(selectedAppointment.id)
      setShowDetail(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFromDetail = async () => {
    if (!selectedAppointment) return

    setLoading(true)
    try {
      await handleDeleteHook(selectedAppointment.id)
      setShowDetail(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAppointment(null)
    setLoading(false)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedAppointment(null)
  }

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

  // Formatta la data/ora
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return { time, dateStr }
  }

  // Funzione per ottenere il colore dello stato
  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'completato':
        return 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15 hover:border-green-500/40'
      case 'attivo':
        return 'bg-background-tertiary/50 border-white/40 hover:bg-background-tertiary/60 hover:border-white/50'
      case 'annullato':
        return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/15 hover:border-orange-500/40'
      default:
        return 'bg-background-tertiary/50 border border-border/30 hover:bg-background-tertiary/60 hover:border-blue-500/30'
    }
  }

  // Ottieni tipo di appuntamento dal campo type
  const getAppointmentType = (apt: AppointmentTable) => {
    if (apt.type === 'allenamento') return 'Allenamento'
    if (apt.type === 'prova') return 'Prova'
    if (apt.type === 'valutazione') return 'Valutazione'
    return 'Appuntamento'
  }

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

          {/* Events List */}
          <AppointmentsList
            appointments={filteredAppointments}
            appointmentsLoading={appointmentsLoading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onNewAppointment={handleNewAppointment}
            onSearchClear={() => {
              setSearchTerm('')
              setStatusFilter('tutti')
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
            onCancel={handleCancel}
            formatDateTime={formatDateTime}
            getStatusColorClasses={getStatusColorClasses}
            getAppointmentType={getAppointmentType}
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
      </div>
    </div>
  )
}
