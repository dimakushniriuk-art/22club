// ============================================================
// Componente Header Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Plus, Filter, Grid3x3, List as ListIcon } from 'lucide-react'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'

interface WorkoutPlansHeaderProps {
  onNewWorkout?: () => void
  totalCount?: number
  activeCount?: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export function WorkoutPlansHeader({
  onNewWorkout,
  totalCount,
  activeCount,
  viewMode,
  onViewModeChange,
  showFilters,
  onShowFiltersChange,
}: WorkoutPlansHeaderProps) {
  const newWorkoutButton = (
    <Button
      className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(2,179,191,0.15)] font-semibold transition-all duration-300"
      aria-label="Nuova scheda di allenamento"
    >
      <Plus className="mr-2 h-4 w-4" />
      Nuova Scheda
    </Button>
  )

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-transparent border border-white/5 backdrop-blur-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-text-primary text-3xl font-semibold tracking-tight">
            Schede Allenamento
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Gestisci le schede di allenamento per i tuoi atleti
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onShowFiltersChange(!showFilters)}
            variant="outline"
            size="sm"
            className="border border-white/5 bg-background-secondary/35 text-text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
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
          {onNewWorkout ? (
            <Button
              onClick={onNewWorkout}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(2,179,191,0.15)] font-semibold transition-all duration-300"
              aria-label="Nuova scheda di allenamento"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuova Scheda
            </Button>
          ) : (
            <Link href="/dashboard/schede/nuova" prefetch>
              {newWorkoutButton}
            </Link>
          )}
        </div>
      </div>

      {/* Statistiche rapide - pill soft */}
      {(totalCount !== undefined || activeCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {totalCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Totale:</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1">
                {totalCount}
              </span>
            </div>
          )}
          {activeCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Attive:</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1">
                {activeCount}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
