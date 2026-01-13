'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AgendaTimeline } from '@/components/dashboard'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'

const logger = createLogger('app:dashboard:_components:agenda-client')

interface AgendaEvent {
  id: string
  time: string
  athlete: string
  athlete_id?: string
  athlete_avatar?: string | null
  type: 'allenamento' | 'appuntamento' | 'consulenza'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'annullato'
  description?: string
  starts_at?: string
  ends_at?: string
}

interface AgendaClientProps {
  initialEvents: AgendaEvent[]
  hasMoreAppointments?: boolean
  appointmentsTotalCount?: number
  loadError?: string | null
}

export function AgendaClient({ initialEvents, hasMoreAppointments = false, appointmentsTotalCount = 0, loadError = null }: AgendaClientProps) {
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents)
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Mostra errore di caricamento se presente
  useEffect(() => {
    if (loadError) {
      addToast({
        title: 'Errore caricamento appuntamenti',
        message: loadError,
        variant: 'error',
        duration: 5000,
      })
    }
  }, [loadError, addToast])

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', eventToDelete)

      if (error) {
        logger.error('Errore eliminazione appuntamento', error, { eventId: eventToDelete })
        addToast({
          title: 'Errore',
          message: "Errore durante l'eliminazione dell'appuntamento. Riprova più tardi.",
          variant: 'error',
        })
        setDeleteDialogOpen(false)
        setIsDeleting(false)
        return
      }

      // Aggiorna lo stato locale
      setEvents((prev) => prev.filter((event) => event.id !== eventToDelete))
      addToast({
        title: 'Appuntamento eliminato',
        message: 'Appuntamento eliminato con successo.',
        variant: 'success',
      })
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    } catch (error) {
      logger.error('Errore eliminazione appuntamento', error, { eventId: eventToDelete })
      addToast({
        title: 'Errore',
        message: "Errore durante l'eliminazione dell'appuntamento. Riprova più tardi.",
        variant: 'error',
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setEventToDelete(null)
    }
  }

  const handleCompleteAppointment = async (eventId: string) => {
    try {
      // Aggiorna lo stato a completato nel database
      const updateData: { status: string; updated_at: string } = {
        status: 'completato',
        updated_at: new Date().toISOString(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('appointments') as any).update(updateData).eq('id', eventId)

      if (error) {
        logger.error('Errore completamento appuntamento', error, { eventId })
        addToast({
          title: 'Errore',
          message: "Errore durante il completamento dell'appuntamento. Riprova più tardi.",
          variant: 'error',
        })
        return
      }

      // Aggiorna lo stato locale
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status: 'completed' as const } : event,
        ),
      )
      addToast({
        title: 'Appuntamento completato',
        message: 'Appuntamento segnato come completato.',
        variant: 'success',
      })
    } catch (error) {
      logger.error('Errore completamento appuntamento', error, { eventId })
      addToast({
        title: 'Errore',
        message: "Errore durante il completamento dell'appuntamento. Riprova più tardi.",
        variant: 'error',
      })
    }
  }

  const handleViewProfile = (athleteId: string, athleteName: string) => {
    void athleteName
    router.push(`/dashboard/clienti/${athleteId}`)
  }

  const handleEditAppointment = (event: AgendaEvent) => {
    // Naviga alla pagina appuntamenti con l'ID dell'appuntamento
    // o apri un modal di modifica
    router.push(`/dashboard/appuntamenti?edit=${event.id}`)
  }

  return (
    <>
      {hasMoreAppointments && (
        <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
          <p className="text-amber-400 text-sm font-medium">
            ⚠️ Mostrando i primi 50 appuntamenti di {appointmentsTotalCount} totali oggi.
          </p>
          <p className="text-amber-400/80 text-xs mt-1">
            Visualizza il calendario completo per vedere tutti gli appuntamenti.
          </p>
        </div>
      )}
      <AgendaTimeline
        events={events}
        loading={false}
        onDeleteAppointment={handleDeleteClick}
        onCompleteAppointment={handleCompleteAppointment}
        onViewProfile={handleViewProfile}
        onEditAppointment={handleEditAppointment}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Elimina appuntamento"
        description="Sei sicuro di voler eliminare questo appuntamento? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  )
}
