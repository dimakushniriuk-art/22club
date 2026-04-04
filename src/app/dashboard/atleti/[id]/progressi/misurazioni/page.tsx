'use client'

import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Scale } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import {
  MISURAZIONI_ENTRIES,
  MisurazioniValuesContent,
} from '@/components/progressi/misurazioni-values-content'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { useProgressAnalytics, type ProgressKPI } from '@/hooks/use-progress-analytics'
import { getValueRange } from '@/lib/constants/progress-ranges'
import { buildStandardPdfBlob } from '@/lib/pdf'
import { useNotify } from '@/lib/ui/notify'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

export default function StaffAtletaProgressiMisurazioniPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null

  const { athlete, athleteUserId, loading, error, loadAthleteData } = useAthleteProfileData(
    id ?? '',
  )

  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useProgressAnalytics(athleteUserId ?? undefined)

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
    if (!athlete || !id || !progressData) return
    const safeAthlete = [athlete.nome, athlete.cognome]
      .filter(Boolean)
      .join('_')
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const slug = safeAthlete || 'atleta'
    const fileName = `misurazioni-riepilogo-${slug}-${new Date().toISOString().split('T')[0]}.pdf`

    const formatVal = (v: number | null): string => {
      if (v === null || Number.isNaN(v)) return '—'
      return v.toLocaleString('it-IT', { maximumFractionDigits: 2 })
    }

    const bodyRows = (d: ProgressKPI): string[][] => {
      const rows: string[][] = []
      for (const entry of MISURAZIONI_ENTRIES) {
        const range = getValueRange(entry.category, entry.field)
        if (!range) continue
        const unit = range.unit ? ` ${range.unit}` : ''
        const v = entry.getValue(d)
        rows.push([
          entry.section,
          entry.label,
          formatVal(v),
          unit.trim() || '—',
          `${range.min}–${range.max}${unit}`,
        ])
      }
      return rows
    }

    setPdfLoading(true)
    try {
      const blob = await buildStandardPdfBlob({
        orientation: 'portrait',
        render: ({ doc, margin, autoTable, headStyles }) => {
          let y = margin
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text('Tutti i valori — riepilogo', margin, y)
          y += 7
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(`${athlete.nome} ${athlete.cognome}`.trim(), margin, y)
          y += 5
          doc.text('Posizione nel range di riferimento (valori attuali)', margin, y)
          y += 5
          doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
          y += 8
          autoTable(doc, {
            startY: y,
            head: [['Sezione', 'Parametro', 'Valore attuale', 'U.M.', 'Range']],
            body: bodyRows(progressData),
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
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
  }, [athlete, id, progressData, setPdfLoading, openPdfWithBlob, notify])

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

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <StaffAthleteSubpageHeader
          backHref={backHref}
          backAriaLabel="Torna ai progressi"
          title={`Misurazioni — ${name || 'Atleta'}`}
          description="Grafici e range come in app Home › Progressi"
        />

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/10 px-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-text-primary md:text-lg flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary shrink-0" />
                Tutti i valori
              </CardTitle>
              <p className="text-text-tertiary mt-0.5 text-xs">
                Posizione dei valori nel range di riferimento
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => void handleExportPDF()}
                disabled={!progressData || pdfLoading}
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
            ) : progressLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-text-secondary text-sm">Caricamento dati...</p>
              </div>
            ) : progressError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <p className="text-text-primary text-sm font-medium">Errore nel caricamento</p>
                <p className="text-text-tertiary text-xs mt-1.5">
                  {progressError instanceof Error ? progressError.message : String(progressError)}
                </p>
              </div>
            ) : !progressData ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-text-primary text-sm font-semibold">Nessun dato disponibile</p>
                <p className="text-text-tertiary mt-1 text-xs">
                  Nessuna misurazione registrata per questo atleta
                </p>
              </div>
            ) : (
              <MisurazioniValuesContent
                data={progressData}
                measurementDetailBasePath={`/dashboard/atleti/${id}/progressi/misurazioni`}
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
        title="Anteprima — Misurazioni"
      />
    </>
  )
}
