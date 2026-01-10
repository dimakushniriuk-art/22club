'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
// Lazy load recharts per ridurre bundle size iniziale
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
import type { ProgressKPI } from '@/hooks/use-progress-analytics'
import { getValueRange, type ProgressRanges } from '@/lib/constants/progress-ranges'

interface ProgressChartsProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressCharts({ data, loading }: ProgressChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          variant="trainer"
          className="!bg-transparent !from-transparent !to-transparent border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
        >
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card
          variant="trainer"
          className="!bg-transparent !from-transparent !to-transparent border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
        >
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          variant="trainer"
          className="!bg-transparent !from-transparent !to-transparent border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
        >
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📈</div>
              <p className="text-text-secondary text-base font-medium">Nessun dato per i grafici</p>
            </div>
          </CardContent>
        </Card>
        <Card
          variant="trainer"
          className="!bg-transparent !from-transparent !to-transparent border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
        >
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📊</div>
              <p className="text-text-secondary text-base font-medium">Nessun dato per i grafici</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      color: string
      unit?: string
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      // Mappa name del payload ai range
      const getRangeForName = (name?: string) => {
        if (!name) return null
        const nameMap: Record<string, { category: keyof ProgressRanges; field: string }> = {
          peso: { category: 'valoriPrincipali', field: 'peso_kg' },
          Peso: { category: 'valoriPrincipali', field: 'peso_kg' },
          'Peso (kg)': { category: 'valoriPrincipali', field: 'peso_kg' },
        }
        const mapping = nameMap[name]
        if (!mapping) return null
        return getValueRange(mapping.category, mapping.field)
      }

      return (
        <div className="bg-black/90 rounded-lg border border-teal-500/30 p-3 min-w-[200px]">
          <p className="text-white font-medium mb-2">{formatDate(label || '')}</p>
          {payload.map((entry, index: number) => {
            const range = getRangeForName(entry.name)
            const isInRange =
              range && entry.value !== null
                ? entry.value >= range.min && entry.value <= range.max
                : null

            return (
              <div key={index} className="mb-1.5 last:mb-0">
                <p className="text-sm font-medium" style={{ color: entry.color }}>
                  {entry.name}: {entry.value}
                  {entry.unit || ''}
                </p>
                {range && (
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Range: {range.min}-{range.max}
                    {entry.unit || ''}
                    {isInRange === false && (
                      <span className="ml-1 text-state-error">⚠ Fuori range</span>
                    )}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Peso Chart */}
      <Card
        variant="trainer"
        className="!bg-transparent !from-transparent !to-transparent border-teal-500/30 [background-image:none!important]"
      >
        <CardHeader>
          <CardTitle size="md" className="text-white">
            Andamento Peso (Ultimi 60 giorni)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.datasetPeso.length > 0 ? (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            <ResponsiveContainer width="100%" height={250} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.datasetPeso} {...({} as any)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,.06)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--brand))', strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: 'hsl(var(--brand))',
                    strokeWidth: 2,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">⚖️</div>
                <p className="text-text-secondary">Nessun dato peso disponibile</p>
                <p className="text-text-tertiary text-sm">Inizia a tracciare il tuo peso!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forza Chart Dettagliato */}
      <Card
        variant="trainer"
        className="!bg-transparent !from-transparent !to-transparent border-teal-500/30 [background-image:none!important]"
      >
        <CardHeader>
          <CardTitle size="md" className="text-white">
            3️⃣ Forza (Ultimi 60 giorni)
          </CardTitle>
          <p className="text-text-secondary text-sm mt-1">
            Monitora i progressi di forza su panca, squat e stacco
          </p>
        </CardHeader>
        <CardContent>
          {data.datasetForzaDettagliata && data.datasetForzaDettagliata.length > 0 ? (
            <>
              {/* Valori Attuali */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
                  <div className="text-text-tertiary text-xs">Panca Piana</div>
                  <div className="text-white text-2xl font-bold">
                    {data.valoriForzaAttuali.max_bench_kg !== null
                      ? `${data.valoriForzaAttuali.max_bench_kg}kg`
                      : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
                  <div className="text-text-tertiary text-xs">Squat</div>
                  <div className="text-white text-2xl font-bold">
                    {data.valoriForzaAttuali.max_squat_kg !== null
                      ? `${data.valoriForzaAttuali.max_squat_kg}kg`
                      : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
                  <div className="text-text-tertiary text-xs">Stacco</div>
                  <div className="text-white text-2xl font-bold">
                    {data.valoriForzaAttuali.max_deadlift_kg !== null
                      ? `${data.valoriForzaAttuali.max_deadlift_kg}kg`
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Grafico */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ResponsiveContainer width="100%" height={300} {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LineChart data={data.datasetForzaDettagliata} {...({} as any)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,.06)"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="rgba(255,255,255,.38)"
                    fontSize={12}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,.38)"
                    fontSize={12}
                    domain={[0, 'dataMax + 10']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Legend
                    wrapperStyle={{ color: 'rgba(255,255,255,.7)' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_bench_kg"
                    name="Panca Piana (kg)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_squat_kg"
                    name="Squat (kg)"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_deadlift_kg"
                    name="Stacco (kg)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">💪</div>
                <p className="text-text-secondary">Nessun dato forza disponibile</p>
                <p className="text-text-tertiary text-sm">Inizia a tracciare la tua forza!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completamento Schede Chart */}
      <Card
        variant="trainer"
        className="lg:col-span-2 !bg-transparent !from-transparent !to-transparent border-teal-500/30 [background-image:none!important]"
      >
        <CardHeader>
          <CardTitle size="md" className="text-white">
            Completamento Schede (Ultime 4 settimane)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.datasetCompletamento.length > 0 ? (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            <ResponsiveContainer width="100%" height={250} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.datasetCompletamento} {...({} as any)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,.06)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  domain={[0, 100]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  type="monotone"
                  dataKey="percentuale"
                  stroke="var(--state-valid)"
                  strokeWidth={2}
                  dot={{
                    fill: 'var(--state-valid)',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: 'var(--state-valid)',
                    strokeWidth: 2,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">📋</div>
                <p className="text-text-secondary">Nessun dato completamento disponibile</p>
                <p className="text-text-tertiary text-sm">Inizia a completare le tue schede!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
