'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { useIcon } from '@/components/ui/professional-icons'
// Lazy load recharts per ridurre bundle size iniziale
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from '@/components/charts/client-recharts'
import type { ProgressLog } from '@/types/progress'

interface ProgressChartsProps {
  progressLogs: ProgressLog[]
  loading?: boolean
}

export function ProgressCharts({ progressLogs, loading = false }: ProgressChartsProps) {
  // Prepara le icone
  const chartIcon = useIcon('📊', { size: 48, className: 'text-teal-400 opacity-50' })

  // Prepara i dati per i grafici
  const weightData = progressLogs
    .filter((log) => log.weight_kg !== null)
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString('it-IT', {
        month: 'short',
        day: 'numeric',
      }),
      weight: log.weight_kg,
      fullDate: log.date,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  const strengthData = progressLogs
    .filter(
      (log) =>
        log.max_bench_kg !== null || log.max_squat_kg !== null || log.max_deadlift_kg !== null,
    )
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString('it-IT', {
        month: 'short',
        day: 'numeric',
      }),
      bench: log.max_bench_kg,
      squat: log.max_squat_kg,
      deadlift: log.max_deadlift_kg,
      fullDate: log.date,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  // Dati per il radar chart delle circonferenze
  const getLatestMeasurements = () => {
    const latest = progressLogs
      .filter(
        (log) =>
          log.chest_cm !== null &&
          log.waist_cm !== null &&
          log.hips_cm !== null &&
          log.biceps_cm !== null &&
          log.thighs_cm !== null,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const previous = progressLogs
      .filter(
        (log) =>
          log.chest_cm !== null &&
          log.waist_cm !== null &&
          log.hips_cm !== null &&
          log.biceps_cm !== null &&
          log.thighs_cm !== null &&
          new Date(log.date) < new Date(latest?.date || ''),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return { latest, previous }
  }

  const { latest, previous } = getLatestMeasurements()

  const radarData = latest
    ? [
        {
          measurement: 'Petto',
          current: latest.chest_cm,
          previous: previous?.chest_cm || 0,
        },
        {
          measurement: 'Vita',
          current: latest.waist_cm,
          previous: previous?.waist_cm || 0,
        },
        {
          measurement: 'Fianchi',
          current: latest.hips_cm,
          previous: previous?.hips_cm || 0,
        },
        {
          measurement: 'Bicipiti',
          current: latest.biceps_cm,
          previous: previous?.biceps_cm || 0,
        },
        {
          measurement: 'Cosce',
          current: latest.thighs_cm,
          previous: previous?.thighs_cm || 0,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grafico Peso */}
      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle size="md" className="flex items-center gap-2">
              <div className="bg-brand h-3 w-3 rounded-full" />
              Peso nel Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {/* Workaround necessario per tipizzazione Recharts */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LineChart data={weightData} {...({} as any)}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" {...({} as any)} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    fontSize={12}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value: number) => [`${value} kg`, 'Peso']}
                    labelFormatter={(label: string | number) => `Data: ${label}`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#02B3BF"
                    strokeWidth={3}
                    dot={{ fill: '#02B3BF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#02B3BF', strokeWidth: 2 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grafico Forza */}
      {strengthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle size="md" className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              Forza Massimale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LineChart data={strengthData} {...({} as any)}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" {...({} as any)} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} {...({} as any)} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} kg`,
                      name === 'bench'
                        ? 'Bench'
                        : name === 'squat'
                          ? 'Squat'
                          : name === 'deadlift'
                            ? 'Stacco'
                            : name,
                    ]}
                    labelFormatter={(label: string | number) => `Data: ${label}`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="bench"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                    name="bench"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="squat"
                    stroke="#EAB308"
                    strokeWidth={2}
                    dot={{ fill: '#EAB308', strokeWidth: 2, r: 3 }}
                    name="squat"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="deadlift"
                    stroke="#D97706"
                    strokeWidth={2}
                    dot={{ fill: '#D97706', strokeWidth: 2, r: 3 }}
                    name="deadlift"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radar Chart Circonferenze */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle size="md" className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-white" />
              Circonferenze - Confronto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {/* Workaround necessario per tipizzazione Recharts */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RadarChart data={radarData} {...({} as any)}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <PolarGrid stroke="#374151" {...({} as any)} />
                  <PolarAngleAxis
                    dataKey="measurement"
                    stroke="#9CA3AF"
                    fontSize={12}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <PolarRadiusAxis
                    stroke="#9CA3AF"
                    fontSize={10}
                    domain={[0, 'dataMax + 5']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Radar
                    name="Attuale"
                    dataKey="current"
                    stroke="#02B3BF"
                    fill="#02B3BF"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  {previous && (
                    <Radar
                      name="Precedente"
                      dataKey="previous"
                      stroke="#6B7280"
                      fill="#6B7280"
                      fillOpacity={0.1}
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({} as any)}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-brand h-3 w-3 rounded-full" />
                <span className="text-text-secondary">Attuale</span>
              </div>
              {previous && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span className="text-text-secondary">Precedente</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {weightData.length === 0 && strengthData.length === 0 && radarData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-4 flex justify-center">{chartIcon}</div>
            <h3 className="text-text-primary mb-2 text-lg font-medium">
              Nessun dato per i grafici
            </h3>
            <p className="text-text-secondary text-sm">
              Registra alcune misurazioni per vedere i tuoi progressi graficamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
