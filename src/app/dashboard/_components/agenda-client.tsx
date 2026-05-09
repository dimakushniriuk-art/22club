'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AgendaTimeline } from '@/components/dashboard'
import { useToast } from '@/components/ui/toast'
import type { AgendaEvent } from '@/types/agenda-event'

interface AgendaClientProps {
  initialEvents: AgendaEvent[]
  hasMoreAppointments?: boolean
  appointmentsTotalCount?: number
  loadError?: string | null
  /** Arricchimento crediti lezioni dopo il fetch agenda (evita sensazione di lista “finale” prematura). */
  lessonsLoading?: boolean
  /** Errore fetch crediti lezioni (non blocca la lista appuntamenti). */
  lessonsLoadError?: string | null
  /** Layout colonna dashboard (stesso stile degli altri widget) */
  embedded?: boolean
}

export function AgendaClient({
  initialEvents,
  hasMoreAppointments = false,
  appointmentsTotalCount = 0,
  loadError = null,
  lessonsLoading = false,
  lessonsLoadError = null,
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
      {lessonsLoadError ? (
        <p
          className={
            embedded
              ? 'shrink-0 rounded-md border border-state-error/20 bg-state-error/10 px-2 py-1.5 text-[10px] text-state-error'
              : 'mb-2 rounded-md border border-state-error/25 bg-state-error/10 px-2.5 py-2 text-xs text-state-error'
          }
          role="status"
        >
          {lessonsLoadError}
        </p>
      ) : null}
      {!lessonsLoadError ? (
        <p
          className={cn(
            embedded
              ? 'shrink-0 text-[10px] text-text-secondary/90'
              : 'mb-2 text-xs text-text-secondary',
            !lessonsLoading && 'invisible',
          )}
          aria-live={lessonsLoading ? 'polite' : undefined}
          aria-hidden={!lessonsLoading}
        >
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full bg-cyan-400/80 align-middle',
              lessonsLoading ? 'animate-pulse' : 'animate-none',
            )}
            aria-hidden="true"
          />{' '}
          Aggiornamento crediti lezioni…
        </p>
      ) : null}
      <AgendaTimeline events={initialEvents} loading={false} embedded={embedded} />
    </>
  )

  if (embedded) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col gap-2"
        aria-busy={lessonsLoading}
        aria-label={lessonsLoading ? 'Agenda, caricamento crediti lezioni in corso' : undefined}
      >
        {body}
      </div>
    )
  }

  return body
}
