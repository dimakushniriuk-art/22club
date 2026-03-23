// ============================================================
// Componente Lista Schede Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import type { Workout } from '@/types/workout'
import { WorkoutCard } from './workout-card'
import { WorkoutPlansEmptyState } from './workout-plans-empty-state'

interface WorkoutPlansListProps {
  workouts: Workout[]
  viewMode: 'grid' | 'list'
  searchTerm: string
  statusFilter: string
  onWorkoutClick: (workout: Workout) => void
  onViewClick: (workout: Workout) => void
  onDeleteClick?: (workout: Workout) => void
  onDuplicateClick?: (workout: Workout) => void | Promise<void>
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}

export function WorkoutPlansList({
  workouts,
  viewMode,
  searchTerm,
  statusFilter,
  onWorkoutClick,
  onViewClick,
  onDeleteClick,
  onDuplicateClick,
  getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutPlansListProps) {
  if (workouts.length === 0) {
    return <WorkoutPlansEmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
  }

  return (
    <div className="space-y-4">
      {workouts.length > 0 && (
        <p className="text-sm text-text-secondary">
          {workouts.length} {workouts.length === 1 ? 'scheda trovata' : 'schede trovate'}
        </p>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              viewMode="grid"
              onWorkoutClick={onWorkoutClick}
              onViewClick={onViewClick}
              onDeleteClick={onDeleteClick}
              onDuplicateClick={onDuplicateClick}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              viewMode="list"
              onWorkoutClick={onWorkoutClick}
              onViewClick={onViewClick}
              onDeleteClick={onDeleteClick}
              onDuplicateClick={onDuplicateClick}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
