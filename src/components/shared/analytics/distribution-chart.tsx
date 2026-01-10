'use client'
import React, { useMemo } from 'react'
// Lazy load recharts per ridurre bundle size iniziale
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from '@/components/charts/client-recharts'
import type { DistributionData } from '@/lib/analytics'

interface DistributionChartProps {
  data: DistributionData[]
  title?: string
  height?: number
}

const COLORS = [
  '#14B8A6',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
]

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  title = 'Distribuzione per tipo',
  height = 280,
}) => {
  const processedData = useMemo(() => data ?? [], [data])

  if (!processedData.length) {
    return (
      <div className="relative p-6 rounded-lg border border-teal-500/30">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
        <div className="text-text-secondary text-sm">Dati non disponibili</div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-teal-500/30">
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9A9 9 0 1011 20.945V11h9.488z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ResponsiveContainer width="100%" height={height} {...({} as any)}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PieChart {...({} as any)}>
            <Pie
              data={processedData}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              label={({ type, percentage }: { type?: string; percentage?: number }) =>
                `${type}: ${percentage}%`
              }
              labelLine={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            >
              {processedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '2px solid #14B8A6',
                borderRadius: '12px',
                color: '#EAF0F2',
                boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)',
                padding: '12px',
              }}
              formatter={(
                value: number | string,
                name?: string,
                props?: { payload?: { percentage?: number; [key: string]: unknown } },
              ) => [`${value} (${props?.payload?.percentage || 0}%)`, name || '']}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: '#A5AFB4', fontSize: '12px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Componente per grafico a barre orizzontali
export const HorizontalBarChart: React.FC<{
  data: DistributionData[]
  title?: string
  height?: number
}> = ({ data, title = 'Distribuzione per tipo' }) => {
  const processedData = useMemo(() => data ?? [], [data])

  if (!processedData.length) {
    return (
      <div className="relative p-6 rounded-lg border border-teal-500/30">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
        <div className="text-text-secondary text-sm">Dati non disponibili</div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-yellow-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-yellow-500/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <svg
              className="w-5 h-5 text-yellow-400"
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
          <h2 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <div className="space-y-3">
          {processedData.map((item, index) => (
            <div
              key={item.type}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-tertiary/30 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary capitalize">{item.type}</span>
                  <span className="text-text-secondary">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-background-tertiary/50 rounded-full h-3 mt-1 shadow-inner">
                  <div
                    className="h-3 rounded-full transition-all duration-300 shadow-md"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente per grafico a barre verticali
export const VerticalBarChart: React.FC<{
  data: DistributionData[]
  title?: string
  height?: number
}> = ({ data, title = 'Distribuzione per tipo' }) => {
  const processedData = useMemo(() => data ?? [], [data])

  const maxCount = useMemo(() => {
    if (!processedData.length) return 0
    return Math.max(...processedData.map((item) => item.count))
  }, [processedData])

  if (!processedData.length || maxCount <= 0) {
    return (
      <div className="relative p-6 rounded-lg border border-teal-500/30">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
        <div className="text-text-secondary text-sm">Dati non disponibili</div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-green-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <div className="flex items-end justify-between space-x-2 h-48">
          {processedData.map((item, index) => (
            <div key={item.type} className="flex flex-col items-center flex-1 group">
              <div
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
                style={{
                  height: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                  minHeight: '20px',
                }}
              />
              <div className="mt-2 text-xs text-text-secondary text-center group-hover:text-text-primary transition-colors">
                <div className="font-bold text-white">{item.count}</div>
                <div className="capitalize font-medium">{item.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
