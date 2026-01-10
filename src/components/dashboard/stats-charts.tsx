'use client'

import { Card, CardContent } from '@/components/ui'
// Lazy load recharts per ridurre bundle size iniziale
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from '@/components/charts/client-recharts'
import { TrendingUp, BarChart3, Users } from 'lucide-react'

export interface ChartData {
  monthlyRevenue: Array<{
    mese: string
    entrate: number
    lezioni: number
  }>
  workoutsPerAthlete: Array<{
    atleta: string
    schede: number
    staff: string
  }>
  progressTrend: Array<{
    mese: string
    peso_medio: number
    atleti: number
  }>
}

interface StatsChartsProps {
  data: ChartData
}

const COLORS = {
  brand: '#0FB5BA',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',
  purple: '#A78BFA',
  pink: '#F472B6',
}

const CHART_COLORS = [
  COLORS.brand,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
]

export function StatsCharts({ data }: StatsChartsProps) {
  // Error boundary per dati mancanti
  if (!data || !data.monthlyRevenue || !data.workoutsPerAthlete || !data.progressTrend) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="text-red-400 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-bold mb-2">Errore nei dati dei grafici</h3>
            <p className="text-text-secondary">I dati per i grafici non sono disponibili</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: { name: string; value: number; color: string; dataKey: string }[]
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary rounded-lg border border-border p-3 shadow-lg">
          <p className="text-text-primary mb-2 font-medium">{label}</p>
          {payload.map(
            (
              entry: {
                name: string
                value: number
                color: string
                dataKey: string
              },
              index: number,
            ) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
                {entry.dataKey === 'entrate' ? '€' : entry.dataKey === 'lezioni' ? ' lezioni' : ''}
              </p>
            ),
          )}
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: { payload?: { name: string; color: string }[] }) => {
    return (
      <div className="mt-4 flex justify-center gap-4">
        {payload?.map((entry: { name: string; color: string }, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary text-sm">{entry.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Entrate vs Lezioni */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <TrendingUp className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Entrate vs Lezioni (Ultimi 6 mesi)
            </h3>
          </div>
          <div className="h-80">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={data.monthlyRevenue} {...({} as any)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,.06)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <XAxis
                  dataKey="mese"
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  yAxisId="left"
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  tickFormatter={(value: number) => `€${value}`}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  content={<CustomLegend />}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="entrate"
                  stroke={COLORS.brand}
                  strokeWidth={3}
                  dot={{ fill: COLORS.brand, strokeWidth: 2, r: 4 }}
                  name="Entrate (€)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lezioni"
                  stroke={COLORS.success}
                  strokeWidth={3}
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                  name="Lezioni"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Schede per Atleta */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <BarChart3 className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Schede per Atleta
            </h3>
          </div>
          <div className="h-80">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <BarChart data={data.workoutsPerAthlete} layout="horizontal" {...({} as any)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,.06)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <XAxis
                  type="number"
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  dataKey="atleta"
                  type="category"
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  width={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Tooltip
                  content={({
                    active,
                    payload,
                    label,
                  }: {
                    active?: boolean
                    payload?: Array<{
                      name?: string
                      value?: number
                      color?: string
                      payload?: { staff?: string; [key: string]: unknown }
                    }>
                    label?: string
                  }) => {
                    if (active && payload && payload.length && payload[0]) {
                      return (
                        <div className="bg-background-secondary rounded-lg border border-border p-3 shadow-lg">
                          <p className="text-text-primary mb-2 font-medium">{label}</p>
                          <p className="text-sm" style={{ color: payload[0].color }}>
                            Schede: {payload[0].value}
                          </p>
                          <p className="text-text-tertiary text-xs">
                            Staff: {payload[0].payload?.staff}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Bar
                  dataKey="schede"
                  fill={COLORS.brand}
                  radius={[0, 4, 4, 0]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Peso Medio */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <Users className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Trend Peso Medio
            </h3>
          </div>
          <div className="h-80">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <AreaChart data={data.progressTrend} {...({} as any)}>
                <defs>
                  <linearGradient id="pesoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.brand} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,.06)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <XAxis
                  dataKey="mese"
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <YAxis
                  stroke="rgba(255,255,255,.38)"
                  fontSize={12}
                  tickFormatter={(value: number) => `${value}kg`}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Tooltip
                  content={({
                    active,
                    payload,
                    label,
                  }: {
                    active?: boolean
                    payload?: Array<{
                      name?: string
                      value?: number
                      color?: string
                      payload?: { atleti?: number; [key: string]: unknown }
                    }>
                    label?: string
                  }) => {
                    if (active && payload && payload.length && payload[0]) {
                      return (
                        <div className="bg-background-secondary rounded-lg border border-border p-3 shadow-lg">
                          <p className="text-text-primary mb-2 font-medium">{label}</p>
                          <p className="text-sm" style={{ color: payload[0].color }}>
                            Peso medio: {payload[0].value}kg
                          </p>
                          <p className="text-text-tertiary text-xs">
                            Atleti: {payload[0].payload?.atleti}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Area
                  type="monotone"
                  dataKey="peso_medio"
                  stroke={COLORS.brand}
                  strokeWidth={3}
                  fill="url(#pesoGradient)"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribuzione Staff */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-2xl shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <BarChart3 className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Distribuzione Atleti per Staff
            </h3>
          </div>
          <div className="h-80">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height="100%" {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PieChart {...({} as any)}>
                <Pie
                  data={data.workoutsPerAthlete.reduce(
                    (acc: { staff: string; value: number }[], item) => {
                      const existing = acc.find((a) => a.staff === item.staff)
                      if (existing) {
                        existing.value += 1
                      } else {
                        acc.push({ staff: item.staff, value: 1 })
                      }
                      return acc
                    },
                    [],
                  )}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    staff,
                    value,
                    percent,
                  }: {
                    staff?: string
                    value?: number
                    percent?: number
                  }) => `${staff}: ${value} (${((percent as number) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                >
                  {data.workoutsPerAthlete.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({} as any)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({
                    active,
                    payload,
                  }: {
                    active?: boolean
                    payload?: Array<{
                      name?: string
                      value?: number
                      color?: string
                      payload?: { staff?: string; [key: string]: unknown }
                    }>
                  }) => {
                    if (active && payload && payload.length && payload[0]) {
                      return (
                        <div className="bg-background-secondary rounded-lg border border-border p-3 shadow-lg">
                          <p className="text-text-primary mb-2 font-medium">
                            {payload[0].payload?.staff}
                          </p>
                          <p className="text-sm">Atleti: {payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
