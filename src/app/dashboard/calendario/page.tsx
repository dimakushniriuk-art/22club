'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CalendarView } from '@/components/calendar'
import type { AppointmentUI, EditAppointmentData } from '@/types/appointment'
import { useCalendarPage } from '@/hooks/calendar/use-calendar-page'
import { CalendarHeader } from '@/components/calendar/calendar-header'
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

export default function CalendarioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    // Nota: trainerId potrebbe essere usato in futuro per filtri
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trainerId,
    loading,
    handleFormSubmit,
    handleCancel,
    handleDelete,
  } = useCalendarPage()

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<EditAppointmentData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  // Apri il form automaticamente se c'è il query param 'new'
  useEffect(() => {
    const newParam = searchParams.get('new')
    if (newParam === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

  // Gestisci la chiusura del form e rimuovi il query param
  const handleCloseForm = () => {
    if (loading) return

    setShowForm(false)
    setEditingAppointment(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('new')
    const newUrl = params.toString()
      ? `/dashboard/calendario?${params.toString()}`
      : '/dashboard/calendario'
    router.replace(newUrl, { scroll: false })
  }

  const handleEventClick = (appointment: AppointmentUI) => {
    setSelectedAppointment(appointment)
    setShowDetail(true)
  }

  const handleDateClick = (dateStr?: string) => {
    if (dateStr) {
      setEditingAppointment(null)
      setShowForm(true)
    }
  }

  const handleNewAppointment = () => {
    setEditingAppointment(null)
    setShowForm(true)
  }

  const handleEdit = () => {
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

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedAppointment(null)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        <CalendarHeader />

        {/* Calendar View */}
        <section className="flex-1 min-h-0">
          <div
            style={{
              animationDelay: '500ms',
            }}
            className="animate-fade-in h-full"
          >
            {appointmentsLoading ? (
              <div className="flex h-full items-center justify-center text-text-secondary">
                Caricamento appuntamenti...
              </div>
            ) : (
              <CalendarView
                appointments={appointments}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                onNewAppointment={handleNewAppointment}
              />
            )}
          </div>
        </section>
      </div>

      {/* Modals/Drawers - Lazy loaded solo quando aperti */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <Suspense fallback={<LoadingState message="Caricamento form appuntamento..." />}>
              <AppointmentForm
                appointment={editingAppointment || undefined}
                athletes={athletes}
                onSubmit={(data) => {
                  handleFormSubmit(data, editingAppointment).then(() => handleCloseForm())
                }}
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
                onEdit={handleEdit}
                onCancel={() => handleCancel(selectedAppointment.id).then(() => handleCloseDetail())}
                onDelete={() => handleDelete(selectedAppointment.id).then(() => handleCloseDetail())}
                onClose={handleCloseDetail}
                loading={loading}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
