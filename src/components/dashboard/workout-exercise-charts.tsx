'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '@/components/charts/client-recharts'
import type { WorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'
import { Dumbbell } from 'lucide-react'

interface WorkoutExerciseChartsProps {
  data: WorkoutExerciseStats
}

export function WorkoutExerciseCharts({ data }: WorkoutExerciseChartsProps) {
  const exerciseCharts = useMemo(() => {
    return data.exercises.map((exercise) => {
      const sessionMap = new Map<
        string,
        { date: string; weights: number[]; reps: number[]; seconds: number[] }
      >()

      for (const point of exercise.dataPoints) {
        const sessionKey = point.workout_log_id ?? `${point.date}-${point.set_number}`
        if (!sessionMap.has(sessionKey)) {
          sessionMap.set(sessionKey, { date: point.date, weights: [], reps: [], seconds: [] })
        }
        const dayData = sessionMap.get(sessionKey)!
        // Manteniamo la data più recente della sessione per label coerente.
        if (point.date > dayData.date) dayData.date = point.date
        dayData.weights.push(point.weight_kg)
        if (point.reps != null && point.reps > 0) {
          dayData.reps.push(point.reps)
        }
        if (point.execution_time_sec != null && point.execution_time_sec > 0) {
          dayData.seconds.push(point.execution_time_sec)
        }
      }

      const chartData = Array.from(sessionMap.values())
        .map((sessionData) => {
          const pesoMassimoSessione =
            sessionData.weights.length > 0 ? Math.max(...sessionData.weights) : null
          return {
            date: sessionData.date,
            peso_massimo_sessione: pesoMassimoSessione ?? 0,
            reps_media:
              sessionData.reps.length > 0
                ? sessionData.reps.reduce((a, b) => a + b, 0) / sessionData.reps.length
                : null,
            seconds_media:
              sessionData.seconds.length > 0
                ? sessionData.seconds.reduce((a, b) => a + b, 0) / sessionData.seconds.length
                : null,
          }
        })
        .sort((a, b) => a.date.localeCompare(b.date))

      const hasWeight = chartData.some((d) => d.peso_massimo_sessione > 0)
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
      {exerciseCharts.map(({ exercise, chartData, hasWeight, hasReps, hasTime: _hasTime }) => {
        const primaryMetric = hasWeight
          ? { key: 'peso_medio', label: 'Peso medio', unit: ' kg' }
          : hasReps
            ? { key: 'reps_media', label: 'Reps medie', unit: '' }
            : { key: 'seconds_media', label: 'Tempo medio', unit: ' s' }

        const noDataYet = chartData.length === 0

        const formatAxisDate = (raw: string | number) => {
          const s = String(raw).split('T')[0]
          const parts = s.split('-')
          if (parts.length === 3) {
            const [_y, m, d] = parts
            return `${Number(d)}/${Number(m)}`
          }
          const date = new Date(s)
          return Number.isNaN(date.getTime())
            ? String(raw)
            : `${date.getDate()}/${date.getMonth() + 1}`
        }

        return (
          <Card
            key={exercise.exercise_id}
            variant="default"
            className="!border-white/10 !bg-gradient-to-b !from-zinc-900/95 !to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:!border-white/20 group relative overflow-hidden rounded-lg transition-all duration-200"
          >
            <CardHeader className="relative z-10 pb-2.5 border-b border-white/10">
              <CardTitle size="sm" className="text-sm font-bold text-text-primary">
                {exercise.exercise_name}
              </CardTitle>
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
                <div className="space-y-2">
                  <p className="text-text-tertiary text-xs leading-snug">
                    {hasWeight
                      ? 'Peso massimo usato in ogni allenamento completato (una sessione = un punto).'
                      : hasReps
                        ? 'Andamento delle ripetizioni medie per sessione.'
                        : 'Andamento del tempo medio per serie.'}
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                      tickFormatter={formatAxisDate}
                      minTickGap={chartData.length > 6 ? 28 : 12}
                      angle={chartData.length > 8 ? -35 : 0}
                      textAnchor={chartData.length > 8 ? 'end' : 'middle'}
                      height={chartData.length > 8 ? 52 : 28}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                      width={44}
                      domain={[(dataMin: number) => dataMin - 1, (dataMax: number) => dataMax + 1]}
                      tickFormatter={(v: number) =>
                        hasWeight
                          ? Number.isInteger(v)
                            ? `${v}`
                            : v.toFixed(1)
                          : `${v}`
                      }
                      label={
                        hasWeight
                          ? {
                              value: 'kg',
                              angle: -90,
                              position: 'insideLeft',
                              fill: 'rgba(255, 255, 255, 0.45)',
                              fontSize: 10,
                            }
                          : undefined
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value: string | number) => {
                        const raw = String(value).split('T')[0]
                        const parts = raw.split('-')
                        if (parts.length === 3) {
                          const [y, m, d] = parts.map(Number)
                          const date = new Date(y, m - 1, d)
                          return date.toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        }
                        const date = new Date(value)
                        return Number.isNaN(date.getTime())
                          ? String(value)
                          : date.toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'peso_massimo_sessione') {
                          return [`${value.toFixed(1)} kg`, 'Peso massimo sessione']
                        }
                        if (name === 'reps_media') return [value.toFixed(0), 'Reps medie']
                        if (name === 'seconds_media') return [`${value.toFixed(0)} s`, 'Tempo medio']
                        return [value, name]
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={hasWeight ? 'peso_massimo_sessione' : primaryMetric.key}
                      stroke="rgb(34 211 238 / 0.8)"
                      strokeWidth={2}
                      dot={{ fill: 'rgb(34 211 238 / 0.8)', r: 3 }}
                      activeDot={{ r: 5, fill: 'rgb(34 211 238 / 0.95)' }}
                      name={hasWeight ? 'Peso massimo sessione' : primaryMetric.label}
                    />
                  </LineChart>
                </ResponsiveContainer>
                </div>
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
