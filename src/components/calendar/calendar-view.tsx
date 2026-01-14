'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import type FullCalendarComponent from '@fullcalendar/react'
import type { CalendarApi, EventClickArg, EventInput, PluginDef, EventDropArg } from '@fullcalendar/core'
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { AppointmentUI, AppointmentColor } from '@/types/appointment'
import { APPOINTMENT_COLORS } from '@/types/appointment'
import { cn } from '@/lib/utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CalendarView')

interface CalendarViewProps {
  appointments: AppointmentUI[]
  onEventClick?: (appointment: AppointmentUI, position: { x: number; y: number }) => void
  onDateClick?: (date: string) => void
  onNewAppointment?: () => void
  onEventDrop?: (appointmentId: string, newStart: Date, newEnd: Date) => Promise<void>
  onEventResize?: (appointmentId: string, newStart: Date, newEnd: Date) => Promise<void>
  onSelectSlot?: (start: Date, end: Date) => void
  /** Data a cui navigare (vista giorno) */
  navigateToDate?: Date | null
  /** Callback quando la navigazione è completata */
  onNavigateComplete?: () => void
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'

const VIEW_LABELS: Record<ViewType, string> = {
  dayGridMonth: 'Mese',
  timeGridWeek: 'Settimana',
  timeGridDay: 'Giorno',
  listWeek: 'Agenda',
}

export function CalendarView({
  appointments,
  onEventClick,
  onDateClick: _onDateClick,
  onNewAppointment,
  onEventDrop,
  onEventResize,
  onSelectSlot,
  navigateToDate,
  onNavigateComplete,
}: CalendarViewProps) {
  // onDateClick mantenuto per retrocompatibilità ma non usato (usiamo onSelectSlot)
  void _onDateClick
  const [view, setView] = useState<ViewType>('dayGridMonth')
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTitle, setCurrentTitle] = useState('')
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: { title: string; time: string; type: string } } | null>(null)
  
  interface CalendarModules {
    FullCalendar: typeof import('@fullcalendar/react').default
    dayGridPlugin: PluginDef
    timeGridPlugin: PluginDef
    interactionPlugin: PluginDef
    listPlugin: PluginDef
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
          { default: listPlugin },
        ] = await Promise.all([
          import('@fullcalendar/react'),
          import('@fullcalendar/daygrid'),
          import('@fullcalendar/timegrid'),
          import('@fullcalendar/interaction'),
          import('@fullcalendar/list'),
        ])

        setCalendarComponents({
          FullCalendar,
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin,
        })
        setIsLoaded(true)
      } catch (error) {
        logger.error('Errore nel caricamento FullCalendar', error)
      }
    }

    loadCalendar()
  }, [])

  // Aggiorna il titolo quando cambia la vista
  useEffect(() => {
    if (calendarRef.current && isLoaded) {
      const api = calendarRef.current.getApi()
      setCurrentTitle(api.view.title)
    }
  }, [isLoaded, view])

  // Naviga a una data specifica quando richiesto (vista giorno)
  useEffect(() => {
    if (navigateToDate && calendarRef.current && isLoaded) {
      const api = calendarRef.current.getApi()
      api.changeView('timeGridDay', navigateToDate)
      setView('timeGridDay')
      setTimeout(() => {
        setCurrentTitle(api.view.title)
        onNavigateComplete?.()
      }, 0)
    }
  }, [navigateToDate, isLoaded, onNavigateComplete])

  // Converti gli appuntamenti per FullCalendar con colori personalizzati
  const events: EventInput[] = useMemo(
    () =>
      appointments.map((appointment) => {
        let eventClass = 'fc-event-type-allenamento'
        if (appointment.type === 'prova') {
          eventClass = 'fc-event-type-prova'
        } else if (appointment.type === 'valutazione') {
          eventClass = 'fc-event-type-valutazione'
        }

        const classNames = [eventClass]
        if (appointment.cancelled_at) {
          classNames.push('fc-event-cancelled')
        }
        if (appointment.recurrence_rule) {
          classNames.push('fc-event-recurring')
        }
        const title = appointment.athlete_name || 'Appuntamento'

        const colorKey = (appointment.color || 'azzurro') as AppointmentColor
        const backgroundColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro

        return {
          id: appointment.id,
          title,
          start: appointment.starts_at,
          end: appointment.ends_at,
          classNames,
          backgroundColor,
          borderColor: backgroundColor,
          extendedProps: {
            athlete: appointment.athlete_name,
            type: appointment.type,
            location: appointment.location,
            notes: appointment.notes,
            cancelled_at: appointment.cancelled_at,
            recurrence_rule: appointment.recurrence_rule,
            color: appointment.color,
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

    const rect = clickInfo.el.getBoundingClientRect()
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    }

    onEventClick?.(appointment, position)
  }

  const handleDateClick = (arg: DateClickArg) => {
    if (view === 'dayGridMonth') {
      // In vista mese, passa alla vista giorno
      setView('timeGridDay')
      setTimeout(() => {
        const calendarApi = calendarRef.current?.getApi()
        calendarApi?.changeView('timeGridDay', arg.date)
      }, 0)
    } else {
      // In vista giorno/settimana, apri form con l'orario cliccato
      // arg.date contiene data + orario completo
      const start = arg.date
      const end = new Date(start.getTime() + 60 * 60 * 1000) // +1 ora
      onSelectSlot?.(start, end)
    }
  }

  const handleEventDrop = async (info: EventDropArg) => {
    if (!info.event.start || !info.event.end) {
      info.revert()
      return
    }
    
    try {
      await onEventDrop?.(info.event.id, info.event.start, info.event.end)
    } catch {
      info.revert()
    }
  }

  const handleEventResize = async (info: EventResizeDoneArg) => {
    if (!info.event.start || !info.event.end) {
      info.revert()
      return
    }
    
    try {
      await onEventResize?.(info.event.id, info.event.start, info.event.end)
    } catch {
      info.revert()
    }
  }

  const handleSelect = (info: { start: Date; end: Date }) => {
    onSelectSlot?.(info.start, info.end)
  }

  const handleEventMouseEnter = (info: { el: HTMLElement; event: { title: string; start: Date | null; end: Date | null; extendedProps: Record<string, unknown> } }) => {
    const rect = info.el.getBoundingClientRect()
    const startTime = info.event.start ? new Date(info.event.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''
    const endTime = info.event.end ? new Date(info.event.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''
    
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      content: {
        title: info.event.title,
        time: `${startTime} - ${endTime}`,
        type: (info.event.extendedProps?.type as string) || 'allenamento',
      },
    })
  }

  const handleEventMouseLeave = () => {
    setTooltip(null)
  }

  const changeView = (newView: ViewType) => {
    setView(newView)
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.changeView(newView)
  }

  const handlePrev = () => {
    const api = calendarRef.current?.getApi()
    api?.prev()
    setTimeout(() => setCurrentTitle(api?.view.title || ''), 0)
  }

  const handleNext = () => {
    const api = calendarRef.current?.getApi()
    api?.next()
    setTimeout(() => setCurrentTitle(api?.view.title || ''), 0)
  }

  const handleToday = () => {
    const api = calendarRef.current?.getApi()
    api?.today()
    setTimeout(() => setCurrentTitle(api?.view.title || ''), 0)
  }

  useEffect(() => {
    if (!calendarRef.current || !isLoaded || !calendarComponents) return

    const calendarApi: CalendarApi | undefined = calendarRef.current.getApi?.()
    if (!calendarApi) return

    const handleViewChange = () => {
      const currentView = calendarApi.view.type as ViewType
      if (currentView !== view) {
        setView(currentView)
      }
      setCurrentTitle(calendarApi.view.title)
    }

    calendarApi.on('datesSet', handleViewChange)

    return () => {
      calendarApi.off('datesSet', handleViewChange)
    }
  }, [isLoaded, view, calendarComponents])

  if (!isLoaded || !calendarComponents) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8AB4F8] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#9AA0A6] text-sm">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  const { FullCalendar, dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin } = calendarComponents

  return (
    <div className="h-full flex flex-col">
      {/* Header Google Style */}
      <div className="flex items-center justify-between py-3 px-1 border-b border-[#3C4043]">
        {/* Left: Navigation */}
        <div className="flex items-center gap-3">
          {/* Today Button */}
          <button
            data-action="today"
            onClick={handleToday}
            className="h-9 px-4 rounded-md border border-[#5F6368] text-[#E8EAED] text-sm font-medium hover:bg-[#3C4043] transition-colors"
          >
            Oggi
          </button>
          
          {/* Nav Arrows */}
          <div className="flex items-center">
            <button
              data-action="prev"
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-[#3C4043] transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-[#9AA0A6]" />
            </button>
            <button
              data-action="next"
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-[#3C4043] transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-[#9AA0A6]" />
            </button>
          </div>
          
          {/* Current Title */}
          <h2 className="text-xl font-normal text-[#E8EAED] capitalize">
            {currentTitle}
          </h2>
        </div>

        {/* Right: View Tabs */}
        <div className="flex items-center gap-1 bg-[#303134] rounded-lg p-1">
          {(Object.keys(VIEW_LABELS) as ViewType[]).map((viewKey) => (
            <button
              key={viewKey}
              data-view={viewKey}
              onClick={() => changeView(viewKey)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === viewKey
                  ? 'bg-[#8AB4F8] text-[#202124]'
                  : 'text-[#E8EAED] hover:bg-[#3C4043]'
              )}
            >
              {VIEW_LABELS[viewKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 min-h-0 relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={view}
          headerToolbar={false}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDurationEditable={true}
          eventStartEditable={true}
          select={handleSelect}
          selectable={true}
          selectMirror={true}
          selectMinDistance={5}
          unselectAuto={true}
          height="100%"
          locale="it"
          buttonText={{
            today: 'Oggi',
            month: 'Mese',
            week: 'Settimana',
            day: 'Giorno',
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          nowIndicator={true}
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
          slotDuration="00:15:00"
          snapDuration="00:15:00"
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
        />
        
        {/* Tooltip */}
        {tooltip && tooltip.visible && (
          <div
            className="fixed z-[200] px-3 py-2 rounded-lg bg-[#303134] border border-[#5F6368] shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-sm font-medium text-[#E8EAED]">{tooltip.content.title}</div>
            <div className="text-xs text-[#9AA0A6] mt-0.5">{tooltip.content.time}</div>
          </div>
        )}
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={onNewAppointment}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#8AB4F8] hover:bg-[#AECBFA] shadow-lg shadow-[#8AB4F8]/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6 text-[#202124]" />
      </button>
    </div>
  )
}
