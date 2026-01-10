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
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface WorkoutExerciseChartsProps {
  data: WorkoutExerciseStats
}

export function WorkoutExerciseCharts({ data }: WorkoutExerciseChartsProps) {
  // Prepara i dati per i grafici: raggruppa per esercizio e crea dataset per ogni esercizio
  const exerciseCharts = useMemo(() => {
    return data.exercises.map((exercise) => {
      // Raggruppa i dataPoints per data e calcola peso medio per ogni data
      const dateMap = new Map<string, { weights: number[]; reps: number[] }>()

      for (const point of exercise.dataPoints) {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { weights: [], reps: [] })
        }
        const dayData = dateMap.get(point.date)!
        dayData.weights.push(point.weight_kg)
        if (point.reps) {
          dayData.reps.push(point.reps)
        }
      }

      // Crea dataset per il grafico (una entry per data con peso medio)
      const chartData = Array.from(dateMap.entries())
        .map(([date, dayData]) => ({
          date,
          peso_medio: dayData.weights.reduce((a, b) => a + b, 0) / dayData.weights.length,
          peso_max: Math.max(...dayData.weights),
          peso_min: Math.min(...dayData.weights),
          reps_media:
            dayData.reps.length > 0
              ? dayData.reps.reduce((a, b) => a + b, 0) / dayData.reps.length
              : null,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        exercise,
        chartData,
      }
    })
  }, [data.exercises])

  if (exerciseCharts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {exerciseCharts.map(({ exercise, chartData }) => {
        const trend =
          chartData.length > 1
            ? chartData[chartData.length - 1].peso_medio - chartData[0].peso_medio
            : 0

        return (
          <Card
            key={exercise.exercise_id}
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle
                    size="sm"
                    className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
                  >
                    {exercise.exercise_name}
                  </CardTitle>
                  {exercise.exercise_category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {exercise.exercise_category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Statistiche rapide */}
                  <div className="text-right">
                    <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                      Peso Medio
                    </div>
                    <div className="text-teal-300 text-xs font-bold">
                      {exercise.average_weight ? `${exercise.average_weight.toFixed(1)} kg` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                      Peso Max
                    </div>
                    <div className="text-teal-300 text-xs font-bold">
                      {exercise.max_weight ? `${exercise.max_weight.toFixed(1)} kg` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-tertiary text-[10px] uppercase tracking-wide">
                      Sessioni
                    </div>
                    <div className="text-teal-300 text-xs font-bold">{exercise.total_sessions}</div>
                  </div>
                  {/* Trend */}
                  {chartData.length > 1 && (
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
                        {trend.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2.5">
              {chartData.length > 0 ? (
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
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                      label={{
                        value: 'Peso (kg)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: 'rgba(255, 255, 255, 0.7)',
                      }}
                    />
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
                        return [value, name]
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }} iconType="line" />
                    <Line
                      type="monotone"
                      dataKey="peso_medio"
                      stroke="#0FB5BA"
                      strokeWidth={2}
                      dot={{ fill: '#0FB5BA', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Peso Medio"
                    />
                    <Line
                      type="monotone"
                      dataKey="peso_max"
                      stroke="#22C55E"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={{ fill: '#22C55E', r: 3 }}
                      name="Peso Max"
                    />
                    <Line
                      type="monotone"
                      dataKey="peso_min"
                      stroke="#EF4444"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={{ fill: '#EF4444', r: 3 }}
                      name="Peso Min"
                    />
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
