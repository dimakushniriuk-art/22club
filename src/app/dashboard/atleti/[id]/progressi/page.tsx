'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { ProgressKPICards } from '@/components/dashboard/progress-kpi-cards'
import { ProgressCharts } from '@/components/dashboard/progress-charts'
import { ProgressTimeline } from '@/components/dashboard/progress-timeline'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function ProgressiContent() {
  // Estrai immediatamente il valore per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const athleteId = String(useParams().id || '')

  const { data, isLoading: loading, error } = useProgressAnalytics(athleteId)

  const handleExportCSV = () => {
    if (!data || data.ultimiProgressi.length === 0) return

    const csvContent = [
      ['Data', 'Peso (kg)', 'Panca (kg)', 'Squat (kg)', 'Stacco (kg)', 'Note'],
      ...data.ultimiProgressi.map((log) => [
        new Date(log.date).toLocaleDateString('it-IT'),
        log.weight_kg?.toString() || '',
        log.max_bench_kg?.toString() || '',
        log.max_squat_kg?.toString() || '',
        log.max_deadlift_kg?.toString() || '',
        log.note || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `progressi-atleta-${athleteId}-${new Date().toISOString().split('T')[0]}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/atleti">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-text-primary text-2xl font-bold">Progressi Atleta</h1>
        </div>

        <Card variant="trainer">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-4xl">❌</div>
              <p className="text-text-secondary">Errore nel caricamento progressi</p>
              <p className="text-text-tertiary text-sm">Riprova più tardi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/atleti">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Progressi Atleta</h1>
            <p className="text-text-secondary">
              Analisi dettagliata dei progressi e delle performance
            </p>
          </div>
        </div>

        {data && data.ultimiProgressi.length > 0 && (
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Esporta CSV
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <ProgressKPICards data={data} loading={loading} />

      {/* Charts */}
      <ProgressCharts data={data} loading={loading} />

      {/* Timeline */}
      <ProgressTimeline data={data} loading={loading} />
    </div>
  )
}

export default function ProgressiPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-background-secondary h-10 w-10 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="bg-background-secondary h-8 w-48 animate-pulse rounded" />
              <div className="bg-background-secondary h-4 w-64 animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-background-secondary h-32 animate-pulse rounded" />
            ))}
          </div>
        </div>
      }
    >
      <ProgressiContent />
    </Suspense>
  )
}
