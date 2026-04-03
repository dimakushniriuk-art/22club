'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Filter, Grid3x3, List as ListIcon } from 'lucide-react'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'

interface SchedeHeaderActionsProps {
  totalCount?: number
  activeCount?: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export function SchedeHeaderActions({
  viewMode,
  onViewModeChange,
  showFilters,
  onShowFiltersChange,
}: SchedeHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-stretch sm:items-center justify-center sm:justify-end gap-2 sm:gap-3">
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
      <ViewModeToggle
        value={viewMode}
        onChange={onViewModeChange}
        options={[
          { value: 'grid', ariaLabel: 'Vista griglia', Icon: Grid3x3 },
          { value: 'list', ariaLabel: 'Vista lista', Icon: ListIcon },
        ]}
      />
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
