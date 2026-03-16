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
      ...athletes
        .map((athlete) => ({ value: athlete.id, label: athlete.name }))
        .sort((a, b) => a.label.localeCompare(b.label, 'it')),
    ],
    [athletes],
  )

  const objectiveOptions = useMemo(
    () => [
      { value: '', label: 'Tutti gli obiettivi' },
      ...[...WORKOUT_OBJECTIVES]
        .map((o) => ({ value: o.value, label: o.label }))
        .sort((a, b) => a.label.localeCompare(b.label, 'it')),
    ],
    [],
  )

  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Cerca per nome scheda, atleta o PT..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="rounded-md border-white/10 bg-black/20 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-lg border-white/20 text-text-secondary hover:bg-white/5 hover:border-white/30 shrink-0"
          >
            <X className="mr-2 h-4 w-4" />
            Reset filtri
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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
              { value: 'archiviato', label: 'Archiviate' },
              { value: 'attivo', label: 'Attive' },
              { value: 'completato', label: 'Completate' },
            ].sort((a, b) => (a.value === '' ? -1 : b.value === '' ? 1 : a.label.localeCompare(b.label, 'it')))}
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
