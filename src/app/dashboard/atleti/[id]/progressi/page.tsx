'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Scale } from 'lucide-react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ErrorState } from '@/components/dashboard/error-state'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { AthleteProgressTab } from '@/components/dashboard/athlete-profile/athlete-progress-tab'
import { createClient } from '@/lib/supabase/client'

type ProgressRow = {
  id: string
  date: string
  weight_kg: number | null
  imc: number | null
}

export default function AtletaProgressiPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null

  const { athlete, stats, statsError, loading, error, loadAthleteData } = useAthleteProfileData(
    id ?? '',
  )

  const [logsLoading, setLogsLoading] = useState(true)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([])

  const loadProgressLogs = useCallback(async () => {
    if (!id) return
    setLogsLoading(true)
    setLogsError(null)
    const supabase = createClient()
    const { data, error: qErr } = await supabase
      .from('progress_logs')
      .select('id, date, weight_kg, imc')
      .eq('athlete_id', id)
      .order('date', { ascending: false, nullsFirst: false })
      .limit(50)

    if (qErr) {
      setLogsError(qErr.message)
      setProgressRows([])
    } else {
      setProgressRows((data ?? []) as ProgressRow[])
    }
    setLogsLoading(false)
  }, [id])

  useEffect(() => {
    void loadProgressLogs()
  }, [loadProgressLogs])

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState message="ID atleta mancante" onRetry={() => router.push('/dashboard/clienti')} />
      </div>
    )
  }

  if (loading && !athlete) {
    return null
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const tabStats = {
    peso_attuale: stats.peso_attuale,
    allenamenti_totali: stats.allenamenti_totali,
    allenamenti_mese: stats.allenamenti_mese,
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/dashboard/atleti/${id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 hover:bg-primary/10 hover:text-primary"
              aria-label="Torna al profilo atleta"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl sm:text-2xl font-bold tracking-tight truncate">
              Progressi — {athlete.nome} {athlete.cognome}
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Misurazioni e statistiche aggregate
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-white/10 shrink-0" asChild>
          <Link href={`/dashboard/atleti/${id}`}>Profilo completo</Link>
        </Button>
      </div>

      <AthleteProgressTab
        athleteId={id}
        stats={tabStats}
        loadError={statsError}
        showDetailsLink={false}
      />

      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-text-primary">
            <Scale className="h-4 w-4 text-primary" />
            Ultime misurazioni (progress_logs)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {logsError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {logsError}
            </div>
          ) : null}
          {logsLoading ? null : progressRows.length === 0 ? (
            <p className="text-text-secondary text-sm py-4">Nessuna misurazione registrata.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-text-tertiary text-xs uppercase tracking-wide">
                    <th className="p-3 font-semibold">Data</th>
                    <th className="p-3 font-semibold">Peso (kg)</th>
                    <th className="p-3 font-semibold">IMC</th>
                  </tr>
                </thead>
                <tbody>
                  {progressRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 text-text-primary last:border-0"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {new Date(row.date + 'T12:00:00').toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3">
                        {row.weight_kg != null ? String(row.weight_kg) : '—'}
                      </td>
                      <td className="p-3">{row.imc != null ? String(row.imc) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
