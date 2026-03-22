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
import { SkeletonAppointmentsList } from '@/components/shared/ui/skeleton'

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
  /** Tema colori: teal (default) per PT/dashboard, amber per massaggiatore */
  theme?: 'teal' | 'amber'
  /** Mappa athlete_id -> lezioni rimanenti (per mostrare "Rimasti" in ogni riga) */
  lessonsRemainingMap?: Map<string, number>
  /** Mappa athlete_id -> email (per modal invio email) */
  athleteEmailMap?: Map<string, string>
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
  theme = 'teal',
  lessonsRemainingMap,
  athleteEmailMap,
}: AppointmentsListProps) {
  if (appointmentsLoading) {
    return <SkeletonAppointmentsList rows={6} className="py-4" />
  }

  const hasActiveFilters = !!(searchTerm || statusFilter !== 'tutti')
  const _isAmber = theme === 'amber'
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] py-16 text-center px-4">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border border-white/10 bg-white/[0.04] p-6 text-text-tertiary">
            <Calendar className="h-12 w-12" />
          </div>
        </div>
        <h3 className="text-text-primary mb-2 text-xl font-semibold">
          {hasActiveFilters ? 'Nessun risultato per i filtri attivi' : 'Nessun appuntamento'}
        </h3>
        <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
          {hasActiveFilters
            ? 'I filtri attuali non corrispondono a nessun appuntamento. Modifica i filtri o azzerali.'
            : 'Inizia aggiungendo il tuo primo appuntamento per gestire le sessioni con i tuoi atleti.'}
        </p>
        {hasActiveFilters ? (
          <Button
            variant="outline"
            onClick={onSearchClear}
            className="border-white/10 hover:border-white/20"
          >
            Rimuovi filtri
          </Button>
        ) : (
          <Button onClick={onNewAppointment} variant="primary">
            <Calendar className="mr-2 h-4 w-4" />
            Nuovo Appuntamento
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
          lessonsRemaining={apt.athlete_id ? lessonsRemainingMap?.get(apt.athlete_id) : undefined}
          athleteEmail={apt.athlete_id ? athleteEmailMap?.get(apt.athlete_id) : undefined}
        />
      ))}
    </div>
  )
}
