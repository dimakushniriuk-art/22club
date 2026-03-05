'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Filter, Grid3x3, TableIcon } from 'lucide-react'
import { ClientiExportMenu } from '@/components/dashboard/clienti-export-menu'
import { cn } from '@/lib/utils'

interface ClientiToolbarProps {
  searchTerm: string
  statoFilter: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  viewMode: 'table' | 'grid'
  onSearchChange: (value: string) => void
  onStatoFilterChange: (value: 'tutti' | 'attivo' | 'inattivo' | 'sospeso') => void
  onViewModeChange: (mode: 'table' | 'grid') => void
  onShowFiltriAvanzati: () => void
  onExportCSV: () => void
  onExportPDF: () => void
  hasClienti: boolean
  /** Sotto 852px: nasconde tabella, pulsanti min-h 44px */
  isMobile?: boolean
  /** Export in corso: disabilita menu e mostra feedback */
  isExporting?: boolean
}

const FILTER_OPTIONS: Array<'tutti' | 'attivo' | 'inattivo'> = ['tutti', 'attivo', 'inattivo']

export function ClientiToolbar({
  searchTerm,
  statoFilter,
  viewMode,
  onSearchChange,
  onStatoFilterChange,
  onViewModeChange,
  onShowFiltriAvanzati,
  onExportCSV,
  onExportPDF,
  hasClienti,
  isMobile = false,
  isExporting = false,
}: ClientiToolbarProps) {
  const btnClass = isMobile ? 'min-h-[44px] touch-manipulation' : ''
  return (
    <>
      <div className="relative p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Cerca clienti per nome o email"
              className={cn('h-12 rounded-full bg-background-secondary/30 border border-white/5 px-4 focus-visible:border-primary/30 focus-visible:shadow-[0_0_25px_rgba(2,179,191,0.2)] transition-all duration-300', isMobile && 'min-h-[44px]')}
            />
          </div>
          <div className="flex flex-wrap gap-2 max-w-full">
            {FILTER_OPTIONS.map((value) => {
              const isActive = statoFilter === value
              const isInattivo = value === 'inattivo'
              return (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => onStatoFilterChange(value)}
                  aria-label={`Filtra per ${value === 'tutti' ? 'tutti i clienti' : `clienti ${value}`}${isActive ? ' (attivo)' : ''}`}
                  aria-pressed={isActive}
                  className={cn(
                    'rounded-full font-medium transition-all duration-300',
                    btnClass,
                    isActive && isInattivo && 'bg-warning/10 text-warning border border-warning/25 hover:bg-warning/15',
                    isActive && !isInattivo && 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/10',
                    !isActive && 'bg-background-secondary/35 border border-white/5 text-text-secondary hover:bg-primary/10 hover:border-primary/20',
                  )}
                >
                  {value === 'tutti' ? 'Tutti' : value === 'attivo' ? 'Attivi' : 'Inattivi'}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={onShowFiltriAvanzati}
              aria-label="Mostra filtri avanzati"
              className={cn('rounded-full border border-white/5 bg-background-secondary/35 text-text-secondary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300', btnClass)}
            >
              <Filter className="mr-1 h-4 w-4" aria-hidden="true" />
              Filtri avanzati
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            aria-label="Vista griglia"
            className={cn(viewMode === 'grid' ? 'font-semibold shadow-glow' : '', btnClass)}
          >
            <Grid3x3 className="mr-2 h-4 w-4" />
            Griglia
          </Button>
          {!isMobile && (
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              aria-label="Vista tabella"
              className={cn(viewMode === 'table' ? 'font-semibold shadow-glow' : '', btnClass)}
            >
              <TableIcon className="mr-2 h-4 w-4" />
              Tabella
            </Button>
          )}
        </div>

        <ClientiExportMenu
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
          disabled={!hasClienti || isExporting}
          isExporting={isExporting}
          isMobile={isMobile}
        />
      </div>
    </>
  )
}
