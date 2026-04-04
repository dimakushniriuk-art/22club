'use client'

import { Suspense, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Activity, BarChart3 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import {
  StaffAthleteSegmentSkeleton,
  StaffLazyChunkFallback,
} from '@/components/layout/route-loading-skeletons'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import {
  useWorkoutExerciseStats,
  type WorkoutExerciseStats,
} from '@/hooks/use-workout-exercise-stats'
import { buildStandardPdfBlob } from '@/lib/pdf'
import { useNotify } from '@/lib/ui/notify'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

const WorkoutExerciseCharts = dynamic(
  () =>
    import('@/components/dashboard/workout-exercise-charts').then((mod) => ({
      default: mod.WorkoutExerciseCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <StaffLazyChunkFallback
        className="min-h-[240px] border-0 bg-transparent"
        label="Caricamento grafici…"
      />
    ),
  },
)

function formatShortDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatWeightKg(v: number | null): string {
  if (v === null || Number.isNaN(v)) return '—'
  return `${v.toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg`
}

function buildExerciseStatsPdfRows(data: WorkoutExerciseStats): string[][] {
  return [...data.exercises]
    .sort((a, b) => a.exercise_name.localeCompare(b.exercise_name, 'it'))
    .map((ex) => [
      ex.exercise_name,
      String(ex.total_sessions),
      String(ex.total_sets),
      formatWeightKg(ex.average_weight),
      formatWeightKg(ex.max_weight),
      formatWeightKg(ex.min_weight),
      ex.average_reps != null && !Number.isNaN(ex.average_reps)
        ? ex.average_reps.toLocaleString('it-IT', { maximumFractionDigits: 1 })
        : '—',
      formatShortDate(ex.last_date),
    ])
}

function AllenamentiBody() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null

  const { athlete, athleteUserId, loading, error, loadAthleteData } = useAthleteProfileData(
    id ?? '',
  )

  const { data, isLoading, error: statsError } = useWorkoutExerciseStats(athleteUserId)

  const { notify } = useNotify()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const handleExportPDF = useCallback(async () => {
    if (!athlete || !id || !data || data.total_exercises === 0) return
    const safeAthlete = [athlete.nome, athlete.cognome]
      .filter(Boolean)
      .join('_')
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const slug = safeAthlete || 'atleta'
    const fileName = `statistiche-esercizi-${slug}-${new Date().toISOString().split('T')[0]}.pdf`

    setPdfLoading(true)
    try {
      const blob = await buildStandardPdfBlob({
        orientation: 'landscape',
        render: ({ doc, margin, autoTable, headStyles }) => {
          let y = margin
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text('Grafici per esercizio — riepilogo', margin, y)
          y += 7
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(`${athlete.nome} ${athlete.cognome}`.trim(), margin, y)
          y += 5
          const from = formatShortDate(data.date_range.from)
          const to = formatShortDate(data.date_range.to)
          doc.text(`Periodo dati: ${from} — ${to}`, margin, y)
          y += 5
          doc.text(
            `Esercizi con dati: ${data.total_exercises} · Sessioni totali: ${data.total_sessions}`,
            margin,
            y,
          )
          y += 5
          doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
          y += 8
          autoTable(doc, {
            startY: y,
            head: [
              [
                'Esercizio',
                'Sessioni',
                'Serie',
                'Peso medio',
                'Peso max',
                'Peso min',
                'Rep medie',
                'Ultima data',
              ],
            ],
            body: buildExerciseStatsPdfRows(data),
            styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
            headStyles,
            margin: { left: margin, right: margin },
          })
        },
      })
      openPdfWithBlob(blob, fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      notify('Errore durante la generazione del PDF.', 'error', 'Errore PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [athlete, id, data, setPdfLoading, openPdfWithBlob, notify])

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState
          message="ID atleta mancante"
          onRetry={() => router.push('/dashboard/clienti')}
        />
      </div>
    )
  }

  if (loading && !athlete) {
    return <StaffAthleteSegmentSkeleton />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const backHref = `/dashboard/atleti/${id}?tab=progressi`
  const name = [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()

  const canExportPdf = Boolean(data && data.total_exercises > 0)

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <StaffAthleteSubpageHeader
          backHref={backHref}
          backAriaLabel="Torna ai progressi"
          title={`Statistiche allenamenti — ${name || 'Atleta'}`}
          description="Pesi, tempi e progressi per esercizio (come in app Home)"
        />

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/10 px-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-text-primary md:text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                Grafici per esercizio
              </CardTitle>
              <p className="text-text-tertiary mt-0.5 text-xs">
                Andamento pesi e progressi negli allenamenti completati
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => void handleExportPDF()}
                disabled={!canExportPdf || pdfLoading}
              >
                {pdfLoading ? 'Generazione…' : 'Esporta PDF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 sm:p-6 sm:pt-4">
            {!athleteUserId ? (
              <p className="text-text-secondary text-sm py-6 text-center">
                Profilo atleta senza user collegato.
              </p>
            ) : isLoading ? (
              <LoadingState message="Caricamento statistiche…" className="py-10" size="md" />
            ) : statsError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-text-primary text-sm font-medium">Errore nel caricamento</p>
              </div>
            ) : !data || data.total_exercises === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <BarChart3 className="h-7 w-7 text-cyan-400" />
                </div>
                <p className="text-text-primary text-sm font-semibold">Nessun esercizio con dati</p>
                <p className="text-text-tertiary mt-1 text-xs">
                  Servono allenamenti completati con serie registrate.
                </p>
              </div>
            ) : (
              <WorkoutExerciseCharts
                data={data}
                detailBasePath={`/dashboard/atleti/${id}/progressi/allenamenti`}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Statistiche esercizi"
      />
    </>
  )
}

export default function StaffAtletaProgressiAllenamentiPage() {
  return (
    <Suspense fallback={<StaffAthleteSegmentSkeleton />}>
      <AllenamentiBody />
    </Suspense>
  )
}
