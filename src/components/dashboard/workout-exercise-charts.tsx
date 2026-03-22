'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from '@/components/charts/client-recharts'
import type { WorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import { TrendingUp, TrendingDown, Minus, Dumbbell } from 'lucide-react'

interface WorkoutExerciseChartsProps {
  data: WorkoutExerciseStats
}

export function WorkoutExerciseCharts({ data }: WorkoutExerciseChartsProps) {
  const exerciseCharts = useMemo(() => {
    return data.exercises.map((exercise) => {
      const dateMap = new Map<string, { weights: number[]; reps: number[]; seconds: number[] }>()

      for (const point of exercise.dataPoints) {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { weights: [], reps: [], seconds: [] })
        }
        const dayData = dateMap.get(point.date)!
        dayData.weights.push(point.weight_kg)
        if (point.reps != null && point.reps > 0) {
          dayData.reps.push(point.reps)
        }
        if (point.execution_time_sec != null && point.execution_time_sec > 0) {
          dayData.seconds.push(point.execution_time_sec)
        }
      }

      const chartData = Array.from(dateMap.entries())
        .map(([date, dayData]) => {
          const pesoMedio =
            dayData.weights.length > 0
              ? dayData.weights.reduce((a, b) => a + b, 0) / dayData.weights.length
              : null
          const pesoMax = dayData.weights.length > 0 ? Math.max(...dayData.weights) : null
          const pesoMin = dayData.weights.length > 0 ? Math.min(...dayData.weights) : null
          const repsMedia =
            dayData.reps.length > 0
              ? dayData.reps.reduce((a, b) => a + b, 0) / dayData.reps.length
              : null
          const secondsMedia =
            dayData.seconds.length > 0
              ? dayData.seconds.reduce((a, b) => a + b, 0) / dayData.seconds.length
              : null
          return {
            date,
            peso_medio: pesoMedio ?? 0,
            peso_max: pesoMax ?? 0,
            peso_min: pesoMin ?? 0,
            reps_media: repsMedia,
            seconds_media: secondsMedia,
          }
        })
        .sort((a, b) => a.date.localeCompare(b.date))

      const hasWeight = chartData.some((d) => d.peso_medio > 0 || d.peso_max > 0)
      const hasReps = chartData.some((d) => d.reps_media != null)
      const hasTime = chartData.some((d) => d.seconds_media != null)

      return {
        exercise,
        chartData,
        hasWeight,
        hasReps,
        hasTime,
      }
    })
  }, [data.exercises])

  if (exerciseCharts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {exerciseCharts.map(({ exercise, chartData, hasWeight, hasReps, hasTime }) => {
        const trend =
          chartData.length > 1 && hasWeight
            ? chartData[chartData.length - 1].peso_medio - chartData[0].peso_medio
            : chartData.length > 1 && hasReps
              ? (chartData[chartData.length - 1].reps_media ?? 0) - (chartData[0].reps_media ?? 0)
              : 0
        const trendLabel = hasWeight ? ' kg' : hasReps ? ' reps' : ''

        const noDataYet = chartData.length === 0

        return (
          <Card
            key={exercise.exercise_id}
            variant="default"
            className="!border-white/10 !bg-gradient-to-b !from-zinc-900/95 !to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:!border-white/20 group relative overflow-hidden rounded-lg transition-all duration-200"
          >
            <CardHeader className="relative z-10 pb-2.5 border-b border-white/10">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle size="sm" className="text-sm font-bold text-text-primary">
                    {exercise.exercise_name}
                  </CardTitle>
                  {exercise.exercise_category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {exercise.exercise_category}
                    </Badge>
                  )}
                </div>
                {!noDataYet && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {hasWeight && (
                      <>
                        <div className="text-right">
                          <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                            Peso Medio
                          </div>
                          <div className="text-text-primary text-xs font-bold">
                            {exercise.average_weight != null
                              ? `${exercise.average_weight.toFixed(1)} kg`
                              : 'N/A'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                            Peso Max
                          </div>
                          <div className="text-text-primary text-xs font-bold">
                            {exercise.max_weight != null
                              ? `${exercise.max_weight.toFixed(1)} kg`
                              : 'N/A'}
                          </div>
                        </div>
                      </>
                    )}
                    {hasReps && exercise.average_reps != null && (
                      <div className="text-right">
                        <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                          Reps media
                        </div>
                        <div className="text-text-primary text-xs font-bold">
                          {exercise.average_reps.toFixed(0)}
                        </div>
                      </div>
                    )}
                    {hasTime && exercise.average_seconds != null && (
                      <div className="text-right">
                        <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                          Tempo (s)
                        </div>
                        <div className="text-text-primary text-xs font-bold">
                          {exercise.average_seconds.toFixed(0)} s
                        </div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                        Sessioni
                      </div>
                      <div className="text-text-primary text-xs font-bold">
                        {exercise.total_sessions}
                      </div>
                    </div>
                    {chartData.length > 1 && (hasWeight || hasReps) && (
                      <div className="flex items-center gap-1">
                        {trend > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-state-success" />
                        ) : trend < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5 text-state-error" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-text-tertiary" />
                        )}
                        <span
                          className={`text-[10px] font-medium ${
                            trend > 0
                              ? 'text-state-success'
                              : trend < 0
                                ? 'text-state-error'
                                : 'text-text-tertiary'
                          }`}
                        >
                          {trend > 0 ? '+' : ''}
                          {trend.toFixed(hasWeight ? 1 : 0)}
                          {trendLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2.5">
              {noDataYet ? (
                <div className="flex flex-col items-center justify-center py-8 px-2">
                  <Dumbbell className="h-10 w-10 text-text-tertiary mb-2 opacity-60" />
                  <p className="text-text-secondary text-sm font-medium text-center">
                    Nessun dato ancora
                  </p>
                  <p className="text-text-tertiary text-xs text-center mt-1">
                    Completa un allenamento che include questo esercizio per vedere i progressi.
                  </p>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                      tickFormatter={(value: string | number) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}`
                      }}
                    />
                    {hasWeight && (
                      <YAxis
                        yAxisId="left"
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                        label={{
                          value: 'Peso (kg)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: 'rgba(255, 255, 255, 0.7)',
                        }}
                      />
                    )}
                    {hasWeight && (hasReps || hasTime) && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                        label={{
                          value: hasReps ? 'Ripetizioni' : 'Tempo (s)',
                          angle: 90,
                          position: 'insideRight',
                          fill: 'rgba(255, 255, 255, 0.7)',
                        }}
                      />
                    )}
                    {!hasWeight && (hasReps || hasTime) && (
                      <YAxis
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                        label={{
                          value: hasReps ? 'Ripetizioni' : 'Tempo (s)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: 'rgba(255, 255, 255, 0.7)',
                        }}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value: string | number) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'peso_medio') return [`${value.toFixed(1)} kg`, 'Peso Medio']
                        if (name === 'peso_max') return [`${value.toFixed(1)} kg`, 'Peso Max']
                        if (name === 'peso_min') return [`${value.toFixed(1)} kg`, 'Peso Min']
                        if (name === 'reps_media') return [value.toFixed(0), 'Reps media']
                        if (name === 'seconds_media') return [`${value.toFixed(0)} s`, 'Tempo (s)']
                        return [value, name]
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }} iconType="line" />
                    {hasWeight && (
                      <>
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="peso_medio"
                          stroke="#0FB5BA"
                          strokeWidth={2}
                          dot={{ fill: '#0FB5BA', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Peso Medio"
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="peso_max"
                          stroke="#22C55E"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          dot={{ fill: '#22C55E', r: 3 }}
                          name="Peso Max"
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="peso_min"
                          stroke="#EF4444"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          dot={{ fill: '#EF4444', r: 3 }}
                          name="Peso Min"
                        />
                      </>
                    )}
                    {hasReps && (
                      <Line
                        yAxisId={hasWeight ? 'right' : undefined}
                        type="monotone"
                        dataKey="reps_media"
                        stroke="#A78BFA"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ fill: '#A78BFA', r: 3 }}
                        name="Reps media"
                      />
                    )}
                    {hasTime && (
                      <Line
                        yAxisId={hasWeight || hasReps ? 'right' : undefined}
                        type="monotone"
                        dataKey="seconds_media"
                        stroke="#F59E0B"
                        strokeWidth={hasWeight || hasReps ? 1.5 : 2}
                        strokeDasharray={hasWeight || hasReps ? '4 4' : undefined}
                        dot={{ fill: '#F59E0B', r: hasWeight || hasReps ? 3 : 4 }}
                        name="Tempo (s)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-text-secondary text-xs">
                    Nessun dato disponibile per questo esercizio
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
