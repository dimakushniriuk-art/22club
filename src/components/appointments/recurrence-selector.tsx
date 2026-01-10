'use client'

import { useState } from 'react'
import { Repeat, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RecurrenceConfig, RecurrenceType } from '@/lib/recurrence-utils'
import { DAYS_OF_WEEK } from '@/lib/recurrence-utils'

interface RecurrenceSelectorProps {
  value: RecurrenceConfig
  onChange: (config: RecurrenceConfig) => void
  startDate?: string // Data inizio appuntamento (YYYY-MM-DD)
}

export function RecurrenceSelector({ value, onChange, startDate }: RecurrenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTypeChange = (type: RecurrenceType) => {
    if (type === 'none') {
      onChange({ type: 'none' })
      setIsOpen(false)
      return
    }

    onChange({
      ...value,
      type,
      interval: value.interval || 1,
    })
  }

  const handleIntervalChange = (interval: number) => {
    onChange({
      ...value,
      interval: Math.max(1, interval),
    })
  }

  const handleEndDateChange = (endDate: string | null) => {
    onChange({
      ...value,
      endDate: endDate || undefined,
      count: endDate ? undefined : value.count, // Rimuovi count se c'è endDate
    })
  }

  const handleCountChange = (count: number | null) => {
    onChange({
      ...value,
      count: count || undefined,
      endDate: count ? undefined : value.endDate, // Rimuovi endDate se c'è count
    })
  }

  const toggleDayOfWeek = (day: number) => {
    const currentDays = value.daysOfWeek || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b)

    onChange({
      ...value,
      daysOfWeek: newDays.length > 0 ? newDays : undefined,
    })
  }

  const getRecurrenceLabel = () => {
    if (value.type === 'none') return 'Nessuna ricorrenza'
    if (value.type === 'daily') {
      return value.interval === 1 ? 'Ogni giorno' : `Ogni ${value.interval} giorni`
    }
    if (value.type === 'weekly') {
      if (value.daysOfWeek && value.daysOfWeek.length > 0) {
        const dayLabels = value.daysOfWeek
          .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.short)
          .filter(Boolean)
        return `Ogni ${value.interval === 1 ? '' : value.interval + ' '}settimana: ${dayLabels.join(', ')}`
      }
      return value.interval === 1 ? 'Ogni settimana' : `Ogni ${value.interval} settimane`
    }
    if (value.type === 'monthly') {
      return value.interval === 1 ? 'Ogni mese' : `Ogni ${value.interval} mesi`
    }
    return 'Ricorrenza'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-text-primary flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          Ricorrenza
        </Label>
        {value.type !== 'none' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange({ type: 'none' })
              setIsOpen(false)
            }}
            className="h-7 text-xs text-text-tertiary hover:text-text-primary"
          >
            <X className="h-3 w-3 mr-1" />
            Rimuovi
          </Button>
        )}
      </div>

      {!isOpen && value.type === 'none' && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full justify-start text-text-secondary hover:text-text-primary"
        >
          <Repeat className="h-4 w-4 mr-2" />
          Aggiungi ricorrenza
        </Button>
      )}

      {!isOpen && value.type !== 'none' && (
        <div
          className="flex items-center justify-between p-3 bg-background-secondary/50 border border-border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-text-primary text-sm font-medium">{getRecurrenceLabel()}</span>
          <span className="text-text-tertiary text-xs">
            {value.endDate
              ? `Fino al ${new Date(value.endDate).toLocaleDateString('it-IT')}`
              : value.count
                ? `${value.count} occorrenze`
                : 'Senza fine'}
          </span>
        </div>
      )}

      {isOpen && (
        <div className="space-y-4 p-4 bg-background-secondary/30 border border-border rounded-lg">
          {/* Tipo ricorrenza */}
          <div className="space-y-2">
            <Label className="text-text-primary text-sm">Tipo ricorrenza</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={value.type === type ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(type)}
                  className="text-xs"
                >
                  {type === 'none' && 'Nessuna'}
                  {type === 'daily' && 'Giornaliera'}
                  {type === 'weekly' && 'Settimanale'}
                  {type === 'monthly' && 'Mensile'}
                </Button>
              ))}
            </div>
          </div>

          {value.type !== 'none' && (
            <>
              {/* Intervallo */}
              <div className="space-y-2">
                <Label className="text-text-primary text-sm">Ogni</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={value.interval || 1}
                    onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-text-secondary text-sm">
                    {value.type === 'daily' && 'giorni'}
                    {value.type === 'weekly' && 'settimane'}
                    {value.type === 'monthly' && 'mesi'}
                  </span>
                </div>
              </div>

              {/* Giorni della settimana (solo per weekly) */}
              {value.type === 'weekly' && (
                <div className="space-y-2">
                  <Label className="text-text-primary text-sm">Giorni della settimana</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = value.daysOfWeek?.includes(day.value) || false
                      return (
                        <Button
                          key={day.value}
                          type="button"
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => toggleDayOfWeek(day.value)}
                          className="text-xs"
                        >
                          {day.short}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Fine ricorrenza */}
              <div className="space-y-2">
                <Label className="text-text-primary text-sm">Fine ricorrenza</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="recurrence-no-end"
                      name="recurrence-end"
                      checked={!value.endDate && !value.count}
                      onChange={() => {
                        handleEndDateChange(null)
                        handleCountChange(null)
                      }}
                      className="text-primary"
                    />
                    <Label
                      htmlFor="recurrence-no-end"
                      className="text-text-secondary text-sm cursor-pointer"
                    >
                      Senza fine
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="recurrence-end-date"
                      name="recurrence-end"
                      checked={!!value.endDate}
                      onChange={() => {
                        if (!value.endDate && startDate) {
                          // Imposta data fine a 1 mese dalla data inizio
                          const endDate = new Date(startDate || new Date())
                          endDate.setMonth(endDate.getMonth() + 1)
                          handleEndDateChange(endDate.toISOString().split('T')[0])
                        }
                      }}
                      className="text-primary"
                    />
                    <Label
                      htmlFor="recurrence-end-date"
                      className="text-text-secondary text-sm cursor-pointer"
                    >
                      Fino al
                    </Label>
                    {value.endDate && (
                      <Input
                        type="date"
                        value={value.endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={startDate}
                        className="flex-1"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="recurrence-end-count"
                      name="recurrence-end"
                      checked={!!value.count}
                      onChange={() => {
                        if (!value.count) {
                          handleCountChange(10) // Default 10 occorrenze
                        }
                      }}
                      className="text-primary"
                    />
                    <Label
                      htmlFor="recurrence-end-count"
                      className="text-text-secondary text-sm cursor-pointer"
                    >
                      Dopo
                    </Label>
                    {value.count && (
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={value.count}
                        onChange={(e) => handleCountChange(parseInt(e.target.value) || null)}
                        className="w-24"
                      />
                    )}
                    {value.count && <span className="text-text-secondary text-sm">occorrenze</span>}
                  </div>
                </div>
              </div>

              {/* Anteprima */}
              <div className="pt-2 border-t border-border">
                <p className="text-text-secondary text-xs">
                  <strong className="text-text-primary">Anteprima:</strong> {getRecurrenceLabel()}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
