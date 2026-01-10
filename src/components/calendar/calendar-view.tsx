'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import type FullCalendarComponent from '@fullcalendar/react'
import type { CalendarApi, EventClickArg, EventInput, PluginDef } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { Button } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import type { AppointmentUI } from '@/types/appointment'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CalendarView')

interface CalendarViewProps {
  appointments: AppointmentUI[]
  onEventClick?: (appointment: AppointmentUI) => void
  onDateClick?: (date: string) => void
  onNewAppointment?: () => void
}

export function CalendarView({
  appointments,
  onEventClick,
  onDateClick,
  onNewAppointment,
}: CalendarViewProps) {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth')
  const [isLoaded, setIsLoaded] = useState(false)
  interface CalendarModules {
    FullCalendar: typeof import('@fullcalendar/react').default
    dayGridPlugin: PluginDef
    timeGridPlugin: PluginDef
    interactionPlugin: PluginDef
  }

  const [calendarComponents, setCalendarComponents] = useState<CalendarModules | null>(null)
  const calendarRef = useRef<FullCalendarComponent | null>(null)

  // Carica FullCalendar dinamicamente
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const [
          { default: FullCalendar },
          { default: dayGridPlugin },
          { default: timeGridPlugin },
          { default: interactionPlugin },
        ] = await Promise.all([
          import('@fullcalendar/react'),
          import('@fullcalendar/daygrid'),
          import('@fullcalendar/timegrid'),
          import('@fullcalendar/interaction'),
        ])

        setCalendarComponents({
          FullCalendar,
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        })
        setIsLoaded(true)
      } catch (error) {
        logger.error('Errore nel caricamento FullCalendar', error)
      }
    }

    loadCalendar()
  }, [])

  // Converti gli appuntamenti per FullCalendar con colori per tipo
  // useMemo per evitare ri-calcolo ad ogni render
  const events: EventInput[] = useMemo(
    () =>
      appointments.map((appointment) => {
        // Determina colore e classe CSS in base al tipo
        let eventClass = 'fc-event-type-allenamento' // default
        if (appointment.type === 'prova') {
          eventClass = 'fc-event-type-prova'
        } else if (appointment.type === 'valutazione') {
          eventClass = 'fc-event-type-valutazione'
        }

        // Aggiungi classe per ricorrenza se presente
        const classNames = [eventClass]
        if (appointment.cancelled_at) {
          classNames.push('fc-event-cancelled')
        }
        // Aggiungi indicatore visivo per ricorrenze (icona 🔄)
        if (appointment.recurrence_rule) {
          classNames.push('fc-event-recurring')
        }
        const title = appointment.athlete_name || 'Appuntamento'

        return {
          id: appointment.id,
          title,
          start: appointment.starts_at,
          end: appointment.ends_at,
          classNames,
          extendedProps: {
            athlete: appointment.athlete_name,
            type: appointment.type,
            location: appointment.location,
            notes: appointment.notes,
            cancelled_at: appointment.cancelled_at,
            recurrence_rule: appointment.recurrence_rule,
          },
        }
      }),
    [appointments],
  )

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!clickInfo.event.start || !clickInfo.event.end) return

    const baseAppointment = appointments.find(
      (appointment) => appointment.id === clickInfo.event.id,
    )
    if (!baseAppointment) return

    const appointment: AppointmentUI = {
      ...baseAppointment,
      starts_at: clickInfo.event.start.toISOString(),
      ends_at: clickInfo.event.end?.toISOString() ?? baseAppointment.ends_at,
      athlete_name:
        (clickInfo.event.extendedProps?.athlete as string | undefined) ||
        baseAppointment.athlete_name ||
        '',
      type:
        (clickInfo.event.extendedProps?.type as 'allenamento' | 'prova' | 'valutazione') ||
        baseAppointment.type,
      location:
        (clickInfo.event.extendedProps?.location as string | undefined) ??
        baseAppointment.location ??
        null,
      notes:
        (clickInfo.event.extendedProps?.notes as string | undefined) ??
        baseAppointment.notes ??
        null,
      cancelled_at:
        (clickInfo.event.extendedProps?.cancelled_at as string | undefined) ??
        baseAppointment.cancelled_at ??
        null,
      recurrence_rule:
        (clickInfo.event.extendedProps?.recurrence_rule as string | undefined) ??
        baseAppointment.recurrence_rule ??
        null,
    }

    onEventClick?.(appointment)
  }

  const handleDateClick = (arg: DateClickArg) => {
    // Cambia la vista al giorno cliccato (solo se siamo in vista mensile)
    if (view === 'dayGridMonth') {
      // Aggiorna prima lo stato React, poi FullCalendar
      setView('timeGridDay')
      // Usa setTimeout per assicurarsi che lo stato React sia aggiornato
      setTimeout(() => {
        const calendarApi = calendarRef.current?.getApi()
        calendarApi?.changeView('timeGridDay', arg.date)
      }, 0)
      // Non chiamare onDateClick quando cambiamo solo la vista
    } else {
      // Se siamo già in vista giornaliera/settimanale, apri il form
      onDateClick?.(arg.dateStr)
    }
  }

  const changeView = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setView(newView)
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.changeView(newView)
  }

  // Sincronizza lo stato della vista quando FullCalendar cambia vista
  useEffect(() => {
    if (!calendarRef.current || !isLoaded || !calendarComponents) return

    const calendarApi: CalendarApi | undefined = calendarRef.current.getApi?.()
    if (!calendarApi) return

    const handleViewChange = () => {
      const currentView = calendarApi.view.type as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
      if (currentView !== view) {
        setView(currentView)
      }
    }

    calendarApi.on('datesSet', handleViewChange)

    return () => {
      calendarApi.off('datesSet', handleViewChange)
    }
  }, [isLoaded, view, calendarComponents])

  if (!isLoaded || !calendarComponents) {
    return (
      <div className="relative p-4">
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-text-secondary">Caricamento calendario...</p>
          </div>
        </div>
      </div>
    )
  }

  const { FullCalendar, dayGridPlugin, timeGridPlugin, interactionPlugin } = calendarComponents

  return (
    <div className="relative p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Calendario Appuntamenti</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={view}
              onValueChange={(value) =>
                changeView(value as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')
              }
            >
              <TabsList className="border-teal-500/20 !bg-transparent">
                <TabsTrigger
                  value="dayGridMonth"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 border-teal-500/30 hover:bg-teal-500/10"
                >
                  Mese
                </TabsTrigger>
                <TabsTrigger
                  value="timeGridWeek"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 border-teal-500/30 hover:bg-teal-500/10"
                >
                  Settimana
                </TabsTrigger>
                <TabsTrigger
                  value="timeGridDay"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 border-teal-500/30 hover:bg-teal-500/10"
                >
                  Giorno
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="primary"
              size="sm"
              onClick={onNewAppointment}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 text-white"
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuovo
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="relative h-[calc(100vh-280px)] min-h-[600px] rounded-lg overflow-hidden">
        <div className="h-full p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="100%"
            locale="it"
            buttonText={{
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
            }}
            dayHeaderFormat={{ weekday: 'short' }}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={false}
            nowIndicator={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            firstDay={1}
            weekNumbers={false}
            eventTextColor="#ffffff"
            eventBorderColor="transparent"
          />
        </div>
      </div>
    </div>
  )
}
