// ============================================================
// Componente Header Appuntamenti (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Search } from 'lucide-react'

export type DateRangeFilter = 'tutti' | 'ultimo_mese' | 'ultima_settimana' | 'ieri_oggi'

interface AppointmentsHeaderProps {
  searchTerm: string
  statusFilter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  onSearchChange: (value: string) => void
  onStatusFilterChange: (
    filter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato',
  ) => void
  onNewAppointment: () => void
  /** Filtro periodo: se fornito, mostra il gruppo Periodo nei filtri */
  dateRangeFilter?: DateRangeFilter
  onDateRangeFilterChange?: (filter: DateRangeFilter) => void
  /** Tema colori: teal (default) per PT/dashboard, amber per massaggiatore */
  theme?: 'teal' | 'amber'
}

export function AppointmentsHeader({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  // Nota: onNewAppointment potrebbe essere usato in futuro per creazione appuntamenti
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNewAppointment,
  dateRangeFilter,
  onDateRangeFilterChange,
  theme = 'teal',
}: AppointmentsHeaderProps) {
  const inputBorder =
    theme === 'amber'
      ? 'bg-white/[0.04] border-white/10 focus:border-amber-500/50'
      : 'bg-white/[0.04] border-white/10 focus:border-primary'
  const showPeriod = dateRangeFilter != null && onDateRangeFilterChange != null

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex flex-1 flex-wrap items-end gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Ricerca</label>
          <Input
            placeholder="Cerca per atleta o note..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className={inputBorder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">Stato</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'tutti' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusFilterChange('tutti')}
              >
                Tutti
              </Button>
              <Button
                variant={statusFilter === 'attivo' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusFilterChange('attivo')}
              >
                Attivi
              </Button>
              <Button
                variant={statusFilter === 'completato' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusFilterChange('completato')}
              >
                Completati
              </Button>
              <Button
                variant={statusFilter === 'annullato' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusFilterChange('annullato')}
              >
                Annullati
              </Button>
            </div>
          </div>
          {showPeriod && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-text-secondary">Periodo</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dateRangeFilter === 'tutti' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onDateRangeFilterChange('tutti')}
                >
                  Tutti
                </Button>
                <Button
                  variant={dateRangeFilter === 'ultimo_mese' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onDateRangeFilterChange('ultimo_mese')}
                >
                  Ultimo mese
                </Button>
                <Button
                  variant={dateRangeFilter === 'ultima_settimana' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onDateRangeFilterChange('ultima_settimana')}
                >
                  Ultima settimana
                </Button>
                <Button
                  variant={dateRangeFilter === 'ieri_oggi' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onDateRangeFilterChange('ieri_oggi')}
                >
                  Ieri e oggi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
