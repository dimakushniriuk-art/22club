// ============================================================
// Componente Header Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, Filter, Grid3x3, List as ListIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const handleNewWorkout = () => {
    if (onNewWorkout) {
      onNewWorkout()
    } else {
      router.push('/dashboard/schede/nuova')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
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
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtri
          </Button>
          <div className="flex items-center gap-2 border border-teal-500/30 rounded-lg p-1">
            <Button
              onClick={() => onViewModeChange('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'grid'
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-teal-400/60 hover:text-teal-400'
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onViewModeChange('list')}
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              className={
                viewMode === 'list'
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-teal-400/60 hover:text-teal-400'
              }
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleNewWorkout}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuova Scheda
          </Button>
        </div>
      </div>

      {/* Statistiche rapide */}
      {(totalCount !== undefined || activeCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-3">
          {totalCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Totale:</span>
              <Badge variant="outline" size="sm" className="text-text-primary">
                {totalCount}
              </Badge>
            </div>
          )}
          {activeCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Attive:</span>
              <Badge variant="success" size="sm">
                {activeCount}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
