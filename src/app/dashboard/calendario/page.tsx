'use client'

import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CalendarView, AppointmentPopover, MiniCalendar } from '@/components/calendar'
import type { AppointmentUI, EditAppointmentData } from '@/types/appointment'
import { useCalendarPage } from '@/hooks/calendar/use-calendar-page'
import { LoadingState } from '@/components/dashboard/loading-state'
import { Clock, ChevronRight, Search, X, Filter, Keyboard } from 'lucide-react'
import { APPOINTMENT_COLORS, type AppointmentColor } from '@/types/appointment'

// Lazy load del form
const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({
    default: mod.AppointmentForm,
  })),
)

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

export default function CalendarioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    appointments,
    appointmentsLoading,
    athletes,
    athletesLoading,
    loading,
    handleFormSubmit,
    handleCancel,
    handleDelete,
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
  
  // Nuovi stati per ricerca e filtri
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState<string>('')
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // Filtra appuntamenti in base a ricerca e filtro atleta
  const filteredAppointments = useMemo(() => {
    let result = appointments

    // Filtro per atleta
    if (selectedAthleteFilter) {
      result = result.filter((apt) => apt.athlete_id === selectedAthleteFilter)
    }

    // Filtro per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((apt) => 
        apt.athlete_name?.toLowerCase().includes(query) ||
        apt.notes?.toLowerCase().includes(query) ||
        apt.location?.toLowerCase().includes(query) ||
        apt.type.toLowerCase().includes(query)
      )
    }

    return result
  }, [appointments, selectedAthleteFilter, searchQuery])

  // Prossimi appuntamenti (oggi e futuri, max 5)
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    return filteredAppointments
      .filter((apt) => new Date(apt.starts_at) >= now && apt.status === 'attivo')
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 5)
  }, [filteredAppointments])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignora se siamo in un input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // Ignora se un modal è aperto
    if (showForm || showPopover) {
      if (e.key === 'Escape') {
        setShowForm(false)
        setShowPopover(false)
      }
      return
    }

    switch (e.key.toLowerCase()) {
      case 't':
        // Vai a oggi
        document.querySelector<HTMLButtonElement>('[data-action="today"]')?.click()
        break
      case 'n':
        // Nuovo appuntamento
        e.preventDefault()
        setShowForm(true)
        break
      case 'm':
        // Vista mese
        document.querySelector<HTMLButtonElement>('[data-view="dayGridMonth"]')?.click()
        break
      case 'w':
        // Vista settimana
        document.querySelector<HTMLButtonElement>('[data-view="timeGridWeek"]')?.click()
        break
      case 'd':
        // Vista giorno
        document.querySelector<HTMLButtonElement>('[data-view="timeGridDay"]')?.click()
        break
      case 'a':
        // Vista agenda
        document.querySelector<HTMLButtonElement>('[data-view="listWeek"]')?.click()
        break
      case '/':
        // Focus ricerca
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search]')?.focus()
        break
      case '?':
        // Mostra aiuto tastiera
        setShowKeyboardHelp(true)
        break
      case 'arrowleft':
        // Precedente
        document.querySelector<HTMLButtonElement>('[data-action="prev"]')?.click()
        break
      case 'arrowright':
        // Successivo
        document.querySelector<HTMLButtonElement>('[data-action="next"]')?.click()
        break
    }
  }, [showForm, showPopover])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Apri il form automaticamente se c'è il query param 'new'
  useEffect(() => {
    const newParam = searchParams.get('new')
    if (newParam === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

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

  const handleEventClick = (appointment: AppointmentUI, position: { x: number; y: number }) => {
    setSelectedAppointment(appointment)
    setPopoverPosition(position)
    setShowPopover(true)
  }

  const handleDateClick = (dateStr?: string) => {
    if (dateStr) {
      setEditingAppointment(null)
      setShowForm(true)
    }
  }

  const handleNewAppointment = () => {
    setEditingAppointment(null)
    setSelectedSlot(null)
    setShowForm(true)
  }

  const handleSelectSlot = (start: Date, end: Date) => {
    setSelectedSlot({ start, end })
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
        color: selectedAppointment.color ?? undefined,
        location: selectedAppointment.location ?? undefined,
        notes: selectedAppointment.notes ?? undefined,
      }
      setEditingAppointment(editData)
    }
    setShowPopover(false)
    setShowForm(true)
  }

  const handleClosePopover = () => {
    setShowPopover(false)
    setSelectedAppointment(null)
  }

  const appointmentDates = filteredAppointments.map((apt) => apt.starts_at)

  // Stato per comunicare navigazione al CalendarView
  const [navigateToDate, setNavigateToDate] = useState<Date | null>(null)

  const handleMiniCalendarDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Naviga alla vista giorno per quella data
    setNavigateToDate(date)
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  const formatRelativeDate = (dateStr: string) => {
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

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedAthleteFilter('')
  }

  const hasActiveFilters = searchQuery || selectedAthleteFilter

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-col border-r border-[#3C4043] bg-[#202124]">
        {/* Ricerca */}
        <div className="p-3 border-b border-[#3C4043]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
            <input
              type="text"
              data-search
              placeholder="Cerca appuntamenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#303134] border-none text-sm text-[#E8EAED] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#8AB4F8]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#3C4043]"
              >
                <X className="h-3.5 w-3.5 text-[#9AA0A6]" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro Atleta */}
        <div className="p-3 border-b border-[#3C4043]">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-[#9AA0A6]" />
            <span className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider">Filtra per atleta</span>
          </div>
          <select
            value={selectedAthleteFilter}
            onChange={(e) => setSelectedAthleteFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-[#303134] border-none text-sm text-[#E8EAED] focus:outline-none focus:ring-2 focus:ring-[#8AB4F8]/50 cursor-pointer"
          >
            <option value="">Tutti gli atleti</option>
            {athletes.map((athlete) => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.name}
              </option>
            ))}
          </select>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-[#8AB4F8] hover:text-[#AECBFA] transition-colors"
            >
              Rimuovi filtri
            </button>
          )}
        </div>

        {/* Mini Calendario */}
        <div className="p-3 border-b border-[#3C4043]">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={handleMiniCalendarDateSelect}
            appointmentDates={appointmentDates}
          />
        </div>

        {/* Prossimi Appuntamenti */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider mb-2">
              Prossimi appuntamenti
              {hasActiveFilters && (
                <span className="ml-1 text-[#8AB4F8]">({filteredAppointments.length})</span>
              )}
            </h3>
            
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-[#5F6368] mx-auto mb-2" />
                <p className="text-sm text-[#9AA0A6]">
                  {hasActiveFilters ? 'Nessun risultato' : 'Nessun appuntamento'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingAppointments.map((apt) => {
                  const colorKey = (apt.color || 'azzurro') as AppointmentColor
                  const bgColor = APPOINTMENT_COLORS[colorKey] || APPOINTMENT_COLORS.azzurro
                  
                  return (
                    <button
                      key={apt.id}
                      onClick={() => handleEventClick(apt, { x: 350, y: 200 })}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#3C4043] transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0"
                          style={{ backgroundColor: bgColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#E8EAED] font-medium truncate">
                            {apt.athlete_name || 'Appuntamento'}
                          </p>
                          <p className="text-xs text-[#9AA0A6]">
                            {formatRelativeDate(apt.starts_at)} · {formatTime(apt.starts_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#5F6368] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con Keyboard Shortcuts */}
        <div className="p-3 border-t border-[#3C4043]">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="flex items-center gap-2 text-xs text-[#9AA0A6] hover:text-[#E8EAED] transition-colors"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Scorciatoie tastiera</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded bg-[#303134] text-[10px]">?</kbd>
          </button>
        </div>
      </aside>

      {/* Main Calendar */}
      <main className="flex-1 bg-[#202124] overflow-hidden">
        {appointmentsLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8AB4F8] border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#9AA0A6] text-sm">Caricamento appuntamenti...</p>
            </div>
          </div>
        ) : (
          <CalendarView
            appointments={filteredAppointments}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onNewAppointment={handleNewAppointment}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onSelectSlot={handleSelectSlot}
            navigateToDate={navigateToDate}
            onNavigateComplete={() => setNavigateToDate(null)}
          />
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Suspense fallback={<LoadingState message="Caricamento form..." />}>
            <AppointmentForm
              appointment={editingAppointment || (selectedSlot ? {
                athlete_id: '',
                staff_id: '',
                starts_at: toLocalISOString(selectedSlot.start),
                ends_at: toLocalISOString(selectedSlot.end),
                type: 'allenamento',
                status: 'attivo',
              } : undefined)}
              athletes={athletes}
              onSubmit={(data) => {
                handleFormSubmit(data, editingAppointment).then(() => {
                  setSelectedSlot(null)
                  handleCloseForm()
                })
              }}
              onCancel={() => {
                setSelectedSlot(null)
                handleCloseForm()
              }}
              loading={loading || athletesLoading}
            />
          </Suspense>
        </div>
      )}

      {/* Popover */}
      {showPopover && selectedAppointment && (
        <AppointmentPopover
          appointment={selectedAppointment}
          position={popoverPosition}
          onEdit={handleEdit}
          onCancel={() => {
            handleCancel(selectedAppointment.id).then(() => handleClosePopover())
          }}
          onDelete={() => {
            handleDelete(selectedAppointment.id).then(() => handleClosePopover())
          }}
          onClose={handleClosePopover}
          loading={loading}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowKeyboardHelp(false)}
        >
          <div 
            className="w-full max-w-md bg-[#303134] rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#5F6368]">
              <h2 className="text-lg font-medium text-[#E8EAED]">Scorciatoie tastiera</h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1.5 rounded-full hover:bg-[#3C4043] transition-colors"
              >
                <X className="h-5 w-5 text-[#9AA0A6]" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Navigazione */}
              <div>
                <h3 className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider mb-2">Navigazione</h3>
                <div className="space-y-2">
                  <ShortcutRow keys={['T']} description="Vai a oggi" />
                  <ShortcutRow keys={['←']} description="Periodo precedente" />
                  <ShortcutRow keys={['→']} description="Periodo successivo" />
                </div>
              </div>
              
              {/* Viste */}
              <div>
                <h3 className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider mb-2">Cambia vista</h3>
                <div className="space-y-2">
                  <ShortcutRow keys={['M']} description="Vista mese" />
                  <ShortcutRow keys={['W']} description="Vista settimana" />
                  <ShortcutRow keys={['D']} description="Vista giorno" />
                  <ShortcutRow keys={['A']} description="Vista agenda" />
                </div>
              </div>
              
              {/* Azioni */}
              <div>
                <h3 className="text-xs font-medium text-[#9AA0A6] uppercase tracking-wider mb-2">Azioni</h3>
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
      )}
    </div>
  )
}

// Componente per riga shortcut
function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#E8EAED]">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="min-w-[24px] h-6 px-2 flex items-center justify-center rounded bg-[#202124] text-xs text-[#E8EAED] font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}
