'use client'

import React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/charts/client-recharts'

export interface RangeStatusMeterProps {
  value?: number | null
  history?: Array<{ date: string; value: number | null }>
  title?: string
  unit?: string
  height?: number
  showValue?: boolean
}

export function RangeStatusMeter({
  value = null,
  history = [],
  title,
  unit = '',
  height = 170,
  showValue = false,
}: RangeStatusMeterProps) {
  const chartData = history.filter((point): point is { date: string; value: number } => point.value !== null)
  const hasChartData = chartData.length > 0
  const formatDate = (raw: string) => {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
  }
  const formatValue = (raw: number) => `${raw.toFixed(1)}${unit}`

  return (
    <div className="w-full">
      {title && (
        <div className="mb-2">
          <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
          {showValue && value !== null && (
            <p className="text-text-secondary mt-0.5 text-xs">
              Valore attuale:{' '}
              <span className="font-bold text-cyan-400/80">
                {value.toFixed(1)}
                {unit}
              </span>
            </p>
          )}
        </div>
      )}

      <div className="mt-2 rounded-md border border-white/10 bg-black/20 p-2 min-[834px]:p-3">
        {hasChartData ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: -18, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="rgba(255,255,255,.45)"
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                stroke="rgba(255,255,255,.45)"
                fontSize={11}
                domain={[
                  (dataMin: number) => dataMin - 2,
                  (dataMax: number) => dataMax + 2,
                ]}
                tickFormatter={(raw: number) => `${Math.round(raw)}`}
              />
              <Tooltip
                labelFormatter={(raw: string | number) => formatDate(String(raw))}
                formatter={(raw: number | string) => [formatValue(Number(raw)), title ?? 'Valore']}
                contentStyle={{
                  backgroundColor: 'rgba(7,7,9,0.95)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '8px',
                  color: '#e4e4e7',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(34 211 238 / 0.8)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'rgb(34 211 238 / 0.8)' }}
                activeDot={{ r: 5, fill: 'rgb(34 211 238 / 0.95)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex min-h-[96px] items-center justify-center text-xs text-text-tertiary">
            Nessuno storico disponibile
          </div>
        )}
      </div>
    </div>
  )
}
