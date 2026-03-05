// ============================================================
// Componente Header Appuntamenti (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Search } from 'lucide-react'

interface AppointmentsHeaderProps {
  searchTerm: string
  statusFilter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato'
  onSearchChange: (value: string) => void
  onStatusFilterChange: (
    filter: 'tutti' | 'attivo' | 'completato' | 'annullato' | 'programmato',
  ) => void
  onNewAppointment: () => void
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
  theme = 'teal',
}: AppointmentsHeaderProps) {
  const inputBorder =
    theme === 'amber'
      ? 'bg-background-secondary/50 border-amber-500/30 focus:border-amber-500/50'
      : 'bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50'
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex-1 min-w-0 max-w-md">
        <Input
          placeholder="Cerca per atleta o note..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className={inputBorder}
        />
      </div>
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
  )
}
