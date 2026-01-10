// ============================================================
// Componente Lista Appuntamenti (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Calendar } from 'lucide-react'
import type { AppointmentTable } from '@/types/appointment'
import { AppointmentItem } from './appointment-item'

interface AppointmentsListProps {
  appointments: AppointmentTable[]
  appointmentsLoading: boolean
  searchTerm: string
  statusFilter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  onNewAppointment: () => void
  onSearchClear: () => void
  onView: (appointment: AppointmentTable) => void
  onEdit: (appointment: AppointmentTable) => void
  onDelete: (appointment: AppointmentTable) => void
  onComplete: (appointment: AppointmentTable) => void
  onCancel: (appointment: AppointmentTable) => void
  formatDateTime: (isoString: string) => { time: string; dateStr: string }
  getStatusColorClasses: (status: string) => string
  getAppointmentType: (apt: AppointmentTable) => string
}

export function AppointmentsList({
  appointments,
  appointmentsLoading,
  searchTerm,
  statusFilter,
  onNewAppointment,
  onSearchClear,
  onView,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  formatDateTime,
  getStatusColorClasses,
  getAppointmentType,
}: AppointmentsListProps) {
  if (appointmentsLoading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-text-secondary">Caricamento appuntamenti...</p>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="relative py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
            <Calendar className="h-12 w-12" />
          </div>
        </div>
        <h3 className="text-text-primary mb-2 text-xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Nessun appuntamento trovato
        </h3>
        <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
          {searchTerm || statusFilter !== 'tutti'
            ? 'I filtri attuali non corrispondono a nessun appuntamento. Prova a modificare i filtri di ricerca.'
            : 'Inizia aggiungendo il tuo primo appuntamento per gestire le sessioni con i tuoi atleti.'}
        </p>
        {searchTerm || statusFilter !== 'tutti' ? (
          <Button
            variant="outline"
            onClick={onSearchClear}
            className="border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-500/10"
          >
            Rimuovi filtri
          </Button>
        ) : (
          <Button
            onClick={onNewAppointment}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 hover:scale-105"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Nuovo Appuntamento
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt, index) => (
        <AppointmentItem
          key={apt.id}
          appointment={apt}
          index={index}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onCancel={onCancel}
          formatDateTime={formatDateTime}
          getStatusColorClasses={getStatusColorClasses}
          getAppointmentType={getAppointmentType}
        />
      ))}
    </div>
  )
}
