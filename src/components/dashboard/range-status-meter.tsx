'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import { Button } from '@/components/ui'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from '@/components/charts/client-recharts'
import {
  bodyMetricDeltaSentimentTextColorClass,
  getBodyMetricDeltaSentiment,
} from '@/lib/body-metrics/body-metric-trend-rules'

type HistoryPoint = { date: string; value: number | null }

export interface RangeStatusMeterProps {
  value?: number | null
  history?: HistoryPoint[]
  title?: string
  unit?: string
  height?: number
  showValue?: boolean
  /** Se presente e c’è storico, l’area del grafico è cliccabile (lista valori per data). */
  detailHref?: string
  /** Chiave campo misurazione (es. `peso_kg`) per colorare la % vs primo punto. */
  misurazioneField?: string
}

export function RangeStatusMeter({
  value = null,
  history = [],
  title,
  unit = '',
  height = 170,
  showValue = false,
  detailHref,
  misurazioneField = '',
}: RangeStatusMeterProps) {
  const sortedHistory = useMemo((): HistoryPoint[] => {
    return [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [history])

  const chartDataNumeric = sortedHistory.filter(
    (point): point is { date: string; value: number } =>
      point.value !== null && Number.isFinite(point.value),
  )
  const hasChartData = sortedHistory.length > 0

  const pctFromFirstMeasurement = useMemo(() => {
    if (chartDataNumeric.length < 2) return null
    const sortedAsc = [...chartDataNumeric].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    const baseline = sortedAsc[0]?.value
    if (!Number.isFinite(baseline) || baseline === 0) return null
    const currentNum =
      value !== null && value !== undefined && Number.isFinite(value)
        ? value
        : sortedAsc[sortedAsc.length - 1]?.value
    if (!Number.isFinite(currentNum)) return null
    const pct = ((Number(currentNum) - baseline) / baseline) * 100
    if (!Number.isFinite(pct)) return null
    return { pct, firstDate: sortedAsc[0]!.date }
  }, [chartDataNumeric, value])

  const formatDate = (raw: string) => {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
  }
  const formatValue = (raw: number) => `${raw.toFixed(1)}${unit}`

  const formatPctIt = (pct: number) => {
    const sign = pct > 0 ? '+' : ''
    return `${sign}${pct.toFixed(1).replace('.', ',')}%`
  }

  return (
    <div className="w-full">
      {title && (
        <div
          className={
            detailHref
              ? 'mb-2 grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1'
              : 'mb-2 flex flex-col gap-1'
          }
        >
          <div className={detailHref ? 'min-w-0 col-start-1 row-start-1' : 'min-w-0'}>
            <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
          </div>
          {detailHref && (
            <div className="col-start-2 row-start-1 row-span-2 justify-self-end self-start">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 px-2.5 text-xs text-primary"
                asChild
              >
                <Link href={detailHref} aria-label={`Dettagli ${title}`}>
                  Dettagli
                </Link>
              </Button>
            </div>
          )}
          {showValue && value !== null && (
            <div
              className={
                detailHref
                  ? 'col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs'
                  : 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs'
              }
            >
              <p className="text-text-secondary m-0 mt-0.5">
                Valore attuale:{' '}
                <span className="font-bold text-cyan-400/80">
                  {value.toFixed(1)}
                  {unit}
                </span>
              </p>
              {pctFromFirstMeasurement ? (
                <span
                  className={`font-medium tabular-nums ${bodyMetricDeltaSentimentTextColorClass(
                    getBodyMetricDeltaSentiment(misurazioneField, pctFromFirstMeasurement.pct),
                  )}`}
                  title={`Dal primo rilevamento (${formatDate(pctFromFirstMeasurement.firstDate)})`}
                >
                  {formatPctIt(pctFromFirstMeasurement.pct)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 rounded-md border border-white/10 bg-black/20 p-2 min-[834px]:p-3">
        {hasChartData ? (
          (() => {
            const ys = chartDataNumeric.map((p) => p.value)
            const yMin = ys.length > 0 ? Math.min(...ys) : 0
            const yMax = ys.length > 0 ? Math.max(...ys) : 1
            const pad = ys.length > 0 ? Math.max(2, (yMax - yMin) * 0.08) : 1
            const span = yMax - yMin || 1
            const yNullMarker = ys.length > 0 ? yMin - Math.max(span * 0.12, 1) : 0
            const chartRows = sortedHistory.map((h) => ({
              date: h.date,
              value: h.value,
              traceY:
                h.value != null && Number.isFinite(h.value) ? (h.value as number) : yNullMarker,
            }))
            const xTicks = chartRows.map((r) => r.date)
            const chart = (
              <ResponsiveContainer width="100%" height={height}>
                <ComposedChart
                  data={chartRows}
                  margin={{ top: 8, right: 10, left: -18, bottom: 22 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis
                    dataKey="date"
                    type="category"
                    ticks={xTicks}
                    interval={0}
                    tickFormatter={formatDate}
                    stroke="rgba(255,255,255,.45)"
                    fontSize={10}
                    angle={-32}
                    textAnchor="end"
                    height={46}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,.45)"
                    fontSize={11}
                    domain={[Math.min(yNullMarker, yMin) - pad, yMax + pad]}
                    tickFormatter={(raw: number) => `${Math.round(raw)}`}
                  />
                  <Tooltip
                    labelFormatter={(raw: string | number) => formatDate(String(raw))}
                    formatter={(
                      _raw: number | string,
                      _name: string,
                      item: { payload?: HistoryPoint & { traceY?: number } },
                    ) => {
                      const pl = item?.payload
                      const original = pl?.value
                      if (
                        original !== null &&
                        original !== undefined &&
                        typeof original === 'number' &&
                        Number.isFinite(original)
                      ) {
                        return [formatValue(original), title ?? 'Valore']
                      }
                      return ['Nessun dato esercizio per questa data', title ?? 'Valore']
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(7,7,9,0.95)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                    }}
                  />
                  <Scatter
                    dataKey="traceY"
                    isAnimationActive={false}
                    legendType="none"
                    shape={(props: {
                      cx?: number
                      cy?: number
                      payload?: { value?: number | null }
                    }) => {
                      const v = props.payload?.value
                      if (v != null && Number.isFinite(v)) return null
                      if (props.cx == null || props.cy == null) return null
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={3}
                          fill="rgba(255,255,255,0.08)"
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth={1}
                        />
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    connectNulls
                    stroke="rgb(34 211 238 / 0.8)"
                    strokeWidth={2}
                    dot={(props: {
                      cx?: number
                      cy?: number
                      payload?: { value?: number | null }
                    }) => {
                      const v = props.payload?.value
                      if (v == null || !Number.isFinite(v) || props.cx == null || props.cy == null) {
                        return null
                      }
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={3}
                          fill="rgb(34 211 238 / 0.85)"
                          stroke="rgb(34 211 238 / 0.95)"
                          strokeWidth={0}
                        />
                      )
                    }}
                    activeDot={{ r: 5, fill: 'rgb(34 211 238 / 0.95)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )
            if (detailHref) {
              return (
                <Link
                  href={detailHref}
                  className="block cursor-pointer rounded-sm outline-none ring-offset-2 ring-offset-background transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={
                    title ? `Apri elenco valori per data: ${title}` : 'Apri elenco valori per data'
                  }
                >
                  {chart}
                </Link>
              )
            }
            return chart
          })()
        ) : (
          <div className="flex min-h-[96px] items-center justify-center text-xs text-text-tertiary">
            Nessuno storico disponibile
          </div>
        )}
      </div>
    </div>
  )
}
