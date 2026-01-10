'use client'

import { useState, useEffect } from 'react'
import { Users, Euro, Calendar, Send, TrendingUp, TrendingDown } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminStatisticsContent')
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/ui/skeleton'
// Lazy load recharts per ridurre bundle size iniziale
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts/client-recharts'
import { notifyError } from '@/lib/notifications'

interface AdminStatistics {
  users: {
    total: number
    active: number
    thisMonth: number
    growth: number
    byRole: Record<string, number>
    byMonth: Array<{ month: string; count: number }>
  }
  payments: {
    totalRevenue: number
    thisMonth: number
    growth: number
    byMethod: Record<string, number>
    byMonth: Array<{ month: string; revenue: number }>
  }
  appointments: {
    total: number
    thisMonth: number
    byStatus: Record<string, number>
  }
  documents: {
    total: number
    byStatus: Record<string, number>
    expired: number
  }
  communications: {
    total: number
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalFailed: number
    deliveryRate: number
    openRate: number
  }
}

const CHART_COLORS = ['#0FB5BA', '#22C55E', '#F59E0B', '#EF4444', '#60A5FA', '#A78BFA', '#F472B6']

export function AdminStatisticsContent() {
  const [stats, setStats] = useState<AdminStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  async function fetchStatistics() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/statistics')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel caricamento statistiche')
      }

      const data = await response.json()
      setStats(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore nel caricamento statistiche', error)
      notifyError('Errore', error.message || 'Errore nel caricamento statistiche')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-background-secondary border-border">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Nessun dato disponibile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepara dati per grafici
  const roleDistributionData = Object.entries(stats.users.byRole).map(([role, count]) => ({
    name: role,
    value: count,
  }))

  const paymentMethodsData = Object.entries(stats.payments.byMethod).map(([method, count]) => ({
    name: method,
    value: count,
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Statistiche Avanzate</h1>
        <p className="text-gray-400">Analisi dettagliata del sistema 22Club</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.users.total}</div>
            <div className="flex items-center gap-2 mt-1">
              {stats.users.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <p className="text-xs text-gray-400">
                {formatPercentage(stats.users.growth)} questo mese ({stats.users.thisMonth} nuovi)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Entrate Totali</CardTitle>
            <Euro className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats.payments.totalRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {stats.payments.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <p className="text-xs text-gray-400">
                {formatPercentage(stats.payments.growth)} questo mese (
                {formatCurrency(stats.payments.thisMonth)})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Appuntamenti</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.appointments.total}</div>
            <p className="text-xs text-gray-400 mt-1">{stats.appointments.thisMonth} questo mese</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Comunicazioni</CardTitle>
            <Send className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.communications.total}</div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.communications.deliveryRate.toFixed(1)}% consegna,{' '}
              {stats.communications.openRate.toFixed(1)}% apertura
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescita Utenti */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Crescita Utenti (Ultimi 6 Mesi)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LineChart data={stats.users.byMonth} {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" {...({} as any)} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <XAxis dataKey="month" stroke="#9CA3AF" {...({} as any)} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <YAxis stroke="#9CA3AF" {...({} as any)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Legend
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0FB5BA"
                  strokeWidth={2}
                  name="Utenti"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuzione Ruoli */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Distribuzione Utenti per Ruolo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PieChart {...({} as any)}>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({} as any)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Entrate per Mese */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Entrate per Mese (Ultimi 6 Mesi)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <BarChart data={stats.payments.byMonth} {...({} as any)}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" {...({} as any)} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <XAxis dataKey="month" stroke="#9CA3AF" {...({} as any)} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <YAxis stroke="#9CA3AF" {...({} as any)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
                <Bar
                  dataKey="revenue"
                  fill="#22C55E"
                  name="Entrate"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metodi di Pagamento */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Distribuzione Metodi di Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ResponsiveContainer width="100%" height={300} {...({} as any)}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PieChart {...({} as any)}>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({} as any)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({} as any)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche Dettagliate */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Appuntamenti per Stato */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Appuntamenti per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.appointments.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{status}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documenti per Stato */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Documenti per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.documents.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{status}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
              {stats.documents.expired > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-red-400">Da aggiornare (scaduti)</span>
                  <span className="text-red-400 font-medium">{stats.documents.expired}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistiche Comunicazioni */}
        <Card className="bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Statistiche Comunicazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Totali</span>
                <span className="text-white font-medium">{stats.communications.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Inviate</span>
                <span className="text-white font-medium">{stats.communications.totalSent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Consegnate</span>
                <span className="text-white font-medium">
                  {stats.communications.totalDelivered}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Aperte</span>
                <span className="text-white font-medium">{stats.communications.totalOpened}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-gray-300">Fallite</span>
                <span className="text-red-400 font-medium">{stats.communications.totalFailed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
