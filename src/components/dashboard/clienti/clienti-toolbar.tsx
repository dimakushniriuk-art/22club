'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Filter, Grid3x3, TableIcon } from 'lucide-react'
import { ClientiExportMenu } from '@/components/dashboard/clienti-export-menu'
import { cn } from '@/lib/utils'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'

interface ClientiToolbarProps {
  searchTerm: string
  statoFilter: 'tutti' | 'attivo' | 'inattivo' | 'sospeso'
  viewMode: 'table' | 'grid'
  onSearchChange: (value: string) => void
  onStatoFilterChange: (value: 'tutti' | 'attivo' | 'inattivo' | 'sospeso') => void
  onViewModeChange: (mode: 'table' | 'grid') => void
  onShowFiltriAvanzati: () => void
  onExportPdf: () => void | Promise<void>
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
  onExportPdf,
  hasClienti,
  isMobile = false,
  isExporting = false,
}: ClientiToolbarProps) {
  const btnClass = isMobile ? 'min-h-[44px] touch-manipulation' : ''
  const viewOptions: Array<{
    value: 'grid' | 'table'
    ariaLabel: string
    Icon: typeof Grid3x3
  }> = [
    { value: 'grid', ariaLabel: 'Vista griglia', Icon: Grid3x3 },
    ...(!isMobile
      ? [{ value: 'table' as const, ariaLabel: 'Vista tabella', Icon: TableIcon }]
      : []),
  ]
  return (
    <>
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Cerca clienti per nome o email"
              className={cn(
                'h-11 rounded-md border-white/10 bg-black/20 px-3 focus-visible:ring-2 focus-visible:ring-primary',
                isMobile && 'min-h-[44px]',
              )}
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
                    'rounded-lg font-medium border-white/20 hover:bg-white/5 hover:border-white/30',
                    btnClass,
                    isActive &&
                      isInattivo &&
                      'bg-warning/10 text-warning border-warning/30 hover:bg-warning/15',
                    isActive &&
                      !isInattivo &&
                      'bg-primary/15 text-primary border-primary/30 hover:bg-primary/10',
                    !isActive && 'text-text-secondary',
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
              className={cn(
                'rounded-lg border-white/20 text-text-secondary hover:bg-white/5 hover:border-white/30',
                btnClass,
              )}
            >
              <Filter className="mr-1 h-4 w-4" aria-hidden="true" />
              Filtri avanzati
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <ViewModeToggle
          value={viewMode}
          onChange={onViewModeChange}
          buttonClassName={btnClass}
          options={viewOptions}
        />

        <ClientiExportMenu
          onExportPdf={onExportPdf}
          disabled={!hasClienti || isExporting}
          isExporting={isExporting}
          isMobile={isMobile}
        />
      </div>
    </>
  )
}
