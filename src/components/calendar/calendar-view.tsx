'use client'

import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'
import type FullCalendarComponent from '@fullcalendar/react'
import type {
  CalendarApi,
  EventClickArg,
  EventInput,
  PluginDef,
  EventDropArg,
} from '@fullcalendar/core'
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { ChevronLeft, ChevronRight, Plus, ZoomIn, ZoomOut } from 'lucide-react'
import type { AppointmentUI, AppointmentColor } from '@/types/appointment'
import { APPOINTMENT_COLORS } from '@/types/appointment'
import type { CalendarBlock } from '@/types/calendar-block'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'
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
  /** Se fornita, drag/resize abilitati solo per eventi per cui ritorna true (es. calendario atleta: solo created_by_role === 'athlete') */
  isEventEditable?: (appointment: AppointmentUI) => boolean
  /** Se true, slot Libera prenotazione sono mostrati come sfondo cyan (vista atleta) */
  openBookingAsBackground?: boolean
  /** Mappa slotKey (starts_at|ends_at) -> numero prenotazioni, per mostrare "x/N" sugli slot Libera */
  slotBookingCounts?: Record<string, number>
  /** Max prenotazioni per slot Libera (staff_calendar_settings); default 4 */
  openBookingSlotMax?: number
  /** Contenuto opzionale da mostrare all'inizio della toolbar (es. pulsante Mostra pannello) */
  toolbarLeftContent?: ReactNode
  /** Vista iniziale (da impostazioni calendario) */
  initialView?: ViewType
  /** Inizio settimana: 0 = domenica, 1 = lunedì */
  initialWeekStart?: 0 | 1
  /** Blocchi calendario (ferie, chiusura) da mostrare come sfondo grigio */
  calendarBlocks?: CalendarBlock[]
  /** Se true (es. calendario atleta): nasconde step griglia e zoom, slot fisso 1h */
  compactToolbar?: boolean
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'

const VIEW_LABELS: Record<ViewType, string> = {
  dayGridMonth: 'Mese',
  timeGridWeek: 'Settimana',
  timeGridDay: 'Giorno',
  listWeek: 'Agenda',
}

const VALID_SLOT_MINUTES = [15, 30, 45, 60, 90]

const SLOT_DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 h' },
  { value: 90, label: '1h 30min' },
]

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
  isEventEditable,
  openBookingAsBackground = false,
  slotBookingCounts,
  openBookingSlotMax = 4,
  toolbarLeftContent,
  initialView,
  initialWeekStart = 1,
  calendarBlocks = [],
  compactToolbar = false,
}: CalendarViewProps) {
  const { settings, mutate: mutateSettings } = useStaffCalendarSettings()
  const typeLabelMap = useMemo(() => {
    const m: Record<string, string> = { ...APPOINTMENT_TYPE_LABELS }
    settings?.custom_appointment_types?.forEach((c) => {
      m[c.key] = c.label
    })
    return m
  }, [settings?.custom_appointment_types])

  const { slotMinTime, slotMaxTime } = useMemo(() => {
    const toFull = (t: string) =>
      t.length >= 8 ? t.slice(0, 8) : t.length === 5 ? `${t}:00` : `${t.slice(0, 5)}:00`
    const gridMin = settings?.grid_min_time?.trim()
    const gridMax = settings?.grid_max_time?.trim()
    if (gridMin && gridMax) {
      return { slotMinTime: toFull(gridMin), slotMaxTime: toFull(gridMax) }
    }
    const def = { slotMinTime: '07:00:00', slotMaxTime: '22:00:00' }
    const wh = settings?.work_hours
    if (!wh || typeof wh !== 'object') return def
    let minStart = '24:00'
    let maxEnd = '00:00'
    Object.values(wh).forEach((v) => {
      if (v && v.start && v.end) {
        const s = v.start.trim().slice(0, 5)
        const e = v.end.trim().slice(0, 5)
        if (s < minStart) minStart = s
        if (e > maxEnd) maxEnd = e
      }
    })
    if (minStart === '24:00' || maxEnd === '00:00') return def
    return { slotMinTime: toFull(minStart), slotMaxTime: toFull(maxEnd) }
  }, [settings?.work_hours, settings?.grid_min_time, settings?.grid_max_time])

  const slotDurationStr = useMemo(() => {
    if (compactToolbar) return '01:00:00'
    const min = settings?.slot_duration_minutes ?? 15
    const clamped = VALID_SLOT_MINUTES.includes(min)
      ? min
      : VALID_SLOT_MINUTES.reduce(
          (best, curr) => (Math.abs(curr - min) < Math.abs(best - min) ? curr : best),
          15,
        )
    const hours = Math.floor(clamped / 60)
    const mins = clamped % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }, [compactToolbar, settings?.slot_duration_minutes])

  const densityClass = useMemo(() => {
    const d = settings?.view_density ?? 'comfort'
    return `fc-density-${d}`
  }, [settings?.view_density])

  // onDateClick mantenuto per retrocompatibilità ma non usato (usiamo onSelectSlot)
  void _onDateClick
  const [view, setView] = useState<ViewType>(initialView ?? 'dayGridMonth')
  const [hasAppliedInitialView, setHasAppliedInitialView] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)
  const ZOOM_MIN = 80
  const ZOOM_MAX = 140
  const ZOOM_STEP = 10
  useEffect(() => {
    if (initialView && !hasAppliedInitialView) {
      setView(initialView)
      setHasAppliedInitialView(true)
    }
  }, [initialView, hasAppliedInitialView])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTitle, setCurrentTitle] = useState('')
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: { title: string; time: string; type: string }
  } | null>(null)

  interface CalendarModules {
    FullCalendar: typeof import('@fullcalendar/react').default
    dayGridPlugin: PluginDef
    timeGridPlugin: PluginDef
    interactionPlugin: PluginDef
    listPlugin: PluginDef
  }

  const [calendarComponents, setCalendarComponents] = useState<CalendarModules | null>(null)
  const calendarRef = useRef<FullCalendarComponent | null>(null)
  const apiRef = useRef<CalendarApi | null>(null)

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

  // Sincronizza vista e firstDay quando initialView/initialWeekStart cambiano (es. dopo caricamento impostazioni)
  useEffect(() => {
    if (!calendarRef.current || !isLoaded) return
    const api = calendarRef.current.getApi?.()
    if (!api) return
    if (initialView && api.view.type !== initialView) {
      setView(initialView)
      api.changeView(initialView)
      setCurrentTitle(api.view.title)
    }
    api.setOption('firstDay', initialWeekStart)
  }, [initialView, initialWeekStart, isLoaded])

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

  // Vista Agenda (listWeek): se la settimana visibile non contiene eventi, vai alla settimana del primo evento (o primo futuro)
  useEffect(() => {
    if (!isLoaded || appointments.length === 0) return
    const t = setTimeout(() => {
      const api = apiRef.current
      if (!api || (api.view.type as string) !== 'listWeek') return
      const activeStart = api.view.activeStart
      const activeEnd = api.view.activeEnd
      const hasInRange = appointments.some((apt) => {
        const start = new Date(apt.starts_at)
        return start >= activeStart && start < activeEnd
      })
      if (hasInRange) return
      const now = new Date()
      const firstUpcoming =
        appointments.find((a) => new Date(a.starts_at) >= now) ?? appointments[0]
      api.gotoDate(firstUpcoming.starts_at)
      setCurrentTitle(api.view.title)
    }, 100)
    return () => clearTimeout(t)
  }, [isLoaded, appointments, view])

  // Cyan sfumato per Libera prenotazione in vista atleta (allineato a cyan-500 del tema)
  const OPEN_BOOKING_BG = 'rgba(6, 182, 212, 0.42)'
  const OPEN_BOOKING_BORDER = 'rgba(6, 182, 212, 0.55)'

  const BLOCK_BG = 'rgba(120, 120, 120, 0.35)'
  const REASON_LABELS: Record<string, string> = useMemo(
    () => ({ ferie: 'Ferie', chiusura: 'Chiusura', malattia: 'Malattia' }),
    [],
  )

  // Converti gli appuntamenti e i blocchi per FullCalendar
  const events: EventInput[] = useMemo(() => {
    const result: EventInput[] = calendarBlocks.map((block) => ({
      id: `block-${block.id}`,
      title: REASON_LABELS[block.reason] ?? block.reason,
      start: block.starts_at,
      end: block.ends_at,
      display: 'background' as const,
      classNames: ['fc-calendar-block'],
      backgroundColor: BLOCK_BG,
      borderColor: 'rgba(100,100,100,0.5)',
      extendedProps: { _isBlock: true },
    }))
    appointments.forEach((appointment) => {
      const isOpenSlot = appointment.is_open_booking_day === true
      if (openBookingAsBackground && isOpenSlot) {
        const slotKey = `${appointment.starts_at}|${appointment.ends_at}`
        const count = slotBookingCounts?.[slotKey] ?? 0
        result.push({
          id: appointment.id,
          title: slotBookingCounts ? `${count}/${openBookingSlotMax}` : '',
          start: appointment.starts_at,
          end: appointment.ends_at,
          display: 'background' as const,
          classNames: ['fc-open-booking-slot'],
          backgroundColor: OPEN_BOOKING_BG,
          borderColor: OPEN_BOOKING_BORDER,
          extendedProps: {
            athlete: appointment.athlete_name,
            type: appointment.type,
            location: appointment.location,
            notes: appointment.notes,
            cancelled_at: appointment.cancelled_at,
            recurrence_rule: appointment.recurrence_rule,
            color: appointment.color,
            created_by_role: appointment.created_by_role,
            is_open_booking_day: true,
          },
        })
        return
      }

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
      if (isOpenSlot) {
        classNames.push('fc-event-open-booking')
      }
      const cellWidth = compactToolbar
        ? 'full'
        : (settings?.type_cell_width?.[appointment.type] ?? 'half')
      classNames.push(cellWidth === 'half' ? 'fc-event-half-cell' : 'fc-event-full-cell')
      const typeLabel =
        typeLabelMap[appointment.type] || appointment.type?.replace(/_/g, ' ') || 'Appuntamento'
      const title = appointment.athlete_name
        ? `${typeLabel} - ${appointment.athlete_name}`
        : typeLabel

      const colorKey = (appointment.color || 'azzurro') as AppointmentColor
      let backgroundColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro
      if (appointment.lessons_remaining !== undefined && appointment.lessons_remaining <= 0) {
        backgroundColor = APPOINTMENT_COLORS.rosso
      }

      result.push({
        id: appointment.id,
        title,
        start: appointment.starts_at,
        end: appointment.ends_at,
        classNames,
        backgroundColor,
        borderColor: backgroundColor,
        extendedProps: {
          athlete: appointment.athlete_name,
          athlete_avatar_url: appointment.athlete_avatar_url,
          type: appointment.type,
          location: appointment.location,
          notes: appointment.notes,
          cancelled_at: appointment.cancelled_at,
          recurrence_rule: appointment.recurrence_rule,
          color: appointment.color,
          created_by_role: appointment.created_by_role,
          is_open_booking_day: appointment.is_open_booking_day,
          lessons_remaining: appointment.lessons_remaining,
        },
      })
    })

    // Vista mese: evento all-day di sfondo per ogni giorno con Libera prenotazione (data in locale, non UTC)
    if (openBookingAsBackground && view === 'dayGridMonth') {
      const toLocalDateStr = (iso: string) => {
        const d = new Date(iso)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      const daysWithOpenBooking = new Set<string>()
      for (const a of appointments) {
        if (a.is_open_booking_day && a.starts_at) {
          daysWithOpenBooking.add(toLocalDateStr(a.starts_at))
        }
      }
      for (const dateStr of daysWithOpenBooking) {
        result.push({
          id: `open-booking-day-${dateStr}`,
          title: '',
          start: dateStr,
          allDay: true,
          display: 'background' as const,
          classNames: ['fc-open-booking-slot'],
          backgroundColor: OPEN_BOOKING_BG,
          borderColor: OPEN_BOOKING_BORDER,
          extendedProps: {
            is_open_booking_day: true,
            _dayDate: dateStr,
          },
        })
      }
    }

    return result
  }, [
    appointments,
    calendarBlocks,
    compactToolbar,
    openBookingAsBackground,
    view,
    slotBookingCounts,
    openBookingSlotMax,
    typeLabelMap,
    REASON_LABELS,
    settings?.type_cell_width,
  ])

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!clickInfo.event.start) return

    const eventId = clickInfo.event.id as string
    let baseAppointment: AppointmentUI | undefined = appointments.find((a) => a.id === eventId)

    // Vista mese: click su giorno con Libera prenotazione (evento sintetico all-day)
    if (!baseAppointment && eventId.startsWith('open-booking-day-')) {
      const dayDate = clickInfo.event.extendedProps?._dayDate as string | undefined
      if (dayDate) {
        const toLocalDateStr = (iso: string) => {
          const d = new Date(iso)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
        baseAppointment = appointments.find(
          (a) => a.is_open_booking_day && a.starts_at && toLocalDateStr(a.starts_at) === dayDate,
        )
      }
    }

    if (!baseAppointment) return

    const endDate = clickInfo.event.end ?? baseAppointment.ends_at
    if (!endDate) return

    const isDayCellClick = eventId.startsWith('open-booking-day-')
    const appointment: AppointmentUI = {
      ...baseAppointment,
      starts_at: isDayCellClick ? baseAppointment.starts_at : clickInfo.event.start.toISOString(),
      ends_at: isDayCellClick
        ? baseAppointment.ends_at
        : (clickInfo.event.end?.toISOString() ?? baseAppointment.ends_at),
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
      created_by_role:
        (clickInfo.event.extendedProps?.created_by_role as
          | 'athlete'
          | 'trainer'
          | 'admin'
          | undefined) ??
        baseAppointment.created_by_role ??
        null,
      is_open_booking_day:
        clickInfo.event.extendedProps?.is_open_booking_day ??
        baseAppointment.is_open_booking_day ??
        false,
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

  const handleEventMouseEnter = (info: {
    el: HTMLElement
    event: {
      title: string
      start: Date | null
      end: Date | null
      extendedProps: Record<string, unknown>
    }
  }) => {
    const rect = info.el.getBoundingClientRect()
    const startTime = info.event.start
      ? new Date(info.event.start).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''
    const endTime = info.event.end
      ? new Date(info.event.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      : ''

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

  const getApi = () => apiRef.current ?? calendarRef.current?.getApi?.()

  const changeView = (newView: ViewType) => {
    setView(newView)
    getApi()?.changeView(newView)
  }

  const handlePrev = () => {
    const api = getApi()
    if (!api) return
    api.prev()
    setTimeout(() => setCurrentTitle(api.view.title || ''), 50)
  }

  const handleNext = () => {
    const api = getApi()
    if (!api) return
    api.next()
    setTimeout(() => setCurrentTitle(api.view.title || ''), 50)
  }

  const handleToday = () => {
    const api = getApi()
    if (!api) return
    api.today()
    setTimeout(() => setCurrentTitle(api.view.title || ''), 50)
  }

  useEffect(() => {
    if (!calendarRef.current || !isLoaded || !calendarComponents) return

    const calendarApi: CalendarApi | undefined = calendarRef.current.getApi?.()
    if (!calendarApi) return

    apiRef.current = calendarApi

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
      apiRef.current = null
    }
  }, [isLoaded, view, calendarComponents])

  if (!isLoaded || !calendarComponents) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  const { FullCalendar, dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin } =
    calendarComponents

  return (
    <div className="h-full flex flex-col">
      {/* Header: su mobile due righe, touch target min 44px */}
      <div className="flex flex-col gap-2 py-2 px-1 sm:flex-row sm:items-center sm:justify-between sm:py-3 sm:gap-3 rounded-t-xl bg-gradient-to-r from-primary/10 via-transparent to-transparent border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {toolbarLeftContent}
          <button
            data-action="today"
            onClick={handleToday}
            className="h-9 min-h-[44px] px-3 sm:px-4 rounded-lg border border-white/5 bg-background-secondary/40 text-text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-colors duration-200 shrink-0"
          >
            Oggi
          </button>
          <div className="flex items-center shrink-0">
            <button
              data-action="prev"
              onClick={handlePrev}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              data-action="next"
              onClick={handleNext}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-base sm:text-xl font-semibold text-text-primary capitalize truncate min-w-0">
            {currentTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
          {!compactToolbar && (
            <>
              {/* Step griglia (slot duration) */}
              <div
                className="flex items-center gap-1 rounded-lg p-1 bg-background-secondary/40 border border-white/5"
                title="Step griglia"
              >
                {SLOT_DURATION_OPTIONS.map(({ value, label }) => {
                  const active = (settings?.slot_duration_minutes ?? 15) === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => mutateSettings({ slot_duration_minutes: value })}
                      className={cn(
                        'min-h-[40px] px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 sm:px-2.5',
                        active
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'text-text-secondary border border-transparent hover:bg-background-tertiary/50 hover:text-text-primary',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {/* Zoom */}
              <div
                className="flex items-center gap-0.5 rounded-lg p-1 bg-background-secondary/40 border border-white/5"
                title="Ingrandisci / riduci griglia"
              >
                <button
                  type="button"
                  onClick={() => setZoomPercent((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                  disabled={zoomPercent <= ZOOM_MIN}
                  className="min-h-[40px] min-w-[36px] rounded-md text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                  aria-label="Riduci zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-h-[40px] px-2 flex items-center text-xs font-medium text-text-primary tabular-nums w-9 justify-center">
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomPercent((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                  disabled={zoomPercent >= ZOOM_MAX}
                  className="min-h-[40px] min-w-[36px] rounded-md text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                  aria-label="Aumenta zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
          <div className="flex items-center gap-1 rounded-lg p-1 bg-background-secondary/40 border border-white/5">
            {(Object.keys(VIEW_LABELS) as ViewType[]).map((viewKey) => (
              <button
                key={viewKey}
                data-view={viewKey}
                onClick={() => changeView(viewKey)}
                className={cn(
                  'min-h-[40px] px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 sm:px-3',
                  view === viewKey
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,255,200,0.15)]'
                    : 'text-text-secondary border border-transparent hover:bg-background-tertiary/50 hover:text-text-primary',
                )}
              >
                {VIEW_LABELS[viewKey]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Content: wrapper scrollabile + zoom sulla griglia */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto relative">
        <div
          className={cn(
            'relative origin-top-left',
            densityClass,
            compactToolbar && 'fc-athlete-full-cell',
          )}
          style={{ zoom: zoomPercent / 100 } as React.CSSProperties}
        >
          <FullCalendar
            ref={(el) => {
              calendarRef.current = el
              apiRef.current = el?.getApi?.() ?? null
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={view}
            headerToolbar={false}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventDurationEditable={
              (isEventEditable
                ? (arg: { id?: string }) => {
                    const apt = appointments.find((a) => a.id === arg.id)
                    return apt ? isEventEditable(apt) : false
                  }
                : true) as boolean
            }
            eventStartEditable={
              (isEventEditable
                ? (arg: { id?: string }) => {
                    const apt = appointments.find((a) => a.id === arg.id)
                    return apt ? isEventEditable(apt) : false
                  }
                : true) as boolean
            }
            select={handleSelect}
            selectable={true}
            selectMirror={true}
            selectMinDistance={5}
            unselectAuto={true}
            height="auto"
            locale="it"
            buttonText={{
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
            }}
            dayHeaderFormat={{ weekday: 'short' }}
            dayHeaderContent={(arg) => {
              const dayName = arg.date
                .toLocaleDateString('it-IT', { weekday: 'short' })
                .toUpperCase()
              const dayNum = arg.date.getDate()
              return {
                html: `<span class="fc-col-header-day">${dayName}</span><span class="fc-col-header-date">${dayNum}</span>`,
              }
            }}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
            allDaySlot={false}
            slotEventOverlap={false}
            nowIndicator={true}
            dayMaxEvents={5}
            moreLinkText="altri"
            weekends={true}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            firstDay={initialWeekStart}
            weekNumbers={false}
            noEventsContent="Nessun appuntamento in questo periodo. Prova il filtro «Tutti» o apri il pannello filtri."
            eventTextColor="#ffffff"
            slotDuration={slotDurationStr}
            snapDuration={slotDurationStr}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            eventContent={(arg) => {
              const isOpenSlot = arg.event.extendedProps?.is_open_booking_day === true
              const title = arg.event.title
              if (isOpenSlot && title && openBookingAsBackground) {
                return {
                  html: `<div class="fc-open-booking-slot-label">${title}</div>`,
                }
              }
              const esc = (s: string) =>
                s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;')
              // Vista Mese (day grid): avatar atleta + titolo compatto + badge lezioni
              if (arg.view.type === 'dayGridMonth') {
                const p = arg.event.extendedProps as
                  | {
                      type?: string
                      athlete?: string
                      athlete_avatar_url?: string | null
                      lessons_remaining?: number
                    }
                  | undefined
                const title = arg.event.title || ''
                const avatarUrl = p?.athlete_avatar_url?.trim()
                const athlete = p?.athlete?.trim() || ''
                const initial = athlete ? athlete.charAt(0).toUpperCase() : '?'
                const avatarHtml = avatarUrl
                  ? `<img src="${escAttr(avatarUrl)}" alt="" class="w-4 h-4 min-w-[16px] min-h-[16px] rounded-full object-cover shrink-0" />`
                  : `<span class="w-4 h-4 min-w-[16px] min-h-[16px] rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white text-[10px] font-semibold leading-none">${esc(initial)}</span>`
                const lessonsRem = p?.lessons_remaining
                const lessonsBadge =
                  lessonsRem !== undefined
                    ? `<span class="fc-event-lessons shrink-0 text-[9px] ${lessonsRem <= 0 ? 'text-white font-semibold' : 'text-white/90'}">${lessonsRem} lez.</span>`
                    : ''
                return {
                  html: `<div class="fc-daygrid-event-content flex items-center gap-1.5 min-h-0 overflow-hidden w-full"><div class="shrink-0 flex items-center justify-center">${avatarHtml}</div><span class="text-white text-[10px] leading-tight truncate min-w-0 flex-1">${esc(title)}</span>${lessonsBadge}</div>`,
                }
              }
              // Vista Giorno / Settimana (time grid): avatar atleta, tipo, atleta, orario, lezioni
              if (arg.view.type === 'timeGridDay' || arg.view.type === 'timeGridWeek') {
                const p = arg.event.extendedProps as
                  | {
                      type?: string
                      athlete?: string
                      athlete_avatar_url?: string | null
                      lessons_remaining?: number
                    }
                  | undefined
                const typeLabel =
                  (p?.type && typeLabelMap[p.type]) ||
                  (p?.type ? p.type.replace(/_/g, ' ') : '') ||
                  'Appuntamento'
                const athlete = p?.athlete?.trim() || ''
                const avatarUrl = p?.athlete_avatar_url?.trim()
                const start = arg.event.start
                const end = arg.event.end
                const timeStr =
                  start && end
                    ? `${start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })} – ${end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })}`
                    : ''
                const initial = athlete ? athlete.charAt(0).toUpperCase() : '?'
                const avatarHtml = avatarUrl
                  ? `<img src="${escAttr(avatarUrl)}" alt="" class="w-8 h-8 rounded-full object-cover shrink-0" />`
                  : `<span class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white text-xs font-semibold">${esc(initial)}</span>`
                const lessonsRem = p?.lessons_remaining
                const lessonsLine =
                  lessonsRem !== undefined
                    ? `<span class="text-white/80 text-[10px] leading-tight">${lessonsRem} lezioni</span>`
                    : ''
                const lines = [esc(typeLabel), athlete ? esc(athlete) : '', timeStr].filter(Boolean)
                return {
                  html: `<div class="fc-timegrid-event-detail flex items-start gap-2 text-left p-1.5 overflow-hidden"><div class="shrink-0">${avatarHtml}</div><div class="flex flex-col gap-0.5 min-w-0 flex-1"><span class="font-semibold text-white text-xs leading-tight">${lines[0]}</span>${lines[1] ? `<span class="text-white/95 text-[10px] leading-tight truncate">${lines[1]}</span>` : ''}${lines[2] ? `<span class="text-white/80 text-[10px] leading-tight">${lines[2]}</span>` : ''}${lessonsLine}</div></div>`,
                }
              }
              // Vista Agenda: tipo, atleta, sede, lezioni
              if (arg.view.type === 'listWeek') {
                const p = arg.event.extendedProps as
                  | {
                      type?: string
                      athlete?: string
                      location?: string
                      lessons_remaining?: number
                    }
                  | undefined
                const typeLabel =
                  (p?.type && typeLabelMap[p.type]) ||
                  (p?.type ? p.type.replace(/_/g, ' ') : '') ||
                  'Appuntamento'
                const main = p?.athlete ? `${typeLabel} – ${p.athlete}` : typeLabel
                const location = p?.location?.trim()
                const lessonsRem = p?.lessons_remaining
                const lessonsSpan =
                  lessonsRem !== undefined
                    ? `<span class="text-xs opacity-80">${lessonsRem} lezioni</span>`
                    : ''
                return {
                  html: `<div class="fc-list-event-detail flex flex-col gap-0.5"><span class="font-medium">${esc(main)}</span>${location ? `<span class="text-xs opacity-80">${esc(location)}</span>` : ''}${lessonsSpan}</div>`,
                }
              }
              return undefined
            }}
          />
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.visible && (
        <div
          className="fixed z-[200] px-3 py-2 rounded-lg bg-background-secondary/90 border border-white/5 shadow-lg backdrop-blur-sm pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-sm font-medium text-text-primary">{tooltip.content.title}</div>
          <div className="text-xs text-text-secondary mt-0.5">{tooltip.content.time}</div>
        </div>
      )}

      {/* FAB - solo se onNewAppointment fornito (es. nascosto se atleta senza trainer) */}
      {onNewAppointment && (
        <button
          onClick={onNewAppointment}
          className="fixed z-50 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full border border-cyan-400/80 bg-cyan-500 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_0_16px_rgba(34,211,238,0.25)] flex items-center justify-center transition-all duration-200 hover:border-cyan-300/90 hover:bg-cyan-400 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_0_20px_rgba(34,211,238,0.35)] hover:scale-105 active:scale-95 active:bg-cyan-600 right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))]"
          aria-label="Nuovo appuntamento"
        >
          <Plus className="h-7 w-7 shrink-0 stroke-[2.5] text-white" />
        </button>
      )}
    </div>
  )
}
