'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
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
import { TrendingDown, TrendingUp, Minus, Ruler } from 'lucide-react'
import { getValueRange, type ProgressRanges } from '@/lib/constants/progress-ranges'

interface ProgressCirconferenzeProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressCirconferenze({ data, loading }: ProgressCirconferenzeProps) {
  if (loading) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300"
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.datasetCirconferenze.length === 0) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300"
      >
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2 text-white">
            <Ruler className="h-5 w-5 text-teal-400" />
            2️⃣ Circonferenze (Volumi Muscolari)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📏</div>
              <p className="text-text-secondary text-base font-medium">
                Nessun dato di circonferenze disponibile
              </p>
              <p className="text-text-tertiary text-sm mt-2">
                Registra le tue misurazioni per vedere i progressi!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
      value: number | null
      color: string
      unit?: string
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      // Mappa label del payload ai range (Recharts usa il name che corrisponde al label)
      const getRangeForLabel = (label?: string) => {
        if (!label) return null
        const labelMap: Record<string, { category: keyof ProgressRanges; field: string }> = {
          'Braccio Contratto': { category: 'circonferenze', field: 'braccio_contratto_cm' },
          Torace: { category: 'circonferenze', field: 'torace_cm' },
          Spalle: { category: 'circonferenze', field: 'spalle_cm' },
          'Coscia Media': { category: 'circonferenze', field: 'coscia_media_cm' },
          Glutei: { category: 'circonferenze', field: 'glutei_cm' },
          Polpaccio: { category: 'circonferenze', field: 'polpaccio_cm' },
          Vita: { category: 'circonferenze', field: 'vita_cm' },
          'Addome Basso': { category: 'circonferenze', field: 'addome_basso_cm' },
          Fianchi: { category: 'circonferenze', field: 'fianchi_cm' },
        }
        const mapping = labelMap[label]
        if (!mapping) return null
        return getValueRange(mapping.category, mapping.field)
      }

      return (
        <div className="bg-black/90 rounded-lg border border-teal-500/30 p-3 min-w-[200px]">
          <p className="text-white font-medium mb-2">{formatDate(label || '')}</p>
          {payload.map((entry, index) => {
            if (entry.value === null) return null
            const range = getRangeForLabel(entry.name)
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

  const getTrendIcon = (
    current: number | null,
    previous: number | null,
    isPositiveIncrease = true,
  ) => {
    if (current === null || previous === null)
      return <Minus className="text-text-tertiary h-4 w-4" />
    if (current < previous) {
      return isPositiveIncrease ? (
        <TrendingDown className="text-state-error h-4 w-4" />
      ) : (
        <TrendingDown className="text-state-success h-4 w-4" />
      )
    }
    if (current > previous) {
      return isPositiveIncrease ? (
        <TrendingUp className="text-state-success h-4 w-4" />
      ) : (
        <TrendingUp className="text-state-error h-4 w-4" />
      )
    }
    return <Minus className="text-text-tertiary h-4 w-4" />
  }

  const getTrendText = (current: number | null, previous: number | null, unit: string) => {
    if (current === null || previous === null) return 'N/A'
    const diff = current - previous
    if (diff === 0) return 'Stabile'
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}${unit}`
  }

  // Calcola valori precedenti per il confronto
  const previousData =
    data.datasetCirconferenze.length > 1
      ? data.datasetCirconferenze[data.datasetCirconferenze.length - 2]
      : null

  // Circonferenze che devono aumentare (ipertrofia)
  const circonferenzeAumento = [
    { key: 'braccio_contratto_cm', label: 'Braccio Contratto', color: '#3b82f6' },
    { key: 'torace_cm', label: 'Torace', color: '#8b5cf6' },
    { key: 'spalle_cm', label: 'Spalle', color: '#06b6d4' },
    { key: 'coscia_media_cm', label: 'Coscia Media', color: '#10b981' },
    { key: 'glutei_cm', label: 'Glutei', color: '#f59e0b' },
    { key: 'polpaccio_cm', label: 'Polpaccio', color: '#ec4899' },
  ]

  // Circonferenze che devono diminuire (definizione)
  const circonferenzeDiminuzione = [
    { key: 'vita_cm', label: 'Vita', color: '#ef4444' },
    { key: 'addome_basso_cm', label: 'Addome Basso', color: '#f97316' },
    { key: 'fianchi_cm', label: 'Fianchi', color: '#eab308' },
  ]

  return (
    <div className="space-y-4">
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300"
      >
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2 text-white">
            <Ruler className="h-5 w-5 text-teal-400" />
            2️⃣ Circonferenze (Volumi Muscolari)
          </CardTitle>
          <p className="text-text-secondary text-sm mt-1">
            Monitora la crescita muscolare e la definizione
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valori Attuali - Aumento Positivo */}
          <div>
            <h3 className="text-text-primary mb-3 text-sm font-semibold text-white">
              ⬆️ Aumento Positivo (Ipertrofia)
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {circonferenzeAumento.map((circ) => {
                const current =
                  data.valoriCirconferenzeAttuali[
                    circ.key as keyof typeof data.valoriCirconferenzeAttuali
                  ]
                const previousRaw = previousData
                  ? previousData[circ.key as keyof typeof previousData]
                  : null
                const previous =
                  typeof previousRaw === 'number'
                    ? previousRaw
                    : typeof previousRaw === 'string'
                      ? parseFloat(previousRaw) || null
                      : null
                return (
                  <div key={circ.key} className="space-y-2">
                    <div className="text-text-tertiary text-xs">{circ.label}</div>
                    <div className="text-white text-2xl font-bold">
                      {current !== null ? `${current.toFixed(1)}cm` : 'N/A'}
                    </div>
                    {previousData && (
                      <div className="flex items-center gap-1 text-xs">
                        {getTrendIcon(current, previous, true)}
                        <span className="text-text-secondary">
                          {getTrendText(current, previous, 'cm')}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Valori Attuali - Riduzione Positiva */}
          <div>
            <h3 className="text-text-primary mb-3 text-sm font-semibold text-white">
              ⬇️ Riduzione Positiva (Definizione)
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
              {circonferenzeDiminuzione.map((circ) => {
                const current =
                  data.valoriCirconferenzeAttuali[
                    circ.key as keyof typeof data.valoriCirconferenzeAttuali
                  ]
                const previousRaw = previousData
                  ? previousData[circ.key as keyof typeof previousData]
                  : null
                const previous =
                  typeof previousRaw === 'number'
                    ? previousRaw
                    : typeof previousRaw === 'string'
                      ? parseFloat(previousRaw) || null
                      : null
                return (
                  <div key={circ.key} className="space-y-2">
                    <div className="text-text-tertiary text-xs">{circ.label}</div>
                    <div className="text-white text-2xl font-bold">
                      {current !== null ? `${current.toFixed(1)}cm` : 'N/A'}
                    </div>
                    {previousData && (
                      <div className="flex items-center gap-1 text-xs">
                        {getTrendIcon(current, previous, false)}
                        <span className="text-text-secondary">
                          {getTrendText(current, previous, 'cm')}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grafico Circonferenze - Ipertrofia */}
          <div>
            <h3 className="text-text-primary mb-4 text-lg font-semibold text-white">
              Andamento Ipertrofia (Aumento)
            </h3>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.datasetCirconferenze} {...({} as any)}>
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
                {circonferenzeAumento.map((circ) => (
                  <Line
                    key={circ.key}
                    type="monotone"
                    dataKey={circ.key}
                    name={circ.label}
                    stroke={circ.color}
                    strokeWidth={2}
                    dot={{ fill: circ.color, r: 3 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico Circonferenze - Definizione */}
          <div>
            <h3 className="text-text-primary mb-4 text-lg font-semibold text-white">
              Andamento Definizione (Riduzione)
            </h3>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.datasetCirconferenze} {...({} as any)}>
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
                {circonferenzeDiminuzione.map((circ) => (
                  <Line
                    key={circ.key}
                    type="monotone"
                    dataKey={circ.key}
                    name={circ.label}
                    stroke={circ.color}
                    strokeWidth={2}
                    dot={{ fill: circ.color, r: 3 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({} as any)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
