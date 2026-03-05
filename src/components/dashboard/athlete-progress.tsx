'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import {
  TrendingUp,
  Calendar,
  Weight,
  Target,
  Image as ImageIcon,
  Eye,
  BarChart3,
} from 'lucide-react'
import type { ProgressLog, ProgressPhoto } from '@/types/progress'

interface AthleteProgressProps {
  athleteId: string
  athleteName: string
  progressLogs: ProgressLog[]
  progressPhotos: ProgressPhoto[]
  loading?: boolean
  onViewFullProgress?: (athleteId: string) => void
}

export function AthleteProgress({
  athleteId,
  athleteName,
  progressLogs,
  progressPhotos,
  loading = false,
  onViewFullProgress,
}: AthleteProgressProps) {
  const getLatestLog = () => {
    return progressLogs
      .filter((log) => log.weight_kg !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const getWeightChange = (current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    return {
      value: Math.abs(change),
      isPositive: change < 0, // Perdita di peso è positiva
      percentage: ((change / previous) * 100).toFixed(1),
    }
  }

  const getLatestPhotos = () => {
    const latestDate = progressLogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0]?.date

    if (!latestDate) return []

    return progressPhotos.filter((photo) => photo.date === latestDate)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const latestLog = getLatestLog()
  const latestPhotos = getLatestPhotos()
  const previousLog = progressLogs
    .filter((log) => log.weight_kg !== null && new Date(log.date) < new Date(latestLog?.date || ''))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const weightChange =
    latestLog && previousLog
      ? getWeightChange(latestLog.weight_kg || 0, previousLog.weight_kg || 0)
      : null

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    )
  }

  if (!latestLog) {
    return (
      <Card>
        <CardHeader>
          <CardTitle size="md" className="flex items-center gap-2">
            <TrendingUp className="text-brand h-5 w-5" />
            Progressi {athleteName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="mb-4 text-4xl opacity-50">📊</div>
            <h3 className="text-text-primary mb-2 text-lg font-medium">Nessun dato di progresso</h3>
            <p className="text-text-secondary text-sm">
              L&apos;atleta non ha ancora registrato misurazioni
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle size="md" className="flex items-center gap-2">
          <TrendingUp className="text-brand h-5 w-5" />
          Progressi {athleteName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ultima misurazione */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="text-text-tertiary h-4 w-4" />
              <span className="text-text-secondary text-sm">Ultima misurazione</span>
            </div>
            <span className="text-text-primary font-medium">{formatDate(latestLog.date)}</span>
          </div>

          {/* Peso */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="text-text-tertiary h-4 w-4" />
              <span className="text-text-secondary text-sm">Peso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-primary text-lg font-bold">{latestLog.weight_kg} kg</span>
              {weightChange && (
                <Badge variant={weightChange.isPositive ? 'success' : 'warning'} size="sm">
                  {weightChange.isPositive ? '-' : '+'}
                  {weightChange.value} kg
                </Badge>
              )}
            </div>
          </div>

          {/* Forza */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="text-text-tertiary h-4 w-4" />
              <span className="text-text-secondary text-sm">Forza Massimale</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-text-tertiary">Bench</div>
                <div className="text-text-primary font-medium">
                  {latestLog.max_bench_kg ?? '-'} kg
                </div>
              </div>
              <div className="text-center">
                <div className="text-text-tertiary">Squat</div>
                <div className="text-text-primary font-medium">
                  {latestLog.max_squat_kg ?? '-'} kg
                </div>
              </div>
              <div className="text-center">
                <div className="text-text-tertiary">Stacco</div>
                <div className="text-text-primary font-medium">
                  {latestLog.max_deadlift_kg ?? '-'} kg
                </div>
              </div>
            </div>
          </div>

          {/* Circonferenze */}
          <div className="space-y-2">
            <div className="text-text-secondary text-sm">Circonferenze</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Petto:</span>
                <span className="text-text-primary">{latestLog.chest_cm || '-'} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Vita:</span>
                <span className="text-text-primary">{latestLog.waist_cm || '-'} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Fianchi:</span>
                <span className="text-text-primary">{latestLog.hips_cm || '-'} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Bicipiti:</span>
                <span className="text-text-primary">{latestLog.biceps_cm || '-'} cm</span>
              </div>
            </div>
          </div>

          {/* Mood */}
          {latestLog.mood_text && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Stato:</span>
              <span className="text-2xl">{latestLog.mood_text}</span>
            </div>
          )}

          {/* Note */}
          {latestLog.note && (
            <div className="text-text-secondary bg-background-tertiary rounded p-2 text-sm italic">
              &ldquo;{latestLog.note}&rdquo;
            </div>
          )}
        </div>

        {/* Foto */}
        {latestPhotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-text-tertiary h-4 w-4" />
              <span className="text-text-secondary text-sm">Foto recenti</span>
              <Badge variant="primary" size="sm">
                {latestPhotos.length}
              </Badge>
            </div>
            <div className="flex gap-2">
              {latestPhotos.slice(0, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="bg-background-tertiary h-12 w-12 overflow-hidden rounded-lg"
                >
                  <Image
                    src={photo.image_url}
                    alt={`${photo.angle} ${formatDate(photo.date)}`}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Azioni */}
        <div className="flex gap-2 pt-2">
          {onViewFullProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewFullProgress(athleteId)}
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizza Tutto
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement chart view
            }}
            className="flex-1"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Grafici
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
