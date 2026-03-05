'use client'
import React, { useMemo } from 'react'
// Lazy load recharts per ridurre bundle size iniziale
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from '@/components/charts/client-recharts'
import type { TrendData } from '@/lib/analytics'

interface TrendChartProps {
  data: TrendData[]
  title?: string
  height?: number
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = 'Andamento Allenamenti (ultimi 14 giorni)',
  height = 280,
}) => {
  const processedData = useMemo(() => data ?? [], [data])

  if (!processedData.length) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10">
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
              <svg
                className="w-5 h-5 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <div className="flex h-64 items-center justify-center">
            <div className="text-text-secondary text-sm">Dati non disponibili</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
            <svg
              className="w-5 h-5 text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#242A2E"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <XAxis
              dataKey="day"
              stroke="#A5AFB4"
              fontSize={12}
              tickFormatter={(value: string | number) => {
                try {
                  const date = typeof value === 'string' ? new Date(value) : new Date(String(value))
                  if (isNaN(date.getTime())) return String(value)
                  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                } catch {
                  return String(value)
                }
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <YAxis
              stroke="#A5AFB4"
              fontSize={12}
              tickFormatter={(value: number) => value.toString()}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '2px solid #14B8A6',
                borderRadius: '12px',
                color: '#EAF0F2',
                boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)',
                padding: '12px',
              }}
              labelFormatter={(value: string | number) => {
                try {
                  const date = typeof value === 'string' ? new Date(value) : new Date(String(value))
                  if (isNaN(date.getTime())) return String(value)
                  return date.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                } catch {
                  return String(value)
                }
              }}
              formatter={(value: number | string, name?: string) => [
                value,
                name === 'allenamenti'
                  ? 'Allenamenti'
                  : name === 'documenti'
                    ? 'Documenti'
                    : name === 'ore_totali'
                      ? 'Ore Totali'
                      : name || '',
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Line
              type="monotone"
              dataKey="allenamenti"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#14B8A6', strokeWidth: 3, fill: '#ffffff' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Componente per grafico multi-linea
export const MultiTrendChart: React.FC<{
  data: TrendData[]
  title?: string
  height?: number
}> = ({ data, title = 'Trend Multipli', height = 280 }) => {
  const processedData = useMemo(() => data ?? [], [data])

  if (!processedData.length) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-cyan-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-cyan-500/10">
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <div className="flex h-64 items-center justify-center">
            <div className="text-text-secondary text-sm">Dati non disponibili</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-cyan-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#242A2E"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <XAxis
              dataKey="day"
              stroke="#A5AFB4"
              fontSize={12}
              tickFormatter={(value: string | number) => {
                try {
                  const date = typeof value === 'string' ? new Date(value) : new Date(String(value))
                  if (isNaN(date.getTime())) return String(value)
                  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                } catch {
                  return String(value)
                }
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <YAxis
              stroke="#A5AFB4"
              fontSize={12}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '2px solid #14B8A6',
                borderRadius: '12px',
                color: '#EAF0F2',
                boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)',
                padding: '12px',
              }}
              labelFormatter={(value: string | number) => {
                try {
                  const date = typeof value === 'string' ? new Date(value) : new Date(String(value))
                  if (isNaN(date.getTime())) return String(value)
                  return date.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                } catch {
                  return String(value)
                }
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Line
              type="monotone"
              dataKey="allenamenti"
              stroke="#14B8A6"
              strokeWidth={3}
              name="Allenamenti"
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#14B8A6', strokeWidth: 2 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Line
              type="monotone"
              dataKey="documenti"
              stroke="#F59E0B"
              strokeWidth={3}
              name="Documenti"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Line
              type="monotone"
              dataKey="ore_totali"
              stroke="#10B981"
              strokeWidth={3}
              name="Ore Totali"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
