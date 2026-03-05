'use client'

import { Filter, Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useState, useEffect } from 'react'
import type { AllenamentoFilters } from '@/types/allenamento'

interface AllenamentiFiltriAvanzatiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: AllenamentoFilters
  onApply: (filters: Partial<AllenamentoFilters>) => void
}

export function AllenamentiFiltriAvanzati({
  open,
  onOpenChange,
  filters,
  onApply,
}: AllenamentiFiltriAvanzatiProps) {
  const [periodo, setPeriodo] = useState<'tutti' | 'oggi' | 'settimana' | 'mese'>(
    filters.periodo || 'tutti',
  )
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: filters.data_da ? new Date(filters.data_da) : undefined,
    to: filters.data_a ? new Date(filters.data_a) : undefined,
  })

  useEffect(() => {
    setPeriodo(filters.periodo || 'tutti')
    setDateRange({
      from: filters.data_da ? new Date(filters.data_da) : undefined,
      to: filters.data_a ? new Date(filters.data_a) : undefined,
    })
  }, [filters, open])

  const handleApplyFilters = () => {
    onApply({
      periodo,
      data_da: dateRange.from?.toISOString() || null,
      data_a: dateRange.to?.toISOString() || null,
    })
    onOpenChange(false)
  }

  const handleResetFilters = () => {
    setPeriodo('tutti')
    setDateRange({ from: undefined, to: undefined })
    onApply({
      periodo: 'tutti',
      data_da: null,
      data_a: null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background-secondary/95 backdrop-blur-xl border-teal-500/20">
        <DialogHeader className="border-b border-background-tertiary/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <Filter className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <DialogTitle className="text-text-primary">Filtri Avanzati</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Filtra gli allenamenti per periodo o intervallo personalizzato
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <Label htmlFor="periodo" className="text-text-primary text-sm font-semibold">
                Periodo
              </Label>
            </div>
            <Select
              id="periodo"
              value={periodo}
              onValueChange={(value) => setPeriodo(value as typeof periodo)}
            >
              <SelectItem value="tutti">Tutti gli allenamenti</SelectItem>
              <SelectItem value="oggi">Solo oggi</SelectItem>
              <SelectItem value="settimana">Questa settimana</SelectItem>
              <SelectItem value="mese">Questo mese</SelectItem>
            </Select>
          </div>

          <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-400" />
              <Label htmlFor="date-range" className="text-text-primary text-sm font-semibold">
                Intervallo personalizzato
              </Label>
            </div>
            <DateRangePicker
              from={dateRange.from || null}
              to={dateRange.to || null}
              onChange={(from, to) => {
                setDateRange({
                  from: from || undefined,
                  to: to || undefined,
                })
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 border-t border-background-tertiary/50 pt-4 sm:flex-row">
            <Button variant="outline" onClick={handleResetFilters} className="flex-1 sm:flex-none">
              <span className="mr-2">↺</span>
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1 sm:flex-none">
              <span className="mr-2">✓</span>
              Applica Filtri
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
