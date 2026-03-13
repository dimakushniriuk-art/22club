'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Filter, Grid3x3, List as ListIcon } from 'lucide-react'

interface SchedeHeaderActionsProps {
  totalCount?: number
  activeCount?: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export function SchedeHeaderActions({
  totalCount,
  activeCount,
  viewMode,
  onViewModeChange,
  showFilters,
  onShowFiltersChange,
}: SchedeHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
      {(totalCount !== undefined || activeCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          {totalCount !== undefined && (
            <span className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-text-secondary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              Totale: <span className="text-text-primary">{totalCount}</span>
            </span>
          )}
          {activeCount !== undefined && (
            <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              Attive: <span className="text-primary">{activeCount}</span>
            </span>
          )}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onShowFiltersChange(!showFilters)}
        className="rounded-lg border-white/20 hover:bg-white/5 hover:border-white/30 min-h-[44px] sm:min-h-0"
        aria-pressed={showFilters}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtri
      </Button>
      <div className="flex items-center rounded-lg border border-white/10 bg-black/20 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <Button
          variant={viewMode === 'grid' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          aria-label="Vista griglia"
          className="rounded-md h-8 px-2"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          aria-label="Vista lista"
          className="rounded-md h-8 px-2"
        >
          <ListIcon className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="primary"
        size="sm"
        asChild
        className="min-h-[44px] sm:min-h-0 shrink-0 px-2.5 rounded-lg [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:min-w-0"
      >
        <Link href="/dashboard/schede/nuova" prefetch>
          Nuova Scheda
        </Link>
      </Button>
    </div>
  )
}
