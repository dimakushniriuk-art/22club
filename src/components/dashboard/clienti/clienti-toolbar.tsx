'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Search, Filter, Grid3x3, TableIcon } from 'lucide-react'
import { ClientiExportMenu } from '@/components/dashboard/clienti-export-menu'

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
}

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
}: ClientiToolbarProps) {
  return (
    <>
      {/* Filtri e ricerca */}
      <div className="relative p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            {/* FIX #9: Aggiunto aria-label per accessibilità */}
            <Input
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              aria-label="Cerca clienti per nome o email"
              className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
            />
          </div>
          <div className="flex gap-2">
            {/* FIX #9: Aggiunto aria-label per accessibilità */}
            <Button
              variant={statoFilter === 'tutti' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onStatoFilterChange('tutti')}
              aria-label={`Filtra per tutti i clienti${statoFilter === 'tutti' ? ' (attivo)' : ''}`}
              aria-pressed={statoFilter === 'tutti'}
              className={
                statoFilter === 'tutti'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30'
                  : 'border-teal-500/30 hover:bg-teal-500/10'
              }
            >
              Tutti
            </Button>
            <Button
              variant={statoFilter === 'attivo' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onStatoFilterChange('attivo')}
              aria-label={`Filtra per clienti attivi${statoFilter === 'attivo' ? ' (attivo)' : ''}`}
              aria-pressed={statoFilter === 'attivo'}
              className={
                statoFilter === 'attivo'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30'
                  : 'border-green-500/30 hover:bg-green-500/10'
              }
            >
              Attivi
            </Button>
            <Button
              variant={statoFilter === 'inattivo' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onStatoFilterChange('inattivo')}
              aria-label={`Filtra per clienti inattivi${statoFilter === 'inattivo' ? ' (attivo)' : ''}`}
              aria-pressed={statoFilter === 'inattivo'}
              className={
                statoFilter === 'inattivo'
                  ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 shadow-lg shadow-gray-500/30'
                  : 'border-gray-500/30 hover:bg-gray-500/10'
              }
            >
              Inattivi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowFiltriAvanzati}
              aria-label="Mostra filtri avanzati"
              className="border-teal-500/30 hover:bg-teal-500/10"
            >
              <Filter className="mr-1 h-4 w-4" aria-hidden="true" />
              Filtri avanzati
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            aria-label="Vista griglia"
            className={
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                : ''
            }
          >
            <Grid3x3 className="mr-2 h-4 w-4" />
            Griglia
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            aria-label="Vista tabella"
            className={
              viewMode === 'table'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                : ''
            }
          >
            <TableIcon className="mr-2 h-4 w-4" />
            Tabella
          </Button>
        </div>

        <ClientiExportMenu
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
          disabled={!hasClienti}
        />
      </div>
    </>
  )
}
