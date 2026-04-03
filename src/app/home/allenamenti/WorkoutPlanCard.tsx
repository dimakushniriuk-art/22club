'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Target, Activity } from 'lucide-react'

export interface WorkoutPlanCardWorkout {
  id: string
  name: string
  description?: string | null
  difficulty?: string | null
  muscle_group?: string | null
  staff_name?: string | null
}

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20 active:opacity-90'

interface WorkoutPlanCardProps {
  workout: WorkoutPlanCardWorkout
}

function WorkoutPlanCardComponent({ workout }: WorkoutPlanCardProps) {
  const { pathBase } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const href = workoutsPane
    ? workoutsPane.hrefFor({ kind: 'scheda', workoutPlanId: workout.id })
    : `${pathBase}/${workout.id}`
  return (
    <Link
      href={href}
      className="block touch-manipulation"
      prefetch={true}
      onClick={(e) => {
        if (!workoutsPane) return
        e.preventDefault()
        workoutsPane.navigateTo({ kind: 'scheda', workoutPlanId: workout.id })
      }}
    >
      <Card className={`relative cursor-pointer overflow-hidden ${CARD_DS}`}>
        <CardContent className="relative z-10 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1.5 truncate text-sm font-semibold text-cyan-400 sm:text-base">
                {workout.name}
              </h3>
              {workout.description && (
                <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-[13px]">
                  {workout.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
                {workout.difficulty && (
                  <div className="flex items-center gap-0.5">
                    <Target className="h-3 w-3 text-cyan-400" />
                    <span className="truncate capitalize text-text-secondary">
                      {workout.difficulty}
                    </span>
                  </div>
                )}
                {workout.muscle_group && (
                  <div className="flex items-center gap-0.5">
                    <Activity className="h-3 w-3 text-cyan-400" />
                    <span className="truncate text-text-secondary">{workout.muscle_group}</span>
                  </div>
                )}
                {workout.staff_name && (
                  <span className="truncate text-text-secondary">PT: {workout.staff_name}</span>
                )}
              </div>
            </div>
            <Badge
              variant="secondary"
              size="sm"
              className="shrink-0 text-[10px] border-0 bg-cyan-500 text-white"
            >
              Attiva
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const WorkoutPlanCard = memo(WorkoutPlanCardComponent)
