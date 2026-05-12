import { describe, expect, it } from 'vitest'
import {
  applyExerciseSetPatch,
  displayWorkoutRepsCell,
  getWorkoutColumnsTemplate,
  isWorkoutSetCompleted,
  resolveExerciseIndexInSession,
  resolveSetWeightKgForPicker,
  sessionExercisesToPersistPayload,
  workoutDayExerciseRowId,
} from '@/features/live-workout-session/lib/live-workout-session-helpers'
import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import type { WorkoutSession } from '@/types/workout'

describe('live-workout-session helpers', () => {
  it('getWorkoutColumnsTemplate adds rest column when requested', () => {
    expect(getWorkoutColumnsTemplate(3, false)).toBe('repeat(3, minmax(0, 1fr))')
    expect(getWorkoutColumnsTemplate(3, true)).toBe('repeat(3, minmax(0, 1fr)) 2.5rem')
  })

  it('resolveSetWeightKgForPicker prefers set weight then target', () => {
    expect(resolveSetWeightKgForPicker({ weight_kg: 40 }, { target_weight: 20 })).toBe(40)
    expect(resolveSetWeightKgForPicker({ weight_kg: null }, { target_weight: 20 })).toBe(20)
    expect(resolveSetWeightKgForPicker({}, {})).toBe(0)
  })

  it('displayWorkoutRepsCell maps MAX sentinel', () => {
    expect(displayWorkoutRepsCell(null, WORKOUT_REPS_MAX_SENTINEL)).toBe('MAX')
    expect(displayWorkoutRepsCell(8, 10)).toBe(8)
  })

  it('workoutDayExerciseRowId resolves known keys', () => {
    expect(workoutDayExerciseRowId({ id: 'wde-1' })).toBe('wde-1')
    expect(workoutDayExerciseRowId({ workout_day_exercise_id: 'wde-2' })).toBe('wde-2')
    expect(workoutDayExerciseRowId(null)).toBe('')
  })

  it('sessionExercisesToPersistPayload normalizes sets', () => {
    const payload = sessionExercisesToPersistPayload([
      {
        id: 'wde-1',
        exercise_id: 'ex-1',
        sets: [{ set_number: 1, reps: 10, weight_kg: 50, completed: true }],
      },
    ])
    expect(payload).toEqual([
      {
        id: 'wde-1',
        exercise_id: 'ex-1',
        sets: [
          {
            set_number: 1,
            reps: 10,
            weight_kg: 50,
            execution_time_sec: null,
            rest_timer_sec: null,
          },
        ],
      },
    ])
  })

  it('isWorkoutSetCompleted accepts boolean and numeric flags', () => {
    expect(isWorkoutSetCompleted({ completed: true })).toBe(true)
    expect(isWorkoutSetCompleted({ completed: 1 })).toBe(true)
    expect(isWorkoutSetCompleted({ completed: false })).toBe(false)
  })

  it('applyExerciseSetPatch updates completion counters', () => {
    const prev: WorkoutSession = {
      exercises: [
        {
          id: 'wde-1',
          sets: [
            { set_number: 1, completed: true },
            { set_number: 2, completed: false },
          ],
        },
      ],
      total_exercises: 1,
      completed_exercises: 0,
      progress_percentage: 0,
    } as unknown as WorkoutSession

    const next = applyExerciseSetPatch(prev, 0, 2, { completed: true })
    expect(next?.completed_exercises).toBe(1)
    expect(next?.progress_percentage).toBe(100)
    expect(resolveExerciseIndexInSession(prev.exercises, { id: 'wde-1' })).toBe(0)
  })
})
