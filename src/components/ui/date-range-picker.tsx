'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'

interface DateRangePickerProps {
  from?: Date | null
  to?: Date | null
  onChange?: (from: Date | null, to: Date | null) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  from,
  to,
  onChange,
  className,
  placeholder = 'Seleziona intervallo date',
}: DateRangePickerProps) {
  const [fromValue, setFromValue] = React.useState(from ? formatDate(from) : '')
  const [toValue, setToValue] = React.useState(to ? formatDate(to) : '')

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromValue(value)
    const date = value ? new Date(value) : null
    onChange?.(date, to || null)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setToValue(value)
    const date = value ? new Date(value) : null
    onChange?.(from || null, date)
  }

  React.useEffect(() => {
    if (from) {
      setFromValue(formatDate(from))
    }
  }, [from])

  React.useEffect(() => {
    if (to) {
      setToValue(formatDate(to))
    }
  }, [to])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <Calendar className="text-text-tertiary h-4 w-4" />
        <span className="text-text-secondary text-sm">Da:</span>
      </div>
      <Input
        type="date"
        value={fromValue}
        onChange={handleFromChange}
        max={toValue || undefined}
        placeholder={placeholder}
        className="w-full"
      />
      <div className="flex items-center gap-2">
        <Calendar className="text-text-tertiary h-4 w-4" />
        <span className="text-text-secondary text-sm">A:</span>
      </div>
      <Input
        type="date"
        value={toValue}
        onChange={handleToChange}
        min={fromValue || undefined}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  )
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
