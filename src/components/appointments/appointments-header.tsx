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
}

export function AppointmentsHeader({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  // Nota: onNewAppointment potrebbe essere usato in futuro per creazione appuntamenti
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNewAppointment,
}: AppointmentsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Cerca per atleta o note..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
        />
      </div>
      <div className="flex gap-2">
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
