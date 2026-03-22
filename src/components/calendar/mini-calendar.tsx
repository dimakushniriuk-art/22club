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
}

export function MiniCalendar({
  selectedDate = new Date(),
  onDateSelect,
  appointmentDates = [],
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
    <div className="w-[220px] select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-medium text-text-primary capitalize">{monthName}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-full hover:bg-primary/10 text-text-tertiary hover:text-primary transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-full hover:bg-primary/10 text-text-tertiary hover:text-primary transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
        {calendarDays.map((day, i) => (
          <button
            key={i}
            onClick={() => onDateSelect?.(day.date)}
            className={cn(
              'h-7 w-7 flex items-center justify-center text-xs rounded-full relative transition-colors duration-200 mx-auto border border-transparent',
              day.isCurrentMonth ? 'text-text-primary' : 'text-text-tertiary',
              isToday(day.date) &&
                !isSelected(day.date) &&
                'text-primary font-medium ring-2 ring-primary/50 ring-offset-2 ring-offset-[var(--background)]',
              isSelected(day.date) &&
                'bg-primary/20 text-primary border border-primary/30 font-medium',
              !isToday(day.date) && !isSelected(day.date) && 'hover:bg-primary/10',
            )}
          >
            {day.date.getDate()}
            {day.hasAppointment && !isSelected(day.date) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
