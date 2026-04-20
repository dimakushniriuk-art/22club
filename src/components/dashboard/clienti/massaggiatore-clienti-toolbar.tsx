'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Grid3x3, TableIcon } from 'lucide-react'
import { ClientiExportMenu } from '@/components/dashboard/clienti-export-menu'
import { cn } from '@/lib/utils'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'

export type MassaggiatoreClientiStatoFilter = 'tutti' | 'collegati' | 'in_attesa'

const FILTER_OPTIONS: Array<{ value: MassaggiatoreClientiStatoFilter; label: string }> = [
  { value: 'tutti', label: 'Tutti' },
  { value: 'collegati', label: 'Collegati' },
  { value: 'in_attesa', label: 'Invito in sospeso' },
]

interface MassaggiatoreClientiToolbarProps {
  searchTerm: string
  statoFilter: MassaggiatoreClientiStatoFilter
  viewMode: 'table' | 'grid'
  onSearchChange: (value: string) => void
  onStatoFilterChange: (value: MassaggiatoreClientiStatoFilter) => void
  onViewModeChange: (mode: 'table' | 'grid') => void
  onExportPdf: () => void | Promise<void>
  hasClienti: boolean
  isMobile?: boolean
  isExporting?: boolean
}

export function MassaggiatoreClientiToolbar({
  searchTerm,
  statoFilter,
  viewMode,
  onSearchChange,
  onStatoFilterChange,
  onViewModeChange,
  onExportPdf,
  hasClienti,
  isMobile = false,
  isExporting = false,
}: MassaggiatoreClientiToolbarProps) {
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
          <div className="min-w-0 flex-1">
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
          <div className="flex max-w-full flex-wrap gap-2">
            {FILTER_OPTIONS.map(({ value, label }) => {
              const isActive = statoFilter === value
              const isAttesa = value === 'in_attesa'
              return (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => onStatoFilterChange(value)}
                  aria-pressed={isActive}
                  aria-label={`Filtra: ${label}${isActive ? ' (attivo)' : ''}`}
                  className={cn(
                    'rounded-lg border-white/20 font-medium hover:border-white/30 hover:bg-white/5',
                    btnClass,
                    isActive &&
                      isAttesa &&
                      'border-warning/30 bg-warning/10 text-warning hover:bg-warning/15',
                    isActive &&
                      !isAttesa &&
                      'border-primary/30 bg-primary/15 text-primary hover:bg-primary/10',
                    !isActive && 'text-text-secondary',
                  )}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
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
