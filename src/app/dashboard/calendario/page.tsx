'use client'

import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CalendarView, AppointmentPopover, MiniCalendar } from '@/components/calendar'
import type { AppointmentUI, CreateAppointmentData, EditAppointmentData } from '@/types/appointment'
import { useCalendarPage } from '@/hooks/calendar/use-calendar-page'
import { useCalendarPageGuard } from '@/hooks/calendar/use-calendar-page-guard'
import { useStaffCalendarSettings } from '@/hooks/calendar/use-staff-calendar-settings'
import { useBirthdays } from '@/hooks/calendar/use-birthdays'
import Link from 'next/link'
import { useCalendarKeyboardShortcuts } from '@/hooks/calendar/use-calendar-keyboard-shortcuts'
import { useAuth } from '@/providers/auth-provider'
import { LoadingState } from '@/components/dashboard/loading-state'
import {
  Clock,
  ChevronRight,
  Search,
  X,
  Filter,
  Keyboard,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import {
  Drawer,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'
import { APPOINTMENT_TYPE_LABELS } from '@/lib/calendar-defaults'

type AthleteOption = { id: string; name: string }

export type CalendarTheme = 'default' | 'teal' | 'amber'

const CALENDAR_THEME_CLASSES = {
  default: {
    ring: 'focus:ring-primary focus:border-primary/30',
    hover: 'hover:bg-primary/10 hover:text-primary',
    hoverActive: 'active:bg-primary/15',
    accent: 'text-primary hover:text-primary/80',
    button: 'bg-primary text-white shadow-primary/30 hover:bg-primary/90',
  },
  teal: {
    ring: 'focus:ring-teal-500 focus:border-teal-500/30',
    hover: 'hover:bg-teal-500/10 hover:text-teal-400',
    hoverActive: 'active:bg-teal-500/15',
    accent: 'text-teal-400 hover:text-teal-400/80',
    button: 'bg-teal-600 text-white shadow-teal-500/30 hover:bg-teal-500',
  },
  amber: {
    ring: 'focus:ring-amber-500 focus:border-amber-500/30',
    hover: 'hover:bg-amber-500/10 hover:text-amber-400',
    hoverActive: 'active:bg-amber-500/15',
    accent: 'text-amber-400 hover:text-amber-400/80',
    button: 'bg-amber-600 text-white shadow-amber-500/30 hover:bg-amber-500',
  },
} as const

type FilterOption = { value: string; label: string }

type CalendarSidebarContentProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  selectedAthleteFilter: string
  onAthleteFilterChange: (value: string) => void
  typeOptions: FilterOption[]
  selectedTypeFilter: string
  onTypeFilterChange: (value: string) => void
  statusOptions: FilterOption[]
  selectedStatusFilter: string
  onStatusFilterChange: (value: string) => void
  athletes: AthleteOption[]
  appointmentDates: string[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  filteredAppointments: AppointmentUI[]
  upcomingAppointments: AppointmentUI[]
  hasActiveFilters: boolean
  onClearFilters: () => void
  onEventClickFromList: (apt: AppointmentUI, position: { x: number; y: number }) => void
  onOpenKeyboardHelp: () => void
  theme?: CalendarTheme
  /** Compleanni nel giorno selezionato */
  birthdays?: { id: string; name: string }[]
}

const CalendarSidebarContent = memo(function CalendarSidebarContent({
  searchQuery,
  onSearchQueryChange,
  selectedAthleteFilter,
  onAthleteFilterChange,
  typeOptions,
  selectedTypeFilter,
  onTypeFilterChange,
  statusOptions,
  selectedStatusFilter,
  onStatusFilterChange,
  athletes,
  appointmentDates,
  selectedDate,
  onDateSelect,
  filteredAppointments,
  upcomingAppointments,
  hasActiveFilters,
  onClearFilters,
  onEventClickFromList,
  onOpenKeyboardHelp,
  theme: themeKey = 'default',
  birthdays = [],
}: CalendarSidebarContentProps) {
  const t = CALENDAR_THEME_CLASSES[themeKey]
  const selectClass = `w-full h-10 min-h-[44px] px-3 rounded-md border border-white/10 bg-white/[0.04] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 cursor-pointer ${t.ring}`
  return (
    <>
      <div className="p-3 sm:p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            data-search
            placeholder="Cerca appuntamenti..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className={`w-full h-10 min-h-[44px] pl-9 pr-9 rounded-md border border-white/10 bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 ${t.ring}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-text-tertiary touch-manipulation ${t.hover}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-text-tertiary" />
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Filtra per atleta
          </span>
        </div>
        <select
          value={selectedAthleteFilter}
          onChange={(e) => onAthleteFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Tutti gli atleti</option>
          {athletes.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </select>
      </div>
      <div className="p-3 sm:p-4 border-b border-white/10">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider block mb-2">
          Tipo
        </span>
        <select
          value={selectedTypeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Tutti i tipi</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="p-3 sm:p-4 border-b border-white/10">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider block mb-2">
          Stato
        </span>
        <select
          value={selectedStatusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Tutti gli stati</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <div className="p-3 sm:p-4 border-b border-white/10">
          <button
            type="button"
            onClick={onClearFilters}
            className={`w-full text-xs transition-colors min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg border border-white/10 ${t.accent}`}
          >
            Rimuovi tutti i filtri
          </button>
        </div>
      )}
      <div className="p-3 sm:p-4 border-b border-white/10">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          appointmentDates={appointmentDates}
        />
      </div>
      {birthdays.length > 0 && (
        <div className="p-3 sm:p-4 border-b border-white/10 space-y-2">
          <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Compleanni oggi
          </h3>
          <ul className="text-sm text-text-primary space-y-1">
            {birthdays.map((b) => (
              <li key={b.id}>{b.name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 sm:p-4 shrink-0">
          <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
            Prossimi appuntamenti
            {hasActiveFilters && (
              <span className={`ml-1 ${t.accent}`}>({filteredAppointments.length})</span>
            )}
          </h3>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                {hasActiveFilters ? 'Nessun risultato' : 'Nessun appuntamento'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <VirtualizedUpcomingList
              items={upcomingAppointments}
              onItemClick={onEventClickFromList}
              theme={themeKey}
            />
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 border-t border-white/10">
        <button
          type="button"
          onClick={onOpenKeyboardHelp}
          className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors min-h-[44px] w-full touch-manipulation"
        >
          <Keyboard className="h-4 w-4" />
          <span>Scorciatoie tastiera</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] text-[10px]">
            ?
          </kbd>
        </button>
      </div>
    </>
  )
})

const UPCOMING_ITEM_HEIGHT_PX = 56
const UPCOMING_OVERSCAN = 2

type VirtualizedUpcomingListProps = {
  items: AppointmentUI[]
  onItemClick: (apt: AppointmentUI, position: { x: number; y: number }) => void
  theme?: CalendarTheme
}

const VirtualizedUpcomingList = memo(function VirtualizedUpcomingList({
  items,
  onItemClick,
  theme: themeKey = 'default',
}: VirtualizedUpcomingListProps) {
  const t = CALENDAR_THEME_CLASSES[themeKey]
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ scrollTop: 0, height: 200 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateHeight = () => setScrollState((s) => ({ ...s, height: el.clientHeight }))
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setScrollState((s) => ({ ...s, scrollTop: el.scrollTop }))
  }, [])

  const { scrollTop, height } = scrollState
  const totalHeight = items.length * UPCOMING_ITEM_HEIGHT_PX
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / UPCOMING_ITEM_HEIGHT_PX) - UPCOMING_OVERSCAN,
  )
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / UPCOMING_ITEM_HEIGHT_PX) + UPCOMING_OVERSCAN,
  )
  const visibleItems = items.slice(startIndex, endIndex)

  if (items.length === 0) return null

  const bottomSpacerHeight = (items.length - endIndex) * UPCOMING_ITEM_HEIGHT_PX

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto min-h-0"
      onScroll={onScroll}
      role="list"
    >
      <div style={{ height: totalHeight }}>
        <div style={{ height: startIndex * UPCOMING_ITEM_HEIGHT_PX }} aria-hidden />
        {visibleItems.map((apt) => {
          const colorKey = (apt.color || 'azzurro') as AppointmentColor
          const bgColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro
          return (
            <div
              key={apt.id}
              role="listitem"
              style={{ height: UPCOMING_ITEM_HEIGHT_PX }}
              className="px-3 flex items-center"
            >
              <button
                type="button"
                onClick={() => onItemClick(apt, { x: 0, y: 0 })}
                className={`w-full text-left p-3 rounded-xl transition-colors min-h-[44px] touch-manipulation ${t.hover} ${t.hoverActive}`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm mt-1 shrink-0"
                    style={{ backgroundColor: bgColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {apt.athlete_name || 'Appuntamento'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatRelativeDate(apt.starts_at)} · {formatTime(apt.starts_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                </div>
              </button>
            </div>
          )
        })}
        <div style={{ height: bottomSpacerHeight }} aria-hidden />
      </div>
    </div>
  )
})

// Lazy load del form
const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({
    default: mod.AppointmentForm,
  })),
)

// Prefetch del chunk del form al mount
function usePrefetchCalendarForm() {
  useEffect(() => {
    import('@/components/calendar')
  }, [])
}

// Helper per creare ISO string mantenendo l'ora locale
function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  if (dateOnly.getTime() === today.getTime()) return 'Oggi'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Domani'
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}

function appointmentToEditData(apt: AppointmentUI): EditAppointmentData {
  return {
    id: apt.id,
    org_id: apt.org_id ?? undefined,
    athlete_id: apt.athlete_id ?? undefined,
    staff_id: apt.staff_id ?? undefined,
    starts_at: apt.starts_at,
    ends_at: apt.ends_at,
    status: apt.status,
    type: apt.type,
    color: apt.color ?? undefined,
    location: apt.location ?? undefined,
    notes: apt.notes ?? undefined,
  }
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="min-w-[24px] h-6 px-2 flex items-center justify-center rounded bg-background-tertiary border border-border text-xs text-text-primary font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}

/** Skeleton della griglia calendario durante il caricamento appuntamenti */
function CalendarPageSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-32 rounded-lg bg-background-tertiary" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-lg bg-background-tertiary" />
          <div className="h-9 w-9 rounded-lg bg-background-tertiary" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-background-tertiary" />
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px min-h-0">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-background-tertiary/80" />
        ))}
      </div>
    </div>
  )
}

function KeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background-secondary rounded-xl shadow-2xl overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium text-text-primary">Scorciatoie tastiera</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-background-tertiary transition-colors"
          >
            <X className="h-5 w-5 text-text-tertiary" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Navigazione
            </h3>
            <div className="space-y-2">
              <ShortcutRow keys={['T']} description="Vai a oggi" />
              <ShortcutRow keys={['←']} description="Periodo precedente" />
              <ShortcutRow keys={['→']} description="Periodo successivo" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Cambia vista
            </h3>
            <div className="space-y-2">
              <ShortcutRow keys={['M']} description="Vista mese" />
              <ShortcutRow keys={['W']} description="Vista settimana" />
              <ShortcutRow keys={['D']} description="Vista giorno" />
              <ShortcutRow keys={['A']} description="Vista agenda" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Azioni
            </h3>
            <div className="space-y-2">
              <ShortcutRow keys={['N']} description="Nuovo appuntamento" />
              <ShortcutRow keys={['/']} description="Cerca" />
              <ShortcutRow keys={['?']} description="Mostra scorciatoie" />
              <ShortcutRow keys={['Esc']} description="Chiudi popup/modal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CALENDAR_LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

type CalendarPageContentProps = { basePath?: string }

export function CalendarPageContent({
  basePath = '/dashboard/calendario',
}: CalendarPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role } = useAuth()
  const calendarTheme: CalendarTheme =
    role === 'massaggiatore' ? 'amber' : role === 'nutrizionista' ? 'teal' : 'default'
  const _themeButtonClasses = CALENDAR_THEME_CLASSES[calendarTheme].button
  const { settings: calendarSettings } = useStaffCalendarSettings()
  const initialCalendarView =
    calendarSettings?.default_calendar_view === 'week'
      ? 'timeGridWeek'
      : calendarSettings?.default_calendar_view === 'day'
        ? 'timeGridDay'
        : calendarSettings?.default_calendar_view === 'agenda'
          ? 'listWeek'
          : 'dayGridMonth'
  const initialWeekStart = calendarSettings?.default_week_start === 'sunday' ? 0 : 1

  const {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    staffProfileId,
    calendarBlocks,
    loading,
    handleFormSubmit,
    handleCancel,
    handleDelete,
    handleComplete,
    handleNoShow,
    handleEventDrop,
    handleEventResize,
  } = useCalendarPage()

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<EditAppointmentData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const birthdays = useBirthdays(selectedDate, calendarSettings?.org_id ?? null)

  // Filtri: stato iniziale da URL, poi sincronizzati con URL ai cambi
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '')
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState<string>(
    () => searchParams.get('athlete') ?? '',
  )
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(
    () => searchParams.get('type') ?? '',
  )
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(
    () => searchParams.get('status') ?? '',
  )
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    action: 'delete' | 'cancel' | 'complete'
    appointmentId: string
  } | null>(null)
  const [overlapConfirmData, setOverlapConfirmData] = useState<{
    data: CreateAppointmentData
    editingAppointment: EditAppointmentData | null
  } | null>(null)
  /** Dialog annullamento con regole 24h: annulla / annulla e scala / annulla senza scalare */
  const [cancelChoiceAppointment, setCancelChoiceAppointment] = useState<AppointmentUI | null>(null)
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  usePrefetchCalendarForm()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 851px)')
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const urlQ = searchParams.get('q') ?? ''
  const urlAthlete = searchParams.get('athlete') ?? ''
  const urlType = searchParams.get('type') ?? ''
  const urlStatus = searchParams.get('status') ?? ''
  useEffect(() => {
    setSearchQuery(urlQ)
    setSelectedAthleteFilter(urlAthlete)
    setSelectedTypeFilter(urlType)
    setSelectedStatusFilter(urlStatus)
  }, [urlQ, urlAthlete, urlType, urlStatus])

  // Aggiorna URL quando cambiano i filtri (persistenza e link condivisibili)
  const updateUrlFilters = useCallback(
    (updates: { q?: string; athlete?: string; type?: string; status?: string }) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (updates.q !== undefined) {
        if (updates.q.trim()) params.set('q', updates.q.trim())
        else params.delete('q')
      }
      if (updates.athlete !== undefined) {
        if (updates.athlete) params.set('athlete', updates.athlete)
        else params.delete('athlete')
      }
      if (updates.type !== undefined) {
        if (updates.type) params.set('type', updates.type)
        else params.delete('type')
      }
      if (updates.status !== undefined) {
        if (updates.status) params.set('status', updates.status)
        else params.delete('status')
      }
      const query = params.toString()
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      })
    },
    [router, basePath],
  )

  const onSearchQueryChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      updateUrlFilters({
        q: value,
        athlete: selectedAthleteFilter,
        type: selectedTypeFilter,
        status: selectedStatusFilter,
      })
    },
    [selectedAthleteFilter, selectedTypeFilter, selectedStatusFilter, updateUrlFilters],
  )

  const onAthleteFilterChange = useCallback(
    (value: string) => {
      setSelectedAthleteFilter(value)
      updateUrlFilters({
        q: searchQuery,
        athlete: value,
        type: selectedTypeFilter,
        status: selectedStatusFilter,
      })
    },
    [searchQuery, selectedTypeFilter, selectedStatusFilter, updateUrlFilters],
  )

  const onTypeFilterChange = useCallback(
    (value: string) => {
      setSelectedTypeFilter(value)
      updateUrlFilters({
        q: searchQuery,
        athlete: selectedAthleteFilter,
        type: value,
        status: selectedStatusFilter,
      })
    },
    [searchQuery, selectedAthleteFilter, selectedStatusFilter, updateUrlFilters],
  )

  const onStatusFilterChange = useCallback(
    (value: string) => {
      setSelectedStatusFilter(value)
      updateUrlFilters({
        q: searchQuery,
        athlete: selectedAthleteFilter,
        type: selectedTypeFilter,
        status: value,
      })
    },
    [searchQuery, selectedAthleteFilter, selectedTypeFilter, updateUrlFilters],
  )

  // Tipi per il filtro: tutte le tipologie abilitate in impostazioni (come in "Tipologie abilitate")
  const typeOptions = useMemo(() => {
    const customMap: Record<string, string> = {}
    calendarSettings?.custom_appointment_types?.forEach((c) => {
      customMap[c.key] = c.label
    })
    const getLabel = (key: string) =>
      customMap[key] ?? APPOINTMENT_TYPE_LABELS[key] ?? key.replace(/_/g, ' ')

    const enabled = calendarSettings?.enabled_appointment_types ?? []
    const customKeys = (calendarSettings?.custom_appointment_types ?? []).map((c) => c.key)
    if (enabled.length > 0 || customKeys.length > 0) {
      const keys = [...enabled, ...customKeys]
      return keys
        .filter((k, i, arr) => arr.indexOf(k) === i)
        .sort((a, b) => getLabel(a).localeCompare(getLabel(b)))
        .map((value) => ({ value, label: getLabel(value) }))
    }
    // Fallback: tipi presenti negli appuntamenti (es. prima del primo salvataggio impostazioni)
    const fromAppointments = Array.from(new Set(appointments.map((a) => a.type).filter(Boolean)))
    return fromAppointments
      .sort((a, b) => getLabel(a).localeCompare(getLabel(b)))
      .map((value) => ({ value, label: getLabel(value) }))
  }, [
    appointments,
    calendarSettings?.enabled_appointment_types,
    calendarSettings?.custom_appointment_types,
  ])

  const statusOptions: FilterOption[] = useMemo(
    () => [
      { value: 'attivo', label: 'Attivi' },
      { value: 'completato', label: 'Completati' },
      { value: 'annullato', label: 'Annullati' },
      { value: 'in_corso', label: 'In corso' },
    ],
    [],
  )

  // Filtra appuntamenti in base a tutti i filtri
  const filteredAppointments = useMemo(() => {
    let result = appointments

    if (selectedAthleteFilter) {
      result = result.filter((apt) => apt.athlete_id === selectedAthleteFilter)
    }

    if (selectedTypeFilter) {
      result = result.filter((apt) => apt.type === selectedTypeFilter)
    }

    if (selectedStatusFilter) {
      result = result.filter((apt) => apt.status === selectedStatusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (apt) =>
          apt.athlete_name?.toLowerCase().includes(query) ||
          apt.notes?.toLowerCase().includes(query) ||
          apt.location?.toLowerCase().includes(query) ||
          apt.type.toLowerCase().includes(query),
      )
    }

    return result
  }, [appointments, selectedAthleteFilter, selectedTypeFilter, selectedStatusFilter, searchQuery])

  // Prossimi appuntamenti (oggi e futuri, lista virtualizzata)
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return filteredAppointments
      .filter((apt) => new Date(apt.starts_at) >= now && apt.status === 'attivo')
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  }, [filteredAppointments])

  useCalendarKeyboardShortcuts({
    showForm,
    showPopover,
    setShowForm,
    setShowPopover,
    setShowKeyboardHelp,
  })

  const newParam = searchParams.get('new')
  useEffect(() => {
    if (newParam === 'true') setShowForm(true)
  }, [newParam])

  const appointmentDates = useMemo(
    () => filteredAppointments.map((apt) => apt.starts_at),
    [filteredAppointments],
  )

  // Stato per comunicare navigazione al CalendarView
  const [navigateToDate, setNavigateToDate] = useState<Date | null>(null)

  const handleCloseForm = useCallback(() => {
    if (loading) return
    setShowForm(false)
    setEditingAppointment(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('new')
    const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath
    router.replace(newUrl, { scroll: false })
  }, [loading, searchParams, router, basePath])

  const handleEventClick = useCallback(
    (appointment: AppointmentUI, position: { x: number; y: number }) => {
      setSelectedAppointment(appointment)
      setPopoverPosition(position)
      setShowPopover(true)
    },
    [],
  )

  const handleDateClick = useCallback((dateStr?: string) => {
    if (dateStr) {
      setEditingAppointment(null)
      setShowForm(true)
    }
  }, [])

  const handleNewAppointment = useCallback(() => {
    setEditingAppointment(null)
    setSelectedSlot(null)
    setShowForm(true)
  }, [])

  const handleSelectSlot = useCallback((start: Date, end: Date) => {
    setSelectedSlot({ start, end })
    setEditingAppointment(null)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback(() => {
    if (selectedAppointment) setEditingAppointment(appointmentToEditData(selectedAppointment))
    setShowPopover(false)
    setShowForm(true)
  }, [selectedAppointment])

  const handleClosePopover = useCallback(() => {
    setShowPopover(false)
    setSelectedAppointment(null)
  }, [])

  const handleMiniCalendarDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setNavigateToDate(date)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedAthleteFilter('')
    setSelectedTypeFilter('')
    setSelectedStatusFilter('')
    updateUrlFilters({ q: '', athlete: '', type: '', status: '' })
  }, [updateUrlFilters])

  const hasActiveFilters = Boolean(
    searchQuery || selectedAthleteFilter || selectedTypeFilter || selectedStatusFilter,
  )

  const openFiltersDrawer = useCallback(() => setShowFiltersDrawer(true), [])
  const closeFiltersDrawer = useCallback(() => {
    setShowFiltersDrawer(false)
  }, [])

  const handleEventClickFromList = useCallback(
    (apt: AppointmentUI, position: { x: number; y: number }) => {
      closeFiltersDrawer()
      handleEventClick(apt, position)
    },
    [closeFiltersDrawer, handleEventClick],
  )

  const formInitialAppointment = useMemo(():
    | EditAppointmentData
    | CreateAppointmentData
    | undefined => {
    if (editingAppointment) return editingAppointment
    if (selectedSlot) {
      return {
        athlete_id: '',
        staff_id: '',
        starts_at: toLocalISOString(selectedSlot.start),
        ends_at: toLocalISOString(selectedSlot.end),
        type:
          role === 'massaggiatore'
            ? 'massaggio'
            : role === 'nutrizionista'
              ? 'nutrizionista'
              : 'allenamento',
        status: 'attivo' as const,
      }
    }
    return undefined
  }, [editingAppointment, selectedSlot, role])

  const handleFormSubmitClick = useCallback(
    async (data: Parameters<typeof handleFormSubmit>[0]) => {
      const result = await handleFormSubmit(data, editingAppointment)
      if ((result as { overlapDetected?: boolean } | void)?.overlapDetected) {
        setOverlapConfirmData({ data, editingAppointment })
        return
      }
      setSelectedSlot(null)
      handleCloseForm()
    },
    [editingAppointment, handleCloseForm, handleFormSubmit],
  )

  const handleFormCancel = useCallback(() => {
    setSelectedSlot(null)
    handleCloseForm()
  }, [handleCloseForm])

  const openKeyboardHelp = useCallback(() => {
    closeFiltersDrawer()
    setShowKeyboardHelp(true)
  }, [closeFiltersDrawer])

  const onNavigateComplete = useCallback(() => setNavigateToDate(null), [])

  const handlePopoverCancel = useCallback(() => {
    if (!selectedAppointment) return
    setCancelChoiceAppointment(selectedAppointment)
  }, [selectedAppointment])

  const handlePopoverDelete = useCallback(() => {
    if (!selectedAppointment) return
    setConfirmState({ action: 'delete', appointmentId: selectedAppointment.id })
  }, [selectedAppointment])

  const handlePopoverComplete = useCallback(() => {
    if (!selectedAppointment) return
    setConfirmState({ action: 'complete', appointmentId: selectedAppointment.id })
  }, [selectedAppointment])

  const canCompleteAppointment = useMemo(() => {
    if (!selectedAppointment || !staffProfileId) return false
    const apt = selectedAppointment
    if (apt.status === 'completato' || apt.status === 'annullato') return false
    if (!apt.athlete_id) return false
    if (role === 'trainer' || role === 'admin') return true
    if (role === 'nutrizionista')
      return apt.staff_id === staffProfileId && (apt.service_type ?? 'training') === 'nutrition'
    if (role === 'massaggiatore')
      return apt.staff_id === staffProfileId && (apt.service_type ?? 'training') === 'massage'
    return false
  }, [selectedAppointment, staffProfileId, role])

  const handleConfirmDialogConfirm = useCallback(() => {
    if (!confirmState) return
    const { action, appointmentId } = confirmState
    if (action === 'delete')
      return handleDelete(appointmentId)
        .then(handleClosePopover)
        .then(() => setConfirmState(null))
    if (action === 'complete')
      return handleComplete(appointmentId)
        .then(handleClosePopover)
        .then(() => setConfirmState(null))
    return handleCancel(appointmentId)
      .then(handleClosePopover)
      .then(() => setConfirmState(null))
  }, [confirmState, handleDelete, handleComplete, handleCancel, handleClosePopover])

  const hoursUntilStart = cancelChoiceAppointment
    ? (new Date(cancelChoiceAppointment.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
    : 0
  const cancelWithin24h = hoursUntilStart > 0 && hoursUntilStart < 24

  const handleCancelWithChoice = useCallback(
    (deductLesson: boolean, isException: boolean) => {
      if (!cancelChoiceAppointment) return
      handleCancel(cancelChoiceAppointment.id, {
        deductLesson,
        isException,
        appointment: cancelChoiceAppointment,
      }).then(() => {
        handleClosePopover()
        setCancelChoiceAppointment(null)
      })
    },
    [cancelChoiceAppointment, handleCancel, handleClosePopover],
  )

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setShowFiltersDrawer(open)
  }, [])

  useEffect(() => {
    if (showFiltersDrawer) {
      const t = setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('[data-search]')
        el?.focus()
      }, 150)
      return () => clearTimeout(t)
    }
    return undefined
  }, [showFiltersDrawer])

  const closeKeyboardHelp = useCallback(() => setShowKeyboardHelp(false), [])

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative">
      {/* Drawer filtri e prossimi - mobile (aperto da altro punto se necessario) */}
      <Drawer
        open={showFiltersDrawer}
        onOpenChange={handleDrawerOpenChange}
        side="left"
        size="md"
        className="w-[280px] max-w-[90vw] h-full"
      >
        <div className="flex flex-col h-full bg-background-secondary">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-sm font-semibold text-text-primary">Filtri e prossimi</span>
            <button
              type="button"
              onClick={closeFiltersDrawer}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 text-text-secondary touch-manipulation"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CalendarSidebarContent
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              selectedAthleteFilter={selectedAthleteFilter}
              onAthleteFilterChange={onAthleteFilterChange}
              typeOptions={typeOptions}
              selectedTypeFilter={selectedTypeFilter}
              onTypeFilterChange={onTypeFilterChange}
              statusOptions={statusOptions}
              selectedStatusFilter={selectedStatusFilter}
              onStatusFilterChange={onStatusFilterChange}
              athletes={athletes}
              appointmentDates={appointmentDates}
              selectedDate={selectedDate}
              onDateSelect={handleMiniCalendarDateSelect}
              filteredAppointments={filteredAppointments}
              upcomingAppointments={upcomingAppointments}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onEventClickFromList={handleEventClickFromList}
              onOpenKeyboardHelp={openKeyboardHelp}
              theme={calendarTheme}
              birthdays={birthdays}
            />
          </div>
        </div>
      </Drawer>

      {/* Sidebar - desktop lg+ (nascondibile) */}
      {showSidebar && (
        <aside className="hidden lg:flex w-[280px] flex-col shrink-0 border-r border-white/10 bg-gradient-to-b from-zinc-950 to-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <CalendarSidebarContent
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            selectedAthleteFilter={selectedAthleteFilter}
            onAthleteFilterChange={onAthleteFilterChange}
            typeOptions={typeOptions}
            selectedTypeFilter={selectedTypeFilter}
            onTypeFilterChange={onTypeFilterChange}
            statusOptions={statusOptions}
            selectedStatusFilter={selectedStatusFilter}
            onStatusFilterChange={onStatusFilterChange}
            athletes={athletes}
            appointmentDates={appointmentDates}
            selectedDate={selectedDate}
            onDateSelect={handleMiniCalendarDateSelect}
            filteredAppointments={filteredAppointments}
            upcomingAppointments={upcomingAppointments}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onEventClickFromList={handleEventClickFromList}
            onOpenKeyboardHelp={openKeyboardHelp}
            theme={calendarTheme}
            birthdays={birthdays}
          />
        </aside>
      )}

      <main className="flex-1 bg-background overflow-hidden relative min-w-0">
        <div role="status" aria-live="polite" className="sr-only">
          {filteredAppointments.length === 1
            ? '1 appuntamento'
            : `${filteredAppointments.length} appuntamenti`}
        </div>
        {appointmentsLoading ? (
          <CalendarPageSkeleton />
        ) : (
          <>
            <CalendarView
              appointments={filteredAppointments}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onNewAppointment={handleNewAppointment}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              onSelectSlot={handleSelectSlot}
              navigateToDate={navigateToDate}
              onNavigateComplete={onNavigateComplete}
              initialView={initialCalendarView}
              initialWeekStart={initialWeekStart}
              calendarBlocks={calendarBlocks}
              toolbarLeftContent={
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={openFiltersDrawer}
                    className="lg:hidden min-h-[44px] px-3 min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-text-secondary hover:bg-white/[0.04] hover:text-primary transition-colors flex"
                    title="Filtri e prossimi"
                    aria-label="Apri filtri"
                  >
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSidebar((v) => !v)}
                    className="hidden lg:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-text-secondary hover:bg-white/[0.04] hover:text-primary transition-colors"
                    title={showSidebar ? 'Nascondi pannello filtri' : 'Mostra pannello filtri'}
                    aria-label={showSidebar ? 'Nascondi pannello filtri' : 'Mostra pannello filtri'}
                  >
                    {showSidebar ? (
                      <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <PanelLeftOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  <Link
                    href={`${basePath}/impostazioni`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-text-secondary hover:bg-white/[0.04] hover:text-primary transition-colors"
                    title="Impostazioni calendario"
                    aria-label="Impostazioni calendario"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </div>
              }
            />
          </>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div
          data-testid="appointment-form-overlay"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
        >
          <div className="w-full max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto sm:max-w-2xl rounded-t-2xl sm:rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4">
            <Suspense fallback={<LoadingState message="Caricamento form..." />}>
              <AppointmentForm
                appointment={formInitialAppointment}
                athletes={athletes}
                showOpenBookingOption={role !== 'massaggiatore' && role !== 'nutrizionista'}
                defaultType={
                  role === 'massaggiatore'
                    ? 'massaggio'
                    : role === 'nutrizionista'
                      ? 'nutrizionista'
                      : undefined
                }
                defaultColor={
                  role === 'massaggiatore'
                    ? 'giallo'
                    : role === 'nutrizionista'
                      ? 'verde_chiaro'
                      : undefined
                }
                onSubmit={handleFormSubmitClick}
                onCancel={handleFormCancel}
                loading={loading || athletesLoading}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Popover (modal full width su mobile < 852px) */}
      {showPopover && selectedAppointment && (
        <AppointmentPopover
          appointment={selectedAppointment}
          position={popoverPosition}
          onEdit={handleEdit}
          onCancel={handlePopoverCancel}
          onDelete={handlePopoverDelete}
          onClose={handleClosePopover}
          onComplete={handlePopoverComplete}
          onNoShow={
            handleNoShow
              ? () => handleNoShow(selectedAppointment.id, selectedAppointment)
              : undefined
          }
          canComplete={canCompleteAppointment}
          canNoShow={
            !!selectedAppointment.athlete_id &&
            (selectedAppointment.status === 'attivo' || selectedAppointment.status === 'in_corso')
          }
          loading={loading}
          asModal={isMobile}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => !open && setConfirmState(null)}
          title={
            confirmState.action === 'delete'
              ? 'Elimina appuntamento'
              : confirmState.action === 'complete'
                ? 'Completa seduta'
                : 'Annulla appuntamento'
          }
          description={
            confirmState.action === 'delete'
              ? "L'appuntamento verrà eliminato definitivamente. Continuare?"
              : confirmState.action === 'complete'
                ? 'Confermi di completare la seduta? Verrà scalato 1 credito.'
                : "L'appuntamento verrà annullato. Continuare?"
          }
          confirmText={
            confirmState.action === 'delete'
              ? 'Elimina'
              : confirmState.action === 'complete'
                ? 'Completa'
                : 'Annulla'
          }
          variant={confirmState.action === 'complete' ? 'default' : 'destructive'}
          onConfirm={handleConfirmDialogConfirm}
          loading={loading}
          confirmTestId="appointment-confirm-dialog-confirm"
          cancelTestId="appointment-confirm-dialog-cancel"
        />
      )}

      {overlapConfirmData && (
        <ConfirmDialog
          open={!!overlapConfirmData}
          onOpenChange={(open) => !open && setOverlapConfirmData(null)}
          title="Slot occupato"
          description="Questo slot è già occupato. Procedi comunque con la creazione/modifica?"
          confirmText="Procedi comunque"
          variant="default"
          onConfirm={async () => {
            if (!overlapConfirmData) return
            await handleFormSubmit(overlapConfirmData.data, overlapConfirmData.editingAppointment, {
              forceOverwrite: true,
            })
            setOverlapConfirmData(null)
            setSelectedSlot(null)
            handleCloseForm()
          }}
          loading={loading}
        />
      )}

      {cancelChoiceAppointment && (
        <Dialog
          open={!!cancelChoiceAppointment}
          onOpenChange={(open) => !open && setCancelChoiceAppointment(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Annulla appuntamento</DialogTitle>
              <DialogDescription>
                {cancelWithin24h
                  ? 'Annullando con meno di 24 ore di preavviso puoi scegliere di scalare la lezione o annullare senza scalare.'
                  : "L'appuntamento verrà annullato. La lezione non verrà scalata."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              {cancelWithin24h ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelWithChoice(true, false)}
                    disabled={loading}
                    data-testid="appointment-cancel-choice-debit"
                  >
                    Annulla e scala lezione
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelWithChoice(false, true)}
                    disabled={loading}
                    data-testid="appointment-cancel-choice-no-debit"
                  >
                    Annulla senza scalare
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelWithChoice(false, false)}
                    disabled={loading}
                    data-testid="appointment-cancel-choice-confirm"
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCancelChoiceAppointment(null)}
                    data-testid="appointment-confirm-dialog-cancel"
                  >
                    Indietro
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <KeyboardShortcutsModal open={showKeyboardHelp} onClose={closeKeyboardHelp} />
    </div>
  )
}

export default function CalendarioPage() {
  const { showLoader: showGuardLoader } = useCalendarPageGuard()
  if (showGuardLoader) {
    return (
      <div className={CALENDAR_LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }
  return <CalendarPageContent />
}
