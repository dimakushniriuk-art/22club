// ============================================================
// Componente Filtri Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { WORKOUT_OBJECTIVES } from '@/lib/constants/workout-objectives'
import { useMemo } from 'react'

interface WorkoutPlansFiltersProps {
  searchTerm: string
  statusFilter: string
  athleteFilter: string
  objectiveFilter: string
  athletes: Array<{ id: string; name: string; email: string }>
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onAthleteFilterChange: (value: string) => void
  onObjectiveFilterChange: (value: string) => void
}

export function WorkoutPlansFilters({
  searchTerm,
  statusFilter,
  athleteFilter,
  objectiveFilter,
  athletes,
  onSearchChange,
  onStatusFilterChange,
  onAthleteFilterChange,
  onObjectiveFilterChange,
}: WorkoutPlansFiltersProps) {
  const hasActiveFilters = useMemo(
    () => Boolean(searchTerm || statusFilter || athleteFilter || objectiveFilter),
    [searchTerm, statusFilter, athleteFilter, objectiveFilter],
  )

  const handleClearFilters = () => {
    onSearchChange('')
    onStatusFilterChange('')
    onAthleteFilterChange('')
    onObjectiveFilterChange('')
  }

  const athleteOptions = useMemo(
    () => [
      { value: '', label: 'Tutti gli atleti' },
      ...athletes.map((athlete) => ({
        value: athlete.id,
        label: athlete.name,
      })),
    ],
    [athletes],
  )

  const objectiveOptions = useMemo(
    () => [{ value: '', label: 'Tutti gli obiettivi' }, ...WORKOUT_OBJECTIVES],
    [],
  )

  return (
    <div className="space-y-4">
      {/* Barra ricerca principale */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Cerca per nome scheda, atleta o PT..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Reset filtri
          </Button>
        )}
      </div>

      {/* Filtri avanzati in griglia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-text-secondary text-xs font-medium flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Stato
          </label>
          <SimpleSelect
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            options={[
              { value: '', label: 'Tutti gli stati' },
              { value: 'attivo', label: 'Attive' },
              { value: 'completato', label: 'Completate' },
              { value: 'archiviato', label: 'Archiviate' },
            ]}
            placeholder="Filtra per stato"
          />
        </div>

        <div className="space-y-2">
          <label className="text-text-secondary text-xs font-medium flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Atleta
          </label>
          <SimpleSelect
            value={athleteFilter}
            onValueChange={onAthleteFilterChange}
            options={athleteOptions}
            placeholder="Filtra per atleta"
          />
        </div>

        <div className="space-y-2">
          <label className="text-text-secondary text-xs font-medium flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Obiettivo
          </label>
          <SimpleSelect
            value={objectiveFilter}
            onValueChange={onObjectiveFilterChange}
            options={objectiveOptions}
            placeholder="Filtra per obiettivo"
          />
        </div>
      </div>
    </div>
  )
}
