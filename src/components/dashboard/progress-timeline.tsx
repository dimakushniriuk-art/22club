'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { Calendar, Weight, Zap, MessageSquare } from 'lucide-react'
import type { ProgressKPI } from '@/hooks/use-progress-analytics'

interface ProgressTimelineProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressTimeline({ data, loading }: ProgressTimelineProps) {
  if (loading) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 [background-image:none!important]"
      >
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.ultimiProgressi.length === 0) {
    return (
      <Card
        variant="trainer"
        className="border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
      >
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Calendar className="text-teal-400 h-5 w-5" />
            </div>
            Timeline Progressi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📅</div>
              <p className="text-text-secondary text-base font-medium">
                Nessun progresso registrato
              </p>
              <p className="text-text-tertiary text-sm mt-2">
                Inizia a tracciare i tuoi progressi!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Ieri'
    if (diffDays === 0) return 'Oggi'
    if (diffDays <= 7) return `${diffDays} giorni fa`

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getStrengthText = (log: {
    max_bench_kg: number | null
    max_squat_kg: number | null
    max_deadlift_kg: number | null
  }) => {
    const strengths = []
    if (log.max_bench_kg) strengths.push(`Panca: ${log.max_bench_kg}kg`)
    if (log.max_squat_kg) strengths.push(`Squat: ${log.max_squat_kg}kg`)
    if (log.max_deadlift_kg) strengths.push(`Stacco: ${log.max_deadlift_kg}kg`)
    return strengths.join(' • ')
  }

  return (
    <Card
      variant="trainer"
      className="!bg-transparent !from-transparent !to-transparent border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 hover:border-teal-400/60 transition-all duration-300 [background-image:none!important]"
    >
      <CardHeader>
        <CardTitle size="md" className="flex items-center gap-2 text-white">
          <Calendar className="text-teal-400 h-5 w-5" />
          Timeline Progressi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.ultimiProgressi.map((log, index) => (
            <div key={log.id} className="flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    index === 0
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                      : 'bg-transparent border-teal-500/30 text-text-tertiary'
                  }`}
                >
                  {index === 0 ? (
                    <Weight className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    {formatDate(log.date)}
                  </span>
                  {index === 0 && (
                    <Badge variant="success" size="sm">
                      Ultimo
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Weight */}
                  {log.weight_kg && (
                    <div className="flex items-center gap-2">
                      <Weight className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-secondary text-sm">
                        Peso:{' '}
                        <span className="text-text-primary font-medium">{log.weight_kg}kg</span>
                      </span>
                    </div>
                  )}

                  {/* Strength */}
                  {(log.max_bench_kg || log.max_squat_kg || log.max_deadlift_kg) && (
                    <div className="flex items-center gap-2">
                      <Zap className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-secondary text-sm">{getStrengthText(log)}</span>
                    </div>
                  )}

                  {/* Note */}
                  {log.note && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="text-text-tertiary mt-0.5 h-4 w-4" />
                      <span className="text-text-secondary text-sm italic">
                        &ldquo;{log.note}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
