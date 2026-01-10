'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
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
import type { ProgressKPI } from '@/hooks/use-progress-analytics'
import { TrendingDown, TrendingUp, Minus, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getValueRange, type ProgressRanges } from '@/lib/constants/progress-ranges'

interface ProgressComposizioneCorporeaProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressComposizioneCorporea({ data, loading }: ProgressComposizioneCorporeaProps) {
  if (loading) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5"
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

  if (!data || data.datasetComposizioneCorporea.length === 0) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300"
      >
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Scale className="h-5 w-5 text-teal-400" />
            </div>
            1️⃣ Composizione Corporea
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📊</div>
              <p className="text-text-secondary text-base font-medium">
                Nessun dato di composizione corporea disponibile
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
      dataKey?: string
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      // Mappa name del payload ai range (Recharts non passa dataKey nel payload)
      const getRangeForName = (name?: string) => {
        if (!name) return null
        const nameMap: Record<string, { category: keyof ProgressRanges; field: string }> = {
          'Massa Grassa (kg)': { category: 'valoriPrincipali', field: 'massa_grassa_kg' },
          'Massa Magra (kg)': { category: 'valoriPrincipali', field: 'massa_magra_kg' },
          'Massa Muscolare (kg)': { category: 'valoriPrincipali', field: 'massa_muscolare_kg' },
          'Massa Muscolare Scheletrica (kg)': {
            category: 'valoriPrincipali',
            field: 'massa_muscolare_scheletrica_kg',
          },
          'Massa Grassa (%)': { category: 'valoriPrincipali', field: 'massa_grassa_percentuale' },
        }
        const mapping = nameMap[name]
        if (!mapping) return null
        return getValueRange(mapping.category, mapping.field)
      }

      return (
        <div className="bg-black/90 rounded-lg border border-teal-500/30 p-3 min-w-[200px]">
          <p className="text-white font-medium mb-2">{formatDate(label || '')}</p>
          {payload.map((entry, index) => {
            if (entry.value === null) return null
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

  const getTrendIcon = (current: number | null, previous: number | null) => {
    if (current === null || previous === null)
      return <Minus className="text-text-tertiary h-4 w-4" />
    if (current < previous) return <TrendingDown className="text-state-success h-4 w-4" />
    if (current > previous) return <TrendingUp className="text-state-error h-4 w-4" />
    return <Minus className="text-text-tertiary h-4 w-4" />
  }

  const getTrendText = (current: number | null, previous: number | null, unit: string) => {
    if (current === null || previous === null) return 'N/A'
    const diff = current - previous
    if (diff === 0) return 'Stabile'
    return `${diff > 0 ? '+' : ''}${diff.toFixed(2)}${unit}`
  }

  // Calcola valori precedenti per il confronto
  const previousData =
    data.datasetComposizioneCorporea.length > 1
      ? data.datasetComposizioneCorporea[data.datasetComposizioneCorporea.length - 2]
      : null

  return (
    <div className="space-y-4">
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300"
      >
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2 text-white">
            <Scale className="h-5 w-5 text-teal-400" />
            1️⃣ Composizione Corporea
          </CardTitle>
          <p className="text-text-secondary text-sm mt-1">
            Monitora i cambiamenti strutturali del tuo corpo
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valori Attuali */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Massa Grassa % */}
            {(() => {
              const range = getValueRange('valoriPrincipali', 'massa_grassa_percentuale')
              const value = data.valoriComposizioneAttuali.massa_grassa_percentuale
              const isInRange = range && value ? value >= range.min && value <= range.max : null

              return (
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-text-tertiary text-xs">Massa Grassa (%)</div>
                    {value && isInRange !== null && (
                      <div>
                        {isInRange ? (
                          <CheckCircle2
                            className="h-3 w-3 text-state-success"
                            aria-label="Nel range ottimale"
                          />
                        ) : (
                          <AlertTriangle
                            className="h-3 w-3 text-state-error"
                            aria-label="Fuori range"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {value !== null ? `${value.toFixed(1)}%` : 'N/A'}
                  </div>
                  {range && value && (
                    <div className="text-text-tertiary text-xs">
                      Range: {range.min}-{range.max}%{range.note && ` (${range.note})`}
                    </div>
                  )}
                  {previousData && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(value, previousData.massa_grassa_percentuale)}
                      <span className="text-text-secondary">
                        {getTrendText(value, previousData.massa_grassa_percentuale, '%')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Massa Grassa kg */}
            {(() => {
              const range = getValueRange('valoriPrincipali', 'massa_grassa_kg')
              const value = data.valoriComposizioneAttuali.massa_grassa_kg
              const isInRange = range && value ? value >= range.min && value <= range.max : null

              return (
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-text-tertiary text-xs">Massa Grassa (kg)</div>
                    {value && isInRange !== null && (
                      <div>
                        {isInRange ? (
                          <CheckCircle2
                            className="h-3 w-3 text-state-success"
                            aria-label="Nel range ottimale"
                          />
                        ) : (
                          <AlertTriangle
                            className="h-3 w-3 text-state-error"
                            aria-label="Fuori range"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {value !== null ? `${value.toFixed(1)}kg` : 'N/A'}
                  </div>
                  {range && value && (
                    <div className="text-text-tertiary text-xs">
                      Range: {range.min}-{range.max}kg
                    </div>
                  )}
                  {previousData && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(value, previousData.massa_grassa_kg)}
                      <span className="text-text-secondary">
                        {getTrendText(value, previousData.massa_grassa_kg, 'kg')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Massa Magra */}
            {(() => {
              const range = getValueRange('valoriPrincipali', 'massa_magra_kg')
              const value = data.valoriComposizioneAttuali.massa_magra_kg
              const isInRange = range && value ? value >= range.min && value <= range.max : null

              return (
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-text-tertiary text-xs">Massa Magra (kg)</div>
                    {value && isInRange !== null && (
                      <div>
                        {isInRange ? (
                          <CheckCircle2
                            className="h-3 w-3 text-state-success"
                            aria-label="Nel range ottimale"
                          />
                        ) : (
                          <AlertTriangle
                            className="h-3 w-3 text-state-error"
                            aria-label="Fuori range"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {value !== null ? `${value.toFixed(1)}kg` : 'N/A'}
                  </div>
                  {range && value && (
                    <div className="text-text-tertiary text-xs">
                      Range: {range.min}-{range.max}kg
                    </div>
                  )}
                  {previousData && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(value, previousData.massa_magra_kg)}
                      <span className="text-text-secondary">
                        {getTrendText(value, previousData.massa_magra_kg, 'kg')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Massa Muscolare */}
            {(() => {
              const range = getValueRange('valoriPrincipali', 'massa_muscolare_kg')
              const value = data.valoriComposizioneAttuali.massa_muscolare_kg
              const isInRange = range && value ? value >= range.min && value <= range.max : null

              return (
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-text-tertiary text-xs">Massa Muscolare (kg)</div>
                    {value && isInRange !== null && (
                      <div>
                        {isInRange ? (
                          <CheckCircle2
                            className="h-3 w-3 text-state-success"
                            aria-label="Nel range ottimale"
                          />
                        ) : (
                          <AlertTriangle
                            className="h-3 w-3 text-state-error"
                            aria-label="Fuori range"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {value !== null ? `${value.toFixed(1)}kg` : 'N/A'}
                  </div>
                  {range && value && (
                    <div className="text-text-tertiary text-xs">
                      Range: {range.min}-{range.max}kg
                    </div>
                  )}
                  {previousData && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(value, previousData.massa_muscolare_kg)}
                      <span className="text-text-secondary">
                        {getTrendText(value, previousData.massa_muscolare_kg, 'kg')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Massa Muscolare Scheletrica */}
            {(() => {
              const range = getValueRange('valoriPrincipali', 'massa_muscolare_scheletrica_kg')
              const value = data.valoriComposizioneAttuali.massa_muscolare_scheletrica_kg
              const isInRange = range && value ? value >= range.min && value <= range.max : null

              return (
                <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-text-tertiary text-xs">Massa Musc. Scheletrica (kg)</div>
                    {value && isInRange !== null && (
                      <div>
                        {isInRange ? (
                          <CheckCircle2
                            className="h-3 w-3 text-state-success"
                            aria-label="Nel range ottimale"
                          />
                        ) : (
                          <AlertTriangle
                            className="h-3 w-3 text-state-error"
                            aria-label="Fuori range"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {value !== null ? `${value.toFixed(1)}kg` : 'N/A'}
                  </div>
                  {range && value && (
                    <div className="text-text-tertiary text-xs">
                      Range: {range.min}-{range.max}kg
                    </div>
                  )}
                  {previousData && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(value, previousData.massa_muscolare_scheletrica_kg)}
                      <span className="text-text-secondary">
                        {getTrendText(value, previousData.massa_muscolare_scheletrica_kg, 'kg')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Rapporto Massa Magra / Peso */}
            <div className="space-y-2">
              <div className="text-text-tertiary text-xs">Rapporto Magra/Peso</div>
              <div className="text-white text-2xl font-bold">
                {data.valoriComposizioneAttuali.rapporto_massa_magra_peso !== null
                  ? data.valoriComposizioneAttuali.rapporto_massa_magra_peso.toFixed(3)
                  : 'N/A'}
              </div>
              {data.valoriComposizioneAttuali.rapporto_massa_magra_peso !== null && (
                <Badge
                  variant={
                    data.valoriComposizioneAttuali.rapporto_massa_magra_peso > 0.7
                      ? 'success'
                      : 'warning'
                  }
                  size="sm"
                >
                  {data.valoriComposizioneAttuali.rapporto_massa_magra_peso > 0.7
                    ? 'Ottimo'
                    : 'Da migliorare'}
                </Badge>
              )}
            </div>
          </div>

          {/* Grafico Composizione Corporea */}
          <div>
            <h3 className="text-text-primary mb-4 text-lg font-semibold text-white">
              Andamento nel Tempo
            </h3>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.datasetComposizioneCorporea} {...({} as any)}>
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
                <Line
                  type="monotone"
                  dataKey="massa_grassa_kg"
                  name="Massa Grassa (kg)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 3 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  type="monotone"
                  dataKey="massa_magra_kg"
                  name="Massa Magra (kg)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 3 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  type="monotone"
                  dataKey="massa_muscolare_kg"
                  name="Massa Muscolare (kg)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
