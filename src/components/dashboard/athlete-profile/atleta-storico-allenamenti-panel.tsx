'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Clock, Dumbbell, User, Users } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  useStoricoAllenamentiProfile,
  type StoricoWorkoutRow,
} from '@/hooks/progressi/use-storico-allenamenti-profile'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { useNotify } from '@/lib/ui/notify'
import { buildStandardPdfBlob } from '@/lib/pdf'

function parseDisplayInstant(iso: string): Date {
  const raw = iso.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T12:00:00`)
  }
  return new Date(raw)
}

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)]'

export interface AtletaStoricoAllenamentiPanelProps {
  athleteProfileId: string
  /** Nome completo per PDF e intestazioni */
  pdfSubjectName: string
  /** Incrementato dal genitore (es. dopo finalizza sessione) per ricaricare lo storico */
  reloadToken?: number
}

export function AtletaStoricoAllenamentiPanel({
  athleteProfileId,
  pdfSubjectName,
  reloadToken = 0,
}: AtletaStoricoAllenamentiPanelProps) {
  const { notify } = useNotify()
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const {
    workouts,
    stats,
    error: storicoError,
    reload,
  } = useStoricoAllenamentiProfile(athleteProfileId, selectedPeriod)

  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const prevReloadToken = useRef(reloadToken)
  useEffect(() => {
    if (prevReloadToken.current !== reloadToken) {
      prevReloadToken.current = reloadToken
      void reload()
    }
  }, [reloadToken, reload])

  const formatDate = useCallback((dateString: string) => {
    return parseDisplayInstant(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const formatDuration = useCallback((minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return '—'
    if (minutes === 0) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}min`
    return `${mins}min`
  }, [])

  const displayDurationForWorkout = useCallback(
    (w: StoricoWorkoutRow) => {
      if (w.duration_minutes != null && w.duration_minutes > 0) {
        return formatDuration(w.duration_minutes)
      }
      if (w.duration_minutes === 0) return '0 min'
      if (w.completed_at && w.created_at) {
        const a = new Date(w.completed_at).getTime()
        const b = new Date(w.created_at).getTime()
        const diffMin = Math.round((a - b) / 60000)
        if (diffMin > 0 && diffMin < 24 * 60) return formatDuration(diffMin)
      }
      return '—'
    },
    [formatDuration],
  )

  const handleExportPDF = useCallback(async () => {
    const periodLabels = {
      '7d': 'Ultimi 7 giorni',
      '30d': 'Ultimi 30 giorni',
      '90d': 'Ultimi 90 giorni',
      all: 'Tutti gli allenamenti',
    } as const
    const safeAthlete = pdfSubjectName
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const fileName = `storico-allenamenti-${safeAthlete || 'atleta'}-${new Date().toISOString().split('T')[0]}.pdf`

    setPdfLoading(true)
    try {
      const blob = await buildStandardPdfBlob({
        orientation: 'portrait',
        render: ({ doc, margin, autoTable, headStyles, docWithAuto }) => {
          let y = margin
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text('Storico allenamenti', margin, y)
          y += 7
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(pdfSubjectName.trim() || 'Atleta', margin, y)
          y += 5
          doc.text(`Periodo: ${periodLabels[selectedPeriod]}`, margin, y)
          y += 5
          doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
          y += 8
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Statistiche riepilogative', margin, y)
          y += 6
          doc.setFont('helvetica', 'normal')
          autoTable(doc, {
            startY: y,
            head: [['Metrica', 'Valore']],
            body: [
              ['In autonomia', String(stats.solo_count)],
              ['Con trainer', String(stats.coached_count)],
              ['Ore totali allenamento', `${stats.total_hours}h`],
            ],
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            headStyles,
            margin: { left: margin, right: margin },
          })
          y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10
          if (workouts.length > 0) {
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('Dettaglio allenamenti', margin, y)
            y += 6
            doc.setFont('helvetica', 'normal')
            autoTable(doc, {
              startY: y,
              head: [['Data', 'Scheda', 'Durata', 'Note']],
              body: workouts.map((w) => [
                formatDate(w.completed_at ?? w.started_at),
                w.workout?.titolo || 'Allenamento',
                displayDurationForWorkout(w),
                w.note || '—',
              ]),
              styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
              headStyles,
              margin: { left: margin, right: margin },
            })
          }
        },
      })
      openPdfWithBlob(blob, fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      notify('Errore durante la generazione del PDF.', 'error', 'Errore PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [
    pdfSubjectName,
    workouts,
    formatDate,
    displayDurationForWorkout,
    selectedPeriod,
    stats,
    setPdfLoading,
    openPdfWithBlob,
    notify,
  ])

  if (storicoError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {storicoError}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-3xl">
        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardContent className="relative z-10 flex items-center gap-1.5 p-2 sm:gap-2 sm:p-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8">
              <User className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Da solo
              </p>
              <p className="text-base font-bold tabular-nums text-text-primary sm:text-lg">
                {stats.solo_count}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardContent className="relative z-10 flex items-center gap-1.5 p-2 sm:gap-2 sm:p-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Con trainer
              </p>
              <p className="text-base font-bold tabular-nums text-text-primary sm:text-lg">
                {stats.coached_count}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardContent className="relative z-10 flex items-center gap-1.5 p-2 sm:gap-2 sm:p-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-8 sm:w-8">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Ore
              </p>
              <p className="text-base font-bold tabular-nums text-text-primary sm:text-lg">
                {stats.total_hours}h
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`relative min-w-0 overflow-hidden ${CARD_DS}`}>
        <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/10 px-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            <CardTitle className="text-base font-bold text-text-primary md:text-lg">
              Allenamenti completati
            </CardTitle>
            <p className="text-text-tertiary mt-0.5 text-xs">{workouts.length} nel periodo</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { value: '7d' as const, label: '7gg' },
                { value: '30d' as const, label: '30gg' },
                { value: '90d' as const, label: '90gg' },
                { value: 'all' as const, label: 'Tutto' },
              ] as const
            ).map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelectedPeriod(p.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedPeriod === p.value
                    ? 'border border-white/20 bg-white/10 text-text-primary'
                    : 'border border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => void handleExportPDF()}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Generazione…' : 'Esporta PDF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 p-4 sm:p-6">
          {workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Dumbbell className="h-10 w-10 text-cyan-400/80 mb-2" />
              <p className="text-text-primary text-sm font-semibold">Nessun allenamento</p>
              <p className="text-text-tertiary mt-1 text-xs">
                Cambia il periodo o verifica i log completati.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3 sm:rounded-lg sm:p-3.5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-cyan-400 shrink-0" />
                        <h3 className="text-text-primary min-w-0 flex-1 truncate text-sm font-semibold sm:text-base">
                          {workout.workout?.titolo || 'Allenamento'}
                        </h3>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-white/20 text-text-secondary"
                        >
                          {workout.is_coached ? 'Con trainer' : 'In autonomia'}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-text-secondary text-xs">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span>{formatDate(workout.completed_at ?? workout.started_at)}</span>
                      </div>
                      {workout.note ? (
                        <p className="text-text-tertiary mt-1.5 line-clamp-2 text-xs italic">
                          {workout.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-text-primary text-sm font-semibold tabular-nums">
                        {displayDurationForWorkout(workout)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Storico allenamenti"
      />
    </>
  )
}
