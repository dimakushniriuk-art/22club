'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:schede:page')
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { useWorkoutPlans } from '@/hooks/workout-plans/use-workout-plans'
import { WorkoutPlansHeader, WorkoutPlansList } from '@/components/workout-plans'
import { useToast } from '@/components/ui/toast'
import type { Workout } from '@/types/workout'

// Lazy load dei componenti pesanti per migliorare performance iniziale
const WorkoutDetailModal = lazy(() =>
  import('@/components/workout/workout-detail-modal').then((mod) => ({
    default: mod.WorkoutDetailModal,
  })),
)
const WorkoutPlansFilters = lazy(() =>
  import('@/components/workout-plans').then((mod) => ({
    default: mod.WorkoutPlansFilters,
  })),
)

export default function SchedePage() {
  const router = useRouter()
  const {
    workouts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    athleteFilter,
    setAthleteFilter,
    objectiveFilter,
    setObjectiveFilter,
    athletes,
    handleDeleteWorkout,
    getStatusColor,
    getStatusText,
    formatDate,
  } = useWorkoutPlans()

  const { addToast } = useToast()
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkoutId(workout.id)
  }

  const handleViewClick = (workout: Workout) => {
    setSelectedWorkoutId(workout.id)
  }

  const handleDeleteClick = async (workout: Workout) => {
    try {
      await handleDeleteWorkout(workout.id)
      addToast({
        title: 'Scheda eliminata',
        message: `La scheda "${workout.name}" è stata eliminata con successo.`,
        variant: 'success',
      })
    } catch (error) {
      logger.error('Errore eliminazione scheda', error, { workoutId: workout.id })
      addToast({
        title: 'Errore',
        message: error instanceof Error ? error.message : "Errore nell'eliminazione della scheda",
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <LoadingState message="Caricamento schede..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <ErrorState message={error} onRetry={() => router.refresh()} />
        </div>
      </div>
    )
  }

  // Calcola statistiche
  const stats = {
    total: workouts.length,
    active: workouts.filter((w) => w.status === 'attivo').length,
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        <WorkoutPlansHeader
          totalCount={stats.total}
          activeCount={stats.active}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
        />

        {showFilters && (
          <Suspense fallback={<LoadingState message="Caricamento filtri..." />}>
            <WorkoutPlansFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              athleteFilter={athleteFilter}
              objectiveFilter={objectiveFilter}
              athletes={athletes}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onAthleteFilterChange={setAthleteFilter}
              onObjectiveFilterChange={setObjectiveFilter}
            />
          </Suspense>
        )}

        <WorkoutPlansList
          workouts={workouts}
          viewMode={viewMode}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onWorkoutClick={handleWorkoutClick}
          onViewClick={handleViewClick}
          onDeleteClick={handleDeleteClick}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          formatDate={formatDate}
        />
      </div>

      {/* Workout Detail Modal - Lazy loaded solo quando aperto */}
      {selectedWorkoutId && (
        <Suspense fallback={<div className="hidden" />}>
          <WorkoutDetailModal
            workoutId={selectedWorkoutId}
            open={selectedWorkoutId !== null}
            onOpenChange={(open) => !open && setSelectedWorkoutId(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
