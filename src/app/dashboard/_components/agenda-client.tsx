'use client'

import { useEffect } from 'react'
import { AgendaTimeline } from '@/components/dashboard'
import { useToast } from '@/components/ui/toast'
import type { AgendaEvent } from '@/types/agenda-event'

interface AgendaClientProps {
  initialEvents: AgendaEvent[]
  hasMoreAppointments?: boolean
  appointmentsTotalCount?: number
  loadError?: string | null
  /** Layout colonna dashboard (stesso stile degli altri widget) */
  embedded?: boolean
}

export function AgendaClient({
  initialEvents,
  hasMoreAppointments = false,
  appointmentsTotalCount = 0,
  loadError = null,
  embedded = false,
}: AgendaClientProps) {
  const { addToast } = useToast()

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

  const body = (
    <>
      {hasMoreAppointments && (
        <div
          className={
            embedded
              ? 'shrink-0 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5 text-left'
              : 'mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3'
          }
        >
          <p
            className={
              embedded
                ? 'text-[11px] font-medium text-amber-400'
                : 'text-sm font-medium text-amber-400'
            }
          >
            ⚠️ Mostrando i primi 50 appuntamenti di {appointmentsTotalCount} totali oggi.
          </p>
          <p
            className={
              embedded ? 'mt-1 text-[10px] text-amber-400/85' : 'mt-1 text-xs text-amber-400/80'
            }
          >
            Visualizza il calendario completo per vedere tutti gli appuntamenti.
          </p>
        </div>
      )}
      <AgendaTimeline events={initialEvents} loading={false} embedded={embedded} />
    </>
  )

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col gap-2">{body}</div>
  }

  return body
}
