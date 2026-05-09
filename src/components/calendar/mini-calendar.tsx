'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Funzione helper per confrontare date (fuori dal componente per evitare ri-creazione)
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

interface MiniCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  appointmentDates?: string[]
  /** false = anteprima statica (sidebar/dashboard), senza click su giorni o cambio mese */
  interactive?: boolean
}

export function MiniCalendar({
  selectedDate = new Date(),
  onDateSelect,
  appointmentDates = [],
  interactive = true,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

  const daysOfWeek = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek < 0) startDayOfWeek = 6

    const days: Array<{ date: Date; isCurrentMonth: boolean; hasAppointment: boolean }> = []

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        hasAppointment: appointmentDates.some((d) => isSameDay(new Date(d), date)),
      })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        hasAppointment: appointmentDates.some((d) => isSameDay(new Date(d), date)),
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        hasAppointment: appointmentDates.some((d) => isSameDay(new Date(d), date)),
      })
    }

    return days
  }, [currentMonth, appointmentDates])

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isSelected = (date: Date) => {
    return isSameDay(date, selectedDate)
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const monthName = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  return (
    <div className={cn('w-[220px] select-none', !interactive && 'pointer-events-none opacity-95')}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium capitalize text-text-primary">{monthName}</span>
        <div className="flex items-center gap-0.5">
          {interactive ? (
            <>
              <button
                type="button"
                onClick={goToPrevMonth}
                className="rounded-full p-1.5 text-text-tertiary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-full p-1.5 text-text-tertiary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-0.5 opacity-35" aria-hidden>
              <span className="rounded-full p-1.5">
                <ChevronLeft className="h-4 w-4 text-text-tertiary" />
              </span>
              <span className="rounded-full p-1.5">
                <ChevronRight className="h-4 w-4 text-text-tertiary" />
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {daysOfWeek.map((day, i) => (
          <div
            key={i}
            className="h-7 flex items-center justify-center text-[10px] font-medium text-text-tertiary"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const cellClass = cn(
            'relative mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-xs',
            day.isCurrentMonth ? 'text-text-primary' : 'text-text-tertiary',
            isToday(day.date) &&
              !isSelected(day.date) &&
              'font-medium text-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-[var(--background)]',
            isSelected(day.date) &&
              'border border-primary/30 bg-primary/20 font-medium text-primary',
            interactive &&
              !isToday(day.date) &&
              !isSelected(day.date) &&
              'transition-colors duration-200 hover:bg-primary/10',
          )
          const dot =
            day.hasAppointment && !isSelected(day.date) ? (
              <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            ) : null

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onDateSelect?.(day.date)}
                className={cellClass}
              >
                {day.date.getDate()}
                {dot}
              </button>
            )
          }

          return (
            <div key={i} className={cellClass}>
              {day.date.getDate()}
              {dot}
            </div>
          )
        })}
      </div>
    </div>
  )
}
